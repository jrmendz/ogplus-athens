
/**
 * TranslationController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    /**
   * Get Transalation
   * @param {req}
   * @param {res}
   * @route Get /translation
   * @return {*}
   */

 getAllTranslation: async (req, res) => {

  let {lang, token} = req.query

        //Validator
    if (_.isUndefined(token))  return res.badRequest({status: 400, err:"Invalid Credentials: [token]"});
    if (!_.includes(['en', 'cn', 'ja', 'ko', 'indo', 'th', 'vi'], lang))  return res.badRequest({status: 400, err: "Invalid Parameter: [languange]"})

    const tasks = {
       //Verifying token
      verifyToken: async function (next) {
        await JwtService.valid(token)
          .then((done) => { return next(null, done);
          }).catch((err) => {
            return next(err)
          });
      },
      //Get translation list
      List: ["verifyToken",async (result, next) => {
      Translation.find({select:lang})
        .then((done)=>{
          return next(null, done);
        })
        .catch((err)=>{
          if (err){ return next(err)}
        })
      
      }]
    }
      // Execute task
    async.auto(tasks, (err, results) => {
      if (err) return res.json({ status: 401, msg: err});
      return res.json({ status: 200, message: 'Successfully Get Translation List.', data: results.List});
    })
  }
  
 }
  