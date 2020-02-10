/**
 * @class GameConfigService
 * @description GameService
 * @author Alvin Phoebe Artemis Valdez
 * @return {void}
 * @example
 * const gameAppService = new GameAppService()
 */
const GAME_CONFIG_KEY = 'GAME_CONF';

function GameConfigService () {
  /**
   * @memberof GameConfigService
   * @function initGameApp
   * @property {string[]} user - User Data []
   * @param {string} data Custom data for configuration
   * @param {function} callback callback function
   * @return {string[]}
   * @example
   * authService.initGameApp(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'initGameConfig', {
    value: (data, done) => {
      const query = 'SELECT * FROM t_settings t0 WHERE t0.CANCELLED = 0;';
      let tasks;

      tasks = {
        // Get configuration from database
        configFromDB: (next) => {
          sails.sendNativeQuery(query, [], next);
        },
        // Logical json format compatible with desktop
        formatConfig: ['configFromDB', (arg, next) => {
          let { rows } = arg.configFromDB;
          let finalConfig = {};

          // Check if the database has configuration
          if (!_.size(rows)) {
            console.warn('No configuration file pulled from database. Setting Default');
            return next();
          }

          for (let i = 0; i < rows.length; i++ ) {
            let config = rows[i];

            // If the setting is already registered follow weighing condition
            if (_.has(finalConfig, config.setting)) {

              // Check the effectivity of previous registered config
              let compareDate = moment().utc();
              let startDate   = moment(config['start_effectivity'], "YYYY-MM-DDTHH:mm:ss");
              let endDate     = moment(config['end_effectivity'], "YYYY-MM-DDTHH:mm:ss");

              // If the current configuration is set today, priority
              if (compareDate.isBetween(startDate, endDate)) {
                // Replace the existing record
                finalConfig[config.setting] = JSON.parse(JSONParse(config.value) || '{}')
              }
            } else {
              // Add to configuration
              _.assign(finalConfig, { [config.setting]: JSON.parse(JSONParse(config.value) || '{}')} )
            }
          }
          return next(null, finalConfig);
        }],
        // Save to cache
        saveToCache: ['formatConfig', (arg, next) => {
          // Cache the configuration file
          CacheService.set(GAME_CONFIG_KEY, arg.formatConfig, -1, next);
        }]
      };

      async.auto(tasks, done);
    }
  });

  /**
   * @memberof GameConfigService
   * @function getConfig
   * @param {function} callback callback function
   * @return {string[]}
   * @example
   * authService.getConfig(data, (err, result) => {
   *   // TODO:
   * })
   */
  Object.defineProperty(this, 'getConfig', {
    value: (data, done) => {

      // Cache the configuration file
      CacheService.get(GAME_CONFIG_KEY, (err, cache) => {
        if (err)
          return done(err);

        if (_.isNull(cache))
          return done({code: 'NO_CONF', error: 'No configuration saved.'});

        // Return configuration
        return done(null, cache)
      });
    }
  });
}

module.exports = GameConfigService;
