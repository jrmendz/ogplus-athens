-- --------------------------------------------------------
-- Host:                         172.16.126.116
-- Server version:               5.7.27 - MySQL Community Server (GPL)
-- Server OS:                    Linux
-- HeidiSQL Version:             10.1.0.5464
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for procedure panda_dev.BETS_SAVE
DELIMITER //
CREATE DEFINER=`panda_dev`@`%` PROCEDURE `BETS_SAVE`(
	IN `__CHIP_VALUE` DECIMAL(25,5),
	IN `__TOTAL_BET_AMOUNT` DECIMAL(25,5),
	IN `__USER_ID` INT,
	IN `__BET_AREA` TEXT,
	IN `__GAME_SET` TEXT,
	IN `__TABLE_ID` INT,
	IN `__SUPER_SIX` TINYINT,
	IN `__EMCEE` TINYINT
)
    DETERMINISTIC
    COMMENT 'This will process to save your chips/bets.'
proc_label:BEGIN
	-- Declaration
	DECLARE GAME_CODE TEXT DEFAULT NULL;
	DECLARE GAME_CODE_ID INT DEFAULT NULL;
	DECLARE BET_AREA_ID TEXT DEFAULT NULL;
	DECLARE BET_GAME_SET_ID INT DEFAULT NULL;
	DECLARE BET_SHOE_HAND_ID INT DEFAULT NULL;
	DECLARE USER_BALANCE DECIMAL(25,5) DEFAULT 0;
	-- Last ID
	SELECT @LAST_ID := LPAD(IFNULL(MAX(id), 0) + 1, 13, '0') FROM t_betdetails;

	-- Game Information
	SELECT gc.gamecode, gc.id INTO GAME_CODE, GAME_CODE_ID FROM c_tablelist t JOIN c_gamecodes gc ON gc.id = t.game_code_id WHERE t.id = __TABLE_ID LIMIT 1;

	-- Pre-setting variables
	IF GAME_CODE = 'dragontiger' AND __BET_AREA = 'tie' THEN SET __BET_AREA = 'dt-tie'; END IF;

  	SELECT t0.id INTO BET_AREA_ID FROM c_betplace t0 WHERE t0.bet_place = __BET_AREA LIMIT 1;
  	SELECT t0.id, t0.shoehand_id INTO BET_GAME_SET_ID, BET_SHOE_HAND_ID FROM t_gameset t0 WHERE t0.id = __GAME_SET LIMIT 1;
	SELECT (t0.balance - __TOTAL_BET_AMOUNT) AS balance INTO USER_BALANCE FROM t_user t0 WHERE t0.id = __USER_ID LIMIT 1;

	SET @BET_CODE = CONCAT(GAME_CODE_ID, LPAD(BET_AREA_ID, 2, '0'), LPAD(FLOOR(RAND() * BET_SHOE_HAND_ID), 5, '0'), @LAST_ID);
	-- SET @BET_CODE = CONCAT(GAME_CODE_ID, YEAR(NOW()), LPAD(MONTH(NOW()), 2, '0'), LPAD(DAY(NOW()), 2, '0'), LPAD(IFNULL(LAST_INSERT_ID(), 0) + 1, 11, '0'));

	-- Stop executing procedure once the user balance is 0
	IF USER_BALANCE < 0 THEN
		LEAVE proc_label;
	END IF;

	-- Insert Bet Information
	INSERT INTO t_betdetails (
		bet_amount,
		bet_code,
		user_id,
		betplace_id,
		shoehand_id,
		gameset_id,
		table_id,
		balance,
		bet_date,
		super_six,
		is_emcee
	) VALUES (
		__CHIP_VALUE,
		@BET_CODE,
		__USER_ID,
		BET_AREA_ID,
		BET_SHOE_HAND_ID,
		BET_GAME_SET_ID,
		__TABLE_ID,
		USER_BALANCE,
		CURDATE(),
		__SUPER_SIX,
		__EMCEE
	);

	-- <<< ARRAY [0] >>>
	-- Return Bet Information
	SELECT
		t0.id,
		t0.user_id,
		t0.bet_code,
		t0.bet_amount,
		t0.balance,
		t0.betplace_id,
		t0.shoehand_id,
		t0.table_id,
		t0.bet_date
	FROM
		t_betdetails t0
	WHERE
		t0.id = LAST_INSERT_ID();
END//
DELIMITER ;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
