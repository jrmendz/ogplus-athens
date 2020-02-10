module.exports = {


  friendlyName: 'Camelfy',


  description: `Camel case something, "camelfy"


    --- HOW SH** WORKS --- 
    Translate object keys to camel case for easier front end handling.
    Snake case isn't really a thing in front end, specially in javascript IMHO(Symon).
  `,


  inputs: {
      toCamelfy: {
          type: 'ref',
          defaultsTo: {}
      }
  },



  fn: async function (inputs, exits) {
      const toCamelfy = inputs.toCamelfy
      let data = toCamelfy.map((a, b) => {
        let model = {}
        for (let obj in (a)) {
          model[_.camelCase(obj)] = toCamelfy[b][obj]
        }
        return model
      });
      return exits.success(data)
  }

};

