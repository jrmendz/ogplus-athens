/**
 * Announcements.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    tableName: 't_announcement',
    attributes: {
      id: {
        type: 'number',
        autoIncrement: true
      },
      Name: {
        type: 'string'
      },
      StartDate: {
          type: 'ref', 
          columnType: 'datetime', 
          columnName: 'StartDate'
      },
      EndDate: {
        type: 'ref', 
        columnType: 'datetime', 
        columnName: 'EndDate'
      },
      // UpdatedBy: {
      //   type: 'number',
      //   required: true
      // },
      TableNumber: {
        type: 'string'
      },
      Announcement_en: {
        type: 'string'
      },
      Announcement_cn: {
        type: 'string'
      },
      Announcement_jp: {
        type: 'string'
      },
      Announcement_kr: {
        type: 'string'
      },
      Announcement_th: {
        type: 'string'
      },
      Announcement_ind: {
        type: 'string'
      },
      Announcement_vt: {
        type: 'string'
      }
    }      
  };