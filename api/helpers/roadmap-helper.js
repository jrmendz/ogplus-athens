const COCKROACH_SEPARATOR = '|';
const MAX_ROUND_PER_SHOE = 150;
const CLASS_GREEN_DOT = 'green-dot --is-green';
const CLASS_RED_DOT = 'red-dot --is-red';
const CLASS_BLUE_DOT = 'blue-dot --is-blue';
const CLASS_BEAD_ROAD = '';
const CLASS_BIG_ROAD = ' --is-outline';
const CLASS_BIG_EYE_ROAD = ' --is-outline';
const CLASS_SMALL_ROAD = '';
const CLASS_COCKROACH_ROAD = ' --is-slash';
const CLASS_RLT_EVEN = ' --is-even';
const CLASS_RLT_ODD = ' --is-odd';
const CLASS_RLT_HIGH = ' --is-high';
const CLASS_RLT_LOW = ' --is-low';
const CLASS_RLT_RED = ' --is-red';
const CLASS_RLT_BLK = ' --is-black';
const CLASS_MW = ' --is-dragon'; // Money wheel default
const CLASS_MW_OG = ' --is-og'; // Money wheel OG result
const CLASS_BP = ' --is-bp';
const CLASS_PP = ' --is-pp';
const CLASS_SS = ' ';
const GAME_NO_PREDICTION = ['moneywheel'];

