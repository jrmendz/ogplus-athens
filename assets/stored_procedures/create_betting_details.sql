CREATE DEFINER=`athens-dev`@`%` PROCEDURE `CREATE_BETTING_DETAILS`(
	IN `BET_AMOUNT` INT,
	IN `TOTAL` INT,
	IN `USER_ID` INT,
	IN `BET_PLACE` VARCHAR(255),
	IN `SHOE_HAND_NUMBER` VARCHAR(255),
	IN `TABLE_ID` INT,
	IN `BET_DATE` VARCHAR(255),
	IN `IS_END` BOOLEAN,
	IN `SUPER_SIX` INT





)
proc_label : BEGIN
	SELECT gc.gamecode, gc.id INTO @gamecode, @gamecode_id FROM c_tablelist t LEFT JOIN c_gamecodes gc ON gc.id = t.game_code_id WHERE t.id = TABLE_ID LIMIT 1;
    IF @gamecode = 'dragontiger' AND BET_PLACE = 'tie' THEN
		SET BET_PLACE = 'dt-tie';
    END IF;
    SET @USER_CREATED_AT := (SELECT u.create_at FROM t_user u WHERE u.id = USER_ID LIMIT 1);
	SET @BET_PLACE_ID := (SELECT bp.id FROM c_betplace bp WHERE bp.bet_place = BET_PLACE LIMIT 1);
    SET @SHOE_HAND_ID := (SELECT sh.id FROM c_shoehand sh  WHERE sh.shoehandnumber = SHOE_HAND_NUMBER LIMIT 1);
    SET @BALANCE := (SELECT u.balance FROM t_user u WHERE u.id = USER_ID LIMIT 1);
    SET @BALANCE := @BALANCE - TOTAL;
    IF @BALANCE < 0 THEN
		LEAVE proc_label;
    END IF;
	INSERT INTO t_betdetails (
        bet_amount,
        user_id,
        betplace_id,
        shoehand_id,
        table_id,
        balance,
        bet_date,
        super_six
    ) VALUES (
		BET_AMOUNT,
        USER_ID,
        @BET_PLACE_ID,
        @SHOE_HAND_ID,
        TABLE_ID,
        @BALANCE,
        curdate(),
		SUPER_SIX
        );
        
	SET @ID := LAST_INSERT_ID();
	UPDATE t_betdetails SET
	bet_code = CONCAT(DATE_FORMAT(NOW(), "%Y"),@ID,@SHOE_HAND_ID)
	WHERE id = @ID;
    
	IF IS_END = TRUE THEN -- end of the loop
		-- update balance
		UPDATE t_user u
		SET u.balance = @BALANCE
		WHERE u.id = USER_ID;
	   --
		-- highest bidder 
        SET @tablenumber = (SELECT t.tablenumber FROM c_tablelist t WHERE t.id = TABLE_ID);
		IF @gamecode = 'baccarat' THEN
			-- banker and player - 1 and 2
			SELECT SUM(bd.bet_amount) as total_bet, u.id INTO @banker_tiger_betamount,  @banker_tiger_highestbidder FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.shoehand_id = @SHOE_HAND_ID AND bd.bet_date = curdate() AND bd.betplace_id = 1 AND bd.table_id = TABLE_ID GROUP BY bd.user_id, bd.created_at ORDER BY total_bet DESC, bd.created_at ASC LIMIT 1;
			SELECT SUM(bd.bet_amount) as total_bet, u.id INTO @player_dragon_betamount,  @player_dragon_highestbidder FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.shoehand_id = @SHOE_HAND_ID AND bd.bet_date = curdate() AND bd.betplace_id = 2 AND bd.table_id = TABLE_ID GROUP BY bd.user_id, bd.created_at ORDER BY total_bet DESC, bd.created_at ASC LIMIT 1;
			SELECT md5(concat(@banker_tiger_highestbidder, @USER_CREATED_AT)) as banker, md5(concat(@player_dragon_highestbidder, @USER_CREATED_AT)) as player;
		ELSEIF @gamecode = 'dragontiger' THEN
			-- Tiger and Dragon - 6 and 5
			SELECT SUM(bd.bet_amount) as total_bet, u.id INTO @banker_tiger_betamount,  @banker_tiger_highestbidder FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.shoehand_id = @SHOE_HAND_ID AND bd.bet_date = curdate() AND bd.betplace_id = 6 AND bd.table_id = TABLE_ID GROUP BY bd.user_id, bd.created_at  ORDER BY total_bet DESC, bd.created_at ASC LIMIT 1;
			SELECT SUM(bd.bet_amount) as total_bet, u.id INTO @player_dragon_betamount,  @player_dragon_highestbidder FROM t_betdetails bd LEFT JOIN t_user u ON u.id = bd.user_id WHERE bd.shoehand_id = @SHOE_HAND_ID AND bd.bet_date = curdate() AND bd.betplace_id = 5 AND bd.table_id = TABLE_ID GROUP BY bd.user_id, bd.created_at ORDER BY total_bet DESC, bd. created_at ASC LIMIT 1;
			SELECT md5(concat(@banker_tiger_highestbidder, @USER_CREATED_AT)) as tiger, md5(concat(@player_dragon_highestbidder, @USER_CREATED_AT)) as dragon;
		ELSEIF @gamecode = 'moneywheel' THEN
			-- Not implemented in moneywheel
			SET @nothing = null;
			SELECT @nothing as nothing;
		END IF;
        
        --  bet percentages
		SET @total_bets = (SELECT SUM(bd.bet_amount) FROM t_betdetails bd LEFT JOIN c_betplace bp ON bp.id = bd.betplace_id WHERE bd.table_id = TABLE_ID AND bd.shoehand_id = @SHOE_HAND_ID AND DATE(bd.bet_date) = curdate() AND bp.bet_place IN ('banker', 'player', 'tie', 'dragon', 'tiger', 'dt-tie'));
		SELECT IF(bp.bet_place = 'dt-tie', 'tie', bp.bet_place) as bet_place, IFNULL(TRUNCATE(SUM(bd.bet_amount) / @total_bets * 100, 0), 0) as bet_percentage
        FROM c_betplace bp LEFT JOIN t_betdetails bd ON bd.betplace_id = bp.id AND bd.table_id = TABLE_ID AND bd.shoehand_id = @SHOE_HAND_ID AND DATE(bd.bet_date) = curdate()
		WHERE bp.bet_place IN ('banker', 'tie', 'player', 'dragon', 'tiger', 'dt-tie') AND bp.gamecode_id = @gamecode_id GROUP BY bp.id;
        
    END IF;
   SELECT
		bd.bet_amount,
        bd.balance,
        md5(concat(bd.user_id, @USER_CREATED_AT)) as user_id,
        bd.betplace_id,
        bd.shoehand_id,
        bd.table_id,
        bd.bet_code,
        bd.bet_date
	FROM t_betdetails bd
    WHERE bd.id = @ID;
    
    SELECT @tablenumber as tableNumber;

	IF IS_END = TRUE THEN -- end of the loop
		-- The number of bets and the number of users who bet
		SELECT IF(bp.bet_place = 'dt-tie', 'tie', bp.bet_place) as bet_place, IFNULL(SUM(bd.bet_amount), 0) as total_bets, COUNT(DISTINCT bd.user_id) as total_users FROM c_gamecodes gc LEFT JOIN c_betplace bp ON gc.id = bp.gamecode_id LEFT JOIN t_betdetails bd ON bp.id = bd.betplace_id AND bd.table_id = TABLE_ID AND DATE(bd.bet_date) = curdate() AND bd.shoehand_id = @SHOE_HAND_ID WHERE gc.id= @gamecode_id GROUP BY bp.bet_place;
		SELECT t.gamename as game FROM c_tablelist t WHERE t.id = TABLE_ID;
    END IF;
END