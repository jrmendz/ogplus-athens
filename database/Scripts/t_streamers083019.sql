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
  `image` text,
  `languages` text,
  `status` tinyint(1) DEFAULT '0',
  `likes` int(11) DEFAULT '0',
  `live_viewers` int(11) DEFAULT '0',
  `table_location` varchar(20) DEFAULT 'Lobby',
  `CANCELLED` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `dealerscode` (`dealerscode`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8;

-- Dumping data for table panda_dev.t_streamers: ~24 rows (approximately)
/*!40000 ALTER TABLE `t_streamers` DISABLE KEYS */;
REPLACE INTO `t_streamers` (`id`, `dealerscode`, `image`, `languages`, `status`, `likes`, `live_viewers`, `table_location`, `CANCELLED`) VALUES
	(4, 683, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'jp', 1, 1, 0, 'E5', 0),
	(5, 719, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'jp', 0, 0, 0, 'Lobby', 0),
	(6, 614, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'jp', 0, 0, 0, 'Lobby', 0),
	(7, 739, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'jp', 0, 0, 0, 'Lobby', 0),
	(8, 592, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'kr', 0, 0, 0, 'Lobby', 0),
	(9, 545, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'kr', 0, 0, 0, 'Lobby', 0),
	(10, 327, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(11, 538, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(12, 575, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(13, 576, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(14, 609, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'MX1', 0),
	(15, 649, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(16, 673, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(17, 686, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(18, 704, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'P7', 0),
	(19, 708, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(20, 685, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(21, 730, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(22, 743, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(23, 742, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 1, 0, 0, 'E3', 0),
	(24, 787, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'MX1', 0),
	(25, 788, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(26, 790, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'cn', 0, 0, 0, 'Lobby', 0),
	(35, 615, 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'jp', 0, 0, 0, 'Lobby', 0);
/*!40000 ALTER TABLE `t_streamers` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