module.exports = {
  inputs: {
    method: {
      type: 'string',
      defaultsTo: ''
    },
    params: {
      type: 'ref',
      defaultsTo: {}
    },
  },
  fn: async function (inputs, exits) {
    const method = inputs.method;
    const data = inputs.params;
    const functionGroup = {
      /**
       * Generate Bead Road
       * @desc Used to generate bead road maps
       * @requires data.columns(Integer)
       * @requires data.rows(Integer)
       * @requires data.gameResult(Array)
       */
      beadRoad: () => {
        let returnList = {};
        let gameResults, plot;
        // Validators
        if (_.isUndefined(data.gameResult))
          return exits.error("Invalid Parameter: [roadmap-helper/beadRoad/gameResult]");
        if (_.isUndefined(data.gameName))
          return exits.error("Invalid Parameter: [roadmap-helper/beadRoad/gameName]");

        // Pre-setting variables
        gameResults = data.gameResult;
        gameResults = roadDrawer({
          data: gameResults,
          rows: data.rows,
          columns: data.columns,
          offset: data.offset,
          gameName: data.gameName,
          typeOfRoad: 'beadRoad',
          hasPredict: data.hasPredict
        });

        plot = plotter(gameResults, createTable(data.rows, data.columns), true, data.type, data.gameName);

        returnList['canvass'] = plot.canvass;
        returnList['lastResult'] = plot.lastResult;
        returnList['list'] = data.gameName === "roulette" ? _.map(data.gameResult, (o) => { return { value: o.value }}) : data.gameResult;

        // Return processed road
        return exits.success(returnList);
      },
      /**
       * Generate Big Road
       * @desc Used to generate big road maps
       * @requires data.columns(Integer)
       * @requires data.rows(Integer)
       * @requires data.gameResult(Array)
       * @requires data.gameType(String) - moneywheel, baccarat
       * @returns {*}
       */
      bigRoad: () => {
        let returnList = {}, road, config, plot;
        // Validator
        if (_.isUndefined(data.gameResult))
          return exits.error("Invalid Parameter: [roadmap-helper/bigRoad/gameResult]");
        if (_.isUndefined(data.tableNumber))
          return exits.error("Invalid Parameter: [roadmap-helper/bigRoad/tableNumber]");

        // Initializing variables
        road = _.map(data.gameResult, (o) => {
          return _.pick(o, ['result'])
        });

        config = {
          data: road,
          rows: data.rows,
          offset: data.offset,
          gameName: data.gameName,
          typeOfRoad: 'bigRoad',
          hasPredict: data.hasPredict
        };

        plot = plotter(roadDrawer(_.assign(config, { columns: data.columns })), createTable(data.rows, data.columns), true, data.type);

        // Processing of Big Road
        returnList['canvass'] = plot.canvass;
        returnList['lastResult'] = plot.lastResult;
        returnList['list'] = roadDrawer(_.assign(config, { columns: MAX_ROUND_PER_SHOE }));
        // Return processed data
        return exits.success(returnList);
      },
      /**
       * Generate Other Roads (Big Eye, Small, Cockroach Roads)
       * @desc Used to generate other type road maps
       * @requires data.columns(Integer)
       * @requires data.rows(Integer)
       * @requires data.gameResult(Array)
       * @requires data.gameType(String) - moneywheel, baccarat & dragon tiger
       * @requires data.type(String) - bigEyeRoad, smallRoad, cockroachRoad
       * @returns []
       */
      otherRoad: () => {
        let resList, bigRoad, plot, returnList = {};

        // Validators
        if (_.isUndefined(data.type))
          return exits.error("Invalid Parameter: [roadmap-helper/otherRoad/type]");
        if (_.isUndefined(data.gameResult))
          return exits.error("Invalid Parameter: [roadmap-helper/otherRoad/gameResult]");
        if (_.isUndefined(data.gameName))
          return exits.error("Invalid Parameter: [roadmap-helper/otherRoad/gameName]");
        if (_.isUndefined(data.tableNumber))
          return exits.error("Invalid Parameter: [roadmap-helper/otherRoad/tableNumber]");
        if (_.includes(["moneywheel", "roulette"], data.gameName))
          return exits.success({ canvass: [], lastResult: {}});

        // Pre-setting variables
        bigRoad = data.gameResult && data.gameResult.length > 1 ? data.gameResult : [];

        // Processing data
        resList = roadDrawer({
          data: otherRoadSubDrawer(flatRoadResult(bigRoad), data.type),
          columns: data.columns,
          rows: data.rows,
          typeOfRoad: data.type,
          gameName: data.gameName,
          offset: data.offset,
          gapRows: 2,
          gapColumns: 2,
          hasPredict: data.hasPredict
        });

        plot = plotter(resList, createTable(data.rows, data.columns ,2,2), false, data.type);

        returnList['canvass'] = plot.canvass;
        returnList['lastResult'] = plot.lastResult;

        // Return processed road
        return exits.success(returnList);
      },
      /**
       * Road Map Statistics
       * @desc Used to generate statistics on current result
       * @author Alvin Valdez
       * @requires data.beadRoad (Array)
       * @requires data.bigRoad (Array)
       */
      statistics: () => {
        let stats = {
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
        };
        let beadRoad, bigRoad, config;
        // Validators
        if (_.isUndefined(data.config))
          return exits.success(stats);
        if (_.isUndefined(data.tableNumber))
          return exits.success(stats);
        if (_.isUndefined(data.gameName))
          return exits.success(stats);

        // Pre-setting values
        beadRoad = data.beadRoad;
        bigRoad = flatRoadResult(data.bigRoad);
        config = data.config;
        // Big road result counter
        stats.isRoadEmpty.beadRoad = _.isEmpty(data.beadRoad);
        stats.isRoadEmpty.bigRoad = _.isEmpty(data.bigRoad);

        // Generate predictions
        if (typeof config.predict !== 'undefined' && !_.includes(["moneywheel", "roulette"], data.gameName)) {
          if (config.predict && typeof data.bigRoad !== 'undefined') {
            for (let gap = 1; gap <= 3; gap++) {
              if (bigRoad.length > gap) {

                let road = gap === 1 ? 'bigEyeRoad' : gap === 2 ? 'smallRoad' : 'cockroachRoad';
                let gapRow = bigRoad[bigRoad.length - (gap + 1)].split('-');
                let lastRow = bigRoad[bigRoad.length - 1].split('-');
                let lastRowResult = lastRow[lastRow.length - 1];
                // Logical results
                if (gapRow[lastRow.length] && gapRow[lastRow.length - 1]) {
                  stats.predict.red[road] = (_.includes(['tiger','banker'], lastRowResult) ? customClass('red', gap) : customClass('blue', gap));
                  stats.predict.blue[road] = (_.includes(['dragon','player'], lastRowResult) ? customClass('red', gap) : customClass('blue', gap));

                } else if ((!gapRow[lastRow.length] && gapRow[lastRow.length - 1]) || (gapRow[lastRow.length] && !gapRow[lastRow.length - 1])) {
                  stats.predict.red[road] = (_.includes(['tiger','banker'], lastRowResult) ? customClass('blue', gap) : customClass('red', gap));
                  stats.predict.blue[road] = (_.includes(['dragon','player'], lastRowResult) ? customClass('blue', gap) : customClass('red', gap));

                } else if (!gapRow[lastRow.length] && !gapRow[lastRow.length - 1]) {
                  stats.predict.red[road] = (_.includes(['tiger','banker'], lastRowResult) ? customClass('red', gap) : customClass('blue', gap));
                  stats.predict.blue[road] = (_.includes(['dragon','player'], lastRowResult) ? customClass('red', gap) : customClass('blue', gap));
                }

              }
            }
          }
        }
        function customClass (color = 'blue', gap = 1) {
          if (_.isEqual(gap, 1)) {
            return (color === 'blue' ? CLASS_BLUE_DOT : CLASS_RED_DOT) + CLASS_BIG_EYE_ROAD;
          } else if (_.isEqual(gap, 2)) {
            return (color === 'blue' ? CLASS_BLUE_DOT : CLASS_RED_DOT) + CLASS_SMALL_ROAD;
          } else {
            return color === 'blue' ? 'blue-slash' : 'red-slash'
          }
        }

        // Generate Demographic
        // Bead Road Demography
        if (!_.isUndefined(config.beadRoadDemoGraph)) {
          if (config.beadRoadDemoGraph && !_.isUndefined(beadRoad)) {

            for (let i = 0; i < beadRoad.length; i++) {
              let result = _.get(beadRoad[i], 'result');
              if (!_.isUndefined(result)) {
                // For Moneywheel
                if (_.includes(["moneywheel", "roulette"], data.gameName)) {

                } else {
                  // Result Counter
                  if (['player','dragon'].indexOf(trueResult(result)) > -1) {
                    // Add count for Player/Dragon
                    stats.demographic.beadRoad.blue++
                  } else if (['banker','tiger'].indexOf(trueResult(result)) > -1) {
                    // Add count for Banker/Tiger
                    stats.demographic.beadRoad.red++
                  } else {
                    // Add count for Tie
                    stats.demographic.beadRoad.green++
                  }
                  // Pair/S6 Counter
                  if (result.includes('player_pair')) stats.demographic.beadRoad.blue_pair++;
                  if (result.includes('banker_pair')) stats.demographic.beadRoad.red_pair++;
                  if (result.includes('super_six')) stats.demographic.beadRoad.s6++;
                }
              }
            }
          }
        }

        // Big Road Demography
        if (!_.isUndefined(config.bigRoadDemoGraph)) {
          if (config.bigRoadDemoGraph && typeof data.bigRoad !== 'undefined' && !_.includes(["moneywheel", "roulette"], data.gameName)) {
            for (let i = 0; i < data.bigRoad.length; i++) {
              let dataResult = data.bigRoad[i];
              if (!_.isUndefined(dataResult)) {
                if (['player','dragon'].indexOf(trueResult(dataResult.result.result)) > -1) stats.demographic.bigRoad.blue++;
                else if (['banker','tiger'].indexOf(trueResult(dataResult.result.result)) > -1) stats.demographic.bigRoad.red++;
                stats.demographic.bigRoad.green += dataResult.ties.length;
              }
            }
          }
        }

        // Return processed data
        return exits.success(stats);
      },
      /**
       * Generate Good Tips
       * @requires data.road
       * @returns {*}
       */
      goodTips: () => {
        let goodTips = [], road = [];
        let gtList = {
          gt1: 'rrrr',
          gt2: 'bbbb',
          gt3: 'rrbbbrr',
          gt4: 'rbrb',
          gt5: 'rbbrbb',
          gt6: 'brrbrr',
          gt7: 'rrrrbrrb',
          gt8: 'bbrbbbbrr',
          gt9: 'rbrrbrbrr',
          gt10: 'brbbrbrbb',
          gt11: '', // brbbrbrbb
          gt12: '' // brbr
        };
        let matchResult, matchLength, flatPattern, flatRoad, prevPat, tmpRoad;

        // Validators
        if (typeof data.road === 'undefined')
          return exits.success([]);
        if (!data.road.length)
          return exits.success([]);
        if (!_.isUndefined(data.customPattern))
          _.assign(gtList, data.customPattern);

        // Pre-setting variables
        road = data.road;
        road = _.remove(road, (o) => { return !o.result.includes('tie') }); // Remove ties on the roads

        // Process filtering
        _.forEach(gtList, (pattern, key) => {
          matchResult = 0;
          matchLength = 0;
          flatPattern = [];
          flatRoad = [];
          tmpRoad = [];

          if (pattern) {
            // Flatten pattern
            for(let i = 0; i < pattern.length; i++) {
              if (flatPattern.length) {
                if (prevPat === pattern[i]) {
                  _.last(flatPattern).push(pattern[i])
                } else {
                  flatPattern.push([pattern[i]])
                }
              } else {
                flatPattern.push([pattern[i]])
              }
              prevPat = pattern[i];
            }

            // Check if the road length is good for pattern checking
            if (pattern.length <= road.length) {
              // Flatten road map only return valid result
              if (_.includes(['gt99'], key)) {
                flatRoad = otherRoadSubDrawer(flatRoadResult(road, 'result'), 'cockroachRoad');
                // Get last specific results and convert it to pattern
                tmpRoad = _.map(_.takeRight(flatRoad, pattern.length), (o) => {
                  // Don't create result pattern if result is invalid
                  return trueResult(o.result) !== '' ? (trueResult(o.result) === 'b' ? 'b' : 'r') : 'x';
                });
              } else {
                flatRoad = _.takeRight(flatRoadResult(road, 'result'), flatPattern.length);
                // Get last specific results and convert it to pattern
                tmpRoad = _.map(_.takeRight(road, pattern.length), (o) => {
                  return ['player', 'dragon'].indexOf(trueResult(o.result)) > -1 ? 'b' : 'r';
                });
              }

              // Check pattern and result
              matchResult += (pattern === _.join(tmpRoad, '') ? pattern.length : 0);
              // Check length on pattern if equal
              _.forEach(flatPattern, (v, k) => {
                // On split function use cockroach separator to split class
                if (_.includes(['gt99'], key)) {
                  flatRoad = _.takeRight(flatRoadResult(flatRoad, 'result', COCKROACH_SEPARATOR), flatPattern.length);
                  if (v.length === _.split(flatRoad[k], COCKROACH_SEPARATOR).length) {
                    matchLength++
                  }
                } else {
                  if (v.length === _.split(flatRoad[k], '-').length) {
                    matchLength++
                  }
                }
              });
            }
            // console.log('e [', pattern.length, flatPattern.length, '], r[', matchResult, matchLength, '] on', key);
            // Check if the good tips match
            if (pattern.length === matchResult && flatPattern.length === matchLength) goodTips.push(key);
          }
        });
        // Return processed data
        return exits.success(goodTips);
      },
    };
    // Return function
    functionGroup[method]();
  }
};

