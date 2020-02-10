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
      calculatePayoutBaccarat: () => {
        let { bets = [] } = data;

        _.forEach(bets, function (bet) {
          let { bet_amount = 0, bet_place = '', super_six = 0 } = bet;
          let { result = '' } = data.gameResultList;
          let win_loss = bet_amount * -1;

          switch (bet_place) {
            case 'banker':
              // If bet is Banker
              if (_.startsWith(result, 'banker')) {
                if (super_six) {
                  // Based on Bug #3887, payout should be half
                  win_loss = _.includes(result, 'super_six') ? bet_amount * 0.50 : bet_amount;
                } else {
                  win_loss = bet_amount * 0.95;
                }
              }
              // If bet is not Banker
              else if (_.startsWith(result, 'tie')) {
                win_loss = 0;
              }
              break;

            case 'banker_pair':
              // If bet is Banker Pair
              if (_.includes(result, 'banker_pair')) {
                win_loss = bet_amount * 11;
              }
              break;

            case 'player':
              // If bet is Player
              if (_.startsWith(result, 'player')) {
                win_loss = bet_amount;
              }

              // If bet is not Player
              else if (_.startsWith(result, 'tie')) {
                win_loss = 0;
              }
              break;

            case 'player_pair':
              // If bet is Player Pair
              if (_.includes(result, 'player_pair')) {
                win_loss = bet_amount * 11;
              }
              break;

            case 'super_six':
              // If bet is Super Six
              if (_.includes(result, 'super_six')) {
                win_loss = bet_amount * 12;
              }
              break;

            case 'tie':
              // If bet is Tie
              if (_.startsWith(result, 'tie')) {
                win_loss = bet_amount * 8;
              }
              break;
          }

          // Update bet win-loss
          bet.win_loss = win_loss;
        });

        return exits.success({payout: data.bets})
      },
      calculatePayoutDragonTiger: () => {
        let { bets = [] } = data;
        let isClassic = false;

        // Check if there is a bet
        if (_.size(bets)) {
          // Classic table flag
          isClassic = _.includes(_.get(bets, `[0].gamename`, ''), 'CLASSIC');

          // Loop through bets
          _.forEach(bets, function (bet) {
            let { bet_amount = 0, bet_place = '' } = bet;
            let { result = '' } = data.gameResultList;
            let win_loss = bet_amount * -1;

            // Check bet information if win or loss
            switch (bet_place) {
              case 'tiger':
                // If bet is tiger
                if (result === 'tiger') {
                  win_loss = bet_amount;
                }
                // If bet is tie
                else if (result === 'tie') {
                  win_loss = isClassic ? win_loss : 0 - (bet_amount * .50);
                }
                break;
              case 'dragon':
                // If bet is dragon
                if (result === 'dragon') {
                  win_loss = bet_amount;
                }
                // If bet is tie
                else if (result === 'tie') {
                  win_loss = isClassic ? win_loss : 0 - (bet_amount * .50);
                }
                break;
              case 'dt-tie':
                if (result === 'tie') {
                  win_loss = bet_amount * 8;
                }
                break;
            }

            // Update win-loss value
            bet.win_loss = win_loss;
          })
        }

        return exits.success({payout: data.bets})
      },
      calculatePayoutMoneyWheel: () => {
        let multiplier = data.gameResult.multiplier || 1;
        let roundResult = data.gameResultList.result || "";

        if (!roundResult) {
          console.log("\033[43m\033[30mWARNING:", "Moneywheel round result is invalid. Payout calculation maybe unsuccessful.", "\033[0m");
        }

        if (data.bets.length > 0) {
          // Loop thru bets and process calculation.
          _.map(data.bets, function (bet) {
            // Check if the bet is same with the result
            if (bet.bet_place === roundResult) {
              // Convert `og` to number (40) result representation
              bet.win_loss = bet.bet_amount * ((roundResult === 'og' ? 40 : parseFloat(roundResult)) * multiplier)
            } else {
              bet.win_loss = bet.bet_amount * -1
            }
          });
        }

        return exits.success({payout: data.bets})
      },
      calculatePayoutRoulette: () => {
        if (data.bets.length > 0) {
          const resultCombinations = getRouletteWins(data.gameResultList.result);
          const playerCombinations = _.flatMap(data.bets, a => a.bet_place);
          const winningCombinations = _.intersection(resultCombinations, playerCombinations);
          sails.log(resultCombinations, playerCombinations)
          sails.log(winningCombinations)
          _.forEach(data.bets, function (bet, key) {
            let win_loss = bet.bet_amount * -1
            if (winningCombinations.indexOf(bet.bet_place) !== -1) {
              const betValue = bet.bet_place.replace(/[0-9]/g, '');

              // `Line0` has a separate condition since `betValue` variable removes the number
              if (bet.bet_place === "line0") {
                win_loss = bet.bet_amount * 8
              } else {
                switch(betValue || "") {
                  case "s":
                    win_loss = bet.bet_amount * 35;
                    break;
                  case "split":
                  case "near":
                  case "zero":
                    win_loss = bet.bet_amount * 17;
                    break;
                  case "street":
                  case "tri":
                    win_loss = bet.bet_amount * 11;
                    break;
                  case "square":
                    win_loss = bet.bet_amount * 8;
                    break;
                  case "line":
                    win_loss = bet.bet_amount * 5;
                    break;
                  case "row":
                  case "dozen":
                    win_loss = bet.bet_amount * 2;
                    break;
                  case "small":
                  case "big":
                  case "even":
                  case "odd":
                  case "red":
                  case "black":
                    win_loss = bet.bet_amount * 1;
                    break;
                }
              }
            }
            bet.win_loss = win_loss;
          });
        }
        return exits.success({payout: data.bets})
      },
      calculatePayout3Cards: () => {
        // Validators
        if (!data.bets.length)
          return exits.success({payout: []});

        _.forEach(data.bets, (bet) => {
          let result = data.gameResultList.result;
          let win_loss = bet.bet_amount * -1;

          switch(bet.bet_place) {
            case "3c-phoenix":
              if (_.startsWith(result, "phoenix")) {
                win_loss = bet.bet_amount * 0.95;
              } else if (_.startsWith(result, "tie")) {
                win_loss = 0;
              }
              break;

            case "3c-dragon":
              if (_.startsWith(result, "dragon")) {
                win_loss = bet.bet_amount * 0.95;
              } else if (_.startsWith(result, "tie")) {
                win_loss = 0;
              }
              break;

            case "3c-lucky":
              if (_.includes(result, "lucky-triple")) {
                win_loss = bet.bet_amount * 10;
              } else if (_.includes(result, "lucky-straightflush")) {
                win_loss = bet.bet_amount * 5;
              } else if (_.includes(result, "lucky-flush")) {
                win_loss = bet.bet_amount * 3;
              } else if (_.includes(result, "lucky-straight")) {
                win_loss = bet.bet_amount * 2;
              } else if (_.includes(result, "lucky-pair")) {
                win_loss = bet.bet_amount * 1;
              }
              break;
          }

          bet.win_loss = win_loss;
        });

        return exits.success({payout: data.bets});
      },
      calculatePayoutNiuniu: () => {
        let card = {
          NB: 0, B1: 1, B2: 2, B3: 3, B4: 4, B5: 5, B6: 6, B7: 7, B8: 8, B9: 9, BB: 10, P5: 11,
          0:"NB", 1:"B1", 2:"B2", 3:"B3", 4:"B4", 5:"B5", 6:"B6", 7:"B7", 8:"B8", 9:"B9", 10: "BB", 11: "P5"
        };

        // Loop through bets
        for (let i = 0; i < data.bets.length; i++) {
          let bet = data.bets[i];
          let result = data.gameResultList.result;
          let resultSplit = _.split(result, ",");
          let win_loss, isWins, pCardVal, bCardVal, cardValDiff, ratio, derivedBet;

          // Initialized losing bet (Default)
          win_loss = bet.bet_amount * -1;

          // Loop through 3 player and banker betting areas
          for (let c = 1; c <= 3; c++) {

            // Check if the bet place hits initial validation
            if (_.includes(bet.bet_place, 'p'+c) || _.includes(bet.bet_place, 'b'+c)) {
              isWins = false;

              // Check if the current bet place is a winner
              if      (_.includes(bet.bet_place, 'p'+c) && _.includes(resultSplit[c-1], 'player')) isWins = true;
              else if (_.includes(bet.bet_place, 'b'+c) && _.includes(resultSplit[c-1], 'banker')) isWins = true;

              // Get the card index value
              pCardVal = card[_.get(data, "gameResult.rawResult.player"+c, "")];
              bCardVal = card[_.get(data, "gameResult.rawResult.banker", "")];

              // Validators
              if (_.isUndefined(pCardVal) || _.isUndefined(bCardVal))
                continue;

              // Pre-setting variables
              cardValDiff = card[Math.abs(pCardVal - bCardVal)];

              // For `EQUAL` betting place condition
              if (_.includes(bet.bet_place, 'equal')) {
                win_loss = bet.bet_amount * resultSerializer("equal", isWins, cardValDiff);
              }

              // For `DOUBLE` betting place condition
              else if (_.includes(bet.bet_place, 'double')) {
                ratio = resultSerializer("double", isWins, cardValDiff);
                derivedBet = bet.bet_amount / 5;
                win_loss = (derivedBet * ratio) + (isWins ? bet.bet_amount : (bet.bet_amount * -1))
                // console.log("Double", { isWins, ratio, win_loss, cardValDiff })
              }

              // For `MANY` betting place condition
              else if (_.includes(bet.bet_place, 'many')) {
                ratio = resultSerializer("many", isWins, cardValDiff);
                derivedBet = bet.bet_amount / 11;
                win_loss = (derivedBet * ratio) + (isWins ? bet.bet_amount : (bet.bet_amount * -1))
                // console.log("Many", { isWins, ratio, win_loss, cardValDiff })
              }
            }
          }

          bet.win_loss = win_loss;
        }

        function resultSerializer(odds = "", isWin = false, cardType = "") {
          let winLossMatrix = {
            equal: {
              win: {
                P5: 0.95,
                BB: 0.95,
                B9: 0.95,
                B8: 0.95,
                B7: 0.95,
                B6: 0.95,
                B5: 0.95,
                B4: 0.95,
                B3: 0.95,
                B2: 0.95,
                B1: 0.95,
                NB: 0.95
              },
              lose: {
                P5: 1,
                BB: 1,
                B9: 1,
                B8: 1,
                B7: 1,
                B6: 1,
                B5: 1,
                B4: 1,
                B3: 1,
                B2: 1,
                B1: 1,
                NB: 1
              }
            },
            double: {
              win: {
                P5: 4.75,
                BB: 2.85,
                B9: 1.90,
                B8: 1.90,
                B7: 1.90,
                B6: 0.95,
                B5: 0.95,
                B4: 0.95,
                B3: 0.95,
                B2: 0.95,
                B1: 0.95,
                NB: 0.95
              },
              lose: {
                P5: 5,
                BB: 3,
                B9: 2,
                B8: 2,
                B7: 2,
                B6: 1,
                B5: 1,
                B4: 1,
                B3: 1,
                B2: 1,
                B1: 1,
                NB: 1
              }
            },
            many: {
              win: {
                P5: 10.45,
                BB: 9.50,
                B9: 8.55,
                B8: 7.60,
                B7: 6.65,
                B6: 5.70,
                B5: 4.75,
                B4: 3.80,
                B3: 2.85,
                B2: 1.90,
                B1: 0.95,
                NB: 0.95
              },
              lose: {
                P5: 11,
                BB: 10,
                B9: 9,
                B8: 8,
                B7: 7,
                B6: 6,
                B5: 5,
                B4: 4,
                B3: 3,
                B2: 2,
                B1: 1,
                NB: 1
              }
            }
          };
          return _.get(winLossMatrix, odds + "." + (isWin ? "win" : "lose") + "." + cardType, 0);
        }

        return exits.success({payout: data.bets});
      },
    };
    functionGroup[method]();
  }


};

