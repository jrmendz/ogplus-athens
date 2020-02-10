/**
 * CameraAngle.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 't_camera_angle',
    
    attributes: {
        id: {
        type: 'number',
        unique: true,
        autoIncrement: true
        },

        tables: {
        type: 'string',
        required: true
        },

        camera_angle: {
        type: 'string',
        required: true
        },

        created_at: {
        type: 'ref',
        columnType: 'datetime',
        columnName: 'created_at'
        }        
    }
};
  
  