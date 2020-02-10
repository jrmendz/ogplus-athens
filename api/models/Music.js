/**
 * Music.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 't_music_settings',
    
    attributes: {
        id: {
        type: 'number',
        unique: true,
        autoIncrement: true
        },

        music_url: {
        type: 'string'
        },

        location_id: {
        type: 'number',
        unique: true,
        required: true
        },

        game_code_id: {
        type: 'number',
        unique: true,
        required: true
        }
    }
};
  
  