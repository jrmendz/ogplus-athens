/**
 * Streamer.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 't_streamers',
  attributes: {
    id: {
      type: 'number',
      unique: true,
      autoIncrement: true
    },
    dealerscode: {
      type: 'number',
      unique: true,
      required: true
    },
    languages: {
      type: 'string',
      allowNull: true
    },
    status: {
      type: 'boolean'
    },
    CANCELLED: {
      type: 'number',
      allowNull: true,
      defaultsTo: 0
    },
    likes: {
      type: 'number'
    },
    // imagestreamer: {
    //   type: 'string'
    // },
    table_location: {
      type: 'string'
    }
    // dealer: {
    //   model: 'Dealer'      
    // },
    // streamergift: {
    //   model: 'StreamerGift'      
    // }
  }
};

