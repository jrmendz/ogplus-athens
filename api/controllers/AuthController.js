/**
 * AuthController
 *
 * @description :: Server-side logic for managing Auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
  /**
   * Login Accounts
   * @param req
   * @param res
   * @routes POST /user/login
   * @returns {never}
   */
  login: (req, res) => {
    let params = req.body;
    let tasks;

    // Validators
    if (_.isUndefined(params.username))  return res.badRequest("Invalid Credentials.");
    if (_.isUndefined(params.password))  return res.badRequest("Invalid Credentials.");
    // if (!req.isSocket) return res.json({status: 400, message: 'Request could not process.'});

    tasks = {
      // Check user if existing in ichips
      checkIChipsUser: async (cb) => {
        let checkUser = await ichipsApi('checkUser', {username: params.username, user_type: 'MARS', game_code: ''});
        if (checkUser.errors) {
          console.log("CHECK ICHIPS USER [" + params.username + "] :", checkUser.errors);
          return cb({error: "User not found."});
        }
        return cb(null, checkUser);
      },

      // Check user if existing
      checkUser: ["checkIChipsUser", async (result, cb) => {
        let userInfo = await Users.findOne({ username: params.username }).intercept((err) => { return cb(err); });
        // Account checker
        console.log("CHECK USER [" + params.username + "] :", userInfo);
        if (!userInfo) {
          let user = {
            username: params.username,
            password: params.password,
            nickname: params.username,
            full_name: params.username,
            currency: 'CNY'
          };
          await Users.findOrCreate(user, user).exec(function (err, user, created) {
            if (!user)
              return cb(400, {error: "User Exists"});
            if (created) {
              console.log("CREATE USER [" + params.username + "] :", user);

              if (!user.user_settings) {
                user.user_settings = JSON.stringify({desktop: {}, mobile: {}})
              }

              return cb(null, user);
            }
          });
          if (userInfo.disabled) return cb("User is disabled.");
        }
        return cb(null, userInfo);
      }],

      // Get player I-Chips information
      getUser: ["checkUser", async (arg, cb) => {
        await ichipsApi('getUser', {
          username: arg.checkUser.username,
          user_type: 'MARS',
          game_code: ''
        }).then((success) => {
          return cb(null, { balance: success.data.user.balance });
        }, (error) => {
          // I-Chips error handler
          console.log("\033[31m", "<<<<< I-CHIPS EXCEPTION HANDLER >>>>>", "\033[0m");
          console.log("\033[31m", "REASON:", new Error(error), "\033[0m");
          return cb("Something wrong with the I-Chips connection");
        });
      }],

      // Compare password
      comparePassword: ["checkUser", (result, cb) => {
        bcrypt.compare(params.password, result.checkUser.password, (err, match) => {
          if (err || !match)
            return cb({error: "Invalid Credentials."});
          return cb(null, result.checkUser);
        });
      }],

      // Update database status
      updateLogStatus: ["comparePassword", "getUser", async (result, next) => {
        const user = result.comparePassword;
        let player = await Users
          .updateOne({
            id: user.id
          })
          .set({
            logged: 1,
            is_sidebet: 0,
            balance: result.getUser.balance,
            table_location: "Lobby"
          })
          .intercept((err) => {
            return next(err)
          });

        if (_.isUndefined(player))
          return next("Player ID [" + user.id + "] is not on our database");

        if (!player.user_settings) {
          player.user_settings = JSON.stringify({desktop: {}, mobile: {}})
        }

        return next(null, {
          token: generateToken(user.id),
          user: player
        });
      }],

      // Save credentials to cache
      saveCache: ["updateLogStatus", (result, next) => {
        const credentials = result.updateLogStatus;
        CacheService.set(credentials.token, credentials.user, 60 * 60 * 24, (err, result) => {});
        CacheService.get(credentials.user.username, (err, token) => {
          CacheService.set(credentials.user.username, credentials.token, 60 * 60 * 24, async (err, result) => {
            // Remove old token after setting a new one for the user.
            CacheService.delete(token, (a, b) => {});
            // Single login function, logout others with older token
            await socketHelper('broadcast', {
              room: 'userRoom_' + credentials.user.id,
              event: 'order66',
              values: credentials.token
            });
            return next(null, credentials);
          });
        });
      }],

      playerLocation: ["saveCache", "checkUser", (arg, cb) => {
        let USER_COUNT;

        CacheService.get("player_location_cached", (err, token) => {
          if (err) return cb(err);

          if (token) {
            USER_COUNT = token;
            // Remove player from all existing tables
            _.forEach(USER_COUNT, (v, k) => {
              _.remove(USER_COUNT[k].players, (player) => {
                return player.id === arg.checkUser.id
              })
            });
            // Push new user on lobby
            USER_COUNT.lobby.players.push({
              id: arg.checkUser.id,
              ttl: moment().format('YYYY-MM-DD hh:mm:ss')
            });
            // Remove duplicates
            USER_COUNT.lobby.players = _.uniqBy(USER_COUNT.lobby.players, 'id');

            CacheService.set("player_location_cached", USER_COUNT, -1, async (err) => {
              if (err) return cb(err);

              await socketHelper('blast', {
                event: 'player_location',
                values: USER_COUNT
              });

              return cb()
            })
          } else {
            console.log("\033[43m\033[30m", "<<< WARNING: Player Location Not Initialized. [REDIS:player_location_cached]", "\033[0m")
            return cb()
          }
        });
      }]
    };

    // Execute tasks
    async.auto(tasks, async (err, results) => {
      if (err) { console.error(err); return res.badRequest(err); }
      sails.log("AuthController@login - login user:%s id:%s", results.saveCache.user.username, results.saveCache.user.id);

      return res.ok({
        status: 200,
        message: "User successfully signed in.",
        credentials: {
          token: results.saveCache.token,
          user: Object.assign(_.omit(results.saveCache.user, ['password', 'username', 'id']), {id: await syfer('encrypt', results.saveCache.user.id)})
        }
      });
    });
  },

  /**
   * Logout Accounts
   * @param req
   * @param res
   * @returns {Promise<void>}
   * @routes POST /user/logout
   */
  logout: async (req, res) => {
    // if (!req.isSocket) return res.json({status: 400, message: 'Request could not process.'});
    let players;
    const reqip = req.headers["x-forwarded-for"] || req.ip;
    const username = req.body.username;
    var token = req.body.token; // Value needs to be changed, so keep it to `var`
    var user = null;
    const tasks = {
      checkCredentials: async (next) => {
        if (token) {
          user = await JwtService.verify(token).catch((err) => {});;
          if (!user) return next('Already logged out.')
          return next(null, user)
        }
        if (!user) {
          CacheService.get(username, async (err, token) => {
            if (!token) return next('Already logged out.')
            token = token
            user = await JwtService.valid(token).catch((err) => {});
            return next(null, token)
          })
        }
      },
      updateLogStatus: ["checkCredentials", async (results, next) => {
        await Users
          .update({
            id: user.id
          })
          .set({
            logged: 0,
            is_sidebet: 0,
            table_location: "Lobby"
          })
          .intercept((err) => {
            return next(err);
          });

        return next();
      }],
      deleteCache: ["updateLogStatus", async (results, next) => {
        async.parallel([
          (cb) => {
            CacheService.delete(token, cb);
          },
          (cb) => {
            CacheService.delete(user.username, cb);
          },
          (cb) => {
            CacheService.delete(req.socket.id, cb);
          }
        ], next)
      }],
      disconnectToServer: ['deleteCache', async (results, next) => {
        if (req.isSocket) {
          await socketHelper('leave', {req: req, room: 'onlinePlayers', user: user.id});
          await socketHelper('leave', {req: req, room: 'userRoom_' + user.id, user: user.id});
          await socketHelper('leave', {req: req, room: 'social_' + user.id, user: user.id});
        } else {
          // If request is via http, most likely its an admine command and should kick the player out hereon after
          await socketHelper('blast', {event: 'order66', values: await syfer('encrypt', user.id)})
        }
        players = await socketHelper('get', {room: 'onlinePlayers'});
        await socketHelper('blast', {event: 'getOnlinePlayers', values: players.length});
        return next(null, null);
      }],

      playerLocation: ["disconnectToServer", "checkCredentials", (arg, cb) => {
        let USER_COUNT;

        CacheService.get("player_location_cached", (err, token) => {
          if (err) return cb(err);

          if (token) {
            USER_COUNT = token;
            _.forEach(USER_COUNT, (v, k) => {
              _.remove(USER_COUNT[k].players, (player) => {
                return player.id === arg.checkCredentials.id
              })
            });

            CacheService.set("player_location_cached", USER_COUNT, -1, async (err) => {
              if (err) return cb(err);

              await socketHelper('blast', {
                event: 'player_location',
                values: USER_COUNT
              });

              return cb()
            })
          } else {
            console.log("\033[43m\033[30m", "<<< WARNING: Player Location Not Initialized. [REDIS:player_location_cached]", "\033[0m")
            return cb()
          }
        });
      }]
    };

    async.auto(tasks, (err) => {
      if (err)
        return res.badRequest({ status: 400, err, statusText: "Error logging-out account" });

      return res.json({ status: 200, statusText: "Successfully logged out." });
    });
  },

  /**
   * Subscribing Game and user room
   * @param req
   * @param res
   * @route GET /socket/join-room
   * @returns {Promise<never>}
   */
  joinSocket: async (req, res) => {
    // if (!req.isSocket) return res.json({status: 400, message: 'Request could not process.'});
    let params = req.body;
    let players

    if (_.isUndefined(params.token))
      return res.badRequest({ message: "Invalid Token" });

    const tasks = {
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      connectToServer: ["verifyToken", async (arg, next) => {
        await Users.update({id: arg.verifyToken.id}, { logged: 1, is_sidebet: 0 }).intercept((err) => { return next(err) })
        await socketHelper('join', {req: req, room: 'onlinePlayers', user: arg.verifyToken.id});
        await socketHelper('join', {req: req, room: 'userRoom_' + arg.verifyToken.id, user: arg.verifyToken.id});
        await socketHelper('join', {req: req, room: 'social_' + arg.verifyToken.id, user: arg.verifyToken.id});
        await socketHelper('join', {req: req, room: 'updates_room', user: arg.verifyToken.id});
        CacheService.set(req.socket.id, arg.verifyToken, -1, next);
      }],
      tablePlayers: ['connectToServer', async (results, next) => {
        // Get table players for initial values
        const tbl = await Tablelist.find({ select: ['tablenumber'] }).intercept((err) => { return next(err) });
        let z = {};
        // tbl.forEach(async x => {
        //   let y = await socketHelper('get', {room: `table_${x.tablenumber}`});
        //   z[x.tablenumber] = y.length;
        // })
        // Async Await loops only work in native `for` loop
        for (let i = 0; i < tbl.length; i++) {
          const x = tbl[i];
          const y = await socketHelper('get', { room: `table_${x.tablenumber}` });
          z[x.tablenumber] = y.length
        }
        return next(null, z);
      }],
      sockets: ["verifyToken", 'tablePlayers', async (arg, next) => {
        //Blast online player count value
        players = await socketHelper('get', { room: 'onlinePlayers' });
        await socketHelper('blast', {event: 'getOnlinePlayers', values: players.length});

        //Blast players in each table value
        const tbl = arg.tablePlayers;
        await socketHelper('broadcast', {room: 'userRoom_' + arg.verifyToken.id, event: 'initial_players', values: tbl});

        return next(null, null);
      }],
    };

    async.auto(tasks, async (err, results) => {
      if (err) return res.json({message: "Invalid credentials."});
      return res.json({status: 200, message: "User successfully subscribed."});
    });
  }
};

function generateToken(userId) {
  return JwtService.issue({id: userId})
}
