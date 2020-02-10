alter table t_pitboss_log add column path varchar(100);
alter table t_pitboss_log modify column request varchar(1000);
alter table t_pitboss_log modify column response varchar(1000);
