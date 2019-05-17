INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_src_type, ds_type, ds_conn_type, ds_granularity, ds_status, ds_published, ds_linked_workspaces, version, created_time, created_by, modified_time, modified_by) values
('ds-test-01', 'test1', 'test1', 'polaris', 'test1 data', 'IMPORT', 'MASTER', 'ENGINE', 'DAY', 'ENABLED', TRUE, 0, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds-test-02', 'test2', 'test2', 'polaris', 'test2 data', 'IMPORT', 'MASTER', 'ENGINE', 'DAY', 'DISABLED', FALSE, 2, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds-test-03', 'test3', 'test3', 'polaris', 'test3 data', 'IMPORT', 'MASTER', 'ENGINE', 'DAY', 'FAILED', FALSE, 1, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds-test-04', 'test4', 'test4', 'polaris', 'test4 data', 'IMPORT', 'MASTER', 'ENGINE', 'DAY', 'ENABLED', FALSE, 0, 1.0, NOW(), 'polaris',  NOW(), 'polaris');
INSERT INTO datasource_workspace(ws_id, ds_id) VALUES
('ws-02', 'ds-test-02'),
('ws-03', 'ds-test-02'),
('ws-02', 'ds-test-03'),
('ws-02', 'ds-test-04');

