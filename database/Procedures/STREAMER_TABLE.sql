CREATE DEFINER=`root`@`localhost` PROCEDURE `STREAMER_TABLE`()
LANGUAGE SQL
DETERMINISTIC
CONTAINS SQL
SQL SECURITY DEFINER
COMMENT ''
BEGIN
	SELECT
		t0.id,
		t0.dealerCode AS streamerCode,
		t1.nickname AS streamerNickname,
		t1.imagestreamer AS streamerImage,
		COUNT(t2.dealerscode) AS streamerFollowers,
		t0.liveViewers,
		t0.tableNumber,
		t3.gamename AS gameName,
		t4.gamecode AS gameCode,
		t0.streamURL,
		t0.config,
		CASE WHEN CONVERT_TZ(UTC_TIMESTAMP(), "+00:00", "+08:00") BETWEEN CONCAT(CURDATE(),' ', t0.`liveStart+8`) AND CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY),' ', t0.`liveEnd+8`) THEN 'LIVE' ELSE 'OFFLINE' END AS `status`
	FROM
		t_streamers_table t0
		LEFT JOIN t_dealers t1 ON t0.dealerCode = t1.dealerscode
		LEFT JOIN t_follow_streamers t2 ON t0.dealerCode = t2.dealerscode
		LEFT JOIN c_tablelist t3 ON t0.tableNumber = t3.tablenumber
		LEFT JOIN c_gamecodes t4 ON t3.game_code_id = t4.id
	WHERE
		t0.CANCELLED = 0
	GROUP BY
		t0.dealerCode
	ORDER BY
		t0.tableNumber ASC;
END
