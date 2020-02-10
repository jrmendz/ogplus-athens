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

-- Dumping structure for procedure panda_dev.ALL_BETS_PER_GAMESET
DELIMITER //
CREATE DEFINER=`panda_dev`@`%` PROCEDURE `ALL_BETS_PER_GAMESET`(
	IN `BET_DATE` VARCHAR(25),
	IN `USER_ID` INT,
	IN `TABLE_ID` INT
,
	IN `GAMESET` INT
)
BEGIN
	SET @totalBetsToday := (SELECT COALESCE(SUM(bd.bet_amount), 0) FROM t_betdetails bd WHERE bd.user_id = USER_ID AND bd.table_id = TABLE_ID AND bd.gameset_id = GAMESET);
   SELECT USER_ID as user_id, TABLE_ID as table_id, @totalBetsToday as totalBetsToday, BET_DATE as bet_date;
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
