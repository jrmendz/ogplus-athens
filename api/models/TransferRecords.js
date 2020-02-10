module.exports = {
  tableName: 't_transfer_records',
  primaryKey: 'id',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
    },

    transferId: {
      type: 'string',
      allowNull: true
    },

    username : {
      type: 'string',
      allowNull: true
    },

    amount: {
      type: 'number',
      allowNull : true
    },

    actions: {
      type: 'string',
      allowNull: true
    },

    currency: {
      type: 'string',
      allowNull: true
    },

    balance: {
      type: 'number',
      allowNull: true
    },

    created_at: {
      type: 'string',
      allowNull: true
    }
  }
};
