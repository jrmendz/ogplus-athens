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

-- Dumping structure for procedure panda_dev.PAYOUT_PLAYER_BETS
DELIMITER //
CREATE DEFINER=`panda_dev`@`%` PROCEDURE `PAYOUT_PLAYER_BETS`(
	IN `__TABLE_ID` INT,
	IN `__SHOE_HAND_ID` INT,
	IN `__GAME_SET_ID` INT



)
    DETERMINISTIC
    COMMENT 'Pull-out all player bets.'
BEGIN
	SELECT 
		t0.*,
		t1.bet_place,
		t2.gamename,
		t3.username
	FROM 
		t_betdetails t0 
		LEFT JOIN c_betplace t1 ON t0.betplace_id = t1.id
		LEFT JOIN c_tablelist t2 ON t0.table_id = t2.id 
		LEFT JOIN t_user t3 ON t0.user_id = t3.id
	WHERE 
		t0.table_id = __TABLE_ID
		AND t0.shoehand_id = __SHOE_HAND_ID 
		AND t0.gameset_id = __GAME_SET_ID;
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
