
/**************************** Script Header ******************************/
SET @File_script_name := 'DCR_010_004334_OGPLUS_t_dealers_UPDATE.sql';
SET @Author_Name := 'Alfie Salano';
SET @Database_Version := '1.0';
SET @Change_request_cd := ' C-004334';
SET @Script_Description :='Remove Dealers Name';
SET @Rollback_Script_name := 'ROLLBACK_DCR_010_004334_OGPLUS_t_dealers_REMOVE.sql';

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

DELETE FROM `t_dealers` WHERE `dealerscode` IN (938,939,940,941,942,943,944,945,946,947,948,949,950);

/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);

/**************************** End of Script ******************************/