/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {


  //  ╦ ╦╔═╗╔╗ ╔═╗╔═╗╔═╗╔═╗╔═╗
  //  ║║║║╣ ╠╩╗╠═╝╠═╣║ ╦║╣ ╚═╗
  //  ╚╩╝╚═╝╚═╝╩  ╩ ╩╚═╝╚═╝╚═╝

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    view: 'pages/homepage'
  },

  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


  //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
  //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
  //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝
  'POST /user/login': {
    cors: {
      allowOrigins: '*'
    },
    action: 'login',
    controller: 'AuthController',
  },

  'POST /user/logout': {
    cors: {
      allowOrigins: '*'
    },
    action: 'logout',
    controller: 'AuthController',
  },

  'POST /user/create': {
    cors: {
      allowOrigins: '*'
    },
    action: 'create',
    controller: 'UserController'
  },

  'PUT /user/update-information': {
    cors: {
      allowOrigins: '*'
    },
    action: 'update',
    controller: 'UserController'
  },

  'PUT /user/disable-user': {
    cors: {
      allowOrigins: '*'
    },
    action: 'disableuser',
    controller: 'UserController'
  },

  'POST /user/search': {
    cors: {
      allowOrigins: '*'
    },
    action: 'search',
    controller: 'UserController'
  },

  'POST /user/availability': {
    cors: {
      allowOrigins: '*'
    },
    action: 'availability',
    controller: 'UserController'
  },

  'GET /socket/join-room' : {
    cors: {
      allowOrigins: '*',
      header: 'Content-Type, Authorization'
    },
    controller: 'AuthController',
    action: 'joinSocket'
  },

  'GET /api/current-user-information' : {
    cors: {
      allowOrigins: '*',
      header: 'Content-Type, Authorization'
    },
    controller: 'UserController',
    action: 'getDetailsByToken'
  },

  'GET /user/online' : {
    cors: {
      allowOrigins: '*',
    },
    controller: 'UserController',
    action: 'getOnlineUser'
  },

  'POST /user/getBalanceTrans' : {
    cors: {
      allowOrigins: '*',
    },
    controller: 'UserController',
    action: 'getBalanceTrans'
  },


  'POST /user/currency' : {
    cors: {
      allowOrigins: '*',
    },
    controller: 'UserController',
    action: 'setCurrency'
  },

  'PUT /user/chipLimit' : {
    cors: {
      allowOrigins: '*',
    },
    controller: 'UserController',
    action: 'setChipLimits'
  },

  'GET /user/broadcastBalance' : {
    cors: {
      allowOrigins: '*',
    },
    controller: 'UserController',
    action: 'broadcastBalanceIChips'
  },



  // ################## BETTINGS #########################

  'GET /bettings/betplace/getById': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getBetPlaceById',
    controller: 'BettingsController'
  },
  'POST /bettings/transaction/confirm': {
    cors: {
      allowOrigins: '*'
    },
    action: 'confirm',
    controller: 'BettingsController'
  },
  'POST /bettings/transaction/getAllBetsPerGameSet': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getAllBetsPerGameSet',
    controller: 'BettingsController'
  },
  'POST /bettings/transaction/getPlayerPendingBets': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getPlayerPendingBets',
    controller: 'BettingsController'
  },

  'POST /bettings/gameSetInformation': {
    cors: {
      allowOrigins: '*'
    },
    action: 'gameSetInformation',
    controller: 'BettingsController'
  },

  'GET /bettings/GetAllGameByTable': {
    cors: {
      allowOrigins: '*'
    },
    action: 'GetAllGameByTable',
    controller: 'BettingsController'
  },

  'POST /bettings/betFlag':         { cors: { allowOrigins: '*' }, action: 'betFlagAction', controller: 'BettingsController' },
  'POST /bettings/lastBet':         { cors: { allowOrigins: '*' }, action: 'lastBetAction', controller: 'BettingsController' },
  'POST /bettings/lastBetOnTable':  { cors: { allowOrigins: '*' }, action: 'lastBetOnTableAction', controller: 'BettingsController' },
  'POST /bettings/rebetFlag':       { cors: { allowOrigins: '*' }, action: 'rebetFlagAction', controller: 'BettingsController' },
  'POST /bettings/rebet':           { cors: { allowOrigins: '*' }, action: 'rebetAction', controller: 'BettingsController' },
  // ################## TABLES ###########################

  'GET /tables': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getAllTables',
    controller: 'TablesController'
  },

  'POST /tables/enterTable': {
    cors: {
      allowOrigins: '*'
    },
    action: 'enterTable',
    controller: 'TablesController'
  },

  'POST /tables/players': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getPlayersInTables',
    controller: 'TablesController'
  },

  'POST /tables/sideBet': {
    cors: {
      allowOrigins: '*'
    },
    action: 'sideBet',
    controller: 'TablesController'
  },

  'POST /tables/exitTable': {
    cors: {
      allowOrigins: '*'
    },
    action: 'exitTable',
    controller: 'TablesController'
  },

  'POST /tables/tableData': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getTableData',
    controller: 'TablesController'
  },

  'POST /tables/updateOnGamePlayer': {
    cors: {
      allowOrigins: '*'
    },
    action: 'updateOnGamePlayer',
    controller: 'TablesController'
  },

  'POST /tables/getTableVideoURL': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getTableVideoURL',
    controller: 'TablesController'
  },
  'PUT /tables/information': {
    cors: {
      allowOrigins: '*'
    },
    action: 'updateTable',
    controller: 'TablesController'
  },
  'PUT /tables/event': {
    cors: {
      allowOrigins: '*'
    },
    action: 'tableEvent',
    controller: 'TablesController'
  },

  // #################### BET PLACE ######################
  'GET /betplace/': {
    cors: {
      allowOrigins: '*'
    },
    action: 'index',
    controller: 'BetPlaceController'
  },

  'POST /betplace/add': {
    cors: {
      allowOrigins: '*'
    },
    action: 'add',
    controller: 'BetPlaceController'
  },

  // #################### TRANSACTIONS ####################

  'POST /transaction/payout': {
    cors: {
      allowOrigins: '*'
    },
    action: 'calculatePayout',
    controller: 'TransactionsController'
  },

  // EXPERIMENTAL HISTORY (Don't delete this one!) - Alvin Valdez
  'GET /transaction/history': {
    cors: {
      allowOrigins: '*'
    },
    action: 'history',
    controller: 'TransactionsController'
  },


  'GET /transaction/records': {
    cors: {
      allowOrigins: '*'
    },
    action: 'searchRecords',
    controller: 'TransactionsController'
  },

  'GET /transaction/new_records': {
    cors: {
      allowOrigins: '*'
    },
    action: 'searchNewRecords',
    controller: 'TransactionsController'
  },

  'GET /transaction/get_hand_result': {
    cors: {
      allowOrigins: '*'
    },
    action: 'searchHandResult',
    controller: 'TransactionsController'
  },

  'GET /transaction/multiple_records': {
    cors: {
      allowOrigins: '*'
    },
    action: 'searchRecordsByMultiple',
    controller: 'TransactionsController'
  },

  'GET /transaction/multiple_new_records': {
    cors: {
      allowOrigins: '*'
    },
    action: 'searchNewRecordsByMultiple',
    controller: 'TransactionsController'
  },

  'GET /transaction/all-records': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getAllTransactions',
    controller: 'TransactionsController'
  },

  'GET /transaction/reports': {
    cors: {
      allowOrigins: '*'
    },
    action: 'searchReports',
    controller: 'TransactionsController'
  },

  'GET /transaction/transfer/validation': {
    cors: {
      allowOrigins: '*'
    },
    action: 'transferValidation',
    controller: 'TransactionsController'
  },



  //  ################### DEALERS #########################

  'GET /dealergift/getById': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getDealerGiftById',
    controller: 'DealerGiftController'
  },

  'GET /dealer/getById': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getDealerById',
    controller: 'DealerController'
  },

  'POST /dealergift/addById': {
    cors: {
      allowOrigins: '*'
    },
    action: 'addDealerGiftById',
    controller: 'DealerGiftController'
  },

  // ################## SOCIALS ###########################
  'POST /follow/user': {
    cors: {
      allowOrigins: '*'
    },
    action: 'followUser',
    controller: 'FollowController'
  },

  'GET /follow/userlist': {
    cors: {
      allowOrigins: '*'
    },
    action: 'userList',
    controller: 'FollowController'
  },

  'POST /follow/dealer': {
    cors: {
      allowOrigins: '*'
    },
    action: 'followDealer',
    controller: 'FollowController'
  },

  'GET /follow/dealerlist': {
    cors: {
      allowOrigins: '*'
    },
    action: 'dealerList',
    controller: 'FollowController'
  },

  'GET /follow/dealerinfo': {
    cors: {
      allowOrigins: '*'
    },
    action: 'dealerInfo',
    controller: 'FollowController'
  },

  'GET /ranking/rankinglist': {
    cors: {
      allowOrigins: '*'
    },
    action: 'rankingList',
    controller: 'RankingController'
  },

  'GET /ranking/winningstreak': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getwinningstreak',
    controller: 'RankingController'
  },

  // ##################### ROADMAPS ######################

  'GET /roadmaps/road/canvas': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getRoadmapCanvas',
    controller: 'RoadMapController'
  },

  'GET /user/getBalance' : {
    cors: {
      allowOrigins: '*'
    },
    action: 'getBalance',
    controller: 'UserController'
  },

  'POST /user/broadcastBalance': {
    cors: {
      allowOrigins: '*',
    },
    action: 'broadcastBalance',
    controller: 'UserController'
  },

  'POST /user/joinChatTable' : {
    cors: {
      allowOrigins: '*',
    },
    action: 'joinChatTable',
    controller: 'ChatController'
  },

  'POST /user/chatMessage' : {
    cors: {
      allowOrigins: '*',
    },
    action: 'chatMessagePost',
    controller: 'ChatController'
  },

  'DELETE /user/chatMessage' : {
    cors: {
      allowOrigins: '*',
    },
    action: 'chatMessageDelete',
    controller: 'ChatController'
  },

  'PUT /user/chatChangeNickname' : {
    cors: {
      allowOrigins: '*',
    },
    action: 'chatChangeNickname',
    controller: 'ChatController'
  },
  // ##################### OPERATOR ######################
  'POST /verifyLogin': {
    cors: {
      allowOrigins: '*'
    },
    action: 'verifyLogin',
    controller: 'OperatorController'
  },

  'GET /playGame': {
    cors: {
      allowOrigins: '*'
    },
    action: 'playGame',
    controller: 'OperatorController'
  },

  //  ╦ ╦╔═╗╔╗ ╦ ╦╔═╗╔═╗╦╔═╔═╗
  //  ║║║║╣ ╠╩╗╠═╣║ ║║ ║╠╩╗╚═╗
  //  ╚╩╝╚═╝╚═╝╩ ╩╚═╝╚═╝╩ ╩╚═╝


  //  ╔╦╗╦╔═╗╔═╗
  //  ║║║║╚═╗║
  //  ╩ ╩╩╚═╝╚═╝
	'GET /api-docs' : {
		cors: {
		  allowOrigins: '*'
		},
		action: 'docs',
		controller: 'ApiDocsController'
	},
  'POST /getRoadMaps': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getRoadMap', // action: 'getRoadMapTest',
    controller: 'RoadMapController'
  },
  'POST /getGoodTips': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getGoodTipsResult',
    controller: 'RoadMapController'
  },

  /*
    _________  __
   /   _____/_/  |_ _______   ____  _____     _____    ____ _______
   \_____  \ \   __\\_  __ \_/ __ \ \__  \   /     \ _/ __ \\_  __ \
   /        \ |  |   |  | \/\  ___/  / __ \_|  Y Y  \\  ___/ |  | \/
  /_______  / |__|   |__|    \___  >(____  /|__|_|  / \___  >|__|
          \/                     \/      \/       \/      \/
  All streamer related APIs
   */
  'POST /topStreamer': {
    cors: {
      allowOrigins: '*'
    },
    action: 'topStreamer',
    controller: 'StreamerController'
  },
  'POST /addStreamerGift': {
    cors: {
      allowOrigins: '*'
    },
    action: 'addGift',
    controller: 'StreamerController'
  },

  'POST /streamer/follow-dealerstreamer': {
    cors: {
      allowOrigins: '*'
    },
    action: 'followdealerstreamer',
    controller: 'StreamerController'
  },

  'POST /streamer/follow-streamers': {
    cors: {
      allowOrigins: '*'
    },
    action: 'followstreamers',
    controller: 'StreamerController'
  },

  'GET /streamer/sign': {
    cors: {
      allowOrigins: '*'
    },
    action: 'loadStreamer',
    controller: 'StreamerController'
  },

  'GET /streamer/tables': {
    cors: {
      allowOrigins: '*'
    },
    action: 'streamerTables',
    controller: 'StreamerController'
  },

  'GET /emcee/stats': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getEmceeStats',
    controller: 'StreamerController'
  },

  'PUT /emcee/views': {
    cors: {
      allowOrigins: '*'
    },
    action: 'updateEmceeViews',
    controller: 'StreamerController'
  },

  'PUT /emcee/likes': {
    cors: {
      allowOrigins: '*'
    },
    action: 'updateEmceeLikes',
    controller: 'StreamerController'
  },


  /**
    _________                .__         .__
   /   _____/  ____    ____  |__|_____   |  |    ______
   \_____  \  /  _ \ _/ ___\ |  |\__  \  |  |   /  ___/
   /        \(  <_> )\  \___ |  | / __ \_|  |__ \___ \
  /_______  / \____/  \___  >|__|(____  /|____//____  >
          \/              \/          \/            \/
  ################
  New Follow/Socials controller, used by Phase3 Mobile project.
  */
  'GET /socials': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getAllSocials',
    controller: 'SocialController'
  },
  // 'POST /socials/follow/user': {
  //   cors: {
  //     allowOrigins: '*'
  //   },
  //   action: 'followUser',
  //   controller: 'SocialController'
  // }
  'GET /Announcement/AllAnnouncement': {
    cors: {
      allowOrigins: '*'
    },
    action: 'GetAllAnnouncements',
    controller: 'AnnouncementsController'
  },
  'PUT /Announcement/CreateAnnouncement': {
    cors: {
      allowOrigins: '*'
    },
    action: 'CreateAnnouncement',
    controller: 'AnnouncementsController'
  },

  'PUT /game_management/create_update_banner': {
    cors: {
      allowOrigins: '*'
    },
    action: 'createupdategmt',
    controller: 'GameManagementToolController'
  },

  'PUT /game_management/create_update_languages': {
    cors: {
      allowOrigins: '*'
    },
    action: 'createupdatelanguages',
    controller: 'GameManagementToolController'
  },

  'PUT /game_management/create_update_music': {
    cors: {
      allowOrigins: '*'
    },
    action: 'createupdatemusic',
    controller: 'GameManagementToolController'
  },

  'POST /game_management/camera_angle': {
    cors: {
      allowOrigins: '*'
    },
    action: 'updatecameraangle',
    controller: 'GameManagementToolController'
  },

  // 'PUT /gamemanagement/updatevideodetailspertable': {
  //   cors: {
  //     allowOrigins: '*'
  //   },
  //   action: 'updatevideodetailspertable',
  //   controller: 'GameManagementToolController'
  // },

  'GET /game_management/get_banners': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getbanners',
    controller: 'GameManagementToolController'
  },

  'GET /game_management/get_music': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getmusicpergamecode',
    controller: 'GameManagementToolController'
  },

  'GET /game_management/get_games': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getgames',
    controller: 'GameManagementToolController'
  },

  'DELETE /game_management/delete_banner': {
    cors: {
      allowOrigins: '*'
    },
    action: 'deletingbanner',
    controller: 'GameManagementToolController'
  },

  'DELETE /game_management/delete_music': {
    cors: {
      allowOrigins: '*'
    },
    action: 'deletingmusic',
    controller: 'GameManagementToolController'
  },

  'POST /game_management/language': {
    cors: {
      allowOrigins: '*'
    },
    action: 'setlanguagedefault',
    controller: 'GameManagementToolController'
  },

  'GET /game_management/get_banners_ogmx': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getbannersogmx',
    controller: 'GameManagementToolController'
  },

  'GET /game_management/get_gmt_musicogmx': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getmusicdetailsOGMX',
    controller: 'GameManagementToolController'
  },

  'GET /game_management/get_languages': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getlanguages',
    controller: 'GameManagementToolController'
  },

  'GET /game_management/get_music_details': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getmusicdetails',
    controller: 'GameManagementToolController'
  },

  'GET /game_management/video_details_per_table': {
    cors: {
      allowOrigins: '*'
    },
    action: 'videodetailspertable',
    controller: 'GameManagementToolController'
  },

  'POST /game_management/update_table_video': {
    cors: {
      allowOrigins: '*'
    },
    action: 'updatetablevideo',
    controller: 'GameManagementToolController'
  },

  'POST /game_management/update_video_by_table': {
    cors: {
      allowOrigins: '*'
    },
    action: 'updatevideobytable',
    controller: 'GameManagementToolController'
  },

  'POST /game_management/update_video_multi_table': {
    cors: {
      allowOrigins: '*'
    },
    action: 'addvideototables',
    controller: 'GameManagementToolController'
  },

  'POST /game_management/broadcast/table': {
    cors: {
      allowOrigins: '*'
    },
    action: 'broadcastTable',
    controller: 'GameManagementToolController'
  },

  'POST /game-management-tool/broadcast/announcement': {
    cors: {
      allowOrigins: '*'
    },
    action: 'broadcastAnnouncements',
    controller: 'GameManagementToolController'
  },

  'POST /game_management/broadcast/player': {
    cors: {
      allowOrigins: '*'
    },
    action: 'broadcastPlayer',
    controller: 'GameManagementToolController'
  },

  'GET /announcement/getAnnouncementsBy': {
    cors: {
      allowOrigins: '*'
    },
    action: 'GetAnnouncementsBy',
    controller: 'AnnouncementsController'
  },

  'POST /admin/admin-login': {
    cors: {
      allowOrigins: '*'
    },
    action: 'adminlogin',
    controller: 'AdminController',
  },

  'PUT /admin/createadmin-login': {
    cors: {
      allowOrigins: '*'
    },
    action: 'createadminlogin',
    controller: 'AdminController'
  },

  'PUT /admin/import-dealerfile': {
    cors: {
      allowOrigins: '*'
    },
    action: 'importdealerfiles',
    controller: 'AdminController'
  },

  'GET /admin/alldealerlist': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getdealerlist',
    controller: 'AdminController'
  },

  'GET /admin/allLoglist': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getloglist',
    controller: 'AdminController'
  },

  'POST /admin/syncDealerFollowers': {
    cors: {
      allowOrigins: '*'
    },
    action: 'syncDealerFollowers',
    controller: 'AdminController'
  },

  'POST /admin/athensStatus': {
    cors: {
      allowOrigins: '*'
    },
    action: 'athensStatus',
    controller: 'AdminController'
  },

  'POST /admin/command': {
    cors: {
      allowOrigins: '*'
    },
    action: 'adminCommand',
    controller: 'AdminController'
  },

  // System
  'GET /system/time': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getCurrentSystemTime',
    controller: 'SystemController'
  },

  // translations
  'GET /translation': {
    cors: {
      allowOrigins: '*'
    },
    action: 'getAllTranslation',
    controller: 'TranslationController'
  },

  // Configuration related end-point
  'PUT  /config'                        : 'GameConfigController.reloadConfig',
  'GET  /config'                        : 'GameConfigController.getConfig',

  // Operators related end-point
  'POST /operators_transaction'         : 'OperatorController.operatorsTransaction',
  'POST /operators_game_result'         : 'OperatorController.operatorsGameResult',
  'POST /operators_betting'             : 'OperatorController.operatorsBetting',
  'PUT  /operators_payout'              : 'OperatorController.operatorsPayout',
  'POST /operators_tablegames'          : 'OperatorController.operatorsTableGames',
  'GET  /operators_livegames'           : 'OperatorController.operatorsLiveGames',

  'GET /version'                        : 'SystemController.getSystemVersion'
};
