module.exports = {
  tableName: 't_logs',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true
    },
    log_info: {
      type: 'string'
    },
    action: {
      type: 'string'
    },
    log_type: {
      type: 'string'
    },
    created_at: {
      type: 'string',
      allowNull: true
    }
  }
};
