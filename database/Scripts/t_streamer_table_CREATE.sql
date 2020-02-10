-- --------------------------------------------------------
-- Host:                         172.16.126.116
-- Server version:               5.7.27 - MySQL Community Server (GPL)
-- Server OS:                    Linux
-- HeidiSQL Version:             10.1.0.5464
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for table panda_dev.t_streamers_table
CREATE TABLE IF NOT EXISTS `t_streamers_table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dealerCode` int(11) DEFAULT NULL,
  `tableNumber` varchar(50) DEFAULT NULL,
  `liveViewers` int(11) DEFAULT NULL,
  `liveStart+8` time DEFAULT NULL,
  `liveEnd+8` time DEFAULT NULL,
  `streamURL` text,
  `config` text,
  `status` varchar(50) DEFAULT '',
  `CANCELLED` int(11) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `tableNumber` (`tableNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;

-- Dumping data for table panda_dev.t_streamers_table: ~8 rows (approximately)
DELETE FROM `t_streamers_table`;
/*!40000 ALTER TABLE `t_streamers_table` DISABLE KEYS */;
INSERT INTO `t_streamers_table` (`id`, `dealerCode`, `tableNumber`, `liveViewers`, `liveStart+8`, `liveEnd+8`, `streamURL`, `config`, `status`, `CANCELLED`) VALUES
	(1, 327, 'MX1', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(2, 538, 'MX2', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(3, 575, 'MX3', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(5, 576, 'MX5', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(7, 609, 'MX6', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(10, 649, 'MX7', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(12, 673, 'MX8', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(14, 686, 'MX9', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0);
/*!40000 ALTER TABLE `t_streamers_table` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
