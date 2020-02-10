CREATE DEFINER=`athens-dev`@`%` PROCEDURE `PLAYER_DETAILS`()
BEGIN
	SELECT u.id, u.nickname, u.balance, u.avatar_mobile, u.avatar_pc, u.table_location, u.user_settings, u.logged FROM panda_dev.t_user u WHERE u.disabled = 0 AND u.logged = 1 AND u.table_location <> 'lobby';
END