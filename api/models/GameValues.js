/**
 * GameValues.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 't_game_values',
  attributes: {
    id: {
      type: 'number',
      unique: true,
      autoIncrement: true
    },
    values: {
      type: 'string'
    },
    // 1 = baccarat , 4 = moneywheel
    game_type: {
      type: 'number'
    },
    result_id: {
      model: 'Results'      
    }
  }
};
