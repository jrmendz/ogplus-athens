-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.3.15-MariaDB-log - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             10.1.0.5464
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;


-- Dumping database structure for panda_dev
CREATE DATABASE IF NOT EXISTS `panda_dev` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `panda_dev`;

-- Dumping structure for table panda_dev.c_betplace
CREATE TABLE IF NOT EXISTS `c_betplace` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bet_place` varchar(255) DEFAULT NULL,
  `gamecode_id` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `bet_place` (`bet_place`),
  KEY `bet_place_2` (`bet_place`,`gamecode_id`),
  KEY `gamecode_id` (`gamecode_id`)
) ENGINE=InnoDB AUTO_INCREMENT=185 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.c_gamecodes
CREATE TABLE IF NOT EXISTS `c_gamecodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gamecode` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `gamecode_UNIQUE` (`gamecode`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.c_log_category
CREATE TABLE IF NOT EXISTS `c_log_category` (
  `id` int(25) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.c_resultlist
CREATE TABLE IF NOT EXISTS `c_resultlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `result` varchar(255) DEFAULT NULL,
  `prefix` char(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `result` (`result`),
  KEY `prefix` (`prefix`),
  KEY `result_2` (`result`,`prefix`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.c_shoehand
CREATE TABLE IF NOT EXISTS `c_shoehand` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shoehandnumber` varchar(255) DEFAULT NULL,
  `shoe` int(11) DEFAULT NULL,
  `round` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `shoehandnumber` (`shoehandnumber`)
) ENGINE=InnoDB AUTO_INCREMENT=402800 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.c_tablelist
CREATE TABLE IF NOT EXISTS `c_tablelist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gamename` text DEFAULT NULL,
  `tablenumber` varchar(10) DEFAULT NULL,
  `cn_video` text DEFAULT NULL,
  `sea_video` text DEFAULT NULL,
  `nea_video` text DEFAULT NULL,
  `max_time` smallint(6) DEFAULT NULL,
  `game_code_id` int(11) DEFAULT NULL,
  `meta` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `subcode` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `tablenumber` (`tablenumber`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_announcement
CREATE TABLE IF NOT EXISTS `t_announcement` (
  `Id` int(10) NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `TableNumberId` int(11) DEFAULT NULL,
  `Announcement` mediumtext NOT NULL,
  `StartDate` datetime DEFAULT current_timestamp(),
  `EndDate` datetime DEFAULT NULL,
  `UpdatedBy` int(11) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_betdetails
CREATE TABLE IF NOT EXISTS `t_betdetails` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bet_code` varchar(50) DEFAULT NULL,
  `bet_amount` decimal(25,5) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `betplace_id` int(11) DEFAULT NULL,
  `effective_bet_amount` decimal(25,5) DEFAULT NULL,
  `shoehand_id` int(11) DEFAULT NULL,
  `gameset_id` int(11) DEFAULT NULL,
  `table_id` int(11) DEFAULT NULL,
  `balance` decimal(25,5) DEFAULT NULL,
  `win_loss` decimal(25,5) DEFAULT NULL,
  `result_id` int(11) DEFAULT NULL,
  `resultlist_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `bet_date` date DEFAULT NULL,
  `super_six` tinyint(4) DEFAULT 0,
  `is_sidebet` tinyint(4) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `bet_code` (`bet_code`),
  KEY `shoehand_id` (`shoehand_id`,`table_id`),
  KEY `win_loss` (`win_loss`),
  KEY `user_id` (`user_id`,`table_id`),
  KEY `user_id_2` (`user_id`,`win_loss`),
  KEY `betplace_id` (`betplace_id`,`shoehand_id`,`table_id`,`bet_date`),
  KEY `betplace_id_2` (`betplace_id`,`shoehand_id`,`table_id`),
  KEY `bet_date` (`bet_date`),
  KEY `user_id_3` (`user_id`,`betplace_id`,`shoehand_id`,`table_id`,`result_id`,`resultlist_id`,`bet_date`),
  KEY `user_id_4` (`user_id`,`betplace_id`,`shoehand_id`,`table_id`,`balance`,`result_id`,`resultlist_id`,`updated_at`,`bet_date`),
  KEY `user_id_5` (`user_id`,`shoehand_id`,`table_id`,`bet_date`),
  KEY `gameset_id` (`gameset_id`),
  KEY `result_id` (`result_id`,`created_at`),
  KEY `win_loss_2` (`win_loss`,`created_at`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=509 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_chat
CREATE TABLE IF NOT EXISTS `t_chat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` text CHARACTER SET utf8 DEFAULT NULL,
  `table_number` text CHARACTER SET utf8 DEFAULT NULL,
  `message` varchar(45) CHARACTER SET utf8 DEFAULT NULL,
  `cancelled` tinyint(4) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cancelled` (`cancelled`)
) ENGINE=InnoDB AUTO_INCREMENT=536 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin COMMENT='Chat records';

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_chat_block_words
CREATE TABLE IF NOT EXISTS `t_chat_block_words` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `words` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_dealers
CREATE TABLE IF NOT EXISTS `t_dealers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dealerscode` double DEFAULT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `height` varchar(255) DEFAULT NULL,
  `vitalstats` varchar(255) DEFAULT NULL,
  `hobbies` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `imagegrand` varchar(255) DEFAULT NULL,
  `imageprestige` varchar(255) DEFAULT NULL,
  `imageclassic` varchar(255) DEFAULT NULL,
  `languages` varchar(255) DEFAULT NULL,
  `tableLocation` varchar(50) DEFAULT 'Lobby',
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `dealerscode` (`dealerscode`),
  UNIQUE KEY `fullname` (`fullname`)
) ENGINE=InnoDB AUTO_INCREMENT=268 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_dealer_gift
CREATE TABLE IF NOT EXISTS `t_dealer_gift` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL DEFAULT 0,
  `dealer_id` int(11) NOT NULL DEFAULT 0,
  `gift_name` varchar(255) COLLATE utf32_bin NOT NULL DEFAULT '0',
  `gift_price` int(11) NOT NULL DEFAULT 0,
  `table_id` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `t_dealer_gift_user_id_idx` (`user_id`),
  KEY `t_dealer_gift_dealer_id_idx` (`dealer_id`),
  KEY `t_dealer_gift_table_id_idx` (`table_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf32 COLLATE=utf32_bin COMMENT='Gifts given to each dealer';

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_follow_dealers
CREATE TABLE IF NOT EXISTS `t_follow_dealers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dealerscode` double DEFAULT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `height` varchar(255) DEFAULT NULL,
  `vitalstats` varchar(255) DEFAULT NULL,
  `hobbies` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `followers` double DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `dealerscode` (`dealerscode`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=318 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_follow_users
CREATE TABLE IF NOT EXISTS `t_follow_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `follow_user_id` double DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `followers` double DEFAULT NULL,
  `logged` double DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  KEY `follow_user_id` (`follow_user_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=373 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_gameset
CREATE TABLE IF NOT EXISTS `t_gameset` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shoehand_id` int(11) DEFAULT NULL,
  `table_number` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `shoehand_id` (`shoehand_id`)
) ENGINE=InnoDB AUTO_INCREMENT=193910 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_game_values
CREATE TABLE IF NOT EXISTS `t_game_values` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `values` text COLLATE utf32_bin NOT NULL,
  `game_type` int(11) NOT NULL,
  `result_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_t_game_values_result_id_idx` (`result_id`)
) ENGINE=InnoDB AUTO_INCREMENT=193992 DEFAULT CHARSET=utf32 COLLATE=utf32_bin;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_logs
CREATE TABLE IF NOT EXISTS `t_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `directory` varchar(50) NOT NULL DEFAULT '0',
  `log_info` text DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `log_category_id` int(2) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_pitboss
CREATE TABLE IF NOT EXISTS `t_pitboss` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pitboss_code` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_code` (`pitboss_code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_pitboss_log
CREATE TABLE IF NOT EXISTS `t_pitboss_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pitboss_id` int(11) NOT NULL,
  `table_id` int(11) DEFAULT NULL,
  `request` varchar(255) DEFAULT NULL,
  `response` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_results
