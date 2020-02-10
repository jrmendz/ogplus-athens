CREATE DEFINER=`athens-dev`@`%` PROCEDURE `TABLE_DETAILS`(IN TABLE_ID INT)
BEGIN
	IF TABLE_ID = 0 THEN
		SELECT t.*, gc.gamecode FROM c_tablelist t LEFT JOIN c_gamecodes gc ON gc.id=t.game_code_id;
	ELSE
		SELECT t.*, gc.gamecode FROM c_tablelist t LEFT JOIN c_gamecodes gc ON gc.id=t.game_code_id WHERE t.id = TABLE_ID;
    END IF;
END