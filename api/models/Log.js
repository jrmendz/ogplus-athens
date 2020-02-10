/**
 * GameValues.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 't_logs',
    attributes: {
      id: {
        type: 'number',
        unique: true,
        autoIncrement: true
      },
      log_info: {
        type: 'string'
      },
      action: {
        type: 'string'
      },
      log_type: {
        type: 'string'
      },
      created_at: {
          type: 'ref', 
          columnType: 'datetime', 
          columnName: 'created_at'
      }
    }
  };
  