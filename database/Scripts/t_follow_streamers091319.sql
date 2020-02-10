-- --------------------------------------------------------
-- Host:                         172.16.126.116
-- Server version:               5.7.26 - MySQL Community Server (GPL)
-- Server OS:                    Linux
-- HeidiSQL Version:             8.0.0.4396
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping database structure for panda_dev
CREATE DATABASE IF NOT EXISTS `panda_dev` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `panda_dev`;


-- Dumping structure for table panda_dev.t_follow_streamers
DROP TABLE IF EXISTS `t_follow_streamers`;
CREATE TABLE IF NOT EXISTS `t_follow_streamers` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `dealerscode` double NOT NULL DEFAULT '0',
  `user_id` int(10) NOT NULL DEFAULT '0',
  `created` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

-- Dumping data for table panda_dev.t_follow_streamers: ~11 rows (approximately)
/*!40000 ALTER TABLE `t_follow_streamers` DISABLE KEYS */;
REPLACE INTO `t_follow_streamers` (`id`, `dealerscode`, `user_id`, `created`) VALUES
	(2, 719, 10, '2019-09-12 15:27:28'),
	(3, 614, 10, '2019-09-12 17:42:22'),
	(4, 615, 10, '2019-09-12 17:44:21'),
	(5, 790, 10, '2019-09-12 17:53:06'),
	(6, 788, 10, '2019-09-12 17:54:26'),
	(7, 787, 10, '2019-09-12 17:55:31'),
	(8, 730, 10, '2019-09-12 17:58:21'),
	(9, 739, 10, '2019-09-12 18:05:02'),
	(10, 742, 10, '2019-09-12 18:25:33'),
	(12, 683, 10, '2019-09-12 18:41:37'),
	(13, 327, 10, '2019-09-13 13:41:32');
/*!40000 ALTER TABLE `t_follow_streamers` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
