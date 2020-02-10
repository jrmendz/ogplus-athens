module.exports = { 
	tableName: 'c_gamecodes',
	attributes: {
		id: {
			type: 'number',
			autoIncrement: true
		},
		gamecode: {
			type: 'string',
			required: true
		}
	}
}