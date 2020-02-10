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

-- Dumping structure for procedure panda_dev.STREAMER_TOP5
DELIMITER //
CREATE DEFINER=`panda_dev`@`%` PROCEDURE `STREAMER_TOP5`()
    DETERMINISTIC
    COMMENT 'Get the Top 5 Streamers by total of gift received'
BEGIN
	SELECT
		td.fullname AS `fullName`,
		IFNULL(SUM(t1.gift_price), 0) AS `totalGift`,
		t0.languages AS `language`,
		t0.`status` AS `status`,
		t0.likes AS `likes`,
		td.dealerscode AS `dealerscode`,
		td.imagestreamer AS `imagestreamer`,
		t0.table_location AS `table_location`,
		td.nickname AS `nickname`
				
	FROM
		t_streamers t0
		LEFT JOIN t_streamers_gift t1 ON t0.id = t1.streamer_id
		LEFT JOIN t_dealers td ON t0.dealerscode = td.dealerscode
		
	WHERE
		t0.CANCELLED = 0
	GROUP BY
		t0.id
	ORDER BY
		t0.likes DESC, t0.`status` DESC
	LIMIT 5;
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
