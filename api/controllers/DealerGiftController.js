/**
 * DealerGiftController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


module.exports = {
  /**
   * 'GET /dealergift/getById'
   * @param req: {query|token,dealer_id,perPage<optional>,page<optional>}
   * @param res
   * @author aavaldez
   * @desc Used to get dealer gift
   * @access Use socketio to access this route
   */
  getDealerGiftById: (req, res) => {
    const params = req.query;
    let tasks, userInfo, query;

    // Make sure this is a socket request (not traditional HTTP)
    if (!req.isSocket)
      return res.badRequest();

    // Validators
    if (!params.token)
      return res.badRequest({status: 400, message: '[token] Invalid parameters'});
    if (!params.dealer_id)
      return res.badRequest({status: 400, message: '[dealer_id] Invalid parameters'});
    if (typeof params.page !== 'undefined')
      if (params.page < 1)
        return res.badRequest({status: 400, message: '[page] Invalid parameters, must not be less than 1'});
    if (typeof params.perPage !== 'undefined')
      if (params.perPage < 1)
        return res.badRequest({status: 400, message: '[perPage] Invalid parameters, must not be less than 1'});

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
      getDealerGift: ["verifyToken", async (arg, cb) => {
        // Customized query to ease front-end pagination
        query = "SELECT COUNT(*) AS TotalRows FROM t_dealer_gift t0 WHERE t0.dealer_id = $1; " +
          "SELECT SUM(t1.gift_price) AS TotalGiftAmount FROM t_dealer_gift t1 WHERE t1.dealer_id = $1; " +
          "SELECT * FROM t_dealer_gift t2 WHERE t2.dealer_id = $1 ORDER BY t2.id DESC LIMIT " + (params.perPage ? params.perPage : 10) + " OFFSET " + (((params.page ? params.page : 1) - 1) * (params.perPage ? params.perPage : 10)) + ";";

        await sails.sendNativeQuery(query, [params.dealer_id], (err, rows) => {
          if(err)
            return cb(err);
          else
            return cb(null, {
              TotalRows : rows.rows[0][0]['TotalRows'],
              TotalGiftAmount: rows.rows[1][0]['TotalGiftAmount'],
              Trans : rows.rows[2]
            });
        });
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, results) => {
      if(err){
        return res.json({err: err, status: 400});
      } else {
        return res.json({err: null, status: 200, message: 'Dealer Gifts List', data : results.getDealerGift})
      }
    });
  },

  /**
   * 'POST /dealergift/addById'
   * @param req: {body|token,dealer_id,table_id,gift_name,gift_price}
   * @param res
   * @author aavaldez
   * @desc Used to send dealer gift
   * @access Use socketio to access this route
   */
  addDealerGiftById: (req, res) => {
    const params = req.body;
    let tasks, userInfo, theGift, query;

    // Make sure this is a socket request (not traditional HTTP)
    if (!req.isSocket)
      return res.badRequest();

    // Validators
    if (!params.token)
      return res.json({err: true, status: 400, message: '[token] Invalid parameters'});
    if (!params.dealer_id)
      return res.json({err: true, status: 400, message: '[dealer_id] Invalid parameters'});
    if (!params.table_id)
      return res.json({err: true, status: 400, message: '[table_id] Invalid parameters'});
    if (!params.gift_name)
      return res.json({err: true, status: 400, message: '[gift_name] Invalid parameters'});
    if (!params.gift_price || isNaN(params.gift_price) || params.gift_price < 1)
      return res.json({err: true, status: 400, message: '[gift_price] Invalid parameters'});

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
      // Add Dealer Gift
      addDealerGift: ["verifyToken", async (arg, cb) => {
        // Check if the given token is valid and has existing user records
        if (arg.verifyToken) {
          theGift = await DealerGift.create({
            user_id: arg.verifyToken.id,
            dealer_id: params.dealer_id,
            table_id: params.table_id,
            gift_name: params.gift_name,
            gift_price: params.gift_price,
            created_at: moment().format('YYYY-MM-DDTHH:mm:ss.SSS')
          })
            .fetch()
            .intercept((err) => {
              return cb(err)
            });

          // Return value if no exception detected
          return cb(null, theGift);
        } else {
          return cb('Invalid/Expired Token');
        }
      }],
      // Deduct gift amount to player balance
      deductPlayer: ["addDealerGift", async (arg, cb) => {
        query = "UPDATE t_user t0 SET t0.balance = t0.balance - $1 WHERE t0.id = $2; " +
          "SELECT t1.balance FROM t_user t1 WHERE t1.id = $2;";
        await Users.getDatastore().sendNativeQuery(query, [
          params.gift_price,
          userInfo.id
        ], (err, rows) => {
          if(err) {
            return cb(err);
          } else {
            // Catch for possible exception
            try { return cb (null, { new_balance: rows.rows[1][0]['balance'] || 0 }); } catch(ex) { return cb(ex) }
          }
        });
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, results) => {
      if(err){
        return res.json({err: err, status: 400});
      } else {
        return res.json({err: null, status: 200, message: 'Dealer sent gift successfully', data : results.deductPlayer})
      }
    });
  }
};

