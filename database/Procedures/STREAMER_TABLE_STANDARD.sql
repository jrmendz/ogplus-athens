-- --------------------------------------------------------
-- Host:                         172.16.126.116
-- Server version:               5.7.27 - MySQL Community Server (GPL)
-- Server OS:                    Linux
-- HeidiSQL Version:             10.2.0.5599
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for procedure panda_dev.STREAMER_TABLE_STANDARD
DELIMITER //
CREATE DEFINER=`panda_dev`@`%` PROCEDURE `STREAMER_TABLE_STANDARD`(
	IN `__STUDIO` VARCHAR(50)

)
    DETERMINISTIC
    COMMENT 'Get streamer - @Alvin Phoebe Artemis Valdez'
BEGIN
	SELECT 
		IFNULL(t0.dealerCode, t1.dealerscode) AS dealerCode,
		UPPER(t2.nickname) AS streamerNickname,
		t2.imagestreamer AS streamerImage,
		(SELECT COUNT(_t0.id) FROM t_follow_streamers _t0 WHERE _t0.dealerscode = IFNULL(t0.dealerCode, t1.dealerscode)) AS streamerFollowers,
		IFNULL(t0.liveViewers, 0) AS liveViewers, 
		IFNULL(t0.tableNumber, '') AS tableNumber,
		NULL AS gameName,
		NULL AS gameCode,
		IFNULL(t0.streamURL, '[]') AS streamURL,
		IFNULL(t0.config, '{}') AS config,
		CASE WHEN IFNULL(t0.tableNumber, '') != '' THEN 'LIVE' ELSE 'OFFLINE' END AS `status`
	FROM 
		t_streamers_table t0 
		RIGHT JOIN t_streamers t1 ON t0.dealerCode = t1.dealerscode
		LEFT JOIN t_dealers t2 ON IFNULL(t0.dealerCode, t1.dealerscode) = t2.dealerscode
	WHERE
		t0.studio LIKE CONCAT("%", __STUDIO, "%") OR t0.studio IS NULL
	ORDER BY
		t1.likes DESC,
		tableNumber DESC;
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
