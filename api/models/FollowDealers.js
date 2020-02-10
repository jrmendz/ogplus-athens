module.exports = {
  tableName: 't_follow_dealers',
  attributes: {
    id: {
      type: 'number',
      unique: true,
      autoIncrement: true
    },
    dealerscode: {
      type: 'number',
      required: true
    },
    //Users Reference
    user_id: {
      description: 'this attribute is to relate to other model, "Users.js"',
      model: 'Users'
    },
  }
}
