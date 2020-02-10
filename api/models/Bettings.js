/**
 * Bettings.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 't_betdetails',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true
    },
    bet_code: {
      type: 'string',
      unique: true,
      required: true
    },
    bet_amount: {
      type: 'number',
      required: true,
    },
    user_id: {
      type: 'number',
      required: true
    },
    betplace_id: {
      type: 'number',
      required: true,
    },
    effective_bet_amount: {
      type: 'number',
      defaultsTo: 0,
      allowNull: true
    },
    shoehand_id: {
      type: 'number',
      required: true
    },
    gameset_id: {
      type: 'number',
    },
    table_id: {
      type: 'number',
      defaultsTo: 0
    },
    balance: {
      type: 'number',
      defaultsTo: 0
    },
    win_loss: {
      type: 'number',
      allowNull: true
    },
    result_id: {
      type: 'number',
      allowNull: true
    },
    resultlist_id: {
      type: 'number',
      allowNull: true
    },
    super_six: {
      type: 'number'
    },
    is_sidebet: {
      type: 'number'
    },
    bet_date: {
      type: 'ref',
      columnType: 'datetime',
      columnName: 'bet_date'
    }
  },

};
