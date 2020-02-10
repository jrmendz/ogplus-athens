module.exports = {


  friendlyName: 'Encryption helper',


  description: 'Provides simple encryption library, uses aes192',


  inputs: {
    method: {
      type: 'string'
    },
    value: {
      type: 'string'
    }
  },

  fn: async function (inputs, exits) {

    const { method, value } = inputs
    const functionGroup = {
      encrypt () {
        let cipher = crypt.createCipher('aes192', sails.config.security.encryptSecret);
        let encrypted = cipher.update(value, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return exits.success(encrypted);
      },
      decrypt () {
        let decipher = crypt.createDecipher('aes192', sails.config.security.encryptSecret);
        let decrypted = decipher.update(value, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return exits.success(decrypted);
      }
    }
    functionGroup[method]();
  },

  custom: {
    // Synchronous call of encryption
    encrypt: function (text) {
      let cipher = crypt.createCipher('aes192', sails.config.security.encryptSecret)
      return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    },
    // Synchronous call of decryption
    decrypt: function (text) {
      let decipher = crypt.createDecipher('aes192', sails.config.security.encryptSecret);
      return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
    }
  }
};

