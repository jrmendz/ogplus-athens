/**************************** Script Header ******************************/
SET @File_script_name := 'DCR_000_000000_OGPLUS_t_settings_CREATE.sql';
SET @Author_Name := 'Alvin Phoebe Artemis Valdez';
SET @Database_Version := '1.0';
SET @Change_request_cd := 'C-000000';
SET @Script_Description :='Create New Table for Settings';
SET @Rollback_Script_name := 'ROLLBACK_DCR_000_000000_OGPLUS_t_settings_CREATE.sql.sql';

/********************** Constants No change here **************************/

SELECT DATABASE() INTO @database_name;

CALL `utility`.`sp_script_log_insert`(
	@File_script_name,
	@Author_Name,
	@Database_Version,
	@database_name,
	@Change_request_cd,
	@Script_Description,
	@Rollback_Script_name,
	@script_log_id
);

/**************************** Main Script Here ******************************/

DROP TABLE IF EXISTS `t_settings`;
CREATE TABLE IF NOT EXISTS `t_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting` varchar(50) DEFAULT NULL,
  `description` text,
  `value` text,
  `start_effectivity` timestamp NULL DEFAULT NULL COMMENT 'UTC Format',
  `end_effectivity` timestamp NULL DEFAULT NULL COMMENT 'UTC Format',
  `index` int(11) DEFAULT NULL,
  `CANCELLED` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;


DELETE FROM `t_settings`;

INSERT INTO `t_settings` (`id`, `setting`, `description`, `value`, `start_effectivity`, `end_effectivity`, `index`, `CANCELLED`) VALUES
	(1, 'minBetLimit', 'Default Minimum Bet', '"0"', NULL, NULL, NULL, 0),
	(2, 'maxBetLimit', 'Default Maximum Bet', '"0"', NULL, NULL, NULL, 0),
	(3, 'minBetToChat', 'Minimum balance to send chat', '"100"', NULL, NULL, NULL, 0),
	(4, 'otherLimit', 'Other bet limits', '"{}"', NULL, NULL, NULL, 0),
	(5, 'ads', 'Advertisment like banners', '"{\\"default\\":[],\\"lobby\\":[]}"', NULL, NULL, NULL, 0),
	(6, 'music', 'Music related settings', '"{\\"useMainAsBGMusic\\":true,\\"main\\":\\"\\",\\"baccarat\\":\\"\\",\\"dragontiger\\":\\"\\",\\"moneywheel\\":\\"\\",\\"roulette\\":\\"\\",\\"niuniu\\":\\"\\",\\"threeCards\\":\\"\\"}"', NULL, NULL, NULL, 0),
	(7, 'liveTables', 'List of online tables', '"[\\"baccarat\\",\\"dragontiger\\",\\"moneywheel\\",\\"roulette\\"]"', NULL, NULL, NULL, 0),
	(8, 'event', 'List of events', '"{\\"active\\":false}"', NULL, NULL, NULL, 0),
	(9, 'dealer', 'Dealer configurations', '"{\\"custom\\":\\"\\",\\"imageFileType\\":\\".png\\",\\"defaultStudio\\":\\"manbetx\\",\\"defaultImageURL\\":\\"static/no-dealer.png\\",\\"url\\":\\"https://static.hzgelf.com/dealers/\\"}"', NULL, NULL, 0, 0),
	(10, 'maxDigitValue', 'Maximum chip to input', '"1000"', NULL, NULL, NULL, 0),
	(11, 'dealer', 'Dealer configurations (Santa)', '"{\\"custom\\":\\"santa\\",\\"imageFileType\\":\\".png\\",\\"defaultStudio\\":\\"manbetx\\",\\"defaultImageURL\\":\\"static/no-dealer.png\\",\\"url\\":\\"https://static.hzgelf.com/dealers/\\"}"', '2019-11-25 00:00:00', '2019-11-28 00:00:00', 0, 0),
	(12, 'dealer', 'Dealer configurations (MoonCake)', '"{\\"custom\\":\\"mooncake\\",\\"imageFileType\\":\\".png\\",\\"defaultStudio\\":\\"manbetx\\",\\"defaultImageURL\\":\\"static/no-dealer.png\\",\\"url\\":\\"https://static.hzgelf.com/dealers/\\"}"', '2020-02-01 00:00:00', '2020-03-01 00:00:00', 0, 0);


/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);


/**************************** End of Script ******************************/