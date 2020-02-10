/**
 * Chat.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 't_chat',
  primaryKey: 'id',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      unique: true
    },

    username: {
      type: 'string',
      allowNull: true
    },

    table_number: {
      type: 'string',
      allowNull: true
    },

    message: {
      type: 'string',
      allowNull: true
    },

    cancelled: {
      type : "number",
      defaultsTo : 0
    },

    created_at: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'created_at'
    },

    updated_at: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'updated_at'
    }
  }
};


