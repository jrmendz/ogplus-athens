CREATE PROCEDURE `STREAMER_TABLE_STANDARD`(
	IN `__STUDIO` VARCHAR(50)
)
BEGIN

/**************************** Procedure Header ****************************
Version 		Author 				Date         	Description
1.0				Alvin Valdez		12/3/19			Initial Creation


/**************************** Main Script ******************************/

SELECT 
	IFNULL(t0.dealerCode, t1.dealerscode) AS dealerCode,
	UPPER(t2.nickname) AS streamerNickname,
	t2.imagestreamer AS streamerImage,
	(SELECT COUNT(_t0.id) FROM t_follow_streamers _t0 WHERE _t0.dealerscode = IFNULL(t0.dealerCode, t1.dealerscode)) AS streamerFollowers,
	IFNULL(t0.liveViewers, 0) AS liveViewers, 
	IFNULL(t0.tableNumber, '') AS tableNumber,
	NULL AS gameName,
	NULL AS gameCode,
	IFNULL(t0.streamURL, '[]') AS streamURL,
	IFNULL(t0.config, '{}') AS config,
	CASE WHEN IFNULL(t0.tableNumber, '') != '' THEN 'LIVE' ELSE 'OFFLINE' END AS `status`
FROM 
	t_streamers_table t0 
	RIGHT JOIN t_streamers t1 ON t0.dealerCode = t1.dealerscode
	LEFT JOIN t_dealers t2 ON IFNULL(t0.dealerCode, t1.dealerscode) = t2.dealerscode
WHERE
	t0.studio LIKE CONCAT("%", __STUDIO, "%") OR t0.studio IS NULL
ORDER BY
	t1.likes DESC,
	tableNumber DESC;


/**************************** End of script ******************************/
END