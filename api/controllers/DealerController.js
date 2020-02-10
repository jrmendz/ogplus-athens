/**
 * DealerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
//alfie
module.exports = {

  // 'GET /dealer/getById'
  getDealerById: function (req, res) {
    // if (!req.isSocket) return res.json({status: 400, message: 'Request could not process.'});
    const tokenS = req.query.token ? req.query.token : 'xxxx';
    sails.log(tokenS);
    const id = req.query.id ? req.query.id : 0;
    sails.log(id);
    const tasks = {
      verifyToken: async function (cb) {
        await JwtService.valid(tokenS)
          .then((token) => {

            return cb(null, { request: req, id: token.id });
          })
          .catch((err) => {
            return cb(err)
          });
      },
      proceed: ["verifyToken", function (next, data) {
        Dealer.findOne({ dealerscode: id }).exec(function (err, result) {
          sails.log(result, '------dataxcvff')
          if (err) { sails.log.error(err)
            sails.log(data, '------dataxcvff') }
          return res.ok({ status: 200, message: 'Successfull', data: result })

        });
      }]
    };
    async.auto(tasks, (err, results) => {
      if (err) return res.json({ message: "Invalid token." });
      sails.log.info('Successfull!')

      return res.json({});
    });
  }
};
