/**
 * ListLanguages.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 't_language_settings',
    
    attributes: {
        id: {
            type: 'number',
            unique: true,
            autoIncrement: true
        },

        name: {
            type: 'string',
            required: true
        },

        view: {
            type: 'string'
        },

        code: {
            type: 'string',
            required: true
        },
        
        created_at: {
            type: 'ref',
            columnType: 'datetime',
            columnName: 'created_at'
        },
        
        is_default: {
            type: 'boolean'
        },
    }
};
  
  