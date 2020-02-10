
/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  adminlogin: (req, res) => {
    let params = req.body;
    sails.log('params- admin login', params.password)

    // Validators
    if (_.isUndefined(params.username))  return res.badRequest("Invalid Credentials.");
    if (_.isUndefined(params.password))  return res.badRequest("Invalid Credentials.");

    const tasks = {
      checkAdminUser: async (next) => {
        let adminInfo = await Admin.findOne({ username: params.username, isactive: 0 }).intercept((err) => { return next(err); });

        sails.log('checking admin login:', adminInfo, params.password)
        // sails.log('Hashpassword:', hashpassword)

        if (adminInfo) {
          bcrypt.compare(params.password, adminInfo.password, async (err, match) => {
            if (err || !match) return next({error: "Invalid Credentials."});
            let token = generateToken(adminInfo.id);
            return next(null, { token, user: adminInfo });
          });
        } else {
          return next(400, {error: "User not existing"});
        }
      },
      saveCache: ["checkAdminUser", (result, next) => {
        const credentials = result.checkAdminUser
        CacheService.set(credentials.token, credentials.user, 60 * 60 * 24, (err, result) => {});
        CacheService.get(credentials.user.username, (err, token) => {
          CacheService.set(credentials.user.username, credentials.token, 60 * 60 * 24, async (err, result) => {
            // Remove old token after setting a new one for the user.
            CacheService.delete(token, (a, b) => {});
            // Single login function, logout others with older token
            await socketHelper('broadcast', {
              room: 'adminRoom_' + credentials.user.id,
              event: 'admin_event',
              values: credentials.token
            });
            return next(null, credentials);
          });
        });
      }]
    };

    async.auto(tasks, async (err, results) => {
      if (err) { console.error(err); return res.badRequest(err); }
      return res.ok({
        status: 200,
        message: "User successfully signed in.",
        credentials: {
          token: results.saveCache.token,
          adminuser: Object.assign(_.omit(results.saveCache.user, ['password', 'username', 'id']), {id: await syfer('encrypt', results.saveCache.user.id)})
        }
      });
    });
  },

  createadminlogin: async (req, res) => {
    let params = req.body
    let adminId = params.id || 0
    let isactive = params.isactive || 0


    // Validators
    if (_.isUndefined(params.username))  return res.badRequest("Invalid Credentials.");
    if (_.isUndefined(params.password))  return res.badRequest("Invalid Credentials.");

    const tasks = {

      verifyToken: async function (next) {
        await JwtService.valid(params.token)
          .then((token) => {
            return next(null, token);
          })
          .catch((err) => {
            return next(err)
          });
      },
      saveCache: ["verifyToken", async (result, next) => {
        if (adminId !== 0) {
          adminId = await syfer('decrypt', adminId).intercept((err) => { return next(err); });
        }
        // let hashpassword = bcrypt.hash(params.password, 10, function(err, result) {
        //   if (err) return next(err);
        //   sails.log('hashpaassword:', hashpassword)
        //   return next(null, result);
        // });
        await Admin.findOrCreate({ id: adminId },
          {
            username: params.username,
            created: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
            password: params.password,
            isactive : isactive
          }).exec(async function (err, results, created) {
            if (err)
              return next(err);
            if (created) {
              return next(null, results)
            } else {
              let updateAdmin = await Promotions.update({ id: adminId },
                {
                  username: params.username,
                  created: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
                  password: params.password,
                  isactive : isactive
                }).fetch().intercept((err) => {
                sails.log('Creating Admin error ', err)
                return next(err);
              });
                sails.log('xxxxxx: ', updateAdmin[0])
                return next(null, updateAdmin[0])
            }
          });
      }]
   }
   async.auto(tasks, (err, results) => {
      if (err) return res.json({ status: 401, msg: err, data: '' });
      return res.json({ status: 200, message: 'Admin user has been created/updated.'});
    })
  },
  /**
   * Author - Alfie
   * @param req
   * @param res
   * @returns {Promise<*>}
   * PUT /admin/import-dealerfile
   */
  importdealerfiles: async (req, res) => {
    let params = req.body;
    let dealers = params.dealers;

    //validator
    if (_.isUndefined(dealers))  return res.badRequest("Invalid Credentials.");

    const tasks = {
      verifyToken: async function (next) {
        await JwtService.valid(params.token)
          .then((token) => { return next(null, token);
          }).catch((err) => {
            return next(err)
          });
      },
      processfile: ["verifyToken", async (result, next) => {

        async.eachSeries(dealers, async (dealer, next) => {
          await Dealer.findOrCreate({dealerscode: dealer.dealerscode || 0 }, {
            fullname: dealer.fullname.trim(),
            nickname: dealer.nickname.trim(),
            dealerscode: dealer.dealerscode,
            imageclassic: "https://static.oriental-game.com/dealers/classic/"+dealer.nickname.toLowerCase()+".png",
            imagegrand: "https://static.oriental-game.com/dealers/grand/"+dealer.nickname.toLowerCase()+".png",
            imageprestige: "https://static.oriental-game.com/dealers/prestige/"+dealer.nickname.toLowerCase()+".png",
            imagemanbetx: "https://static.hzgelf.com/dealers/manbetx/"+dealer.nickname.toLowerCase()+".png",
            imagestreamer: "https://static.oriental-game.com/dealers/emcee/"+dealer.nickname.toLowerCase()+".jpg",
            languages : dealer.languages || 'en'
          }).exec(async function (err, results, isCreated) {
            // sails.log('finalist xx', dealer.languages, results)
            if (err) return next(err);
            if (isCreated) {
              //TO.DO Sarah/Joseph - add to  't_emcee' add new model
              // This is to check if the dealer is already existing in streamer table
              let dataResult = await Streamer.findOne({ where: {dealerscode: dealer.dealerscode} }).intercept((err) => { return next(err) })

              if (dealer.languages !== 'en' && !_.isNull(dealer.languages) && !_.isEmpty(dealer.languages) && !dataResult)
                await Streamer.create({dealerscode: dealer.dealerscode, languages: dealer.languages}).fetch().intercept((err) => {
                  return next(err);
                })

                return next(null, results)
            } else {
              let updateDealer = await Dealer.update({ dealerscode: dealer.dealerscode},
                {
                  fullname: dealer.fullname.trim(),
                  nickname: dealer.nickname.trim(),
                  dealerscode: dealer.dealerscode,
                  imageclassic: "https://static.oriental-game.com/dealers/classic/"+dealer.nickname.toLowerCase()+".png",
                  imagegrand: "https://static.oriental-game.com/dealers/grand/"+dealer.nickname.toLowerCase()+".png",
                  imageprestige: "https://static.oriental-game.com/dealers/prestige/"+dealer.nickname.toLowerCase()+".png",
                  imagemanbetx: "https://static.hzgelf.com/dealers/manbetx/"+dealer.nickname.toLowerCase()+".png",
                  imagestreamer: "https://static.oriental-game.com/dealers/emcee/"+dealer.nickname.toLowerCase()+".jpg",
                  language: dealer.language
                }).fetch().intercept((err) => {
                sails.log('Creating Admin error ', err)
                return next(err);
              });
                return next(null, updateDealer[0])
              }
            });
        }, next)
      }],
      broadcastdealer: ["processfile", async (result, next) => {
        let broadcast = await Dealer.find().populateAll().intercept((err) => { return next(err) });
        await socketHelper('blast', {event: 'GetAllDealers', values: broadcast})
        return next(null, broadcast);
      }]
    }
   async.auto(tasks, (err, results) => {
      if (err) return res.json({ status: 401, msg: err, data: '' });
      return res.json({ status: 200, message: 'successfully update dealer list.', data: results.broadcastdealer});
    })
  },

  getdealerlist: async (req, res) => {

    // let params = req.body;
    //validator
    // if (_.isUndefined(params.token))  return res.badRequest("Invalid Credentials.");

    const tasks = {
      // verifyToken: async function (next) {
      //   await JwtService.valid(params.token)
      //     .then((token) => { return next(null, token);
      //     }).catch((err) => {
      //       return next(err)
      //     });
      // },
      dealerList: async (next) => {
        let dealers = await Dealer.find().populateAll().intercept((err) => { return next(err) });
        return next(null, dealers);
      }
    }

    async.auto(tasks, (err, results) => {
      if (err) return res.json({ status: 401, msg: err, data: '' });
      return res.json({ status: 200, message: 'successfully get dealer list.', data: results.dealerList});
    })
  },

  getloglist: async (req, res) => {

    let params = req.query;
    //validator
    if (_.isUndefined(params.token))  return res.badRequest("Invalid Credentials.");
    let todayDate = moment().utc().format('YYYY-MM-DD HH:mm:ss')
    let startDate = moment().subtract(3, 'days').format('YYYY-MM-DD')

    const tasks = {
      verifyToken: async function (next) {
        await JwtService.valid(params.token)
          .then((token) => { return next(null, token);
          }).catch((err) => {
            return next(err)
          });
      },
      logList: ["verifyToken", async (result, next) => {
        let logresult = await Log.find({ created_at: { '>=': startDate, '<=': todayDate }}).populateAll().intercept((err) => { return next(err) });
        return next(null, logresult);
      }]
    }

    async.auto(tasks, (err, results) => {
      if (err) return res.json({ status: 401, msg: err, data: '' });
      return res.json({ status: 200, message: 'successfully get log list.', data: results.logList});
    })
  },

   // /admin/import-dealerfile
   importstreamerfiles: async (req, res) => {
    let params = req.body;
    let dealers = params.dealers;

    //validator
    if (_.isUndefined(dealers))  return res.badRequest("Invalid Credentials.");

    const tasks = {
      verifyToken: async function (next) {
        await JwtService.valid(params.token)
          .then((token) => { return next(null, token);
          }).catch((err) => {
            return next(err)
          });
      },
      processfile: ["verifyToken", async (result, next) => {
        for (let i = 0; i < dealers.length; i++) {
          await Streamer.findOrCreate({dealerscode: dealers[i].dealerscode || 0 }, {
            fullname: dealers[i].fullname.trim(),
            nickname: dealers[i].nickname.trim(),
            dealerscode: dealers[i].dealerscode
          }).exec(async function (err, results, created) {
            if (err)
              return next(err);
            if (created) {
              return next(null, results)
            } else {
              let updateDealer = await Dealer.update({ dealerscode: dealers[i].dealerscode },
                {
                  fullname: dealers[i].fullname.trim(),
                  nickname: dealers[i].nickname.trim(),
                  dealerscode: dealers[i].dealerscode
                }).fetch().intercept((err) => {
                sails.log('Import streamer files Admin error ', err)
                return next(err);
              });
                return next(null, updateDealer[0])
            }
          });
        }
      }],
      broadcastdealer: ["processfile", async (result, next) => {
        let broadcast = await Streamer.find().populateAll().intercept((err) => { return next(err) });
        await socketHelper('blast', {event: 'GetAllStreamerDealers', values: broadcast})
        return next(null, broadcast);
      }]
    }
   async.auto(tasks, (err, results) => {
      if (err) return res.json({ status: 401, msg: err, data: '' });
      return res.json({ status: 200, message: 'Successfully update streamer dealer list.', data: results.broadcastdealer});
    })
  },

  /**
   * Sync Dealer Followers
   * @routes POST /admin/syncDealerFollowers
   * @param req
   * @param res
   */
  syncDealerFollowers: function (req, res) {
    // const params = req.body;
    let tasks;
    let query = "SELECT t0.dealerscode, t0.followers, COUNT(t1.dealerscode) AS followerRecorded FROM t_dealers t0 LEFT JOIN t_follow_dealers t1 ON t0.dealerscode = t1.dealerscode GROUP BY t0.dealerscode ORDER BY t0.nickname ASC";
    let dealerToUpdate = [];
    // Tasks
    tasks = {
      // Get dealer recorded follower vs dealer records count
      getDealer: (cb) => {
        Dealer.getDatastore().sendNativeQuery(query, [], cb);
      },

      // Start comparing the recorded follower vs dealer records
      compareFollowers: ["getDealer", (arg, cb) => {
        // Find unequal follower
        _.map(arg.getDealer.rows, (dealer) => {
          if (!_.isEqual(dealer.followers, dealer.followerRecorded))
            dealerToUpdate.push(dealer)
        });

        return cb();
      }],

      // Update follower count
      updateFollowerCount: ["compareFollowers", (arg, cb) => {

        async.each(dealerToUpdate, async (dealer, cb) => {
          await Dealer
            .updateOne({
              dealerscode: dealer.dealerscode
            })
            .set({
              followers: dealer.followerRecorded
            })
            .intercept((err) => {
              return cb(err);
            });

          return cb();
        }, cb);
      }]
    };

    // Execute tasks
    async.auto(tasks, (err) => {
      if (err)
        return res.serverError({ err, status: 400, statusText: "Something wrong when updating follower count."})

      console.log("\033[36mINFO:", dealerToUpdate.length, "dealer(s) with wrong follower count has been synced", "\033[0m");
      return res.json({ status: 200, statusText: "Dealer follower synced."})
    });
  },

  /**
   * Check what is the status of the Athens and current configuration
   * @param req
   * @param res
   */
  athensStatus: (req, res) => {
    const params = req.body;
    let tasks;

    if (!params.key)
      return res.badRequest({ status: 400, statusText: "Invalid Parameter: [key]"});
    if (params.key !== "0be1e26f14d0ef010bdbe9353da59b97")
      return res.badRequest({ status: 401, statusText: "Invalid Server Key"});


    tasks = {
      getCachedPlayers: (cb) => {
        let players = {};

        CacheService.get("player_location_cached", (err, data) => {
          if (err) return cb(err);

          if (!data)
            return cb(null, {});

          _.forEach(data, (player, key) => {
            _.set(players, key, {
              playersCount: player.players.length,
              status: _.get(tables, key, {})
            });
          });

          return cb(null, players);
        });
      }
    };

    async.auto(tasks, (err, taskResults) => {
      if (err) return res.badRequest({ err, status: 400, statusText: "Something wrong when getting information."})

      return res.json({
        STATUS: 200,
        COMMENT: "",
        VERSION: sails.config.version,
        FLAGS: flag,
        GAME_CONFIG: sails.config.game_config,
        STUDIO: sails.config.game_env,
        TABLES: taskResults.getCachedPlayers
      });
    });
  },

  /**
   * Administrative Commands
   * @description Some of this feature is not available for PRODUCTION for security purposes
   * @param req
   * @param res
   * @route POST /admin/command
   */
  adminCommand: (req, res) => {
    const params = req.body;
    let commands;
    let testingOnlyCommand = ["BET_THROTTLE"];

    if (!params.key)
      return res.badRequest({ status: 400, statusText: "Invalid Parameter: [key]"});
    if (params.key !== "0be1e26f14d0ef010bdbe9353da59b97")
      return res.badRequest({ status: 401, statusText: "Invalid Server Key"});
    if (!params.command)
      return res.badRequest({ status: 401, statusText: "Invalid Parameter: [command]"});

    // Check running environment
    if (process.env.NODE_ENV === 'production') {
      // Check if the command sending is for testing command only
      if (_.includes(testingOnlyCommand, _.toUpper(params.command))) {
        return res.badRequest({ err: "INVALID_CMD", statusText: "Command is disabled on this environment." });
      }
    }

    // List of commands
    commands = {
      BET_THROTTLE: () => {
        try {
          flag.betting.throttle = _.isUndefined(params.data.throttle) ? false : params.data.throttle;
          flag.betting.seconds = _.isUndefined(params.data.seconds) ? 5 : parseInt(params.data.seconds);

          console.log("\033[30m\033[46m", "Betting has been set to throttle ", flag.betting.throttle ? "ON" : "OFF" ," with ", flag.betting.seconds, "second(s) delay.\033[0m");
          return res.json({
            statusText: "Command Executed.",
            command: _.toUpper(params.command),
            data: params.data
          })
        } catch (e) {
          return res.badRequest(e);
        }
      }
    };

    // Check if the command is existing
    if (_.isUndefined(commands[_.toUpper(params.command)])) {
      return res.badRequest({ err: "INVALID_CMD", statusText: "Command not existing." });
    }

    // Execute command
    commands[_.toUpper(params.command)]();
  }
};

function generateToken(userId) {
  try {
    return JwtService.issue({id: userId})
  } catch (err) {
    sails.log('error generate token', err)
  }
}
