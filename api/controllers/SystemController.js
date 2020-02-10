module.exports = {
  /**
   * GET /system/currenttime
   * @param req: {body|token}
   * @param res
   * @author jrmendoza
   */
  getCurrentSystemTime : ( req, res) => {
    let params = req.query;
    let response = {}
    let task = {
      // Verify if token is valid
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          }, (err) => {
            // Send error message
            response = { error: err }
            return cb(err)
          });
      },
      // Get current system time
      getCurrentTime: ["verifyToken", (arg, cb) => {
        // Current system time using moment js
        return cb(null, {
          current_time: moment().format('YYYY-MM-DD HH:mm:ss'),
          current_time_utc: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
          current_time_12H: moment().format('YYYY-MM-DD hh:mm:ss'),
          current_time_utc_12H: moment().utc().format('YYYY-MM-DD hh:mm:ss'),
        })
      }]
    };
    // Execute task
    async.auto(task, (err, taskResults) => {
      return res.json({
        status: err ? 400 : 200,
        data: taskResults.getCurrentTime
      });
    });
  },


  getSystemVersion: (req, res) => {
    return res.json({ VERSION: `ATHENS API v${ATHENS_VERSION}`})
  }
};
