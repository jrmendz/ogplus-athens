/**
 * StreamerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * Get top streamers
   * @param req
   * @param res
   * @returns {never}
   * @route POST /topStreamer
   */
  topStreamer: function (req, res) {
    let params = req.body || req.query;
    let tasks;

    // Validators
    if (_.isUndefined(params.token)) return res.badRequest('Invalid Parameter: [token]');

    // Variable Initialization
    tasks = {
      verifyToken: async function (cb) {
        // Verify token
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      query: ['verifyToken', async function (arg, cb) {
        let q = "CALL STREAMER_TOP5;";
        await Streamer.getDatastore().sendNativeQuery(q, [], cb);
      }]
    };

    async.auto(tasks, ( err, result ) => {
      if (err) return res.badRequest({ err: true, statusText: err });
      return res.json({
        data: _.map(result.query.rows[0], (o) => { return _.assign(o, { isPlaying: false }) })
      });
    });
  },

  /**
   * Streamer Tables
   * @route GET /streamer/tables
   */
  streamerTables: function (req, res) {
    let params = req.query;
    let tasks, showAll;

    if (_.isUndefined(params.token))
      return res.badRequest({ err: true, statusText: 'Invalid Parameter: [token]' });

    showAll = _.isUndefined(params.showAll) ? false : _.toLower(params.showAll) === "true";
    // List of Tasks
    tasks = {
      // Verify token
      verifyToken: async function (cb) {
        // Verify token
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      // Add Gift Information on DB
      query: ['verifyToken', async function (arg, cb) {
        const query = showAll ? "CALL STREAMER_TABLE_STANDARD($1);" : "CALL STREAMER_TABLE($1);";
        await sails.sendNativeQuery(query, ["ogplus"], (err, data) => {
          return cb(err, _.get(data, 'rows[0]', []));
        });
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, results) => {
      if (err) return res.badRequest({ err: true, statusText: err });
      return res.json({
        statusText: "Streamer list has been pulled.",
        data: results.query
      })
    })
  },




  /**
   * Add streamer gift
   * @param req
   * @param res
   * @route POST /addStreamerGift
   */
  addGift: function (req, res) {
    let params = req.body;
    let tasks, giftCreated;

    // Make sure this is a socket request (not traditional HTTP)
    if (!req.isSocket)
      return res.badRequest({ err: 'Forbidden Request' });

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({ err: true, statusText: 'Invalid Parameter: [token]' });
    if (_.isUndefined(params.streamerId))
      return res.badRequest({ err: true, statusText: 'Invalid Parameter: [streamerId]' });
    if (_.isUndefined(params.giftName))
      return res.badRequest({ err: true, statusText: 'Invalid Parameter: [giftName]' });
    if (_.isUndefined(params.giftAmount))
      return res.badRequest({ err: true, statusText: 'Invalid Parameter: [giftAmount]' });

    // List of Tasks
    tasks = {
      // Verify token
      verifyToken: async function (cb) {
        // Verify token
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      // Add Gift Information on DB
      query: ['verifyToken', async function (arg, cb) {
        if (arg.verifyToken.id) {
          giftCreated = await StreamerGift.create({
            user_id: arg.verifyToken.id,
            streamer_id: params.streamerId,
            gift_name: params.giftName,
            gift_price: params.giftAmount,
            created_at: moment().utc().toISOString()
          })
            .fetch()
            .intercept((err) => {
              return cb(err);
            });
          return cb(null, giftCreated);
        } else {
          return cb({ err: true, statusText: 'Invalid User' });
        }
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, results) => {
      if (err) return res.badRequest({ err: true, statusText: err });
      return res.ok(results.query)
    })
  },

  // alfie. Backup only - use endpoint /followstreamers
  followdealerstreamer: async (req, res) => {

    let params = req.body;
    //validator
    if (_.isUndefined(params.token))
      return res.badRequest("Invalid Credentials.");
    if (!_.includes(['FOLLOW', 'UNFOLLOW'], params.method.toUpperCase()))
      return res.badRequest({status: 400, err: "Invalid Parameter: [method] - It should be `FOLLOW` or `UNFOLLOW`"});
    if (_.isUndefined(params.dealerscode))
      return res.badRequest("Invalid Dealerscode.");

    const tasks = {
      verifyToken: async function (next) {
        await JwtService.valid(params.token)
          .then((token) => { return next(null, token);
          }).catch((err) => {
            return next(err)
          });
      },

      addStreamer: ["verifyToken", async (result, next) => {
        const FollowStreamer = "UPDATE t_streamers ts SET ts.likes = GREATEST(0, ts.likes + 1) where ts.dealerscode = $1;";
        const RemoveStreamer = "UPDATE t_streamers ts SET ts.likes = GREATEST(0, ts.likes - 1) where ts.dealerscode = $1;";

        await Streamer.getDatastore().sendNativeQuery(params.method === 'FOLLOW' ? FollowStreamer : RemoveStreamer, [params.dealerscode], function (err, result) {
					if (err) { res.serverError({message: JSON.stringify(err)})}
					return next(err, result.rows)
				})
      }]
    }

    async.auto(tasks, (err, results) => {
      if (err) return res.json({ status: 401, msg: err, data: '' });
      return res.json({ status: 200, message: 'successfully follow/unfollow streamer dealer.', data: results.addStreamer});
      })
    },

  // alfie. This is the one being use for follow streamer
  // /streamer/follow-streamers
  // This endpoint is transferred on PUT /emcee/likes
  followstreamers: async (req, res) => {
    const params = req.body;
    let method, tasks;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({status: 400, err: "Invalid Parameter: [token]"});
    if (_.isUndefined(params.dealerscode))
      return res.badRequest({status: 400, err: "Invalid Parameter: [dealerscode]"});
    if (!_.includes(['FOLLOW', 'UNFOLLOW'], params.method.toUpperCase()))
      return res.badRequest({status: 400, err: "Invalid Parameter: [method] - It should be `FOLLOW` or `UNFOLLOW`"});

    // Pre-setting variables
    method = params.method.toUpperCase();
    tasks = {
      // Validate token
      validToken: async (next) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return next(null, token);
          })
          .catch((err) => {
            return next(err)
          });
      },

      // Follow and Un-follow process
      process: ["validToken", async (results, next) => {
        //To.do - Alfie
        const UPDATE = "UPDATE t_streamers t0 SET t0.likes = (select COUNT(a.id) as count from t_follow_streamers a where a.dealerscode = t0.dealerscode) WHERE t0.dealerscode = $1;";

        if (method === "FOLLOW") {
          await FollowStreamer.findOrCreate({ dealerscode: params.dealerscode, user_id: results.validToken.id },
            {
              dealerscode: params.dealerscode,
              user_id: results.validToken.id,
              created: moment().format('YYYY-MM-DDTHH:mm:ss.SSS')
            }).exec(async function (err, result, created) {
              if (err) return next(400, err);
              if (created) {
                await sails.sendNativeQuery(UPDATE, [params.dealerscode]).catch((err) => { return next(err) })
                return next(null, result)
              }
              return next('Already existing', result)
          });
        } else {
          await FollowStreamer.destroy({ dealerscode: params.dealerscode, user_id: results.validToken.id }).exec(async function (err, result) {
            if (err) return next(400, err);
            if (result) {
              await sails.sendNativeQuery(UPDATE, [params.dealerscode]).catch((err) => { return next(err) })
              return next(null, result)
            }
          })
        }
      }],

      broadcast: ["process", async (results, next) => {
        let QUERY = "CALL STREAMER_TOP5;";
        let result = await Streamer.getDatastore().sendNativeQuery(QUERY, []).catch((err) => { return next(err) })
        await socketHelper('blast', {event: 'streamersEvent', values: result.rows[0]});
        return next()
      }]
    };
    // Execute tasks
    async.auto(tasks, (err) => {
      if (err) return res.badRequest({ status: 401, msg: err });
      return res.json({ status: 200, msg: "Streamer has been successfully " + (method === "FOLLOW" ? "follow" : "un-follow")});
    })
  },


  /**
   * Get Streamers
   * @param req
   * @param res
   * @returns {never}
   * @route GET /streamer/sign
   * @query tableNumber
   * @query dealersCode
   */
  loadStreamer: function (req, res) {
    const params = req.query;
    let tasks, isBroadcast;

    // Validators
    if (_.isUndefined(params.tableNumber))
      return res.badRequest({status: 400, statusText: "Invalid Parameter: [tableNumber]" });
    if (_.isUndefined(params.dealersCode))
      return res.badRequest({status: 400, statusText: "Invalid Parameter: [dealersCode]" });
    if (_.isUndefined(params.action))
      return res.badRequest({status: 400, statusText: "Invalid Parameter: [action]" });

    // Pre-setting values
    isBroadcast = _.isUndefined(params.isBroadcast) ? true : params.isBroadcast;

    tasks = {
      checkStreamerInfo: async (cb) => {
        let _q = "SELECT t1.dealerscode, t1.fullname, t1.nickname, t0.`status`, t0.likes, t0.live_viewers FROM t_streamers t0 INNER JOIN t_dealers t1 ON t0.dealerscode = t1.dealerscode WHERE t0.dealerscode = $1 AND t0.CANCELLED = 0 LIMIT 1"
        // Start querying database
        await sails.sendNativeQuery(_q, [params.dealersCode], (err, row) => {
          if (err) return cb(err);
          // Check if database has a dealer
          if (_.isEmpty(row.rows))
            return cb("Streamer Not Found. Try other dealer code.");
          // Return dealer information
          return cb(null, row.rows[0]);
        });
      },
      updateStreamerInfo: ["checkStreamerInfo", async (arg, cb) => {
        let _q01 = "UPDATE t_streamers t0 SET t0.table_location = $1 WHERE t0.dealerscode = $2";
        let _q02 = "UPDATE t_dealers t0 SET t0.tableLocation = $1 WHERE t0.dealerscode = $2";

        async.parallel([
          async (cb) => {
            await sails.sendNativeQuery(_q01, [params.action === "IN" ? params.tableNumber : "", params.dealersCode], cb);
          },
          async (cb) => {
            await sails.sendNativeQuery(_q02, [params.action === "IN" ? params.tableNumber : "Lobby", params.dealersCode], cb);
          }
        ], cb);
      }],

      broadcastLocation: ["updateStreamerInfo", async (arg, cb) => {
        let streamer = {
          tableNumber: params.tableNumber,
          streamerInfo: arg.checkStreamerInfo,
          action: params.action === "IN" ? "SIGN_IN" : "SIGN_OUT"
        };

        if (isBroadcast) {
          await socketHelper('blast', {
            event: 'streamer_update',
            values: streamer
          });
        }

        return cb(null, streamer);
      }]
    };

    async.auto(tasks, (err, taskResult) => {
      if (err)
        return res.badRequest({ status: 400, statusText: "", err });

      return res.json({
        status: 200,
        statusText: "Transaction successful.",
        data: taskResult.broadcastLocation
      })
    });
  },

  /**
   * Get emcee stats - likes and views
   * @param req
   * @param res
   * @route GET /emcee/stats
   */
  getEmceeStats: (req, res) => {
    const { token } = req.query;

    const tasks = {
      // Validate token
      validateToken: (next) => {
        JwtService.valid(token)
          .then((token) => next(null, token))
          .catch((err) => {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return next(err)
          });
      },
      // Get emcee views
      getEmceeStats: ['validateToken', (arg, next) => {
        let query = 'CALL EMCEE_LIST_OG';

        // Get all emcee data related to emcee views and followers
        sails.sendNativeQuery(query, [], (err, result) => {
          if (err) {
            console.error(new Error(`Error encounted: ${ JSON.stringify(err) }`));
            return res.serverError({ err: 500, msg: 'Internal Server Error' });
          }

          // Get list of emcees successful
          return next(null, result);
        });
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, result) => res.json({
      err: err ? 401 : null,
      msg: err ? 'Failed to get all Emcee likes and views' : 'Emcee views and likes list.',
      data: err || (result.getEmceeStats.rows ? result.getEmceeStats.rows[0] : [])
    }));
  },

  /**
   * Update emcee views
   * @param req
   * @param res
   * @route PUT /emcee/views
   */
  updateEmceeViews: (req, res) => {
    const { token, dealer_code: dealerCode } = req.body;

    const tasks = {
      // Validate token
      validateToken: (next) => {
        JwtService.valid(token)
          .then((token) => next(null, token))
          .catch((err) => {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return next(err)
          });
      },
      // Validators
      validateParams: (next) => {
        if (_.isUndefined(dealerCode))
          return res.badRequest({status: 400, statusText: "Invalid Parameter: [dealer_code]" });

        return next();
      },
      // Update emcee views
      updateEmceeViews: ['validateParams', (arg, next) => {
        let query = 'CALL EMCEE_VIEWS_ADD($1)';

        // Updates emcee views of emcee with given dealer code
        sails.sendNativeQuery(query, [
          dealerCode
        ], (err) => {
          if (err) {
            console.error(new Error(`Error encounted: ${ JSON.stringify(err) }`));
            return res.serverError({ err: 500, msg: 'Internal Server Error' });
          }

          // Update of emcee views successful
          return next();
        });
      }]
    };

    // Execute tasks
    async.auto(tasks, (err) => res.json({
      err: err ? 401 : null,
      msg: err ? 'Failed to update emcee views.' : 'Emcee views successfully updated.'
    }));
  },

  /**
   * Update emcee likes
   * @param req
   * @param res
   * @route PUT /emcee/likes
   */
  updateEmceeLikes: (req, res) => {
    const {
      token,
      action,  // LIKE or UNLIKE
      liked_emcee_id: likedEmceeID,
      user_id: userID
    } = req.body;

    const tasks = {
      // Validate token
      validateToken: (next) => {
        JwtService.valid(token)
          .then((token) => next(null, token))
          .catch((err) => {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return next(err)
          });
      },
      // Validators
      validateParams: (next) => {
        if (_.isUndefined(action) || !['LIKE', 'UNLIKE'].includes(action.toUpperCase()))
          return res.badRequest({status: 400, statusText: 'Invalid Parameter: [action] -- must be \'LIKE\' or \'UNLIKE\'' });

        if (_.isUndefined(likedEmceeID))
          return res.badRequest({status: 400, statusText: 'Invalid Parameter: [liked_emcee_id]' });

        if (_.isUndefined(userID))
          return res.badRequest({status: 400, statusText: 'Invalid Parameter: [user_id]' });

        // Proceed to updating followers
        return next();
      },
      // Like or unlike emcee by user with given userID
      updateEmceeLikes: ['validateParams', (arg, next) => {
        let query = 'CALL EMCEE_LIKES_UPDATE($1, $2, $3)';

        sails.sendNativeQuery(query, [
          action,
          likedEmceeID,
          userID
        ], (err, result) => {
          if (err) {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return next(err);
          }

          // Update of emcee followers success
          return next();
        });
      }],

      // Note: Transfered from old endpoint POST /follow-streamers
      broadcast: (next) => {
        let query = 'CALL STREAMER_TOP5;';

        sails.sendNativeQuery(query, [], async (err, result) => {
          if (err) {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return res.serverError({ err: 500, msg: 'Internal Server Error', data: err });
          }

          socketHelper('blast', {
            event: 'streamersEvent',
            values: result.rows[0]
          })
          .then(() => next())
          .catch(err => {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return res.serverError({ err: 500, msg: 'Internal Server Error', data: err });
          })
        });

      }
    };

    // Execute tasks
    async.auto(tasks, (err) => res.json({
      err: err ? 401 : null,
      msg: err ? 'Failed to update emcee likes.' : 'Emcee likes successfully updated.'
    }));
  },



};