/**
 * Road Map Drawer
 * @desc Plotting road map values with specific logical rows and columns
 * @returns {Array}
 * @param config
 */
function roadDrawer(config) {
  let GameResult = {
    Tie: "tie",
    Banker: "banker",
    Player: "player",
    Dragon: "dragon",
    Tiger: "tiger",
    PlayerPair: "player_pair",
    BankerPair: "banker_pair"
  };
  let mapper = {
    baccarat: {
      player: 'player-banker',
      banker: 'banker-player',
      b: 'b-r',
      r: 'r-b'
    },
    dragontiger: {
      dragon: 'dragon-tiger',
      tiger: 'tiger-dragon',
      b: 'b-r',
      r: 'r-b'
    }
  };
  let tieStack = [], returnList = [];
  let placementMap = {};
  let logicalColumnNumber = 0;
  let maximumColumnReached = 0;
  let lastItem, offset, typeOfRoad, rows, columns, gapRows, gapColumns, gameResult, gameResults, gameName, hasPredict;

  // Validators
  if (_.isUndefined(config)) return [];
  if (_.isUndefined(config.data)) return [];
  if (!config.data.length) return [];
  if (_.isUndefined(config.columns)) return [];
  if (_.isUndefined(config.rows)) return [];
  if (_.isUndefined(config.gameName)) return [];
  if (_.isUndefined(config.typeOfRoad)) return [];
  hasPredict = _.isUndefined(config.hasPredict) ? false : config.hasPredict;
  gapRows = _.isUndefined(config.gapRows) ? 1 : config.gapRows;
  gapColumns = _.isUndefined(config.gapColumns) ? 1 : config.gapColumns;

  // Initializing variables
  offset = config.offset;
  gameName = config.gameName;
  typeOfRoad = config.typeOfRoad;
  gameResults = _.filter(config.data, (o) => { return o.result !== '' || gameName === 'roulette' });

  if (['beadRoad', 'bigRoad'].indexOf(typeOfRoad) > -1) {
    rows = config.rows;
    columns = config.columns;
  } else {
    rows = config.rows * gapRows;
    columns = config.columns * gapColumns;
  }

  // Limit the road data on beadRoad
  if (typeOfRoad === 'beadRoad') {
    gameResults = _.takeRight(gameResults, (rows * columns) + (gameResults.length % rows))
  }

  // Computations for Predictions
  if (hasPredict && !_.includes(GAME_NO_PREDICTION, gameName)) {
    if (typeOfRoad === 'beadRoad') {
      gameResults.push({ result: '', isPredict: true });
    } else {
      let cleanResult = _.filter(gameResults, (o) => { return !trueResult(o.result).includes(GameResult.Tie)})
      // Game result must not empty when processing predictions
      if (cleanResult.length) {
        // Get last result
        let lastResult = trueResult(_.last(cleanResult).result); // Get last result
        if (lastResult) {
          _.map(_.split(mapper[gameName][lastResult], '-'), (o, i) => {
            gameResults.push({result: o, isPredict: true, ref: !i ? 'same' : 'diff' })
          })
        }
      }
    }
  }

  // Build the logical column definitions that doesn't represent
  // the actual "drawn" roadmap.
  for (let i = 0; i < gameResults.length; i++) {
    gameResult = gameResults[i];

    // console.log("RoadDrawer", i, "=>", gameResult);

    // Check if the `result` obj is valid
    if (!_.isUndefined(gameResult.result)) {
      if (typeOfRoad !== 'beadRoad' && trueResult(gameResult.result).includes(GameResult.Tie)) {
        // Add the ties that happened in between the last placed big road item
        // and this new big road item to the last entered big road item.
        if (returnList.length) {
          returnList[returnList.length - 1].ties.push(gameResult);
        } else {
          tieStack.push(gameResult);
        }
      } else {
        // If type of road is not bead road and this item is different from the result of the last game
        // then we must place it in another column
        if (typeOfRoad !== 'beadRoad' && lastItem) {
          //If last result is not Tie
          if (trueResult(lastItem.result) !== GameResult.Tie) {
            // If the last item is not the same as the current result
            if (trueResult(lastItem.result) !== trueResult(gameResult.result)) {
              logicalColumnNumber++;
            }
          } else {
            let lastItemResult = _.last(returnList);
            if (lastItemResult) {
              if (trueResult(_.last(returnList).result.result) !== trueResult(gameResult.result)) {
                logicalColumnNumber++;
              }
            }
          }
        }
        // START: Plotting result position
        let probeColumn = logicalColumnNumber;
        let probeRow = 0;
        let done = false;

        while (!done) {
          let keySearch = `${probeColumn}.${probeRow}`;
          let keySearchBelow = `${probeColumn}.${probeRow + 1}`;

          // Position available at current probe location
          if (!_.get(placementMap, keySearch)) {
            let newEntry = _.merge({}, {
              row: probeRow,
              column: probeColumn,
              logicalColumn: logicalColumnNumber,
              ties: _.cloneDeep(tieStack)
            }, {
              result: gameResult
            });
            _.set(placementMap, keySearch, newEntry);
            returnList.push(placementMap[probeColumn][probeRow]);
            tieStack = [];
            done = true;
          }
          // The spot below would go beyond the table bounds.
          else if (probeRow + 1 >= rows) {
            if (typeOfRoad === 'beadRoad') probeRow = 0;
            probeColumn++;
          }
          // The spot below is empty.
          else if (!_.get(placementMap, keySearchBelow)) probeRow++;
          // The result below is the same result.
          else if (typeOfRoad !== 'beadRoad' && trueResult(_.get(placementMap, keySearchBelow).result.result) === trueResult(gameResult.result)) {
            probeRow++;
          }
          // Add column/row otherwise
          else {
            if (typeOfRoad === 'beadRoad') {
              probeRow++;
            } else {
              probeColumn++;
            }
          }
        }
        maximumColumnReached = Math.max(maximumColumnReached, probeColumn);
        // END: Plotting result position
      }
      lastItem = gameResult;
    }
  }

  if (typeOfRoad === 'bigRoad') {
    // There were no results added to the placement map.
    // We only have ties.
    // if (_.isEmpty(returnList) && tieStack.length > 0) {
    //   returnList.push({
    //     ties: _.cloneDeep(tieStack),
    //     column: 0,
    //     row: 0,
    //     logicalColumn: 0,
    //     result: {}
    //   });
    // }
  }
  returnList = scrollRoad(returnList, maximumColumnReached, columns, offset);

  return returnList;
}
/**
 * Road Plotter
 * @desc Dream of every front-end developer, less function just plot
 * @param directions
 * @param map
 * @param isCellSingle
 * @param typeOfRoad
 * @param typeOfGame
 * @returns {Array}
 */
