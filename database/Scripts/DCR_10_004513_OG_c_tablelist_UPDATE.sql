/**************************** Script Header ******************************/
SET @File_script_name := 'DCR_10_004513_OG_c_tablelist_UPDATE.sql';
SET @Author_Name := 'Alvin Phoebe Artemis Valdez';
SET @Database_Version := '1.0';
SET @Change_request_cd := 'C-004513';
SET @Script_Description :='Update Streaming URL of E3';
SET @Rollback_Script_name := 'ROLLBACK_DCR_10_004513_OG_c_tablelist_UPDATE.sql';

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

UPDATE `c_tablelist` 
SET 
	`cn_video`='["https://www.zjhhzs.cn/hls/E3.m3u8","https://www.zjhhzs.cn/hls/E3-SD.m3u8","https://live.moyoujf.cn/hls/MCManbetx.m3u8"]',
	`sea_video`='["https://www.zjhhzs.cn/hls/E3.m3u8","https://www.zjhhzs.cn/hls/E3-SD.m3u8","https://live.moyoujf.cn/hls/MCManbetx.m3u8"]',
	`nea_video`='["https://www.zjhhzs.cn/hls/E3.m3u8","https://www.zjhhzs.cn/hls/E3-SD.m3u8","https://live.moyoujf.cn/hls/MCManbetx.m3u8"]'
WHERE 
	`id`=32;

UPDATE `c_tablelist` 
SET 
	`cn_video`='["https://www.zjhhzs.cn/hls/E5.m3u8","https://www.zjhhzs.cn/hls/E5-SD.m3u8","https://live.jzsjqwdz.cn/hls/MCPrestige.m3u8"]',
	`sea_video`='["https://www.zjhhzs.cn/hls/E5.m3u8","https://www.zjhhzs.cn/hls/E5-SD.m3u8","https://live.jzsjqwdz.cn/hls/MCPrestige.m3u8"]',
	`nea_video`='["https://www.zjhhzs.cn/hls/E5.m3u8","https://www.zjhhzs.cn/hls/E5-SD.m3u8","https://live.jzsjqwdz.cn/hls/MCPrestige.m3u8"]'
WHERE 
	`id`=33;

/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);


/**************************** End of Script ******************************/