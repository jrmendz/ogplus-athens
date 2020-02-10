/**
 * ChatBlockWords.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 't_chat_block_words',
  primaryKey: 'id',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      unique: true
    },

    words: {
      type: 'string',
      allowNull: true
    }
  }

};

