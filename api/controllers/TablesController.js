/**
 * TablesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const _SYFER_ = require("../helpers/encryption-helper");

module.exports = {

  // GET /tables | get all tables from cache from the websocket
  getAllTables: async (req, res) => {
    const reqip = req.headers["x-forwarded-for"] || req.ip;
    const token = req.body.token;
    const currentDate = moment().format('YYYY-MM-DD');
    // const user = await JwtService.valid(token).catch((err) => {});

    const tasks = {
      tableList: async (next) => {
        const regx = /["{}]/ig;
        let values = [];
        let tables = await Tablelist.find()
          .populateAll()
          .intercept((err) => {
            return next(err);
          });

        /*
         Fix link of video URLS, database have different format,
         Adjusting changes to array values
        */
        tables.forEach((v, i) => {
          let newLink;
          if(v.cn_video){
            newLink = _.replace(v.cn_video, regx, '');
            newLink = newLink.split(',');
            v.cn_video = newLink;
          }
          if(v.sea_video){
            newLink = _.replace(v.sea_video, regx, '');
            newLink = newLink.split(',');
            v.sea_video = newLink;
          }
          if(v.nea_video){
            newLink = _.replace(v.nea_video, regx, '');
            newLink = newLink.split(',');
            v.nea_video = newLink;
          }
        })
        return next(null, tables);
      },
      getCachedTotal: ["tableList", async (results, next) => {
        const tables = results.tableList;
        let values = [];
        tables.forEach((v, i) => {
          CacheService.get('total_' + v.tablenumber, (err, cached) => {
            if (err)
              return next(err);
            let entity = {
              tablenumber: v.tablenumber,
              results: cached ? cached.totalResult : null
            };
            values.push(entity);
            if (i === tables.length - 1) {
              return next(null, values);
            }
          });
        });
      }],
      getCachedRoads: ["tableList", async (results, next) => {
        const tables = results.tableList;
        let values = [];
        tables.forEach((v, i) => {
          CacheService.get('road_' + v.tablenumber, (err, cached) => {
            if (err)
              return next(err);
            let road = null;
            let shoe = null;
            if (cached) {
              road = cached.road;
              shoe = _.last(road);
              if(shoe)
                shoe = shoe.shoeGame;
            }
            let entity = {
              tablenumber: v.tablenumber,
              road: road,
              shoe: shoe
            };
            values.push(entity);
            if (i === tables.length - 1) {
              return next(null, values);
            }
          });
        })
      }],
      getCachedPlayers: ["tableList", (results, next) => {
        const currentDate = process.env.NODE_ENV === 'development' ? moment().format('YYYY-MM-DD') : moment().utc().format('YYYY-MM-DD');
        const tables = results.tableList;
        let values = []
        tables.forEach((v, i) => {
          let cacheKey = 'players_in_table_' + v.tablenumber + '_' + currentDate
          CacheService.get(cacheKey, (err, cached) => {
            if (err)
              return next(err);

            let entity = {
              tablenumber: v.tablenumber,
              players: cached
            }
            values.push(entity)
            if (i === tables.length - 1) {
              return next(null, values);
            }
          })
        })
      }],
      compileValues: ["getCachedTotal", "getCachedRoads", "getCachedPlayers", (results, next) => {
        const tables = results.tableList;
        const a = results.getCachedTotal;
        const b = results.getCachedRoads;
        const c = results.getCachedPlayers;
        const d = _.merge(a, b);
        const e = _.merge(d, c);
        let list = _.map(tables, (v, i) => {
          let tbl = _.find(e, (val, ind) => {
            return val.tablenumber === v.tablenumber;
          });
          let entity = {
            tableNo: v.tablenumber,
            values: {
              shoeNo: tbl.shoe,
              tableName: v.gamename,
              gameType: v.game_code_id.gamecode,
              results: tbl.results,
              road: tbl.road,
              players: tbl.players,
              video_url: {
                china: v.cn_video,
                nea: v.nea_video,
                sea: v.sea_video,
              }
            }
          }
          if (v.tablenumber.includes('P')) {
            entity.isSideBetting = true;
          }
          return entity;
        })
        // Remaps to object to have key names as tablenumber
        let remap = _.mapValues(_.keyBy(list, 'tableNo'), 'values')
        return next(null, remap);
      }]
    };
    async.auto(tasks, (err, results) => {
      if (err) return res.serverError(err);
      return res.json({status: 200, msg: 'Tables retrieved successfully', data: results.compileValues});
    });
  },

  /**
   * Enter table request handling
   * @route POST /tables/enterTable
   * @important Requires Socket Connection
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  enterTable: async (req, res) => {
    console.log("\033[35m", "[ENTER TABLE] === START ===", "\033[0m")
    const params = req.body;
    const REQUIRE_SOCKET = true; // Recommended to set `true`, when false joining room is disabled
    let tasks, room, tableNumber;

    // Validators
    if (REQUIRE_SOCKET) {
      // Make sure this is a socket request (not traditional HTTP)
      if (!req.isSocket) return res.badRequest({ err: 'Invalid Protocol' });
    }
    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid Parameter: [token]" });
    if (_.isUndefined(params.tableid))
      return res.badRequest({ err: "Invalid Parameter: [tableid]" });

    // Pre-setting variables
    tableNumber = params.tableid;
    room = 'table_' + tableNumber;
    tasks = {
      // Verify token
      verifyToken: async function (cb) {
        console.log("\033[35m", "[ENTER TABLE] Step 1 - Validate Token", "\033[0m")
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },

      // Check table if existing in the database
      verifyTable: (cb) => {
        console.log("\033[35m", "[ENTER TABLE] Step 2 - Verifying table id exist", "\033[0m")
        const query = "SELECT t1.gamecode, t0.studio FROM c_tablelist t0 LEFT JOIN c_gamecodes t1 ON t0.game_code_id = t1.id WHERE t0.tablenumber = $1";
        // Execute query
        Tablelist
          .getDatastore()
          .sendNativeQuery(query, [tableNumber], (err, table) => {
            if (err)
              return cb(err);
            if (_.isEmpty(table.rows))
              return cb("Table not exist.");
            // Return table information
            return cb(null, table.rows[0])
          })
      },

      // Get player I-Chips information
      getUser: ["verifyToken", "verifyTable", async (arg, cb) => {
        console.log("\033[35m", "[ENTER TABLE] Step 3 - Get player information on IChips", "\033[0m")
        await ichipsApi('getUser', {
          username: arg.verifyToken.username,
          user_type: 'MARS',
          game_code: arg.verifyTable.gamecode
        }).then((success) => {
          return cb(null, { data: success.data });
        }, (error) => {
          // I-Chips error handler
          console.log("\033[31m", "<<<<< I-CHIPS EXCEPTION HANDLER >>>>>", "\033[0m");
          console.log("\033[31m", "REASON:", new Error(error), "\033[0m");
          return cb("Something wrong with the I-Chips connection");
        });
      }],

      // Update table location of player
      updateStatus: ["verifyToken", "getUser", async (arg, cb) => {
        console.log("\033[35m", "[ENTER TABLE] Step 4 - Update player location, and other IChips related data.", "\033[0m")

        let user = await Users
          .update({ id: arg.verifyToken.id })
          .set({
            min_bet_limit: arg.getUser.data.chip_limit.min,
            max_bet_limit: arg.getUser.data.chip_limit.max,
            balance: arg.getUser.data.user.balance,
            table_location: tableNumber
          })
          .fetch()
          .intercept((err) => {
            return cb(err);
          });

        return cb(null, user);
      }],

      // Broadcast to other player that "I'm here!"
      getPlayers: ["verifyToken", "updateStatus", (arg, cb) => {
        console.log("\033[35m", "[ENTER TABLE] Step 5 - Broadcast to other player", "\033[0m")
        let players = [];
        Users.find({
          where: { logged: 1, table_location: tableNumber, is_sidebet: 0 },
          select: ['nickname', 'balance', 'imgname', 'imgname_mobile', 'wins', 'win_amount', 'currency', 'winningstreak', 'min_bet_limit', 'max_bet_limit']
        }).exec(async (err, user) => {
          if (err) {
            console.log("\033[31m", "ERROR: Failed getting player's info for broadcast.", JSON.stringify(err), "\033[0m");
            return cb("Failed getting player's info for broadcast.");
          }

          players = user;

          // Encrypt player's ID
          _.map(players,  (v) => { v.id = _SYFER_.custom.encrypt(v.id.toString()) });

          // If the connection is typical API request, joining room is not possible
          // because it requires you to connect as Socket
          if (REQUIRE_SOCKET) {
            await socketHelper('join', { room: room, req: req, user: arg.verifyToken.id });
          }

          // Broadcast new list of players and join room
          await socketHelper('blast', { event: 'table_players', values: { tableNumber, playersList: players }});

          // Return player information
          return cb(null, players);
        });
      }],
      playerLocation: ["getPlayers", "verifyToken", (arg, cb) => {
        console.log("\033[35m", "[ENTER TABLE] Step 6 - Broadcast Player Count", "\033[0m")
        let USER_COUNT;

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
            // Push new user on table
            USER_COUNT[tableNumber].players.push({
              id: arg.verifyToken.id,
              ttl: null
            });
            // Remove duplicates
            USER_COUNT[tableNumber].players = _.uniqBy(USER_COUNT[tableNumber].players, 'id');

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
    async.auto(tasks, async (err, results) => {
      console.log("\033[35m", "[ENTER TABLE] === END ===", "\033[0m")
      if (err)
        return res.badRequest({ status: 400, data: [], msg: err });

      return res.json({
        status: 200,
        data: results.getPlayers,
        chipLimit: results.getUser,
        msg: 'Successful'
      });
    });
  },


  /**
   * Exit table request handling
   * @route POST /tables/exitTable
   * @important Requires Socket Connection
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  exitTable: async (req, res) => {
    console.log("\033[35m", "[EXIT TABLE] === START ===", "\033[0m")
    const params = req.body;
    const REQUIRE_SOCKET = true; // Recommended to set `true`, when false joining room is disabled
    let tasks, room, tableNumber, previousTable;

    // Validators
    if (REQUIRE_SOCKET) {
      // Make sure this is a socket request (not traditional HTTP)
      if (!req.isSocket) return res.badRequest({ err: 'Invalid Protocol' });
    }
    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid Parameter: [token]" });
    if (_.isUndefined(params.tableid))
      return res.badRequest({ err: "Invalid Parameter: [tableid]" });

    // Pre-setting variables
    tableNumber = params.tableid;
    room = 'table_' + tableNumber;
    tasks = {
      // Verify token
      verifyToken: async function (cb) {
        console.log("\033[35m", "[EXIT TABLE] Step 1 - Verify token", "\033[0m")
        await JwtService.valid(params.token)
          .then((token) => {
            previousTable = token.table_location;
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },

      // Check table if existing in the database
      verifyTable: async (cb) => {
        console.log("\033[35m", "[EXIT TABLE] Step 2 - Verify if table exist", "\033[0m")
        const query = "SELECT t1.gamecode, t0.studio FROM c_tablelist t0 LEFT JOIN c_gamecodes t1 ON t0.game_code_id = t1.id WHERE t0.tablenumber = $1";
        // Execute query
        await sails
          .sendNativeQuery(query, [tableNumber], (err, table) => {
            if (err)
              return cb(err);
            if (_.isEmpty(table.rows))
              return cb("Table not exist.");
            // Return table information
            return cb(null, table.rows[0])
          })
      },

      // Update table location of player
      updateStatus: ["verifyToken", async (arg, cb) => {
        console.log("\033[35m", "[EXIT TABLE] Step 3 - Update players table location", "\033[0m")

        let user = await Users
          .update({
            id: arg.verifyToken.id
          })
          .set({
            table_location: "Lobby"
          })
          .fetch()
          .intercept((err) => {
            return cb(err);
          });

        return cb(null, user);
      }],

      // Broadcast to other player that "I'm not here!"
      getPlayers: ["verifyToken", "updateStatus", async (arg, cb) => {
        console.log("\033[35m", "[EXIT TABLE] Step 4 - Broadcast to other players", "\033[0m")
        await Users.find({
          where: { logged: 1, table_location: tableNumber, is_sidebet: 0 },
          select: ['nickname', 'balance', 'imgname', 'imgname_mobile', 'avatar', 'wins', 'win_amount', 'currency', 'winningstreak', 'min_bet_limit', 'max_bet_limit']
        })
          .then(async (players) => {
            // Encrypt player's ID
            _.map(players,  (v) => { v.id = _SYFER_.custom.encrypt(v.id.toString()) });

            if (REQUIRE_SOCKET) {
              // Leave sockets broadcast for this table
              await sails.helpers.socketHelper('leave', { room: room, req: req, user: arg.verifyToken.id });
              await sails.helpers.socketHelper('leave', { room: 'ChatRoomOfTable_' + tableNumber, req: req, user: arg.verifyToken.id});
            }
            // Broadcast new list of players and join room
            await socketHelper('blast', { event: 'table_players', values: { tableNumber, playersList: players }});

            // Return player information
            return cb(null, players);
          })
          .catch((err) => {
            console.log("\033[31m", "ERROR: Failed getting player's info for broadcast.", JSON.stringify(err), "\033[0m");
            return cb("Failed getting player's info for broadcast.");
          })
      }],

      playerLocation: ["getPlayers", "verifyToken", (arg, cb) => {
        let USER_COUNT;

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
            // Remove duplicates
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
    async.auto(tasks, async (err, results) => {
      console.log("\033[35m", "[EXIT TABLE] === END ===", "\033[0m")
      if (err)
        return res.badRequest({ status: 400, data: [], msg: err });

      return res.json({
        status: 200,
        msg: 'Successfully Logout'
      });
    });
  },

  // POST /tables/tableData
  getTableData: async (req, res) => {
    const token = req.body.token;
    const tableid = req.body.tableid;
    // const user = await JwtService.valid(token).catch((err) => {});;
    const currentDate = moment().format('YYYY-MM-DD');
    const tasks = {
      getCachedTable: (next) => {
        CacheService.get('tables', (e, r) => {
          if (e)
            return next(e);
          let table = _.pick(r.tables, tableid);
          return next(null, table[tableid]);
        })
      },
      getPlayers: (next) => {
        let players = [];
        CacheService.get('players_in_table_' + tableid + '_' + currentDate, (err, res) => {
          if (err)
            return next(err);
          res.forEach(async (value, index, arr) => {
            let item = await Users.findOne({
              select: ['balance', 'nickname', 'imgname', 'imgname_mobile', 'avatar'],
              where: {id: value}
            }).intercept((err) => { return next(err) });
            item.id = await syfer('encrypt', item.id);
            players.push(item);
            if (index === arr.length -1){
              players = _.orderBy(players, 'balance', 'desc');
              return next(null, players);
            }
          })
        })
      },
      collectData: ['getCachedTable', 'getPlayers', (results, next) => {
        let obj = {
          table: results.getCachedTable,
          players: results.getPlayers
        };
        return next(null, obj);
      }]
    }

    async.auto(tasks, (err, results) => {
      if (err) return res.json({status: 400, data: null, msg: err});
      return res.json({status: 200, data: results.collectData, msg: 'Table successfully retrieved'});
    })
  },

  /**
   * Get Player inside tables
   * @param req
   * @param res
   * @returns {Promise<never>}
   * @routes POST /tables/players
   */
  getPlayersInTables: async (req, res) => {
    let params = req.body;
    let tasks;

    // Make sure this is a socket request (not traditional HTTP)
    // if (!req.isSocket) return res.badRequest({ err: 'Forbidden Request' });

    // Validators
    if (_.isUndefined(params.token))
      return res.badRequest({ err: true, statusText: 'Invalid Parameter: [token]'});
    // if (_.isUndefined(params.tableNumber))
    //   return res.badRequest({ err: true, statusText: 'Invalid Parameter: [tableNumber]'});

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
      // Get player task
      getPlayers: ['verifyToken', (arg, cb) => {
        // let tableNumber = params.tableNumber;
        // let players = [];
        // Users.find({
        //   where: { logged: 1, table_location: _.isUndefined(tableNumber) ? "Lobby" : tableNumber, is_sidebet: 0},
        //   select: ['nickname', 'balance', 'imgname', 'imgname_mobile', 'avatar', 'wins', 'win_amount', 'currency', 'winningstreak', 'min_bet_limit', 'max_bet_limit']
        // }).exec((err, data) => {
        //   if (err)
        //     return cb(err);
        //
        //   players = data;
        //   // Encrypt all ID
        //   _.map(players, (o) => {
        //     o.id = _SYFER_.custom.encrypt(o.id)
        //   });
        //   return cb(null, players);
        // });

        CacheService.get("player_location_cached", (err, token) => {
          if (err)
            return cb(err);

          return cb(null, token);
        })

      }]
    };

    // Execute tasks
    async.auto(tasks, (err, results) => {
      if (err) return res.badRequest({ err: err });
      return res.json({ err: err, players: results.getPlayers });
    })
  },


  /**
   * Set table information
   * @route PUT /tables/information
   * @param req
   * @param res
   */
  updateTable: (req, res) => {
    const params = req.body;
    let updatePayload;

    // Validators
    if (_.isUndefined(params.tableNumber))
      return res.badRequest({ err: "Invalid Parameter: [tableNumber]" });
    if (_.isUndefined(params.params))
      return res.badRequest({ err: "Invalid Parameter: [params]" });

    // Pre-setting variables
    updatePayload = params.params;

    // Set videoUrl to String format when saving on database
    if (!_.isUndefined(updatePayload.cn_video))
      _.merge(updatePayload, { cn_video: JSON.stringify(updatePayload.cn_video || []) });

    if (!_.isUndefined(updatePayload.sea_video))
      _.merge(updatePayload, { sea_video: JSON.stringify(updatePayload.sea_video || []) });

    if (!_.isUndefined(updatePayload.nea_video))
      _.merge(updatePayload, { nea_video: JSON.stringify(updatePayload.nea_video || []) });

    // Remove all protected fields
    updatePayload = _.omit(updatePayload, ["id", "created_at", "updated_at"]);

    // Execute query
    Tablelist.updateOne({ tablenumber: params.tableNumber })
      .set(updatePayload)
      .then((table) => {
        return res.json({
          message: "Table information updated.",
          data: table
        });
      })
      .catch((err) => {
        return res.serverError({
          err: err,
          message: "Table information update failed."
        });
      })
  },

  // POST /tables/sideBet
  sideBet: async (req, res) => {
    const params = req.body;
    let tableNumber;

    if (_.isUndefined(params.token))
      return req.badRequest({ status: 400, err: "Invalid Parameter: [token]" });
    if (_.isUndefined(params.tableid))
      return req.badRequest({ status: 400, err: "Invalid Parameter: [tableid]" });

    tableNumber = params.tableid;

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

      updateUser: ["verifyToken", async (arg, next) => {
        await Users
          .update({ id: arg.verifyToken.id }, { is_sidebet: 1 })
          .intercept((err) => {
            return next(err);
          })

        async.waterfall([
          async (cb) => {
            await syfer('encrypt', arg.verifyToken.id).then((res) => { return cb(null, res); })
          }
        ], (err) => {
          return next(err, 'ok')
        })
      }],

      playerLocation: ["updateUser", "verifyToken", (arg, cb) => {
        let USER_COUNT;

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
            // Push new user on table
            USER_COUNT[tableNumber].players.push({
              id: arg.verifyToken.id,
              ttl: null
            });
            // Remove duplicates
            USER_COUNT[tableNumber].players = _.uniqBy(USER_COUNT[tableNumber].players, 'id');

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
    }

    async.auto(tasks, (err, results) => {
      if (err) return res.json({status: 400, msg: err, data: null});
      return res.ok({status: 200, data:'', msg: 'Entered Sidebet successfully'});
    })
  },

  updateOnGamePlayer : (req, res) => {
    let params = req.body;
    let task, token, query, list;

    // Make sure this is a socket request (not traditional HTTP)
    if (!req.isSocket)
      return res.badRequest();

    //Validators
    if(_.isUndefined(params.token))
      return res.badRequest({err: '[token]: Invalid parameter.', status: 400});

    task = {
      // Verify tokens
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      // Update player
      updateOnGamePlayer: ['verifyToken', async (arg, cb) => {
        await async.waterfall([
          // Get players on every table and get all table
          async (cb) => {
            query = "SELECT t0.id, t0.nickname, t0.balance, t0.avatar_pc AS `imgname`, t0.avatar_mobile AS `imgname_mobile`, t0.wins, t0.win_amount, t0.currency, t0.winningstreak, t0.min_bet_limit, t0.max_bet_limit,t0.table_location FROM t_user t0 WHERE t0.is_sidebet = 0 AND t0.table_location NOT IN ('Lobby') ORDER BY t0.table_location ASC;" +
              "SELECT t1.tablenumber AS `table_location` FROM c_tablelist t1;";
            return await Users.getDatastore().sendNativeQuery(query, [], cb);
          },
          // Start mapping all available tables
          async (d0, cb) => {
            // Set list as an array
            list = [];
            // Encrypt id of players
            await async.eachSeries(d0.rows[0], async (i, cb) => {
              list.push(Object.assign(_.omit(i, ['id']), {id: await syfer('encrypt', i['id'])}));
              return cb();
            });
            // Loop table arrays
            await async.eachSeries(d0.rows[1], async (i, cb) => {
              try {
                // Blast to all table players
                if (i.table_location !== 'Lobby') {
                  await socketHelper('blast', {
                    event: 'table_players',
                    values: {
                      tableNumber: i.table_location,
                      playersList: _.filter(list, { table_location: i.table_location })
                    }
                  });
                  return cb();
                }
              } catch(ex) {
                return cb(ex);
              }
            }, cb);
          }
        ], cb);
      }]
    };

    // Execute task
    async.auto(task, (err) => {
      return res.json({ err: err, status: err ? 400 : 200 });
    });
  },
  getTableVideoURL : (req, res) => {
    let params = req.body;

    const tasks = {
      getTable: async (next) => {
        let table = await Tablelist.findOne({tablenumber: params.tablenumber}).intercept((err) => { return next(err) })
        if (!table) return next('Table not found')
        let data = {
          gamename: table.gamename,
          tablenumber: table.tablenumber,
          cn_video: table.cn_video,
          sea_video: table.sea_video,
          nea_video: table.nea_video
        }
        return next(null, data)
      }
    }

    async.auto(tasks, async (err, results) => {
      if (err) return res.json({status: 400, msg: err});
      return res.ok({status: 200, data: results.getTable});
    })
  },
  tableEvent: async (req, res) => {
    let params = req.body;
    let id = (params.tableId || params.id) || params.tableNumber // Allow input of any of the parameters. Can accept integer ID value or string tablenumber
    id = isNaN(+id) ? id : +id; // Determine wether submitted is an id number or tablenumber;
    try {
      const table = await Tablelist.findOne(typeof id === "number" ? { id } : { tablenumber: id })
      const value = table.event ? 0 : 1;
      const updates = await Tablelist.updateOne(typeof id === "number" ? { id } : { tablenumber: id })
      .set({ event: value })
      return res.ok(`Event for table ${table.tablenumber} is successfully ${value ? "enabled" : "disabled"}.`)

    } catch (e) {
      return res.serverError(e)
    }
  },
};