CREATE TABLE IF NOT EXISTS `t_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `resultlist_id` double DEFAULT NULL,
  `shoehand_id` double DEFAULT NULL,
  `shoe_date` varchar(255) DEFAULT NULL,
  `shoeset_id` int(25) DEFAULT NULL,
  `table_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=193990 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_shoeset
CREATE TABLE IF NOT EXISTS `t_shoeset` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shoe` int(11) DEFAULT 0,
  `table_id` int(11) DEFAULT 0,
  `shoedate` int(11) DEFAULT 0,
  `created_at` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_streamers
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

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_streamers_gift
CREATE TABLE IF NOT EXISTS `t_streamers_gift` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `streamer_id` int(11) unsigned DEFAULT NULL,
  `gift_name` text DEFAULT NULL,
  `gift_price` double DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `CANCELLED` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK_t_streamers_gift_t_streamers` (`streamer_id`),
  CONSTRAINT `FK_t_streamers_gift_t_streamers` FOREIGN KEY (`streamer_id`) REFERENCES `t_streamers` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_transfer_records
CREATE TABLE IF NOT EXISTS `t_transfer_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transferId` varchar(50) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `amount` decimal(25,5) DEFAULT 0.00000,
  `actions` varchar(10) DEFAULT 'IN',
  `currency` varchar(10) DEFAULT NULL,
  `balance` decimal(25,5) DEFAULT 0.00000,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
