-- 테스트 Workbook 생성
INSERT INTO BOOK(TYPE, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, BOOK_DESC, BOOK_FAVORITE, BOOK_FOLDER_ID, BOOK_NAME, BOOK_TAG, WS_ID) VALUES
('workbook', 'wb-001', 'admin', now(), 'admin', now(), 0, NULL, FALSE, 'ROOT', 'testworkbook-1', '', 'ws-02');
INSERT INTO BOOK_WORKBOOK(ID) VALUES('wb-001');
INSERT INTO BOOK(TYPE, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, BOOK_DESC, BOOK_FAVORITE, BOOK_FOLDER_ID, BOOK_NAME, BOOK_TAG, WS_ID) VALUES
('workbook', 'wb-002', 'admin', now(), 'admin', now(), 0, NULL, FALSE, 'ROOT', 'testworkbook-2', '', 'ws-02');
INSERT INTO BOOK_WORKBOOK(ID) VALUES('wb-002');
-- 테스트 folder 생성
INSERT INTO BOOK(TYPE, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, BOOK_DESC, BOOK_FAVORITE, BOOK_FOLDER_ID, BOOK_NAME, BOOK_TAG, WS_ID) VALUES
('folder', 'wb-folder-001', 'admin', now(), 'admin', now(), 0, NULL, FALSE, 'ROOT', 'testfolder-1', '', 'ws-02');
INSERT INTO BOOK_FOLDER(ID) VALUES('wb-folder-001');
INSERT INTO BOOK(TYPE, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, BOOK_DESC, BOOK_FAVORITE, BOOK_FOLDER_ID, BOOK_NAME, BOOK_TAG, WS_ID) VALUES
('workbook', 'wb-003', 'admin', now(), 'admin', now(), 0, NULL, FALSE, 'wb-folder-001', 'testworkbook-folder1', '', 'ws-02');
INSERT INTO BOOK_WORKBOOK(ID) VALUES('wb-003');
INSERT INTO PUBLIC.BOOK_TREE(BOOK_ANCESTOR, BOOK_DESCENDANT, BOOK_DEPTH) VALUES
('wb-folder-001', 'wb-folder-001', 0),
('wb-003', 'wb-003', 0),
('wb-folder-001', 'wb-003', 1);

INSERT INTO DATACONNECTION(DC_IMPLEMENTOR, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, DC_DESC, DC_HOSTNAME, DC_NAME, DC_OPTIONS, DC_PASSWORD, DC_PORT, DC_TYPE, DC_URL, DC_USERNAME, DC_DATABASE, PATH, DC_CATALOG, DC_SID, REMOVEFIRSTROW, DC_USAGE_SCOPE) VALUES
('MYSQL', 'mysql-connection', 'polaris', now(), 'polaris', '2017-08-13T15:11:07', 0, NULL, 'localhost', 'mysql-local-conn', NULL, 'polaris', 3306, 'JDBC', NULL, 'polaris', 'polaris', NULL, NULL, NULL, NULL, 'DEFAULT');

-- 링크할 테스트 데이터 소스
INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_conn_type, ds_src_type, ds_granularity, ds_status, ds_published, ds_linked_workspaces, dc_id, version, created_time, created_by, modified_time, modified_by) values
('ds-test-01', 'test1', 'test1', 'polaris', 'test1 data', 'MASTER', 'ENGINE', 'IMPORT', 'DAY', 'ENABLED', TRUE, 0, 'mysql-connection', 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds-test-02', 'test2', 'test2', 'polaris', 'test2 data', 'MASTER', 'ENGINE', 'IMPORT', 'DAY', 'ENABLED', TRUE, 0, 'mysql-connection', 1.0, NOW(), 'polaris',  NOW(), 'polaris');

INSERT INTO datasource_workspace(ws_id, ds_id) VALUES
('ws-00', 'ds-test-01'),
('ws-02', 'ds-test-01'),
('ws-02', 'ds-test-02');

-- 대시보드 생성
INSERT INTO DASHBOARD(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, BOARD_CONF, BOARD_DESCRIPTION, BOARD_IMAGE_URL, BOARD_NAME, BOARD_TAG, BOARD_SEQ, BOARD_HIDING, BOOK_ID) VALUES
('db-001', 'polaris', now(), 'polaris', now(), 0, '{"dataSource":{"type": "default", "name": "test1"}}', NULL, NULL, 'dashboard-test1', NULL, 0, FALSE ,'wb-001'),
('db-002', 'polaris', now(), 'polaris', now(), 0, '{"dataSource":{"type": "default", "name": "test1"}}', NULL, NULL, 'dashboard-test2', NULL, 1, TRUE, 'wb-001'),
('db-003', 'polaris', now(), 'polaris', now(), 0, '{"dataSource":{"type": "default", "name": "test2"}}', NULL, NULL, 'dashboard-test3', NULL, 2, NULL, 'wb-003'),
('db-004', 'polaris', now(), 'polaris', now(), 0, '{"dataSource":{"type": "default", "name": "test2"}}', NULL, NULL, 'dashboard-test4', NULL, 3, TRUE, 'wb-003'),
('db-005', 'polaris', now(), 'polaris', now(), 0, '{"dataSource":{"type": "default", "name": "sales"}}', NULL, NULL, 'dashboard-test5', NULL, 3, NULL, 'wb-003');
INSERT INTO DATASOURCE_DASHBOARD(DASHBOARD_ID, DS_ID) VALUES
('db-001', 'ds-test-01'),
('db-002', 'ds-test-01'),
('db-003', 'ds-test-02'),
('db-004', 'ds-test-02'),
('db-005', 'ds-37');
INSERT INTO COMMENT(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, COMMENT_DOMAIN_TYPE, COMMENT_DOMAIN_ID, COMMENT_CONTENTS) VALUES
(1000001, 'polaris', now(), 'polaris', now(), 0, 'WORKBOOK', 'wb-001', '댓글1'),
(1000002, 'polaris', now(), 'polaris', now(), 0, 'WORKBOOK', 'wb-001', '댓글2');