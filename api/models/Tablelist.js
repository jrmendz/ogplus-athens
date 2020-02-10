module.exports = {
	tableName: "c_tablelist",
	attributes: {
		id: {
			type: 'number',
			autoIncrement: true
		},
		gamename: {
			type: 'string',
			required: true,
		},
		tablenumber: {
			type: 'string',
			unique: true,
			required: true
		},
		cn_video: {
			type: 'string',
			allowNull: true
		},
		sea_video: {
			type: 'string',
			allowNull: true
		},
		nea_video: {
			type: 'string',
			allowNull: true
		},
		max_time: {
			type: 'number',
			defaultsTo: 20
		},
		// game_code: {
		// 	type: 'string',
		// 	required: true
		// },
		game_code_id: {
			model: 'Gamecodes'
		},
		meta: {
			type: 'string',
			required: true
		},
		subcode: {
			type: 'string',
			allowNull: true
		},
		disabled: {
			type: 'number'
		},
		studio: {
			type: 'string',
			allowNull: true
		}
	}
}
