/**
 * Locations.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 'c_locationlist',
    
    attributes: {
        id: {
        type: 'number',
        unique: true,
        autoIncrement: true
        },

        language_code: {
        type: 'string'
        },

        location: {
        type: 'string'
        }
    }
};
  
  