function plotter (directions = [], map = [], isCellSingle = true, typeOfRoad = '', typeOfGame = '') {
  let result, foundMatch, plotData, coordinates;
  let lastResult = {
    class: '',
    xy: '',
    isCellSingle: isCellSingle
  }, obj = {};

  for (let _res = 0; _res < directions.length; _res++) {
    result = directions[_res];
    foundMatch = false;
    // Final data object to be sent on front-end
    plotData = {
      class: resultToClass(_.get(result, 'result.result'), '', typeOfRoad, typeOfGame),
      result: trueResult(_.get(result, 'result.result')),
      rawResult: typeOfRoad === 'beadRoad' ? result.result : {},
      char: resultCharAt(_.get(result, 'result.result')),
      ties: _.isUndefined(result.ties) ? 0 : result.ties.length,
      xy: result.row + '-' + result.column,
      isPredict: !_.isUndefined(result.result.isPredict),
      isPredictShow: false,
      ref: result.result.ref || ''
    };

    // Row loop
    for (let _r = 0; _r < map.length && !foundMatch; _r++) {
      // Column loop
      for (let _c = 0; _c < map[_r].length && !foundMatch; _c++) {
        // Single Cell value
        if (isCellSingle) {
          coordinates = _.split(map[_r][_c], '-');
          if (_.isEqual(parseInt(coordinates[0]), result.row) && _.isEqual(parseInt(coordinates[1]), result.column)) {
            map[_r][_c] = plotData;
            foundMatch = true;
            // Disregard if prediction hits
            if (!plotData.isPredict) {
              lastResult['xy'] = _r + '-' + _c;
              lastResult['class'] = plotData.class;
              lastResult['rawResult'] = plotData.rawResult;
            }
            break;
          }
          // Multiple cell value
        } else {
          for (let _i = 0; _i < map[_r][_c].length; _i++) {
            coordinates = _.split(map[_r][_c][_i], '-');
            if (_.isEqual(parseInt(coordinates[0]), result.row) && _.isEqual(parseInt(coordinates[1]), result.column)) {
              map[_r][_c][_i] = plotData;
              foundMatch = true;
              // Disregard if prediction hits
              if (!plotData.isPredict) {
                lastResult['xy'] = _r + '-' + _c + '-' + _i;
                lastResult['class'] = plotData.class;
                lastResult['rawResult'] = plotData.rawResult;
              }
              break;
            }
          }
        }
      }
    }
  }
  obj['canvass'] = map;
  obj['lastResult'] = lastResult;

  return obj;
}
/**
 * Other Road Plotter (incl. BigEye, Small and Cockroach)
 * @desc Rendering other road map
 * @param flatBigRoad
 * @param roadType
 * @returns {Array}
 */
