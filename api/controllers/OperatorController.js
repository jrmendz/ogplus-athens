/**
 * OperatorController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const ICHIPS = new IChipsService();
const ENV = sails.config;

module.exports = {
  verifyLogin: (req, res) => {
    const params = req.body || req.query;
    let tasks, playerLocation;

    console.log("\033[33m [[ OPERATOR AUTHENTICATION API ]]", JSON.stringify(params),"\033[0m");

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({ status: 400, msg: "Invalid Parameter: [token]" });

    // Pre-setting variable
    playerLocation = _.isUndefined(params.playerLocation) ? true : params.playerLocation;

    tasks = {
      // Verify token provided
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },

      // Get player I-Chips balance, override balance from OG+ db
      getIChipsUser: ["verifyToken", async (arg, cb) => {
        await ichipsApi('getUser', {
          username: arg.verifyToken.username,
          user_type: 'MARS',
          game_code: ''
        }).then((success) => {
          return cb(null, success.data);
        }, (error) => {
          // I-Chips error handler
          console.log("\033[31m", "<<<<< I-CHIPS EXCEPTION HANDLER >>>>>", "\033[0m");
          console.log("\033[31m", "REASON:", new Error(error), "\033[0m");
          return cb("Something wrong with the I-Chips connection");
        });
      }],

      // Update player information on OGPlus database
      updateUser: ["verifyToken", "getIChipsUser", async (arg, cb) => {
        // Update user online status
        let userInfo = await Users.updateOne({
          id: arg.verifyToken.id
        })
        .set({
          // nickname: arg.getIChipsUser.user.nickname,
          balance: arg.getIChipsUser.user.balance,
          min_bet_limit: _.get(arg.getIChipsUser, 'chip_limit.min', 1),
          max_bet_limit: _.get(arg.getIChipsUser, 'chip_limit.max', 20000),
          // user_settings: JSON.stringify({"desktop":{},"mobile":{}}),
          logged: 1,
          is_sidebet: 0
        })
        .intercept((err) => {
          return cb(err);
        });

        // Single login function, logout others with older token
        await socketHelper('broadcast', {
          room: 'userRoom_' + arg.verifyToken.id,
          event: 'order66',
          values: params.token
        });

        // Encrypt User ID
        userInfo['id'] = await syfer('encrypt', userInfo['id'] || '');

        return cb(null, userInfo || {});
      }],

      // Update cache location
      playerLocation: ["verifyToken", "updateUser", (arg, cb) => {
        let USER_COUNT;

        // By-pass player count broadcast
        if (!playerLocation)
          return cb();

        CacheService.get("player_location_cached", (err, token) => {
          if (err) return cb(err);

          if (token) {
            USER_COUNT = token;
            // Remove player from all existing tables
            _.forEach(USER_COUNT, (v, k) => {
              _.remove(USER_COUNT[k].players, (player) => {
                return player.id === arg.verifyToken.id
              })
            });
            USER_COUNT.lobby.players.push({
              id: arg.verifyToken.id,
              ttl: moment().format('YYYY-MM-DD hh:mm:ss')
            });
            USER_COUNT.lobby.players = _.uniqBy(USER_COUNT.lobby.players, 'id');

            CacheService.set("player_location_cached", USER_COUNT, -1, async (err) => {
              if (err) return cb(err);

              await socketHelper('blast', {
                event: 'player_location',
                values: USER_COUNT
              });

              return cb()
            })
          } else {
            console.log("\033[43m\033[30m", "<<< WARNING: Player Location Not Initialized. [REDIS:player_location_cached]", "\033[0m")
            return cb()
          }

        });
      }]
    };

    // Execute tasks
    async.auto(tasks, async (err, taskResults) => {
      if (err)
        return res.serverError({ status: 400, err });

      return res.json({
        status: 200,
        msg: "Token has been verified.",
        userdata: Object.assign(_.omit(taskResults.updateUser, ['password', 'username', 'id']), {id: await syfer('encrypt', taskResults.verifyToken.id)})
      })
    });
  },

  playGame: (req, res) => {
    const tokenQ = req.query.token;
    const platform = req.query.platform;

    const tasks = {
      checkUser: async (next) => {
        let userData = await JwtService.verify(tokenQ).catch((err) => {});
        if (!userData)
          return next("Invalid Token");
        return next(null, userData);
      },
      generateLink: ['checkUser', async (results, next) => {
        let userData = results.checkUser;
        let userSettings = JSON.parse(userData.user_settings);
        let languageSetting = 'en'; // `en` as default value
        // if (userSettings) {
        // 	if (platform.toUpperCase() === 'DESKTOP') {
        // 		// Desktop
        // 		if (userSettings.desktop && !_.isEmpty(userSettings.desktop)){
        // 			let lang = _.find(userSettings.desktop.flags, a => a.is_selected === true);
        // 			languageSetting = lang.code;
        // 		}
        // 	} else {
        // 		// Mobile

        // 		languageSetting = userSettings.mobile.lang;
        // 	}
        // }
        const link = `/play?t=${tokenQ}&lang=${languageSetting}&platform=${platform}`;
        return next(null, link)
      }]
    }

    async.auto(tasks, (err, results) => {
      const link = results.generateLink;
      if (err) return res.serverError(err);
      return res.ok(link);
    })
  },

  /**
   * Game Integration End-Point
   * @route POST /operators_transaction
   * @function operatorIntegrationEndPoint
   * @description End-point for Other Vendor Services
   * @param req
   * @param res
   */
  operatorsTransaction: (req, res) => {
    const { game_data: gameData, game_code: gameCode } = req.body;
    const operatorSvc = new OperatorServices();
    let tasks;

    // Validators for parameters
    if (!gameCode)
      return res.badRequest({ code: 400, status: 'Invalid Parameter: [game_code]' });
    if (!gameData)
      return res.badRequest({ code: 400, status: 'Invalid Parameter: [game_data]' });

    tasks = {
      /**
       * Operator Game Selection
       */
      gameSelect: (next) => {
        console.log('OPTR_INS (1/2): Game Verification...');
        const gameToProcess = _.toLower(gameCode);
        const operatorGameList = [
          'tw_niuniu',
          'tw_3cards',
          'tw_landlord',
          'tw_hundred_niuniu',
          'tw_banker_niuniu',
          'tw_hundred_3cards',
          'tw_hundred_texas_holdm',
          'tw_dragon_tiger'
        ];
        // Return game selection
        return _.includes(operatorGameList, gameToProcess) ?
          next(null, {
            data: gameData,
            game_code: gameToProcess
          }) :
          next({
            code: 400,
            status: 'Game not registered.'
          });
      },

      /**
       * Operator Game Request Processing
       */
      gameProcessing: ['gameSelect', (arg, next) => {
        console.log('OPTR_INS (2/2): Transaction Insertion...');
        operatorSvc.insert_transaction(arg.gameSelect, next);
      }]
    };

    // Execute tasks
    async.auto(tasks, (err) => {
      if (err) {
        // Serializing Errors
        switch(err.err) {
          case 400: return res.badRequest(err);
          case 401: return res.forbidden(err);
          case 500: return res.serverError(err);
          default : return res.serverError(err);
        }
      }

      // Return successful response
      return res.json({ code: 200, status: 'Success'});
    })
  },

  /**
   * Game Integration End-Point
   * @route POST /operators_game_result
   * @function operatorIntegrationEndPoint
   * @description End-point for Other Vendor Services
   * @param req
   * @param res
   */
  operatorsGameResult: (req, res) => {
    const { game_data: gameData, game_code: gameCode } = req.body;
    const IChipsSvc = new IChipsService();
    let tasks;

    // Validators for parameters
    if (!gameCode)
      return res.badRequest({ code: 400, status: 'Invalid Parameter: [game_code]' });
    if (!gameData)
      return res.badRequest({ code: 400, status: 'Invalid Parameter: [game_data]' });

    tasks = {
      /**
       * Operator Game Selection
       */
      gameSelect: (next) => {
        console.log('OPTR_INS (1/2): Game Verification...');
        const gameToProcess = _.toLower(gameCode);
        const operatorGameList = [
          'tw_niuniu',
          'tw_3cards',
          'tw_landlord',
          'tw_hundred_niuniu',
          'tw_banker_niuniu',
          'tw_hundred_3cards',
          'tw_hundred_texas_holdm',
          'tw_dragon_tiger'
        ];
        // Return game selection
        return _.includes(operatorGameList, gameToProcess) ?
          next(null, {
            data: gameData,
            game_code: gameToProcess
          }) :
          next({
            code: 400,
            status: 'Game not registered.'
          });
      },

      /**
       * Operator Game Request Processing
       */
      gameProcessing: ['gameSelect', (arg, next) => {
        console.log('OPTR_INS (2/2): Game Result Insertion...');
        IChipsSvc.insertGameResult(arg.gameSelect, next);
      }]
    };

    // Execute tasks
    async.auto(tasks, (err) => {
      if (err) {
        // Serializing Errors
        switch(err.err) {
          case 400: return res.badRequest(err);
          case 401: return res.forbidden(err);
          case 500: return res.serverError(err);
          default : return res.serverError(err);
        }
      }

      // Return successful response
      return res.json({ code: 200, status: 'Success'});
    })
  },

  /**
   * Game Integration End-Point
   * @route GET /operators_livegames
   * @function operatorIntegrationEndPoint
   * @description End-point for Getting to Live Games
   * @param req
   * @param res
   */
  operatorsLiveGames: (req, res) => {
    const { token } = req.query;

    // Validators
    if (_.isUndefined(token)) return res.badRequest('Invalid Token.');

    const tasks = {
      // Verify user token
      verifyToken: (next) => {
        JwtService.valid(token)
          .then((token) => next(null, { request: req, id: token.id }))
          .catch((err) => {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            res.forbidden();
          });
      },
      // Redirect to taiwan games
      redirect: ['verifyToken', (arg, next) => {

        // TO DO: redirect to taiwan games
        return res.redirect('https://www.google.com');
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, result) => res.json({
        code: err ? 401 : 200,
        status: err ? 'Failed to redirect' : 'Success'
      })
    );
  },

  /**
   * Game Integration End-Point
   * @route POST /operators_betting
   * @function operatorIntegrationEndPoint
   * @description End-point for Operators Betting
   * @param req
   * @param res
   */
  operatorsBetting: (req, res) => {
    const operatorSvc = new OperatorServices(),
          IChipsSvc = new IChipsService(),
          // TO DO: Replace default values for gameSet and gameCode
          { token, bets, gameSet = null, gameCode = null } = req.body;

    // Validators
    if (_.isUndefined(token)) return res.badRequest({ code: 400, status: 'Invalid Token.' });
    if (_.isEmpty(bets))      return res.badRequest({ err: 400, status: 'Payouts are empty.'});
    if (!_.isArray(bets))     return res.badRequest({ code: 400, status: `Parameter [bets] expected to be an array but receives ${ typeof bets }` });

    const tasks = {
      // Verify user token
      verifyToken: (next) => {
        JwtService.valid(token)
          .then((token) => next(null, token))
          .catch((err) => {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return res.forbidden();
          });
      },
      // Save Taiwan game bets
      saveTwBets: ['verifyToken', (arg, next) => {
        operatorSvc.save_tw_bets(bets, (err, result) => {
          if (err) {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return res.serverError({ code: 500, status: 'Internal Server Error', data: err });
          }
          return next();
        });
      }],
      // Get Users Balance
      getUsersBalance: ['saveTwBets', (arg, next) => {
        operatorSvc.get_tw_balance({ t_type: 'bet', params: bets }, (err, result) => {
          if (err) {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return res.serverError({ code: 500, status: 'Internal Server Error', data: err });
          }
          return next(null, result);
        });
      }],
      iChipsBet: ['verifyToken', (arg, next) => {
        console.log(`SAVING ON I-CHIPS.`);
        let retryCtr = 1;

        const iChips = (next) => {
          IChipsSvc.betBalance({
            bets,
            username: _.get(arg.verifyToken, 'username', ''),
            // TO DO: Add legit values to gameCode and gameSet
            gameCode,
            gameSet
          }, (err, data) => {
            if (err) {
              console.log(`Communicating I-Chips [${ retryCtr++ } time(s)] ...`);
              return next(err);
            }

            return next(err, data);
          });
        };

        // This will retry iChips saving 5 times if failed
        async.retry({ times: 2, interval: 200 }, iChips, (err, data) => {
          if (err) {
            // Handles iChips errors
            console.log(`Saving on I-Chips Failed.`);
            console.log(`Reason => ${JSON.stringify(err)}`);
            return next(err);
          }

          console.log(`Saving on I-Chips Successful.`);
          // Return when successfully executed
          return next(null, data);
        });

        // Uncomment to disabled I-Chips and comment the async.retry above
        // return next(null, { balance: 0 });
      }],
    };

    // Execute tasks
    async.auto(tasks, (err, result) => res.json({
        code: err ? 401 : 200,
        status: err ? 'Operators betting creation failed' : 'Operators betting creation success',
        data: err ? [] : result.getUsersBalance
      })
    );
  },

  /**
   * Game Integration End-Point
   * @route PUT /operators_payout
   * @function operatorIntegrationEndPoint
   * @description End-point for Operators Payout
   * @param req
   * @param res
   */
  operatorsPayout: (req, res) => {
    const operatorSvc = new OperatorServices(),
          // TO DO: Replace default value for gameSet
          { token, payouts, gameSet = {} } = req.body;

    // Validators
    if (_.isUndefined(token)) return res.badRequest({ code: 400, status: 'Invalid Token.' });
    if (_.isEmpty(payouts))   return done({ err: 400, status: 'Payouts are empty.'});
    if (!_.isArray(payouts))  return res.badRequest({ code: 400, status: `Parameter [payouts] expected to be an array but receives ${ typeof bets }` });

    const tasks = {
      // Verify user token
      verifyToken: (next) => {
        JwtService.valid(token)
          .then((token) => next(null, { request: req, id: token.id }))
          .catch((err) => {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return res.forbidden();
          });
      },
      // Save Taiwan game payouts
      saveTwPayouts: ['verifyToken', (arg, next) => {
        operatorSvc.save_tw_payouts(payouts, (err, result) => {
          if (err) {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return res.serverError({ code: 500, status: 'Internal Server Error', data: err });
          }
          return next();
        })
      }],
      // Get Users Balance
      getUsersBalance: ['saveTwPayouts', (arg, next) => {
        operatorSvc.get_tw_balance({ t_type: 'payout', params: payouts }, (err, result) => {
          if (err) {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return res.serverError({ code: 500, status: 'Internal Server Error', data: err });
          }
          return next(null, result);
        })
      }],
      // Payout balance
      payoutBalance: (next) => {
        console.log(`I-CHIPS INTEGRATION - PAYOUT`);

        // TO DO: Add legit values for gameSet and amount needed for iChipsApi payoutBalance
        ichipsApi('payoutBalance', { iChipsPayoutData: payouts, gameSet })
          .then((result) => {
            console.log(`PAYOUT API - ${gameSet} | : I-CHIPS INTEGRATION - Payout done.[ ${JSON.stringify(result.user)} ]`);
            iChips.userBalance = result.user;
            return next();
          }, (error) => {
            console.log(`PAYOUT API - ${gameSet} | : I-CHIPS INTEGRATION - Payout encounters error.[ ${JSON.stringify(error)} ]`);
            return next(error.cause ? error.cause.raw : error);
          });
      },
    };

    // Execute tasks
    async.auto(tasks, (err, result) => res.json({
        code: err ? 401 : 200,
        status: err ? 'Operators payouts update failed' : 'Operators payouts update success',
        data: err ? [] : result.getUsersBalance
      })
    );
  },

  /**
   * Game Integration End-Point
   * @route POST /operators_tablegames
   * @function operatorIntegrationEndPoint
   * @description End-point for Operators Table Games
   * @param req
   * @param res
   */
  operatorsTableGames: (req, res) => {
    const operatorSvc = new OperatorServices(),
          { token, table_games: tableGames } = req.body;

    // Validators
    if (_.isUndefined(token))   return res.badRequest({ code: 400, status: 'Invalid Token.' });
    if (_.isEmpty(tableGames))  return done({ err: 400, status: 'Table games are empty.'});
    if (!_.isArray(tableGames)) return res.badRequest({ code: 400, status: `Parameter [table_games] expected to be an array but receives ${ typeof bets }` });

    const tasks = {
      // Verify user token
      verifyToken: (next) => {
        JwtService.valid(token)
          .then((token) => next(null, { request: req, id: token.id }))
          .catch((err) => {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return res.forbidden();
          });
      },
      // Save Taiwan game payouts
      saveTwTableGames: ['verifyToken', (arg, next) => {
        operatorSvc.save_tw_table_games(tableGames, (err, result) => {
          if (err) {
            console.error(new Error(`Error encountered: ${ JSON.stringify(err) }`));
            return res.serverError({ code: 500, status: 'Internal Server Error', data: err });
          }
          return next(null, result);
        })
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, result) => res.json({
        code: err ? 401 : 200,
        status: err ? 'Operators table games creation failed' : 'Table games creation successful'
      })
    );
  },

};
