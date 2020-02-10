const jwtSecret = sails.config.security.jwtSecret;

module.exports = {
  issue: function (payload) {
    token = jwt.sign(payload, jwtSecret, { expiresIn: '1d' })
    return token;
  },
  verify: function async (token, result) {
    return new Promise((resolve, reject) => {
      CacheService.get(token, (err, data) => {
        if (!data) return resolve(null);
        return resolve(data);
      })
    })
    //return jwt.verify(token, jwtSecret, result);
  },
  // valid: async function (token) {
  //   try {
  //     if (!token || token === 'xxxx') {
  //       throw "Invalid Token"
  //     }
  //     const data = jwt.decode(token, jwtSecret);
  //     if (!data) throw "Invalid Token";
  //     let res = await Users.findOne({ id: data.id })
  //       .intercept((err) => {
  //         return err;
  //       });
  //     if (res.disabled === 1) throw "User is disabled"
  //     return res;
  //   } catch (e) {
  //     sails.log.error(e)
  //     return undefined
  //   }
  // }

  valid: function (token) {
    let user;
    return new Promise((resolve, reject) => {
      // Check if undefined
      if (_.isUndefined(token)) {
        // console.log("<<<< JWT: Invalid Token >>>>", typeof token);
        return reject("<<<< JWT: Invalid Token >>>>");
      }
      // Check if valid
      if (!token || token === 'xxxx') {
        // console.log("<<<< JWT: Invalid Token >>>>", typeof token);
        return reject("<<<< JWT: Invalid Token >>>>");
      }
      // JWT decoder
      user = jwt.decode(token, jwtSecret);

      if (!user) {
        // console.log("<<<< JWT: Invalid Decoded Token >>>>");
        return reject("<<<< JWT: Invalid Decoded Token >>>>");
      } else {
        // Pull-out user data
        Users
          .findOne({ id: user.id })
          .exec((err, data) => {
            // If error encounters
            if (err) return reject();
            // If user is disabled
            if (data.disabled) {
              // console.log("<<<< JWT: Disabled User >>>>", user.username);
              return reject("<<<< JWT: Disabled User >>>>");
            }
            return resolve(data);
          });
      }
    });
  }
};
