INSERT INTO dataconnection(DC_IMPLEMENTOR, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, DC_DESC, DC_HOSTNAME, DC_NAME, DC_OPTIONS, DC_PASSWORD, DC_PORT, DC_TYPE, DC_URL, DC_USERNAME, DC_DATABASE, PATH, DC_CATALOG, DC_SID, REMOVEFIRSTROW, DC_USAGE_SCOPE) VALUES
('MYSQL', 'mysql-local-connection', 'polaris', now(), 'polaris', now(), 0, NULL, 'localhost', 'mysql-local', NULL, 'polaris', 3306, 'JDBC', NULL, 'polaris', 'polaris', NULL, NULL, NULL, NULL, 'DEFAULT');
INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_conn_type, ds_src_type, ds_granularity, ds_status, ds_published, ds_linked_workspaces, dc_id, version, created_time, created_by, modified_time, modified_by, ingestion_conf) values
('ds-test-01', 'linked_test', 'test_linked', 'polaris', 'test1 data', 'MASTER', 'LINK', 'JDBC', 'DAY', 'ENABLED', TRUE, 0, 'mysql-local-connection', 1.0, now(), 'polaris',  now(), 'polaris', '{"type":"link","database":"polaris_datasources","dataType":"TABLE","query":"dummy_1000","tuningOptions":{},"expired":600}');
INSERT INTO FIELD (ID, PRE_AGGR_TYPE, FIELD_ALIAS, FIELD_FILTERING, FIELD_FILTERING_OPTIONS, FIELD_FILTERING_SEQ, FIELD_FORMAT, FIELD_INGESTION_RULE, FIELD_LOGICAL_TYPE, FIELD_NAME, FIELD_PARTITIONED, FIELD_ROLE, SEQ, FIELD_TYPE, REF_ID, DS_ID) VALUES 
(10041021, 'NONE', 'seq', NULL, NULL, NULL, NULL, NULL, 'STRING', 'seq', NULL, 'DIMENSION', 0, 'INTEGER', NULL, 'ds-test-01'),
(10041022, 'NONE', 'first', NULL, NULL, NULL, NULL, NULL, 'STRING', 'first', NULL, 'DIMENSION', 1, 'STRING', NULL, 'ds-test-01'),
(10041023, 'NONE', 'last', NULL, NULL, NULL, NULL, NULL, 'STRING', 'last', NULL, 'DIMENSION', 2, 'STRING', NULL, 'ds-test-01'),
(10041024, 'NONE', 'age', NULL, NULL, NULL, NULL, NULL, 'STRING', 'age', NULL, 'DIMENSION', 3, 'STRING', NULL, 'ds-test-01'),
(10041025, 'NONE', 'city', NULL, NULL, NULL, NULL, NULL, 'STRING', 'city', NULL, 'DIMENSION', 4, 'STRING', NULL, 'ds-test-01'),
(10041026, 'NONE', 'state', NULL, NULL, NULL, NULL, NULL, 'STRING', 'state', NULL, 'DIMENSION', 5, 'STRING', NULL, 'ds-test-01'),
(10041027, 'NONE', 'zip', NULL, NULL, NULL, NULL, NULL, 'STRING', 'zip', NULL, 'DIMENSION', 6, 'STRING', NULL, 'ds-test-01'),
(10041028, 'NONE', 'yn', NULL, NULL, NULL, NULL, NULL, 'STRING', 'yn', NULL, 'DIMENSION', 7, 'STRING', NULL, 'ds-test-01'),
(10041029, 'NONE', 'domain', NULL, NULL, NULL, NULL, NULL, 'STRING', 'domain', NULL, 'DIMENSION', 8, 'STRING', NULL, 'ds-test-01'),
(10041030, 'NONE', 'dollar', NULL, NULL, NULL, NULL, NULL, 'STRING', 'dollar', NULL, 'DIMENSION', 9, 'STRING', NULL, 'ds-test-01'),
(10041031, 'NONE', 'pick', NULL, NULL, NULL, NULL, NULL, 'STRING', 'pick', NULL, 'DIMENSION', 10, 'STRING', NULL, 'ds-test-01'),
(10041032, 'NONE', 'latitude', NULL, NULL, NULL, NULL, NULL, 'STRING', 'latitude', NULL, 'DIMENSION', 11, 'STRING', NULL, 'ds-test-01'),
(10041033, 'NONE', 'longitude', NULL, NULL, NULL, NULL, NULL, 'STRING', 'longitude', NULL, 'DIMENSION', 12, 'STRING', NULL, 'ds-test-01'),
(10041034, 'NONE', 'date', NULL, NULL, NULL, 'MM/dd/yyyy', NULL, 'TIMESTAMP', 'date', NULL, 'TIMESTAMP', 13, 'STRING', NULL, 'ds-test-01'),
(10041035, 'NONE', 'm1', NULL, NULL, NULL, NULL, NULL, 'INTEGER', 'm1', NULL, 'MEASURE', 14, 'INTEGER', NULL, 'ds-test-01'),
(10041036, 'NONE', 'm2', NULL, NULL, NULL, NULL, NULL, 'INTEGER', 'm2', NULL, 'MEASURE', 15, 'LONG', NULL, 'ds-test-01');
COMMIT;