/**
 * C_betplace.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'c_betplace',
  attributes: {
    id: { type: 'number', autoIncrement: true },
    bet_place: { type: 'string', required: true },
    gamecode_id: { type: 'number', required: true }
  },

};

