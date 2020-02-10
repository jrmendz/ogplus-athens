/**
 * RankingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * End-point for ranking list
   * @route GET /ranking/rankinglist
   * @param req
   * @param res
   * @returns {never}
   */
  rankingList: function (req, res) {
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
        const query = "SELECT t1.id AS followedUserId, t1.nickname, t1.balance, SUM(t0.win_loss) AS win_loss, t1.logged, SUM(IF(t2.user_id = $1,1,0)) AS isFollowed, CASE WHEN (t1.id = $1) THEN 1 ELSE 0 END AS isMe FROM t_betdetails t0 LEFT JOIN t_user t1 ON t0.user_id = t1.id LEFT JOIN t_follow_users t2 ON t1.id = t2.follow_user_id WHERE t0.win_loss >= 0 AND t0.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 HOUR) GROUP BY t0.user_id ORDER BY win_loss DESC"; // LIMIT $2 OFFSET $3

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
        msg: 'Ranking list of players',
        data: taskResults.process
      })
    })
  },

  // /ranking/winningstreak
  getwinningstreak: function (req, res) {

      const token = req.body.token;
      // sails.log(token);

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
          proceed: ["verifyToken", function (results, next) {
              // Ranking.getDatastore().sendNativeQuery('select a.id, a.user_id, a.state, a.balance, a.win_loss, a.bet_date, b.nickname, b.logged, count(*) as streakresult from t_betdetails a inner join t_user b on b.id = a.user_id where win_loss > 0 group by a.user_id order by streakresult desc limit 50', function (err, rawResult) {
                  Ranking.getDatastore().sendNativeQuery('select a.id, a.user_id, a.balance, a.win_loss, a.bet_date, b.nickname, b.logged, count(*) as streakresult from t_betdetails a inner join t_user b on b.id = a.user_id where win_loss > 0 group by a.user_id order by win_loss desc limit 50', function (err, rawResult) {
                  if (err) { return next(err) }
                  // sails.log(rawResult.rows, '-------result');
                  return next(err, rawResult.rows)
              });
          }]
      };
      async.auto(tasks, (err, results) => {
    if (err) return res.json({status: 401, msg: err, data: ''});
    return res.json({status: 200, msg: 'Winning Streak list loaded successfully', data: results.proceed})
  })
  }
};
