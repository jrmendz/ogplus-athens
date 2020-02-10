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

-- Dumping structure for procedure panda_dev.TRANSACTION_HISTORY
DELIMITER //
CREATE DEFINER=`panda_dev`@`%` PROCEDURE `TRANSACTION_HISTORY`(
	IN `_userID` INT,
	IN `_StartDate` DATETIME,
	IN `_EndDate` DATETIME,
	IN `_ShoeNumber` TEXT,
	IN `_TableID` INT,
	IN `_Limit` INT,
	IN `_Offset` INT


















)
    DETERMINISTIC
    COMMENT 'Transaction history'
BEGIN
	# Pagination (Total Records)
	SELECT 
		COUNT(t0.id) as totalRows
	FROM 
		t_betdetails t0 
		LEFT JOIN c_shoehand t1 ON t0.shoehand_id = t1.id
	WHERE 
		t0.user_id = IFNULL(_userID, t0.user_id)
		AND t0.created_at BETWEEN DATE_FORMAT(_StartDate, '%Y-%m-%d 00:00:00') AND DATE_FORMAT(_EndDate, '%Y-%m-%d 23:59:59')
		AND t0.table_id = IFNULL(_TableID, t0.table_id)
		AND t1.shoehandnumber LIKE CONCAT(IFNULL(_ShoeNumber, t1.shoehandnumber),'%');
		
	# Records List
	SELECT 
		bt.id, 
		bt.bet_code, 
		bt.balance, 
		bt.win_loss, 
		bt.table_id, 
		bt.bet_amount,
		u.username,
		u.currency,
		bt.effective_bet_amount, 
		bt.created_at as bet_date, 
		s.shoehandnumber, 
		t.gamename, 
		t.tablenumber, 
		bp.bet_place, 
		rl.prefix as result,
		CASE WHEN (gc.gamecode = '3cards') THEN 'threecards' ELSE gc.gamecode END AS gamecode,
		gv.`values` as gameValues
	FROM 
		t_betdetails bt 
		LEFT JOIN c_tablelist t ON t.id=bt.table_id 
		LEFT JOIN c_resultlist rl ON rl.id=bt.resultlist_id 
		LEFT JOIN c_shoehand s ON s.id=bt.shoehand_id 
		LEFT JOIN c_betplace bp ON bp.id=bt.betplace_id 
		LEFT JOIN c_gamecodes gc ON gc.id=bp.gamecode_id
		LEFT JOIN t_game_values gv ON gv.result_id=bt.result_id
		LEFT JOIN t_user u ON u.id=bt.user_id
	WHERE
		bt.user_id = IFNULL(_userID, bt.user_id)
		AND bt.created_at BETWEEN DATE_FORMAT(_StartDate, '%Y-%m-%d 00:00:00') AND DATE_FORMAT(_EndDate, '%Y-%m-%d 23:59:59')
		AND bt.table_id = IFNULL(_TableID, bt.table_id)
		AND s.shoehandnumber LIKE CONCAT(IFNULL(_ShoeNumber, s.shoehandnumber),'%')
	ORDER BY
		bt.created_at DESC
	LIMIT _Limit
	OFFSET _Offset
	;
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
