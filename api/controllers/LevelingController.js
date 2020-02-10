/**
 * LevelingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  updateOGPoint: (req, res) => {
    let params = req.body;
    let tasks, method, token;

    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid Parameter: [token]"});
    if (_.isUndefined(params.method))
      return res.badRequest({ err: "Invalid Parameter: [method]"});

    token = params.token;
    method = params.method;

    tasks = {
      verifyToken: async (cb) => {
        // Verify token
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      updatePoints: ["verifyToken", (arg, cb) => {
        // Call iChips API
        ichipsApi("updatePoints", {
          username: arg.verifyToken.username,
          method: method,
          amount: 0
        }, (err, data) => {
          if (err) return cb(err);

          return cb(null, data);
        });
      }]
    };

    async.auto(tasks, (err, taskResult) => {
      if (err) return req.badRequest({ err : err });

      return req.json()
    });
  },

  updateOGExp: (req, res) => {

    ichipsApi("updateExp", {
      username: "",
      method: "",
      amount: 0
    }, (err, data) => {
      if (err) return res.badRequest(err);

      return res.json(data);
    });
  },


};

