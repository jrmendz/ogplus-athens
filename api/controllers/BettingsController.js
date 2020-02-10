/**
 * BettingsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ICHIPS = new IChipsService();
const ENV = sails.config;

module.exports = {

  getBetPlaceById: function (req, res) {
    if (req.isSocket) {
      var params = req.body
    } else {
      var params = req.query
    }
    const id = params.id ? params.id : 0
    const reqip = req.headers["x-forwarded-for"] || req.ip;
    const tasks = {
      verifyToken: async function (cb) {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, {request: req, id: token.id});
          })
          .catch((err) => {
            return cb(err)
          });
      },
      proceed: ["verifyToken", function (next, results) {
        Bettings.findOne({id: id}).exec(function (err, result) {
          if (err) { sails.log.error(err) }
          return next(null, true)
        })
      }]
    };

    async.auto(tasks, (err, results) => {
      if (err)
        return res.badRequest({message: "Invalid token."});
      return res.ok({code: 200, message: 'Successfull', data: result})
    });
  },

  /**
   * Confirm bets
   * @route /POST /bettings/transaction/confirm
   * @param req
   * @param res
   * @returns {Promise<never>}
   */
  confirm: function (req, res) {
    let {
      token = null,
      bettings: bets = [],
      gameset: gameSet = null,
      tableid: tableId = null,
      super_six: isSuperSix = 0,
      is_sidebet: isSideBet = 0,
      is_emcee: isEmcee = 0
    } = req.body;

    let bettingDetails = [];
    let playerName = '';
    let totalBetAmount = 0, tableInfo = {}, tasks;
    let returnData = {
      game: "",
      gameCode: "",
      tableid: null,
      tableNumber: "",
      balance: 0,
      highestBidders: {},
      bet_percentages: {},
      totalUsersAndBettings: [],
      betRankData: {}
    };

    // Authorized sails socket connection only
    if (!req.isSocket)
      return res.badRequest({ status: 401, message: "Protocol not authorized." });

    // Required parameter validators
    if (!token)
      return res.badRequest({ status: 400, message: "Invalid Parameter: [token]" });
    else if (!bets)
      return res.badRequest({ status: 400, message: "Invalid Parameter: [bettings]" });
    else if (!gameSet)
      return res.badRequest({ status: 400, message: "Invalid Parameter: [gameset]" });
    else if (!tableId)
      return res.badRequest({ status: 400, message: "Invalid Parameter: [tableid]" });

    // Pre-setting variables
    isSuperSix = !isSuperSix ? 0 : isSuperSix;
    isSideBet = !isSideBet ? 0 : isSideBet;
    isEmcee = !isEmcee ? 0 : isEmcee;
    tableInfo = _.get(tables, `[${tableSerializer.idToNumber[tableId]}]`, {});

    // Custom validators
    if (!_.isArray(bets))
      return res.badRequest({ status: 400, message: `Parameter [bettings] expected to be an array but receives ${typeof bets}.`});
    else if (_.isEmpty(tableInfo))
      return res.badRequest({ status: 400, message: `Table information is missing.`});


    _.map(bets, (bet) => {
      if (tableInfo.gameCode === "niuniu") {
        if      (_.includes(bet.index, "double")) bet.chipValue *= 5;
        else if (_.includes(bet.index, "many"))   bet.chipValue *= 11;
      }
    });

    totalBetAmount = _.sumBy(bets, 'chipValue');

    tasks = {
      /*
                          _   __          _____        _
       /\   /\ ___  _ __ (_) / _| _   _  /__   \ ___  | | __ ___  _ __
       \ \ / // _ \| '__|| || |_ | | | |   / /\// _ \ | |/ // _ \| '_ \
        \ V /|  __/| |   | ||  _|| |_| |  / /  | (_) ||   <|  __/| | | |
         \_/  \___||_|   |_||_|   \__, |  \/    \___/ |_|\_\\___||_| |_|
                                  |___/
       */
      verifyToken: (cb) => {
        console.log(`| #1 BETTING - ${gameSet} | : VERIFY TOKEN.`);
        JwtService.valid(token)
          .catch((err) => {
            console.log(`| #1.1 BETTING - ${gameSet} | : Token verification failed. ${token}`);
            return cb(err)
          })
          .then((userInfo) => {
            console.log(`| #1.1 BETTING - ${gameSet} | : Token verification successful. ${token}`);
            playerName = _.get(userInfo, 'username', '[INVALID NAME]');
            return cb(null, userInfo);
          });
      },

      /*
       _   _                    _   _         _  _      _         _    _
      | | | |                  | | | |       | |(_)    | |       | |  (_)
      | | | | ___   ___  _ __  | | | |  __ _ | | _   __| |  __ _ | |_  _   ___   _ __
      | | | |/ __| / _ \| '__| | | | | / _` || || | / _` | / _` || __|| | / _ \ | '_ \
      | |_| |\__ \|  __/| |    \ \_/ /| (_| || || || (_| || (_| || |_ | || (_) || | | |
       \___/ |___/ \___||_|     \___/  \__,_||_||_| \__,_| \__,_| \__||_| \___/ |_| |_|

       */
      getUser: ["verifyToken", (arg, next) => {
        console.log(`| #2 BETTING - ${gameSet} - ${playerName} | : GETTING USER BALANCE FROM I-CHIPS.`);

        // Call IChips Service
        ICHIPS.getUser({
          username: _.get(arg.verifyToken,`username`,''),
          gameCode: _.get(tableInfo,`gameCode`,null),
          gameSet
        }, (err, data) => {
          if (err) {
            console.log(`| #2.1 BETTING - ${gameSet} - ${playerName} | : Balance not pulled due to error. ${JSON.stringify(err)}`);
            return next('Something wrong with server. Contact your local provider.')
          }

          console.log(`| #2.1 BETTING - ${gameSet} - ${playerName} | : User data is ${JSON.stringify(data)}.`);
          return next(null, data);
        })
      }],

      /*
         _____  _                  _      _____       _      _         _____  _          _
        /  __ \| |                | |    |_   _|     | |    | |       /  ___|| |        | |
        | /  \/| |__    ___   ___ | | __   | |  __ _ | |__  | |  ___  \ `--. | |_  __ _ | |_  _   _  ___
        | |    | '_ \  / _ \ / __|| |/ /   | | / _` || '_ \ | | / _ \  `--. \| __|/ _` || __|| | | |/ __|
        | \__/\| | | ||  __/| (__ |   <    | || (_| || |_) || ||  __/ /\__/ /| |_| (_| || |_ | |_| |\__ \
         \____/|_| |_| \___| \___||_|\_\   \_/ \__,_||_.__/ |_| \___| \____/  \__|\__,_| \__| \__,_||___/

      */
      checkTableStatus: ["getUser", "verifyToken", (arg, cb) => {
        console.log(`| #3 BETTING - ${gameSet} - ${playerName} | : TABLE STATUS.`);

        // Betting Flag
        if (!tableInfo.isBetting) {
          console.log(`| #3.1 BETTING - ${gameSet} - ${playerName} | : Betting Ends on table ID ${tableId}.`);
          return cb("Betting Ends.");
        }

        if (tableInfo.gameSet !== gameSet) {
          console.log(`| #3.1 BETTING - ${gameSet} - ${playerName} | : GameSet Mismatch. [${tableInfo.gameSet} (TABLE) <===> ${gameSet} (PLAYER)]`);
          return cb("GameSet mismatch.");
        }

        // Rollback bets if status of table is dealing and default
        if (_.includes(['dealing', 'default'], tableInfo.status)) {
          console.log(`| #3.1 BETTING - ${gameSet} - ${playerName} | : Betting Ends on table ID ${tableId}.`);
          return cb("Betting Ends.");
        }

        /**
         THIS IS USED TO TEST BETTING THROTTLING
         */
        if (process.env.NODE_ENV !== 'production') {
          if (flag.betting.throttle) {
            console.log("\033[30m\033[46m", "THROTTLE ACTIVATED", flag.betting.seconds, "second(s)\033[0m");
            setTimeout(() => {
              return cb();
            }, 1000 * flag.betting.seconds)
          } else {
            return cb()
          }
        } else {
          console.log(`| #3.1 BETTING - ${gameSet} - ${playerName} | : Betting status is verified.`);
          return cb()
        }
      }],


      /*
         __                        ___        _
        / _\  __ _ __   __ ___    / __\  ___ | |_  ___
        \ \  / _` |\ \ / // _ \  /__\// / _ \| __|/ __|
        _\ \| (_| | \ V /|  __/ / \/  \|  __/| |_ \__ \
        \__/ \__,_|  \_/  \___| \_____/ \___| \__||___/
        Save bets on Panda-Athens
       */
      saveBets: ["getUser", "checkTableStatus", "verifyToken", (arg, next) => {
        console.log(`| #4 BETTING - ${gameSet} - ${playerName} | : SAVING BET ON DATABASE.`);
        const { min: minBet, max:maxBet, balance } = arg.getUser;

        // Remove invalid index
        _.remove(bets, (bet) => { return !bet.index });

        // Check if the balance is sufficient
        if (balance < totalBetAmount) {
          console.log(`| #4.1 BETTING - ${gameSet} - ${playerName} | : Insufficient Balance.`);
          return next("Insufficient Balance!");
        }

        async.forEachOf(bets, (bet, i, cb) => {
          let query = "CALL BETS_SAVE($1, $2, $3, $4, $5, $6, $7, $8);";
          let queryData = [ bet.chipValue, totalBetAmount, arg.verifyToken.id, bet.index, gameSet, tableId, isSuperSix, isEmcee ];

          // Check if the chipValue is below minimum bet
          if (bet.chipValue < minBet) {
            console.log(`| #4.1p BETTING - ${gameSet} - ${playerName} | : Bet is below minimum of ${minBet}. Bet skipped saving.`);
            return cb();
          }

          // Check if the chipValue is above maximum bet
          else if (bet.chipValue > maxBet) {
            console.log(`| #4.1p BETTING - ${gameSet} - ${playerName} | : Bet is above maximum of ${maxBet}. Bet skipped saving.`);
            return cb();
          }

          // Execute SQL query
          else {
            sails
              .sendNativeQuery(query, queryData, (err, bet) => {
                if (err) {
                  return cb(err);
                }

                // Check if the return value is not empty then push to `bettingDetails` array
                if (!_.isEmpty(bet.rows[1]) && _.isArray(bet.rows[1])) {
                  bettingDetails.push(bet.rows[1][0]);
                } else {
                  console.log(`| #4.1p BETTING - ${gameSet} - ${playerName} | : Betting may not be saved.`);
                  console.log(`| #4.1p BETTING - ${gameSet} - ${playerName} | : Affected Data ${JSON.stringify(queryData)}.`);
                }
                // Return when successfully executed
                return cb();
              });
          }
        }, (err) => {
          if (err) {
            console.log(`| #4.1 BETTING - ${gameSet} - ${playerName} | : Some bet may not be saved.`);
            return next(err)
          }

          // Rollback bets if game set upon saving mismatched
          if (tableInfo.gameSet !== gameSet) {
            console.log(`| #4.1 BETTING - ${gameSet} - ${playerName} | : GameSet Mismatch. [${tableInfo.gameSet} (TABLE) <===> ${gameSet} (PLAYER)]`);
            return next("Betting End");
          }

          // Rollback bets if status of table is dealing and default
          if (_.includes(['dealing', 'default'], tableInfo.status)) {
            console.log(`| #4.1 BETTING - ${gameSet} - ${playerName} | : Betting Ends on table ID ${tableId}.`);
            return next("Betting End");
          }

          console.log(`| #4.1 BETTING - ${gameSet} - ${playerName} | : Bet saved successfully.`);
          return next();
        });
      }],

      /*
       __  _          _    _       _    _
      / _\| |_  __ _ | |_ (_) ___ | |_ (_)  ___  ___
      \ \ | __|/ _` || __|| |/ __|| __|| | / __|/ __|
      _\ \| |_| (_| || |_ | |\__ \| |_ | || (__ \__ \
      \__/ \__|\__,_| \__||_||___/ \__||_| \___||___/
      Generate statistics (Highest bidders, Bet percentages)
       */
      statistics: ["verifyToken", "saveBets", (arg, cb) => {
        console.log(`| #5 BETTING - ${gameSet} - ${playerName} | : GENERATING STATISTICS.`);
        let _q = "CALL BETS_RANK($1, $2, $3, $4);";
        let _d = [ totalBetAmount, arg.verifyToken.id, tableId, gameSet ];
        let totalPlayersBets = 0;

        // Execute SQL query
        sails
          .sendNativeQuery(_q, _d, (err, rank) => {
            if (err) {
              console.log(`| #5.1 BETTING - ${gameSet} - ${playerName} | : Something wrong while pulling to generate statistics.`);
              return cb("Something wrong while pulling to generate statistics.");
            }

            async.parallel([
              (cb) => {
                console.log(`| #5.1p BETTING - ${gameSet} - ${playerName} | : Generating highest bidder.`);
                // Highest Bidder
                if (!_.isEmpty(rank.rows[0])) {
                  async.forEachOf(rank.rows[0], (value, key, cb) => {
                    // Highest Bidder [highestBidders]
                    if (value) {
                      syfer('encrypt', value.user_id || 'NO_USER')
                        .then((d) => {
                          returnData.highestBidders[value.bet_place] = value.user_id ? d : null;
                          returnData.betRankData[value.bet_place] = value.user_id ? d : [];
                          return cb();
                        })
                        .catch(() => {
                          return cb()
                        })
                    } else {
                      return cb()
                    }
                  }, cb);
                } else {
                  return cb()
                }
              },

              (cb) => {
                console.log(`| #5.1p BETTING - ${gameSet} - ${playerName} | : Generating players bet count.`);
                // Total Bets, Players and Bet Percentages
                if (!_.isEmpty(rank.rows[1])) {
                  // Sum of all players bet
                  totalPlayersBets = _.sumBy(rank.rows[1], (o) => { return _.includes(['banker_pair', 'player_pair'], o.bet_place) ? 0 : o.total_bets});

                  // Generate Bet Percentage
                  _.map(rank.rows[1], (o) => {
                    _.assign(returnData.bet_percentages, {
                      [o.bet_place]: _.round((o.total_bets / totalPlayersBets) * 100)
                    });
                  });

                  returnData.totalUsersAndBettings = _.groupBy(rank.rows[1], "bet_place");
                }
                return cb()
              },

              (cb) => {
                console.log(`| #5.1p BETTING - ${gameSet} - ${playerName} | : Generating other relative table info.`);
                // Other miscellaneous data required
                if (!_.isEmpty(rank.rows[2])) {
                  returnData.game = rank.rows[2][0]["game"];
                  returnData.balance = 0; // This will update on next tasks (iChipsBet)
                  returnData.tableNumber = rank.rows[2][0]["tableNumber"];
                  returnData.gameCode = rank.rows[2][0]["gameCode"];
                  returnData.tableid = tableId;
                }
                return cb()
              }
            ], () => {
              // Return processed data
              return cb(null, returnData);
            })
          });
      }],
      /*
       __                        ___        _                 _    ___  _      _
      / _\  __ _ __   __ ___    / __\  ___ | |_  ___         (_)  / __\| |__  (_) _ __   ___
      \ \  / _` |\ \ / // _ \  /__\// / _ \| __|/ __|  _____ | | / /   | '_ \ | || '_ \ / __|
      _\ \| (_| | \ V /|  __/ / \/  \|  __/| |_ \__ \ |_____|| |/ /___ | | | || || |_) |\__ \
      \__/ \__,_|  \_/  \___| \_____/ \___| \__||___/        |_|\____/ |_| |_||_|| .__/ |___/
       Save Data on I-Chips                                                      |_|
       */
      // ToDo: This will cause a spike on latency on request
      iChipsBet: ["verifyToken", "statistics", (arg, cb) => {
        console.log(`| #6 BETTING - ${gameSet} - ${playerName} | : SAVING ON I-CHIPS.`);
        let retryCtr = 1;

        const iChips = (cb) => {
          ICHIPS.betBalance({
            bets: bettingDetails,
            username: _.get(arg.verifyToken, 'username', ''),
            gameCode: _.get(arg.statistics, 'gameCode', ''),
            gameSet
          }, (err, data) => {
            if (err) {
              console.log(`| #6.1p BETTING - ${gameSet} - ${playerName} | : Communicating I-Chips [${retryCtr++} time(s)] ...`);
              return cb(err);
            }

            return cb(err, data);
          });
        };

        // This will retry iChips saving 5 times if failed
        async.retry({ times: 2, interval: 200 }, iChips, (err, data) => {
          if (err) {
            // Handles iChips errors
            console.log(`| #6.1 BETTING - ${gameSet} - ${playerName} | : Saving on I-Chips Failed.`);
            console.log(`| #6.1 BETTING - ${gameSet} - ${playerName} | : Reason => ${JSON.stringify(err)}`);
            return cb(err);
          }

          console.log(`| #6.1 BETTING - ${gameSet} - ${playerName} | : Saving on I-Chips Successful.`);
          returnData.balance = data.balance;
          // Return when successfully executed
          return cb(null, data);
        });

        // Uncomment to disabled I-Chips and comment the async.retry above
        // return cb(null, { balance: 0 });
      }],

      broadcast: ['iChipsBet', async (arg, cb) => {
        console.log(`| #7 BETTING - ${gameSet} - ${playerName} | : BROADCASTING STATISTICS.`);
        // Update all players in the table
        await balanceUpdate('table', {
          tablenumber: _.get(tableSerializer, `idToNumber[${tableId}]`, ''),
          playerGroup: [{
            balance: parseFloat(_.get(arg.iChipsBet,`balance`, 0)),
            id: await syfer('encrypt', arg.verifyToken.id)
          }]
        });

        // Broadcast betting updates to all players
        await socketHelper('blast', {
            event: 'betting_results',
            values: { data: returnData }
          });

        return cb();
      }]
    };

    // Execute tasks
    async.auto(tasks, (err) => {
      if (err) {
        console.log(`| #8 BETTING - ${gameSet} - ${playerName} | : Betting Failed :(`);

        return rollBack(bettingDetails, {}, null)
          .then(() => {
            console.log(`| #8.1 BETTING - ${gameSet} - ${playerName} | : ROLLBACK SUCCESS.`);
            return res.badRequest({status: 400, message: 'Betting Unsuccessful'});
          }, (error) => {
            console.log(`| #8.1 BETTING - ${gameSet} - ${playerName} | : ROLLBACK FAILED. MANUAL DELETION IS ADVISED! ${JSON.stringify(error)}`);
            return res.badRequest({status: 400, message: 'Betting Unsuccessful'});
          })
      }

      console.log(`| #8 BETTING - ${gameSet} - ${playerName} | : Betting Successful :)`);
      return res.json({status: 200, data: returnData, message: "Betting Successful"});
    });

    /*
      ROLLBACK SUB-FUNCTION
     */
    function rollBack (rollbackBets= [], meta, customError = "Something wrong while saving bets.") {
      console.log(`| # ROLLBACK BETTING - ${gameSet} - ${playerName} | Affected Data: ${JSON.stringify(_.map(rollbackBets, 'bet_code'))}`);

      return new Promise((resolve, reject) => {
        if (_.isEmpty(rollbackBets)) {
          console.log(`| # ROLLBACK BETTING - ${gameSet} - ${playerName} | Rollback bets empty. Deletion skipped.`);
          resolve(customError);
        }

        async.eachSeries(rollbackBets, (bet, cb) => {
          // Delete bet data
          sails.sendNativeQuery(`DELETE FROM t_betdetails WHERE id = $1`, [bet.id], cb);
        }, (err) => {
          if (err) {
            console.log(`| # ROLLBACK BETTING - ${gameSet} - ${playerName} | Reason : ${JSON.stringify(err)}`);
            reject(err);
          }

          console.log(`| # ROLLBACK BETTING - ${gameSet} - ${playerName} | Rollback Done.`);
          resolve(customError);
        });
      })

    }
  },

  getAllBetsPerGameSet: function (req, res) {
    const currentDate = process.env.NODE_ENV === 'development' ? moment().format('YYYY-MM-DD') : moment().utc().format('YYYY-MM-DD');
    const table_id = req.body.table_id ? req.body.table_id : 0
    const gameSet = req.body.gameSet ? req.body.gameSet : ''
    const tasks = {
      verifyToken: async function (cb) {
        await JwtService.valid(req.body.token)
          .then((token) => {
            return cb(null, {request: req, id: token.id});
          }, (err) => {
            return cb(err)
          });
      },
      getAllBets: ["verifyToken", async function (results, next) {
        let user_id = results.verifyToken.id
        let procedure = "CALL ALL_BETS_PER_GAMESET($1, $2, $3, $4)";
        Bettings.getDatastore().sendNativeQuery(procedure, [currentDate, user_id, table_id, gameSet], async function (err, response) {
          if (err) return  next(err)
          response.rows[0][0].user_id = await syfer('encrypt', response.rows[0][0].user_id);
          return next(null, response);
        })
      }]
    };

    async.auto(tasks, (err, results) => {
      if (err) return res.serverError({message: err});
      return res.ok(results.getAllBets)
    })
  },

  getPlayerPendingBets: function (req, res) {
    const params = req.body;
    let gameSet
    // Validators
    if (_.isUndefined(params.token)) res.badRequest({err: "Invalid Parameter: [token]"});
    gameSet = _.isUndefined(params.gameset_id) ? null : params.gameset_id

    const tasks = {
      verifyToken: async function (cb) {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, {request: req, id: token.id });
          }, (err) => {
            return cb(err)
          });
      },

      getPendingBets: ["verifyToken", function (results, next) {
        const user = results.verifyToken
        let data = []
        let query = `SELECT
                      	tbd1.*, cbp.bet_place,
                      	ctl.tablenumber,
                      	ctl.gamename,
                      	csh.shoehandnumber
                      FROM
                      	t_betdetails tbd1
                      LEFT JOIN t_betdetails tbd2 ON tbd2.user_id = $1
                      AND tbd2.result_id IS NULL
                      LEFT JOIN c_betplace cbp ON tbd1.betplace_id = cbp.id
                      LEFT JOIN c_tablelist ctl ON tbd1.table_id = ctl.id
                      LEFT JOIN c_shoehand csh ON tbd1.shoehand_id = csh.id
                      WHERE
                      	tbd1.user_id = tbd2.user_id
                      AND tbd1.table_id = tbd2.table_id
                      AND tbd1.gameset_id = IFNULL($2, tbd1.gameset_id)
                      AND tbd1.shoehand_id = tbd2.shoehand_id
                      AND tbd1.bet_code = tbd2.bet_code
                      AND tbd1.result_id IS NULL`;
        Bettings.getDatastore().sendNativeQuery(query, [ user.id, gameSet ], async function (err, bettings) {
          if (err) sails.log.error(err);
          return next(null, bettings.rows);
        })
      }],
      formatRecords: ["getPendingBets", (results, next) => {
        const bets = {};
        let tableInfo = "";
        for (let pBet of _.get(results, 'getPendingBets', [])) {
          if (!bets[pBet.bet_place]) bets[pBet.bet_place] = 0
          bets[pBet.bet_place] += pBet.bet_amount

          tableInfo = {
            shoeHand: pBet.shoehandnumber,
            tableNo: pBet.tablenumber,
            tableName: pBet.gamename,
            gameSet: pBet.gameset_id
          }
        }
        return next(null, {tableInfo, bets});
      }]
    };

    async.auto(tasks, (err, results) => {
      if (err) return res.badRequest({status: 401, message: err});
      return res.json({status: 200, data: results.formatRecords});
    })
  },

  gameSetInformation: function (req, res) {
    let params = req.body;
    let tasks;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({ err: 'Invalid Parameter: [token]' });
    if (_.isUndefined(params.tableNumber))
      return res.badRequest({ err: 'Invalid Parameter: [tableNumber]' });
    if (_.isUndefined(params.gameSet))
      return res.badRequest({ err: 'Invalid Parameter: [gameSet]' });

    tasks = {
      // Verify token
      verifyToken: async function (cb) {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      // Get game set information
      query: ['verifyToken', function (arg, cb) {
        let query = "CALL GET_BET_INFO_UPON_ENTER($1, $2)";
        let gameSetInfo = {};
        Bettings.getDatastore().sendNativeQuery(query, [params.tableNumber, params.gameSet], function (err, result) {
          if (err) return cb(err);

          let topBidder = result.rows[0][0];
          let percentages = result.rows[1];
          let tableSummary = result.rows[2];

          async.eachSeries(percentages, async (v, inCb) => {
            try {
              gameSetInfo[v.bet_place] = {};
              gameSetInfo[v.bet_place]["betPercentage"] = v["bet_percentage"];
              gameSetInfo[v.bet_place]["topBidderId"] = _.isUndefined(topBidder[v.bet_place]) || _.isNull(topBidder[v.bet_place]) ? null : await syfer('encrypt', topBidder[v.bet_place]);
              gameSetInfo[v.bet_place]["topAmount"] = _.isUndefined(topBidder[v.bet_place]) || _.isNull(topBidder[v.bet_place]) ? null : topBidder[v.bet_place + '_amount'];
              gameSetInfo[v.bet_place]["totalBetAmount"] = _.find(tableSummary, (o) => { return o.bet_place === v.bet_place})["total_bets"];
              gameSetInfo[v.bet_place]["totalUserBet"] = _.find(tableSummary, (o) => { return o.bet_place === v.bet_place})["total_users"];
            } catch (ex) {
              return inCb(ex);
            }

            return inCb();
          }, (err) => {
            return cb(err, gameSetInfo);
          })
        })
      }]
    };

    // Execute tasks
    async.auto(tasks, function (err, task) {
      if (err) return res.badRequest({ err: 'Record Not Found', data: {} });
      return res.ok({ data: task.query })
    });
  },

  /**
   * Set, get and delete re-bet functions
   * @param req
   * @param res
   * @author Alvin V.
   * @returns {never}
   * @constructor
   */
  rebetAction: function (req, res) {
    const params = req.body;
    let tasks, method, cacheKey, preparedTasks;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({err: "Invalid parameter: [token]"});
    if (_.isUndefined(params.tableNumber))
      return res.badRequest({err: "Invalid parameter: [tableNumber]"});
    if (_.isUndefined(params.method))
      return res.badRequest({err: "Invalid parameter: [method]"});
    if (_.indexOf(['GET', 'SET', 'DEL'], params.method) === -1)
      return res.badRequest({err: "Invalid format: [method]"});

    // Initiate variables
    method = params.method;

    tasks = {
      // Verify token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            // Set Cache key
            cacheKey = params.tableNumber + "_" + token.username;
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      }
    };

    /*
      _________         __
     /   _____/  ____ _/  |_
     \_____  \ _/ __ \\   __\
     /        \\  ___/ |  |
    /_______  / \___  >|__|
            \/      \/
     */
    if (method === 'SET') {
      // Method other validators
      if (_.isUndefined(params.gameSet))  return res.badRequest({err: "Invalid parameter: [gameSet]"});
      if (_.isUndefined(params.sections)) return res.badRequest({err: "Invalid parameter: [sections]"});
      if (_.isEmpty(params.sections))     return res.badRequest({err: "Empty array: [sections]"});
      if (_.isUndefined(params.shoeGame)) return res.badRequest({err: "Invalid parameter: [shoeGame]"});
      if (_.isNaN(parseInt(_.replace(params.shoeGame, '-', '')))) return res.badRequest({ err: "Invalid format: [shoeGame]" });

      preparedTasks = {
        // Set re-bet for caching
        finalTask: ["verifyToken", async function (result, cb) {
          await CacheService.set("rebet_" + cacheKey, {
            tableNumber: params.tableNumber,
            shoeGame: params.shoeGame,
            gameSet: params.gameSet,
            sections: params.sections
          }, cb);
        }]
      };
      Object.assign(tasks, preparedTasks);

      /*
        ________          __
       /  _____/   ____ _/  |_
      /   \  ___ _/ __ \\   __\
      \    \_\  \\  ___/ |  |
       \______  / \___  >|__|
              \/      \/
       */
    } else if (method === 'GET') {
      // Method other validators
      if (_.isUndefined(params.gameSet))    return res.badRequest({err: "Invalid parameter: [gameSet]"});
      if (_.isUndefined(params.shoeGame))   return res.badRequest({err: "Invalid parameter: [shoeGame]"});
      if (_.isNaN(parseInt(_.replace(params.shoeGame, '-', '')))) return res.badRequest({err: "Invalid format: [shoeGame]"});

      preparedTasks = {
        // Get last bet on table
        lastBetOnTable: ["verifyToken", (result, cb) => { CacheService.get("lastBetOnTable_" + cacheKey, cb) }],
        // Get re-bet chips
        rebetChips:     ["verifyToken", (result, cb) => { CacheService.get("rebet_" + cacheKey, cb) }],
        // Get re-bet flag
        rebetFlag:      ["verifyToken", (result, cb) => { CacheService.get("rebetFlag_" + cacheKey, cb) }],
        // Process re-bets
        finalTask:      ["lastBetOnTable", "rebetChips", "rebetFlag", (result, cb) => {
          let temp = [];
          let lastShoe, curShoe;
          // If re-bet has been used, return empty re-bet chips
          if (result.rebetFlag) {
            console.log('[UNABLE-REBET][' + result.verifyToken.username + ']: Re-bet already used.');
            return cb(null, []);
          }
          // If rebetChips is empty, return empty re-bet chips
          if (!result.rebetChips) {
            console.log('[UNABLE-REBET][' + result.verifyToken.username + ']: Empty re-bet chips.');
            return cb(null, []);
          }
          // Check if has previous bets
          if (!result.lastBetOnTable) {
            console.log('[UNABLE-REBET][' + result.verifyToken.username + ']: No previous bets.');
            return cb(null, []);
          }

          // Convert shoe format to number 1-1 => 11
          lastShoe = _.replace(result.lastBetOnTable.shoeGame, '-', '');
          curShoe = _.replace(params.shoeGame, '-', '');

          // If the gap of lastShoe and current shoe is greater than 1 shoe, invalidate cache re-bet
          if (Math.abs(parseInt(curShoe) - parseInt(lastShoe)) > ENV.game_config.rebetValidity) {
            // Clear invalid cache re-bet
            CacheService.delete("rebet_" + cacheKey, (err) => {
              return cb(err, []);
            });
          } else {
            // Consolidate same bet section's value
            _.map(result.rebetChips.sections, (bet) => {
              let index = _.findIndex(temp, (o) => { return o.betSection === bet.betSection});
              if (index > -1) {
                temp[index].chipValue += parseFloat(bet.chipValue);
                temp[index].chipClass = bet.chipClass;
              } else {
                temp.push({
                  isRebet: true,
                  isConfirmed: false, // For Desktop
                  isConfirm: false, // For Mobile
                  betSection: bet.betSection,
                  chipValue: bet.chipValue,
                  chipClass: bet.chipClass,
                  chipImage: bet.chipImage
                });
              }
            });

            // Deactivate/Activate re-bet flag
            if (ENV.game_config.singleRebetPerShoe) {
              CacheService.set("rebetFlag_" + cacheKey, {
                isFlagged: true,
                token: params.token,
                gameSet: params.gameSet,
                shoeGame: params.shoeGame
              }, (err) => {
                return cb(err, temp);
              });
            } else {
              return cb(null, temp)
            }
          }
        }]
      };
      Object.assign(tasks, preparedTasks);
      /*
      ________           .__            __
      \______ \    ____  |  |    ____ _/  |_   ____
       |    |  \ _/ __ \ |  |  _/ __ \\   __\_/ __ \
       |    `   \\  ___/ |  |__\  ___/ |  |  \  ___/
      /_______  / \___  >|____/ \___  >|__|   \___  >
              \/      \/            \/            \/
       */
    } else if (method === 'DEL') {
      preparedTasks = {
        // Get cached re-bet
        finalTask: ["verifyToken", (result, cb) => {
          CacheService.delete("rebet_" + cacheKey, cb);
        }]
      }
      Object.assign(tasks, preparedTasks);
    }

    // Execute tasks
    async.auto(tasks, (err, taskResult) => {
      return err ? res.badRequest({ err: err }) : res.json({
        message: "Re-bet data for table[" + params.tableNumber + "] has been [" + method + "].",
        data: taskResult.finalTask
      })
    });
  },

  /**
   * Get, set and delete Re-bet flags
   * @param req
   * @param res
   * @author Alvin V.
   * @routes POST /bettings/rebetFlag
   * @returns {never}
   * @constructor
   */
  rebetFlagAction: function (req, res) {
    const params = req.body;
    let tasks, preparedTasks, method, cacheKey;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({err: "Invalid parameter: [token]"});
    if (_.isUndefined(params.tableNumber))
      return res.badRequest({err: "Invalid parameter: [tableNumber]"});
    if (_.isUndefined(params.method))
      return res.badRequest({err: "Invalid parameter: [method]"});
    if (_.indexOf(['GET', 'SET', 'DEL'], params.method) === -1)
      return res.badRequest({err: "Invalid format: [method]"});

    // Initiate variables
    method = params.method;
    tasks = {
      // Verify token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            // Set cache key
            cacheKey = "rebetFlag_" + params.tableNumber + "_" + token.username;
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      }
    };

    /*
      _________         __
     /   _____/  ____ _/  |_
     \_____  \ _/ __ \\   __\
     /        \\  ___/ |  |
    /_______  / \___  >|__|
            \/      \/
     */
    if (method === 'SET') {
      //Method other validators
      if (_.isUndefined(params.gameSet))      return res.badRequest({err: "Invalid parameter: [gameSet]"});
      if (_.isUndefined(params.shoeGame))     return res.badRequest({err: "Invalid parameter: [shoeGame]"});

      preparedTasks = {
        // Set cached re-bet flag
        finalTask: ["verifyToken", (result, cb) => {
          CacheService.set(cacheKey, {
            isFlagged: true,
            token: params.token,
            gameSet: params.gameSet,
            shoeGame: params.shoeGame
          }, cb);
        }],
      };
      Object.assign(tasks, preparedTasks);
      /*
        ________          __
       /  _____/   ____ _/  |_
      /   \  ___ _/ __ \\   __\
      \    \_\  \\  ___/ |  |
       \______  / \___  >|__|
              \/      \/
       */
    } else if (method === 'GET') {
      preparedTasks = {
        // Get cached re-bet flag
        finalTask: ["verifyToken", (result, cb) => {
          CacheService.get(cacheKey, cb);
        }],
      };
      Object.assign(tasks, preparedTasks);
      /*
      ________           .__            __
      \______ \    ____  |  |    ____ _/  |_   ____
       |    |  \ _/ __ \ |  |  _/ __ \\   __\_/ __ \
       |    `   \\  ___/ |  |__\  ___/ |  |  \  ___/
      /_______  / \___  >|____/ \___  >|__|   \___  >
              \/      \/            \/            \/
       */
    } else if (method === 'DEL') {
      preparedTasks = {
        // Delete cached re-bet flag
        finalTask: ["verifyToken", (result, cb) => {
          CacheService.delete(cacheKey, cb);
        }]
      };
      Object.assign(tasks, preparedTasks);
    }

    // Execute tasks
    async.auto(tasks, function (err, taskResults) {
      return err ? res.badRequest({ err: err }) : res.json({
        message: "Re-bet flag for table[" + params.tableNumber + "] has been " + method + ".",
        data: taskResults.finalTask
      });
    });
  },

  /**
   * Get, set and delete last bet info
   * @param req
   * @param res
   * @author Alvin V.
   * @constructor
   */
  lastBetAction: function (req, res) {
    const params = req.body;
    let tasks, preparedTasks, method;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid parameter: [token]" });
    if (_.isUndefined(params.method))
      return res.badRequest({ err: "Invalid parameter: [method]" });
    if (_.indexOf(['GET', 'SET', 'DEL'], params.method) === -1)
      return res.badRequest({err: "Invalid format: [method]"});

    // Initiate variables
    method = params.method;
    tasks = {
      // Verify token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      }
    };

    /*
      _________         __
     /   _____/  ____ _/  |_
     \_____  \ _/ __ \\   __\
     /        \\  ___/ |  |
    /_______  / \___  >|__|
            \/      \/
     */
    if (method === 'SET') {
      // Method other validators
      if (_.isUndefined(params.tableNumber)) return res.badRequest({err: "Invalid parameter: [tableNumber]"});
      if (_.isUndefined(params.gameSet)) return res.badRequest({err: "Invalid parameter: [gameSet]"});
      if (_.isUndefined(params.shoeGame)) return res.badRequest({err: "Invalid parameter: [shoeGame]"});
      if (_.isUndefined(params.sections) || _.isEmpty(params.sections)) return res.badRequest({err: "Invalid parameter: [sections]"});

      preparedTasks = {
        // Set latest bet information
        lastTableHavingBet: ["verifyToken", (result, cb) => {
          CacheService.set("lastTableHavingBet_" + result.verifyToken.username, {
            tableNumber: params.tableNumber,
            gameSet: params.gameSet,
            shoeGame: params.shoeGame,
            sections: params.sections
          }, cb);
        }],
        finalTask: ["verifyToken", "lastTableHavingBet", (result, cb) => {
          CacheService.set("lastBetOnTable_" + params.tableNumber + "_" +result.verifyToken.username, {
            tableNumber: params.tableNumber,
            gameSet: params.gameSet,
            shoeGame: params.shoeGame,
            sections: params.sections
          }, cb);
        }]
      };
      Object.assign(tasks, preparedTasks);
      /*
        ________          __
       /  _____/   ____ _/  |_
      /   \  ___ _/ __ \\   __\
      \    \_\  \\  ___/ |  |
       \______  / \___  >|__|
              \/      \/
       */
    } else if (method === 'GET') {
      preparedTasks = {
        // Get latest bet information
        finalTask: ["verifyToken", (result, cb) => {
          CacheService.get("lastTableHavingBet_" + result.verifyToken.username, cb);
        }]
      };
      Object.assign(tasks, preparedTasks);
      /*
      ________           .__            __
      \______ \    ____  |  |    ____ _/  |_   ____
       |    |  \ _/ __ \ |  |  _/ __ \\   __\_/ __ \
       |    `   \\  ___/ |  |__\  ___/ |  |  \  ___/
      /_______  / \___  >|____/ \___  >|__|   \___  >
              \/      \/            \/            \/
     */
    } else if (method === 'DEL'){
      preparedTasks = {
        // Delete latest bet information
        finalTask: ["verifyToken", function (result, cb) {
          CacheService.delete("lastTableHavingBet_" + result.verifyToken.username, cb);
        }]
      };
      Object.assign(tasks, preparedTasks);
    }

    // Execute tasks
    async.auto(tasks, function (err, taskResults) {
      return err ? res.badRequest({ err: err }) : res.json({
        message: "Latest bet of player has been " + method + ".",
        data: taskResults.finalTask
      });
    });
  },

  /**
   * Get, set and delete last bet on specific table
   * @param req
   * @param res
   * @author Alvin V.
   * @returns {never}
   */
  lastBetOnTableAction: function (req, res) {
    const params = req.body;
    let tasks, preparedTasks, method, cacheKey;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid parameter: [token]" });
    if (_.isUndefined(params.method))
      return res.badRequest({ err: "Invalid parameter: [method]" });
    if (_.indexOf(['GET', 'SET', 'DEL'], params.method) === -1)
      return res.badRequest({err: "Invalid format: [method]"});

    // Initiate variables
    method = params.method;
    tasks = {
      // Verify token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            cacheKey = "lastBetOnTable_" + params.tableNumber + "_" + token.username;
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      }
    };

    /*
      _________         __
     /   _____/  ____ _/  |_
     \_____  \ _/ __ \\   __\
     /        \\  ___/ |  |
    /_______  / \___  >|__|
            \/      \/
     */
    if (method === 'SET') {
      // Method other validators
      if (_.isUndefined(params.tableNumber))  return res.badRequest({err: "Invalid parameter: [tableNumber]"});
      if (_.isUndefined(params.gameSet))      return res.badRequest({err: "Invalid parameter: [gameSet]"});
      if (_.isUndefined(params.shoeGame))     return res.badRequest({err: "Invalid parameter: [shoeGame]"});
      if (_.isUndefined(params.sections) || _.isEmpty(params.sections)) return res.badRequest({err: "Invalid parameter: [sections]"});

      preparedTasks = {
        finalTask: ["verifyToken", (result, cb) => {
          CacheService.set(cacheKey, {
            tableNumber: params.tableNumber,
            gameSet: params.gameSet,
            shoeGame: params.shoeGame,
            sections: params.sections
          }, cb);
        }]
      };
      Object.assign(tasks, preparedTasks);
      /*
        ________          __
       /  _____/   ____ _/  |_
      /   \  ___ _/ __ \\   __\
      \    \_\  \\  ___/ |  |
       \______  / \___  >|__|
              \/      \/
       */
    } else if (method === 'GET') {
      preparedTasks = {
        // Get latest bet information
        finalTask: ["verifyToken", (result, cb) => {
          CacheService.get(cacheKey, cb);
        }]
      };
      Object.assign(tasks, preparedTasks);
      /*
      ________           .__            __
      \______ \    ____  |  |    ____ _/  |_   ____
       |    |  \ _/ __ \ |  |  _/ __ \\   __\_/ __ \
       |    `   \\  ___/ |  |__\  ___/ |  |  \  ___/
      /_______  / \___  >|____/ \___  >|__|   \___  >
              \/      \/            \/            \/
     */
    } else if (method === 'DEL'){
      preparedTasks = {
        // Delete latest bet information
        finalTask: ["verifyToken", function (result, cb) {
          CacheService.delete(cacheKey, cb);
        }]
      };
      Object.assign(tasks, preparedTasks);
    }

    // Execute tasks
    async.auto(tasks, function (err, taskResults) {
      return err ? res.badRequest({ err: err }) : res.json({
        message: "Latest bet on information for table[" + params.tableNumber + "] has been " + method + ".",
        data: taskResults.finalTask
      });
    });
  },

  /**
   * Get, set and delete bet flag
   * @param req
   * @param res
   * @author Alvin V.
   * @returns {never}
   * @constructor
   */
  betFlagAction: function (req, res) {
    const params = req.body;
    let tasks, preparedTasks, method, cacheKey;

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({err: "Invalid parameter: [token]"});
    if (_.isUndefined(params.tableNumber))
      return res.badRequest({err: "Invalid parameter: [tableNumber]"});
    if (_.isUndefined(params.method))
      return res.badRequest({err: "Invalid parameter: [method]"});
    if (_.indexOf(['GET', 'SET', 'DEL'], params.method) === -1)
      return res.badRequest({err: "Invalid format: [method]"});

    // Initiate variables
    method = params.method;
    tasks = {
      // Verify token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            // Set cache key
            cacheKey = "myBet_" + params.tableNumber + "_" + token.username;
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      }
    };

    /*
      _________         __
     /   _____/  ____ _/  |_
     \_____  \ _/ __ \\   __\
     /        \\  ___/ |  |
    /_______  / \___  >|__|
            \/      \/
     */
    if (method === 'SET') {
      // Method other validators
      if (_.isUndefined(params.gameSet)) return res.badRequest({err: "Invalid parameter: [gameSet]"});

      preparedTasks = {
        // Set bet flag
        finalTask: ["verifyToken", (result, cb) => {
          CacheService.set(cacheKey, {
            token: params.token,
            tableNumber: params.tableNumber,
            gameSet: params.gameSet,
            date: new Date()
          }, cb);
        }],
      };
      Object.assign(tasks, preparedTasks);
      /*
        ________          __
       /  _____/   ____ _/  |_
      /   \  ___ _/ __ \\   __\
      \    \_\  \\  ___/ |  |
       \______  / \___  >|__|
              \/      \/
       */
    } else if (method === 'GET') {
      preparedTasks = {
        // Get cached re-bet flag
        finalTask: ["verifyToken", (result, cb) => {
          CacheService.get(cacheKey, cb);
        }],
      };
      Object.assign(tasks, preparedTasks);
      /*
      ________           .__            __
      \______ \    ____  |  |    ____ _/  |_   ____
       |    |  \ _/ __ \ |  |  _/ __ \\   __\_/ __ \
       |    `   \\  ___/ |  |__\  ___/ |  |  \  ___/
      /_______  / \___  >|____/ \___  >|__|   \___  >
              \/      \/            \/            \/
       */
    } else if (method === 'DEL') {
      preparedTasks = {
        // Delete cached re-bet flag
        finalTask: ["verifyToken", (result, cb) => {
          CacheService.delete(cacheKey, cb);
        }]
      };
      Object.assign(tasks, preparedTasks);
    }

    // Execute tasks
    async.auto(tasks, function (err, taskResults) {
      return err ? res.badRequest({ err: err }) : res.json({
        message: "Bet flag for table[" + params.tableNumber + "] has been " + method + ".",
        data: taskResults.finalTask
      });
    });
  },
  // /bettings/GetAllGameByTable'
  GetAllGameByTable: async (req, res) => {
    let params = req.body

    if(_.isUndefined(params.token))
        return res.badRequest({err: '[token]: Invalid parameter.', status: 400})
    if(_.isUndefined(params.tablenumber))
      return res.badRequest({err: '[tablenumber]: Invalid parameter.', status: 400})
    if(_.isUndefined(params.shoehandnumber))
      return res.badRequest({err: '[shoehandnumber]: Invalid parameter.', status: 400})

    const tasks = {
        verifyToken: async (cb) => {
          await JwtService.valid(params.token)
            .then((token) => {
              return cb(null, token);
            })
            .catch((err) => {
              return cb(err)
            });
        },
        getByTable: ["verifyToken", async (result, next) => {
          let userid = result.verifyToken.id
          const query = "select a.id, a.gameset_id, a.bet_code, a.win_loss, c.bet_place, a.bet_amount, a.balance, d.tablenumber from t_betdetails a left join c_shoehand b on b.id = a.shoehand_id left join c_betplace c on c.id = a.betplace_id left join c_tablelist d on d.id = a.table_id where a.user_id = $1 and b.shoehandnumber = $2 and d.tablenumber = $3 and a.result_id IS NULL";
            await Bettings.getDatastore().sendNativeQuery(query, [userid, params.shoehandnumber, params.tablenumber], (err, result) => {
              if (err) return next(err);
              if (_.isEmpty(result.rows))
                return next("Bet not existing or empty.");
              return next(null, result.rows)
            })
        }]
      }
      async.auto(tasks, (err, results) => {
        if (err) return res.json({ status: 401, msg: err, data: '' })
        return res.json({ status: 200, msg: 'Get All bets betting by Table', data: results.getByTable })
      })
  }
};
