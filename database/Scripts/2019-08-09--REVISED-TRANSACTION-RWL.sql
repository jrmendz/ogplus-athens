/*
 _   _             _         _
| | | |           | |       | |
| | | | _ __    __| |  __ _ | |_  ___
| | | || '_ \  / _` | / _` || __|/ _ \
| |_| || |_) || (_| || (_| || |_|  __/
 \___/ | .__/  \__,_| \__,_| \__|\___|
       | |
       |_|
*/
BEGIN
	# Total Rolling and Win/Loss
	SELECT
		IFNULL(SUM(t0.bet_amount), 0) as rolling,
		IFNULL(SUM(t0.win_loss), 0) as win_loss
	FROM
		t_betdetails t0
	WHERE
		t0.user_id = _userID
		AND t0.created_at BETWEEN DATE_FORMAT(_StartDate, '%Y-%m-%d 00:00:00') AND DATE_FORMAT(_EndDate, '%Y-%m-%d 23:59:59');
END

/*
______        _  _  _                   _
| ___ \      | || || |                 | |
| |_/ / ___  | || || |__    __ _   ___ | | __
|    / / _ \ | || || '_ \  / _` | / __|| |/ /
| |\ \| (_) || || || |_) || (_| || (__ |   <
\_| \_|\___/ |_||_||_.__/  \__,_| \___||_|\_\
UNCOMMENT THE QUERY BELOW AND COMMENT-OUT THE QUERY ABOVE
*/
/**
BEGIN
	# Total Rolling and Win/Loss
	SELECT
		IFNULL(SUM(t0.effective_bet_amount), 0) as rolling,
		IFNULL(SUM(t0.win_loss), 0) as win_loss
	FROM
		t_betdetails t0
	WHERE
		t0.user_id = _userID
		AND t0.created_at BETWEEN _StartDate AND _EndDate;
END
*/
