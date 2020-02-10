
/**************************** Script Header ******************************/
SET @File_script_name := 'DCR_010_005007_OGPLUS_t_dealers_UPDATE.sql';
SET @Author_Name := 'Alfie Salano';
SET @Database_Version := '1.0';
SET @Change_request_cd := 'C-005007';
SET @Script_Description :='Add new Dealers Name';
SET @Rollback_Script_name := 'ROLLBACK_DCR_010_005007_OGPLUS_t_dealers_REMOVE.sql';

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

DELETE FROM `t_dealers` WHERE `dealerscode` IN (115,120,127,149,151,157,161,179,182,186,600,612,738,751,763,764,821,850,874,956,957,958,959,960,961,962,963,964,965,966,967,968,969,970,971);

/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);

/**************************** End of Script ******************************/