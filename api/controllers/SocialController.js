/**
 * SocialController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 *
 * getAllSocials:
 *      # params required:
 *			- token
 * 		# usage explanation:
 *			This function collections on possible social queries and combines it to a single result.
 *
 *			Every result saves to cache. Once a user follows another user/dealer (see FollowController),
 *				it will reset the cache and get fresh valeus from the db. This can be improved by appending new
 *				values to the cache instead to maximize cache usage. But as of this writing, FollowController is still
 *				a bit messed up.
 *
 *		# return value:
 *			returns a object collection
 *			sample:
 *				followedUsers: { list: [...], count: 99}
 *				rankingPlayers: { list: [...], count: 99}
 *				followedDealers: { list: [...], count: 99}
 */

module.exports = {
  	getAllSocials: async (req, res) => {
  		const params = _.isEmpty(req.body) ? req.query : req.body;
  		let user

  		const tasks = {
  		  verifyToken: async (cb) => {
          await JwtService.valid(params.token)
            .then((token) => {
              user = token;
              return cb(null, token);
            })
            .catch((err) => {
              return cb(err)
            });
        },
  			/** Gets followed players of the user */
  			checkCachedData: ["verifyToken", async (next) => {
  				var values = {}
  				const q = async.queue((task, done) => {
  					CacheService.get(task.cacheKey, (e, r) => {
  						if (r)
  							values[task.name] = {list: r, count: r.length}
  						done()
  					})
  				}, 1)
  				const tasks = [
  					{
  						name: 'followedUsersCache',
  						cacheKey: user.id + '_followed_users'
  					},
  					// {
  					// 	name: 'rankingPlayersCache',
  					// 	cacheKey: user.id + '_ranking_players'
  					// },
  					{
  						name: 'followedDealersCache',
  						cacheKey: user.id + '_followed_dealers'
  					}
  				]
  				q.push(tasks)
  				q.drain = (a) => {

  					return next(null, values)
  				}
  			}],
  			getFollowedUsers: ['checkCachedData', async ({checkCachedData}, next) => {
  				// If cached values are still updated, see `FollowController`, Everytime you follow/unfollow someone, cache gets cleared
  				if (checkCachedData.followedUsersCache) {
  					return next(null, null);
  				}
  				// If Token is invalid
  				if (!user)
  					return next("Invalid token")
  				const query =  `SELECT f.follow_user_id, u.nickname, u.table_location, u.logged, IF(f.followers < 0, 0, f.followers) AS followers
								FROM t_follow_users f 
								LEFT JOIN t_user u ON f.follow_user_id = u.id
								WHERE f.user_id = ${user.id}`;
				const data = await FollowUsers.getDatastore().sendNativeQuery(query);
				const serializedData = await camelfyHelper(data.rows);
				CacheService.set(user.id + '_followed_users', serializedData, 60*60*24, () => {})
				const result = {
					list: serializedData,
					count: data.rows ? data.rows.length : 0
				}
				return next(null, result);
  			}],
  			getRankingPlayers: ['getFollowedUsers', async({ getFollowedUsers }, next) => {
  				const query =  `SELECT u.id, u.nickname, u.logged, SUM(b.effective_bet_amount) AS total_bet, 
  								IF (EXISTS (SELECT * FROM t_follow_users fu WHERE fu.user_id = ${user.id} AND fu.follow_user_id = u.id), 1, 0) AS followed
								FROM t_betdetails b 
								RIGHT JOIN t_user u ON u.id = b.user_id 
								GROUP BY user_id
								ORDER BY total_bet DESC`;
				let data = await Ranking.getDatastore().sendNativeQuery(query);
				data.rows = data.rows.filter(a => a.total_bet > 0);
				const serializedData = await camelfyHelper(data.rows);
				// CacheService.set(user.id + '_ranking_players', serializedData, 60*60*24, () => {})
				const result = {
					list: serializedData,
					count: data.rows ? data.rows.length : 0
				}
  				return next(null, result);
  			}],
  			getFollowedDealers: ['getRankingPlayers', async({ checkCachedData, getFollowedUsers, getRankingPlayers }, next) => {
  				// If cached values are still updated, see `FollowController`, Everytime you follow/unfollow someone, cache gets cleared
  				if (checkCachedData.followedDealersCache) {
  					return next(null, null);
  				}
  				const query =  `SELECT a.nickname, a.dealerscode, (SELECT COUNT(b.id) FROM t_follow_dealers b WHERE b.dealerscode = a.dealerscode GROUP BY b.dealerscode) AS followers 
				  				FROM t_follow_dealers a 
				  				WHERE user_id = ${user.id}`;
				const data = await FollowDealers.getDatastore().sendNativeQuery(query);
				const serializedData = await camelfyHelper(data.rows);
				// Capitalize nicknames
				serializedData.map(a => a.nickname = a.nickname.substring(0, 1).toUpperCase() + a.nickname.substring(1, a.length))
				CacheService.set(user.id + '_followed_dealers', serializedData, 60*60*24, () => {})
				const result = {
					list: serializedData,
					count: data.rows ? data.rows.length : 0
				};
  				return next(null, result);
  			}],
  			compileResults: ['getFollowedDealers', ({checkCachedData, getFollowedUsers, getRankingPlayers, getFollowedDealers}, next) => {
  				let obj = {
  					followedUsers: checkCachedData.followedUsersCache ? checkCachedData.followedUsersCache : getFollowedUsers,
  					rankingPlayers: getRankingPlayers,
  					followedDealers: checkCachedData.followedDealersCache ? checkCachedData.followedDealersCache : getFollowedDealers
  				}
  				return next(null, obj)
  			}]
  		};
  		async.auto(tasks, (err, {compileResults}) => {
  			if (err)
  				return res.serverError(err);

  			return res.ok(compileResults);
  		});
  	},
  	// followUser: async (req, res) => {
  	// 	const params = req.body;
  	// 	if (_.isEmpty(req.body)) {
  	// 		return res.badRequest();
  	// 	}

  	// 	const tasks = {
  	// 		validateData: async (next) => {
  	// 			const user = await JwtService.verify(params.token);
  	// 			if (!user) {
  	// 				return next("Unable to verify token");
  	// 			}
  	// 			if (!params.followuser) {
  	// 				return next("Invalid user to follow");
  	// 			}
  	// 			return next(null, user);
  	// 		},
  	// 		getOtherUser: ['validateData', async ({validateData}, next) => {
  	// 			const otherUser = await Users.findOne({id: params.followuser})
  	// 				.intercept(err => { return next(err) })
  	// 			return next(null, otherUser)
  	// 		}],
  	// 		follow: ['getOtherUser', async ({validateData, getOtherUser}, next) => {
  	// 			const user = validateData;
  	// 			const otherUser = getOtherUser;
  	// 			const toCreate = {
  	// 				follow_user_id: otherUser.id,
  	// 				nickname: otherUser.nickname,
  	// 				full_name: otherUser.full_name,
  	// 				email_address: otherUser.email_address,
  	// 				followers: otherUser.followers,
  	// 				logged: otherUser.logged
  	// 			}
  	// 			FollowUsers.findOrcreate({ user_id: user.id, follow_user_id: params.followuser}, toCreate)
  	// 				.exec(err, existingItem, isCreated) {
  	// 					console.log(isCreated)

  	// 				}
  	// 		}]
  	// 	}
  	// 	async.auto(tasks, (err, {validateData}) => {
  	// 		if (err)
  	// 			return res.serverError(err);
  	// 		return res.ok(validateData)
  	// 	})
  	// }
};

