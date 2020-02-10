/**
 * Shoehand.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 'c_shoehand',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true
    },
    shoehandnumber: {
      type: 'string',
      required: true
    }
  }

};