-- Dumping structure for table panda_dev.t_user
CREATE TABLE IF NOT EXISTS `t_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8 NOT NULL,
  `password` varchar(255) CHARACTER SET utf8 NOT NULL,
  `nickname` varchar(255) CHARACTER SET utf8 NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8 NOT NULL,
  `balance` decimal(25,5) NOT NULL DEFAULT 0.00000,
  `avatar_pc` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT 'https://og-333.s3.amazonaws.com/panda/assets/avatar/avtr_05.png',
  `avatar_mobile` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT 'https://og-333.s3.amazonaws.com/panda/assets/avatar/avtr_05.png',
  `wins` int(11) NOT NULL DEFAULT 0,
  `win_amount` decimal(25,5) NOT NULL DEFAULT 0.00000,
  `followers` int(11) NOT NULL DEFAULT 0,
  `is_trial` tinyint(4) NOT NULL DEFAULT 0,
  `is_sidebet` tinyint(4) NOT NULL DEFAULT 0,
  `logged` tinyint(4) NOT NULL DEFAULT 0,
  `user_settings` longtext CHARACTER SET utf8 DEFAULT NULL,
  `disabled` tinyint(4) NOT NULL DEFAULT 0,
  `table_location` varchar(50) CHARACTER SET utf8 NOT NULL DEFAULT 'Lobby',
  `create_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `update_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `currency` varchar(255) CHARACTER SET utf8 NOT NULL,
  `winningstreak` int(11) DEFAULT NULL,
  `min_bet_limit` decimal(25,5) DEFAULT 0.00000,
  `max_bet_limit` decimal(25,5) DEFAULT 0.00000,
  `is_admin` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `nickname` (`nickname`),
  KEY `is_sidebet` (`is_sidebet`,`logged`),
  KEY `is_sidebet_2` (`is_sidebet`,`logged`,`table_location`),
  KEY `currency` (`currency`)
) ENGINE=InnoDB AUTO_INCREMENT=439 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Data exporting was unselected.
-- Dumping structure for procedure panda_dev.ALL_BETS_PER_GAMESET
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `ALL_BETS_PER_GAMESET`(
	IN `BET_DATE` VARCHAR(25),
	IN `USER_ID` INT,
	IN `TABLE_ID` INT
,
	IN `GAMESET` INT

)
BEGIN
	SET @totalBetsToday := (SELECT COALESCE(SUM(bd.bet_amount), 0) FROM t_betdetails bd WHERE bd.user_id = USER_ID AND bd.table_id = TABLE_ID AND bd.gameset_id = GAMESET);
   SELECT USER_ID as user_id, TABLE_ID as table_id, @totalBetsToday as totalBetsToday, BET_DATE as bet_date;
END//
DELIMITER ;

-- Dumping structure for procedure panda_dev.BETS_RANK
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `BETS_RANK`(
	IN `__TOTAL_BET_AMOUNT` DECIMAL(25,5),
	IN `__USER_ID` INT,
	IN `__TABLE_ID` INT,
	IN `__GAME_SET` INT













)
    DETERMINISTIC
    COMMENT 'This will return ranking incl. highest bidder, bet percentage and total player bets'
proc_label:BEGIN
	-- Declaration
	DECLARE USER_BALANCE DECIMAL(25,5) DEFAULT 0;
	DECLARE GAME_CODE_ID INT DEFAULT NULL;
	DECLARE GAME_TABLE_NUMBER TEXT DEFAULT NULL;
	DECLARE GAME_NAME TEXT DEFAULT NULL;
	DECLARE GAME_CODE TEXT DEFAULT NULL;
	
	-- Pre-setting variables
	SELECT t0.balance INTO USER_BALANCE FROM t_user t0 WHERE t0.id = __USER_ID LIMIT 1;
	SELECT t1.gamecode, t1.id, t0.gamename, t0.tablenumber INTO GAME_CODE, GAME_CODE_ID, GAME_NAME, GAME_TABLE_NUMBER FROM c_tablelist t0 LEFT JOIN c_gamecodes t1 ON t0.game_code_id = t1.id WHERE t0.id = __TABLE_ID LIMIT 1;
 	
 	-- Check if the Player balance is sufficient
 	IF (__TOTAL_BET_AMOUNT > USER_BALANCE) THEN
 		LEAVE proc_label;
 	END IF;
 	
 	-- Update Player Balance
	UPDATE t_user t0 SET t0.balance = (USER_BALANCE - __TOTAL_BET_AMOUNT) WHERE t0.id = __USER_ID;
 	
 	-- Return Game Highest Bidder
	IF GAME_CODE = 'baccarat' THEN
		-- <<< ARRAY [0] >>> 
		SELECT * FROM (
	   	-- Banker Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 1 AND (t1.gameset_id = __GAME_SET OR t1.gameset_id IS NULL) ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- Player Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 2 AND (t1.gameset_id = __GAME_SET OR t1.gameset_id IS NULL) ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- Tie Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 3 AND (t1.gameset_id = __GAME_SET OR t1.gameset_id IS NULL) ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- Super Six Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 26 AND (t1.gameset_id = __GAME_SET OR t1.gameset_id IS NULL) ORDER BY bet_amount DESC LIMIT 1)
		) BACC;

	ELSEIF GAME_CODE = 'dragontiger' THEN
		-- <<< ARRAY [0] >>> 
		SELECT * FROM (
	   	-- Tie Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 4 AND (t1.gameset_id = __GAME_SET OR t1.gameset_id IS NULL) ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- Dragon Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 5 AND (t1.gameset_id = __GAME_SET OR t1.gameset_id IS NULL) ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- Tiger Highest Bidder
			(SELECT t0.gamecode_id, t0.bet_place, t1.user_id, t1.gameset_id, t2.nickname, t2.avatar_pc as imgname, SUM(t1.bet_amount) as bet_amount FROM c_betplace t0 LEFT JOIN t_betdetails t1 ON t0.id = t1.betplace_id LEFT JOIN t_user t2 ON t1.user_id = t2.id WHERE t0.id = 6 AND (t1.gameset_id = __GAME_SET OR t1.gameset_id IS NULL) ORDER BY bet_amount DESC LIMIT 1)
		) DRAG;
	ELSE
		-- Return empty result
		-- <<< ARRAY [0] >>> 
		SELECT NULL LIMIT 0;	
	END IF;
	
	-- Total Players and Bets
	-- <<< ARRAY [1] >>>
	SELECT
		IF(bp.bet_place = 'dt-tie', 'tie', bp.bet_place) as bet_place,
		IFNULL(SUM(bd.bet_amount), 0) as total_bets,
		COUNT(DISTINCT bd.user_id) as total_users
	FROM 
		c_gamecodes gc 
		LEFT JOIN c_betplace bp ON gc.id = bp.gamecode_id 
		LEFT JOIN t_betdetails bd ON bp.id = bd.betplace_id AND bd.table_id = __TABLE_ID AND bd.gameset_id = __GAME_SET
	WHERE 
		gc.id = GAME_CODE_ID
	GROUP BY 
		bp.bet_place;
	
	-- Return table name	
	-- <<< ARRAY [2] >>>	
	SELECT 
		GAME_NAME AS 'game', 
		GAME_CODE AS 'gameCode',
		(USER_BALANCE - __TOTAL_BET_AMOUNT) AS 'newBalance',
		GAME_TABLE_NUMBER AS 'tableNumber';
END//
DELIMITER ;

-- Dumping structure for procedure panda_dev.BETS_SAVE
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `BETS_SAVE`(
	IN `__CHIP_VALUE` DECIMAL(25,5),
	IN `__TOTAL_BET_AMOUNT` DECIMAL(25,5),
	IN `__USER_ID` INT,
	IN `__BET_AREA` TEXT,
	IN `__GAME_SET` TEXT,
	IN `__TABLE_ID` INT,
	IN `__SUPER_SIX` INT





)
    DETERMINISTIC
    COMMENT 'This will process to save your chips/bets.'
proc_label:BEGIN
	-- Declaration
	DECLARE GAME_CODE TEXT DEFAULT NULL;
	DECLARE GAME_CODE_ID INT DEFAULT NULL;
	DECLARE BET_AREA_ID TEXT DEFAULT NULL;
	DECLARE BET_GAME_SET_ID INT DEFAULT NULL;
	DECLARE BET_SHOE_HAND_ID INT DEFAULT NULL;
	DECLARE USER_BALANCE DECIMAL(25,5) DEFAULT 0;
	
	-- Game Information
	SELECT gc.gamecode, gc.id INTO GAME_CODE, GAME_CODE_ID FROM c_tablelist t LEFT JOIN c_gamecodes gc ON gc.id = t.game_code_id WHERE t.id = __TABLE_ID LIMIT 1;

	-- Pre-setting variables
	IF GAME_CODE = 'dragontiger' AND __BET_AREA = 'tie' THEN SET __BET_AREA = 'dt-tie'; END IF;
	
  	SELECT t0.id INTO BET_AREA_ID FROM c_betplace t0 WHERE t0.bet_place = __BET_AREA LIMIT 1;
  	SELECT t0.id, t0.shoehand_id INTO BET_GAME_SET_ID, BET_SHOE_HAND_ID FROM t_gameset t0 WHERE t0.id = __GAME_SET LIMIT 1;
	SELECT (t0.balance - __TOTAL_BET_AMOUNT) AS balance INTO USER_BALANCE FROM t_user t0 WHERE t0.id = __USER_ID LIMIT 1;
	
	-- Stop executing procedure once the user balance is 0
	IF USER_BALANCE < 0 THEN
		LEAVE proc_label;
	END IF;

	-- Insert Bet Information
	INSERT INTO t_betdetails (
		bet_amount,
		bet_code,
		user_id,
		betplace_id,
		shoehand_id,
		gameset_id,
		table_id,
		balance,
		bet_date,
		super_six
	) VALUES (
		__CHIP_VALUE,
		CONCAT(GAME_CODE_ID, LPAD(BET_SHOE_HAND_ID, 5, '0'), LPAD(DATE_FORMAT(NOW(), "%j"), 3, '0'), LPAD(FLOOR(RAND() * 999), 3, '0'), LPAD(FLOOR(RAND() * 99), 2, '0')),
		__USER_ID,
		BET_AREA_ID,
		BET_SHOE_HAND_ID,
		BET_GAME_SET_ID,
		__TABLE_ID,
		USER_BALANCE,
		CURDATE(),
		__SUPER_SIX
	);

	-- <<< ARRAY [0] >>> 
	-- Return Bet Information
	SELECT
		t0.id,
		t0.user_id,
		t0.bet_code,
		t0.bet_amount,
		t0.balance,
		t0.betplace_id,
		t0.shoehand_id,
		t0.table_id,
		t0.bet_date
	FROM
		t_betdetails t0
	WHERE
		t0.id = LAST_INSERT_ID();
		
END//
DELIMITER ;

-- Dumping structure for procedure panda_dev.CREATE_BETTING_DETAILS_DEPRECIATED
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `CREATE_BETTING_DETAILS_DEPRECIATED`(
	IN `BET_AMOUNT` DECIMAL(25,5),
	IN `TOTAL` DECIMAL(25,5),
	IN `USER_ID` INT,
	IN `BET_PLACE` VARCHAR(255),
	IN `GAMESET` VARCHAR(255),
	IN `TABLE_ID` INT,
	IN `BET_DATE` VARCHAR(255),
	IN `IS_END` BOOLEAN,
	IN `SUPER_SIX` INT























)
    DETERMINISTIC
    COMMENT '[DEPRECIATED]'
proc_label : BEGIN
	-- Declarations
	DECLARE P_AMOUNT, B_AMOUNT, S6_AMOUNT, D_AMOUNT, T_AMOUNT DOUBLE DEFAULT 0;
	DECLARE P_HIGH_ID, B_HIGH_ID, S6_HIGH_ID, D_HIGH_ID, T_HIGH_ID  INT DEFAULT NULL;

	-- Game Information
	SELECT gc.gamecode, gc.id INTO @gamecode, @gamecode_id FROM c_tablelist t LEFT JOIN c_gamecodes gc ON gc.id = t.game_code_id WHERE t.id = TABLE_ID LIMIT 1;

	IF @gamecode = 'dragontiger' AND BET_PLACE = 'tie' THEN
		SET BET_PLACE = 'dt-tie';
  END IF;

	SET @USER_CREATED_AT := (SELECT u.create_at FROM t_user u WHERE u.id = USER_ID LIMIT 1);
	SET @BET_PLACE_ID := (SELECT bp.id FROM c_betplace bp WHERE bp.bet_place = BET_PLACE LIMIT 1);
	SET @GAMESET_ID := (SELECT gs.id FROM t_gameset gs WHERE gs.id = GAMESET LIMIT 1);
	SET @SHOE_HAND_ID := (SELECT gs.shoehand_id FROM t_gameset gs WHERE gs.id = GAMESET LIMIT 1);
	SET @BALANCE := (SELECT u.balance FROM t_user u WHERE u.id = USER_ID LIMIT 1);
	SET @BALANCE := @BALANCE - TOTAL;

	IF @BALANCE < 0 THEN
		LEAVE proc_label;
  END IF;

	-- Insert Bet Information
	INSERT INTO t_betdetails (
    bet_amount,
    user_id,
    betplace_id,
    shoehand_id,
    gameset_id,
    table_id,
    balance,
    bet_date,
    super_six
  ) VALUES (
		BET_AMOUNT,
    USER_ID,
    @BET_PLACE_ID,
    @SHOE_HAND_ID,
    @GAMESET_ID,
    TABLE_ID,
    @BALANCE,
    CURDATE(),
		SUPER_SIX
  );

	SET @ID := LAST_INSERT_ID();

	UPDATE t_betdetails SET
		bet_code = CONCAT(@gamecode_id, LPAD(@SHOE_HAND_ID, 5, '0'), LPAD(DATE_FORMAT(NOW(), "%j"), 3, '0'), LPAD(FLOOR(RAND() * 89999), 5, '0'))
	WHERE
		id = @ID;

  -- >>> [0]
  -- Return Bet Information
	SELECT
		bd.bet_amount,
		bd.balance,
		bd.user_id as user_id,
		bd.betplace_id,
		bd.shoehand_id,
		bd.table_id,
		bd.bet_code,
		bd.bet_date
	FROM
		t_betdetails bd
  WHERE
		bd.id = @ID;



	IF IS_END = TRUE THEN
		-- Update Balance
	UPDATE t_user u SET u.balance = @BALANCE WHERE u.id = USER_ID;
		-- Highest Bidder
    SET @tablenumber = (SELECT t.tablenumber FROM c_tablelist t WHERE t.id = TABLE_ID);

		-- Return Game Highest Bidder
		IF @gamecode = 'baccarat' THEN
			-- Banker Highest Bidder
			SELECT SUM(bd.bet_amount) as total_bet, u.id INTO B_AMOUNT, B_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = @GAMESET_ID AND bd.betplace_id = 1 AND bd.table_id = TABLE_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
			-- Player Highest Bidder
			SELECT SUM(bd.bet_amount) as total_bet, u.id INTO P_AMOUNT, P_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = @GAMESET_ID AND bd.betplace_id = 2 AND bd.table_id = TABLE_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
			-- Super Six Highest Bidder
			SELECT SUM(bd.bet_amount) as total_bet, u.id INTO S6_AMOUNT, S6_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = @GAMESET_ID AND bd.betplace_id = 26 AND bd.table_id = TABLE_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
			-- Return Highest Bidder for Baccarat
			-- >>> [1]
			SELECT B_HIGH_ID as banker, B_AMOUNT as banker_amount, P_HIGH_ID as player, P_AMOUNT as player_amount, S6_HIGH_ID as super_six, S6_AMOUNT as super_six_amount;

		ELSEIF @gamecode = 'dragontiger' THEN
			-- Dragon Highest Bidder
			SELECT SUM(bd.bet_amount) as total_bet, u.id INTO D_AMOUNT, D_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = @GAMESET_ID AND bd.betplace_id = 5 AND bd.table_id = TABLE_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
			-- Tiger Highest Bidder
			SELECT SUM(bd.bet_amount) as total_bet, u.id INTO T_AMOUNT,  T_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = @GAMESET_ID AND bd.betplace_id = 6 AND bd.table_id = TABLE_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
			-- Return Highest Bidder for Dragon-Tiger
			-- >>> [1]
			SELECT T_HIGH_ID as tiger, T_AMOUNT as tiger_amount, D_HIGH_ID as dragon, D_AMOUNT as dragon_amount;

		ELSEIF @gamecode = 'moneywheel' THEN
			-- Not implemented in moneywheel
			SET @nothing = null;
			-- >>> [1]
			SELECT @nothing as nothing;
		END IF;

  	-- Bet Percentages
		SET @total_bets = (SELECT SUM(bd.bet_amount) FROM t_betdetails bd LEFT JOIN c_betplace bp ON bp.id = bd.betplace_id WHERE bd.table_id = TABLE_ID AND bd.gameset_id = @GAMESET_ID AND bp.bet_place IN ('banker', 'player','tie', 'dragon', 'tiger', 'dt-tie'));

	-- >>> [2]
		SELECT 
			IF(bp.bet_place = 'dt-tie', 'tie', bp.bet_place) as bet_place, 
			IFNULL(TRUNCATE(SUM(bd.bet_amount) / @total_bets * 100, 0), 0) as bet_percentage
      FROM c_betplace bp LEFT JOIN t_betdetails bd ON bd.betplace_id = bp.id AND bd.table_id = TABLE_ID AND bd.gameset_id = @GAMESET_ID
		WHERE bp.bet_place IN ('banker', 'tie', 'player', 'dragon', 'tiger', 'dt-tie') AND bp.gamecode_id = @gamecode_id GROUP BY bp.id;
  END IF;

	-- [3]
  SELECT @tablenumber as tableNumber;

	IF IS_END = TRUE THEN -- end of the loop
		-- The number of bets and the number of users who bet
		-- >>> [4]
		SELECT 
			IF(bp.bet_place = 'dt-tie', 'tie', bp.bet_place) as bet_place, 
			IFNULL(SUM(bd.bet_amount), 0) as total_bets, 
			COUNT(DISTINCT bd.user_id) as total_users 
		FROM c_gamecodes gc LEFT JOIN c_betplace bp ON gc.id = bp.gamecode_id LEFT JOIN t_betdetails bd ON bp.id = bd.betplace_id AND bd.table_id = TABLE_ID AND bd.gameset_id = @GAMESET_ID WHERE gc.id= @gamecode_id GROUP BY bp.bet_place;
		SELECT t.gamename as game FROM c_tablelist t WHERE t.id = TABLE_ID;
  END IF;
END//
DELIMITER ;

-- Dumping structure for procedure panda_dev.GET_BET_INFO_UPON_ENTER
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_BET_INFO_UPON_ENTER`(
	IN `_tableNumber` VARCHAR(50),
	IN `_gameSet` INT



)
    DETERMINISTIC
    COMMENT 'This includes the Highest Bidder, percentages and player upon entering the table'
