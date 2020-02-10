proc_label:BEGIN
	-- Declaration
	DECLARE USER_BALANCE DECIMAL(25,5) DEFAULT 0;
	DECLARE GAME_CODE_ID INT DEFAULT NULL;
	DECLARE GAME_TABLE_NUMBER TEXT DEFAULT NULL;
	DECLARE GAME_NAME TEXT DEFAULT NULL;
	DECLARE GAME_CODE TEXT DEFAULT NULL;
	
	-- Pre-setting variables
	SELECT t0.balance INTO USER_BALANCE FROM t_user t0 WHERE t0.id = __USER_ID LIMIT 1;
	SELECT t1.gamecode, t1.id, t0.gamename, t0.tablenumber INTO GAME_CODE, GAME_CODE_ID, GAME_NAME, GAME_TABLE_NUMBER FROM c_tablelist t0 LEFT JOIN c_gamecodes t1 ON t0.game_code_id = t1.id WHERE t0.id = __TABLE_ID LIMIT 1;
 	
 	-- Check if the Player balance is sufficient
 	IF (__TOTAL_BET_AMOUNT > USER_BALANCE) THEN
 		LEAVE proc_label;
 	END IF;
 	
 	-- Update Player Balance
	UPDATE t_user t0 SET t0.balance = (USER_BALANCE - __TOTAL_BET_AMOUNT) WHERE t0.id = __USER_ID;
 	
 	-- Return Game Highest Bidder
	IF GAME_CODE = 'baccarat' THEN
		-- <<< ARRAY [0] >>> 
		SELECT * FROM (
			-- Banker Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, t2.avatar, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 1 AND (t1.gameset_id = __GAME_SET) GROUP BY t1.user_id ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- Player Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, t2.avatar, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 2 AND (t1.gameset_id = __GAME_SET) GROUP BY t1.user_id ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- Tie Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, t2.avatar, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 3 AND (t1.gameset_id = __GAME_SET) GROUP BY t1.user_id ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- Super Six Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, t2.avatar, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 26 AND (t1.gameset_id = __GAME_SET) GROUP BY t1.user_id ORDER BY bet_amount DESC LIMIT 1)
		) BACC;

	ELSEIF GAME_CODE = 'dragontiger' THEN
		-- <<< ARRAY [0] >>> 
		SELECT * FROM (
	   	-- Tie Highest Bidder
			(SELECT t0.gamecode_id, IF(t0.bet_place = 'dt-tie', 'tie', t0.bet_place) AS bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, t2.avatar, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 4 AND (t1.gameset_id = __GAME_SET) GROUP BY t1.user_id ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- Dragon Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, t2.avatar, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 5 AND (t1.gameset_id = __GAME_SET) GROUP BY t1.user_id ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- Tiger Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, t2.avatar, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 6 AND (t1.gameset_id = __GAME_SET) GROUP BY t1.user_id ORDER BY bet_amount DESC LIMIT 1)
		) DRAG;
	ELSE
		-- Return empty result
		-- <<< ARRAY [0] >>> 
		SELECT NULL LIMIT 0;	
	END IF;
	
	-- Total Players and Bets
	-- <<< ARRAY [1] >>>
	SELECT
		IF(bp.bet_place = 'dt-tie', 'tie', bp.bet_place) as bet_place,
		IFNULL(SUM(bd.bet_amount), 0) as total_bets,
		COUNT(DISTINCT bd.user_id) as total_users
	FROM 
		c_gamecodes gc 
		LEFT JOIN c_betplace bp ON gc.id = bp.gamecode_id 
		LEFT JOIN t_betdetails bd ON bp.id = bd.betplace_id AND bd.table_id = __TABLE_ID AND bd.gameset_id = __GAME_SET
	WHERE 
		gc.id = GAME_CODE_ID
		AND bet_place IN ('banker', 'player', 'tie', 'dragon', 'tiger', 'dt-tie', '1', '2', '5', '10', '20', 'og')
	GROUP BY 
		bp.bet_place;
	
	-- Return table name	
	-- <<< ARRAY [2] >>>	
	SELECT 
		GAME_NAME AS 'game', 
		GAME_CODE AS 'gameCode',
		(USER_BALANCE - __TOTAL_BET_AMOUNT) AS 'newBalance',
		GAME_TABLE_NUMBER AS 'tableNumber';
END