function otherRoadSubDrawer (flatBigRoad = [], roadType) {
  let resList = [], predict = { red: '', blue: '' };
  let gap;

  // Validators
  if (!flatBigRoad.length) return [];

  // Pre-setting variables
  gap = roadType === 'bigEyeRoad' ? 1 : roadType === 'smallRoad' ? 2 : 3;

  // // Generate requested type of road here
  // for (let key = 0; key < flatBigRoad.length; key++) {
  //
  //   if (key > gap) {
  //     // Split string with dash (-)
  //     curCol = flatBigRoad[key].split('-');
  //     prevCol = flatBigRoad[key - gap].split('-');
  //     prev2Col = flatBigRoad[key - (gap + 1)].split('-');
  //
  //     // Don't process empty big road columns
  //     if (curCol.length) {
  //       // Loop thru index arrays
  //       for (let curColIdx = 0; curColIdx < curCol.length; curColIdx++) {
  //         // If not probing the first cell in column
  //         if (curColIdx > 0) {
  //           // Check if the previous column has greater than or equal in length to the current cell index
  //           if (prevCol.length - 1 >= curColIdx) {
  //             curRes = { result: 'r' }
  //           } else {
  //             // If the previous column length minus the current cell index is greater than 1
  //             if ((curColIdx - (prevCol.length - 1)) > 1) {
  //               curRes = { result: 'r' }
  //             } else {
  //               curRes = { result: 'b' }
  //             }
  //           }
  //         // If probing for first cell in column always check if the previous 2 columns are equal in length
  //         } else {
  //           if (prevCol.length === prev2Col.length) {
  //             curRes = { result: 'r' }
  //           } else {
  //             curRes = { result: 'b' }
  //           }
  //         }
  //         // Push result list
  //         resList.push(curRes);
  //       }
  //     }
  //   }
  // }

  // Big Road
  for (let road = gap; road < flatBigRoad.length; road++) {
    let probeCol = flatBigRoad[road].split('-');
    let curCol = [], ctr;
    let prevCol, probeResult;

    for (let i = gap === road ? 1 : 0; i < probeCol.length; i++) {
      if (probeCol.length > 1 && i > 0) {
        curCol = probeCol;
        prevCol = flatBigRoad[road - gap].split('-');
        probeResult = curCol[i - 1];
        ctr = i - 1;
      } else if ((probeCol.length > 1 && i === 0) || probeCol.length === 1) {
        curCol = flatBigRoad[road - 1].split('-');
        prevCol = flatBigRoad[road - (gap+1)].split('-');
        probeResult = _.last(curCol)
        ctr = curCol.length - 1;
      }

      if (prevCol[ctr] && prevCol[ctr+1]) {
        predict.red = (_.includes(['tiger','banker'], probeResult) ? 'r' : 'b');
        predict.blue = (_.includes(['dragon','player'], probeResult) ? 'r' : 'b');
      } else if ((!prevCol[ctr] && prevCol[ctr+1]) || (prevCol[ctr] && !prevCol[ctr+1])) {
        predict.red = (_.includes(['tiger','banker'], probeResult) ? 'b' : 'r');
        predict.blue = (_.includes(['dragon','player'], probeResult) ? 'b' : 'r');
      } else if (!prevCol[ctr] && !prevCol[ctr+1]) {
        predict.red = (_.includes(['tiger','banker'], probeResult) ? 'r' : 'b');
        predict.blue = (_.includes(['dragon','player'], probeResult) ? 'r' : 'b');
      }

      resList.push({ result: predict[_.includes(['tiger','banker'], probeCol[i]) ? 'red' : 'blue'] })
    }
  }

  return resList;
}
/**
 * Flattened Big Road Results
 * @desc Copy the logical position but show game results only
 * @param array
 * @param obj
 * @param separator
 * @returns {Array}
 */
