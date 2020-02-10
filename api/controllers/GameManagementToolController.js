module.exports = {

  broadcastTable: async (req, res) => {
    let params = req.body;
    await socketHelper('blast', {event: 'table_status_' + params.state + '_' + params.tablenumber, values: {message: params.tablenumber + ' will be '+ params.state +'.'}});
    console.log(params.state)
    const ws = new WebSocket(sails.config.services.gameapp + '/athensGMT')
    ws.onopen = () => {
      ws.send(JSON.stringify({
        command: params.state + '_table',
        tableNumber: params.tablenumber
      }))
    }
    return res.json({ status: 200, msg: 'Broadcasted table_status'});
  },

  broadcastAnnouncements: async (req, res) => {
    let params = req.body;
    console.log(params)
    await socketHelper('blast', {event: 'announcement_' + params.tablenumber, values: {announcement: params.announcements}});
    return res.json({ status: 200, msg: 'Broadcasted table_status'});
  },

  broadcastPlayer: async (req, res) => {
    // TODO
  },

  // /game_management/create_update_banner
  //creating and updating banner
  createupdategmt: async (req, res) => {
    let params = req.body;

    //validator
    // parameters banner_image -"required", position -"optional", id -"optional", view -"required"
    if (_.isUndefined(params))
      return res.badRequest({status: 400, err: "Invalid Credentials."})
    if (_.isUndefined(params.banner_image))
      return res.badRequest({status: 400, err: "Image cannot be empty."})
    if (!_.includes(['DESKTOP', 'MOBILE'], _.toUpper(params.view)))
      return res.badRequest({status: 400, err: "Invalid Parameter: [view] - select desktop/mobile"})

    const tasks = {
      process: async (next) => {
        let position = params.position || 0
        let id = params.id || 0
        let begin_date = params.begin_date ? moment(params.begin_date).format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DDTHH:mm:ss.SSS')
        let redirect_url = params.redirect_url || ''
        let expiry_date = params.expiry_date ? moment(params.expiry_date).format('YYYY-MM-DD HH:mm:ss') : '9999-12-31 00:00:00'
        let is_default = params.is_default || false

        if (_.isNull(params.position) || _.isUndefined(params.position)) {
          let bannerInfo = await Banners.findOne({ id: id }).intercept((err) => { return next(err); })

          if (bannerInfo) {
            position = bannerInfo.position
          } else {
            position = await Banners.count().intercept((err) => {return next(err)})
            position++
          }
        }

        if (_.lowerCase(is_default) === 'true')
          await Banners.update({}).set({ is_default: false }).intercept((err) => { return next(err) })

        await Banners.findOrCreate({ id: id },
          {
            banner_image: params.banner_image,
            position: position,
            created_at: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            view: _.toLower(params.view),
            begin_date: begin_date,
            redirect_url: redirect_url,
            expiry_date: expiry_date,
            is_default: is_default
          }).exec(async function (err, result, created) {
          if (err)
            return next(400, err)
          if(created) { return next(null, result)
          } else {

            let updatebanner = await Banners.update({ id: id },
              {
                banner_image: params.banner_image,
                position: position,
                created_at: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                view: _.toLower(params.view),
                begin_date: begin_date,
                redirect_url: redirect_url,
                expiry_date: expiry_date,
                is_default: is_default
              }).fetch().intercept((err) => { return next(err) })
            return next(null, updatebanner)
          }
        })
      },

      broadcast: ["process", async (result, next) => {
        let blastresult = await Banners.find().populateAll().intercept((err) => { return next(err) })
        await socketHelper('blast', {event: 'bannerEvent_', values: blastresult})
        return next()
      }]
    }
    async.auto(tasks, (err, result) => {
      if (err) return res.json({ status: 401, msg: err, data: '' })
      return res.json({ status: 200, message: 'Banner updated succesfully.', data: result.process})
    })
  },

  // /game_management/create_update_languages
  createupdatelanguages: async (req, res) => {
    let params = req.body;

    //validator
    // parameters: name -"required", code -"optional", view -"required"
    if (_.isUndefined(params.name))
      return res.badRequest({status: 400, err: "Name cannot be empty."})
    if (_.isUndefined(params.code))
      return res.badRequest({status: 400, err: "Code cannot be empty."})
    if (!_.includes(['DESKTOP', 'MOBILE'], _.toUpper(params.view)))
      return res.badRequest({status: 400, err: "Invalid Parameter: [view] - select desktop/mobile"})

    const tasks = {
      process: async (next) => {

        await ListLanguages.findOrCreate({ code: params.code, view: params.view },
          {
            name: _.toLower(params.name),
            code: _.toLower(params.code),
            created_at: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
            view: _.toLower(params.view)
          }).exec(async function (err, result, created) {
          if (err)
            return next(400, err)
          if(created) { return next(null, result)
          } else {
            let updatelanguage = await ListLanguages.update({ code: params.code, view: params.view },
              {
                name: params.name,
                code: params.code,
                created_at: moment().format('YYYY-MM-DDTHH:mm:ss.SSS'),
                view: _.toLower(params.view)
              }).fetch().intercept((err) => { return next(err) })
            return next(null, updatelanguage[0])
          }
        })
      },

      broadcast: ["process", async (result, next) => {
        let blastresult = await ListLanguages.find().populateAll().intercept((err) => { return next(err) })
        await socketHelper('blast', {event: 'languageEvent_', values: blastresult})
        return next()
      }]
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({ status: 401, msg: err, data: '' })
      return res.json({ status: 200, message: 'Banner updated succesfully.', data: result.process})
    })
  },

  // /game_management/get_banners
  getbanners: async (req, res) => {
    let params = req.query
    //validator
    // parameters: view - "required"
    if (!_.includes(['DESKTOP', 'MOBILE'], _.toUpper(params.view) ))
      return res.badRequest({status: 400, err: "Invalid Parameter: [view] - select desktop/mobile"})

    const tasks = {
      process: async (next) => {

        Banners.find({view: params.view}).exec((err, data) => {
          if (err) { return next(err) }
          return next(null, data)
        })
      }
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Get all Banners', data: result.process})
    })
  },

  // /game_management/get_games
  getgames: async (req, res) => {
    const tasks = {
      process: async (next) => {

      const QUERY = "select distinct t.id, t.gamename as `game_name`, c.gamecode as `game_code`, t.created_at from c_tablelist t inner join c_gamecodes c on c.id = t.game_code_id group by t.gamename ORDER BY t.id ASC";

      sails.sendNativeQuery(QUERY, (err, result) => {
          if (err) return next(err);
          return next(err, result.rows)
        })
      }
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Get all Games List', data: result.process})
    })
  },

  // /game_management/get_music
  getmusicpergamecode: async (req, res) => {
    let params = req.query;

    // parameters:  game_code - "required"
    if (_.isUndefined(params.game_code))
      return res.badRequest({status: 400, err: "game_code cannot be empty."})

    const tasks = {
      process: async (next) => {

        const QUERY = "select a.id, a.music_url, b.language_code as `location`, c.gamecode as  `game_code` from t_music_settings a inner join c_locationlist b on b.id = a.location_id inner join c_gamecodes c on c.id = a.game_code_id where c.gamecode = $1";

        sails.sendNativeQuery(QUERY, [params.game_code], (err, result) => {
          if (err) return next(err);
          return next(err, result.rows)
        })
      }
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Get music list by game', data: result.process})
    })
  },

  // /game_management/get_languages
  getlanguages: async (req, res) => {
    let params = req.query
    // validator
    // parameters:  view - "required"
    if (!_.includes(['DESKTOP', 'MOBILE'], _.toUpper(params.view) ))
      return res.badRequest({status: 400, err: "Invalid Parameter: [view] - select desktop/mobile"})

    const tasks = {
      process: async (next) => {
        ListLanguages.find({view: params.view}).exec((err, data) => {
          if (err) { return next(err) }
          return next(null, data)
        })
      }
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Get all Languages', data: result.process})
    })
  },

  //  /game_management/get_banners_ogmx
  getbannersOGMX: async (req, res) => {

    let params = req.query;
    // This is to be use for og+ and manbetx that requires token
    // validator view - "required"
    if (_.isUndefined(params.token))
      return res.badRequest("Invalid Credentials.")
    if (!_.includes(['DESKTOP', 'MOBILE'], _.toUpper(params.view) ))
      return res.badRequest({status: 400, err: "Invalid Parameter: [view] - select desktop/mobile"})

    const tasks = {

      verifyToken: async function (next) {
        await JwtService.valid(params.token)
          .then((token) => { return next(null, token)
          }).catch((err) => {
            return next(err)
          })
      },

      process: ["verifyToken", async (result, next) => {

        Banners.find({view: params.view}).exec((err, data) => {
          if (err) { return next(err) }
          return next(null, data)
        })
      }]
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Get all Banners', data: result.process})
    })
  },

  // /game_management/delete_banner
  deletingbanner: async (req, res) => {
    let params = req.query;

    //validator
    // parameters id -"required"
    if (_.isUndefined(params.id))
      return res.badRequest("Banner id is required.")

    const tasks = {
      process: async (next) => {
        Banners.destroy({id: params.id}).exec(function (err, data){
          if (err) { return next(err) }
          return next(null, data)
        })
      }
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Banner has been deleted, if there were any.', data: result.process})
    })
  },

  // /game_management/update_table_video
  updatetablevideo: async (req, res) => {
    let params = req.body;

    //validator
    // parameters TableNumber -"required", Video -"required", Location -"required"
    if (_.isUndefined(params.tablenumber))
      return res.badRequest({status: 400, err: "Table cannot be empty."})
    if (_.isUndefined(params.video))
      return res.badRequest({status: 400, err: "Video cannot be empty."})
    if (!_.includes(['CN', 'SEA', 'NEA'], params.location.toUpperCase()))
      return res.badRequest({status: 400, err: "Invalid Parameter: [Languages] - It should be `CN`, `SEA`,  `NEA`"})

    const tasks = {
      process: async (next) => {
        let location = params.location.toUpperCase()
        let tempVideo = []
        let videoArray = await Tablelist.findOne({tablenumber: params.tablenumber}).intercept((err) => {return next(err)})

        switch (location) {

          case "CN":

            _.map(JSON.parse(videoArray.cn_video), (value, key) => {
              if (key === 0) {
                tempVideo.push(params.video)
              } else {
                tempVideo.push(value)
              }
            })

            await Tablelist.update({ tablenumber: params.tablenumber },
              {
                cn_video: JSON.stringify(tempVideo)
              }).exec((err, result) => {
              if (err) {return next(err)}
              return next(null, result)
            })
            break

          case "SEA":

            _.map(JSON.parse(videoArray.sea_video), (value, key) => {
              if (key === 0) {
                tempVideo.push(params.video)
              } else {
                tempVideo.push(value)
              }
            })

            await Tablelist.update({ tablenumber: params.tablenumber },
              {
                sea_video: JSON.stringify(tempVideo)
              }).exec((err, result) => {
              if (err) {return next(err)}
              return next(null, result)
            })
            break

          case "NEA":

            _.map(JSON.parse(videoArray.nea_video), (value, key) => {
              if (key === 0) {
                tempVideo.push(params.video)
              } else {
                tempVideo.push(value)
              }
            })

            await Tablelist.update({ tablenumber: params.tablenumber },
              {
                nea_video: JSON.stringify(tempVideo)
              }).exec((err, result) => {
              if (err) {return next(err)}
              return next(null, result)
            })
            break
        }
      },

      broadcast: ["process", async (results, next) => {
        // servers["GAME_APP_SERVER"].send(JSON.stringify({ action: "", data: {}}));
        //TO.DO Alvin - for game app broadcast
        let blastresult = await Tablelist
          .find({ select: ['meta'] })
          .populateAll()
          .intercept((err) => {
            return next(err)
          });

        sails.log('blastresult', blastresult)
        return next()
      }]
    }

    async.auto(tasks, (err, results) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Update video in table list successfully'})
    })
  },

  // /game_management/create_update_music
  createupdatemusic: async (req, res) => {
    let params = req.body;

    //validator
    // parameters: music -"required", location -"required", id - "optional", game_code - "required"
    if (_.isNull(params.music))
      return res.badRequest({status: 400, err: "Music URL cannot be empty."})
    if (_.isNull(params.location))
      return res.badRequest({status: 400, err: "Invalid Parameter: [Location] - It should be `CN`, `SEA`,  `NEA`"})
    if (_.isNull(params.game_code))
      return res.badRequest({status: 400, err: "Code cannot be empty."})

    const tasks = {
      process: async (next) => {
        let id = params.id || 0

        let location = await Locations.findOne({ language_code: params.location }).intercept((err) => { return next(err) })
        let code = await Gamecodes.findOne({ gamecode: params.game_code }).intercept((err) => { return next(err) })

        if (!code || !location)
          return next("Invalid Parameter: Location/Code", null)

        await Music.findOrCreate({ id: id },
          {
            music_url: params.music,
            location_id: location.id,
            game_code_id: code.id
          }).exec(async function (err, result, created) {
          if (err)
            return next(400, err)
          if(created) {
            return next(null, result)
          } else {
            let updatemusic = await Music.update({ id: id },
              {
                music_url: params.music,
                location_id: location.id,
                game_code_id: code.id
              }).fetch().intercept((err) => { return next(err) })

            return next(null, updatemusic[0])
          }
        })
      },

      broadcast: ["process", async (result, next) => {

        let QUERY = "select a.id, a.music_url, b.language_code as `location`, c.gamecode as  `game_code` from t_music_settings a inner join c_locationlist b on b.id = a.location_id inner join c_gamecodes c on c.id = a.game_code_id";
        let musicresult = await Music.getDatastore().sendNativeQuery(QUERY, []).catch((err) => { return next(err) })
        await socketHelper('blast', {event: 'MusicEvent_', values: musicresult.rows});
        return next()
      }],

      finalresult: ["process", async (result, next) => {
        const QUERY = "select a.id, a.music_url, b.language_code as `location`, c.gamecode as  `game_code` from t_music_settings a inner join c_locationlist b on b.id = a.location_id inner join c_gamecodes c on c.id = a.game_code_id where a.id = $1";

        sails.sendNativeQuery(QUERY, [result.process.id], (err, result) => {
          if (err) return next(err);
          return next(err, result.rows)
        })
      }]
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Create and update Music setting successfully', data: result.finalresult})
    })
  },

  // /GameManagement/GetMusicDetails
  getmusicdetails: async (req, res) => {
    const tasks = {
      process: async (next) => {
        Music.find().exec((err, data) => {
          if (err) {
            return next(err)
          }
          return next(null, data)
        })
      }
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Get all Music Details', data: result.process})
    })
  },

  // /game_management/video_details_per_table
  videodetailspertable: async (req, res) => {
    const tasks = {
      process: async (next) => {

        let data = await Tablelist.find({
          select: ['tablenumber', 'cn_video', 'sea_video', 'nea_video']
        }).intercept((err) => { return next(err) })

        return next(data)
      }
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Get all Video Details per table', data: result.process})
    })
  },

  // /game_management/update_video_multi_table
  updatevideobytable: async (req, res) => {

    let params = req.body

    // parameters tablenumber -"required", cn_video -"optional", sea_video -"optional", nea_video -"optional"
    if (_.isUndefined(params.tablenumber))
      return res.badRequest({status: 400, err: "Table cannot be empty."})
    if (_.isUndefined(params.cn_video) && _.isUndefined(params.sea_video) && _.isUndefined(params.nea_video))
      return res.badRequest({status: 400, err: "Include either cn_video/sea_video/nea_video"})

    const tasks = {
      process: async (next) => {
        let tableNumber = JSON.parse(params.tablenumber)
        let updatedresult = {}

        async.eachSeries(tableNumber, async (table, next) => {

          let data = await Tablelist.findOne({
            select: ['tablenumber', 'cn_video', 'sea_video', 'nea_video'],
            where: {tablenumber: table}
          }).intercept((err) => { return next(err) })

          let cn_video = _.isUndefined(params.cn_video) ?  JSON.parse(data.cn_video):  JSON.parse(params.cn_video)
          let sea_video = _.isUndefined(params.sea_video) ?  JSON.parse(data.sea_video) : JSON.parse(params.sea_video)
          let nea_video = _.isUndefined(params.nea_video) ?  JSON.parse(data.nea_video) : JSON.parse(params.nea_video)

          let updatevideo = await Tablelist.update({ tablenumber: params.tablenumber },
            {
              cn_video: JSON.stringify(cn_video),
              sea_video: JSON.stringify(sea_video),
              nea_video : JSON.stringify(nea_video)
            }).fetch().intercept((err) => { return next(err) })

          updatedresult.push(updatevideo)
        })
        return next(null, updatedresult)
      }
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Get all Video Details per table', data: _.pick(result.process[0], ['tablenumber', 'cn_video', 'sea_video', 'nea_video'])})
    })
  },

  // /game_management/update_video_multi_table
  addvideototables: async (req, res) => {

    let params = req.body

    // parameters tablenumber -"required", cn_video -"optional", sea_video -"optional", nea_video -"optional"
    if (_.isUndefined(params.tables))
      return res.badRequest({status: 400, err: "Table cannot be empty."})
    if (_.isUndefined(params.cn_video) && _.isUndefined(params.sea_video) && _.isUndefined(params.nea_video))
      return res.badRequest({status: 400, err: "Include either cn_video/sea_video/nea_video"})

    const tasks = {
      process: async (next) => {

        async.eachSeries(params.tables, async (table, next) => {
          let cn = []
          let data = await Tablelist.findOne({
            select: ['tablenumber', 'cn_video', 'sea_video', 'nea_video'],
            where: {tablenumber: table}
          }).intercept((err) => { return next(err) })

          // let cn_video = _.isUndefined(params.cn_video) ?  JSON.parse(data.cn_video):  JSON.parse(data.cn_video)
          // let sea_video = _.isUndefined(params.sea_video) ?  JSON.parse(data.sea_video) : JSON.parse(params.sea_video)
          // let nea_video = _.isUndefined(params.nea_video) ?  JSON.parse(data.nea_video) : JSON.parse(params.nea_video)
          // sails.log('xxx**********', JSON.parse(data.cn_video))
          // let re = JSON.parse(data.cn_video)
          // cn.push(re)
          // if (JSON.parse(data.cn_video))
          //   cn.push(JSON.parse(data.cn_video))

          // _.map(JSON.parse(data.cn_video), (value, key) => {
          //   sails.log('***********', value)
          //   cn.push(value)
          // })

          cn.push(JSON.parse(data.cn_video))

          if (params.cn_video)
           cn.push(params.cn_video.toArray())

          sails.log('cn *****', JSON.stringify(cn))
          // let updatevideo = await Tablelist.update({ tablenumber: table },
          //   {
          //     cn_video: JSON.stringify(cn_video),
          //     sea_video: JSON.stringify(sea_video),
          //     nea_video : JSON.stringify(nea_video)
          //   }).fetch().intercept((err) => { return next(err) })

          // return next(null, updatevideo)
          return next()
        }, next)
      }
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      // return res.json({status: 200, message: 'Get all Video Details per table', data: _.pick(result.process[0], ['tablenumber', 'cn_video', 'sea_video', 'nea_video'])})
      return res.json({status: 200, message: 'Get all Video Details per table' })
    })
  },

  getmusicdetailsOGMX: async (req, res) => {
    let params = req.query;
    // This is to be use for og+ and manbetx that requires token
    // validator
    if (_.isUndefined(params.token))
      return res.badRequest("Invalid Credentials.");

    const tasks = {

      verifyToken: async function (next) {
        await JwtService.valid(params.token)
          .then((token) => { return next(null, token)
          }).catch((err) => {
            return next(err)
          })
      },

      process: ["verifyToken", async (result, next) => {
        Music.find().exec((err, data) => {
          if (err) {
            return next(err)
          }
          return next(null, data)
        })
      }]
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Get all Banners', data: result.process})
    })
  },

  // /game_management/language
  setlanguagedefault: async (req, res) => {
    let params = req.body;

    //validator
    // parameters: code -"required", view -"required"
    if (_.isUndefined(params.code))
      return res.badRequest({status: 400, err: "Code cannot be empty."})
    if (!_.includes(['DESKTOP', 'MOBILE'], _.toUpper(params.view)))
      return res.badRequest({status: 400, err: "Invalid Parameter: [view] - select desktop/mobile"})

    const tasks = {
      process: async (next) => {
        let validate = await ListLanguages.find({ code: params.code, view: params.view }).intercept((err) => { return next(err) })

        if (validate) {
          await ListLanguages.update({ view: params.view }).set({ is_default: false }).intercept((err) => { return next(err) })
            .then( async (res) => {
              let update = await ListLanguages.update({ code: params.code, view: params.view }, { is_default: true }).fetch().intercept((err) => { return next(err) })
              return next(null, update[0])
            }, (err) => {
              return next(err)
            })
        } else {
          return next('Invalid Parameter, code not found', null)
        }
      }
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Default language has been set.', data: result.process})
    })
  },

  // /game_management/delete_music
  deletingmusic: async (req, res) => {
    let params = req.query;

    //validator
    // parameters id -"required"
    if (_.isUndefined(params.id))
      return res.badRequest("Music id is required.")

    const tasks = {
      process: async (next) => {
        Music.destroy({id: params.id}).exec(function (err, data){
          if (err) { return next(err) }
          return next(null, data)
        })
      }
      // finalresult: ["process", async (result, next) => {
      //   const QUERY = "select a.id, a.music_url, b.language_code as `location`, c.gamecode as  `game_code` from t_music_settings a inner join c_locationlist b on b.id = a.location_id inner join c_gamecodes c on c.id = a.game_code_id";

      //   sails.sendNativeQuery(QUERY, (err, result) => {
      //     if (err) return next(err);
      //     return next(err, result.rows)
      //   })
      // }]
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Music has been deleted succesfully.', data: result.process})
    })
  },

  // /game_management/camera_angle
  updatecameraangle: async (req, res) => {
    let params = req.body

    // parameters: tables -"required", camera_angle -"required" (It should be 0: Upper, 1: Lower")
    if (_.isUndefined(params.tables))
      return res.badRequest({status: 400, err: "Table cannot be empty."})
    if (!_.includes([0, 1], _.parseInt(params.camera_angle)))
      return res.badRequest({status: 400, err: "Invalid Parameter: [camera_angle] - It should be 0: Upper, 1: Lower"})

    const tasks = {
      process: async (next) => {
        async.eachSeries(params.tables, async (table, next) => {

          let list = await Tablelist.findOne({tablenumber: table}).intercept((err) => {return next(err)})
          let meta = _.assign(JSON.parse(list.meta), {camera_angle: params.camera_angle})

          await Tablelist.update({ tablenumber: table })
            .set({
              meta: JSON.stringify(meta)
            }).intercept((err) => { return next(err) })

          return next()
        }, next)
      },

      broadcast: ["process", async (results, next) => {
        let blast = await Tablelist.find().populateAll().intercept((err) => { return next(err) })
        //TO.DO Alvin
        // await socketHelper('blast', {event: 'cameraAngleEvent_', values: blast})
        return next()
      }]
    }

    async.auto(tasks, (err, result) => {
      if (err) return res.json({status: 401, message: err})
      return res.json({status: 200, message: 'Camera angle has been set.'})
    })
  }
};
