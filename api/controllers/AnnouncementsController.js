module.exports = {
    // /Announcement/AllAnnouncement
    // GetAllAnnouncements: async (req, res) => {

    //     let params = req.body
    //     let tablenumber = params.tablenumberid
    //     let todayDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSS')

    //     if(!tablenumber || tablenumber === undefined)
    //         tablenumber = 0

    //     const tasks = {
    //         getAnnouncements: async (next) => {
    //             Announcements.find({ TableNumberId: tablenumber, Name: params.name, StartDate: { '<': todayDate}, EndDate: { '>': todayDate} }).exec((err, data) => {
    //                 if (err) {return next(err)}
    //                 return next(null, data)
    //             })
    //         }
    //     }
    //     async.auto(tasks, (err, results) => {
	// 		if (err) return res.json({ status: 401, msg: err, data: '' })
	// 		return res.json({ status: 200, msg: 'Announcement Notification', data: results })
	// 	})
    // },

    // /Announcement/AllAnnouncement
    GetAllAnnouncements: async (req, res) => {
      const tasks = {
        getAnnouncements: async (next) => {
          Announcements.find().exec((err, data) => {
            if (err) {
              return next(err)
            }
            return next(null, data)
          })
        }
      }
      async.auto(tasks, (err, results) => {
        if (err) return res.json({status: 401, message: err})
        return res.json({status: 200, message: 'Announcements', data: results})
      })
    },

    /**
     *
     * @param req
     * @param res
     * @returns {Promise<*>}
     * @constructor
     * /Announcement/CreateAnnouncement
     */
    CreateAnnouncement: async (req, res) => {

        let params = req.body
        if (_.isUndefined(params.tablenumber)) return res.badRequest({err: "Invalid parameter: [Table Number]"});
        if (_.isUndefined(params.name)) return res.badRequest({err: "Invalid parameter: [Table Name]"});

        let tablenumber = params.tablenumber || params.tableNumber

        const tasks = {
            savingAnnouncement: async (next) => {
              await Announcements.findOrCreate(
                {
                  TableNumber: params.tablenumber
                },
                {
                 Name: params.name ? params.name : tablenumber + ' announcement',
                 TableNumber: params.tablenumber ? tablenumber : 'Lobby',
                 Announcement_en: params.announcement_en,
                 Announcement_cn: params.announcement_cn,
                 Announcement_jp: params.announcement_jp,
                 Announcement_kr: params.announcement_kr,
                 Announcement_th: params.announcement_th,
                 Announcement_ind: params.announcement_ind,
                 Announcement_vt: params.announcement_vt,
                 StartDate: params.startdate ? moment(params.startdate).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                 EndDate: params.enddate ? moment(params.enddate).format('YYYY-MM-DD HH:mm:ss') : '9999-12-31 00:00:00'
               }).exec(async function (err, announcement, created) {
                 if (err)
                    return next(400, err);
                 if (created) {
                   return next(null, announcement)
                 } else {
                   let updatedAnnouncement = await Announcements.update(
                     {
                       id: params.announcement_id
                     },
                     {
                       Name: params.name ? params.name : tablenumber + ' announcement',
                       TableNumber: params.tablenumber ? tablenumber : 'Lobby',
                       Announcement_en: params.announcement_en,
                       Announcement_cn: params.announcement_cn,
                       Announcement_jp: params.announcement_jp,
                       Announcement_kr: params.announcement_kr,
                       Announcement_th: params.announcement_th,
                       Announcement_ind: params.announcement_ind,
                       Announcement_vt: params.announcement_vt,
                       StartDate: params.startdate ? moment(params.startdate).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                       EndDate: params.enddate ? moment(params.enddate).format('YYYY-MM-DD HH:mm:ss') : '9999-12-31 00:00:00'
                     })
                     .fetch()
                     .intercept((err) => {
                       return next(err)
                     });

                    return next(null, updatedAnnouncement)
                 }
               })
            },

            broadcast: ["savingAnnouncement", async (result, next) => {
              let blastresult = await Announcements.find().populateAll().intercept((err) => { return next(err) })
              await socketHelper('blast', {event: 'announcementEvent_', values: blastresult})
              return next()
            }]
        }
        async.auto(tasks, async (err, results) => {
          if (err) return res.json({ status: 401, msg: err, data: '' })
          return res.json({ status: 201, message: 'Announcement has been created/updated.', data: results.savingAnnouncement})
        })
      },

    // /announcement/getAnnouncementsBy
    GetAnnouncementsBy: async (req, res) => {

        let params = req.isSocket ? req.body : req.query;
        let tablenumber = params.tablenumber
        let todayDate = moment().format()

        if(!tablenumber || _.isUndefined(tablenumber))
            tablenumber = 'Lobby'

        const tasks = {
            getAnnouncements: async (next) => {
                Announcements.find({TableNumber: tablenumber, StartDate: { '<': todayDate}, EndDate: { '>': todayDate}}).exec((err, data) => {
                    if (err) {return next(err)}
                    return next(null, data)
                })
            }
        }
        async.auto(tasks, (err, results) => {
          if (err) return res.json({ status: 401, message: err })
          return res.json({ status: 200, message: 'Announcements', data: results.getAnnouncements })
        })
      },
}