BEGIN
	DECLARE P_AMOUNT, B_AMOUNT, S6_AMOUNT, D_AMOUNT, T_AMOUNT, TI_AMOUNT DOUBLE DEFAULT 0;
	DECLARE P_HIGH_ID, B_HIGH_ID, S6_HIGH_ID, D_HIGH_ID, T_HIGH_ID, TI_HIGH_ID INT DEFAULT NULL;
	DECLARE TBL_CODE TEXT DEFAULT NULL;
	DECLARE TBL_GAMECODE, TBL_ID INT DEFAULT NULL;

	-- PRE-SETTING IMPORTANT VARIABLE
	SELECT t1.gamecode, t1.id, t0.id INTO TBL_CODE, TBL_GAMECODE, TBL_ID FROM c_tablelist t0 LEFT JOIN c_gamecodes t1 ON t0.game_code_id = t1.id WHERE t0.tablenumber = _tableNumber LIMIT 1;

	-- HIGHEST BIDDER
	IF TBL_CODE = 'baccarat' THEN
		-- Banker Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO B_AMOUNT, B_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 1 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Player Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO P_AMOUNT, P_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 2 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Tie Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO TI_AMOUNT, TI_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 3 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Super Six Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO S6_AMOUNT, S6_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 26 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Return Highest Bidder for Baccarat
		SELECT
			B_HIGH_ID as banker,
			B_AMOUNT as banker_amount,
			P_HIGH_ID as player,
			P_AMOUNT as player_amount,
			TI_HIGH_ID as tie,
			TI_AMOUNT as tie_amount,
			S6_HIGH_ID as super_six,
			S6_AMOUNT as super_six_amount;

	ELSEIF TBL_CODE = 'dragontiger' THEN
		-- Dragon Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO D_AMOUNT, D_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 5 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Tiger Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO T_AMOUNT,  T_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 6 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Tie Highest Bidder
		SELECT SUM(bd.bet_amount) as total_bet, u.id INTO TI_AMOUNT, TI_HIGH_ID FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.gameset_id = _gameSet AND bd.betplace_id = 4 AND bd.table_id = TBL_ID GROUP BY bd.user_id ORDER BY total_bet DESC LIMIT 1;
		-- Return Highest Bidder for Dragon-Tiger
		SELECT
			T_HIGH_ID as tiger,
			T_AMOUNT as tiger_amount,
			TI_HIGH_ID as tie,
			TI_AMOUNT as tie_amount,
			D_HIGH_ID as dragon,
			D_AMOUNT as dragon_amount;
	ELSEIF TBL_CODE = 'moneywheel' THEN
		SELECT NULL AS '1', NULL AS '2', NULL AS '5', NULL AS '10', NULL AS '20', NULL AS 'og';
	END IF;

	-- BET PERCENTAGE
	SET @total_bets = (SELECT SUM(bd.bet_amount) FROM t_betdetails bd LEFT JOIN c_betplace bp ON bp.id = bd.betplace_id WHERE bd.table_id = TBL_ID AND bd.gameset_id = _gameSet AND bp.bet_place IN ('banker', 'player','tie', 'dragon', 'tiger', 'dt-tie', '1', '2', '5', '10', '20', 'og'));
	SELECT
		IF(bp.bet_place = 'dt-tie', 'tie', bp.bet_place) as bet_place,
		IFNULL(TRUNCATE(SUM(bd.bet_amount) / @total_bets * 100, 0), 0.00) as bet_percentage
   FROM c_betplace bp
		LEFT JOIN t_betdetails bd ON bd.betplace_id = bp.id AND bd.table_id = TBL_ID AND bd.gameset_id = _gameSet
	WHERE
		bp.bet_place IN ('banker', 'player','tie', 'dragon', 'tiger', 'dt-tie', '1', '2', '5', '10', '20', 'og')
		AND bp.gamecode_id = TBL_GAMECODE
	GROUP BY bp.id;

	-- TOTAL BET AMOUNT / PLAYERS
	SELECT
		IF(bp.bet_place = 'dt-tie', 'tie', bp.bet_place) as bet_place,
		IFNULL(ROUND(SUM(bd.bet_amount),2), 0.00) as total_bets,
		COUNT(DISTINCT bd.user_id) as total_users
	FROM
		c_gamecodes gc
		LEFT JOIN c_betplace bp ON gc.id = bp.gamecode_id
		LEFT JOIN t_betdetails bd ON bp.id = bd.betplace_id AND bd.table_id = TBL_ID AND bd.gameset_id = _gameSet
	WHERE
		gc.id= TBL_GAMECODE
	GROUP BY
		bp.bet_place;
