INSERT INTO DATACONNECTION(DC_IMPLEMENTOR, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, DC_DESC, DC_HOSTNAME, DC_NAME, DC_OPTIONS, DC_PASSWORD, DC_PORT, DC_TYPE, DC_URL, DC_USERNAME, DC_DATABASE, PATH, DC_CATALOG, SID, REMOVEFIRSTROW) VALUES
('STAGE', 'stage-hive-connection-for-test', 'polaris', now(), 'polaris', now(), 0, NULL, 'localhost', 'hive-local', NULL, 'hive', 10000, 'JDBC', NULL, 'hive', '', NULL, NULL, NULL, NULL);
INSERT INTO PUBLIC.DATASET(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, SET_DESC, SET_NAME, SET_TYPE, SET_VALUE, DC_ID) VALUES
('dataset-001', 'polaris', now(), 'polaris', now(), 0, NULL, 'hive-sales', 'TABLE', 'sales', 'stage-hive-connection-for-test'),
('dataset-002', 'polaris', now(), 'polaris', now(), 0, NULL, 'hive-test', 'TABLE', 'test', 'stage-hive-connection-for-test');
INSERT INTO PUBLIC.DATAFLOW(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, FLOW_DESC, FLOW_NAME, FLOW_SCHEMA, FLOW_CONFIG) VALUES
('dataflow-001', 'polaris', now(), 'polaris', now(), 0, NULL, 'test-dataflow', 'dataflow','{"ruleSets":[{"name":"sales","datasetId":"dataset-001","rules":["derive value: if(category == ''Furniture'', true, false) as: ''cate_if''","drop col: profit"],"fields":null,"table":"sales"}],"resultTables":null}');
INSERT INTO PUBLIC.DATASET_DATAFLOW(SET_ID, FLOW_ID) VALUES
('dataset-001', 'dataflow-001'),
('dataset-002', 'dataflow-001');
