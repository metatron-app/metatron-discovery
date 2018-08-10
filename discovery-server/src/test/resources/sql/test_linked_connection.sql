-- 링크할 DataConnection
INSERT INTO DATACONNECTION(DC_IMPLEMENTOR, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, DC_DESC, DC_HOSTNAME, DC_NAME, DC_OPTIONS, DC_PASSWORD, DC_PORT, DC_TYPE, DC_URL, DC_USERNAME, DC_DATABASE, PATH, DC_CATALOG, DC_SID, REMOVEFIRSTROW, dc_published, DC_USAGE_SCOPE, DC_AUTHENTICATION_TYPE, DC_METASTORE_HOST, DC_METASTORE_PORT, DC_METASTORE_SCHEMA, DC_METASTORE_USERNAME, DC_METASTORE_PASSWORD) VALUES
('HIVE', 'conn-01', 'polaris', now(), 'polaris', now(), 0, NULL, 'localhost', 'conn-published', NULL, 'hive', 10000, 'JDBC', NULL, 'hive', NULL, NULL, NULL, NULL, NULL, true, 'WORKBENCH', 'MANUAL', 'localhost', '3306', 'metastore', 'hiveuser', 'password'),
('HIVE', 'conn-02', 'polaris', now(), 'polaris', now(), 0, NULL, 'localhost', 'conn-(ws00, ws02, ws03)', NULL, 'hive', 10000, 'JDBC', NULL, 'hive', NULL, NULL, NULL, NULL, NULL, false, 'WORKBENCH', 'MANUAL', 'localhost', '3306', 'metastore', 'hiveuser', 'password'),
('HIVE', 'conn-03', 'polaris', now(), 'polaris', now(), 0, NULL, 'localhost', 'conn-(ws02, ws03)', NULL, 'hive', 10000, 'JDBC', NULL, 'hive', NULL, NULL, NULL, NULL, NULL, false, 'WORKBENCH', 'MANUAL', 'localhost', '3306', 'metastore', 'hiveuser', 'password'),
('HIVE', 'conn-04', 'polaris', now(), 'polaris', now(), 0, NULL, 'localhost', 'conn-(ws03)', NULL, 'hive', 10000, 'JDBC', NULL, 'hive', NULL, NULL, NULL, NULL, NULL, false, 'WORKBENCH', 'MANUAL', 'localhost', '3306', 'metastore', 'hiveuser', 'password');

insert into dataconnection_workspace(ws_id, dc_id) values
('ws-00', 'conn-02'),
('ws-02', 'conn-02'),
('ws-03', 'conn-02'),
('ws-02', 'conn-03'),
('ws-03', 'conn-03'),
('ws-03', 'conn-04');
