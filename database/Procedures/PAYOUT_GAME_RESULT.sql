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

-- Dumping structure for procedure panda_dev.PAYOUT_GAME_RESULT
DELIMITER //
CREATE DEFINER=`panda_dev`@`%` PROCEDURE `PAYOUT_GAME_RESULT`(
	IN `___RESULT_ID` INT



)
    DETERMINISTIC
    COMMENT 'Pull-out of game result.'
BEGIN
	SELECT 
		tr.`id`, 
		crl.`result`, 
		csh.`shoehandnumber`, 
		tr.`shoe_date`, 
		ctl.`gamename`, 
		ctl.`tablenumber`, 
		tgv.`values`
	FROM 
		t_results tr
		LEFT JOIN c_resultlist crl ON tr.resultlist_id = crl.id
		LEFT JOIN c_shoehand csh ON tr.shoehand_id = csh.id
		LEFT JOIN c_tablelist ctl ON tr.table_id = ctl.id
		LEFT JOIN t_game_values tgv ON tr.id = tgv.result_id
	WHERE 
		tr.id = ___RESULT_ID;
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