function flatRoadResult (array = [], obj = 'result.result', separator = '-') {
  let roadFlat = [];
  let _lastResult = '';
  let _trueResult;
  // Simplifying road results with dash (-)
  for (let i = 0; i < array.length; i++) {
    // Don't include prediction result
    if (!array[i].result.isPredict) {
      _trueResult = trueResult(_.get(array[i], obj));
      // If same column
      if (_lastResult === _trueResult) {
        roadFlat[roadFlat.length - 1] += separator + trueResult(_trueResult);
      } else {
        roadFlat.push(trueResult(_trueResult));
      }
      // Set last result data to a variable
      _lastResult = trueResult(_trueResult);
    }
  }

  return roadFlat;
}
/**
 * Primary Result
 * @desc Return primary result on the game set
 * @param result
 * @returns {*}
 */
function trueResult (result) {
  let validResults = ['player', 'banker', 'tie', 'dragon', 'tiger', 'b', 'r', '1', '2', '5', '10', '20', 'og'];
  let trueResult;
  // Validators
  if (_.isUndefined(result)) return '';
  // Process result
  trueResult = result.split(',').filter((o) => {
    return validResults.indexOf(o) > -1;
  });
  // Return processed data
  return trueResult.length ? trueResult[0] : '';
}
/**
 * Scroll Road Map
 * @desc Used to scroll road maps except bead road
 * @param results
 * @param highestDrawingColumn
 * @param drawingColumns
 * @param customOffset
 * @returns {*[]}
 */
