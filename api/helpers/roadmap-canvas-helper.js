module.exports = {


  friendlyName: 'Roadmap canvas helper',


  description: `Roadmap constructor for mobile-panda-restructure, it uses canvas as frontend so yeah.


    --- HOW SH** WORKS --- 
    This bad boy helper maximizes the usage of ES6 classes, it has partial "caching" so multiple requests may be supported (but isnt used 100% since how the system works :c ).
    ###
    Initializing the helper is like the usual, async await the helper to use it but with these additional steps (ugh):
      - Hold the awaited helper in a variable
      - initialize the class (remember, this helper returns a class that needs to be initialized) with the original road and game type
      - use getters to access target roadmap
    ###
    TODO: 
      - Manual 03/27/2019 -Symon
      - Parameter Handling, switch to object type to be clearer 03/27/2019 -Symon
  `,


  inputs: {
    method: {
      type: 'string',
      defaultsTo: ''
    },
    params: {
      type: 'ref', // object
      defaultsTo: {}
    },
  },


  // exits: {

  //   success: {
  //     description: 'All done.',
  //   },

  // },


  fn: async function(inputs, exits) {
    // const method = inputs.method
    // const data = inputs.params;
    // const results = data.road;
    class getters {
      get allRoad() {
        switch (this.gameType) {
          case 1:
          case 2:
            return {
              road: this.results,
              count: this.totalResults,
              beadRoad: this.beadRoad,
              bigRoad: this.bigRoad,
              bigRoadS: this.bigRoadS,
              bigEyeRoad: this.bigEyeRoad,
              smallRoad: this.smallRoad,
              roachRoad: this.roachRoad,
            }
          case 3:
            return {
              road: this.results,
              wheelies: this.wheelies
            }
          case 4:
            return {
              road: this.results,
              rollRoad: this.rollRoad
            }
          case 5:
            return {
              count: this.totalResults,
              beadRoad: this.threeCardRoad
            }
          case 6:
            return {
              count: this.totalResults,
              beadRoad: this.niuniuRoad
            }
        }
      }
      get totalResults() {
        return this.countResults(this.cloneResults, this.gameType)
      }
      get beadRoad() {
        return this.createBeadRoad(this.results)
      }
      get bigRoad() {
        return this.createBigRoad(parseResults(this.results, this.gameType),null, null, 'bigRoad')
      }
      get bigRoadS() {
        return this.createBigRoad(parseResults(this.results, this.gameType), true, null, 'bigRoadS')
      }
      get bigEyeRoad() {
        return this.createBigRoad(this.createOtherRoad(1, 'bigEyeRoad'), false, true, 'bigEyeRoad')
      }
      get smallRoad() {
        return this.createBigRoad(this.createOtherRoad(2, 'smallRoad'), false, true, 'smallRoad')
      }
      get roachRoad() {
        return this.createBigRoad(this.createOtherRoad(3, 'roachRoad'), false, true, 'roachRoad')
      }
      get prediction () {
        let obj = {}
        if (this.gameType === 1) {
          obj = {
            banker: this.createPrediction('banker'),
            player: this.createPrediction('player')
          }
        } else if (this.gameType === 2) {
          obj = {
            dragon: this.createPrediction('dragon'),
            tiger: this.createPrediction('tiger')
          }
        }
        return obj
      }
      get wheelies() {
        return this.createMoneywheelRoad(this.results)
      }
      get rollRoad() {
        return this.createRouletteRoad(this.results)
      }
      get threeCardRoad () {
        return this.create3cardsRoad(this.results)
      }
      get niuniuRoad () {
        return this.createNiuniuRoad(this.results)
      }
      set updates(val) {
        // if (_.includes([5], this.gameType)) {
        //   val = _.isUndefined(val[1]) ? [] : val[1];
        // }

        this.results = val.length > 100 ? val.slice(val.length - 100, val.length) : val;
        this.cloneResults = val;
      }
    }
    class arbiter extends getters{
      constructor(results, game) {
        super() // gives access to extended class, and gives access to `this`
        this.gameType = this.serializeGameType(game)

        // TODO: Bro Sy, nagkakaroon ng undefined kay `results` na variable nilagyan ko lang ng try catch for the mean time :)
        try {
          // if (_.includes([5], this.gameType)) {
          //   results = _.isUndefined(results[1]) ? [] : results[1];
          // }

          this.results = results.length > 100 ? results.slice(results.length - 100, results.length) : results;
          // `cloneResults` is used for `countResults` functoin since `results` will be spliced to latest 100
        } catch (e) {
          console.error(new Error(e));
        }

        this.cloneResults = results
        this.roads = {
          beadRoad: [],
          bigRoad: [],
          bigRoadS: [],
          bigEyeRoad: [],
          smallRoad: [],
          roachRoad: []
        }
        this.check = {
          bigEyeRoad: false,
          smallRoad: false,
          roachRoad: false
        }
      }
      serializeGameType (gameType) {
        switch (gameType.toUpperCase()) {
          case 'BACCARAT':
          case 'BACC':
            return 1;
          case 'DT':
          case 'DRAGONTIGER':
            return 2;
          case 'MONEYWHEEL':
          case 'MW':
            return 3;
          case 'ROULETTE':
            return 4;
          case 'THREECARDS':
          case '3C':
            return 5;
          case 'NIUNIU':
          case 'NIU':
            return 6;
        }
      }
      countResults(resultList, gameType) {
        let results = {}
        if (gameType === 1) {
          results = {
            player: 0,
            banker: 0,
            tie: 0
          };
        } else if (gameType === 2) {
          results = {
            dragon: 0,
            tiger: 0,
            tie: 0
          };
        } else if (gameType === 5) {
          results = {
            dragon: 0,
            phoenix: 0,
            tie: 0,
            dragonStar: 0,
            phoenixStar: 0
          }
        } else if (gameType === 6) {
          results = {
            banker: 0,
            player1: 0,
            player2: 0,
            player3: 0
          }
        }

        _.each(resultList, (item, index) => {
          // Used object.keys[0] so I wont go through if/else loops
          if (item.result.includes("player") || item.result.includes("dragon")) {
            // For NiuNiu "player"
            if (_.isEqual(gameType, 6)) {
              if (_.includes(item.result, "player1")) results.player1++;
              if (_.includes(item.result, "player2")) results.player2++;
              if (_.includes(item.result, "player3")) results.player3++;
            } else {
              results[Object.keys(results)[0]]++
            }
          } else if (item.result.includes("banker") || item.result.includes("tiger")) {
            // For NiuNiu "banker"
            if (_.isEqual(gameType, 6)) {
              results.banker++;
            } else {
              results[Object.keys(results)[1]]++
            }
          } else if (item.result.includes("dragon")) {
            results["dragon" + (item.result.includes('lucky') ? 'Star' : '')]++
          } else if (item.result.includes("phoenix")) {
            results["phoenix" + (item.result.includes('lucky') ? 'Star' : '')]++
          } else if (item.result.includes("tie")) {
            results.tie++
          }
        });
        return results
      }
      checkOtherRoads(col, row, type) {
        if (type === 'bigEyeRoad') {
          if ((col === 1 && row === 1) || col === 2) {
            this.check.bigEyeRoad = true
          }
        }
        if (type === 'smallRoad') {
          if ((col === 2 && row === 1) || col === 3) {
            this.check.smallRoad = true
          }
        }
        if (type === 'roachRoad') {
          if ((col === 3 && row === 1) || col === 4) {
            this.check.roachRoad = true
          }
        }
      }
      createBeadRoad(resultList) {
        let beadRoad = parseResults(resultList, this.gameType)
        this.roads.beadRoad = beadRoad
        return beadRoad
      }
      createBigRoad(resultList, straight, otherRoad, type) {
        var pathway = []
        var x = 0; // x axis
        var y = 0; // y axis
        var ties = 0
        var curveCounts = 0;
        _.each(resultList, (bead, index) => {
          let obj = {
             place: [x, y],
            result: bead.result,
            tie: 0,
            ...(bead.pair && {pair: bead.pair})
          }
          let lastItem = _.last(pathway)
          if (bead.result === 2) {
            if (!_.isEmpty(lastItem)) {
              lastItem.tie++
              return
            } else {
              ties++
              return
            }
          }
          if(bead.result !== 2) {
            if (straight || otherRoad) {
              delete obj.pair;
              if (otherRoad) {
                delete obj.tie
              }
            }
            if (ties) {
              obj.tie = ties;
              ties = 0;
            }
            pathway.push(obj);
          }
          let counter = 1
          do {
            var nextResult = !_.isEmpty(resultList[index + counter]) && resultList[index + counter].result
            counter++
          } while (nextResult === 2)
          if (bead.result === nextResult || nextResult === 2) {
            if (!straight) {
              let nextAbove = _.find(pathway, n => _.isEqual(n.place, [x, y + 1]))
              if(y >= 5 || nextAbove) {
                curveCounts++;
                x++
                return
              }
              if(!curveCounts) {
                y++
                return
              }
            } else {
              y++
              return
            }
          } else {
            if(curveCounts && !straight) {
              x-=curveCounts;
              curveCounts = 0;
            }
            y = 0;
            x++
          }
        })
        this.roads[type] = pathway
        return pathway
      }
      createOtherRoad(offset, type) {
        var bigRoad = this.roads.bigRoadS
        this.roads[type] = []
        _.each(bigRoad, (bead, index) => {
            this.checkOtherRoads(bead.place[0], bead.place[1], type)
            if (this.check[type]) {
              let obj = {
                result: null
              }
              let res = bead
              let resCol = res.place[0]
              let resRow = res.place[1]
              // Previous results
              let prevRes = _.find(bigRoad, n => _.isEqual(n.place, [resCol - offset, resRow]))
              if (resRow === 0) {
                prevRes = _.findLast(bigRoad, n => _.first(n.place) === resCol - 1)
              }
              if (prevRes && resRow !== 0) {
                // this.roads[type].push(1)
                obj.result = 1
                this.roads[type].push(obj)
              }
              if (!prevRes && resRow !== 0) {
                let prevResDown = _.find(bigRoad, n => _.isEqual(n.place, [resCol - offset, resRow - 1]))
                if (prevResDown) {
                  // this.roads[type].push(0)
                  obj.result = 0
                  this.roads[type].push(obj)
                } else {
                  // this.roads[type].push(1)
                  obj.result = 1
                  this.roads[type].push(obj)
                }
              }
              if (resRow === 0) {
                let otherPrevRes = _.findLast(bigRoad, n => _.first(n.place) === resCol - (offset + 1))
                if (otherPrevRes) {
                  if (otherPrevRes.place[1] === prevRes.place[1]) {
                    // this.roads[type].push(1)
                    obj.result = 1
                    this.roads[type].push(obj)
                  } else {
                    // this.roads[type].push(0)
                    obj.result = 0
                    this.roads[type].push(obj)
                  }
                }
              }
            }
        })
        this.check[type] = false
        return this.roads[type]
      }
      createPrediction(faction) {
        let prediction = {}
        switch (faction) {
          case "banker":
          case "tiger":
            this.results.push({result: faction})
            break;
          case "player":
          case "dragon":
            this.results.push({result: faction})
            break;
        }
        let futureRd = this.allRoad;
        delete futureRd.road;
        delete futureRd.count;
        _.each(futureRd, (rd, type) => {
          if (type === 'beadRoad') {
            return;
          }
          if (type === 'bigRoad') {
            delete rd.tie;
            delete rd.result;
            delete rd.pair;
          }
          prediction[type] = _.last(rd);
          this.roads[type].pop();
        })
        this.results.pop();
        delete prediction.bigRoadS;
        return prediction;
      }
      createMoneywheelRoad(resultList) {
        let wheelies = []
        _.each(resultList, (bead, index) => {
          let beadResult = parseInt(bead.result)
          beadResult = isNaN(beadResult) ? 40 : beadResult;
          wheelies.push(beadResult);
        })
        return wheelies
      }
      createRouletteRoad(resultList) {
        let rollRoad = []
        // resultList = typeof resultList[0] === "string" ? resultList[1] : resultList;
        _.each(resultList, (bead, index) => {
          let beadResult = +bead.value
          rollRoad.push(beadResult);
        })
        return rollRoad
      }
      create3cardsRoad (resultList) {
        let roadMap = [];
        _.each(resultList, (bead) => {
          roadMap.push(parseResultName3Cards(bead.result));
        });
        return roadMap;
      }
      createNiuniuRoad (resultList) {
        let roadMap = [];
        _.each(resultList, (bead) => {
          let winning = _.split(bead.result, ",");

          roadMap.push([
            parseResultNameNiuniu(_.get(bead, "cards.bankerType", "0")),
            parseResultNameNiuniu(_.get(bead, "cards.player1Type","0"), winning[0]),
            parseResultNameNiuniu(_.get(bead, "cards.player2Type","0"), winning[1]),
            parseResultNameNiuniu(_.get(bead, "cards.player3Type","0"), winning[2]),
          ]);
        });
        return roadMap;
      }
    }

    try {
      return exits.success(arbiter);
    } catch (e) {
      return exits.error(e)
    }
  }
};

