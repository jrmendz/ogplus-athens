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


-- Dumping structure for table panda_dev.t_game_banner
DROP TABLE IF EXISTS `t_game_banner`;
CREATE TABLE IF NOT EXISTS `t_game_banner` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `bannerimage` varchar(50) DEFAULT NULL,
  `position` int(10) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

-- Dumping data for table panda_dev.t_game_banner: ~3 rows (approximately)
/*!40000 ALTER TABLE `t_game_banner` DISABLE KEYS */;
REPLACE INTO `t_game_banner` (`id`, `bannerimage`, `position`, `created_at`) VALUES
	(1, '223-ttt', 3, '2019-10-04 10:55:43'),
	(2, '223-gets', 2, '2019-10-04 12:31:38'),
	(3, '223-morningJoy', 3, '2019-10-04 11:01:20');
/*!40000 ALTER TABLE `t_game_banner` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
