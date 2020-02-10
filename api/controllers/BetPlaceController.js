/**
 * BetPlaceController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

	index: function (req, res) {
  	const token = req.query.token ? req.query.token: 'xxxx';
  	const reqip = req.headers["x-forwarded-for"] || req.ip;
		let limit = req.query.limit ? req.query.limit : 1000
		let limit_query = " LIMIT " + limit
		let order_by_query = " ORDER BY id ASC"
		let query = "SELECT bp.id, bp.bet_place FROM c_betplace bp" + order_by_query + limit_query
    const tasks = {
      verifyToken: async function (cb) {
        await JwtService.valid(token)
          .then((token) => {
            return cb(null, {request: req, id: token.id});
          })
          .catch((err) => {
            return cb(err)
          });
      },
      getBetPlaces: ["verifyToken", function (results, next) {
				Betplace.getDatastore().sendNativeQuery(query, [], function (err, betplaces) {
					if (err) { res.serverError({message: JSON.stringify(err)})}
					return next(err, {message: 'Successfully sent betplaces!', data: betplaces.rows})
				})
      }]
  	};

    async.auto(tasks, (err, results) => {
      if (err) return res.json({message: err});
      return res.ok(results.getBetPlaces)
    });


	},

	add: function (req, res) {
		const bet_place = req.body.bet_place ? req.body.bet_place : ""
		const gamecode_id = req.body.gamecode_id ? req.body.gamecode_id : ""
    const tasks = {
      verifyToken: async function (cb) {
        await JwtService.valid(req.body.token)
          .then((token) => {
            return cb(null, {request: req, id: token.id});
          })
          .catch((err) => {
            return cb(err)
          });
      },
      verifyGamecodeId: function (next) {
      	Betplace.count({id: gamecode_id}).exec(function (err, betplacescount) {
      		if (err) { res.serverError({message: JSON.stringify(err)}) }
      		if (betplacescount === 0) { return res.serverError({message: 'Unrecognized gamecode_id!'}) }
      		return next(err, true)
      	})
      },
      add: ["verifyToken", "verifyGamecodeId", function (results, next) {
      	Betplace.create({bet_place, gamecode_id}).fetch().exec(function (err, betplaces) {
      		if (err) { res.serverError({message: JSON.stringify(err)}) }
      		return next({message: 'Successfully sent betplaces!', data: betplaces})
      	})
      }]
    };

    async.auto(tasks, (err, results) => {
      if (err) return res.json({message: err, status: 500});
      return res.ok(results.add)
    });
	}

};
