/**
 * @class OperatorService
 * @description Operator Services
 * @author Alvin Phoebe Artemis Valdez
 * @return {void}
 * @example
 * const operatorService = new OperatorService()
 */

function GameConfigService () {
  const iChips = new IChipsService();
  /**
   * @memberof OperatorService
   * @function insert_transaction
   * @description 通比牛牛
   * @property {Object} Game Information
   * @param {Object} data Custom data for configuration
   * @param {function} done Callback function
   * @return {string[]}
   * @example
   * operatorService.insert_transaction(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'insert_transaction', {
    value: (data, done) => {
      const { data: bets, game_code: gameCode } = data;
      const query = 'INSERT INTO t_betdetails (`bet_amount`, `bet_code`, `user_id`, `betplace_id`, `shoehand_id`, `gameset_id`, `table_id`, `balance`, `bet_date`, `super_six`, `is_emcee`) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);';
      let tasks;

      // Validator
      if (_.isEmpty(bets))
        return done({ err: 400, status: 'Bets are empty.'});
      if (!gameCode)
        return done({ err: 400, status: 'Parameter `game_type` is invalid.'});

      async.forEachOf(bets, (bet, i, next) => {
        // Task List
        tasks = {
          toOGRecord: (next) => {
            console.log('insert_transaction (1/2)');
            // Saving records
            sails.sendNativeQuery(query, [
              bet.bet_amount,         // bet_amount
              bet.bet_code,           // bet_code
              bet.user_id,            // user_id
              null,                   // betplace_id
              null,                   // shoehand_id,
              null,                   // gameset_id
              bet.room_id,            // table_id
              bet.balance_after_bet,  // balance
              bet.bet_date,           // bet_date
              0,                      // super_six
              0                       // is_emcee
            ], next);
          },
          toIChipsRecord: ['toOGRecord', (arg, next) => {
            console.log('insert_transaction (2/2)');
            iChips.insertTransaction({
              bet: {
                bet_code             : bet.bet_code,
                betting_code_bet     : bet.betting_code_bet,
                betting_code_payout  : bet.betting_code_payout,
                game_type            : bet.game_type,
                game_id              : bet.game_id,
                gamename             : bet.game_name,
                room_id              : bet.room_id,
                room_number          : bet.room_number,
                result_id            : bet.result_id,
                user_id              : bet.user_id,
                result               : JSONStringify(bet.result),
                bet_amount           : bet.bet_amount,
                effective_bet_amount : bet.effective_bet_amount,
                win_loss             : bet.win_loss,
                balance_after_bet    : bet.balance_after_bet,
                status               : bet.status,
                bet_date             : moment(bet.bet_date).utc().format('YYYY-MM-DD HH:mm:ss'),
                transaction_status   : bet.transaction_status,
                transaction_reason   : bet.transaction_reason,
                second_order_time    : bet.second_order_time,
                copy_time            : bet.copy_time,
                remark               : bet.remark
              },
              gameCode
            }, next);
          }]
        };

        // Execute tasks
        async.auto(tasks, next);

      }, (err) => {
        if (err) {
          return done({
            err: err.code || 500,
            status: 'Bets record insertion failed.',
            meta: err.meta
          });
        }

        return done(null, {
          err: null,
          status: 'Bets record insertion success.'
        });
      });
    }
  });

  /**
   * @memberof OperatorService
   * @function tw_3cards
   * @description 炸金花
   * @property {Object} Game Information
   * @param {Object} data Custom data for configuration
   * @param {function} done Callback function
   * @return {string[]}
   * @example
   * operatorService.tw_3cards(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'game_results', {
    value: (data, done) => {
      const { FirstOrder: winner, Players: players } = data;

      const tasks = {
        toOGRecord: (next) => {

        },
        toIChipsRecord: ['toOGRecords', (arg, next) => {

        }]
      };

      async.auto(tasks, (err, taskResults) => {
        if (err) {
          return done(err)
        }

        return done();
      });
    }
  });

  /**
   * @memberof OperatorService
   * @function tw_landlord
   * @description 鬥地主
   * @property {Object} Game Information
   * @param {Object} data Custom data for configuration
   * @param {function} done Callback function
   * @return {string[]}
   * @example
   * operatorService.tw_landlord(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'game_values', {
    value: (data, done) => {
      const { CommunityCard: winningCards, Bidding: winner, Player: players } = data;

      const tasks = {
        toOGRecord: (next) => {

        },
        toIChipsRecord: ['toOGRecords', (arg, next) => {

        }]
      };

      async.auto(tasks, (err, taskResults) => {
        if (err) {
          return done(err)
        }

        return done();
      });
    }
  });

  /**
   * @memberof OperatorService
   * @function save_tw_bets
   * @description 通比牛牛
   * @property {Object} Game Information
   * @param {Object} data Array of bets
   * @param {function} done Callback function
   * @return {string[]}
   * @example
   * operatorService.save_tw_bets(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'save_tw_bets', {
    value: (data, done) => {

      // Query for inserting bet details data to DB
      let query = `
        INSERT INTO
          \`t_tw_transaction\` (
            \`platform_code\`,
            \`bet_code\`,
            \`betting_code_bet\`,
            \`game_type\`,
            \`game_id\`,
            \`room_id\`,
            \`room_number\`,
            \`user_id\`,
            \`user_name\`,
            \`error_status\`,
            \`withhold\`,
            \`bet_amount\`,
            \`balance_after_bet\`,
            \`status\`,
            \`bet_date\`,
            \`bet_device\`,
            \`bet_browser\`,
            \`create_at\`,
            \`update_at\`,
            \`copy_time\`,
            \`remark\`,
            \`second_order_time\`
          )
        VALUES
          ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22 )
        ;
      `;
      
      // Insert bets to DB
      async.forEachOf(data, (bet, i, done) => {
        sails.sendNativeQuery(query, [
          bet.platform_code,
          bet.bet_code,
          bet.betting_code_bet,
          bet.game_type,
          bet.game_id,
          bet.room_id,
          bet.room_number,
          bet.user_id,
          bet.user_name,
          bet.error_status,
          bet.withhold,
          bet.bet_amount,
          bet.balance_after_bet,
          bet.status,
          bet.bet_date,
          bet.bet_device,
          bet.bet_browser,
          bet.create_at,
          bet.update_at,
          bet.copy_time,
          bet.remark,
          bet.second_order_time
        ], (err, result) => {
          if (err) {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return done(err);
          }
          return done()
        })
      }, done);
    }
  });

  /**
   * @memberof OperatorService
   * @function save_tw_payouts
   * @description 通比牛牛
   * @property {Object} Game Information
   * @param {Object} data Array of payouts
   * @param {function} done Callback function
   * @return {string[]}
   * @example
   * operatorService.save_tw_payouts(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'save_tw_payouts', {
    value: (data, done) => {

      // Query for updating payout details
      let query = `
        UPDATE
          \`t_tw_transaction\`
        SET
          \`betting_code_payout\`  = $1,
          \`result_id\`            = $2,
          \`result\`               = $3,
          \`effective_bet_amount\` = $4,
          \`win_loss\`             = $5,
          \`balance_after_bet\`    = $6
        WHERE
          \`betting_code_bet\`     = $7
        AND
          \`user_id\`              = $8
        ;
      `;
      
      // Updates payouts data from DB
      async.forEachOf(data, (payout, i, done) => {
        sails.sendNativeQuery(query, [
          payout.betting_code_payout,
          payout.result_id,
          payout.result,
          payout.effective_bet_amount,
          payout.win_loss,
          payout.balance_after_bet,
          payout.betting_code_bet,
          payout.user_id
        ], (err, result) => {
          if (err) {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return done(err);
          }
          return done()
        })
      }, done);
    }
  });

    /**
   * @memberof OperatorService
   * @function get_tw_balance
   * @description 通比牛牛
   * @property {Object} Game Information
   * @param {Object} data Array of payouts
   * @param {function} done Callback function
   * @return {string[]}
   * @example
   * operatorService.get_tw_balance(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'get_tw_balance', {
    value: (data, done) => {
      if (_.isUndefined(data)) done();

      const { t_type, params } = data,
            betting_code = `betting_code_${ t_type }`;

      // Query for getting users balances
      let query = `
        SELECT
          \`user_name\`,
          \`balance_after_bet\`
        FROM
          \`t_tw_transaction\`
        WHERE
          \`${ betting_code }\` IN ($1)
        AND
          \`user_id\` IN ($2)  
      `;
      
      // Returns User Balances from DB
      sails.sendNativeQuery(query, [
        params.map(t => t[betting_code]),
        params.map(t => t.user_id)
      ], (err, result) => {
        if (err) {
          console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
          return done(err);
        }
        return done( null, result.rows.map(t => ({ username: t.user_name, balance: t.balance_after_bet })) )
      });
    }
  });

  /**
   * @memberof OperatorService
   * @function save_tw_table_games
   * @description 通比牛牛
   * @property {Object} Game Information
   * @param {Object} data Array of table games
   * @param {function} done Callback function
   * @return {string[]}
   * @example
   * operatorService.save_tw_table_games(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'save_tw_table_games', {
    value: (data, done) => {

      // Query for creating table games
      let query = `
        INSERT INTO
          \`t_tw_game_values\` (
            \`platform_code\`,
            \`game_type\`,
            \`game_id\`,
            \`room_id\`,
            \`room_number\`,
            \`result_id\`,
            \`ante\`,
            \`balance_limit\`,
            \`game_result\`,
            \`status\`,
            \`start_date\`,
            \`settle_date\`,
            \`close_date\`,
            \`copy_order_time\`
          )
        VALUES
          ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14 )
        ;
      `;
      
      // Saves table games to DB
      async.forEachOf(data, (gvalue, i, done) => {
        sails.sendNativeQuery(query, [
          gvalue.platform_code,
          gvalue.game_type,
          gvalue.game_id,
          gvalue.room_id,
          gvalue.room_number,
          gvalue.result_id,
          gvalue.ante,
          gvalue.balance_limit,
          gvalue.game_result,
          gvalue.status,
          gvalue.start_date,
          gvalue.settle_date,
          gvalue.close_date,
          gvalue.copy_order_time
        ], (err, result) => {
          if (err) {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return done(err);
          }
          return done()
        })
      }, done);
    }
  });
}

module.exports = GameConfigService;
