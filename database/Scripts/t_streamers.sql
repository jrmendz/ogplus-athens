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

-- Dumping structure for table panda_dev.t_streamers
DROP TABLE IF EXISTS `t_streamers`;
CREATE TABLE IF NOT EXISTS `t_streamers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `streamer_code` int(11) DEFAULT NULL,
  `fullname` text DEFAULT NULL,
  `nickname` text DEFAULT NULL,
  `hobbies` text DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `video_url` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `language` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'ACTIVE',
  `CANCELLED` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;

-- Dumping data for table panda_dev.t_streamers: ~6 rows (approximately)
/*!40000 ALTER TABLE `t_streamers` DISABLE KEYS */;
REPLACE INTO `t_streamers` (`id`, `streamer_code`, `fullname`, `nickname`, `hobbies`, `birthday`, `video_url`, `image`, `language`, `status`, `CANCELLED`) VALUES
	(1, 8888, 'Fuji Ikonawa', 'Fuj', 'Playing Video Games', '1994-02-05', 'https://hk01.boxung.com:8788/hls/E1.m3u8', 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'CN', 'ACTIVE', 0),
	(2, 8889, 'Almeri Kumiwato', 'Meri', 'Anything', '2019-03-04', 'http://stream.oriental-game.com/hls/Ggame1table1.m3u8', 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'CN', 'ACTIVE', 0),
	(3, 8890, 'Kamato Tomato', 'Kamz', 'Anything', '2019-03-05', 'http://stream.oriental-game.com/hls/Ggame9table1.m3u8', 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'CN', 'BANNED', 0),
	(4, 8891, 'Sizhuka Kamatsi', 'Siz', 'Anything', '2019-03-05', 'http://stream.oriental-game.com/hls/Ggame5table1.m3u8', 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'CN', 'ACTIVE', 0),
	(5, 8892, 'Asiako Litsuku', 'Asia', 'Anything', NULL, 'http://stream.oriental-game.com/hls/Ggame10table1.m3u8', 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'CN', 'ACTIVE', 0),
	(6, 8892, 'Harshin Switkokski', 'Har', 'Anything', NULL, 'http://stream.oriental-game.com/hls/Ggame6table1.m3u8', 'https://www.orientalgame.com/wp-content/uploads/2018/08/og-live.jpg', 'UK', 'ACTIVE', 0);
/*!40000 ALTER TABLE `t_streamers` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
