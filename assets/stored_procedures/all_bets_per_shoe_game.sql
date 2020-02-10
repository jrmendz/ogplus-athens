CREATE DEFINER=`athens-dev`@`%` PROCEDURE `ALL_BETS_PER_SHOE_GAME`(IN BET_DATE VARCHAR(255), IN USER_ID INT, IN TABLE_ID INT, IN SHOE_HAND_NUMBER VARCHAR(255))
BEGIN
	SET @shoehand_id := (SELECT sh.id FROM c_shoehand sh WHERE sh.shoehandnumber = SHOE_HAND_NUMBER);
	SET @totalBetsToday := (SELECT COALESCE(SUM(bd.bet_amount), 0) FROM t_betdetails bd WHERE DATE(bd.bet_date) = BET_DATE AND bd.user_id = USER_ID AND bd.table_id = TABLE_ID AND bd.shoehand_id = @shoehand_id);
    
    SELECT USER_ID as user_id, TABLE_ID as table_id, @totalBetsToday as totalBetsToday, BET_DATE as bet_date;
END