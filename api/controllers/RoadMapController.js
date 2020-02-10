/**
 * RoadMapController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const $help = sails.helpers;
var arbiter = null;
var canvasRd = {};
module.exports = {
  getRoadMapTest: function (req, res) {
    return res.json({
      beadRoad: { canvass: [], lastResult: {}, list: [] },
      bigRoad: { canvass: [], lastResult: {}, list: [] },
      bigEyeRoad: { canvass: [], lastResult: {}, list: [] },
      smallRoad: { canvass: [], lastResult: {}, list: [] },
      cockroachRoad: { canvass: [], lastResult: {}, list: [] },
      statistic: {
        predict: {
          blue: { bigEyeRoad: '', smallRoad: '', cockroachRoad: '' },
          red: { bigEyeRoad: '', smallRoad: '', cockroachRoad: ''}
        },
        demographic: {
          beadRoad: { blue: 0, red: 0, green: 0, blue_pair: 0, red_pair: 0, green_pair: 0, s6: 0 },
          bigRoad: { blue: 0, red: 0, green: 0, blue_pair: 0, red_pair: 0, green_pair: 0, s6: 0 }
        },
        isRoadEmpty: {
          bigRoad: false
        }
      }
    })
  },

  getRoadMapV2: function (req, res) {

  },

  /**
   * Process Road Map
   * @param req
   * @param res
   * @route POST /getRoadMaps
   * @return {*}
   */
  getRoadMap: function (req, res) {
    let params = req.body;
    let returnFilter = [];
    let roadCacheKey;

    // Validators
    if (_.isUndefined(params.tableNumber))
      return res.badRequest('Invalid Parameter: [tableNumber]');
    if (_.isUndefined(params.gameName))
      return res.badRequest('Invalid Parameter: [gameName]');
    if (_.isUndefined(params.shoeHand))
      return res.badRequest('Invalid Parameter: [shoeHand]');
    if (_.isUndefined(params.token))
      return res.badRequest('Invalid Parameter: [token]');

    // Pre-setting variables
    roadCacheKey  = "road_" + params.tableNumber;

    // Road Tasks
    let tasks = {
      verifyToken: async function (cb) {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      cacheRoad: ['verifyToken', (arg, cb) => {
        // Get cached road
        // CacheService.get(roadCacheKey, (err, roadMap) => {
        //   // Roulette cache saved by Java-GameServer (Roulette)
        //   let road = JSONParseSafe(roadMap);
        //
        //   if (params.gameName === "roulette") {
        //     // If road map is null return empty array to prevent error exception
        //     return cb(null, road && !!road.road ? road.road[1] : []);
        //   } else {
        //     // If road map is null return empty array to prevent error exception
        //     return cb(null, !_.isNull(roadMap) ? !_.isUndefined(roadMap.road) ? roadMap.road : [] : []);
        //   }
        // })
        //
        CacheService.get(roadCacheKey, (err, roadMap) => {
          if (err)
            return cb(err);

          let rd = _.isObject(roadMap) ? roadMap : _.isNull(roadMap) ? {} : JSONParseSafe(roadMap);

          if (_.isUndefined(rd.road)) {
            console.log("\033[30m\033[43m", "[ INVALID ROAD CACHE ON", params.tableNumber,"]", "\033[0m");
            console.log("\033[30m\033[43m", "[ DATA ON CACHE: ", roadMap ,"]", "\033[0m");
            return cb(null, []);
          } else {
            return cb(null, rd.road);
          }
        })
      }],
      /*
      __________                     .___ __________                    .___
      \______   \  ____  _____     __| _/ \______   \  ____ _____     __| _/
       |    |  _/_/ __ \ \__  \   / __ |   |       _/ /  _ \\__  \   / __ |
       |    |   \\  ___/  / __ \_/ /_/ |   |    |   \(  <_> )/ __ \_/ /_/ |
       |______  / \___  >(____  /\____ |   |____|_  / \____/(____  /\____ |
              \/      \/      \/      \/          \/             \/      \/
       */
      beadRoad: ['cacheRoad', function (arg, cb) {
        let roadKey, payLoad
        //Validators
        if (ConfigValidators(params,'beadRoad', params.gameName)) return cb(null, []);
        // Variable assignment
        roadKey = "beadRoad_" + params.tableNumber + "_" + params.config.beadRoad.row || 0 + "x" + params.config.beadRoad.col || 0;
        payLoad = {
          gameResult: arg.cacheRoad,
          gameName: params.gameName,
          rows: params.config.beadRoad.row || 0,
          columns: params.config.beadRoad.col || 0,
          offset: params.config.beadRoad.offset,
          hasPredict: params.config.beadRoad.hasPredict,
          tableNumber: params.tableNumber,
          type: 'beadRoad'
        };
        // Check for cached roadmap
        async.waterfall([
          (cb) => {
            CacheService.get(roadKey, cb);
          },
          (arg01, cb) => {
            if (arg01) {
              if (arg01.shoeHand === params.shoeHand) {
                console.log("=== BeadRoad from Cache ===");
                return cb(null, arg01.road);
              } else {
                // console.log("=== BeadRoad Generating [Shoe Not Equal] ===");
                $help.roadmapHelper('beadRoad', payLoad).then((response) => {
                  CacheService.set(roadKey, {
                    shoeHand: params.shoeHand,
                    road: response
                  }, function (err) {
                    return cb(err, response);
                  })
                }, (error) => {
                  console.log("ERR_ROAD: BeadRoad =>", JSON.stringify(error));
                  return cb(error);
                });
              }
            } else {
              // console.log("=== BeadRoad Generated ===");
              $help.roadmapHelper('beadRoad', payLoad).then((response) => {
                CacheService.set(roadKey, {
                  shoeHand: params.shoeHand,
                  road: response
                }, function (err) {
                  return cb(err, response);
                })
              }, (error) => {
                console.log("ERR_ROAD: BeadRoad =>", JSON.stringify(error));
                return cb(error);
              });
            }
          }
        ], cb);
      }],
      /*
      __________ .__        __________                    .___
      \______   \|__|  ____ \______   \  ____ _____     __| _/
       |    |  _/|  | / ___\ |       _/ /  _ \\__  \   / __ |
       |    |   \|  |/ /_/  >|    |   \(  <_> )/ __ \_/ /_/ |
       |______  /|__|\___  / |____|_  / \____/(____  /\____ |
              \/    /_____/         \/             \/      \/
       */
      bigRoad: ['cacheRoad', function (arg, cb) {
        let roadKey, payLoad
        //Validators
        if (ConfigValidators(params,'bigRoad', params.gameName)) return cb(null, []);
        // Variable assignment
        roadKey = "bigRoad_" + params.tableNumber + "_" + params.config.bigRoad.row + "x" + params.config.bigRoad.col;
        payLoad = {
          gameResult: arg.cacheRoad,
          gameName: params.gameName,
          rows: params.config.bigRoad.row,
          columns: params.config.bigRoad.col,
          offset: params.config.bigRoad.offset,
          hasPredict: params.config.bigRoad.hasPredict,
          tableNumber: params.tableNumber,
          type: 'bigRoad'
        };
        // Check for cached roadmap
        async.waterfall([
          function (cb) {
            CacheService.get(roadKey, cb);
          },
          function (arg01, cb) {
            if (arg01) {
              if (arg01.shoeHand === params.shoeHand) {
                console.log("=== BigRoad from Cache ===");
                return cb(null, arg01.road);
              } else {
                // console.log("=== BigRoad Generated ===");
                $help.roadmapHelper('bigRoad', payLoad).then((response) => {
                  CacheService.set(roadKey, {
                    shoeHand: params.shoeHand,
                    road: response
                  }, function (err) {
                    return cb(err, response);
                  })
                }, (error) => {
                  console.log("ERR_ROAD: BigRoad =>", JSON.stringify(error));
                  return cb(error);
                });
              }
            } else {
              // console.log("=== BigRoad Generated ===");
              $help.roadmapHelper('bigRoad', payLoad).then((response) => {
                CacheService.set(roadKey, {
                  shoeHand: params.shoeHand,
                  road: response
                }, function (err) {
                  return cb(err, response);
                })
              }, (error) => {
                console.log("ERR_ROAD: BigRoad =>", JSON.stringify(error));
                return cb(error);
              });
            }
          }
        ], cb);
      }],
      /*
      __________ .__        ___________              __________                    .___
      \______   \|__|  ____ \_   _____/___.__.  ____ \______   \  ____ _____     __| _/
       |    |  _/|  | / ___\ |    __)_<   |  |_/ __ \ |       _/ /  _ \\__  \   / __ |
       |    |   \|  |/ /_/  >|        \\___  |\  ___/ |    |   \(  <_> )/ __ \_/ /_/ |
       |______  /|__|\___  //_______  // ____| \___  >|____|_  / \____/(____  /\____ |
              \/    /_____/         \/ \/          \/        \/             \/      \/
       */
      bigEyeRoad: ['bigRoad', function (arg, cb) {
        let roadKey, payLoad
        //Validators
        if (ConfigValidators(params,'bigEyeRoad', params.gameName)) return cb(null, []);
        // Variable assignment
        roadKey = "bigEyeRoad_" + params.tableNumber + "_" + params.config.bigEyeRoad.row + "x" + params.config.bigEyeRoad.col;
        payLoad = {
          gameResult: arg.bigRoad.list,
          gameName: params.gameName,
          rows: params.config.bigEyeRoad.row,
          columns: params.config.bigEyeRoad.col,
          offset: params.config.bigEyeRoad.offset,
          hasPredict: params.config.bigEyeRoad.hasPredict,
          tableNumber: params.tableNumber,
          type: 'bigEyeRoad'
        };
        // Check for cached roadmap
        async.waterfall([
          function (cb) {
            CacheService.get(roadKey, cb);
          },
          function (arg01, cb) {
            if (arg01) {
              if (arg01.shoeHand === params.shoeHand) {
                console.log("=== BigEyRoad from Cache ===");
                return cb(null, arg01.road);
              } else {
                // console.log("=== BigEyRoad Generated ===");
                $help.roadmapHelper('otherRoad', payLoad).then((response) => {
                  CacheService.set(roadKey, {
                    shoeHand: params.shoeHand,
                    road: response
                  }, function (err) {
                    return cb(err, response);
                  })
                }, (error) => {
                  console.log("ERR_ROAD: BigEyeRoad =>", JSON.stringify(error));
                  return cb(error);
                });
              }
            } else {
              // console.log("=== BigEyRoad Generated ===");
              $help.roadmapHelper('otherRoad', payLoad).then((response) => {
                CacheService.set(roadKey, {
                  shoeHand: params.shoeHand,
                  road: response
                }, function (err) {
                  return cb(err, response);
                })
              }, (error) => {
                console.log("ERR_ROAD: BigEyeRoad =>", JSON.stringify(error));
                return cb(error);
              });
            }
          }
        ], cb);
      }],
      /*
        _________                 .__   .__  __________                    .___
       /   _____/  _____  _____   |  |  |  | \______   \  ____ _____     __| _/
       \_____  \  /     \ \__  \  |  |  |  |  |       _/ /  _ \\__  \   / __ |
       /        \|  Y Y  \ / __ \_|  |__|  |__|    |   \(  <_> )/ __ \_/ /_/ |
      /_______  /|__|_|  /(____  /|____/|____/|____|_  / \____/(____  /\____ |
              \/       \/      \/                    \/             \/      \/
       */
      smallRoad: ['bigRoad', function (arg, cb) {
        let roadKey, payLoad
        //Validators
        if (ConfigValidators(params,'smallRoad', params.gameName)) return cb(null, []);
        // Variable assignment
        roadKey = "smallRoad_" + params.tableNumber + "_" + params.config.smallRoad.row + "x" + params.config.smallRoad.col;
        payLoad = {
          gameResult: arg.bigRoad.list,
          gameName: params.gameName,
          rows: params.config.smallRoad.row,
          columns: params.config.smallRoad.col,
          offset: params.config.smallRoad.offset,
          hasPredict: params.config.smallRoad.hasPredict,
          tableNumber: params.tableNumber,
          type: 'smallRoad',
        };
        // Check for cached roadmap
        async.waterfall([
          function (cb) {
            CacheService.get(roadKey, cb);
          },
          function (arg01, cb) {
            if (arg01) {
              if (arg01.shoeHand === params.shoeHand) {
                console.log("=== SmallRoad from Cache ===");
                return cb(null, arg01.road);
              } else {
                // console.log("=== SmallRoad Generated ===");
                $help.roadmapHelper('otherRoad', payLoad).then((response) => {
                  CacheService.set(roadKey, {
                    shoeHand: params.shoeHand,
                    road: response
                  }, function (err) {
                    return cb(err, response);
                  })
                }, (error) => {
                  console.log("ERR_ROAD: SmallRoad =>", JSON.stringify(error));
                  return cb(error);
                });
              }
            } else {
              // console.log("=== SmallRoad Generated ===");
              $help.roadmapHelper('otherRoad', payLoad).then((response) => {
                CacheService.set(roadKey, {
                  shoeHand: params.shoeHand,
                  road: response
                }, function (err) {
                  return cb(err, response);
                })
              }, (error) => {
                console.log("ERR_ROAD: SmallRoad =>", JSON.stringify(error));
                return cb(error);
              });
            }
          }
        ], cb);
      }],
      /*
      _________                   __                                   .__    __________                    .___
      \_   ___ \   ____    ____  |  | _________   ____ _____     ____  |  |__ \______   \  ____ _____     __| _/
      /    \  \/  /  _ \ _/ ___\ |  |/ /\_  __ \ /  _ \\__  \  _/ ___\ |  |  \ |       _/ /  _ \\__  \   / __ |
      \     \____(  <_> )\  \___ |    <  |  | \/(  <_> )/ __ \_\  \___ |   Y  \|    |   \(  <_> )/ __ \_/ /_/ |
       \______  / \____/  \___  >|__|_ \ |__|    \____/(____  / \___  >|___|  /|____|_  / \____/(____  /\____ |
              \/              \/      \/                    \/      \/      \/        \/             \/      \/
       */
      cockroachRoad: ['bigRoad', function (arg, cb) {
        let roadKey, payLoad
        //Validators
        if (ConfigValidators(params,'cockroachRoad', params.gameName)) return cb(null, []);
        // Variable assignment
        roadKey = "cockroachRoad_" + params.tableNumber + "_" + params.config.cockroachRoad.row + "x" + params.config.cockroachRoad.col;
        payLoad = {
          gameResult: arg.bigRoad.list,
          gameName: params.gameName,
          rows: params.config.cockroachRoad.row,
          columns: params.config.cockroachRoad.col,
          offset: params.config.cockroachRoad.offset,
          hasPredict: params.config.cockroachRoad.hasPredict,
          tableNumber: params.tableNumber,
          type: 'cockroachRoad'
        };
        // Check for cached roadmap
        async.waterfall([
          function (cb) {
            CacheService.get(roadKey, cb);
          },
          function (arg01, cb) {
            if (arg01) {
              if (arg01.shoeHand === params.shoeHand) {
                console.log("=== CockroachRoad from Cache ===");
                return cb(null, arg01.road);
              } else {
                // console.log("=== CockroachRoad Generated ===");
                $help.roadmapHelper('otherRoad', payLoad).then((response) => {
                  CacheService.set(roadKey, {
                    shoeHand: params.shoeHand,
                    road: response
                  }, function (err) {
                    return cb(err, response);
                  })
                }, (error) => {
                  console.log("ERR_ROAD: CockRoachRoad =>", JSON.stringify(error));
                  return cb(error);
                });
              }
            } else {
              // console.log("=== CockroachRoad Generated ===");
              $help.roadmapHelper('otherRoad', payLoad).then((response) => {
                CacheService.set(roadKey, {
                  shoeHand: params.shoeHand,
                  road: response
                }, function (err) {
                  return cb(err, response);
                })
              }, (error) => {
                console.log("ERR_ROAD: CockRoachRoad =>", JSON.stringify(error));
                return cb(error);
              });
            }
          }
        ], cb);
      }],
      statistic: ['beadRoad', 'bigRoad', function (arg, cb) {
        if (typeof params.config.statistics === 'undefined') return cb(null, {});
        console.log('Statistics');
        $help.roadmapHelper('statistics', {
          beadRoad: arg.beadRoad.list,
          bigRoad: arg.bigRoad.list,
          tableNumber: params.tableNumber,
          gameName: params.gameName,
          config: params.config.statistics
        }).then( (response) => {
          return cb(null, response);
        }, (error) => {
          return cb(error);
        });
      }]
    };

    // console.time("Road Map Benchmark");
    // Execute Task
    async.auto(tasks, (err, result) => {
      // console.timeEnd("Road Map Benchmark");
      console.log("<<< Road Map Generated for " + params.tableNumber + " >>>");
      // Error handler
      if (err) return res.badRequest(err);
      // Return final road

      returnFilter = ['canvass', 'lastResult'];

      if (params.gameName === "roulette") {
        returnFilter.push('list')
      }

      return res.json(_.assign(_.pick(result, ['bigEyeRoad', 'smallRoad', 'cockroachRoad', 'statistic']), {
        beadRoad: _.pick(result.beadRoad, returnFilter),
        bigRoad: _.pick(result.bigRoad, ['canvass', 'lastResult'])
      }));
    });
  },

  /**
   *
   * @param req
   * @param res
   * @route POST /getGoodTips
   * @returns {Promise<void>}
   */
  getGoodTipsResult: function (req, res) {
    let params = req.body;
    let tableNumber, roadCacheKey, tasks, isBroadcast; // Default is true

    console.log("\033[33m [[ GOODTIPS API ]]", JSON.stringify(_.omit(['token'], params)), "\033[0m");

    // Validators
    tableNumber = _.isUndefined(params.tableNumber) ? JSONParseSafe(params.params)['tableNumber'] : params.tableNumber;
    isBroadcast = _.isUndefined(params.isBroadcast) ? true : params.isBroadcast;

    if (_.isUndefined(tableNumber))
      return res.badRequest('Invalid Parameter: [tableNumber]');

    // Pre-setting variables
    roadCacheKey  = "road_" + tableNumber;

    // Task lists
    tasks = {
      cacheRoad: function (cb) {
        // Get cached road
        CacheService.get(roadCacheKey, (err, roadMap) => {
          // If road map is null return empty array to prevent error exception
          return cb(null, roadMap ? roadMap.road : []);
        })
      },
      goodTips: ['cacheRoad', function (arg, cb) {
        // console.log(JSON.stringify(arg.cacheRoad));
        $help.roadmapHelper('goodTips', {
          road: arg.cacheRoad,
          customPattern: params.customPattern
          // road: road
        }).then(async function (response) {
          if (isBroadcast) {
            await socketHelper('blast', {
              event: 'goodTipsUpdate',
              values: {
                tableNumber: tableNumber,
                goodTips: response
              }
            });
          }
          return cb(null, response);
        }, (err) => {
          return cb(err);
        });
      }]
    };

    console.log('<<< Good Tips Update on ' + tableNumber + ' by ' + (isBroadcast ? 'SHIFU' : 'HTTP API') + '  >>>');

    // Execute Task
    async.auto(tasks, (err, result) => {
      // Error handler
      if (err) return res.badRequest(err);
      // Return final road
      return res.json(_.assign(_.pick(result, ['goodTips']), { tableNumber: tableNumber }));
    });
  },

  /**
   * Get cached raw road map
   * @param req
   * @param res
   * @returns {Promise<void>}
   */
  getCachedRoad: async function (req, res) {
    let params = req.body;
    let tableNumber, tasks;

    // Validators
    if (_.isUndefined(params.tableNumber))
      return res.badRequest({ err: "Invalid Parameter: [tableNumber]" });
    if (_.isUndefined(params.token))
      return res.badRequest({ err: "Invalid Parameter: [token]" });

    // Pre-setting variables
    tableNumber = params.tableNumber;
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
      cacheRoad: ["verifyToken", function (arg, cb) {
        CacheService.get("road_" + tableNumber, (err, data) => {
          return cb(err, data ? data.road : [])
        });
      }]
    };

    // Execute tasks
    async.auto(tasks, (err, taskResults) => {
      if (err)
        return res.serverError({ err });

      return res.json({
        message: "Cached RoadMap has been retrieved.",
        data: taskResults.cacheRoad
      })
    });
  },

  getRoadmapCanvas: async (req, res) => {
    const params = _.isEmpty(req.query) ? req.body : req.query;

    if (_.isEmpty(params))
      return res.badRequest('No params submitted');
    if (_.isUndefined(params.token))
      return res.badRequest("Invalid Parameter: [token]");
    if (_.isUndefined(params.gameType))
      return res.badRequest("Invalid Parameter: [gameType]");
    if (_.isUndefined(params.tableNumber))
      return res.badRequest("Invalid Parameter: [tableNumber]");

    let tasks = {
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },
      getCachedRoad: ["verifyToken", (arg, next) => {
        CacheService.get(`road_${params.tableNumber}`, (err, roadMap) => {
          // If road map is null return empty array to prevent error exception
          let rd = _.isObject(roadMap) ? roadMap : _.isNull(roadMap) ? {} : JSONParseSafe(roadMap);
          // rd = _.isObject(rd) ? rd : JSON.parse(rd);
          // return next(null, rd ? rd.road : []);
          if (_.isUndefined(rd.road)) {
            console.log("\033[30m\033[43m", "[ INVALID ROAD CACHE ON", params.tableNumber,"]", "\033[0m");
            console.log("\033[30m\033[43m", "[ DATA ON CACHE: ", roadMap ,"]", "\033[0m");
            return next(null, []);
          } else {
            return next(null, rd.road);
          }
        })
      }],
      initArbiter: ['getCachedRoad', async (results, next) => {
        if (!canvasRd.hasOwnProperty(params.tableNumber)) {
          arbiter = await $help.roadmapCanvasHelper()
          canvasRd[params.tableNumber] = new arbiter(results.getCachedRoad, params.gameType.toUpperCase())
        } else {
          canvasRd[params.tableNumber].updates = results.getCachedRoad
        }
        return next(null, true)
      }],
      createRoad: ['initArbiter', async (results, next) => {
        try {
          var rd = canvasRd[params.tableNumber].allRoad
          if (!rd) {
            return next(null, rd)
          }
          delete rd.bigRoadS
          var prediction = canvasRd[params.tableNumber].prediction
        } catch (e) {
          return next(e);
        }
        return next(null, { roadMap: rd, prediction });
      }]
    };

    async.auto(tasks, (err, results) => {
      if (err) return res.badRequest({err});
      return res.ok(results.createRoad);
    })
  }
};

/**
 * Configuration Validator
 * @desc Used to validate configuration fetched by front-end
 * @return {number}
 */
function ConfigValidators (params, obj, gameCode) {
  // Validators
  if (typeof obj === 'undefined') {
    return 1;
  } else if (typeof params.config[obj] === 'undefined'){
    return 1;
  } else if (!params.config[obj]) {
    return 1;
  } else if (obj !== 'beadRoad' && _.includes(["moneywheel", "roulette"], gameCode)) {
    return  1;
  } else if ((typeof params.config[obj].row === 'undefined' && typeof params.config[obj].col === 'undefined')) {
    return 1;
  }
  // Return processed data
  return 0;
}
function JSONParseSafe(value) {
  try { return JSON.parse(value) } catch(e) { return {} }
}


