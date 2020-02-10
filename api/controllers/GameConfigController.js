/**
 * GameConfigController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 *
 * @apiDefine UserNotFound
 * @apiErrorExample {json} Not Found Response
 * {
 *   'code': 404,
 *   'status': 'Not Found',
 *   'meta': {
 *     'msg': 'Operator not found.'
 *   }
 * }
 *
 * @apiDefine ServerError
 * @apiErrorExample {json} Server Error Response
 * {
 *   'code': 500,
 *   'status': 'Server Error',
 *   'meta': {
 *     'msg': 'Internal Server Error'
 *   }
 * }
 */

module.exports = {
  /**
   * @api {PUT} /config
   * @apiName Room Subscription
   * @apiGroup GameConfig
   *
   * @apiSuccessExample {json} Success Response:
   * {
   *   'status': 200,
   *   'message': 'Subscribed to a room successful'
   * }
   * @apiErrorExample {json} Bad Request Response
   * {
   *   'code': 400,
   *   'status': 'Bad Request',
   *   'meta': {
   *     'msg': {
   *       'room': 'Must not be empty',
   *       'token': 'Must not be empty'
   *     }
   *   }
   * }
   * @apiUse UserNotFound
   * @apiUse ServerError
   */
  reloadConfig: (req, res) => {
    const gameConfService = new GameConfigService();

    gameConfService.initGameConfig({}, (err, data) => {
      if (err) {
        return res.badRequest(err);
      }

      return res.json({
        status: 200,
        message: 'Config has been reloaded'
      })
    })
  },

  /**
   * @api {GET} /config
   * @apiName Room Subscription
   * @apiGroup GameConfig
   *
   * @apiSuccessExample {json} Success Response:
   * {
   *   'status': 200,
   *   'message': 'Subscribed to a room successful'
   * }
   * @apiErrorExample {json} Bad Request Response
   * {
   *   'code': 400,
   *   'status': 'Bad Request',
   *   'meta': {
   *     'msg': {
   *       'room': 'Must not be empty',
   *       'token': 'Must not be empty'
   *     }
   *   }
   * }
   * @apiUse UserNotFound
   * @apiUse ServerError
   */
  getConfig: (req, res) => {
    const gameConfService = new GameConfigService();
    // const authService = new AuthService({}, new JWToken());
    let tasks;

    tasks = {
      getConfig: (next) => {
        return gameConfService.getConfig(null, next);
      }
    };

    async.auto(tasks, (err, taskResult) => {
      if (err)
        return res.badRequest(err);

      return res.json({
        status: 200,
        message: 'Configuration has been pulled.',
        data: taskResult.getConfig
      })
    })

  }
};

