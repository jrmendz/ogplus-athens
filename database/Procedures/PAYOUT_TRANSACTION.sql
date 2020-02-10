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

-- Dumping structure for procedure panda_dev.PAYOUT_TRANSACTION
DELIMITER //
CREATE DEFINER=`panda_dev`@`%` PROCEDURE `PAYOUT_TRANSACTION`(
	IN `__GAME_SET_ID` INT



,
	IN `__USER_ID` INT
)
    DETERMINISTIC
BEGIN
	SELECT 
		tbd.id, 
		tbd.bet_code, 
		tbd.bet_amount, 
		tu.username, 
		cbp.bet_place, 
		tbd.effective_bet_amount, 
		csh.shoehandnumber, 
		tbd.gameset_id, 
		ctl.gamename, 
		ctl.tablenumber, 
		tbd.balance, 
		tbd.win_loss, 
		tbd.result_id, 
		crl.result, 
		tbd.created_at, 
		tbd.updated_at, 
		tbd.bet_date, 
		tbd.super_six, 
		tbd.is_sidebet
	FROM 
		t_betdetails tbd
		LEFT JOIN t_user tu ON tbd.user_id = tu.id
		LEFT JOIN c_betplace cbp ON tbd.betplace_id = cbp.id
		LEFT JOIN c_shoehand csh ON tbd.shoehand_id = csh.id
		LEFT JOIN c_tablelist ctl ON tbd.table_id = ctl.id
		LEFT JOIN c_resultlist crl ON tbd.resultlist_id = crl.id
	WHERE 
		tbd.gameset_id = __GAME_SET_ID AND
		tbd.user_id = __USER_ID
	ORDER BY id DESC;
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
