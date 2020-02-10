
/**************************** Script Header ******************************/
SET @File_script_name := 'DCR_010_004251_OGPLUS_t_dealers_UPDATE.sql';
SET @Author_Name := 'Alfie Salano';
SET @Database_Version := '1.0';
SET @Change_request_cd := 'C-004251';
SET @Script_Description :='Add new Dealers Name';
SET @Rollback_Script_name := 'ROLLBACK_DCR_010_004251_OGPLUS_t_dealers_UPDATE .sql';

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

REPLACE INTO `t_dealers` (`id`, `dealerscode`, `fullname`, `nickname`, `height`, `vitalstats`, `hobbies`, `birthday`, `followers`, `imageclassic`, `imagegrand`, `imageprestige`, `imagemanbetx`, `imagestreamer`, `languages`, `tableLocation`) VALUES	
	(283, 936, 'MACAWILI,  GEMMA', 'kourtney', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/kourtney.png', 'https://static.oriental-game.com/dealers/grand/kourtney.png', 'https://static.oriental-game.com/dealers/prestige/kourtney.png', 'https://static.hzgelf.com/dealers/manbetx/kourtney.png', 'https://static.oriental-game.com/dealers/emcee/kourtney.jpg', 'en', 'Lobby'),
	(285, 468, 'DELA CRUZ,  JANEL', 'ja', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/ja.png', 'https://static.oriental-game.com/dealers/grand/ja.png', 'https://static.oriental-game.com/dealers/prestige/ja.png', 'https://static.hzgelf.com/dealers/manbetx/ja.png', 'https://static.oriental-game.com/dealers/emcee/ja.jpg', 'en', 'Lobby');

/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);


/**************************** End of Script ******************************/