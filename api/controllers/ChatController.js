/**
 * ChatController
 *
 * @description :: Server-side actions for handling incoming requests for chat.
 * @description :: Room names       => ChatRoomOfTable_[table_number]
 * @description :: Event names      => new_message, delete_message, user_join
 * @description :: Model dependency => Chat
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
// let Filter = require('bad-words');
const HTTP = require("request");
module.exports = {
  /**
   * POST /user/chatMessage
   * @param req: {body|token,message,table_number}
   * @param res
   * @author aavaldez
   */
  chatMessagePost : async(req, res) => {
    let params = req.body;
    let task, roomName, message, userInfo, badWordFilter;
    let NLPAvailable = true;

    // Make sure this is a socket request (not traditional HTTP)
    if (!req.isSocket)
      return res.badRequest();

    //Validators
    if(_.isUndefined(params.token))
      return res.badRequest({err: '[token]: Invalid parameter.', status: 400});
    if(_.isUndefined(params.message))
      return res.badRequest({err: '[message]: Invalid parameter.', status: 400});
    if(_.isUndefined(params.table_number))
      return res.badRequest({err: '[table_number]: Invalid parameter.', status: 400});

    roomName = 'ChatRoomOfTable_' + params.table_number;

    task = {
      // Verify token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },

      //
      NLPToken: ["verifyToken", (arg, cb) => {
        CacheService.get("NLP_TOKEN", (cb));
      }],

      // Check custom blocked words on database
      checkBlockedWords: ["NLPToken", "verifyToken", async (arg, cb) => {
        if (arg.NLPToken) {
          // Call API
          HTTP.put({
            url: sails.config.services.chat.validator + '/' + arg.NLPToken + '/validate',
            timeout: 10000,
            body: {
              "user_id": arg.verifyToken.id,
              "username": arg.verifyToken.username,
              "ipaddress": params.ip || '::1',
              "sentence": params.message
            },
            json: true
          }, (err, data) => {
            const NLPError = _.get(data, 'body', null);
            if (err) {
              console.log("\033[43m\033[30m", "Unable to use [SERVICE][Chat Profanity].", "\033[0m");
              console.log("\033[43m\033[30m", "Due to this error", new Error(err), "\033[0m");
            }

            if (NLPError.error_message) {
              console.log(NLPError);
              return cb({error: NLPError.error_message, code: NLPError.code})
            }

            if (!_.isEmpty(_.get(data, 'body.result', {}))) {
              return cb(null, data.body.result["filtered_sentence"] || "")
            } else {
              console.log("\033[43m\033[30m", "Unable to use [SERVICE][Chat Profanity] filtered_sentence object missing", "\033[0m");
              NLPAvailable = false;
              return cb(null, params.message)
            }
          });
        } else {
          console.log("\033[43m\033[30m", "Unable to use [SERVICE][Chat Profanity] due to missing token", "\033[0m");
          return cb(null, params.message)
        }
      }],

      // Save message to database
      saveMessageToDb: ['verifyToken', 'checkBlockedWords', async(arg, cb)=> {

        console.log(arg.checkBlockedWords)
        // If contains blocked words return error
        message = await Chat.create({
          username: arg.verifyToken.username,
          table_number: params.table_number,
          message: encodeURI(arg.checkBlockedWords),
          cancelled: false
        }).fetch()
          .intercept((err) => {
            return cb(err);
          });
        // Return value if no exception detected
        return cb(null, message)
      }],

      // Broadcast message to all table subscriber
      broadcastMessage : ['saveMessageToDb', "verifyToken", "checkBlockedWords", async(arg, cb) => {
        // Broadcast new message
        await socketHelper('broadcast', {
          room: roomName,
          event: 'new_message',
          values : {
            id: arg.saveMessageToDb.id,
            userId: arg.verifyToken.id,
            username: arg.saveMessageToDb.username,
            nickname: arg.verifyToken.nickname,
            table_number: params.table_number,
            avatar: arg.verifyToken.imgname,
            message: arg.checkBlockedWords
          }
        });

        // Return value if no exception detected
        return cb(null, arg.saveMessageToDb);
      }]
    };

    // Execute task
    async.auto(task, (err) => {
      return res.json({
        err: err,
        status: err ? 400 : 200,
        message: err ? 'Message is invalid.' : 'Message has been sent! ' + (NLPAvailable ? '' : 'But not filtered due NLP server error'),
        data: err ? {} : message
      });
    });
  },

  /**
   * DELETE /user/chatMessage
   * @param req: {body|token,id,table_number}
   * @param res
   * @author aavaldez
   */
  chatMessageDelete : async(req, res) => {
    let params = req.body;
    let task, userInfo, roomName;

    // Make sure this is a socket request (not traditional HTTP)
    if (!req.isSocket)
      return res.badRequest();

    //Validators
    if(!params.token)
      return res.json({err: '[token]: Invalid parameter.', status: 400});
    if(!params.id)
      return res.json({err: '[id]: Invalid parameter.', status: 400});
    if(!params.table_number)
      return res.json({err: '[table_number]: Invalid parameter.', status: 400});

    roomName = 'ChatRoomOfTable_' + params.table_number;

    task = {
      // Verify token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },

      // Set cancel on database using message id and table_number
      cancelMessage : ['verifyToken', async(arg, cb) => {
        await Chat.update({
          id: params.id,
          table_number: params.table_number
        },{
          cancelled: true
        })
          .fetch()
          .intercept((err) => {
            return cb(err);
          });
        // Return value if no exception detected
        return cb(null, params.id);
      }],

      // Broadcast message to delete message using id
      broadcastDelete: ['cancelMessage',  async(arg, cb)=> {
        try {
          await socketHelper('broadcast',{
            room: roomName,
            event: 'delete_message',
            values : {
              id: arg.cancelMessage
            }
          });
        } catch(ex) {
          return cb(ex);
        }
        // Return value if no exception detected
        return cb(null, arg.cancelMessage);
      }]
    };

    // Execute tasks
    async.auto(task, (err, result) => {
      if(err){
        res.json({err: err, status: 400, message: err.statusText});
      } else {
        res.json({
          err: null,
          status: 200,
          message: 'Message ID `' + result.cancelMessage + '` has been deleted.',
          data: {
            id: result.cancelMessage
          }
        });
      }
    });
  },

  /**
   * PUT /user/chatChangeNickname
   * @param req: {body|token,newNickname,oldNickname,table_number}
   * @param res
   * @author aavaldez
   * @desc  This function has a sub-routine that will update cookie, chat nickname & broadcast chat thread change
   */
  chatChangeNickname : async(req, res) => {
    let params = req.body;
    let task, userInfo, roomName;

    // Make sure this is a socket request (not traditional HTTP)
    if (!req.isSocket)
      return res.badRequest();

    //Validators
    if(!params.token)
      return res.json({err: '[token]: Invalid parameter.', status: 400});
    if(!params.newNickname)
      return res.json({err: '[newNickname]: Invalid parameter.', status: 400});
    if(!params.oldNickname)
      return res.json({err: '[oldNickname]: Invalid parameter.', status: 400});

    roomName = 'ChatRoomOfTable_' + (params.table_number || '');

    task = {
      // Verify token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },

      // Broadcast change of nickname event to all table subscriber
      broadcastMessage : ['verifyToken', async(arg, cb)=>{
        if (params.table_number) {
          try {
            await socketHelper('broadcast',{
              room: roomName,
              event: 'change_nickname',
              values : {
                oldNickname: params.oldNickname,
                newNickname: params.newNickname,
                table_number: params.table_number
              }
            });
          } catch(ex) {
            return cb(ex);
          }
          // Return value if no exception detected
          return cb(null, null);
        } else {
          return cb(null, null)
        }
      }]
    };

    // Execute task
    async.auto(task, (err) => {
      if(err){
        return res.json({err: err, status: 400});
      } else {
        return res.json({err: null, status: 200, message: 'User nickname has been changed!', data : null})
      }
    });

  },

  /**
   * POST /user/joinChatTable
   * @param req: {body|token,table_number,threadLimit,threadSkip}
   * @param res
   * @author aavaldez
   */
  joinChatTable : async(req, res) => {
    let params = req.body;
    let threadDefaultLimit = 10;    // Number of messages to be shown
    let threadDefaultSkip = 0;      // Skip limit on query
    let roomName, userInfo, task, thread, q;

    // Make sure this is a socket request (not traditional HTTP)
    if (!req.isSocket)
      return res.badRequest();

    // Validator
    if(_.isUndefined(params.token))
      return res.badRequest({ err: 'Invalid parameter: [token]', status: 400 });
    if(_.isUndefined(params.table_number))
      return res.badRequest({ err: 'Invalid parameter: [table_number]', status: 400 });

    roomName = 'ChatRoomOfTable_' + params.table_number;

    task = {
      // Verify token
      verifyToken: async (cb) => {
        await JwtService.valid(params.token)
          .then((token) => {
            return cb(null, token);
          })
          .catch((err) => {
            return cb(err)
          });
      },

      // Join on socket room "ChatRoomOfTable_[table_number]"
      joinRoom: ['verifyToken', async (arg, cb) => {
        await socketHelper('join', {room: roomName, req: req, user: arg.verifyToken.username});
        await socketHelper('broadcast', {
          room: roomName,
          event: 'user_join',
          values: {
            full_name: arg.verifyToken.full_name,
            username: arg.verifyToken.username
          }
        });

        // Return value if no exception detected
        return cb();
      }],

      // Get thread on database using table_number
      getThread: ['joinRoom', (arg, cb) => {
        let _data;
        q = "SELECT t1.id, t0.nickname, t1.message, t1.created_at FROM t_user t0 LEFT JOIN t_chat t1 ON t0.username = t1.username WHERE t1.table_number = $1 AND t1.cancelled = 0 ORDER BY id DESC LIMIT " + (params.threadLimit || threadDefaultLimit) + ";";
        sails
          .sendNativeQuery(q, [params.table_number], function (err, dataRows) {
            if (err) return cb(err);

            _data = dataRows.rows
              .reverse()
              .map(function (d) { return {
                id: d['id'],
                nickname: d['nickname'],
                message: decodeURI(d['message']),
                created_at: d['created_at']
              }})
            // Return value if no exception detected, get last 10 recent chat per table
            return cb(null, _data);
          });
      }]
    };

    // Execute task
    async.auto(task, (err, result) => {
      if (err)
        return res.badRequest({ err: err, status: 400, message: err.statusText });
      return res.json({
        err: null,
        status: 200,
        message: 'Thread for table ' + params.table_number,
        data: {
          username: result.verifyToken.username,
          thread : result.getThread
          // thread : []
        }
      })
    });
  }
};
