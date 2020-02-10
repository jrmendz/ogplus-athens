
/**************************** Script Header ******************************/
SET @File_script_name := 'DCR_010_005397_OGPLUS_t_dealers_UPDATE.sql';
SET @Author_Name := 'Alfie Salano';
SET @Database_Version := '1.0';
SET @Change_request_cd := 'C-005397';
SET @Script_Description :='Add new Dealers Name';
SET @Rollback_Script_name := 'ROLLBACK_DCR_010_005397_OGPLUS_t_dealers_REMOVE.sql';

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

DELETE FROM `t_dealers` WHERE `dealerscode` IN (101,102,103,104,105,106,107,108,109,110,111,112,113,114,116,117,118,119,121,122,123,124,125,126,128,130,131,132,133,135,129,136,134);

/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);

/**************************** End of Script ******************************/