END//
DELIMITER ;

-- Dumping structure for procedure panda_dev.GET_BET_RANKING_DEPRECIATED
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_BET_RANKING_DEPRECIATED`(
	IN `TABLEID` VARCHAR(50),
	IN `GAMESET` INT





)
    COMMENT 'Gets top bet per bet place in each gameset/shoehand'
BEGIN
	SET @gamecode := (SELECT gc.gamecode FROM c_tablelist tbl INNER JOIN c_gamecodes gc ON gc.id = tbl.game_code_id WHERE tbl.id = TABLEID);
	IF @gamecode = 'baccarat' THEN
	   SELECT * FROM (
	   	-- banker
			(SELECT bd.user_id, u.nickname, u.avatar_pc as imgname, SUM(bd.bet_amount) as bet_amount, bp.bet_place, bd.gameset_id FROM t_betdetails bd INNER JOIN c_betplace bp ON bd.betplace_id = bp.id INNER JOIN t_user u ON bd.user_id = u.id WHERE bd.gameset_id = GAMESET AND bd.betplace_id = 1 GROUP BY bd.user_id ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- player
			(SELECT bd.user_id, u.nickname, u.avatar_pc as imgname,  SUM(bd.bet_amount) as bet_amount, bp.bet_place, bd.gameset_id FROM t_betdetails bd INNER JOIN c_betplace bp ON bd.betplace_id = bp.id INNER JOIN t_user u ON bd.user_id = u.id WHERE bd.gameset_id = GAMESET AND bd.betplace_id = 2 GROUP BY bd.user_id ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- tie
			(SELECT bd.user_id, u.nickname, u.avatar_pc as imgname,  SUM(bd.bet_amount) as bet_amount, bp.bet_place, bd.gameset_id FROM t_betdetails bd INNER JOIN c_betplace bp ON bd.betplace_id = bp.id INNER JOIN t_user u ON bd.user_id = u.id WHERE bd.gameset_id = GAMESET AND bd.betplace_id = 3 GROUP BY bd.user_id ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- Super 6
			(SELECT bd.user_id, u.nickname, u.avatar_pc as imgname,  SUM(bd.bet_amount) as bet_amount, bp.bet_place, bd.gameset_id FROM t_betdetails bd INNER JOIN c_betplace bp ON bd.betplace_id = bp.id INNER JOIN t_user u ON bd.user_id = u.id WHERE bd.gameset_id = GAMESET AND bd.betplace_id = 26 GROUP BY bd.user_id ORDER BY bet_amount DESC LIMIT 1)
		) rb;
		--  rb stands for ranksBaccarat
	ELSEIF @gamecode = 'dragontiger' THEN
		SELECT * FROM (
	   	-- tie (dt-tie)
			(SELECT bd.user_id, u.nickname, u.avatar_pc as imgname, SUM(bd.bet_amount) as bet_amount, 'tie' as bet_place, bd.gameset_id FROM t_betdetails bd INNER JOIN c_betplace bp ON bd.betplace_id = bp.id INNER JOIN t_user u ON bd.user_id = u.id WHERE bd.gameset_id = GAMESET AND bd.betplace_id = 4 GROUP BY bd.user_id ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- dragon
			(SELECT bd.user_id, u.nickname, u.avatar_pc as imgname, SUM(bd.bet_amount) as bet_amount, bp.bet_place, bd.gameset_id FROM t_betdetails bd INNER JOIN c_betplace bp ON bd.betplace_id = bp.id INNER JOIN t_user u ON bd.user_id = u.id WHERE bd.gameset_id = GAMESET AND bd.betplace_id = 5 GROUP BY bd.user_id ORDER BY bet_amount DESC LIMIT 1)
			UNION
			-- tiger
			(SELECT bd.user_id, u.nickname, u.avatar_pc as imgname, SUM(bd.bet_amount) as bet_amount, bp.bet_place, bd.gameset_id FROM t_betdetails bd INNER JOIN c_betplace bp ON bd.betplace_id = bp.id INNER JOIN t_user u ON bd.user_id = u.id WHERE bd.gameset_id = GAMESET AND bd.betplace_id = 6 GROUP BY bd.user_id ORDER BY bet_amount DESC LIMIT 1)
		) rdt;
		--  rdt stands for ranksDragonTiger
	END IF;
END//
DELIMITER ;

-- Dumping structure for procedure panda_dev.GET_BET_TRANSACTION
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `GET_BET_TRANSACTION`(
	IN `START_DATE` DATE,
	IN `END_DATE` DATE,
	IN `PER_PAGE` INT,
	IN `PAGE` INT,
	IN `SHOE_HAND_NUMBER` VARCHAR(50),
	IN `TABLE_ID` INT,
	IN `USERNAME` VARCHAR(50),
	IN `CURRENCY` VARCHAR(50)





)
BEGIN
   SELECT `bd`.`bet_code` AS `bet_code`,`u`.`username` AS `username`,`u`.`currency` AS `currency`,`tl`.`id` AS `table_id`,`tl`.`tablenumber` AS `table_name`,capitalize(`tl`.`gamename`) AS `game_name`,`gc`.`gamecode` AS `game_code`,`sh`.`shoehandnumber` AS `shoehandnumber`,capitalize(`rl`.`result`) AS `result`,`tg`.`values` AS `game_result`,`bd`.`bet_amount` AS `bet_amount`,`bd`.`effective_bet_amount` AS `effective_bet_amount`,`bd`.`win_loss` AS `win_loss`, DATE_FORMAT(`bd`.`bet_date`,'%Y-%m-%d') AS `bet_date`,`bd`.`balance` AS `balance`, capitalize(IF((`bp`.`bet_place` = 'dt-tie'),'tie',`bp`.`bet_place`)) AS `bet_place`,`bp`.`id` AS `bet_place_id`,`bd`.`created_at` AS `created_at`,`bd`.`updated_at` AS `updated_at`
	FROM ((((((((`t_betdetails` `bd`
	LEFT JOIN `c_tablelist` `tl` ON((`bd`.`table_id` = `tl`.`id`)))
	LEFT JOIN `c_gamecodes` `gc` ON((`tl`.`game_code_id` = `gc`.`id`)))
	LEFT JOIN `t_user` `u` ON((`bd`.`user_id` = `u`.`id`)))
	LEFT JOIN `t_results` `r` ON((`bd`.`result_id` = `r`.`id`)))
	LEFT JOIN `c_betplace` `bp` ON((`bd`.`betplace_id` = `bp`.`id`)))
	LEFT JOIN `c_resultlist` `rl` ON((`r`.`resultlist_id` = `rl`.`id`)))
	LEFT JOIN `c_shoehand` `sh` ON((`bd`.`shoehand_id` = `sh`.`id`)))
	LEFT JOIN `t_game_values` `tg` ON((`bd`.`result_id` = `tg`.`result_id`)))
	WHERE `bd`.`bet_date` BETWEEN START_DATE AND END_DATE
	AND (SHOE_HAND_NUMBER IS NULL OR `sh`.`shoehandnumber` = SHOE_HAND_NUMBER)
	AND (TABLE_ID IS NULL OR `bd`.`table_id` = TABLE_ID)
	AND (USERNAME IS NULL OR `u`.`username` = USERNAME)
	AND (CURRENCY IS NULL OR `u`.`currency` = CURRENCY)
	ORDER BY `bd`.`updated_at` DESC,`bd`.`balance` DESC
	LIMIT PER_PAGE OFFSET PAGE;
END//
DELIMITER ;

-- Dumping structure for procedure panda_dev.STREAMER_TOP5
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `STREAMER_TOP5`()
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

-- Dumping structure for procedure panda_dev.TRANSACTION_HISTORY
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `TRANSACTION_HISTORY`(
	IN `_userID` INT,
	IN `_StartDate` DATETIME,
	IN `_EndDate` DATETIME,
	IN `_ShoeNumber` TEXT,
	IN `_TableID` INT,
	IN `_Limit` INT,
	IN `_Offset` INT











)
    DETERMINISTIC
    COMMENT 'Transaction history'
BEGIN
	# Pagination (Total Records)
	SELECT 
		COUNT(t0.id) as totalRows
	FROM 
		t_betdetails t0 
		LEFT JOIN c_shoehand t1 ON t0.shoehand_id = t1.id
	WHERE 
		t0.user_id = IFNULL(_userID, t0.user_id)
		AND t0.created_at BETWEEN DATE_FORMAT(_StartDate, '%Y-%m-%d 00:00:00') AND DATE_FORMAT(_EndDate, '%Y-%m-%d 23:59:59')
		AND t0.table_id = IFNULL(_TableID, t0.table_id)
		AND t1.shoehandnumber LIKE CONCAT(IFNULL(_ShoeNumber, t1.shoehandnumber),'%');
		
	# Records List
	SELECT 
		bt.id, 
		bt.bet_code, 
		bt.balance, 
		bt.win_loss, 
		bt.table_id, 
		bt.bet_amount,
		u.username,
		u.currency,
		bt.effective_bet_amount, 
		bt.created_at as bet_date, 
		s.shoehandnumber, 
		t.gamename, 
		t.tablenumber, 
		bp.bet_place, 
		rl.prefix as result,
		gc.gamecode,
		gv.`values` as gameValues
	FROM 
		t_betdetails bt 
		LEFT JOIN c_tablelist t ON t.id=bt.table_id 
		LEFT JOIN c_resultlist rl ON rl.id=bt.resultlist_id 
		LEFT JOIN c_shoehand s ON s.id=bt.shoehand_id 
		LEFT JOIN c_betplace bp ON bp.id=bt.betplace_id 
		LEFT JOIN c_gamecodes gc ON gc.id=bp.gamecode_id
		LEFT JOIN t_game_values gv ON gv.result_id=bt.result_id
		LEFT JOIN t_user u ON u.id=bt.user_id
	WHERE
		bt.user_id = IFNULL(_userID, bt.user_id)
		AND bt.created_at BETWEEN  DATE_FORMAT(_StartDate, '%Y-%m-%d 00:00:00') AND DATE_FORMAT(_EndDate, '%Y-%m-%d 23:59:59')
		AND bt.table_id = IFNULL(_TableID, bt.table_id)
		AND s.shoehandnumber LIKE CONCAT(IFNULL(_ShoeNumber, s.shoehandnumber),'%')
	ORDER BY
		bt.updated_at DESC
	LIMIT _Limit
	OFFSET _Offset
	;
END//
DELIMITER ;

-- Dumping structure for procedure panda_dev.TRANSACTION_RWL
DELIMITER //
CREATE DEFINER=`root`@`localhost` PROCEDURE `TRANSACTION_RWL`(
	IN `_userID` INT,
	IN `_StartDate` DATETIME,
	IN `_EndDate` DATETIME

)
    DETERMINISTIC
    COMMENT 'Summary of Rolling and Win/Loss'
BEGIN
	# Total Rolling and Win/Loss
	SELECT
		IFNULL(SUM(t0.effective_bet_amount), 0) as rolling,
		IFNULL(SUM(t0.win_loss), 0) as win_loss
	FROM
		t_betdetails t0
	WHERE
		t0.user_id = _userID
		AND t0.created_at BETWEEN _StartDate AND _EndDate;
END//
DELIMITER ;

-- Dumping structure for function panda_dev.capitalize
DELIMITER //
CREATE DEFINER=`root`@`localhost` FUNCTION `capitalize`(
	`s` varchar(255)


) RETURNS varchar(255) CHARSET utf8
BEGIN
  declare c int;
  declare x varchar(255);
  declare y varchar(255);
  declare z varchar(255);

  set x = UPPER( SUBSTRING( s, 1, 1));
  set y = lower(SUBSTR( s, 2));
  set c = instr( y, ' ');

  while c > 0
    do
      set z = SUBSTR( y, 1, c);
      set x = CONCAT( x, z);
      set z = UPPER( SUBSTR( y, c+1, 1));
      set x = CONCAT( x, z);
      set y = SUBSTR( y, c+2);
      set c = INSTR( y, ' ');     
  end while;
  set x = CONCAT(x, y);
  return replace(x, '_', ' ');
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
