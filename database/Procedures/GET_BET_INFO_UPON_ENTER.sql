-- --------------------------------------------------------
-- Host:                         172.16.126.116
-- Server version:               5.7.26 - MySQL Community Server (GPL)
-- Server OS:                    Linux
-- HeidiSQL Version:             10.1.0.5464
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for procedure panda_dev.GET_BET_INFO_UPON_ENTER
DELIMITER //
CREATE DEFINER=`panda_dev`@`%` PROCEDURE `GET_BET_INFO_UPON_ENTER`(
	IN `_tableNumber` VARCHAR(50),
	IN `_gameSet` INT


)
    DETERMINISTIC
    COMMENT 'This includes the Highest Bidder, percentages and player upon entering the table'
BEGIN
	DECLARE P_AMOUNT, B_AMOUNT, S6_AMOUNT, D_AMOUNT, T_AMOUNT, TI_AMOUNT DOUBLE DEFAULT 0;
	DECLARE P_HIGH_ID, B_HIGH_ID, S6_HIGH_ID, D_HIGH_ID, T_HIGH_ID, TI_HIGH_ID INT DEFAULT NULL;
	DECLARE TBL_CODE TEXT DEFAULT NULL;
	DECLARE TBL_GAMECODE, TBL_ID INT DEFAULT NULL;

	-- PRE-SETTING IMPORTANT VARIABLE
	SELECT t1.gamecode, t1.id, t0.id INTO TBL_CODE, TBL_GAMECODE, TBL_ID FROM c_tablelist t0 LEFT JOIN c_gamecodes t1 ON t0.game_code_id = t1.id WHERE t0.tablenumber = _tableNumber LIMIT 1;

	-- HIGHEST BIDDER
	IF TBL_CODE = 'baccarat' THEN
		-- Banker Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO B_AMOUNT, B_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 1 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Player Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO P_AMOUNT, P_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 2 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Tie Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO TI_AMOUNT, TI_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 3 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Super Six Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO S6_AMOUNT, S6_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 26 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Return Highest Bidder for Baccarat
		SELECT
			B_HIGH_ID as banker,
			B_AMOUNT as banker_amount,
			P_HIGH_ID as player,
			P_AMOUNT as player_amount,
			TI_HIGH_ID as tie,
			TI_AMOUNT as tie_amount,
			S6_HIGH_ID as super_six,
			S6_AMOUNT as super_six_amount;

	ELSEIF TBL_CODE = 'dragontiger' THEN
		-- Dragon Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO D_AMOUNT, D_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 5 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Tiger Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO T_AMOUNT,  T_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 6 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Tie Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO TI_AMOUNT, TI_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 4 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Return Highest Bidder for Dragon-Tiger
		SELECT
			T_HIGH_ID as tiger,
			T_AMOUNT as tiger_amount,
			TI_HIGH_ID as tie,
			TI_AMOUNT as tie_amount,
			D_HIGH_ID as dragon,
			D_AMOUNT as dragon_amount;
	ELSEIF TBL_CODE = 'moneywheel' THEN
		SELECT NULL AS '1', NULL AS '2', NULL AS '5', NULL AS '10', NULL AS '20', NULL AS 'og';
	END IF;

	-- BET PERCENTAGE
	SET @total_bets = (SELECT SUM(bd.bet_amount) FROM t_betdetails bd LEFT JOIN c_betplace bp ON bp.id = bd.betplace_id WHERE bd.table_id = TBL_ID AND bd.gameset_id = _gameSet AND bp.bet_place IN ('banker', 'player','tie', 'dragon', 'tiger', 'dt-tie', '1', '2', '5', '10', '20', 'og'));
	SELECT
		IF(bp.bet_place = 'dt-tie', 'tie', bp.bet_place) as bet_place,
		IFNULL(TRUNCATE(SUM(bd.bet_amount) / @total_bets * 100, 0), 0.00) as bet_percentage
   FROM c_betplace bp
		LEFT JOIN t_betdetails bd ON bd.betplace_id = bp.id AND bd.table_id = TBL_ID AND bd.gameset_id = _gameSet
	WHERE
		bp.bet_place IN ('banker', 'player','tie', 'dragon', 'tiger', 'dt-tie', '1', '2', '5', '10', '20', 'og')
		AND bp.gamecode_id = TBL_GAMECODE
	GROUP BY bp.id;

	-- TOTAL BET AMOUNT / PLAYERS
	SELECT
		IF(bp.bet_place = 'dt-tie', 'tie', bp.bet_place) as bet_place,
		IFNULL(ROUND(SUM(bd.bet_amount),2), 0.00) as total_bets,
		COUNT(DISTINCT bd.user_id) as total_users
	FROM
		c_gamecodes gc
		LEFT JOIN c_betplace bp ON gc.id = bp.gamecode_id
		LEFT JOIN t_betdetails bd ON bp.id = bd.betplace_id AND bd.table_id = TBL_ID AND bd.gameset_id = _gameSet
	WHERE
		gc.id= TBL_GAMECODE
	GROUP BY
		bp.bet_place;
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
