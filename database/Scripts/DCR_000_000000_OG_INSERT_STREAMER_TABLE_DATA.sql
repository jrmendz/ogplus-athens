
/**************************** Script Header ******************************/
SET @File_script_name := 'DCR_000_000000_OG_STREAMER_TABLE_INSERT.sql';
SET @Author_Name := 'Alvin Phoebe Artemis Valdez';
SET @Database_Version := '1.0';
SET @Change_request_cd := 'C-000000';
SET @Script_Description :='Insert Data for `t_streamers_table`';
SET @Rollback_Script_name := 'ROLLBACK_DCR_000_000000_OG_STREAMER_TABLE_INSERT.sql';

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

INSERT INTO `t_streamers_table` (`id`, `dealerCode`, `tableNumber`, `studio`, `liveViewers`, `liveStart+8`, `liveEnd+8`, `streamURL`, `config`, `status`, `CANCELLED`) VALUES
	(15, 327, 'P1', 'OGPlus', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(17, 538, 'P2', 'OGPlus', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(19, 575, 'P3', 'OGPlus', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(21, 576, 'P5', 'OGPlus', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(23, 609, 'P6', 'OGPlus', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(25, 649, 'P7', 'OGPlus', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(27, 673, 'P8', 'OGPlus', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(30, 686, 'E1', 'OGPlus', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(33, 704, 'E2', 'OGPlus', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(35, 708, 'E3', 'OGPlus', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(37, 719, 'E5', 'OGPlus', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0),
	(38, 876, 'M1', 'OGPlus|MX', 0, '10:00:00', '02:00:00', '["https://live.moyoujf.cn/hls/MCManbetx.m3u8"]', '{}', '', 0);

/**************************** Logging Script ******************************/
CALL `utility`.`sp_script_log_update`(@script_log_id);


/**************************** End of Script ******************************/