
/**************************** Script Header ******************************/
SET @File_script_name := 'DCR_010_005398_MANBETX_t_dealers_UPDATE.sql';
SET @Author_Name := 'Alfie Salano';
SET @Database_Version := '1.0';
SET @Change_request_cd := 'C-005398';
SET @Script_Description :='Add new Dealers Name';
SET @Rollback_Script_name := 'ROLLBACK_DCR_010_005398_ManbetX_t_dealers_REMOVE.sql';

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

REPLACE INTO `t_dealers` (`dealerscode`, `fullname`, `nickname`, `height`, `vitalstats`, `hobbies`, `birthday`, `followers`, `imageclassic`, `imagegrand`, `imageprestige`, `imagemanbetx`, `imagestreamer`, `languages`, `tableLocation`) VALUES	
	(123, 'ACARION,  JOMERA', 'MHIRA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/mhira.png', 'https://static.oriental-game.com/dealers/grand/mhira.png', 'https://static.oriental-game.com/dealers/prestige/mhira.png', 'https://static.hzgelf.com/dealers/manbetx/mhira.png', 'https://static.oriental-game.com/dealers/emcee/mhira.jpg', 'cn', 'Lobby'),
	(101, 'BALDONADO,  NISSA GOLD', 'TAYLOR', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/taylor.png', 'https://static.oriental-game.com/dealers/grand/taylor.png', 'https://static.oriental-game.com/dealers/prestige/taylor.png', 'https://static.hzgelf.com/dealers/manbetx/taylor.png', 'https://static.oriental-game.com/dealers/emcee/taylor.jpg', 'en', 'Lobby'),
	(102, 'BILO,  CHRISTELLE', 'KENDAL', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/kendal.png', 'https://static.oriental-game.com/dealers/grand/kendal.png', 'https://static.oriental-game.com/dealers/prestige/kendal.png', 'https://static.hzgelf.com/dealers/manbetx/kendal.png', 'https://static.oriental-game.com/dealers/emcee/kendal.jpg', 'en', 'Lobby'),
	(103, 'PIPO,  FAMELA MAY', 'MAY', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/may.png', 'https://static.oriental-game.com/dealers/grand/may.png', 'https://static.oriental-game.com/dealers/prestige/may.png', 'https://static.hzgelf.com/dealers/manbetx/may.png', 'https://static.oriental-game.com/dealers/emcee/may.jpg', 'en', 'Lobby'),
	(104, 'LUMBERA,  JHICEL', 'JHICEL', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/jhicel.png', 'https://static.oriental-game.com/dealers/grand/jhicel.png', 'https://static.oriental-game.com/dealers/prestige/jhicel.png', 'https://static.hzgelf.com/dealers/manbetx/jhicel.png', 'https://static.oriental-game.com/dealers/emcee/jhicel.jpg', 'en', 'Lobby'),
	(105, 'AUSTERO,  ELOISA', 'ZARI', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/zari.png', 'https://static.oriental-game.com/dealers/grand/zari.png', 'https://static.oriental-game.com/dealers/prestige/zari.png', 'https://static.hzgelf.com/dealers/manbetx/zari.png', 'https://static.oriental-game.com/dealers/emcee/zari.jpg', 'en', 'Lobby'),
	(106, 'MARAMBA,  LIBERTY', 'JUSTICE', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/justice.png', 'https://static.oriental-game.com/dealers/grand/justice.png', 'https://static.oriental-game.com/dealers/prestige/justice.png', 'https://static.hzgelf.com/dealers/manbetx/justice.png', 'https://static.oriental-game.com/dealers/emcee/justice.jpg', 'en', 'Lobby'),
	(107, 'GUILLEMER,  ANGELICA', 'ANJIE', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/anjie.png', 'https://static.oriental-game.com/dealers/grand/anjie.png', 'https://static.oriental-game.com/dealers/prestige/anjie.png', 'https://static.hzgelf.com/dealers/manbetx/anjie.png', 'https://static.oriental-game.com/dealers/emcee/anjie.jpg', 'en', 'Lobby'),
	(108, 'ABANO,  ARMAINE SARAH', 'MAINE', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/maine.png', 'https://static.oriental-game.com/dealers/grand/maine.png', 'https://static.oriental-game.com/dealers/prestige/maine.png', 'https://static.hzgelf.com/dealers/manbetx/maine.png', 'https://static.oriental-game.com/dealers/emcee/maine.jpg', 'en', 'Lobby'),
	(109, 'AZUSANO,  AIRLENE', 'AMI', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/ami.png', 'https://static.oriental-game.com/dealers/grand/ami.png', 'https://static.oriental-game.com/dealers/prestige/ami.png', 'https://static.hzgelf.com/dealers/manbetx/ami.png', 'https://static.oriental-game.com/dealers/emcee/ami.jpg', 'en', 'Lobby'),
	(110, 'CAM,  JENNYMEI', 'MISTY', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/misty.png', 'https://static.oriental-game.com/dealers/grand/misty.png', 'https://static.oriental-game.com/dealers/prestige/misty.png', 'https://static.hzgelf.com/dealers/manbetx/misty.png', 'https://static.oriental-game.com/dealers/emcee/misty.jpg', 'en', 'Lobby'),
	(111, 'CARAAN,  CATHERINE JANICE', 'SYDNEY', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/sydney.png', 'https://static.oriental-game.com/dealers/grand/sydney.png', 'https://static.oriental-game.com/dealers/prestige/sydney.png', 'https://static.hzgelf.com/dealers/manbetx/sydney.png', 'https://static.oriental-game.com/dealers/emcee/sydney.jpg', 'en', 'Lobby'),
	(112, 'CANELLADA,  MIA', 'AZI', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/azi.png', 'https://static.oriental-game.com/dealers/grand/azi.png', 'https://static.oriental-game.com/dealers/prestige/azi.png', 'https://static.hzgelf.com/dealers/manbetx/azi.png', 'https://static.oriental-game.com/dealers/emcee/azi.jpg', 'en', 'Lobby'),
	(113, 'DELA CRUZ,  MIKAELA', 'JOSSA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/jossa.png', 'https://static.oriental-game.com/dealers/grand/jossa.png', 'https://static.oriental-game.com/dealers/prestige/jossa.png', 'https://static.hzgelf.com/dealers/manbetx/jossa.png', 'https://static.oriental-game.com/dealers/emcee/jossa.jpg', 'en', 'Lobby'),
	(114, 'DELA CRUS,  MARIELLE ANNE', 'BLISS', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/bliss.png', 'https://static.oriental-game.com/dealers/grand/bliss.png', 'https://static.oriental-game.com/dealers/prestige/bliss.png', 'https://static.hzgelf.com/dealers/manbetx/bliss.png', 'https://static.oriental-game.com/dealers/emcee/bliss.jpg', 'en', 'Lobby'),
	(116, 'INGCO,  MARIA ROXANNA ROSETTE', 'LA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/la.png', 'https://static.oriental-game.com/dealers/grand/la.png', 'https://static.oriental-game.com/dealers/prestige/la.png', 'https://static.hzgelf.com/dealers/manbetx/la.png', 'https://static.oriental-game.com/dealers/emcee/la.jpg', 'en', 'Lobby'),
	(117, 'OLAVARIO,  ALAISA', 'KELSEY', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/kelsey.png', 'https://static.oriental-game.com/dealers/grand/kelsey.png', 'https://static.oriental-game.com/dealers/prestige/kelsey.png', 'https://static.hzgelf.com/dealers/manbetx/kelsey.png', 'https://static.oriental-game.com/dealers/emcee/kelsey.jpg', 'en', 'Lobby'),
	(118, 'PANTE,  GLENEL', 'AZALEA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/azalea.png', 'https://static.oriental-game.com/dealers/grand/azalea.png', 'https://static.oriental-game.com/dealers/prestige/azalea.png', 'https://static.hzgelf.com/dealers/manbetx/azalea.png', 'https://static.oriental-game.com/dealers/emcee/azalea.jpg', 'en', 'Lobby'),
	(119, 'POLVITO,  CHELLEVIN', 'MOON', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/moon.png', 'https://static.oriental-game.com/dealers/grand/moon.png', 'https://static.oriental-game.com/dealers/prestige/moon.png', 'https://static.hzgelf.com/dealers/manbetx/moon.png', 'https://static.oriental-game.com/dealers/emcee/moon.jpg', 'en', 'Lobby'),
	(121, 'TEJUCO,  KEIGH', 'KIARA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/kiara.png', 'https://static.oriental-game.com/dealers/grand/kiara.png', 'https://static.oriental-game.com/dealers/prestige/kiara.png', 'https://static.hzgelf.com/dealers/manbetx/kiara.png', 'https://static.oriental-game.com/dealers/emcee/kiara.jpg', 'en', 'Lobby'),
	(122, 'TUAZO,  CHERMAINE', 'AKISHA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/akisha.png', 'https://static.oriental-game.com/dealers/grand/akisha.png', 'https://static.oriental-game.com/dealers/prestige/akisha.png', 'https://static.hzgelf.com/dealers/manbetx/akisha.png', 'https://static.oriental-game.com/dealers/emcee/akisha.jpg', 'en', 'Lobby'),
	(124, 'BORAL,  RAMZ THEA', 'RAMONA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/ramona.png', 'https://static.oriental-game.com/dealers/grand/ramona.png', 'https://static.oriental-game.com/dealers/prestige/ramona.png', 'https://static.hzgelf.com/dealers/manbetx/ramona.png', 'https://static.oriental-game.com/dealers/emcee/ramona.jpg', 'en', 'Lobby'),
	(125, 'ANGELES,  MARY CRISTINE MAE', 'ELLA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/ella.png', 'https://static.oriental-game.com/dealers/grand/ella.png', 'https://static.oriental-game.com/dealers/prestige/ella.png', 'https://static.hzgelf.com/dealers/manbetx/ella.png', 'https://static.oriental-game.com/dealers/emcee/ella.jpg', 'en', 'Lobby'),
	(126, 'CANQUE,  ELMAE ALAMILLO', 'KIERRA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/kierra.png', 'https://static.oriental-game.com/dealers/grand/kierra.png', 'https://static.oriental-game.com/dealers/prestige/kierra.png', 'https://static.hzgelf.com/dealers/manbetx/kierra.png', 'https://static.oriental-game.com/dealers/emcee/kierra.jpg', 'en', 'Lobby'),
	(128, 'MONTEMAYOR,  RICA MAY', 'LOISA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/loisa.png', 'https://static.oriental-game.com/dealers/grand/loisa.png', 'https://static.oriental-game.com/dealers/prestige/loisa.png', 'https://static.hzgelf.com/dealers/manbetx/loisa.png', 'https://static.oriental-game.com/dealers/emcee/loisa.jpg', 'en', 'Lobby'),
	(130, 'GALLARDO,  ROCHELLE', 'CHENG', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/cheng.png', 'https://static.oriental-game.com/dealers/grand/cheng.png', 'https://static.oriental-game.com/dealers/prestige/cheng.png', 'https://static.hzgelf.com/dealers/manbetx/cheng.png', 'https://static.oriental-game.com/dealers/emcee/cheng.jpg', 'en', 'Lobby'),
	(131, 'RAMIREZ,  ANNE NICOLE', 'RACHEL', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/rachel.png', 'https://static.oriental-game.com/dealers/grand/rachel.png', 'https://static.oriental-game.com/dealers/prestige/rachel.png', 'https://static.hzgelf.com/dealers/manbetx/rachel.png', 'https://static.oriental-game.com/dealers/emcee/rachel.jpg', 'en', 'Lobby'),
	(132, 'RABANAL,  CIELA MAE', 'SHIELA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/shiela.png', 'https://static.oriental-game.com/dealers/grand/shiela.png', 'https://static.oriental-game.com/dealers/prestige/shiela.png', 'https://static.hzgelf.com/dealers/manbetx/shiela.png', 'https://static.oriental-game.com/dealers/emcee/shiela.jpg', 'en', 'Lobby'),
	(133, 'SANCHEZ,  ERICKA ROSE', 'LEA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/lea.png', 'https://static.oriental-game.com/dealers/grand/lea.png', 'https://static.oriental-game.com/dealers/prestige/lea.png', 'https://static.hzgelf.com/dealers/manbetx/lea.png', 'https://static.oriental-game.com/dealers/emcee/lea.jpg', 'en', 'Lobby'),
	(135, 'ANIMAS,  GIMELLE', 'MIEL', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/miel.png', 'https://static.oriental-game.com/dealers/grand/miel.png', 'https://static.oriental-game.com/dealers/prestige/miel.png', 'https://static.hzgelf.com/dealers/manbetx/miel.png', 'https://static.oriental-game.com/dealers/emcee/miel.jpg', 'en', 'Lobby'),
	(129, 'CHUA,  JENELYN', 'MORITA', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/morita.png', 'https://static.oriental-game.com/dealers/grand/morita.png', 'https://static.oriental-game.com/dealers/prestige/morita.png', 'https://static.hzgelf.com/dealers/manbetx/morita.png', 'https://static.oriental-game.com/dealers/emcee/morita.jpg', 'jp', 'Lobby'),
	(136, 'DE LEON,  IRISH', 'REIKO', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/reiko.png', 'https://static.oriental-game.com/dealers/grand/reiko.png', 'https://static.oriental-game.com/dealers/prestige/reiko.png', 'https://static.hzgelf.com/dealers/manbetx/reiko.png', 'https://static.oriental-game.com/dealers/emcee/reiko.jpg', 'jp', 'Lobby'),
	(134, 'CHEN,  PIN YEN CANDY', 'CANDY', '5\'0', '0 A, 0 0', '', '1900-01-01', 0, 'https://static.oriental-game.com/dealers/classic/candy.png', 'https://static.oriental-game.com/dealers/grand/candy.png', 'https://static.oriental-game.com/dealers/prestige/candy.png', 'https://static.hzgelf.com/dealers/manbetx/candy.png', 'https://static.oriental-game.com/dealers/emcee/candy.jpg', 'cn', 'Lobby');	
	
/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);


/**************************** End of Script ******************************/