module.exports = {

  friendlyName: 'IChips API Helper',


  description: 'IChips Integration - Wallet for Panda Games',


  inputs: {
    method: {
      type: 'string'
    },
    data: {
      type: 'ref'
    }
  },

  fn: async function (inputs, exits) {
    const method = inputs.method
    const data = inputs.data
    const functionGroup = {
      checkUser: async () => {
        let queryString = {
          username: data.username,
          user_type: "MARS"
        }
        if (data.game_code) {
          queryString.game_code = data.game_code
        }
        let userOptions = {
          url: sails.config.services.ichips.user + '/' + data.username,
          headers: {
            token: await getIChipsToken(),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          qs: queryString,
          json: true
        };
        await request.get(userOptions, async (err, result) => {
          const response = result.body;
          if (response.errors || response.error) return exits.success({errors: response.errors ? response.errors : response.error})
          return exits.success({data: response.data});
        });
      },
      getUser: async () => {
        let userOptions = {
          url: sails.config.services.ichips.user + '/' + data.username,
          headers: {
            token: await getIChipsToken(),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          qs: {
            username: data.username,
            user_type: "MARS"
          },
          json: true
        };

        // If game code present in parameter add it on query string
        if (data.game_code) _.assign(userOptions.qs, { game_code: data.game_code });

        await request.get(userOptions, (err, result) => {
          const response = result.body;
          if (err)
            return exits.error({ errors: err });
          if (response.errors || response.error)
            return exits.error({ errors: response.errors ? response.errors : response.error });

          console.log("\033[33m[", data.username,"] [I-CHIPS] GET /user =>", JSON.stringify({ balance: response.data.user.balance, chip_limit: response.data.chip_limit }), "\033[0m");

          return exits.success({ data: response.data });
        });
      },
      getBalance: async () => {
        let balanceOptions = {
          url: sails.config.services.ichips.balance + '/' + data.username,
          headers: {
            token: await getIChipsToken(),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          qs: {
            user_type: 'MARS'
          },
          json: true
        };
        await request.get(balanceOptions, async (err, result) => {
          const response = result.body;
          if (response.errors || response.error) return exits.error({errors: response.errors ? response.errors : response.error})
          return exits.success({balance: response.data.balance});
        });
      },

      /**
       *  TO.DO -alfie
       * @returns {Promise<void>}
       */
      getHistory: async () => {
        let historyOptions = {
          url: sails.config.services.ichips.history,
          headers: {
            token: await getIChipsToken(),
            'Content-Type': 'application/json'
          },
          qs: {
            username: data.username,
            user_type: 'MARS',
            game_code: data.game_code,
            table_number: data.table_number,
            shoehandnumber : data.shoehandnumber,
            start_date: data.start_date,
            end_date: data.end_date,
            start: data.start,
            length: data.length
          },
          json: true
        };

        console.log('I-CHIPS TOKEN', historyOptions.headers.token)

        request.get(historyOptions, (err, result, body) => {
          const response = result.body;
          if (response.errors || response.error)
            return exits.error({errors: response.errors ? response.errors : response.error});

          return exits.success({
            data: body.data,
            count_records: body.count_records,
            count_results: body.count_results
          });
        });
      },
      createUser: async () => {
        let createUserOptions = {
          url: sails.config.services.ichips.user,
          headers: {
            token: await getIChipsToken(),
            'Content-Type': 'application/json'
          },
          qs: {
            user_type: data.user_type
          },
          form: {
            username: data.username,
            nickname: data.nickname,
            user_type: "MARS",
            currency: data.currency,
            status: data.status
          },
          json: true
        };
        await request.post(createUserOptions, async (err, result) => {
          const response = result.body
          console.log(response)
          if (response.errors || response.error)
            return exits.success({errors: response.errors ? response.errors : response.error})
          if (err)
            return exits.success({error: err})
          return exits.success({data: response.data});
        });
      },
      betBalance: async () => {
        let balance = 0;
        let bettingDetails = data.bettingDetails;
        let bets = [];

        for (let i = 0; i < bettingDetails.length; i++) {
          bets.push({
            amount: parseFloat(bettingDetails[i].bet_amount),
            game_code: data.gameCode,
            betting_code: 'BET_' + bettingDetails[i].bet_code
          })
        }
        let betOptions = {
          url: sails.config.services.ichips.bet + '/' + data.username,
          headers: {
            token: await getIChipsToken(),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          qs: {
            username: data.username,
            user_type: 'MARS'
          },
          form: {
            data: bets
          },
          json: true
        };
        await request.post(betOptions, async (err, result) => {
          const response = result.body;
          if (err)
            return exits.error({errors: err});
          if (response.errors || response.error)
            return exits.error({errors: response.errors ? response.errors : response.error});

          console.log("\033[33m[", data.username,"] [I-CHIPS] POST /balance/bet =>", JSON.stringify(response.data), "\033[0m");

          balance = response.data.current_balance;
          return exits.success({balance});
        });
      },
      payoutBalance: async () => {
        // let payoutOptions;
        // let user = {};
        // let payouts = {};
        // for (let i = 0; i < data.iChipsPayoutData.length; i++) {
        //   if (!payouts[data.iChipsPayoutData[i].username]) {
        //     payouts[data.iChipsPayoutData[i].username] = {
        //       game_code: data.iChipsPayoutData[i].game_code,
        //       user_id: data.iChipsPayoutData[i].user_id,
        //       data: []
        //     }
        //   }
        //   payouts[data.iChipsPayoutData[i].username].data.push({
        //     betting_code: 'PAYOUTS_' + data.iChipsPayoutData[i].betting_code,
        //     game_code: data.iChipsPayoutData[i].game_code,
        //     amount: data.iChipsPayoutData[i].amount
        //   })
        // }
        //
        // for (let username in payouts) {
        //   payoutOptions = {
        //     url: sails.config.services.ichips.payout + '/' + username,
        //     headers: {
        //       token: await getIChipsToken()
        //     },
        //     qs: {
        //       username: username,
        //       game_code: payouts[username].game_code,
        //       user_type: 'MARS'
        //     },
        //     form: {
        //       data: payouts[username].data
        //     },
        //     json: true
        //   };
        //   sails.log("\033[32m[PAYOUT][" + username + "]:" + JSON.stringify(payouts[username].data) + "]\033[0m")
        //
        //   await request.post(payoutOptions, (err, result) => {
        //     const response = result.body;
        //     if (err)
        //       return exits.error({ errors: err });
        //     if (response.errors || response.error)
        //       return exits.error({ errors: response.errors ? response.errors : response.error });
        //
        //     if (!_.has(user, payouts[username].user_id)) {
        //       _.assign(user, { [payouts[username].user_id]: { balance: 0 } })
        //     }
        //     sails.log("\033[32m[" + username + "][ICHIPS] Current Balance:" + response.data.current_balance + "]\033[0m")
        //     user[payouts[username].user_id] = response.data.current_balance;
        //   });
        // }
        // if (!_.isEmpty(user))
        //   return exits.success({user});


        let user = {};
        let payouts = {};

        /*
          EXPECTED `payout` object format
          payouts = {
            'si_alvin': {
              game_code: 'baccarat',
              user_id: 3,
              data: [
                {
                  betting_code: 'PAYOUT_12300000000008888',
                  game_code: 'baccarat',
                  amount: 0
                }
              ]
            }
          }

          GIVEN `data.iChipsPayoutData`
          [
            {
              user_id: 3,
              username: 'si_alvin',
              betting_code: '1320000008888',
              game_code: 'baccarat'
            },
            {
              user_id: 3,
              username: 'si_alvin',
              betting_code: '132000000888899999',
              game_code: 'baccarat'
            }
          ]
        */

        _.map(data.iChipsPayoutData, (bet) => {
          // Check if the username is already listed
          if (_.has(payouts, bet.username)) {
            payouts[bet.username].data.push({
              betting_code: 'PAYOUTS_' + bet.betting_code,
              game_code: bet.game_code,
              amount: bet.amount
            })
          } else {
            _.assign(payouts, {
              [bet.username]: {
                game_code: bet.game_code,
                user_id: bet.user_id,
                data: [{
                  betting_code: 'PAYOUTS_' + bet.betting_code,
                  game_code: bet.game_code,
                  amount: bet.amount
                }]
              }
            })
          }
        });

        // console.log("SERIALIZE ICHIPS PAYOUT", JSON.stringify(payouts))

        async.forEachOf(payouts, async (value, username, cb) => {
          let payoutOptions = {
            url: sails.config.services.ichips.payout + '/' + username,
            headers: {
              token: await getIChipsToken(),
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            qs: {
              username: username,
              game_code: payouts[username].game_code,
              user_type: 'MARS'
            },
            form: {
              data: payouts[username].data
            },
            json: true
          };

          // console.log("DATA SENT TO ICHIPS:", payouts[username].data)

          await request.post(payoutOptions, (err, result) => {
            const response = result.body;
            if (err)
              return cb({ errors: err });

            if (response.errors || response.error)
              return cb({ errors: response.errors ? response.errors : response.error });

            if (!_.has(user, payouts[username].user_id)) {
              _.assign(user, { [payouts[username].user_id]: { balance: 0 } })
            }
            sails.log("\033[32m[" + username + "][ICHIPS] Current Balance:" + response.data.current_balance + "]\033[0m")
            user[payouts[username].user_id] = response.data.current_balance;

            return cb()
          });
        }, async (err) => {
          if (err)
            return exits.error(err);
          return exits.success({ user });
        });
      },

      insertTransaction: async () => {
        let query = "CALL PAYOUT_TRANSACTION($1, $2)";
        await sails
          .sendNativeQuery(query, [data.gameset_id, data.user_id], (err, values) => {
            if (err)
              return exits.error({ error: err });

            let bets = values.rows[0];
            let _betsTable;

            if (_.isEmpty(bets)) {
              console.log("\033[43m\033[30m","WARNING: Transaction is empty. [I-Chips/insertTransaction]", "\033[0m");
            }

            // console.log(JSON.stringify(bets))

            async.forEachOf(bets, async (value, key, cb) => {
              let transactionOptions = {
                url: sails.config.services.ichips.transaction + '/' + value.username,
                headers: {
                  token: await getIChipsToken(),
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                qs: {
                  username: value.username,
                  user_type: 'MARS',
                  game_code: data.game_type
                },
                form: {
                  "bet_code": value.bet_code,
                  "bet_amount": value.bet_amount,
                  "bet_place": value.bet_place,
                  "effective_bet_amount": value.effective_bet_amount,
                  "shoehandnumber": value.shoehandnumber,
                  "gameset_id": value.gameset_id,
                  "gamename": value.gamename,
                  "tablenumber": value.tablenumber,
                  "balance": data.balance,
                  "win_loss": value.win_loss,
                  "result_id": value.result_id,
                  "result": value.result,
                  "bet_date": moment(value.created_at).utc().format('YYYY-MM-DD HH:mm:ss'),
                  "super_six": value.super_six,
                  "is_sidebet": value.is_sidebet
                },
                json: true
              };

              _betsTable = value.tablenumber;

              await request.post(transactionOptions, async (err, result) => {
                const response = result.body;

                await log('debug', {info: {
                  bet_code: value.bet_code,
                  bet_amount: value.bet_amount,
                  bet_place: value.bet_place,
                  effective_bet_amount: value.effective_bet_amount,
                  shoehandnumber: value.shoehandnumber,
                  gameset_id: value.gameset_id,
                  gamename: value.gamename,
                  tablenumber: value.tablenumber,
                  balance: data.balance,
                  win_loss: value.win_loss,
                  result_id: value.result_id,
                  result: value.result,
                  bet_date: moment(value.created_at).utc().format('YYYY-MM-DD HH:mm:ss'),
                  super_six: value.super_six,
                  is_sidebet: value.is_sidebet
                }, action: 'ICHIPS TRANSACTION'})

                if (err)
                  return cb({ errors: err });
                if (response.errors || response.error)
                  return cb({ errors: response.errors ? response.errors : response.error})

                return cb();
              });
            }, (err) => {
              if (err)
                return exits.error({ error: err });

              console.log("\033[33m[", _betsTable,"] [I-CHIPS] POST /history/transaction =>", JSON.stringify({ gameset_id: data.gameset_id }), "\033[0m");
              return exits.success();
            });
          });
      },

      insertGameResult: () => {
        const {
          gameSet = null,
          result_id: resultId,
          game_type: gameType
        }  = data;
        const _q = "CALL PAYOUT_GAME_RESULT($1);";
        const _d = [resultId];
        let tasks;

        tasks = {
          validator: (next) => {
            console.log(`|| #1 I-CHIPS[GAME RESULT] - ${gameSet} || Validating parameters.`);
            if (!gameSet)
              return next({error: `Invalid GameSet. ${gameSet}`});
            else if (!resultId)
              return next({error: `Invalid Result ID. ${resultId}`});
            else if (!gameType)
              return next({error: `Invalid Game Type. ${gameType}`});
            else
              return next();
          },

          gameResult: ['validator', (arg, next) => {
            console.log(`|| #2 I-CHIPS[GAME RESULT] - ${gameSet} || Getting game result from database.`);
            let gameResult = {};
            sails
              .sendNativeQuery(_q, _d, (err, values) => {
                if (err) {
                  console.log(`|| #2.1 I-CHIPS[GAME RESULT] - ${gameSet} || Error getting game result from DB. ${JSON.stringify(err)}`);
                  return next({ error: err });
                }

                // Set game result values
                gameResult = _.get(values, `rows[0][0]`, {});

                // Check if the gameResult is valid
                if (_.isEmpty(gameResult)) {
                  console.log(`|| #2.1 I-CHIPS[GAME RESULT] - ${gameSet} || No result game result found on database using this game-set.`);
                  return next({ error: `No result game result found on database using this gameSet id ${gameSet}.` });
                }

                // Return game result
                console.log(`|| #2.1 I-CHIPS[GAME RESULT] - ${gameSet} || Game result pulled successfully.`);
                return next(null, gameResult);
              })
          }],

          iChips: ['gameResult', async (arg, next) => {
            console.log(`|| #3 I-CHIPS[GAME RESULT] - ${gameSet} || I-Chips integration.`);
            const { result, shoehandnumber, shoe_date, tablenumber, values } = arg.gameResult;
            const payLoad = {
              url: sails.config.services.ichips.gameresult + '?game_code=' + gameType,
              headers: {
                token: await getIChipsToken(),
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              form: {
                "result": result,
                "result_id": resultId,
                "shoehandnumber": shoehandnumber,
                "shoe_date": shoe_date,
                "table_no": tablenumber,
                "values": values
              },
              json: true
            };
            let retryCount = 1;

            // I-Chips API call
            const iChips = (cb) => {
              request.post(payLoad, (err, response, body) => {
                if (err) {
                  console.log(`|| #3.1 I-CHIPS[GAME RESULT] - ${gameSet} || I-Chips API Call [${retryCount}] failed. ${JSON.stringify(err)}`);
                  retryCount++;
                  return cb({error: err});
                }
                // Check if the data receive is valid
                if (!_.isObject(body)) {
                  console.log(`|| #3.1 I-CHIPS[GAME RESULT] - ${gameSet} || I-Chips API Call [${retryCount}] failed. ${body}`);
                  retryCount++;
                  return cb({error: 'iChips Server is online but return unexpected data format.'});
                }

                console.log(`|| #3.1 I-CHIPS[GAME RESULT] - ${gameSet} || I-Chips API Call [${retryCount}] success. ${JSON.stringify(body)}`);
                return cb(err, body);
              });
            };

            // This will retry iChips saving 2 times if failed
            async.retry({ times: 2, interval: 200 }, iChips, (err, data) => {
              // Handles iChips errors
              if (err) {
                console.log(`|| #3.2 I-CHIPS[GAME RESULT] - ${gameSet} || I-Chips integration failed.`);
                return next({error: err });
              }
              // Check return error from iChips
              if (data.errors || data.error) {
                console.log(`|| #3.2 I-CHIPS[GAME RESULT] - ${gameSet} || I-Chips validation error. ${JSON.stringify({error: data.errors || data.message || data.error })}`);
                return next({error: data.errors || data.message || data.error });
              }
              console.log(`|| #3.2 I-CHIPS[GAME RESULT] - ${gameSet} || Saving game result to I-Chips successful.`);
              // Return when successfully executed
              return next(null, data);
            });
          }]
        };

        console.log(`|| I-CHIPS[GAME RESULT] - ${gameSet} ||`);

        // Execute tasks here
        async.auto(tasks, (err, taskResults) => {
          if (err) {
            console.log(`|| I-CHIPS[GAME RESULT] - ${gameSet} || FAILED :(`);
            return exits.error(err);
          }

          console.log(`|| I-CHIPS[GAME RESULT] - ${gameSet} || SUCCESS :)`);
          return exits.success({ gameResult: taskResults.gameResult });
        });
      },


      balanceTransfer: async () => {
        let balanceOptions = {
          url: data.transferURL + '/' + data.createdTrans.username,
          headers: {
            token: await getIChipsToken(),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          qs: {
            user_type: 'MARS'
          },
          form: {
            "op_transfer_id": data.createdTrans.transferId,
            "amount": data.createdTrans.amount
          },
          json: true
        };
        await request.post(balanceOptions, (err, result) => {
          let response = result.body
          if (response.errors || response.error) return exits.success({errors: response.errors ? response.errors : response.error})
          return exits.success({ balance: response.data.current_balance});
        });
      },

      /**
       * I-Chips Player Update Points
       * @description This is used to communicate with i-chips points
       * @requires username <String>
       * @requires method <String>
       * @requires amount <Number>
       */
      updatePoints: () => {
        let payLoad;

        async.waterfall([
          // Getting I-Chips tokens
          (cb) => {
            CacheService.get('ICHIPS_TOKEN', cb);
          },
          // API Request to I-Chips
          (arg, cb) => {
            // Token validator
            if (!arg) return cb("Invalid I-Chips token");
            // Initiate payloads
            payLoad = {
              url: sails.config.services.ichips.playerPoints + '/' + data.username,
              headers: {
                token: arg,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              qs: {
                user_type: 'MARS'
              },
              form: {
                "user_points_method": data.method, // + or -
                "user_points_value": data.amount
              },
              json: true
            };
            // Call API
            request.post(payLoad, cb);
          }
        ], (err, result) => {
          if (err) return exits.error(err);

          console.log("<<< I-Chips player points updated. >>>");
          return exits.success(result);
        });
      },

      /**
       * I-Chips Player Exp Points
       * @description This is used to communicate with i-chips exp points
       * @requires username <String>
       * @requires method <String>
       * @requires amount <Number>
       */
      updateExp: () => {
        let payLoad;

        async.waterfall([
          // Getting I-Chips tokens
          (cb) => {
            CacheService.get('ICHIPS_TOKEN', cb);
          },
          // API Request to I-Chips
          (arg, cb) => {
            // Token validator
            if (!arg) return cb("Invalid I-Chips token");
            // Initiate payloads
            payLoad = {
              url: sails.config.services.ichips.playerExp + '/' + data.username,
              headers: {
                token: arg,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              qs: {
                user_type: 'MARS'
              },
              form: {
                "user_exp_method": data.method, // + or -
                "user_exp_value": data.value
              },
              json: true
            };
            // Call API
            request.post(payLoad, cb);
          }
        ], (err, result) => {
          if (err) return exits.error(err);

          console.log("<<< I-Chips player EXP updated. >>>");
          return exits.success(result);
        });
      },

      /**
       * I-Chips update chip limits
       *
       */
      updateChipLimit: () => {
        let payLoad;

        async.waterfall([
          // Getting I-Chips tokens
          (cb) => {
            CacheService.get('ICHIPS_TOKEN', cb);
          },
          // API Request to I-Chips
          (arg, cb) => {
            // Token validator
            if (!arg) return cb("Invalid I-Chips token");
            // Initiate payloads
            payLoad = {
              url: sails.config.services.ichips.chipLimit + '/' + data.username,
              headers: {
                token: arg,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              qs: {
                game_code: data.game_code,
                user_type: "MARS"
              },
              form: {
                "user_type": "MARS",
                "min": data.min,
                "max": data.max
              },
              json: true
            };
            // Call API
            request.post(payLoad, cb);
          }
        ], (err, result) => {
          let response = result.body;

          if (err)
            return exits.error(err);
          if (response.errors || response.error)
            return exits.error({errors: response.errors ? response.errors : response.error});

          console.log("<<< I-Chips player EXP updated. >>>");
          return exits.success(result);
        });
      },

      /**
       * Check token and generate new one when invalid
       */
      // checkValidityOfToken: () => {
      //   let tasks = {
      //     // Get iChips token if valid
      //     getToken: (cb) => {
      //       CacheService.get('ICHIPS_TOKEN', cb)
      //     },
      //
      //     // Check if the token is invalid
      //     verifyToken: ["getToken", (arg, cb) => {
      //
      //       // Initiate I-Chips verification request
      //       let iChips = (cb) => {
      //         // Call API
      //         request.get({
      //           url: sails.config.services.ichips.auth,
      //           headers: {
      //             token: arg.getToken || "NO_TOKEN"
      //           },
      //           json: true
      //         }, cb);
      //       };
      //
      //       // This will retry 5 times if failed verifying
      //       async.retry({ times: 5, interval: 200 }, iChips, async (err, data) => {
      //         // Catch error from validation
      //         if (err) {
      //           console.error(new Error(err));
      //           return cb("Can't connect to I-Chips 5 times, I-Chips Service maybe down or wrong URL provided.");
      //         }
      //
      //         // Validators if body sent by I-Chips is a valid JSON format
      //         if (!_.isObject(data.body)) {
      //           console.error(new Error("Wrong fetch data by I-Chips."));
      //           return cb("Wrong fetch data by I-Chips.");
      //         }
      //
      //         // Look for error response from I-Chips
      //         if (data.body.errors || data.body.error) {
      //           return cb(null, "RENEW_TOKEN");
      //         }
      //
      //         // Return token if token is valid for new processing
      //         return cb(null, arg.getToken);
      //       });
      //     }],
      //
      //     // This function checks if token needs to re-new
      //     processToken: ["verifyToken", (arg, cb) => {
      //
      //       // Check if the previous task sends a "RENEW" command
      //       if (arg.verifyToken === "RENEW_TOKEN") {
      //         let tokenIs;
      //
      //         // I-Chips Request API
      //         request.put({
      //           url: sails.config.services.ichips.auth,
      //           headers: {
      //             'Content-Type': 'application/x-www-form-urlencoded'
      //           },
      //           form: {
      //             username: sails.config.services.ichips_account.username,
      //             password: sails.config.services.ichips_account.password
      //           },
      //           json: true
      //         }, (err, data) => {
      //           // Catch error from validation
      //           if (err) {
      //             console.error(new Error(err));
      //             return cb("Can't connect to I-Chips 5 times, I-Chips Service maybe down or wrong URL provided.");
      //           }
      //
      //           // Validators if body sent by I-Chips is a valid JSON format
      //           if (!_.isObject(data.body)) {
      //             console.error(new Error("Wrong fetch data in renewing function by I-Chips."));
      //             return cb("Wrong fetch data in renewing function by I-Chips.");
      //           }
      //
      //           tokenIs = _.get(data.body, 'data.token', "NO_TOKEN");
      //
      //           // Start caching token
      //           CacheService.set('ICHIPS_TOKEN', tokenIs, -1, (err) => {
      //             if (err) return cb(err);
      //
      //             // Return token
      //             return cb(null, tokenIs);
      //           });
      //         });
      //       } else {
      //         // Token is valid
      //         return cb();
      //       }
      //     }]
      //   };
      //
      //   // Execute tasks
      //   async.auto(tasks, (err) => {
      //     if (err)
      //       return exits.error({ err });
      //     // Return success if the token is valid
      //     return exits.success("Token was valid.");
      //   });
      // }
    };

    functionGroup[method]();

    function getIChipsToken () {
      return new Promise((resolve, reject) => {
        CacheService.get('ICHIPS_TOKEN', (err, token) => {
          if (err)
            return reject(err);
          // console.log('IChips Token--', token)
          return resolve(token);
        })
      })
    }
  }
};
