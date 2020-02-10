module.exports = {
	tableName: 't_follow_users',
	attributes: {
		id: {
			type: 'number',
			autoIncrement: true
		},
		user_id: {
			type: 'number',
			required: true
		},
		follow_user_id: {
			description: 'this attribute is to relate to other model, "Users.js"',
			model:'Users'
		}
	}
}