// Sub-Helper functions
function parseResults(list) {
  let parsed = _.map(list, (bead, index) => {
    let obj = {
      result: "",
      pair: [false, false]
    }
    let beadResult = bead.result.split(',')
    obj.result = parseResultName(_.first(beadResult));
    obj.pair = [
      _.includes(beadResult, "player_pair"),
      _.includes(beadResult, "banker_pair")
    ]
    obj.super_six = _.includes(beadResult, "super_six")
    return obj
  })
  return parsed
}

function parseResultName3Cards(res = "") {
  let name = ""

  if (_.includes(res, "dragon")) {
    name = _.includes(res, 'lucky') ? 3 : 0
  } else if (_.includes(res, "phoenix")) {
    name = _.includes(res, 'lucky') ? 4 : 1
  } else if (_.includes(res, "tie")) {
    name = 2
  }

  return name
}

function parseResultNameNiuniu(res = "", winning = "") {
  let name = "";

  switch (res) {
    case "P5" : name = "P"; break;
    case "BB" : name = "B"; break;
    case "B9" : name = "9"; break;
    case "B8" : name = "8"; break;
    case "B7" : name = "7"; break;
    case "B6" : name = "6"; break;
    case "B5" : name = "5"; break;
    case "B4" : name = "4"; break;
    case "B3" : name = "3"; break;
    case "B2" : name = "2"; break;
    case "B1" : name = "1"; break;
    case "NB" : name = "0"; break;
  }

  if (winning) {
    name = (_.includes(winning, 'player') ? "W" : "L") + name
  }

  return name
}

function parseResultName(res) {
  let name = ""
  switch (res) {
    case "player":
    case "dragon":
      name = 0
      break;
    case "banker":
    case "tiger":
      name = 1
      break;
    case "tie":
      name = 2
      break;
  }
  return name
}
