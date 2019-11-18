INSERT INTO workspace(id, ws_name, ws_owner_id, ws_pub_type, ws_desc, version, created_time, created_by, modified_time, modified_by) VALUES
('ws-0001', 'Shared Workspace1', 'admin', 'SHARED', '', 1.0, NOW(), 'admin',  NOW(), 'admin'),
('ws-0002', 'Shared Workspace2', 'admin', 'SHARED', '', 1.0, NOW(), 'admin',  NOW(), 'admin'),
('ws-0003', 'Shared Workspace3', 'admin', 'SHARED', '', 1.0, NOW(), 'admin',  NOW(), 'admin');

INSERT INTO role_set_workspace(RS_ID, WS_ID) VALUES
('DEFAULT_ROLE_SET', 'ws-0002');

INSERT INTO workspace_member(id, member_id, member_type, member_role, ws_id) VALUES (200002, 'polaris', 'USER', 'Watcher', 'ws-0002');

INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_conn_type, ds_granularity, ds_src_type, ds_status, ds_published, ds_linked_workspaces, version, created_time, created_by, modified_time, modified_by) values
('ds-test-01', 'test1', 'test1', 'polaris', 'test1 data', 'MASTER', 'ENGINE', 'DAY', 'IMPORT', 'ENABLED', TRUE, 0, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds-test-02', 'test2', 'test2', 'polaris', 'test2 data', 'MASTER', 'ENGINE', 'DAY', 'IMPORT', 'ENABLED', NULL, 2, 1.0, NOW(), 'polaris',  NOW(), 'polaris');

INSERT INTO datasource_workspace(ws_id, ds_id) VALUES
('ws-0001', 'ds-test-01'),
('ws-0002', 'ds-test-01'),
('ws-0002', 'ds-test-02');

-- 테스트 Workbook 생성 (Public + Linked Case)
INSERT INTO BOOK(TYPE, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, BOOK_DESC, BOOK_FAVORITE, BOOK_FOLDER_ID, BOOK_NAME, BOOK_TAG, WS_ID) VALUES
('workbook', 'wb-001', 'admin', now(), 'admin', now(), 0, NULL, FALSE, 'ROOT', 'testworkbook-1', '', 'ws-02');
INSERT INTO BOOK_WORKBOOK(ID) VALUES('wb-001');

-- 테스트 Workbook 생성 (Public Case)
INSERT INTO BOOK(TYPE, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, BOOK_DESC, BOOK_FAVORITE, BOOK_FOLDER_ID, BOOK_NAME, BOOK_TAG, WS_ID) VALUES
('workbook', 'wb-002', 'admin', now(), 'admin', now(), 0, NULL, FALSE, 'ROOT', 'testworkbook-2', '', 'ws-02');
INSERT INTO BOOK_WORKBOOK(ID) VALUES('wb-002');

-- 대시보드 생성
INSERT INTO PUBLIC.DASHBOARD(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, BOARD_CONF, BOARD_DESCRIPTION, BOARD_IMAGE_URL, BOARD_NAME, BOARD_TAG, BOARD_SEQ, BOARD_HIDING, BOOK_ID) VALUES
('db-001', 'polaris', now(), 'polaris', now(), 0, '{"dataSource":{"type": "default", "name": "test1"}}', NULL, NULL, 'dashboard-test1', NULL, 0, FALSE ,'wb-001'),
('db-002', 'polaris', now(), 'polaris', now(), 0, '{"dataSource":{"type": "default", "name": "test1"}}', NULL, NULL, 'dashboard-test2', NULL, 1, TRUE, 'wb-002'),
('db-003', 'polaris', now(), 'polaris', now(), 0, '{"dataSource":{"type": "default", "name": "test2"}}', NULL, NULL, 'dashboard-test3', NULL, 2, NULL, 'wb-002'),
('db-004', 'polaris', now(), 'polaris', now(), 0, '{"dataSource":{"type": "default", "name": "test2"}}', NULL, NULL, 'dashboard-test4', NULL, 3, NULL, 'wb-002');
INSERT INTO PUBLIC.DATASOURCE_DASHBOARD(DASHBOARD_ID, DS_ID) VALUES
('db-001', 'ds-gis-37'),
('db-002', 'ds-gis-37'),
('db-003', 'ds-test-01'),
('db-004', 'ds-test-02');

COMMIT;