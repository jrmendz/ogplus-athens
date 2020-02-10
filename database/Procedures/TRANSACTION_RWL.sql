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

-- Dumping structure for procedure panda_dev.TRANSACTION_RWL
DELIMITER //
CREATE DEFINER=`panda_dev`@`%` PROCEDURE `TRANSACTION_RWL`(
	IN `_userID` INT,
	IN `_StartDate` DATETIME,
	IN `_EndDate` DATETIME






)
    DETERMINISTIC
    COMMENT 'Summary of Rolling and Win/Loss'
BEGIN
	# Total Rolling and Win/Loss
	SELECT
		IFNULL(SUM(t0.bet_amount), 0) as rolling,
		IFNULL(SUM(t0.win_loss), 0) as win_loss
	FROM
		t_betdetails t0
	WHERE
		t0.user_id = _userID
		AND t0.created_at BETWEEN DATE_FORMAT(_StartDate, '%Y-%m-%d 00:00:00') AND DATE_FORMAT(_EndDate, '%Y-%m-%d 23:59:59');
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
