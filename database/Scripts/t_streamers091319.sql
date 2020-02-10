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


-- Dumping structure for table panda_dev.t_streamers
DROP TABLE IF EXISTS `t_streamers`;
CREATE TABLE IF NOT EXISTS `t_streamers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dealerscode` double DEFAULT NULL,
  `languages` text,
  `status` tinyint(1) DEFAULT '0',
  `likes` int(11) DEFAULT '0',
  `live_viewers` int(11) DEFAULT '0',
  `table_location` varchar(20) DEFAULT 'Lobby',
  `CANCELLED` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `dealerscode` (`dealerscode`)
) ENGINE=InnoDB AUTO_INCREMENT=224 DEFAULT CHARSET=utf8;

-- Dumping data for table panda_dev.t_streamers: ~29 rows (approximately)
/*!40000 ALTER TABLE `t_streamers` DISABLE KEYS */;
REPLACE INTO `t_streamers` (`id`, `dealerscode`, `languages`, `status`, `likes`, `live_viewers`, `table_location`, `CANCELLED`) VALUES
	(195, 327, 'cn', 0, 1, 0, 'E3', 0),
	(196, 538, 'cn', 0, 0, 0, 'E5', 0),
	(197, 575, 'cn', 0, 0, 0, '', 0),
	(198, 576, 'cn', 0, 0, 0, '', 0),
	(199, 609, 'cn', 0, 0, 0, '', 0),
	(200, 649, 'cn', 0, 0, 0, '', 0),
	(201, 673, 'cn', 0, 0, 0, '', 0),
	(202, 686, 'cn', 0, 0, 0, '', 0),
	(203, 704, 'cn', 0, 0, 0, '', 0),
	(204, 708, 'cn', 0, 0, 0, '', 0),
	(205, 685, 'cn', 0, 0, 0, '', 0),
	(206, 730, 'cn', 0, 0, 0, '', 0),
	(207, 743, 'cn', 0, 0, 0, '', 0),
	(208, 742, 'cn', 0, 0, 0, '', 0),
	(209, 787, 'cn', 0, 0, 0, '', 0),
	(210, 790, 'cn', 0, 0, 0, '', 0),
	(211, 856, 'cn', 0, 0, 0, '', 0),
	(212, 545, 'cn', 0, 0, 0, '', 0),
	(213, 592, 'cn', 0, 0, 0, '', 0),
	(214, 615, 'jp', 0, 0, 0, '', 0),
	(215, 719, 'jp', 0, 0, 0, '', 0),
	(216, 739, 'jp', 0, 0, 0, '', 0),
	(217, 614, 'jp', 0, 0, 0, '', 0),
	(218, 879, 'jp', 0, 0, 0, '', 0),
	(219, 880, 'jp', 0, 0, 0, '', 0),
	(220, 875, 'jp', 0, 0, 0, '', 0),
	(221, 876, 'jp', 0, 0, 0, '', 0),
	(222, 877, 'jp', 0, 0, 0, '', 0),
	(223, 878, 'jp', 0, 0, 0, '', 0);
/*!40000 ALTER TABLE `t_streamers` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