function RouletteBets() {
  var x = []
  for (var i = 1; i < 37; i++) {
    x.push(i)
  }

  function createSingleGroup(baseArray) {
    const singles = {}
    for (let x in baseArray) {
      x = (+x) + 1;
      singles[`s${x}`] = [x]
    }
    singles[`s0`] = [0]
    return singles
  }

  function createNearGroup(baseArray) {
    var nearGroup = {};
    var id = 1;
    for (let x in baseArray) {
      x = (+x) + 1;
      if (x%3) {
        let getNext = x + 1;
        nearGroup[`near${id}`] = [x, getNext];
        id++
      }
    }
    return nearGroup
  }

  function createSplitGroup(baseArray) {
    var splitGroup = {};
    // We use _.dropBy to remove out-bound bet area
    for (let x in _.dropRight(baseArray, 3)) {
      x = (+x) + 1;
      let getFuture = x + 3;
      splitGroup[`split${x}`] = [x, getFuture];
    }
    return splitGroup
  }

  function createZeroGroup() {
    var zeroGroup = {};
    for (var i = 1; i < 4; i++) {
      zeroGroup[`zero${i}`] = [0, i];
    }
    return zeroGroup;
  }

  function createStreetGroup(baseArray) {
    var streetGroup = {};
    var chunks = _.chunk(baseArray, 3)
    for (let z in chunks) {
      streetGroup[`street${(+z) + 1}`] = chunks[z]
    }
    return streetGroup
  }

  function createLineGroup(baseArray) {
    var lineGroup = {}
    var id = 1;
    Object.values(baseArray).forEach((a, b) => {
      // We limit the loop to 11 to remove out-bound bet area
      if (id <= 11) {
        lineGroup[`line${id}`] = a.concat(Object.values(baseArray)[b+1])
        id++
      }
    })
    lineGroup[`line0`] = [0,1,2,3];
    return lineGroup;
  }

  function createSquareGroup(baseArray) {
    var squareGroup = {};
    var id = 1;
    // We use _.dropBy to remove out-bound bet area
    for (let x in _.dropRight(baseArray, 3)) {
      x = +x // transform to integer, not to be confused as increment
      if (x%3) {
        let s1 = x
        let s2 = x + 1
        let s3 = x + 3
        let s4 = x + 4
        squareGroup[`square${id}`] = [s1, s2, s3, s4]
        id++
      }
    }
    return squareGroup
  }

  function createTriangleGroup() {
    return {
      tri1: [0, 1, 2],
      tri2: [0, 2, 3]
    }
  }

  function createRowGroup() {
    var rowGroup = {}
    for (let i = 1; i < 4; i++) {
      var container = []
      for (let j = 0; j < 12; j++) {
        container.push(i + (j * 3))
      }
      rowGroup[`row${i}`] = container
    }
    return rowGroup
  }

  function createDozenGroup(baseArray) {
    var dozenGroup = {}
    var chunks = _.chunk(baseArray, 12)
    for (let x in chunks) {
      x = (+x) + 1;
      dozenGroup[`dozen${x}`] = chunks[x - 1]
    }
    return dozenGroup
  }

  function createSmallGroup(baseArray) {
    return {
      small: baseArray.slice(0, 18)
    }
  }

  function createBigGroup(baseArray) {
    return {
      big: baseArray.slice(18, 36)
    }
  }

  function createEvenGroup(baseArray) {
    return {
      even: baseArray.filter(a => a%2 !== 1)
    }
  }

  function createOddGroup(baseArray) {
    return {
      odd: baseArray.filter(a => a%2)
    }
  }

  function createColourGroup(baseArray) {
    return {
      red: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
      black: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
    }
  }

  return {
    ...createSingleGroup(x),
    ...createNearGroup(x),
    ...createSplitGroup(x),
    ...createZeroGroup(),
    ...createStreetGroup(x),
    ...createLineGroup(createStreetGroup(x)),
    ...createSquareGroup(x),
    ...createTriangleGroup(),
    ...createRowGroup(),
    ...createDozenGroup(x),
    ...createSmallGroup(x),
    ...createBigGroup(x),
    ...createEvenGroup(x),
    ...createOddGroup(x),
    ...createColourGroup(x)
  };
}

function getRouletteWins(result) {
  const groups = RouletteBets();
  const winners = []
  _.each(groups, (value, key) => {
    if (value.includes(+result)) {
      winners.push(key)
    }
  })
  return winners
}
