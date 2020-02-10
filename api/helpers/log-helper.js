module.exports = {

  friendlyName: 'Log Helper',


  description: 'Logging of processes on API',


  inputs: {
    method: {
      type: 'string'
    },
    data: {
      type: 'ref'
    }
  },
  fn: function (inputs, exits) {
    const method = inputs.method;
    const data = inputs.data;
    const functionGroup = {
      debug: () => {
        let logData = {
          log_info: JSON.stringify(data.info),
          log_type: 'DEBUG',
          action: data.action
        }
        Logs.create(logData)
          .exec( function (err, log) {});

        return exits.success();
      },
      error: () => {
        let logData = {
          log_info: JSON.stringify(data.info),
          log_type: 'ERROR',
          action: data.action
        }
        Logs.create(logData)
          .exec( function (err, log) {});

        return exits.success();
      }
    }
    functionGroup[method]();
  }
}
