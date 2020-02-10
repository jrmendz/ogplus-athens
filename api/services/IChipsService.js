module.exports = IChipsService;

function IChipsService () {
  /**
   * @memberof IChipsService
   * @function iChipsToken
   * @property {Object[]} user - User Data []
   * @param {function} callback callback function
   * @return {function}
   * @example
   * authService.iChipsToken(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'iChipsToken', {
    value: (done) => {
      Cache.get('ICHIPS_TOKEN', done);
    }
  });

  /**
   * @memberof IChipsService
   * @function getUser
   * @property {Object[]} user - User Data []
   * @param {Object} data User must provide a valid unique username
   * @param {function} callback callback function
   * @return {string[]}
   * @example
   * authService.getUser(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'getUser', {
    value: (data, done) => {
      const { username = null, gameCode = null, gameSet = null } = data;
      let tasks;

      tasks = {
        validation: (next) => {
          console.log(`|| #1 I-CHIPS[GET USER] - ${gameSet} || Validating parameter.`);
          if (!username)
            return next({error: 'Invalid Parameter [username]'});
          else if (!gameSet)
            return next({error: 'Invalid Parameter [gameSet]'});
          else
            return next();
        },

        getToken: ['validation', (arg, next) => {
          console.log(`|| #2 I-CHIPS[GET USER] - ${gameSet} || Getting I-Chips token.`);
          this.iChipsToken((err, token) => {
            if (err)
              return next({error: err});
            // Return token
            return next(null, token);
          });
        }],

        iChips: ['getToken', (arg, next) => {
          console.log(`|| #3 I-CHIPS[GET USER] - ${gameSet} || I-Chips Integration.`);

          request({
            method: 'GET',
            url: sails.config.services.ichips.user + '/' + username,
            headers: {
              token: arg.getToken,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            qs: _.assign({
                username,
                user_type: 'MARS'
              }, gameCode ? { game_code: gameCode }  : {}),
            json: true
          }, (error, response, body) => {
            if (error)
              return next({ error });

            // Check if the data receive is valid
            if (!_.isObject(body))
              return next({error: `Invalid data format. ${JSON.stringify(body)}`});

            // Check return error from iChips
            if (body.errors || body.error)
              return next({error: body.errors ? body.errors : body.error});

            // Return Data
            return next(error, _.assign({},
              _.get(body, 'data.user', {}),
              _.pick(body, 'chip_limit')
            ));
          });
        }]
      };

      // Execute tasks
      async.auto(tasks, (err, taskResults) => {
        if (err) {
          console.log(`|| #4 I-CHIPS[GET USER] - ${gameSet} || Transaction failed. ${err}`);
          return done(err);
        }

        console.log(`|| #4 I-CHIPS[GET USER] - ${gameSet} || Transaction successful.`);
        return done(err, taskResults.iChips);
      });
    }
  });

  /**
   * @memberof IChipsService
   * @function betBalance
   * @property {Object[]} user - User Data []
   * @param {Object} data User must provide a valid unique username
   * @param {function} callback callback function
   * @example
   * authService.betBalance(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'betBalance', {
    value: (data, done) => {
      const {username = '', bets = [], gameCode = null, gameSet = null} = data;
      let tasks, betToSave = [];

      tasks = {
        validation: (next) => {
          console.log(`|| #1 I-CHIPS[BET BALANCE] - ${gameSet} || Validating parameter.`);
          if (!username)
            return next({error: 'Invalid parameter [username].'});
          if (!gameSet)
            return next({error: 'Invalid parameter [gameSet].'});
          else if (_.isEmpty(bets))
            return next({error: 'Empty array [bets].'});
          else
            return next();
        },

        getToken: ['validation', (arg, next) => {
          console.log(`|| #2 I-CHIPS[BET BALANCE] - ${gameSet} || Getting I-Chips token.`);
          this.iChipsToken((err, token) => {
            if (err)
              return next({error: err});
            // Return token
            return next(null, token);
          });
        }],

        iChips: ['getToken', (arg, next) => {
          console.log(`|| #3 I-CHIPS[BET BALANCE] - ${gameSet} || Saving bets on I-Chips.`);

          // Consolidate bets
          for (let i = 0; i < bets.length; i++) {
            let bet = bets[i];
            betToSave.push({
              amount: parseFloat(bet.bet_amount),
              game_code: gameCode,
              betting_code: 'BET_' + bet.bet_code
            });
          }

          request({
            method: 'POST',
            url: sails.config.services.ichips.bet + '/' + username,
            headers: {
              token: arg.getToken || '',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            qs: {
              username,
              user_type: 'MARS'
            },
            form: {
              data: betToSave
            },
            json: true
          }, (error, response, body) => {
            if (error)
              return next({ error });

            // Check if the data receive is valid
            if (!_.isObject(body))
              return next({error: `Invalid data format. ${JSON.stringify(body)}`});

            // Check return error from iChips
            if (body.errors || body.error)
              return next({error: body.errors ? body.errors : body.error});

            // Return Data
            console.log(`|| #3.1 I-CHIPS[BET BALANCE] - ${gameSet} || Total of ${betToSave.length} bet(s) saved.`);
            return next(null, {balance: _.get(body, 'data.current_balance', '0.00000')});
          });
        }]
      };

      // Execute tasks
      async.auto(tasks, (err, taskResults) => {
        if (err) {
          console.log(`|| #4 I-CHIPS[BET BALANCE] - ${gameSet} || Transaction failed. ${err}`);
          return done(err);
        }

        console.log(`|| #4 I-CHIPS[BET BALANCE] - ${gameSet} || Transaction successful.`);
        return done(err, taskResults.iChips);
      });
    }
  });

  /**
   * @memberof IChipsService
   * @function betBalance
   * @property {Object[]} user - User Data []
   * @param {Object} data User must provide a valid unique username
   * @param {function} callback callback function
   * @example
   * authService.betBalance(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'transactions', {
    value: (data, done) => {
      const {
        username = '',
        userType = 'MARS',
        start = 1,
        length = 25,
        startDate = null,
        endDate = null,
        tableNumber = null,
        shoeNumber = null,
        gameCode = [],
        orderBy = 'created_at',
        orderSort = 'DESC'
      } = data;

      let tasks = {
        validation: (next) => {
          console.log(`|| #1 I-CHIPS[HISTORY] - ${username} || Validating parameter.`);
          if (!username)
            return next({error: 'Invalid parameter [username].'});
          else if (!userType)
            return next({error: 'Invalid parameter [userType].'});
          else if (!start)
            return next({error: 'Invalid parameter [start].'});
          else if (!length)
            return next({error: 'Invalid parameter [length].'});
          else if (!startDate)
            return next({error: 'Invalid parameter [startDate].'});
          else if (!endDate)
            return next({error: 'Invalid parameter [endDate].'});
          else if (_.isEmpty(gameCode))
            return next({error: 'Invalid parameter [gameCode].'});
          else if (!orderBy)
            return next({error: 'Invalid parameter [orderBy].'});
          else if (!orderSort)
            return next({error: 'Invalid parameter [orderSort].'});
          else
            return next();
        },

        getToken: ['validation', (arg, next) => {
          console.log(`|| #2 I-CHIPS[HISTORY] - ${username} || Getting I-Chips token.`);
          this.iChipsToken((err, token) => {
            if (err)
              return next({error: err});
            // Return token
            return next(null, token);
          });
        }],

        iChips: ['getToken', (arg, next) => {
          console.log(`|| #3 I-CHIPS[HISTORY] - ${username} || Pulling transaction.`);
          const payload = {
            method: 'GET',
            url: sails.config.services.ichips.transactions + '/' + username,
            headers: {
              token: arg.getToken || '',
              'Content-Type': 'application/json'
            },
            qs: {
              username,
              user_type: userType,
              start,
              length,
              start_date: startDate,
              end_date: endDate,
              games: gameCode,
              order_by: orderBy,
              order_sort: orderSort
            },
            json: true
          };

          // Optional fields for querying
          if (tableNumber)
            _.assign(payload.qs, { table_number: tableNumber });
          if (shoeNumber)
            _.assign(payload.qs, { shoe_hand_number: shoeNumber });

          // Request API request
          request(payload, (error, response, body) => {
            if (error)
              return next({ error });

            // Check if the data receive is valid
            if (!_.isObject(body))
              return next({error: `Invalid data format. ${JSON.stringify(body)}`});

            // Check return error from iChips
            if (body.errors || body.error)
              return next({error: body.errors ? body.errors : body.error});

            // Return Data
            return next(null, _.pick(body, ['count_records', 'count_results', 'data']));
          });
        }]
      };

      // Execute tasks
      async.auto(tasks, (err, taskResults) => {
        if (err) {
          console.log(`|| #4 I-CHIPS[HISTORY] - ${username} || Transaction failed. ${JSON.stringify(err)}`);
          return done(err);
        }

        console.log(`|| #4 I-CHIPS[HISTORY] - ${username} || Transaction successful.`);
        return done(err, taskResults.iChips);
      });
    }
  });

  /**
   * @memberof IChipsService
   * @function transferValidation
   * @property {Object[]} user - User Data []
   * @param {Object} data User must provide a valid unique username
   * @param {function} callback callback function
   * @example
   * authService.transferValidation(data, (err, resuslt) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'transferValidation', {
    value: (data, done) => {
      const {
        id = null,
        type = null,
        amount = null,
        userType = 'MARS',
        userName = null
      } = data;

      console.log(`|| I-CHIPS[TRANSFER VALIDATION] - ${userType} - ${userName} || ${JSON.stringify({ id, type, amount, userType, userName })}`);

      let tasks = {
        validation: (next) => {
          console.log(`|| #1 I-CHIPS[TRANSFER VALIDATION] - ${userType} - ${userName} || Validating parameter.`);
          if (!id)
            return next({error: 'Invalid parameter [id].'});
          else if (!type)
            return next({error: 'Invalid parameter [type].'});
          else if (!amount)
            return next({error: 'Invalid parameter [amount].'});
          else if (!userType)
            return next({error: 'Invalid parameter [userType].'});
          else if (!userName)
            return next({error: 'Invalid parameter [userName].'});
          else
            return next();
        },

        getToken: ['validation', (arg, next) => {
          console.log(`|| #2 I-CHIPS[TRANSFER VALIDATION] - ${userType} - ${userName} || Getting I-Chips token.`);
          this.iChipsToken((err, token) => {
            if (err)
              return next({error: err});
            // Return token
            return next(null, token);
          });
        }],

        iChips: ['getToken', (arg, next) => {
          console.log(`|| #3 I-CHIPS[TRANSFER VALIDATION] - ${userType} - ${userName} || Pulling transaction.`);
          const payload = {
            method: 'POST',
            url: `${sails.config.services.ichips.transferValidation}/${userName}`,
            headers: {
              token: arg.getToken || '',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            qs: {
              user_type: userType,
              transfer_id: id,
              transfer_type: type,
              transfer_amount: amount
            },
            json: true
          };

          // Request API request
          request(payload, (error, response, body) => {
            if (error)
              return next({ error });

            // Check if the data receive is valid
            if (!_.isObject(body))
              return next({error: `Invalid data format. ${JSON.stringify(body)}`});

            // Check return error from iChips
            if (body.errors || body.error)
              return next({error: body.errors ? body.errors : body.error});

            // Return Data
            return next(null, 'VALIDATED');
          });
        }]
      };

      // Execute tasks
      async.auto(tasks, (err, taskResults) => {
        if (err) {
          console.log(`|| #4 I-CHIPS[TRANSFER VALIDATION] - ${userType} - ${userName} || FAILED :( ${JSON.stringify(err)}`);
          return done(err);
        }

        console.log(`|| #4 I-CHIPS[TRANSFER VALIDATION] - ${userType} - ${userName} || SUCCESS :)`);
        return done(err, taskResults.iChips);
      });
    }
  });





  /**
   * @memberof IChipsService
   * @function getBalance
   * @property {Object[]} user - User Data []
   * @param {Object} data User must provide a valid unique username
   * @param {function} callback callback function
   * @example
   * authService.getBalance(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'getBalance', {
    value: (data, cb) => {
      let tasks;

      if (!data.username) {
        return cb('[iChips-checkUser] Invalid parameter [username]');
      }

      tasks = {
        getToken: (cb) => {
          this.iChipsToken(cb);
        },
        iChips: ['getToken', (arg, cb) => {
          request({
            method: 'GET',
            url: sails.config.services.iChips.balance + '/' + data.username,
            headers: {
              token: arg.getToken || '',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            qs: {
              user_type: 'MARS'
            },
            json: true
          }, (error, response, body) => {
            if (error) {
              return cb({status: 'Something wrong while connecting to iChips Server.', code: error.code});
            }
            // Check if the data receive is valid
            if (!_.isObject(body)) {
              return cb({status: 'iChips Server is online but return unexpected data format.'});
            }
            // Check return error from iChips
            if (body.errors || body.error) {
              return cb({errors: body.errors ? body.errors : body.error});
            }

            // Return Data
            return cb(null, {balance: _.get(body, 'data.balance', '0.0000')});
          });
        }]
      };

      // Execute tasks
      async.auto(tasks, cb);
    }
  });

  /**
   * @memberof IChipsService
   * @function createUser
   * @property {Object[]} user - User Data []
   * @param {Object} data User must provide a valid unique username
   * @param {function} callback callback function
   * @example
   * authService.createUser(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'createUser', {
    value: (data, cb) => {
      let tasks;

      if (!data.username) {
        return cb('[iChips-checkUser] Invalid parameter [username]');
      }

      tasks = {
        getToken: (cb) => {
          this.iChipsToken(cb);
        },
        iChips: ['getToken', (arg, cb) => {
          request({
            method: 'POST',
            url: sails.config.services.iChips.user,
            headers: {
              token: arg.getToken || '',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            qs: {
              user_type: _.get(data, 'userType', 'MARS') || 'MARS'
            },
            form: {
              username: data.username,
              nickname: _.get(data, 'nickname', data.username) || data.username,
              user_type: _.get(data, 'userType', 'MARS') || 'MARS',
              currency: _.get(data, 'currency', 'CNY') || 'CNY',
              status: _.get(data, 'status', 'ENABLED') || 'ENABLED'
            },
            json: true
          }, (error, response, body) => {
            if (error) {
              return cb({status: 'Something wrong while connecting to iChips Server.', code: error.code});
            }

            // Check if the data receive is valid
            if (!_.isObject(body)) {
              return cb({status: 'iChips Server is online but return unexpected data format.'});
            }
            // Check return error from iChips
            if (body.errors || body.error) {
              return cb({errors: body.errors ? body.errors : body.error});
            }
            // Return Data
            return cb(null, {data: _.get(body, 'data', {})});
          });
        }]
      };

      // Execute tasks
      async.auto(tasks, cb);
    }
  });

  /**
   * @memberof IChipsService
   * @function payoutBalance
   * @property {Object[]} user - User Data []
   * @param {Object} data User must provide a valid unique username
   * @param {function} callback callback function
   * @example
   * authService.payoutBalance(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'payoutBalance', {
    value: (data, cb) => {
      let tasks;
      let user = {};
      let payouts = {};

      /*
        EXPECTED `payout` object format
        payouts = {
          'si_alvin': {
            game_code: 'baccarat',
            user_id: 3,
            data: [ {
              betting_code: 'PAYOUT_12300000000008888',
              game_code: 'baccarat',
              amount: 0
            }]
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

      // Consolidate bets
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


      tasks = {
        // Get iChips token
        getToken: (cb) => {
          this.iChipsToken(cb);
        },
        // Process iChips request
        iChips: ['getToken', (arg, cb) => {

          async.forEachOf(payouts, (value, username, cb) => {

            request({
              url: sails.config.services.iChips.payout + '/' + username,
              headers: {
                token: arg.getToken || '',
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
            }, (error, response, body) => {
              if (error) {
                return cb({status: 'Something wrong while connecting to iChips Server.', code: error.code});
              }

              // Check if the data receive is valid
              if (!_.isObject(body)) {
                return cb({status: 'iChips Server is online but return unexpected data format.'});
              }

              // Check return error from iChips
              if (body.errors || body.error) {
                return cb({errors: body.errors ? body.message : body.message});
              }

              if (!_.has(user, payouts[username].user_id)) {
                _.assign(user, { [payouts[username].user_id]: { balance: 0 } })
              }

              console.info("\033[32m[" + username + "][ICHIPS] Current Balance:" + _.get(body, 'data.current_balance', '0.00000') + "]\033[0m")
              user[payouts[username].user_id] = _.get(body, 'data.current_balance', '0.00000');

              // Return Data
              return cb();
            });
          }, cb);
        }]
      };

      // Execute tasks
      async.auto(tasks, cb);
    }
  });

  /**
   * @memberof IChipsService
   * @function insertTransaction
   * @property {Object[]} user - User Data []
   * @param {Object} data User must provide a valid unique username
   * @param {function} callback callback function
   * @example
   * authService.insertTransaction(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'insertTransaction', {
    value: (params, done) => {
      const { bet, gameCode } = params;
      let tasks;

      if (!gameCode) {
        return done('[iChips-insertTransaction] `gameType` is invalid.');
      }

      tasks = {
        // Get iChips token
        getToken: (next) => {
          console.log('I-Chips (1/2): Insert Transaction');
          this.iChipsToken(next);
        },

        // Process iChips request
        iChips: ['getToken', (arg, next) => {
          console.log('I-Chips (2/2): Insert Transaction');
          request.post({
            url: sails.config.services.ichips.transaction + '/' + bet.username,
            headers: {
              token: arg.getToken || '',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            qs: {
              username: bet.username,
              user_type: 'MARS',
              game_code: gameCode
            },
            form: {
              'bet_code'             : bet.bet_code,
              'betting_code_bet'     : bet.betting_code_bet,
              'betting_code_payout'  : bet.betting_code_payout,
              'game_type'            : bet.game_type,
              'game_id'              : bet.game_id,
              'gamename'             : bet.game_name,
              'room_id'              : bet.room_id,
              'room_number'          : bet.room_number,
              'result_id'            : bet.result_id,
              'user_id'              : bet.user_id,
              'result'               : JSONStringify(bet.result),
              'bet_amount'           : bet.bet_amount,
              'effective_bet_amount' : bet.effective_bet_amount,
              'win_loss'             : bet.win_loss,
              'balance_after_bet'    : bet.balance_after_bet,
              'status'               : bet.status,
              'bet_date'             : moment(bet.bet_date).utc().format('YYYY-MM-DD HH:mm:ss'),
              'transaction_status'   : bet.transaction_status,
              'transaction_reason'   : bet.transaction_reason,
              'second_order_time'    : bet.second_order_time,
              'copy_time'            : bet.copy_time,
              'remark'               : bet.remark
            },
            json: true
          }, (error, response, body) => {
            if (error) {
              return next({status: 'Something wrong while connecting to iChips Server.', code: 500});
            }
            // Check if the data receive is valid
            if (!_.isObject(body)) {
              return next({status: 'iChips Server is online but return unexpected data format.', code: 500});
            }
            // Check return error from iChips
            if (body.errors || body.error) {
              return next({meta: body.errors || body.error, code: 400});
            }

            return next();
          });
        }]
      };

      // Execute tasks
      async.auto(tasks, done);
    }
  });

  /**
   * @memberof IChipsService
   * @function insertGameResult
   * @property {Object} user - User Data {}
   * @param {Object} data User must provide a valid unique username
   * @param {function} callback callback function
   * @example
   * authService.insertGameResult(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'insertGameResult', {
    value: (params, cb) => {
      const { result, resultId, shoeNumber, tableNumber, shoeDate, gameResult } = params.data;
      const gameType = params.game_code;
      let tasks;

      if (!gameType) {
        return cb('[iChips-insertTransaction] Invalid parameter [game_type]');
      }

      tasks = {
        // Get iChips token
        getToken: (cb) => {
          this.iChipsToken(cb);
        },
        // Process iChips request
        iChips: ['getToken', (arg, cb) => {

          request.post({
            url: sails.config.services.ichips.gameresult + '?game_code=' + gameType,
            headers: {
              token: arg.getToken,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
              'result': result,
              'result_id': resultId.toString(),
              'shoehandnumber': shoeNumber,
              'shoe_date': shoeDate,
              'table_no': tableNumber,
              'values': gameResult
            },
            json: true
          }, (error, response, body) => {
            if (error) {
              return cb({status: 'Something wrong while connecting to iChips Server.', code: error.code});
            }
            // Check if the data receive is valid
            if (!_.isObject(body)) {
              return cb({status: 'iChips Server is online but return unexpected data format.'});
            }
            // Check return error from iChips
            if (body.errors || body.error) {
              return cb({errors: body.errors || body.message || body.error });
            }
            return cb();
          });
        }]
      };

      // Execute tasks
      async.auto(tasks, cb);
    }
  });



}
