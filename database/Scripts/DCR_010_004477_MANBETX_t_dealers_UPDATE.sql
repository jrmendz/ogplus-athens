
/**************************** Script Header ******************************/
SET @File_script_name := 'DCR_010_004477_MANBETX_t_dealers_UPDATE.sql';
SET @Author_Name := 'Alfie Salano';
SET @Database_Version := '1.0';
SET @Change_request_cd := 'C-004477';
SET @Script_Description :='Add new Dealers Name';
SET @Rollback_Script_name := 'ROLLBACK_DCR_010_004477_MANBETX_t_dealers_REMOVE.sql';

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
	(300, 951, 'RIVERA,  MA LOURDES', 'crissa', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/crissa.png', 'https://static.oriental-game.com/dealers/grand/crissa.png', 'https://static.oriental-game.com/dealers/prestige/crissa.png', 'https://static.hzgelf.com/dealers/manbetx/crissa.png', 'https://static.oriental-game.com/dealers/emcee/crissa.jpg', 'en', 'Lobby'),
	(301, 952, 'VARGAS,  EDELWEISS', 'faith', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/faith.png', 'https://static.oriental-game.com/dealers/grand/faith.png', 'https://static.oriental-game.com/dealers/prestige/faith.png', 'https://static.hzgelf.com/dealers/manbetx/faith.png', 'https://static.oriental-game.com/dealers/emcee/faith.jpg', 'en', 'Lobby'),
	(302, 953, 'GARCIA,  ANGELA MARTHA', 'trish', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/trish.png', 'https://static.oriental-game.com/dealers/grand/trish.png', 'https://static.oriental-game.com/dealers/prestige/trish.png', 'https://static.hzgelf.com/dealers/manbetx/trish.png', 'https://static.oriental-game.com/dealers/emcee/trish.jpg', 'en', 'Lobby'),
	(303, 954, 'AGUIRRE,  JANA MAE', 'jana', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/jana.png', 'https://static.oriental-game.com/dealers/grand/jana.png', 'https://static.oriental-game.com/dealers/prestige/jana.png', 'https://static.hzgelf.com/dealers/manbetx/jana.png', 'https://static.oriental-game.com/dealers/emcee/jana.jpg', 'en', 'Lobby'),
	(304, 955, 'ASTORGA,  CHRISTINE ANN', 'belle', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/belle.png', 'https://static.oriental-game.com/dealers/grand/belle.png', 'https://static.oriental-game.com/dealers/prestige/belle.png', 'https://static.hzgelf.com/dealers/manbetx/belle.png', 'https://static.oriental-game.com/dealers/emcee/belle.jpg', 'en', 'Lobby'),
	(305, 956, 'MANGANTI,  TRIXIE MAE', 'bea', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/bea.png', 'https://static.oriental-game.com/dealers/grand/bea.png', 'https://static.oriental-game.com/dealers/prestige/bea.png', 'https://static.hzgelf.com/dealers/manbetx/bea.png', 'https://static.oriental-game.com/dealers/emcee/bea.jpg', 'en', 'Lobby'),
	(306, 516, 'ANASCO,  ELY ROSE', 'keziah', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/keziah.png', 'https://static.oriental-game.com/dealers/grand/keziah.png', 'https://static.oriental-game.com/dealers/prestige/keziah.png', 'https://static.hzgelf.com/dealers/manbetx/keziah.png', 'https://static.oriental-game.com/dealers/emcee/keziah.jpg', 'en', 'Lobby'),
	(307, 518, 'GALANG,  SUSHMITA', 'Tasha', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/tasha.png', 'https://static.oriental-game.com/dealers/grand/tasha.png', 'https://static.oriental-game.com/dealers/prestige/tasha.png', 'https://static.hzgelf.com/dealers/manbetx/tasha.png', 'https://static.oriental-game.com/dealers/emcee/tasha.jpg', 'en', 'Lobby'),
	(308, 554, 'ONG,  ROSE ANTONETTE', 'toni', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/toni.png', 'https://static.oriental-game.com/dealers/grand/toni.png', 'https://static.oriental-game.com/dealers/prestige/toni.png', 'https://static.hzgelf.com/dealers/manbetx/toni.png', 'https://static.oriental-game.com/dealers/emcee/toni.jpg', 'en', 'Lobby'),
	(309, 560, 'SANTIAGO,  EVA ROSE', 'Miyana', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/miyana.png', 'https://static.oriental-game.com/dealers/grand/miyana.png', 'https://static.oriental-game.com/dealers/prestige/miyana.png', 'https://static.hzgelf.com/dealers/manbetx/miyana.png', 'https://static.oriental-game.com/dealers/emcee/miyana.jpg', 'en', 'Lobby'),
	(310, 623, 'DELA CRUZ,  ANGEL', 'lindsey', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/lindsey.png', 'https://static.oriental-game.com/dealers/grand/lindsey.png', 'https://static.oriental-game.com/dealers/prestige/lindsey.png', 'https://static.hzgelf.com/dealers/manbetx/lindsey.png', 'https://static.oriental-game.com/dealers/emcee/lindsey.jpg', 'en', 'Lobby'),
	(311, 691, 'TRANSFIGURACION,  JANNIA', 'Heart', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/heart.png', 'https://static.oriental-game.com/dealers/grand/heart.png', 'https://static.oriental-game.com/dealers/prestige/heart.png', 'https://static.hzgelf.com/dealers/manbetx/heart.png', 'https://static.oriental-game.com/dealers/emcee/heart.jpg', 'en', 'Lobby'),
	(312, 694, 'ESCAMILLA,  JERALD', 'Lexi', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/lexi.png', 'https://static.oriental-game.com/dealers/grand/lexi.png', 'https://static.oriental-game.com/dealers/prestige/lexi.png', 'https://static.hzgelf.com/dealers/manbetx/lexi.png', 'https://static.oriental-game.com/dealers/emcee/lexi.jpg', 'en', 'Lobby'),
	(313, 747, 'CRISOSTOMO,  KATYA', 'Hellia', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/hellia.png', 'https://static.oriental-game.com/dealers/grand/hellia.png', 'https://static.oriental-game.com/dealers/prestige/hellia.png', 'https://static.hzgelf.com/dealers/manbetx/hellia.png', 'https://static.oriental-game.com/dealers/emcee/hellia.jpg', 'en', 'Lobby'),
	(314, 757, 'SAN LUIS,  SHERMAGNE', 'Sasha', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/sasha.png', 'https://static.oriental-game.com/dealers/grand/sasha.png', 'https://static.oriental-game.com/dealers/prestige/sasha.png', 'https://static.hzgelf.com/dealers/manbetx/sasha.png', 'https://static.oriental-game.com/dealers/emcee/sasha.jpg', 'en', 'Lobby'),
	(315, 786, 'PANTOJA,  BLESSIE', 'Blessy', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/blessy.png', 'https://static.oriental-game.com/dealers/grand/blessy.png', 'https://static.oriental-game.com/dealers/prestige/blessy.png', 'https://static.hzgelf.com/dealers/manbetx/blessy.png', 'https://static.oriental-game.com/dealers/emcee/blessy.jpg', 'en', 'Lobby');

/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);


/**************************** End of Script ******************************/