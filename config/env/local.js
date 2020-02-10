const ICHIPS_URL = "http://172.16.126.3:3001";
module.exports = {


  /**************************************************************************
   *                                                                         *
   * Tell Sails what database(s) it should use in production.                *
   *                                                                         *
   * (https://sailsjs.com/config/datastores)                                 *
   *                                                                         *
   **************************************************************************/
  datastores: {
    default: {
      adapter: 'sails-mysql',
      database: "panda_dev",
      host: "172.16.126.116",
      user: "panda_dev",
      password: "Panda@123456",
      port: 3306,
      connectTimeout: 300000
    },

  },
  models: {
    migrate: 'safe'
  },
  blueprints: {
    shortcuts: false,
  },
  security: {
    cors: {
      // allowOrigins: [
      //   'https://example.com',
      // ]
    },

  },
  session: {
    adapter: '@sailshq/connect-redis',
    url: 'redis://172.16.126.116:6379/0',
    cookie: {
      // secure: true,
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    },

  },
  sockets: {
    adapter: "@sailshq/socket.io-redis",
    host: "172.16.126.116",
    pass: "",
    port: 6379,
    db: 0,
    prefix: "sock:"
  },
  /**************************************************************************
   *                                                                         *
   * Set the production log level.                                           *
   *                                                                         *
   * (https://sailsjs.com/config/log)                                        *
   *                                                                         *
   ***************************************************************************/
  log: {
    level: 'debug'
  },
  http: {
    cache: {
      prefix: "cache:",
      ttl: 7200,
      adapter: "redis",
      host: "172.16.126.116",
      password: "",
      port: 6379,
      db: 0
    }
  },
  port: 8001,
  custom: {
    baseUrl: 'https://example.com',
    internalEmailAddress: 'support@example.com'
  },
  services: {
    ichips: {
      auth: ICHIPS_URL + "/v1/auth/token",
      user: ICHIPS_URL + "/v1/user",
      getUser: ICHIPS_URL + "/v1/user/getUserInfo",
      payout: ICHIPS_URL + "/v1/balance/payout",
      bet: ICHIPS_URL + "/v1/balance/bet",
      transaction: ICHIPS_URL + "/v1/history/transaction",
      gameresult: ICHIPS_URL + "/v1/history/gameresult",
      deposit: ICHIPS_URL + "/v1/balance/deposit",
      withdraw: ICHIPS_URL + "/v1/balance/withdraw",
      balance: ICHIPS_URL + "/v1/balance",
      playerPoints: ICHIPS_URL + "/v1/user/point",
      playerExp: ICHIPS_URL + "/v1/user/exp",
      chipLimit: ICHIPS_URL + "/v1/chiplimit",
      history: ICHIPS_URL + "/v1/history/transaction",
      transactions: ICHIPS_URL + "/v1/history/transactions",
      transferValidation: ICHIPS_URL + "/v1/history/validate-transfer",
    },
    ichips_account: {
      username: "ogplusdev",
      password: "password123!"
    },
    gameapp: "ws://localhost:12345/df525c4b6d094937cb020ba1644d9224",
    // gameapp: "ws://172.16.126.116:12346/casino/athens",
    gameAppServerKey: "df525c4b6d094937cb020ba1644d9224",
    chat: {
      validator: "https://ogplus-test.oriental-game.com:8050/v1/domain"
    }
  },
  game_env: "ogplus",
  game_config: {
    singleRebetPerShoe: true,
    rebetValidity: 999999999
  },
  version: "2.0.0.00xx"
};
