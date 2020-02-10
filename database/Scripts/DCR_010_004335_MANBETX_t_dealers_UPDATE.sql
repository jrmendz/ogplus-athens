
/**************************** Script Header ******************************/
SET @File_script_name := 'DCR_010_004335_MANBETX_t_dealers_UPDATE.sql';
SET @Author_Name := 'Alfie Salano';
SET @Database_Version := '1.0';
SET @Change_request_cd := 'C-004335';
SET @Script_Description :='Add new Dealers Name';
SET @Rollback_Script_name := 'ROLLBACK_DCR_010_004335_MANBETX_t_dealers_REMOVE.sql';

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
	(286, 937, 'MENDOZA,  EVANGELINE', 'Breona', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/breona.png', 'https://static.oriental-game.com/dealers/grand/breona.png', 'https://static.oriental-game.com/dealers/prestige/breona.png', 'https://static.hzgelf.com/dealers/manbetx/breona.png', 'https://static.oriental-game.com/dealers/emcee/breona.jpg', 'en', 'Lobby'),
	(287, 938, 'EDORIA,  JEANE PAULINE', 'Pau', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/pau.png', 'https://static.oriental-game.com/dealers/grand/pau.png', 'https://static.oriental-game.com/dealers/prestige/pau.png', 'https://static.hzgelf.com/dealers/manbetx/pau.png', 'https://static.oriental-game.com/dealers/emcee/pau.jpg', 'en', 'Lobby'),
	(288, 939, 'PIING,  NORHAINA', 'Hains', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/hains.png', 'https://static.oriental-game.com/dealers/grand/hains.png', 'https://static.oriental-game.com/dealers/prestige/hains.png', 'https://static.hzgelf.com/dealers/manbetx/hains.png', 'https://static.oriental-game.com/dealers/emcee/hains.jpg', 'en', 'Lobby'),
	(289, 940, 'IKEDA,  ERICE', 'Eri', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/eri.png', 'https://static.oriental-game.com/dealers/grand/eri.png', 'https://static.oriental-game.com/dealers/prestige/eri.png', 'https://static.hzgelf.com/dealers/manbetx/eri.png', 'https://static.oriental-game.com/dealers/emcee/eri.jpg', 'JAP\r', 'Lobby'),
	(290, 941, 'LEE,  YI JEN ALBEE', 'Albee', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/albee.png', 'https://static.oriental-game.com/dealers/grand/albee.png', 'https://static.oriental-game.com/dealers/prestige/albee.png', 'https://static.hzgelf.com/dealers/manbetx/albee.png', 'https://static.oriental-game.com/dealers/emcee/albee.jpg', 'CH\r', 'Lobby'),
	(291, 942, 'CHEN,  WAN YU ZOE', 'Zoe', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/zoe.png', 'https://static.oriental-game.com/dealers/grand/zoe.png', 'https://static.oriental-game.com/dealers/prestige/zoe.png', 'https://static.hzgelf.com/dealers/manbetx/zoe.png', 'https://static.oriental-game.com/dealers/emcee/zoe.jpg', 'CH\r', 'Lobby'),
	(292, 943, 'RONSAIRO,  TRISHA JEAN', 'Mia', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/mia.png', 'https://static.oriental-game.com/dealers/grand/mia.png', 'https://static.oriental-game.com/dealers/prestige/mia.png', 'https://static.hzgelf.com/dealers/manbetx/mia.png', 'https://static.oriental-game.com/dealers/emcee/mia.jpg', 'en', 'Lobby'),
	(293, 944, 'RACO,  NOVHIE', 'Noviel', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/noviel.png', 'https://static.oriental-game.com/dealers/grand/noviel.png', 'https://static.oriental-game.com/dealers/prestige/noviel.png', 'https://static.hzgelf.com/dealers/manbetx/noviel.png', 'https://static.oriental-game.com/dealers/emcee/noviel.jpg', 'en', 'Lobby'),
	(294, 945, 'CALABIT,  ALYSSA', 'Khalifa', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/khalifa.png', 'https://static.oriental-game.com/dealers/grand/khalifa.png', 'https://static.oriental-game.com/dealers/prestige/khalifa.png', 'https://static.hzgelf.com/dealers/manbetx/khalifa.png', 'https://static.oriental-game.com/dealers/emcee/khalifa.jpg', 'en', 'Lobby'),
	(295, 946, 'PUNZALAN,  JEANIBE', 'Freia', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/freia.png', 'https://static.oriental-game.com/dealers/grand/freia.png', 'https://static.oriental-game.com/dealers/prestige/freia.png', 'https://static.hzgelf.com/dealers/manbetx/freia.png', 'https://static.oriental-game.com/dealers/emcee/freia.jpg', 'en', 'Lobby'),
	(296, 947, 'ANGON,  REIAND', 'Attarah', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/attarah.png', 'https://static.oriental-game.com/dealers/grand/attarah.png', 'https://static.oriental-game.com/dealers/prestige/attarah.png', 'https://static.hzgelf.com/dealers/manbetx/attarah.png', 'https://static.oriental-game.com/dealers/emcee/attarah.jpg', 'en', 'Lobby'),
	(297, 948, 'ELIZARDE,  LOVELY JOY', 'Daniel', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/daniel.png', 'https://static.oriental-game.com/dealers/grand/daniel.png', 'https://static.oriental-game.com/dealers/prestige/daniel.png', 'https://static.hzgelf.com/dealers/manbetx/daniel.png', 'https://static.oriental-game.com/dealers/emcee/daniel.jpg', 'en', 'Lobby'),
	(298, 949, 'HERRERA,  KIMBERLY', 'Stacy', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/stacy.png', 'https://static.oriental-game.com/dealers/grand/stacy.png', 'https://static.oriental-game.com/dealers/prestige/stacy.png', 'https://static.hzgelf.com/dealers/manbetx/stacy.png', 'https://static.oriental-game.com/dealers/emcee/stacy.jpg', 'en', 'Lobby'),
	(299, 950, 'MARTINEZ,  LEIZLE', 'Lei', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/lei.png', 'https://static.oriental-game.com/dealers/grand/lei.png', 'https://static.oriental-game.com/dealers/prestige/lei.png', 'https://static.hzgelf.com/dealers/manbetx/lei.png', 'https://static.oriental-game.com/dealers/emcee/lei.jpg', 'en', 'Lobby');

/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);


/**************************** End of Script ******************************/