function scrollRoad(results = [], highestDrawingColumn, drawingColumns, customOffset = 0) {
  const highestDrawableIndex = drawingColumns - (customOffset + 1);
  const offset = Math.max(0, highestDrawingColumn - highestDrawableIndex);
  let validItems = results.filter((value) => (value.column - offset) >= 0);
  validItems.forEach((value) => value.column -= offset);
  return validItems;
}
/**
 * Result to Class converter
 * @desc Used to convert game set result to class for front-end purpose
 * @param result
 * @param prefix
 * @param typeOfRoad
 * @param typeOfGame
 * @returns {string}
 */
function resultToClass (result = '', prefix = '', typeOfRoad = '', typeOfGame = '') {
  let resClass = prefix ? '' : (prefix + ' ');

  // Converting result to class
  _.map(result.split(','), (o) => {
    let i = _.toLower(o);
    if (i === 'tie') resClass += CLASS_GREEN_DOT + ' ';
    if (i === 'player') resClass += CLASS_BLUE_DOT + ' ';
    if (i === 'banker') resClass += CLASS_RED_DOT + ' ';
    if (i === 'dragon') resClass += CLASS_BLUE_DOT + ' ';
    if (i === 'tiger') resClass += CLASS_RED_DOT + ' ';
    if (i === 'player_pair') resClass += CLASS_PP + ' ';
    if (i === 'banker_pair') resClass += CLASS_BP + ' ';
    if (i === 'super_six') resClass += CLASS_SS + ' ';
    if (['1', '2', '5', '10', '20'].indexOf(i) > -1) resClass += CLASS_MW + ' ';
    if (i === 'og') resClass += CLASS_MW_OG + ' ';
    if (i === 'b') resClass += CLASS_BLUE_DOT + ' ';
    if (i === 'r') resClass += CLASS_RED_DOT + ' ';
    if (i === 'even') resClass += CLASS_RLT_EVEN + ' ';
    if (i === 'odd') resClass += CLASS_RLT_ODD + ' ';
    if (i === 'big') resClass += CLASS_RLT_HIGH + ' ';
    if (i === 'small') resClass += CLASS_RLT_LOW + ' ';
    // if (i === 'red') resClass += CLASS_RLT_RED + ' ';
    // if (i === 'black') resClass += CLASS_RLT_BLK + ' ';
  });

  // Type of road map conditional
  // For Moneywheel
  if (typeOfGame === 'moneywheel') {
    resClass += ' dragon';
    // For Baccarat, Dragon Tiger
  } else {
    switch (typeOfRoad) {
      case 'beadRoad': resClass += CLASS_BEAD_ROAD; break;
      case 'bigRoad': resClass += CLASS_BIG_ROAD; break;
      case 'bigEyeRoad': resClass += CLASS_BIG_EYE_ROAD; break;
      case 'smallRoad': resClass += CLASS_SMALL_ROAD; break;
      case 'cockroachRoad': resClass += CLASS_COCKROACH_ROAD; break;
    }
  }

  return resClass;
}
/**
 * Character Representation
 * @desc Used to get character representation per result
 * @param result
 * @returns {string}
 */
