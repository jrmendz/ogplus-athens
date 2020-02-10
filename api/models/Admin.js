module.exports = {
    tableName: 't_adminuser',
    primaryKey: 'id',
    attributes: {
      id: {
        type: 'number',
        autoIncrement: true,
      },
      username: {
        type: 'string',
        isNotEmptyString: true,
        columnName: 'username',
        required: true,
        maxLength: 50,
        unique: true
      },
      password: {
        type: 'string',
        isNotEmptyString: true,
        required: true
      },
      isactive: {
        type: 'boolean'        
      },
      created: {
        type: 'ref', 
        columnType: 'datetime', 
        columnName: 'created'
      }
      
           
    //   nickname: {
    //     type: 'string',
    //     required: true,
    //     unique: true,
    //     custom: function (value) {
    //       return value.trim() && value.trim() !== '' ? true: false
    //     }
    //   },
    },
    beforeCreate: function(values, next){
      bcrypt.hash(values.password, 10, function(err, hash) {
        if (err) return next(err);
        values.password = hash
        next();
      });
    } 
  }
  