/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also do this by creating a hook.
 *
 * For more information on bootstrapping your app, check out:
 * https://sailsjs.com/config/bootstrap
 */
const cron = require('node-cron');
const GAME_CONFIG_KEY = 'GAME_CONF';
const { setWsHeartbeat } = require("ws-heartbeat/client");

module.exports.bootstrap = async function(done) {
  global.ATHENS_VERSION = '2.0.71.0000';
  global._ = require('lodash');
  global.bcrypt = require('bcrypt');
  global.moment = require('moment');
  global.jwt = require('jsonwebtoken');
  global.schedule = require('node-schedule');
  global.crypt = require('crypto');
  global.request = require('request');
  global.WebSocket = require('ws');
  global.socketHelper = sails.helpers.socketHelper;
  global.camelfyHelper = sails.helpers.camelfyHelper;
  global.balanceUpdate = sails.helpers.balanceUpdate;
  global.winlossTotal = sails.helpers.winlossTotal;
  global.syfer = sails.helpers.encryptionHelper;
  global.ichipsApi = sails.helpers.ichipsApiHelper;
  global.log = sails.helpers.logHelper;
  global.athensUTC = '+00:00';
  global.tables = {};
  global.tableSerializer = {
    idToNumber: {},
    numberToId: {}
  };
  global.servers = {};
  global.flag = {
    isTableInit: false,
    isPlayerCacheInit: false,
    isNLPTokenInit: {
      token: "",
      status: "NOT_SET"
    },
    isPlayerStatusInit: false,
    isGameAppInit: false,
    betting: {
      throttle: false,
      seconds: 0
    }
  };
  global.JSONParse = function(json) {
    try { return JSON.parse(json); } catch (e) { return null; }
  };
  global.JSONStringify = function(json) {
    try { return JSON.stringify(json); } catch (e) { return null; }
  };

  /***********************
   * Load utilities
   ***********************/
  const utils = require('include-all')({
    dirname: process.cwd() + '/api/utils',
    filter: /(.+)\.js$/,
    excludeDirs: /^\.(git|svn)$/,
    optional: true
  });

  for (let util in utils) {
    Object.defineProperty(global, util, {
      get: function() { return utils[util]; },
      enumerable: true
    });
  }

  let NLPToken;
  let tasks = {
    /*
     _____        _  _    _         _  _             _____  _               _  _          _____       _      _
    |_   _|      (_)| |  (_)       | |(_)           /  ___|| |             | |(_)        |_   _|     | |    | |
      | |  _ __   _ | |_  _   __ _ | | _  ____ ___  \ `--. | |_  _   _   __| | _   ___     | |  __ _ | |__  | |  ___  ___
      | | | '_ \ | || __|| | / _` || || ||_  // _ \  `--. \| __|| | | | / _` || | / _ \    | | / _` || '_ \ | | / _ \/ __|
     _| |_| | | || || |_ | || (_| || || | / /|  __/ /\__/ /| |_ | |_| || (_| || || (_) |   | || (_| || |_) || ||  __/\__ \
     \___/|_| |_||_| \__||_| \__,_||_||_|/___|\___| \____/  \__| \__,_| \__,_||_| \___/    \_/ \__,_||_.__/ |_| \___||___/
    */
    pullTable: (cb) => {
      console.log("\033[36m", "Initializing Studio Tables...", "\033[0m");
      let USER_COUNT = {
        lobby: { studio: '', gameCode: '', players: [] }
      };

      sails
        .sendNativeQuery("SELECT t0.id, t0.tablenumber, t0.studio, t1.gamecode FROM c_tablelist t0 LEFT JOIN c_gamecodes t1 ON t0.game_code_id = t1.id WHERE t0.studio = $1", ['prestige'])
        .exec((err, data) => {
          if (err) return cb(err);

          // Prepare all tables
          _.map(data.rows, (o) => {
            _.assign(USER_COUNT, {
              [o.tablenumber]: {studio: o.studio, players: [], gameCode: o.gamecode}
            });

            _.merge(tables, {
              [o.tablenumber]: { gameCode: o.gamecode }
            });

            // Add serialize of table id to table number
            _.assign(tableSerializer.idToNumber, { [o.id]: o.tablenumber })
            // Add serializer of table number to table id
            _.assign(tableSerializer.numberToId, { [o.tablenumber]: o.id })
          });

          _.set(flag, 'isTableInit', true);
          return cb(null, USER_COUNT);
        })
    },
    setCache: ["pullTable", (arg, cb) => {
      console.log("\033[36m", "Setting table cache...", "\033[0m");
      CacheService.set("player_location_cached", arg.pullTable, -1, cb)
    }],

    /*
     _____        _     _   _  _     ______   _____       _
    /  ___|      | |   | \ | || |    | ___ \ |_   _|     | |
    \ `--.   ___ | |_  |  \| || |    | |_/ /   | |  ___  | | __ ___  _ __
     `--. \ / _ \| __| | . ` || |    |  __/    | | / _ \ | |/ // _ \| '_ \
    /\__/ /|  __/| |_  | |\  || |____| |       | || (_) ||   <|  __/| | | |
    \____/  \___| \__| \_| \_/\_____/\_|       \_/ \___/ |_|\_\\___||_| |_|

    */
    setNLPToken: ["setCache", (arg, cb) => {
      // NLPToken = process.env.NODE_ENV !== 'production' ? 'f515d7567540bc0a89ba034576024e03' : '6f0a964bafdabb7aa334bea377e37b0a';
      NLPToken = process.env.NODE_ENV !== 'production' ? '817b61908731676139dbfc310bd4a1f2' : '817b61908731676139dbfc310bd4a1f2';
      _.set(flag, 'isPlayerCacheInit', true);
      console.log("\033[36m", "Setting NLP Token...", "\033[0m");
      CacheService.set("NLP_TOKEN", NLPToken, -1, cb)
    }],


    /*
    ______                  _    ______  _                             _____  _          _
    | ___ \                | |   | ___ \| |                           /  ___|| |        | |
    | |_/ / ___  ___   ___ | |_  | |_/ /| |  __ _  _   _   ___  _ __  \ `--. | |_  __ _ | |_  _   _  ___
    |    / / _ \/ __| / _ \| __| |  __/ | | / _` || | | | / _ \| '__|  `--. \| __|/ _` || __|| | | |/ __|
    | |\ \|  __/\__ \|  __/| |_  | |    | || (_| || |_| ||  __/| |    /\__/ /| |_| (_| || |_ | |_| |\__ \
    \_| \_|\___||___/ \___| \__| \_|    |_| \__,_| \__, | \___||_|    \____/  \__|\__,_| \__| \__,_||___/
                                                    __/ |
                                                   |___/
     */
    resetPlayerLoginStatus: ["setNLPToken", async (arg, cb) => {
      _.set(flag, 'isNLPTokenInit', { token: NLPToken, status: "SET" });
      console.log("\033[36m", "Resetting players online status...", "\033[0m");
      await Users
        .update({})
        .set({
          logged: 0,
          table_location: "Lobby"
        })
        .intercept((error) => {
          return cb(error);
        });

      _.set(flag, 'isPlayerStatusInit', true);
      return cb();
    }],

    /*
     _____                                   _     _           _____                           ___
    /  __ \                                 | |   | |         |  __ \                         / _ \
    | /  \/  ___   _ __   _ __    ___   ___ | |_  | |_  ___   | |  \/  __ _  _ __ ___    ___ / /_\ \ _ __   _ __
    | |     / _ \ | '_ \ | '_ \  / _ \ / __|| __| | __|/ _ \  | | __  / _` || '_ ` _ \  / _ \|  _  || '_ \ | '_ \
    | \__/\| (_) || | | || | | ||  __/| (__ | |_  | |_| (_) | | |_\ \| (_| || | | | | ||  __/| | | || |_) || |_) |
     \____/ \___/ |_| |_||_| |_| \___| \___| \__|  \__|\___/   \____/ \__,_||_| |_| |_| \___|\_| |_/| .__/ | .__/
                                                                                                    | |    | |
                                                                                                    |_|    |_|
    */
    connectToGameApp: ["setNLPToken", (arg, cb) => {
      console.log("\033[36m", "Connecting to GameApp Server...", "\033[0m");
      const gameAppName = "GAME_APP_SERVER";

      CONNECT();

      function CONNECT() {
        const gameApp = new WebSocket(sails.config.services.gameapp)

        setWsHeartbeat(gameApp, '{"heartBeat":"PING"}', {
          pingTimeout: 60000, // in 60 seconds, if no message accepted from server, close the connection.
          pingInterval: 25000, // every 25 seconds, send a ping message to the server.
        });

        gameApp.on('open', (ws, req) => {
          // Check if the current server is connected previously and warned that the connection has been refreshed
          if (servers[gameAppName]) {
            console.log("\033[33mWARNING: Connection to", gameAppName.toUpperCase(), "has been refreshed.\033[0m");
          }
          // Save GameApp server's websocket connection
          servers[gameAppName] = ws;

          _.set(flag, 'isGameAppInit', true);

          console.log("\033[46m\033[30mSubscribed to Game-App Server [", gameAppName.toUpperCase(), "]\033[0m");
          console.log("\033[36m" + gameAppName.toUpperCase(), "URL:", sails.config.services.gameapp, "\033[0m");
        });

        gameApp.on('message', (data) => {
          // Handles GameApp servers messages
          let parsedData = JSONParseSafe(data)

          if (parsedData) {
            if (parsedData.action === "table") {
              // console.log("GAME APP SERVER BROADCAST:", parsedData.data)
              _.merge(tables, parsedData.data)
            }
          }

        });

        gameApp.on('close', () => {
          console.info("Connection to %s game server closed. Reconnecting...");
          // Reconnect within 1 second
          setTimeout(() => {
            CONNECT();
          }, 1000);
        });

        gameApp.on('error', (err) => {
          console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
          console.log("\033[41m\033[30m<<< ERROR CONNECTING TO GAME-APP SERVER >>>\033[0m");
          console.log("\033[41m\033[30mREASON:", err.code, "\033[0m");
          console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
          gameApp.close();
        });
      }

      return cb()
    }],


    loadConfig: ['connectToGameApp', (arg, next) => {
      const query = 'SELECT * FROM t_settings t0 WHERE t0.CANCELLED = 0;';
      let tasks;

      tasks = {
        // Get configuration from database
        configFromDB: (next) => {
          sails.sendNativeQuery(query, [], next);
        },
        // Logical json format compatible with desktop
        formatConfig: ['configFromDB', (arg, next) => {
          let { rows } = arg.configFromDB;
          let finalConfig = {};

          // Check if the database has configuration
          if (!_.size(rows)) {
            console.warn('No configuration file pulled from database. Setting Default');
            return next();
          }

          for (let i = 0; i < rows.length; i++ ) {
            let config = rows[i];

            // If the setting is already registered follow weighing condition
            if (_.has(finalConfig, config.setting)) {

              // Check the effectivity of previous registered config
              let compareDate = moment().utc();
              let startDate   = moment(config['start_effectivity'], "YYYY-MM-DDTHH:mm:ss");
              let endDate     = moment(config['end_effectivity'], "YYYY-MM-DDTHH:mm:ss");

              // If the current configuration is set today, priority
              if (compareDate.isBetween(startDate, endDate)) {
                // Replace the existing record
                finalConfig[config.setting] = JSON.parse(JSONParse(config.value) || '{}')
              }
            } else {
              // Add to configuration
              _.assign(finalConfig, { [config.setting]: JSON.parse(JSONParse(config.value) || '{}')} )
            }
          }
          return next(null, finalConfig);
        }],
        // Save to cache
        saveToCache: ['formatConfig', (arg, next) => {
          // Cache the configuration file
          CacheService.set(GAME_CONFIG_KEY, arg.formatConfig, -1, next);
        }]
      };

      async.auto(tasks, next);
    }]
  };

  async.auto(tasks, (err) => {
    if (err)
      return done(err);

    console.log(`ATHENS API v${ATHENS_VERSION}`);
    console.log("\033[30m\033[46m", "INITIALIZATION COMPLETE", "\033[0m");
    return done();
  });

  // By convention, this is a good place to set up fake data during development.
  //
  // For example:
  // ```
  // // Set up fake development data (or if we already have some, avast)
  // if (await User.count() > 0) {
  //   return done();
  // }
  //
  // await User.createEach([
  //   { emailAddress: 'ry@example.com', fullName: 'Ryan Dahl', },
  //   { emailAddress: 'rachael@example.com', fullName: 'Rachael Shaw', },
  //   // etc.
  // ]);
  // ```
  //
  // CacheService.get('player_counts', async (err, res) => {
  //   if (!res) {
  //     let tables = await Tablelist.find({disabled: 0, studio: 'prestige'});
  //     let gamecodes = await Gamecodes.find();
  //     let studio = {
  //       'prestige': [],
  //       'classic': [],
  //       'grand': []
  //     }
  //     let countPerTable = {};
  //     let countPerGame = {};
  //     countPerTable['Lobby'] = []
  //     for (let i = 0; i < tables.length; i++) {
  //       countPerTable[tables[i].tablenumber] = [];
  //     }
  //
  //     for (let i = 0; i < gamecodes.length; i++) {
  //       countPerGame[gamecodes[i].gamecode] = [];
  //     }
  //
  //     CacheService.set('player_counts', {tables: countPerTable, gamecode: countPerGame, studio: studio}, 60 * 60 * 24, (err, result) => {})
  //   }
  // });

  // Don't forget to trigger `done()` when this bootstrap function's logic is finished.
  // (otherwise your server will never lift, since it's waiting on the bootstrap)
  // return done();

};

/**
 * @return {null}
 */
function JSONParseSafe (json) {
  try { return JSON.parse(json) } catch (e) { return null }
}
