/**
 * Banners.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 't_game_banner',
    
    attributes: {
        id: {
            type: 'number',
            unique: true,
            autoIncrement: true
        },

        banner_image: {
            type: 'string'
        },

        view: {
            type: 'string'
        },

        position: {
            type: 'number',
            unique: true,
            required: true
        },
        
        created_at: {
            type: 'ref',
            columnType: 'datetime',
            columnName: 'created_at'
        },
        
        begin_date: {
            type: 'ref',
            columnType: 'datetime',
            columnName: 'begin_date'
        }, 
        
        expiry_date: {
            type: 'ref',
            columnType: 'datetime',
            columnName: 'expiry_date'
        }, 

        is_default: {
            type: 'boolean'
        },
    }
};
  
  