/**
 * DealerGift.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 't_dealer_gift',
  primaryKey: 'id',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      unique: true
    },

    user_id: {
      type: 'number',
      allowNull: true
    },

    table_id: {
      type: 'number',
      allowNull: true
    },

    dealer_id: {
      type: 'number',
      allowNull: true
    },

    gift_name: {
      type : 'string',
      defaultsTo : ''
    },

    gift_price: {
      type : 'number',
      columnType: 'float',
      defaultsTo : 0
    },

    created_at: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'created_at'
    }
  }
};

