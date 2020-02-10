const ICHIPS_URL = "http://192.168.204.115:3000";
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
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
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
    url: 'redis://root:'+process.env.REDIS_PASSWORD+'@'+process.env.REDIS_HOST+':'+process.env.REDIS_PORT+'/'+ process.env.REDIS_DB_SESSION,
    cookie: {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    },

  },
  sockets: {
    adapter: "@sailshq/socket.io-redis",
    host: process.env.REDIS_HOST,
    pass: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
    db: parseInt(process.env.REDIS_DB),
    prefix: "sock:"
  },
  log: {
    level: 'debug'
  },
  http: {
    cache: {
      prefix: "cache:",
      ttl: 7200,
      adapter: "redis",
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
      port: process.env.REDIS_PORT,
      db: parseInt(process.env.REDIS_DB)
    },
    trustProxy: true
  },
  port: 8001,
  custom: {
    baseUrl: 'https://panda.oriental-game.com',
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
      username: "",
      password: ""
    },
    // gameapp: "wss://aquarius-test.oriental-game.com:12345",
    gameapp: "ws://gameapps.hanx28.com:12345/casino/athens",
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
  version: "2.0.0.0065"
};
