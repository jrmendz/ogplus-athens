module.exports = {
    tableName: 't_‌internationalization',
    primaryKey: 'id',
    attributes: {
      id: {
        type: 'number',
        autoIncrement: true,
      },
  
      prefix: {
        type: 'string',
        allowNull: true
      },
  
      en : {
        type: 'string',
        allowNull: true
      },

      cn : {
        type: 'string',
        allowNull: true
      },

      ja : {
        type: 'string',
        allowNull: true
      },

      ko : {
        type: 'string',
        allowNull: true
      },

      indo : {
        type: 'string',
        allowNull: true
      },
  
      th : {
        type: 'string',
        allowNull: true
      },

      vi : {
        type: 'string',
        allowNull: true
      },
      
      created_at: {
        type: 'string',
        allowNull: true
      }
    }
  };
  