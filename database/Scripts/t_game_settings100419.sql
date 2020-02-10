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


-- Dumping structure for table panda_dev.t_game_settings
DROP TABLE IF EXISTS `t_game_settings`;
CREATE TABLE IF NOT EXISTS `t_game_settings` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `music_url` varchar(50) DEFAULT NULL,
  `languagesid` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- Dumping data for table panda_dev.t_game_settings: ~3 rows (approximately)
/*!40000 ALTER TABLE `t_game_settings` DISABLE KEYS */;
REPLACE INTO `t_game_settings` (`id`, `music_url`, `languagesid`) VALUES
	(1, 'Test', 1),
	(2, 'musicurl', 3),
	(3, 'Test', 1);
/*!40000 ALTER TABLE `t_game_settings` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
