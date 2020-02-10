module.exports = {

  friendlyName: 'Balance update helper',


  description: 'Blasts balance updates for player and/or each player inside table',


  inputs: {
    method: {
      type: 'string'
    },
    data: {
      type: 'ref'
    }
  },

  fn: async function (inputs, exits) {
    const method = inputs.method
    const data = inputs.data
    const functionGroup = {
      player: () => {
        // broadcast player's updated balance
        sails.sockets.broadcast(`userRoom_${data.id}`, 'user_balance' , data.balance);
        // broadcast player winnings in a table
        sails.sockets.broadcast(`userRoom_${data.id}`, 'winloss' , {winloss: data.winnings, tableNumber: data.table, loss: data.loss, win: data.win});
        return exits.success();
      },
      table: () => {
        sails.sockets.broadcast(`table_${data.tablenumber}`, 'table_balance' , data.playerGroup);
        return exits.success();
      }
    }
    functionGroup[method]();
  }


};