function resultCharAt (result) {
  let char = '';
  let trueRes = trueResult(result);
  // Validators
  if (typeof result === 'undefined') return '';
  // Processor
  switch (trueRes) {
    case 'tie': char = 'T'; break;
    case 'player': char = 'P'; break;
    case 'banker': char = 'B'; break;
    case 'dragon': char = 'D'; break;
    case 'tiger' : char = 'T'; break;
  }
  return char;
}
/**
 * Isolation of group cells
 * @param _rows
 * @param _cols
 * @param _gapRow
 * @param _gapCol
 * @returns {Array}
 */
function createTable (_rows = 6, _cols = 12, _gapRow = 1, _gapCol = 1) {
  let arr = [], returnList = [];
  let tmpData;
  let cols = _cols;
  let rows = _rows;

  if (_gapRow === 1 && _gapCol === 1) {
    for( let row = 0; row < rows; row++) {
      arr[row] = [];
      for (let col = 0; col < cols; col++) {
        arr[row].push(row + '-' + col)
      }
    }
    returnList = arr;
  } else {
    rows = rows * _gapRow;
    cols = cols * _gapCol;
    for( let row = 0; row < rows; row++) {
      arr[row] = [];
      if (row % _gapRow === 0) {
        for (let col = 0; col < cols; col++) {
          if (col % _gapCol === 0) {
            tmpData = [];
            for (let gr = 0; gr < _gapRow; gr++) {
              for (let gc = 0; gc < _gapCol; gc++) {
                tmpData.push((row+gr) + '-' + (col+gc));
              }
            }
            arr[row].push(tmpData);
          }
        }
      }
    }
    returnList = _.filter(arr, (o) => { return o.length })
  }
  return returnList;
}


