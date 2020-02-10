module.exports = {
    tableName: 't_follow_streamers',
    attributes: {
      id: {
        type: 'number',
        unique: true,
        autoIncrement: true
      },
      dealerscode: {
        type: 'number',
        unique: true,
        required: true,
      },
      user_id: {
        type: 'number'
      },
      created: {
        type: 'ref',
        columnType: 'date',
        defaultsTo: '1900-01-01'
      }      
    }
  }
  