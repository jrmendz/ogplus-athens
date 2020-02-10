module.exports = {
  /**
   * End-point for follow and un-follow players
   * @route POST /follow/user
   * @param req
   * @param res
   * @returns {Promise<never>}
   */
	followUser: async (req, res) => {
    const params = req.body;
    let followedUserId, method, tasks;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({status: 400, err: "Invalid Parameter: [token]"});
    if (_.isUndefined(params.followedUserId))
      return res.badRequest({status: 400, err: "Invalid Parameter: [followedUserId]"});
    if (_.isUndefined(params.method))
      return res.badRequest({status: 400, err: "Invalid Parameter: [method]"});
    if (!_.includes(['FOLLOW', 'UNFOLLOW'], params.method.toUpperCase()))
      return res.badRequest({status: 400, err: "Invalid Parameter: [method] - It should be `FOLLOW` or `UNFOLLOW`"});

    // Pre-setting variables
    followedUserId = params.followedUserId;
    method = params.method.toUpperCase();
    tasks = {
      // Validate token
      validToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },

      // Follow and Un-follow process
      process: ["validToken", (arg, cb) => {
        const DEL = "DELETE FROM t_follow_users WHERE follow_user_id = $1 AND user_id = $2; " +
          "UPDATE t_user t0 SET t0.followers = GREATEST(0, t0.followers - 1) WHERE t0.id = $1;";
        const INS = "INSERT INTO t_follow_users (`follow_user_id`, `user_id`) VALUES ($1, $2); " +
          "UPDATE t_user t0 SET t0.followers = GREATEST(0, t0.followers + 1) WHERE t0.id = $1;";

        async.waterfall([
          // Check if there's a record exist
          async (cb) => {
            FollowUsers.findOne({
              follow_user_id: followedUserId,
              user_id: arg.validToken.id
            })
              .then((data) => {
                return cb(null, {
                  id: arg.validToken.id,
                  hasRecord: !_.isEmpty(data)
                })
              })
              .catch((err) => {
                return cb(err)
              })
          },
          (arg, cb) => {
            sails
              .sendNativeQuery(method === 'FOLLOW' ? arg.hasRecord ? "SELECT 0;" : INS : DEL, [
                followedUserId,
                arg.id
              ])
              .exec(cb)
          }
        ], cb)
      }],

      // Broadcast update of dealer followers
      broadcast: ["process", async (results, cb) => {
        await socketHelper('broadcast', {
          room: 'updates_room',
          event: 'userUpdates',
          values: {
            action: 'FOLLOWERS',
            data: {
              followedUserId,
              method: method === "FOLLOW" ? "+" : "-"
            }
          }
        });
        return cb();
      }]
    };

    // Execute tasks
    async.auto(tasks, (err) => {
      if (err)
        return res.badRequest({
          status: 401,
          msg: err
        });

      return res.json({
        status: 200,
        msg: "User has been successfully " + (method === "FOLLOW" ? "follow" : "un-follow")
      });
    })
	},

  /**
   * End-point for getting the list of followed players
   * @route GET /follow/userlist
   * @param req
   * @param res
   * @returns {Promise<never>}
   */
  userList: async (req, res) => {
    const params = _.isEmpty(req.query) ? req.body : req.query;
    let itemsPerPage = 10, page = 1;
    let tasks;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid Parameter: [token]" });

    // Pre-setting variables
    if (!_.isUndefined(params.items)) itemsPerPage = params.items || 10;
    if (!_.isUndefined(params.page))  page = params.page || 1;

    tasks = {
      validToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      process: ["validToken", (arg, cb) => {
        const query = "SELECT t1.id AS followedUserId, t1.nickname, t1.table_location, (SELECT COUNT(_d.user_id) FROM t_follow_users _d WHERE _d.follow_user_id = t0.follow_user_id) AS followers, t1.logged, 1 AS isFollowed FROM t_follow_users t0 INNER JOIN t_user t1 ON t0.follow_user_id = t1.id WHERE t0.user_id = $1 GROUP BY t0.follow_user_id"; // LIMIT $2 OFFSET $3

        sails
          .sendNativeQuery(query, [
            arg.validToken.id,
            // itemsPerPage,
            // (page - 1) * itemsPerPage
          ], (err, rawResult) => {
            if (err)
              return cb(err);
            return cb(err, rawResult.rows);
          });
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, taskResults) => {
      if (err)
        return res.badRequest({
          status: 401,
          msg: err
        });

      return res.json({
        status: 200,
        msg: 'List of followed players',
        data: taskResults.process
      })
    })
  },


  /**
   * End-point for follow and un-follow dealer
   * @routes POST /follow/dealer
   * @param req
   * @param res
   * @returns {Promise<never>}
   */
	followDealer: async (req, res) => {
    const params = req.body;
    let dealersCode, method, tasks;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({status: 400, err: "Invalid Parameter: [token]"});
    if (_.isUndefined(params.dealerscode))
      return res.badRequest({status: 400, err: "Invalid Parameter: [dealerscode]"});
    if (_.isUndefined(params.method))
      return res.badRequest({status: 400, err: "Invalid Parameter: [method]"});
    if (!_.includes(['FOLLOW', 'UNFOLLOW'], params.method.toUpperCase()))
      return res.badRequest({status: 400, err: "Invalid Parameter: [method]"});

    // Pre-setting variables
    dealersCode = params.dealerscode;
    method = params.method.toUpperCase();
    tasks = {
      // Validate token
      validToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },

      // Follow and Un-follow process
      process: ["validToken", (arg, cb) => {
        const DEL = "DELETE FROM t_follow_dealers WHERE dealerscode = $1 AND user_id = $2; " +
          "UPDATE t_dealers t0 SET t0.followers = GREATEST(0, t0.followers - 1) WHERE t0.dealerscode = $1;";
        const INS = "INSERT INTO t_follow_dealers (`dealerscode`, `user_id`) VALUES ($1, $2); " +
          "UPDATE t_dealers t0 SET t0.followers = GREATEST(0, t0.followers + 1) WHERE t0.dealerscode = $1;";

        async.waterfall([
          // Check if there's a record exist
          async (cb) => {
            FollowDealers.findOne({
              dealerscode: dealersCode,
              user_id: arg.validToken.id
            })
              .then((data) => {
                return cb(null, {
                  id: arg.validToken.id,
                  hasRecord: !_.isEmpty(data)
                })
              })
              .catch((err) => {
                return cb(err)
              })
          },
          (arg, cb) => {
            sails
              .sendNativeQuery(method === 'FOLLOW' ? arg.hasRecord ? "SELECT 0;" : INS : DEL, [
                dealersCode,
                arg.id
              ])
              .exec(cb)
          }
        ], cb)
      }],

      // Broadcast update of dealer followers
      broadcast: ["process", async (results, cb) => {
        await socketHelper('broadcast', {
          room: 'updates_room',
          event: 'dealerUpdates',
          values: {
            action: 'FOLLOWERS',
            data: {
              dealersCode,
              method: method === "FOLLOW" ? "+" : "-"
            }
          }
        });
        return cb();
      }]
    };

    // Execute tasks
    async.auto(tasks, (err) => {
      if (err)
        return res.badRequest({
          status: 401,
          msg: err
        });

      return res.json({
        status: 200,
        msg: "Dealer has been successfully " + (method === "FOLLOW" ? "follow" : "un-follow")
      });
    })
  },

  /**
   * End-point for brief information of dealer
   * @route GET /follow/dealerinfo
   * @param req
   * @param res
   * @returns {Promise<never>}
   */
  dealerInfo: function (req, res) {
    const params = _.isEmpty(req.query) ? req.body : req.query;
    let tasks;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({ status: 400, msg: "Invalid Parameter: [token]"});
    if (_.isUndefined(params.dealerscode))
      return res.badRequest({ status: 400, msg: "Invalid Parameter: [dealerscode]"});

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
      process: ["verifyToken", function (arg, cb) {
        const query = 'SELECT t1.id, t0.dealerscode, t0.nickname, t1.user_id, COUNT(t1.id) AS followers, SUM(IF(t1.user_id = $1,1,0)) AS isFollowed FROM t_dealers t0 LEFT JOIN t_follow_dealers t1 ON t0.dealerscode = t1.dealerscode WHERE t0.dealerscode = $2 GROUP BY t0.dealerscode LIMIT 1';

        sails
          .sendNativeQuery(query, [
            arg.verifyToken.id,
            params.dealerscode
          ], function (err, rawResult) {
            if (err)
              return cb(err);
            return cb(null, rawResult.rows)
          })
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, taskResults) => {
      if (err)
        return res.badRequest({
          status: 401, msg: err
        });

      return res.json({
        status: 200,
        msg: "Dealer follow status information.",
        data: taskResults.process
      })
    })
  },

  /**
   * End-point for player's followed dealer
   * @routes GET /follow/dealerlist
   * @param req
   * @param res
   * @returns {Promise<never>}
   */
  dealerList: async (req,res) => {
    const params = _.isEmpty(req.query) ? req.body : req.query;
    let itemsPerPage = 10, page = 1;
    let tasks;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid Parameter: [token]" });

    // Pre-setting variables
    if (!_.isUndefined(params.items)) itemsPerPage = params.items || 10;
    if (!_.isUndefined(params.page))  page = params.page || 1;

    tasks = {
      validToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      process: ["validToken", (arg, cb) => {
        const query = "SELECT t1.id, t1.dealerscode, t1.nickname, (SELECT COUNT(_d.user_id) FROM t_follow_dealers _d WHERE _d.dealerscode = t1.dealerscode) AS followers, t1.tableLocation AS table_location, 1 AS isFollowed FROM t_follow_dealers t0 INNER JOIN t_dealers t1 ON t0.dealerscode = t1.dealerscode WHERE t0.user_id = $1 GROUP BY t0.dealerscode"; //  LIMIT $2 OFFSET $3

        sails
          .sendNativeQuery(query, [
            arg.validToken.id,
            // itemsPerPage,
            // (page - 1) * itemsPerPage
          ], (err, rawResult) => {
            if (err)
              return cb(err);
            return cb(err, rawResult.rows);
          });
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, taskResults) => {
      if (err)
        return res.badRequest({
          status: 401,
          msg: err
        });

      return res.json({
        status: 200,
        msg: 'List of followed dealers',
        data: taskResults.process
      })
    })
  }
}
