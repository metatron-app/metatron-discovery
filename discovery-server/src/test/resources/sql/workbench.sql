
INSERT INTO DATACONNECTION(DC_IMPLEMENTOR, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, DC_DESC, DC_HOSTNAME, DC_NAME, DC_OPTIONS, DC_PASSWORD, DC_PORT, DC_TYPE, DC_URL, DC_USERNAME, DC_DATABASE, PATH, DC_CATALOG, DC_SID, REMOVEFIRSTROW, DC_SECONDARY_USERNAME, DC_SECONDARY_PASSWORD, DC_HDFS_CONF_PATH, DC_PERSONAL_DATABASE_PREFIX) VALUES
('STAGE', 'stage-hive-connection-for-test', 'polaris', now(), 'polaris', now(), 0, NULL, 'localhost', 'hive-local', NULL, 'hive', 10000, 'JDBC', NULL, 'hive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('HIVE', 'hive-local', 'polaris', now(), 'polaris', now(), 0, NULL, 'localhost', 'hive-local', NULL, 'hive', 10000, 'JDBC', NULL, 'hive', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('MYSQL', 'mysql-local', 'polaris', now(), 'polaris', now(), 0, NULL, 'localhost', 'mysql-local', NULL, 'polaris', 3306, 'JDBC', NULL, 'polaris', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
('PRESTO', 'presto-local', 'polaris', now(), 'polaris', now(), 0, NULL, 'localhost', 'presto-local', NULL, 'hive', 8080, 'JDBC', NULL, 'hive', NULL, NULL, 'hive', NULL, NULL, NULL, NULL, NULL, NULL),
('HIVE', 'hive-local-enable-save-as-hive-table', 'polaris', now(), 'polaris', now(), 0, NULL, 'localhost', 'hive-local-enable-save-as-hive-table', NULL, 'hive', 10000, 'JDBC', NULL, 'read_only', NULL, NULL, NULL, NULL, NULL, 'hive_admin', '1111', '/Users/yooyoungmo/bettercode/metatron-discovery/upstream-master/metatron-discovery/discovery-server/src/test/hdfs-conf', 'private');


INSERT INTO book (type,id, created_by, created_time, modified_by, modified_time,version,book_desc,book_favorite,book_folder_id,book_name,book_tag,ws_id) VALUES
('workbench','workbench-01','admin',NOW(),'admin',NOW(),1.0,'',FALSE,'','TEST-Workbench-01','','ws-00'),
('workbench','workbench-02','admin',NOW(),'admin',NOW(),1.0,'',FALSE,'','TEST-Workbench-02','','ws-00'),
('workbench','workbench-03','polaris',NOW(),'polaris',NOW(),1.0,'',FALSE,'','TEST-Workbench-03','','ws-02'),
('workbench','workbench-04','polaris',NOW(),'polaris',NOW(),1.0,'',FALSE,'','TEST-Workbench-04','','ws-02'),
('workbench','workbench-05','polaris',NOW(),'polaris',NOW(),1.0,'',FALSE,'','TEST-Workbench-04','','ws-02'),
('workbook','workbook-01','polaris',NOW(),'polaris',NOW(),1.0,'',FALSE,'','TEST-Workbook-01','','ws-00'),
('workbook','workbook-02','polaris',NOW(),'polaris',NOW(),1.0,'',FALSE,'','TEST-Workbook-02','','ws-02');

INSERT INTO book_workbench (workbench_global_var, id, dc_id) VALUES
('[{"globalNm":"var1","globalVar":"20170701","globalType":"c"},{"globalNm":"var2","globalVar":"limit 10","globalType":"t"}]', 'workbench-01', 'hive-local'),
('[{"globalNm":"var1","globalVar":"20170701","globalType":"c"},{"globalNm":"var2","globalVar":"limit 10","globalType":"t"}]', 'workbench-02', 'mysql-local'),
('[{"globalNm":"var1","globalVar":"20170701","globalType":"c"},{"globalNm":"var2","globalVar":"limit 10","globalType":"t"}]', 'workbench-03', 'presto-local'),
('[{"globalNm":"var1","globalVar":"20170701","globalType":"c"},{"globalNm":"var2","globalVar":"limit 10","globalType":"t"}]', 'workbench-04', 'stage-hive-connection-for-test'),
('[{"globalNm":"var1","globalVar":"20170701","globalType":"c"},{"globalNm":"var2","globalVar":"limit 10","globalType":"t"}]', 'workbench-05', 'hive-local-enable-save-as-hive-table');

INSERT INTO book_workbook (id) VALUES('workbook-01');
INSERT INTO book_workbook (id) VALUES('workbook-02');

INSERT INTO queryeditor (created_by, created_time, modified_by, modified_time, version, qe_name, qe_order, qe_query, book_id, id) VALUES
('admin', NOW(), 'admin', NOW(), 1.0, 'Query Editor Test 1', 0, 'select * from sales', 'workbench-01', 'query-01'),
('admin', NOW(), 'admin', NOW(), 1.0, 'Query Editor Test 2', 1, 'select * from sales', 'workbench-02', 'query-02'),
('polaris', NOW(), 'polaris', NOW(), 1.0, 'Query Editor Test 3', 0, 'select * from sales', 'workbench-03', 'query-03'),
('polaris', NOW(), 'polaris', NOW(), 1.0, 'Query Editor Test 4', 1, 'select * from sales', 'workbench-04', 'query-04'),
('polaris', NOW(), 'polaris', NOW(), 1.0, 'Query Editor Test 5', 0, '', 'workbench-05', 'query-05');

INSERT INTO queryhistory (id,created_by,created_time,modified_by,modified_time,version,query,query_finish_time,query_start_time,query_status,query_time_taken,qe_id,delete_flag, database_name, dc_id, num_rows) VALUES
(1,'polaris', '2017-08-11T00:00:00', 'polaris', '2017-08-11T00:00:00', 1.0,'select * from sales','2017-08-11T00:00:00','2017-08-11T00:00:00','SUCCESS',1,'query-01', 'N', 'default', 'hive-local', 1)
,(2,'polaris', '2017-08-11T00:00:00', 'polaris', '2017-08-12T00:00:00', 1.0,'select * from sales2','2017-08-11T00:00:00','2017-08-12T00:00:00','FAIL',10,'query-01', 'N', 'default', 'hive-local', 11)
,(3,'admin', '2017-08-12T00:00:00', 'polaris', '2017-08-13T00:00:00', 1.0,'select * from sales3','2017-08-11T00:00:00','2017-08-13T00:00:00','SUCCESS',100,'query-01', 'N', 'sample', 'mysql-local', 15)
,(4,'polaris', '2017-08-13T00:00:00', 'polaris', '2017-08-14T00:00:00', 1.0,'select * from sales4','2017-08-11T00:00:00','2017-08-14T00:00:00','FAIL',1000,'query-01', 'N', 'sample', 'mysql-local', 12)
,(5,'metatron', '2017-08-14T00:00:00', 'polaris', '2017-08-11T00:00:00', 1.0,'select * from sales','2017-08-11T00:00:00','2017-08-11T00:00:00','SUCCESS',10000,'query-03', 'N', 'default', 'hive-local',5678)
,(6,'polaris', '2017-08-15T00:00:00', 'polaris', '2017-08-12T00:00:00', 1.0,'select * from sales2','2017-08-11T00:00:00','2017-08-12T00:00:00','FAIL',100000,'query-03', 'N', 'default', 'hive-local', 1235)
,(7,'admin', '2017-08-16T00:00:00', 'polaris', '2017-08-13T00:00:00', 1.0,'select * from sales3','2017-08-11T00:00:00','2017-08-13T00:00:00','SUCCESS',1,'query-03', 'N', 'sample', 'mysql-local', 15345)
,(8,'polaris', '2017-08-17T00:00:00', 'polaris', '2017-08-14T00:00:00', 1.0,'select * from sales4','2017-08-11T00:00:00','2017-08-14T00:00:00','FAIL',10,'query-03', 'N', 'sample', 'mysql-local', 457457)
,(9,'metatron', '2017-08-17T00:00:00', 'polaris', '2017-08-14T00:00:00', 1.0,'select * from sales4','2017-08-11T00:00:00','2017-08-14T00:00:00','FAIL',100,'query-03', 'N', 'sample', 'mysql-local',1231)
,(10,'admin', '2017-08-17T00:00:00', 'polaris', '2017-08-14T00:00:00', 1.0,'select * from sales4','2017-08-11T00:00:00','2017-08-14T00:00:00','SUCCESS',1000,'query-03', 'N', 'sample', 'mysql-local',346)
,(11,'polaris', '2017-08-17T00:00:00', 'polaris', '2017-08-14T00:00:00', 1.0,'select * from sales4','2017-08-11T00:00:00','2017-08-14T00:00:00','FAIL',10000,'query-03', 'N', 'sample', 'mysql-local',2)
,(12,'polaris', '2017-08-17T00:00:00', 'polaris', '2017-08-14T00:00:00', 1.0,'select * from sales4','2017-08-11T00:00:00','2017-08-14T00:00:00','SUCCESS',100000,'query-03', 'N', 'sample', 'mysql-local', 0)
,(13,'polaris', '2017-08-17T00:00:00', 'polaris', '2017-08-14T00:00:00', 1.0,'select * from sales4','2017-08-11T00:00:00','2017-08-14T00:00:00','SUCCESS',100000,'query-03', 'N', 'sample', 'mysql-local',213)
,(14,'polaris', '2017-08-17T00:00:00', 'polaris', '2017-08-14T00:00:00', 1.0,'select * from sales4','2017-08-11T00:00:00','2017-08-14T00:00:00','SUCCESS',100000,'query-03', 'N', 'sample', 'mysql-local',2)
,(15,'polaris', '2017-08-17T00:00:00', 'polaris', '2017-08-14T00:00:00', 1.0,'select * from sales4','2017-08-11T00:00:00','2017-08-14T00:00:00','SUCCESS',100000,'query-03', 'N', 'sample', 'mysql-local',0)
;