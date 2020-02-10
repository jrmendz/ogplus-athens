/**
 * StreamerGift.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 't_streamers_gift',
  attributes: {
    id: {
      type: 'number',
      unique: true,
      autoIncrement: true
    },
    user_id: {
      type: 'number',
      required: true
    },
    streamer_id: {
      type: 'number',
      required: true
    },
    gift_name: {
      type: 'string'
    },
    gift_price: {
      type: 'number'
    },
    created_at: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'created_at'
    },
    CANCELLED: {
      type: 'number',
      defaultsTo: 0
    }
  },

};

