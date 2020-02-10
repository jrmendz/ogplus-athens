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
  // exits: {
  //  success: {
  //    description: 'Socket function success'
  //  },
  //  error: {
  //    message: 'error'
  //  }
  // },
  fn: async (inputs, exits) => {
    const method = inputs.method
    const data = inputs.params;
    const functionGroup = {
      getPlayersInside: () => {
        let newGroup = []
        if (data.players_inside.length > 0) {
          data.players_inside.forEach( async (x, i) => {
            sails.log('xxxxxxxxxx', x)
            await CacheService.get(x, (err, res) => {
              if (err)
                return exits.success(err);
              // If user data is not found, check cache @ AuthController.js
              if (!res)
                return;
              // Get specific Data
              let obj = {
                id: res.id,
                nickname: res.nickname,
                balance: res.balance,
                imgname: res.imgname,
                imgname_mobile: res.imgname_mobile
              };
              // Add player
              newGroup.push(obj);
              // Return on last item
              if (i === (data.players_inside.length - 1)) {
                return exits.success(newGroup)
              }
            });
          })
        } else {
          return exits.success(newGroup)
        }
      }
    }
    functionGroup[method]();
  }
};
