
/**************************** Script Header ******************************/
SET @File_script_name := 'ROLLBACK_DCR_000_000000_OGPLUS_t_settings_CREATE.sql.sql';
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

/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);

/**************************** End of Script ******************************/