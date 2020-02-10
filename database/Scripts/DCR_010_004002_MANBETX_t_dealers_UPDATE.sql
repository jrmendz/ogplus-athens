
/**************************** Script Header ******************************/
SET @File_script_name := 'DCR_010_004002_MANBETX_t_dealers_UPDATE.sql';
SET @Author_Name := 'Alfie Salano';
SET @Database_Version := '1.0';
SET @Change_request_cd := 'C-004001';
SET @Script_Description :='Add new Dealers Name';
SET @Rollback_Script_name := 'ROLLBACK_DCR_010_004002_MANBETX_t_dealers_UPDATE.sql';

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
	(278, 931, 'CASPILLO,  JACQUILYN JOY', 'Vana', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/vana.png', 'https://static.oriental-game.com/dealers/grand/vana.png', 'https://static.oriental-game.com/dealers/prestige/vana.png', 'https://static.hzgelf.com/dealers/manbetx/vana.png', 'https://static.oriental-game.com/dealers/emcee/vana.jpg', 'en', 'Lobby'),
	(279, 932, 'REYES,  IVA', 'Chzl', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/chzl.png', 'https://static.oriental-game.com/dealers/grand/chzl.png', 'https://static.oriental-game.com/dealers/prestige/chzl.png', 'https://static.hzgelf.com/dealers/manbetx/chzl.png', 'https://static.oriental-game.com/dealers/emcee/chzl.jpg', 'en', 'Lobby'),
	(280, 933, 'CAJURAO,  HANNAH CLARISSE', 'Noah', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/noah.png', 'https://static.oriental-game.com/dealers/grand/noah.png', 'https://static.oriental-game.com/dealers/prestige/noah.png', 'https://static.hzgelf.com/dealers/manbetx/noah.png', 'https://static.oriental-game.com/dealers/emcee/noah.jpg', 'en', 'Lobby'),
	(281, 934, 'ESTRELLA,  VENUS', 'Kych', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/kych.png', 'https://static.oriental-game.com/dealers/grand/kych.png', 'https://static.oriental-game.com/dealers/prestige/kych.png', 'https://static.hzgelf.com/dealers/manbetx/kych.png', 'https://static.oriental-game.com/dealers/emcee/kych.jpg', 'en', 'Lobby'),
	(282, 935, 'GOLIN,  RAVEN MAE', 'Kira', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/kira.png', 'https://static.oriental-game.com/dealers/grand/kira.png', 'https://static.oriental-game.com/dealers/prestige/kira.png', 'https://static.hzgelf.com/dealers/manbetx/kira.png', 'https://static.oriental-game.com/dealers/emcee/kira.jpg', 'en', 'Lobby'),
	(283, 936, 'MENDOZA,  EVANGELINE', 'Breona', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/breona.png', 'https://static.oriental-game.com/dealers/grand/breona.png', 'https://static.oriental-game.com/dealers/prestige/breona.png', 'https://static.hzgelf.com/dealers/manbetx/breona.png', 'https://static.oriental-game.com/dealers/emcee/breona.jpg', 'en', 'Lobby');

/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);


/**************************** End of Script ******************************/