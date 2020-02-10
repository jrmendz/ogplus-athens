/**
 * UsersController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  /**
   * Create new user account (OG+ and iChips)
   * @param req
   * @param res
   * @returns {never}
   */
  create: function (req, res) {
    const params = req.body;
    const usernameChecker = /^[-\w ]+$/;
    let tasks, chosenFields;

    // Validators
    if (_.isUndefined(params.username))
      return res.badRequest({ status: 400, message: "Invalid Parameter. [username]"});
    if (_.isUndefined(params.password))
      return res.badRequest({ status: 400, message: "Invalid Parameter. [password]"});
    if (_.isUndefined(params.nickname))
      return res.badRequest({ status: 400, message: "Invalid Parameter. [nickname]"});
    if (_.isUndefined(params.full_name))
      return res.badRequest({ status: 400, message: "Invalid Parameter. [full_name]"});
    if (_.isUndefined(params.status))
      return res.badRequest({ status: 400, message: "Invalid Parameter. [status]"});
    if (_.isUndefined(params.currency))
      return res.badRequest({ status: 400, message: "Invalid Parameter. [currency]"});

    if (params.username.length > 30)
      return res.badRequest({ status: 400, message: "Username exceed 30 characters." });
    if (params.username.length < 6)
      return res.badRequest({ status: 400, message: "The username must be at least 6 characters." });
    if (!usernameChecker.test(params.username))
      return res.badRequest({ status: 400, message: "Invalid username format" });
    if (params.nickname.length > 30)
      return res.badRequest({ status: 400, message: "Nickname exceeds 30 characters" });
    if (!_.includes(["TWD", "CNY", "USD"], params.currency))
      return res.badRequest({ status: 400, message: "New User currency should be TWD/CNY/USD" });
    if (!_.includes(["ENABLED", "DISABLED", "SUSPENDED"], params.status))
      return res.badRequest({ status: 400, message: "New User status should be ENABLED/DISABLED/SUSPENDED." });

    // Pre-setting variables
    chosenFields = _.pick(params, ['username', 'password', 'nickname', 'full_name', 'currency']);
    tasks = {
      // Create account on I-Chips
      saveOnIChips: async (cb) => {
        let iChips = await ichipsApi('createUser', {
          username: params.username,
          nickname: params.nickname,
          currency: params.currency,
          user_type: 'MARS',
          status: params.status
        });
        // Error handling of I-Chips
        if (iChips.errors)
          return cb("ICHIPS: " + JSON.stringify(iChips.errors));

        // Return iChips generated user
        return cb(null, iChips);
      },
      // Create account on Athens
      saveOnAthens: ["saveOnIChips", (arg, cb) => {
        // Execute find or create query
        Users.findOrCreate(chosenFields, _.assign(chosenFields, {user_settings: JSON.stringify({desktop: {}, mobile: {}})})).exec(cb);
      }]
    };

    // Execute tasks
    async.auto(tasks, async (err) => {
      if (err) {
        console.log("\033[31m", "USER_CREATE:", JSON.stringify(err), "\033[0m");
        return res.badRequest({
          status: 401,
          err: err,
          message: "Failed creating an account."
        });
      }

      return res.json({
        status: 200,
        message: "Successfully created an account on OG+ and I-Chips.",
      });
    });
  },

  /**
   * Set chip limits on (OG+ and iChips)
   * @routes PUT /user/chipLimit
   * @param req
   * @param res
   */
  setChipLimits: function (req, res) {
    const params = req.body;
    let tasks, games;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid Parameter. [token]"});
    if (_.isUndefined(params.min))
      return res.badRequest({ err: "Invalid Parameter. [min]"});
    if (_.isUndefined(params.max))
      return res.badRequest({ err: "Invalid Parameter. [max]"});
    if (_.isUndefined(params.gameCode))
      return res.badRequest({ err: "Invalid Parameter. [gameCode]"});
    if (!_.isArray(params.gameCode))
      return res.badRequest({ err: "Invalid Data Type. [`gameCode` should be an array but receives " + typeof params.gameCode + "]"});

    games = params.gameCode;
    tasks = {
      // Verify Token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      updateOnIChips: ["verifyToken", (arg, cb) => {
        // If games are empty, set automatic to all game to edit
        games = games.length ? games : ["baccarat", "dragontiger", "moneywheel", "roulette"];

        async.each(games, async (game, cb) => {
          const iChips = await ichipsApi('updateChipLimit', {
            username: arg.verifyToken.username,
            game_code: params.game_code,
            min: params.min,
            max: params.max
          });

          // Error handling of I-Chips
          if (iChips.errors)
            return cb("ICHIPS: [" + game + "] " + JSON.stringify(iChips.errors));

          // Return iChips generated user
          return cb(null, iChips);
        }, cb);
      }]
    };

    // Execute tasks
    async.auto(tasks, (err) => {
      if (err) {
        console.log("\033[31m", "USER_CHIP_LIMIT:", JSON.stringify(err), "\033[0m");
        return res.badRequest({
          err: err,
          message: "Failed updating chip limits."
        });
      }

      return res.json({
        message: "Successfully updated chip limits to OG+ and I-Chips.",
      });
    });
  },

  /**
   * Update user information
   * @route PUT /user/update-information
   * @param req
   * @param res
   * @returns {never}
   */
  update: (req, res) => {
    const params = req.body;
    let tasks, updatePayLoad;

    // Validators
    // if (!req.isSocket)
    //   return res.badRequest({ err: 'Request could not process using this protocol.' });
    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid Parameter: [token]" });
    if (_.isUndefined(params.params))
      return res.badRequest({ err: "Invalid Parameter: [params]" });

    // Pre-setting variables
    updatePayLoad = params.params;
    tasks = {
      // Verify Token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },

      // Update Information
      updateDetails: ["verifyToken", async (arg, cb) => {
        let setting = jsonParseSafe(updatePayLoad["user_settings"]) || { desktop: {}, mobile: {} };

        // Chips parameter handler
        if (!_.isUndefined(updatePayLoad.chips)) {
          _.assign(setting.desktop, { chips: updatePayLoad.chips });
          _.assign(setting.mobile, { chips: updatePayLoad.chips });
        }

        // Remove all protected fields
        updatePayLoad = _.omit(updatePayLoad, ["id", "username", "password", "wins", "win_amount", "logged", "disabled", "table_location", "min_bet_limit", "max_bet_limit", "is_admin"]);

        // Execute sql update
        Users.updateOne({ id: arg.verifyToken.id })
          .set(_.merge(updatePayLoad, { user_settings: JSON.stringify(setting) }))
          .then((user) => {
            return cb(null, user);
          })
          .catch((err) => {
            return cb(err);
          })
      }],

      // Get current user location
      userInfoOnDB: ["verifyToken", (arg, cb) => {
        Users.findOne({ id: arg.verifyToken.id }).exec(cb);
      }],

      // Broadcast
      blastData: ["userInfoOnDB", "updateDetails", async (arg, cb) => {
        let userInfoOld = arg.userInfoOnDB;
        let userInfoNew = arg.updateDetails;

        // Disregard broadcast when player is In-Lobby
        if (userInfoOld.table_location === 'Lobby') return cb();

        // Cast broadcast
        await socketHelper('broadcast', {
          room: 'table_' + userInfoOld.table_location,
          values: {
            id: await syfer('encrypt', userInfoNew.id),
            nickname: userInfoNew.nickname,
            balance: userInfoNew.balance,
            imgname: userInfoNew.imgname,
            imgname_mobile: userInfoNew.imgname_mobile,
            avatar: userInfoNew.avatar,
            tableNumber: userInfoNew.table_location
          },
          event: 'table_user_update'
        });

        return cb();
      }],

      updateCache: ["updateDetails", (arg, cb) => {
        let user = arg.updateDetails;
        // Get cache information
        CacheService.get(params.token, (err, cached) => {
          if (err) return cb(err);
          // Set new information on cache
          CacheService.set(params.token, _.merge(cached, user), cb);
        })
      }]
    };

    // Execute tasks
    async.auto(tasks, (err) => {
      if (err) return res.badRequest({
        status: 401,
        message: "Update information failed.",
        reason: err
      });

      return res.json({
        status: 200,
        message: "User successfully updated."
      });
    });

    /**
     * JSON custom safe parser
     * @param json
     * @returns {null|any}
     */
    function jsonParseSafe(json) {
      try { return JSON.parse(json) } catch(ex) { return null }
    }
  },

  search: function (req, res) {
    // if (!req.isSocket) return res.json({status: 400, message: 'Request could not process.'});
    const params = req.body
    const query = req.body.username;

    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid Parameter: [token]" });

    const tasks = {
      verifyToken: async function (cb) {
       await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, { request: req, id: token.id });
          })
          .catch((err) => {
            return cb(err)
          });
      },
      findUser: ["verifyToken", async (results, next) => {
        let user = await Users.findOne({username: query}).intercept((err) => { return next(err) })
        if (!user) {
          return next(404, "User not found")
        }
        return next(null, user)
      }]
    };

    async.auto(tasks, (err, results) => {
      if (err) return res.ok({status: err, message: results.findUser})
      let user = results.findUser
      return res.json({status: 200, message: "Success", data: user});
    })
  },

  availability: (req, res) => {
    // if (!req.isSocket) return res.json({status: 400, message: 'Request could not process'});
    const query = req.body.username;
    const action = req.body.todo;
    const tasks = {
      disableUser: async (next) => {
        let user = await Users.findOne({username: query})
          .intercept((err) => {
            return next(err)
          });
        let val = action.toUpperCase() === 'ENABLE' ? 0 : action.toUpperCase() === 'DISABLE' ? 1 : null;
        if (val === null) return next("Invalid Request")
        let res = await Users.update({id: user.id}, {disabled: val})
          .fetch()
          .intercept((err) => {
            return next(err);
          });
        return next(null, res);
      }
    }

    async.auto(tasks, (err, results) => {
      if (err) return err
      return res.json({status: 200, message: "User " + action.toLowerCase() + "d"})
    })
  },

  /* GET /api/current-user-information */
  getDetailsByToken: async (req, res) => {
    let params = req.isSocket ? req.body : req.query;
    let tasks;

    // Validators
    if (_.isUndefined(params.token)) return res.badRequest({ err: true, statusText: 'Invalid Parameter: [token]'});

    tasks = {
      // Verify token
      verifyToken: async function (cb) {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      // Get player task
      getPlayerInfo: ['verifyToken', async (arg, cb) => {
        let player = await Users.findOne({
          where: { id: arg.verifyToken.id }
        }).intercept((err) => {
          return cb(err, null);
        });

        if (player) {
          if (!player.user_settings) {
            player.user_settings = JSON.stringify({desktop: {}, mobile: {}})
          }

          // Encrypt all ID
          await syfer('encrypt', player.id).then((res) => {
            player['id'] = res;
            return cb(null, player);
          })
        } else {
          return cb('User Not Found')
        }
      }],
      customInfo: ['getPlayerInfo', async (arg, cb) => {
        let user = arg.getPlayerInfo;
        let default_min

        try {
          default_min = Math.ceil(user.min_bet_limit / 10) >= 100 ? Math.ceil(user.min_bet_limit / 10) : 1;

          _.assign(user, {
            otherBetLimits: {
              _min: user.min_bet_limit,
              _max: user.max_bet_limit,
              pair_min: user.min_bet_limit,
              pair_max: Math.ceil(user.max_bet_limit / 11),
              tie_min: user.min_bet_limit,
              tie_max: Math.ceil(user.max_bet_limit / 8),
              ss_min: user.min_bet_limit,
              ss_max: Math.ceil(user.max_bet_limit / 12)
            }
          })
        } catch (ex) {
          return cb(ex)
        }
        // Remove sensitive information
        return cb(null, _.omit(user, ['password', 'username']));
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, results) => {
      if (err) return res.badRequest({ err: err });
      return res.json({ err: err, status: 200, data: results.customInfo });
    });
  },

  getOnlineUser: async (req, res) => {
    // if (!req.isSocket) return res.json({status: 400, message: 'Request could not process.'});
    const roomName = 'onlinePlayers';

    let players = await socketHelper('get', {room: roomName});
    await socketHelper('blast', {event: 'getOnlinePlayers', values: players.length});
    return res.ok(players);
  },

  /**
   * GET /user/getBalance
   * @param req: {query|username}
   * @param res:
   * @author aavaldez
   */
  getBalance : async (req,res) => {
    const params = req.query;
    let balInfo,UserInfo,task;

    // Validator
    if(!params.username) return res.json({err: '[username] : Parameter was invalid.'});
    task = {
      // Check if the user is on database
      checkIfExistUser: async(cb) => {
        UserInfo = await Users.findOne({
          username: params.username
        }).intercept((err) => {
          return cb(err);
        });

        return UserInfo ? cb(null,UserInfo) : cb('User not found');
      },
      //Check the user balance
      checkBalance : ['checkIfExistUser', async (arg, cb) => {
        balInfo = await Users.findOne({
          username: arg.checkIfExistUser.username
        }).intercept((err) => {
          return cb(err);
        });
        return balInfo ?  cb(null, {username: balInfo.username, balance: balInfo.balance}) : cb('User balance not found');
      }]
    };
    // Execute Tasks
    async.auto(task, (err, result) => {
      if(err){
        res.json({err: err, status: 400});
      } else {
        res.json({err: err, status: 200, message: 'User balance get successfully rendered.', data: result.checkBalance});
      }
    });
  },

  /**
   * Broadcast Balance
   * GET /user/broadcastBalance
   * @param req
   * @param res
   */
  broadcastBalanceIChips: (req, res) => {
    let params = req.query;
    let tasks, toBroadcast;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid Parameter: [token]" });

    tasks = {
      // Verify Token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },

      iChips: ["verifyToken", async (arg, cb) => {
        await ichipsApi("getBalance", {
          username: arg.verifyToken.username
        }).then(async (data) => {
          toBroadcast = {
            id: arg.verifyToken.id,
            balance: data.balance || 0,
            winnings: 0,
            table: "",
            loss: 0,
            win: 0
          };
          // Broadcast socket player's balance
          await balanceUpdate("player", toBroadcast);
          return cb();

        }).catch((err) => {
          return cb(err);
        })
      }]
    };

    async.auto(tasks, (err) => {
      if (err)
        return res.badRequest({ err: err });
      // Return success broadcast of balance
      return res.json({ message: "Successfully broadcast balance.", data: toBroadcast })
    })
  },

  /**
   * POST /user/broadcastBalance
   * @param req: {body|id,balance}
   * @param res:
   * @author aavaldez
   */
  broadcastBalance : async (req,res) => {
    const params = req.body;
    let task;

    task = {
      // Get user information using username
      sendBalance: async (next) => {
        await balanceUpdate('player', {id: params.id, balance: params.balance});
        return next();
      }
    };

    // Execute Tasks
    async.auto(task, (err) => {
      if(err){
        res.json({err: err, status: 400, message: err});
      } else {
        res.json({status: 200, message: 'User balance successfully updated.'});
      }
    });

  },

  /**
   * POST /user/getBalanceTrans
   * @param req {body| username, currency, fromDate<required>, toDate<required>, shoehand_id, table_id, perPage, page}
   * @param res
   */
  getBalanceTrans : (req, res) => {
    let params = _.isEmpty(req.body) ? req.query : req.body;
    let username, startDate, endDate, shoeNumber, perPage, page, tasks, tableID;

    // Make sure this is a socket request (not traditional HTTP)
    // if (!req.isSocket) return res.badRequest({ err: 'Forbidden Request' });

    // Validators
    if (_.isUndefined(params.fromDate)) return res.badRequest({ err: "Invalid Parameters [fromDate]" });
    if (_.isUndefined(params.toDate)) return res.badRequest({ err: "Invalid Parameters [toDate]" });

    // Pre-setting variables
    // Set UTC Format of date when the in production or testing servers
    if (process.env.NODE_ENV === 'development') {
      startDate = moment(params.fromDate).format('YYYY-MM-DD HH:mm:ss');
      endDate = moment(params.toDate).format('YYYY-MM-DD HH:mm:ss');
    } else {
      startDate = moment(params.fromDate).utc().format('YYYY-MM-DD HH:mm:ss');
      endDate = moment(params.toDate).utc().format('YYYY-MM-DD HH:mm:ss');
    }
    username = _.isUndefined(params.username) || !params.username ? null : params.username;
    tableID = _.isUndefined(params.table_id) || !params.table_id ? null : params.table_id;
    shoeNumber = _.isUndefined(params.shoehand_id) ? null : params.shoehand_id;
    perPage = _.isUndefined(params.perPage) ? 10 : params.perPage;
    page = _.isUndefined(params.page) ? 1 : params.page;

    // List of tasks
    tasks = {
      // Verify token
      getUser: async function (cb) {
        if (!username) return cb(null, {id: null});
        let userInfo = await Users.findOne({username: username}).intercept((err) => { return cb(err) });
        return _.isUndefined(userInfo) ? cb('User not found') : cb(null, {id: userInfo.id});
      },
      // History
      history: ["getUser",  function (arg, cb) {
        let query = "CALL TRANSACTION_HISTORY($1, $2, $3, $4, $5, $6, $7);";
        sails.sendNativeQuery(query, [
          arg.getUser.id,
          startDate,
          endDate,
          shoeNumber,
          tableID,
          perPage,
          ((page - 1) * perPage)
        ], function (err, data) {
          if (err) return cb(err)
          // Parse JSON values of gameValue
          data.rows[1] = data.rows[1].map(a => {a.gameValues = JSON.parse(a.gameValues); return a})
          return cb(err, {
            totalRows: data.rows[0][0]['totalRows'],
            list: data.rows[1]
          });
        })
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, results) => {
      if (err) { res.badRequest({ err: err}); }
      return res.ok({
        status: 200,
        message: 'Successfully sent betting history',
        data: results.history.list
      })
    });
  },

  /**
   * Setting-up user currency
   * @param req
   * @param res
   * @returns {never}
   */
  setCurrency: (req, res) => {
    const params = req.body;
    let tasks;

    // Validator
    if(_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid Parameter: [token]"});
    if(_.isUndefined(params.currency))
      return res.badRequest({ err: "Invalid Parameter: [currency]"});

    // API Tasks
    tasks = {
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      changeCurrency: ["verifyToken", (arg, cb) => {
        Users.update({ id: arg.verifyToken.id }).set({ currency: params.currency }).exec(cb);
      }]
    };

    async.auto(tasks, (err, results) => {
      return err ? res.badRequest({ err: err }) : res.json({ err: false, data: "[" + results.verifyToken.username +  "] Currency successfully changed to " + params.currency});
    });
  },

  /* PUT /user/disable-user */
  // disableuser: async function (req, res) {
  //   const data = req.body;
  //   method = data.method.toUpperCase();

  //   const tasks = {

  //     SetUserStatus: async (next) => {
  //         try {
  //           if (method === 'DISABLE') {
  //             await Users.update({ username: data.username})
  //             .set({
  //               disabled: 1
  //             }).fetch()
  //               return next(null, null);
  //             } else if (method === 'ACTIVATE') {
  //               await Users.update({ username: data.username})
  //               .set({
  //                 disabled: 0
  //               }).fetch()
  //               return next(null, null);
  //             }
  //         } catch (err) {
  //           sails.log('SetUserStatus error:', err)
  //         }
  //     }
  //   }
  //   async.auto(tasks, (err, results) => {
  //     if (err) return res.json({status: 401, message: "Validation Error!", error: err.code});
  //     return res.json({status: 200, message: "Status successfully updated."}); // response code 201 for successful request and some data posted or edited
  //   })
  // },

  /* PUT /user/disable-user */
  disableuser: async function (req, res) {
    // ToDo: Sir Alfie, please add validators for required fields, and proper initialization of variables
    const data = req.body;

    if (_.isUndefined(data.method)) return res.badRequest({err: "Invalid parameter: [No Data]"});
    method = data.method.toUpperCase();

    if (!data.username) return next(null, 'User not found.');
    method = method === 'DISABLE' ? 1 : 0
    const tasks = {
        SetUserStatus: async (next) => {
          let users = await Users.update({ username: data.username})
          .set({
            disabled: method
          }).fetch()
            .intercept((err) => {
              return next(err)
            })
          return next(null, {status: method === 1 ? 'DISABLED' : 'ENABLED'})
        }
      }
      async.auto(tasks, (err, results) => {
        if (err) return res.json({status: 401, message: "Validation Error!", error: err.code});
        return res.json({status: 200, message: "Status successfully updated.", data: results.SetUserStatus}); // response code 201 for successful request and some data posted or edited
      })
    }
};
