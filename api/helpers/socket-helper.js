const _SYFER_ = require("../helpers/encryption-helper");
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
  // 	success: {
  // 		description: 'Socket function success'
  // 	},
  // 	error: {
  // 		message: 'error'
  // 	}
  // },
  fn: async (inputs, exits) => {
    const method = inputs.method
    const data = inputs.params;
    const functionGroup = {
      leave: () => {
        // Validators
        if (_.isUndefined(data.req))
          return exits.error("Invalid Parameter: [req]");
        if (_.isUndefined(data.room))
          return exits.error("Invalid Parameter: [room]");
        if (_.isUndefined(data.user))
          return exits.error("Invalid Parameter: [user]");

        sails.sockets.leave(data.req, data.room, (err) => {
          if (err)
            return exits.error(err);
          sails.log('User ' + data.user + ' have left the room: ' + data.room);
          return exits.success();
        });
      },
      join: () => {
        // Validators
        if (_.isUndefined(data.req))
          return exits.error("Invalid Parameter: [req]");
        if (_.isUndefined(data.room))
          return exits.error("Invalid Parameter: [room]");
        if (_.isUndefined(data.user))
          return exits.error("Invalid Parameter: [user]");

        sails.sockets.join(data.req, data.room, (err) => {
          if (err)
            return exits.error(err);
					sails.log('User ' + data.user + ' successfully joined room: ' + data.room);
					return exits.success();
				});
			},
			broadcast: () => {
				if (data.event)
					sails.sockets.broadcast(data.room, data.event, data.values);
				else
					sails.sockets.broadcast(data.room, data.values);
				return exits.success();
			},
			blast: () => {
				sails.sockets.blast(data.event, data.values);
				sails.log('Blasted message: ' + data.event)
				return exits.success();
			},
			get: () => {
        // Validators
        if (_.isUndefined(data.room))
          return exits.error("Invalid Parameter: [room]");

				sails.io.sockets.in(data.room).clients((err, res) => {
          if (err)
            return exits.error(err);
          return exits.success(res);
        })
      }
    };
    // sails.log(method + ' event: ' + (data.event || data.room))
    functionGroup[method]();
  }
};
