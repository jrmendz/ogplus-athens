/**
 * ResultList.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'c_resultlist',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true
    },
    result: {
      type: 'string',
      required: true
    }
  }

};

