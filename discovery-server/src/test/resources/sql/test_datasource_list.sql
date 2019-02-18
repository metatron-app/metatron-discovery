INSERT INTO dataconnection(DC_IMPLEMENTOR, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, DC_DESC, DC_HOSTNAME, DC_NAME, DC_OPTIONS, DC_PASSWORD, DC_PORT, DC_TYPE, DC_URL, DC_USERNAME, DC_DATABASE, PATH, DC_CATALOG, DC_SID) VALUES
('MYSQL', 'mysql-connection', 'polaris', now(), 'polaris', '2017-08-13T15:11:07', 0, NULL, 'localhost', 'mysql-local-conn', NULL, 'polaris', 3306, 'JDBC', NULL, 'polaris', 'polaris', NULL, NULL, NULL);

INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_conn_type, ds_src_type, ds_granularity, ds_status, ds_published, ds_linked_workspaces, dc_id, version, created_time, created_by, modified_time, modified_by, ingestion_conf) values
('ds-test-01', 'test1', 'test1', 'polaris', 'test1 data', 'MASTER', 'LINK', 'JDBC', 'DAY', 'ENABLED', TRUE, 0, null, 1.0, TIMESTAMP '2017-09-10 10:30:00.00', 'polaris',  TIMESTAMP '2017-09-12 10:30:00.00', 'polaris', null),
('ds-test-02', 'test2', 'test2', 'polaris', 'test2 data', 'JOIN', 'ENGINE',  'FILE', 'DAY', 'ENABLED', FALSE, 2, null, 1.0, TIMESTAMP '2017-09-10 10:30:00.00', 'polaris',  TIMESTAMP '2017-09-12 10:30:00.00', 'polaris', null),
('ds-test-03', 'real1', 'real1', 'polaris', 'real1 data', 'MASTER', 'ENGINE', 'JDBC', 'DAY', 'PREPARING', FALSE, 1, 'mysql-connection', 1.0, TIMESTAMP '2017-09-11 10:30:00.00', 'polaris',  TIMESTAMP '2017-09-12 11:30:00.00', 'polaris', null),
('ds-test-04', 'real2', 'real2', 'polaris', 'real2 data', 'MASTER', 'ENGINE',  'HDFS', 'DAY', 'ENABLED', FALSE, 0, null, 1.0, TIMESTAMP '2017-09-11 10:30:00.00', 'polaris',  TIMESTAMP '2017-09-12 11:30:00.00', 'polaris', null),
('ds-test-05', 'test5', 'test5', 'polaris', 'jdbc-batch-INCREMENTAL', 'MASTER', 'ENGINE', 'JDBC', 'DAY', null, FALSE, 1, null, 1.0, TIMESTAMP '2017-09-11 10:30:00.00', 'polaris',  TIMESTAMP '2017-09-12 11:30:00.00', 'polaris', '{"dataType":"QUERY","type":"batch","rollup":true,"query":"select id, payment_type, payment_amt, in_datetime from payment","database":"test_sales_for_metatron","period":{"frequency":"MINUTELY","value":10},"maxLimit":10000,"range":"INCREMENTAL","connection":{"type":"JDBC","implementor":"MYSQL","authenticationType":"MANUAL","password":"1111","username":"root","hostname":"localhost","port":"3306"},"intervals":["2009-12/2026-08"]}');


INSERT INTO `field` (`id`,`pre_aggr_type`,`field_alias`,`field_desc`,`field_filtering`,`field_filtering_options`,`field_filtering_seq`,`field_format`,`field_ingestion_rule`,`field_logical_type`,`field_name`,`field_partitioned`,`field_role`,`seq`,`field_type`,`ref_id`,`ds_id`) VALUES
(10047029,'NONE','sale_record_no',NULL,NULL,NULL,NULL,NULL,NULL,'INTEGER','id',NULL,'DIMENSION',0,'INTEGER',NULL,'ds-test-05'),
(10047030,'NONE','payment_type',NULL,NULL,NULL,NULL,NULL,NULL,'STRING','payment_type',NULL,'DIMENSION',1,'STRING',NULL,'ds-test-05'),
(10047031,'NONE','payment_amt',NULL,NULL,NULL,NULL,NULL,NULL,'DOUBLE','payment_amt',NULL,'MEASURE',2,'DOUBLE',NULL,'ds-test-05'),
(10047032,'NONE','in_datetime',NULL,NULL,NULL,NULL,'{"type":"time_format","format":"yyyy-MM-dd HH:mm:ss.SSSSSS"}',NULL,'TIMESTAMP','in_datetime',NULL,'TIMESTAMP',3,'TIMESTAMP',NULL,'ds-test-05');

INSERT INTO datasource_workspace(ws_id, ds_id) VALUES
('ws-02', 'ds-test-02'),
('ws-03', 'ds-test-02'),
('ws-02', 'ds-test-03');

INSERT INTO ingestion_history (ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, INGEST_CAUSE, INGEST_DS_ID, INGEST_DURATION, INGEST_ENGINE_ID, INGEST_CONF, INGEST_METHOD, INGEST_STATUS) VALUES
(100001, 'admin', NOW(), 'admin', NOW(), 1, null, 'ds-test-01', 7729, 'index_hadoop_hive_ingestion_csv_none_partition_ikteb_2018-11-06T07:37:39.248Z', '{"type":"local"}', 'DEFAULT', 'RUNNING'),
(100011, 'admin', NOW(), 'admin', NOW(), 1, null, 'ds-test-01', 7729, 'test-kafka_8cd4ba9775724d6193ac17271866e946', '{"type":"local"}', 'SUPERVISOR', 'RUNNING'),
(100002, 'polaris', NOW(), 'polaris', NOW(), 1, 'Fail....', 'ds-test-01', 5902, 'index_test_xfsrz_2018-10-08T12:27:23.492Z', '{"type":"local"}', 'DEFAULT', 'FAILED'),
(100003, 'polaris', NOW(), 'polaris', NOW(), 1, null, 'ds-test-02', 5689, 'index_testfalse_2018-10-08T12:30:43.013Z', '{"type":"single"}', 'DEFAULT', 'SUCCESS'),
(100004, 'polaris', NOW(), 'polaris', NOW(), 1, null, 'ds-test-03', 28441, 'index_abctest_2018-10-08T12:35:25.569Z', '{"type":"single"}', 'DEFAULT', 'SUCCESS'),
(100005, 'admin', NOW(), 'admin', NOW(), 1, null, 'ds-test-04', 5732, 'index_testabc_2018-10-24T09:22:08.244Z', '{"type":"local"}', 'DEFAULT', 'SUCCESS');

