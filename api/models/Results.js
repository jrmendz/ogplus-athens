/**
 * Results.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  tableName: 't_results',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true
    },
    // resultlist_id: {
    //   type: 'number',
    //   required: true
    // },
    // shoehand_id: {
    //   type: 'number',
    //   required: true
    // },
    resultlist_id: {
      description: 'this attribute is to relate to other model, "ResultList.js"',
      model: 'ResultList',
      required: true
    },
    shoehand_id: {
      description: 'this attribute is to relate to other model, "Shoehand.js"',
      model: 'Shoehand',
      required: true
    },
    table_id: {
      description: 'this attribute is to relate to other model, "Tables.js"',
      model:'Tablelist'
    },
    shoe_date: {
      type: 'string',
      required: true
    }
  },

};

