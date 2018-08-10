INSERT INTO DATACONNECTION(DC_IMPLEMENTOR, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, DC_DESC, DC_HOSTNAME, DC_NAME, DC_OPTIONS, DC_PASSWORD, DC_PORT, DC_TYPE, DC_URL, DC_USERNAME, DC_DATABASE, PATH, DC_CATALOG, DC_SID, REMOVEFIRSTROW, DC_USAGE_SCOPE) VALUES
('MYSQL', 'mysql-connection', 'polaris', now(), 'polaris', '2017-08-13T15:11:07', 0, NULL, 'localhost', 'mysql-local-conn', NULL, 'polaris', 3306, 'JDBC', NULL, 'polaris', 'polaris', NULL, NULL, NULL, NULL, 'DEFAULT');

INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_conn_type, ds_src_type, ds_granularity, ds_status, ds_published, ds_linked_workspaces, dc_id, version, created_time, created_by, modified_time, modified_by) values
('ds-test-01', 'test1', 'test1', 'polaris', 'test1 data', 'MASTER', 'LINK', 'JDBC', 'DAY', 'ENABLED', TRUE, 0, null, 1.0, TIMESTAMP '2017-09-10 10:30:00.00', 'polaris',  TIMESTAMP '2017-09-12 10:30:00.00', 'polaris'),
('ds-test-02', 'test2', 'test2', 'polaris', 'test2 data', 'JOIN', 'ENGINE',  'FILE', 'DAY', 'ENABLED', FALSE, 2, null, 1.0, TIMESTAMP '2017-09-10 10:30:00.00', 'polaris',  TIMESTAMP '2017-09-12 10:30:00.00', 'polaris'),
('ds-test-03', 'real1', 'real1', 'polaris', 'real1 data', 'MASTER', 'ENGINE', 'JDBC', 'DAY', 'PREPARING', FALSE, 1, 'mysql-connection', 1.0, TIMESTAMP '2017-09-11 10:30:00.00', 'polaris',  TIMESTAMP '2017-09-12 11:30:00.00', 'polaris'),
('ds-test-04', 'real2', 'real2', 'polaris', 'real2 data', 'MASTER', 'ENGINE',  'HDFS', 'DAY', 'ENABLED', FALSE, 0, null, 1.0, TIMESTAMP '2017-09-11 10:30:00.00', 'polaris',  TIMESTAMP '2017-09-12 11:30:00.00', 'polaris');

INSERT INTO datasource_workspace(ws_id, ds_id) VALUES
('ws-02', 'ds-test-02'),
('ws-03', 'ds-test-02'),
('ws-02', 'ds-test-03');

