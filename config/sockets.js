/**
 * WebSocket Server Settings
 * (sails.config.sockets)
 *
 * Use the settings below to configure realtime functionality in your app.
 * (for additional recommended settings, see `config/env/production.js`)
 *
 * For all available options, see:
 * https://sailsjs.com/config/sockets
 */

module.exports.sockets = {
  /***************************************************************************
   *                                                                          *
   * `transports`                                                             *
   *                                                                          *
   * The protocols or "transports" that socket clients are permitted to       *
   * use when connecting and communicating with this Sails application.       *
   *                                                                          *
   * > Never change this here without also configuring `io.sails.transports`  *
   * > in your client-side code.  If the client and the server are not using  *
   * > the same array of transports, sockets will not work properly.          *
   * >                                                                        *
   * > For more info, see:                                                    *
   * > https://sailsjs.com/docs/reference/web-sockets/socket-client           *
   *                                                                          *
   ***************************************************************************/

  transports: [ 'websocket', 'polling' ],


  /***************************************************************************
   *                                                                          *
   * `beforeConnect`                                                          *
   *                                                                          *
   * This custom beforeConnect function will be run each time BEFORE a new    *
   * socket is allowed to connect, when the initial socket.io handshake is    *
   * performed with the server.                                               *
   *                                                                          *
   * https://sailsjs.com/config/sockets#?beforeconnect                        *
   *                                                                          *
   ***************************************************************************/

  beforeConnect: function(handshake, proceed) {
    const cookie = _.split(handshake.headers.cookie, " ");
    let token = _.replace(cookie[2], "panda_token=", "");
    sails.log('SOCKET CONNECTED [', token, "]\033[0m");

    // `true` allows the socket to connect.
    // (`false` would reject the connection)
    return proceed(undefined, true);
  },


  /***************************************************************************
   *                                                                          *
   * `afterDisconnect`                                                        *
   *                                                                          *
   * This custom afterDisconnect function will be run each time a socket      *
   * disconnects                                                              *
   *                                                                          *
   ***************************************************************************/

  afterDisconnect: function(session, socket, done) {
    sails.log('SOCKET RELEASED', socket.id);
    let tasks;

    tasks = {
      // Get socket id information
      socketInfo: (cb) => {
        CacheService.get(socket.id, async (err, player) => {
          if (err)
            return cb(err);
          // Check if the player has a cache record
          if (!player)
            return cb("Socket information no record on cache.");
          // Pull-out player information
          let user = await Users.findOne({
            select: ['table_location'],
            where: {
              id: player.id
            }});
          // Check if has player on that ID
          if (_.isUndefined(user) || _.isEmpty(user))
            return cb("Player Not Found");

          return cb(null, user);
        });
      },

      // Update player location
      updatePlayerLocation: ["socketInfo", async (arg, cb) => {
        await Users
          .update({
            id: arg.socketInfo.id
          })
          .set({
            table_location: "Lobby",
            logged: 0
          })
          .intercept((err) => {
            return cb(err);
          });

        return cb(null, arg.socketInfo);
      }],

      // Broadcast player update if the player close/logout on browser
      playerList: ["updatePlayerLocation", "socketInfo", async (arg, cb) => {
        let players_info;

        // If the player is in lobby, skip broadcasting update
        if (arg.socketInfo.table_location.toUpperCase() === "LOBBY")
          return cb(null, arg.socketInfo);

        players_info = await Users.find({
          select: [
            'nickname',
            'balance',
            'imgname',
            'imgname_mobile',
            'wins',
            'win_amount',
            'currency',
            'winningstreak',
            'min_bet_limit',
            'max_bet_limit'
          ],
          where: {
            table_location: arg.socketInfo.table_location || ""
          }});

        await async.eachSeries(players_info, async (i, cb) => {
          i['id'] = await syfer('encrypt', i.id);
          cb();
        }, async (err) => {
          await socketHelper('blast', {event: 'table_players', values: {tableNumber: arg.socketInfo.table_location, playersList: players_info}});
          await CacheService.delete(socket.id, (err, result) => {});
          return cb(err, arg.socketInfo);
        })
      }],

      playerLocationCache: ["playerList", "socketInfo", (arg, cb) => {
        let USER_COUNT;

        CacheService.get("player_location_cached", (err, token) => {
          if (err) return cb(err);

          if (token) {
            USER_COUNT = token;
            _.forEach(USER_COUNT, (v, k) => {
              _.remove(USER_COUNT[k].players, (player) => {
                return player.id === arg.socketInfo.id
              })
            });

            CacheService.set("player_location_cached", USER_COUNT, -1, async (err) => {
              if (err) return cb(err);

              await socketHelper('blast', {
                event: 'player_location',
                values: USER_COUNT
              });

              return cb()
            })
          } else {
            console.log("\033[43m\033[30m", "<<< WARNING: Player Location Not Initialized. [REDIS:player_location_cached]", "\033[0m")
            return cb()
          }
        });
      }]
    };

    async.auto(tasks, done);
    // Disconnect to all active rooms on shut down
    // By default: do nothing.
    // (but always trigger the callback)
  },

  pingInterval: 25000,
  pingTimeout: 60000,
  /***************************************************************************
   *                                                                          *
   * Whether to expose a 'GET /__getcookie' route that sets an HTTP-only      *
   * session cookie.                                                          *
   *                                                                          *
   ***************************************************************************/

  // grant3rdPartyCookie: true,


};
