module.exports = {
  tableName: 't_user',
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
      maxLength: 30,
      unique: true
    },
    password: {
      type: 'string',
      isNotEmptyString: true,
      required: true
    },
    // email_address: {
    // 	type: 'string',
    // 	unique: true,
    //   required: true,
    // 	isEmail: true
    // },
    nickname: {
      type: 'string',
      required: true,
      unique: true,
      custom: function (value) {
        return value.trim() && value.trim() !== '' ? true: false
      }
    },
    full_name: {
      type: 'string'
    },
    balance: {
      type: 'number',
      defaultsTo: 0
    },
    imgname: {
      type: 'string',
      // defaultsTo: 'https://og-333.s3-ap-southeast-1.amazonaws.com/og/panda/assets/images/avatar/avtr_13.png',
      defaultsTo: 'http://og-333.s3.amazonaws.com/panda/assets/avatar/avtr_01.png',
      columnName: 'avatar_pc'
    },
    imgname_mobile: {
      type: 'string',
      defaultsTo: '/static/avatar/avatar1a.png',
      columnName: 'avatar_mobile'
    },
    avatar: {
      type: 'number',
      defaultsTo: 0
    },
    wins: {
      type: 'number',
      defaultsTo: 0
    },
    win_amount: {
      type: 'number',
      defaultsTo: 0
    },
    followers: {
      type: 'number',
      defaultsTo: 0
    },
    is_trial: {
      type: 'number', //boolean but 0 = false , 1 = true
      defaultsTo: 0
    },
    is_sidebet: {
      type: 'number', //boolean but 0 = false , 1 = true
      defaultsTo: 0
    },
    logged: {
      type: 'number', //boolean but 0 = false , 1 = true
      defaultsTo: 0
    },
    table_location: {
      type: 'string',
      defaultsTo: 'Lobby'
    },
    user_settings: {
      type: 'json',
      required: false
    },
    disabled: {
      type: 'number',
      defaultsTo: 0
    },
    winningstreak: {
      type: 'number',
      allowNull: true,
      defaultsTo: 0
    },
    currency: {
      type: 'string',
      defaultsTo: 'CNY',
      allowNull: true
    },
    min_bet_limit: {
      type: 'number',
      allowNull: true
    },
    max_bet_limit: {
      type: 'number',
      allowNull: true
    },

    //Follower Reference
    followedUsers: {
      description: 'this attribute is to relate to other model, "FollowUsers.js"',
      collection: 'FollowUsers',
      via: 'follow_user_id'
    },
    followedDealers: {
      description: 'this attribute is to relate to other model, "FollowDealers.js"',
      collection: 'FollowDealers',
      via: 'user_id'
    }
  },
  beforeCreate: function(values, next){
    bcrypt.hash(values.password, 10, function(err, hash) {
      if (err) return next(err);
      values.password = hash
      next();
    });
  }
}
