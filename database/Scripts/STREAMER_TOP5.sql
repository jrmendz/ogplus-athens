-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.5.5-10.3.15-MariaDB-log - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             8.0.0.4396
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for procedure panda_dev.STREAMER_TOP5
DROP PROCEDURE IF EXISTS `STREAMER_TOP5`;
DELIMITER //
CREATE DEFINER=`panda_dev`@`%` PROCEDURE `STREAMER_TOP5`()
    DETERMINISTIC
    COMMENT 'Get the Top 5 Streamers by total of gift received'
BEGIN
	SELECT
		t0.fullname AS `fullName`,
		IFNULL(SUM(t1.gift_price), 0) AS `totalGift`,
		t0.`language` AS `language`,
		t0.video_url AS `videoURL`,
		t0.image AS `image`,
		t0.`status` AS `status`
	FROM
		t_streamers t0
		LEFT JOIN t_streamers_gift t1
	ON
		t0.id = t1.streamer_id
	WHERE
		t0.`status` NOT IN ('BANNED', 'INACTIVE') AND
		t0.CANCELLED = 0
	GROUP BY
		t0.id
	ORDER BY
		totalGift DESC
	LIMIT 5;
END//
DELIMITER ;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
