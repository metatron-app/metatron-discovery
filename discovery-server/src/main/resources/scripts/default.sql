-- User 정보
INSERT INTO users(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, USER_EMAIL, USER_FULL_NAME, USER_IMAGE_URL, USER_STATUS, USER_STATUS_MSG, USER_TEL, USER_NAME, USER_PASSWORD) VALUES
('admin', 'admin', now(), 'admin', now(), 0, 'admin@metatron.com', 'Administrator', NULL, 'ACTIVATED', NULL, NULL, 'admin', 'admin'),
('polaris', 'admin', now(), 'admin', now(), 0, 'polaris@metatron.com', 'Polaris', NULL, 'ACTIVATED', NULL, NULL, 'polaris', 'polaris'),
('metatron', 'admin', now(), 'admin', now(), 0, 'metatron@metatron.com', 'Metatron', NULL, 'ACTIVATED', NULL, NULL, 'metatron', 'metatron'),
('guest', 'admin', now(), 'admin', now(), 0, 'guest@metatron.com', 'Guest', NULL, 'ACTIVATED', NULL, NULL, 'guest', 'guest');

INSERT INTO user_group(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, GROUP_DESC, GROUP_NAME, GROUP_PREDEFINED, GROUP_MEMBER_COUNT, GROUP_DEFAULT) VALUES
('ID_GROUP_GENERAL_USER', 'admin', NOW(), 'admin', NOW(), 0, '', 'General-User', TRUE, 1, TRUE),
('ID_GROUP_DATA_MANAGER', 'admin', NOW(), 'admin', NOW(), 0, '', 'Data-Manager', TRUE, 1, null),
('ID_GROUP_ADMIN', 'admin', NOW(), 'admin', NOW(), 0, '', 'System-Admin', TRUE, 1, null);

INSERT INTO user_group_member(ID, MEMBER_ID, MEMBER_NAME, GROUP_ID) VALUES
(1000011, 'polaris', 'Polaris', 'ID_GROUP_DATA_MANAGER'),
(1000012, 'metatron', 'Metatron', 'ID_GROUP_GENERAL_USER'),
(1000013, 'admin', 'Administrator', 'ID_GROUP_ADMIN');

-- Global Role
INSERT INTO roles(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, ROLE_DESC, ROLE_NAME, ROLE_PREDEFINED, ROLE_SCOPE, ROLE_IS_ADMIN, ROLE_IS_DEFAULT, ROLE_SET_ID, ROLE_USER_COUNT, ROLE_GROUP_COUNT) VALUES
('ROLE_SYSTEM_ADMIN', 'admin', now(), 'admin', now(), 0, NULL, '__ADMIN', TRUE, 'GLOBAL', NULL, NULL, NULL, 0, 1),
('ROLE_SYSTEM_DATA_MANAGER', 'admin', now(), 'admin', now(), 0, NULL, '__DATA_MANAGER', TRUE, 'GLOBAL', NULL, NULL, NULL, 0, 2),
('ROLE_SYSTEM_WORKSPACE_MANAGER', 'admin', now(), 'admin', now(), 0, NULL, '__PERMISSION_MANAGER', TRUE, 'GLOBAL', NULL, TRUE, NULL, 0, 1),
('ROLE_SYSTEM_SHARED_USER', 'admin', now(), 'admin', now(), 0, NULL, '__SHARED_USER', TRUE, 'GLOBAL', NULL, TRUE, NULL, 0, 3),
('ROLE_SYSTEM_PRIVATE_USER', 'admin', now(), 'admin', now(), 0, NULL, '__PRIVATE_USER', TRUE, 'GLOBAL', NULL, NULL, NULL, 0, 3),
('ROLE_SYSTEM_GUEST', 'admin', now(), 'admin', now(), 0, NULL, '__GUEST', TRUE, 'GLOBAL', NULL, NULL, NULL, 1, 0);

INSERT INTO permissions(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, PERM_DOMAIN, PERM_NAME) VALUES
(110001, 'admin', now(), 'admin', now(), 0, 'SYSTEM', 'PERM_SYSTEM_MANAGE_USER'),
(110002, 'admin', now(), 'admin', now(), 0, 'SYSTEM', 'PERM_SYSTEM_MANAGE_SYSTEM'),
(110003, 'admin', now(), 'admin', now(), 0, 'SYSTEM', 'PERM_SYSTEM_MANAGE_DATASOURCE'),
(110008, 'admin', now(), 'admin', now(), 0, 'SYSTEM', 'PERM_SYSTEM_MANAGE_METADATA'),
(110007, 'admin', now(), 'admin', now(), 0, 'SYSTEM', 'PERM_SYSTEM_MANAGE_WORKSPACE'),
(110004, 'admin', now(), 'admin', now(), 0, 'SYSTEM', 'PERM_SYSTEM_MANAGE_SHARED_WORKSPACE'),
(110005, 'admin', now(), 'admin', now(), 0, 'SYSTEM', 'PERM_SYSTEM_MANAGE_PRIVATE_WORKSPACE'),
(110006, 'admin', now(), 'admin', now(), 0, 'SYSTEM', 'PERM_SYSTEM_VIEW_WORKSPACE');

INSERT INTO role_perm(ROLE_ID, PERM_ID) VALUES
('ROLE_SYSTEM_ADMIN', 110001),
('ROLE_SYSTEM_ADMIN', 110002),
('ROLE_SYSTEM_ADMIN', 110008),
('ROLE_SYSTEM_DATA_MANAGER', 110003),
('ROLE_SYSTEM_WORKSPACE_MANAGER', 110007),
('ROLE_SYSTEM_SHARED_USER', 110004),
('ROLE_SYSTEM_PRIVATE_USER', 110005),
('ROLE_SYSTEM_PRIVATE_USER', 110006),
('ROLE_SYSTEM_GUEST', 110006);

INSERT INTO role_directory(ID, ROLE_ID, DIRECTORY_ID, DIRECTORY_NAME, DIRECTORY_TYPE, CREATED_TIME) VALUES
(100001, 'ROLE_SYSTEM_ADMIN', 'ID_GROUP_ADMIN', 'System-Admin', 'GROUP', NOW()),
(100002, 'ROLE_SYSTEM_DATA_MANAGER', 'ID_GROUP_ADMIN', 'System-Admin', 'GROUP', NOW()),
(100003, 'ROLE_SYSTEM_SHARED_USER', 'ID_GROUP_ADMIN', 'System-Admin', 'GROUP', NOW()),
(100011, 'ROLE_SYSTEM_WORKSPACE_MANAGER', 'ID_GROUP_ADMIN', 'System-Admin', 'GROUP', NOW()),
(100004, 'ROLE_SYSTEM_PRIVATE_USER', 'ID_GROUP_ADMIN', 'System-Admin', 'GROUP', NOW()),
(100005, 'ROLE_SYSTEM_DATA_MANAGER', 'ID_GROUP_DATA_MANAGER', 'Data-Manager', 'GROUP', NOW()),
(100006, 'ROLE_SYSTEM_SHARED_USER', 'ID_GROUP_DATA_MANAGER', 'Data-Manager', 'GROUP', NOW()),
(100007, 'ROLE_SYSTEM_PRIVATE_USER', 'ID_GROUP_DATA_MANAGER', 'Data-Manager', 'GROUP', NOW()),
(100008, 'ROLE_SYSTEM_SHARED_USER', 'ID_GROUP_GENERAL_USER', 'General-User', 'GROUP', NOW()),
(100009, 'ROLE_SYSTEM_PRIVATE_USER', 'ID_GROUP_GENERAL_USER', 'General-User', 'GROUP', NOW()),
(100010, 'ROLE_SYSTEM_GUEST', 'guest', 'Guest', 'USER', NOW());

-- Workspace Role

INSERT INTO role_set(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, ROLE_SET_NAME, ROLE_SET_SCOPE, ROLE_SET_PREDEFINED, ROLE_SET_LINKED) VALUES
('DEFAULT_ROLE_SET', 'admin', now(), 'admin', now(), 0, 'Default Schema', 'PUBLIC', TRUE, 1);

INSERT INTO roles(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, ROLE_DESC, ROLE_NAME, ROLE_PREDEFINED, ROLE_SCOPE, ROLE_IS_ADMIN, ROLE_IS_DEFAULT, ROLE_SEQ, ROLE_SET_ID) VALUES
('ROLE_WORKSPACE_ADMIN', 'admin', now(), 'admin', now(), 0, NULL, 'Manager', TRUE, 'WORKSPACE', TRUE, FALSE, 1, 'DEFAULT_ROLE_SET'),
('ROLE_WORKSPACE_EDITOR', 'admin', now(), 'admin', now(), 0, NULL, 'Editor', TRUE, 'WORKSPACE', FALSE, FALSE, 2, 'DEFAULT_ROLE_SET'),
('ROLE_WORKSPACE_VIEWER', 'admin', now(), 'admin', now(), 0, NULL, 'Watcher', TRUE, 'WORKSPACE', FALSE, TRUE, 3, 'DEFAULT_ROLE_SET');

INSERT INTO permissions(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, PERM_DOMAIN, PERM_NAME) VALUES
(100010, 'admin', now(), 'admin', now(), 0, 'WORKSPACE', 'PERM_WORKSPACE_MANAGE_WORKSPACE'),
(100011, 'admin', now(), 'admin', now(), 0, 'WORKSPACE', 'PERM_WORKSPACE_MANAGE_FOLDER'),
(100012, 'admin', now(), 'admin', now(), 0, 'WORKSPACE', 'PERM_WORKSPACE_VIEW_WORKBOOK'),
(100013, 'admin', now(), 'admin', now(), 0, 'WORKSPACE', 'PERM_WORKSPACE_EDIT_WORKBOOK'),
(100014, 'admin', now(), 'admin', now(), 0, 'WORKSPACE', 'PERM_WORKSPACE_MANAGE_WORKBOOK'),
(100015, 'admin', now(), 'admin', now(), 0, 'WORKSPACE', 'PERM_WORKSPACE_VIEW_NOTEBOOK'),
(100016, 'admin', now(), 'admin', now(), 0, 'WORKSPACE', 'PERM_WORKSPACE_EDIT_NOTEBOOK'),
(100017, 'admin', now(), 'admin', now(), 0, 'WORKSPACE', 'PERM_WORKSPACE_MANAGE_NOTEBOOK'),
(100018, 'admin', now(), 'admin', now(), 0, 'WORKSPACE', 'PERM_WORKSPACE_VIEW_WORKBENCH'),
(100019, 'admin', now(), 'admin', now(), 0, 'WORKSPACE', 'PERM_WORKSPACE_EDIT_WORKBENCH'),
(100020, 'admin', now(), 'admin', now(), 0, 'WORKSPACE', 'PERM_WORKSPACE_MANAGE_WORKBENCH');

INSERT INTO role_perm(ROLE_ID, PERM_ID) VALUES
('ROLE_WORKSPACE_VIEWER', 100012),
('ROLE_WORKSPACE_VIEWER', 100015),
('ROLE_WORKSPACE_VIEWER', 100018),
('ROLE_WORKSPACE_EDITOR', 100012),
('ROLE_WORKSPACE_EDITOR', 100013),
('ROLE_WORKSPACE_EDITOR', 100015),
('ROLE_WORKSPACE_EDITOR', 100016),
('ROLE_WORKSPACE_EDITOR', 100018),
('ROLE_WORKSPACE_EDITOR', 100019),
('ROLE_WORKSPACE_ADMIN', 100010),
('ROLE_WORKSPACE_ADMIN', 100011),
('ROLE_WORKSPACE_ADMIN', 100012),
('ROLE_WORKSPACE_ADMIN', 100013),
('ROLE_WORKSPACE_ADMIN', 100014),
('ROLE_WORKSPACE_ADMIN', 100015),
('ROLE_WORKSPACE_ADMIN', 100016),
('ROLE_WORKSPACE_ADMIN', 100017),
('ROLE_WORKSPACE_ADMIN', 100018),
('ROLE_WORKSPACE_ADMIN', 100019),
('ROLE_WORKSPACE_ADMIN', 100020);

-- Workspace
INSERT INTO workspace(id, ws_name, ws_owner_id, ws_pub_type, ws_desc, ws_published, version, created_time, created_by, modified_time, modified_by) VALUES
('ws-00', 'Admin Workspace', 'admin', 'PRIVATE', '', FALSE, 1.0, NOW(), 'admin',  NOW(), 'admin'),
('ws-02', 'Polaris Workspace', 'polaris', 'PRIVATE', '', NULL, 1.0, NOW(), 'admin',  NOW(), 'admin'),
('ws-05', 'Metatron Workspace', 'metatron', 'PRIVATE', '', FALSE, 1.0, NOW(), 'admin',  NOW(), 'admin'),
('ws-03', 'Shared Workspace', 'polaris', 'SHARED', '', NULL, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ws-10', 'Guest Workspace', 'guest', 'SHARED', '', TRUE, 1.0, NOW(), 'polaris',  NOW(), 'polaris');

INSERT INTO workspace_member(id, member_id, member_type, member_role, ws_id) VALUES
(100001, 'admin', 'USER', 'Watcher', 'ws-03'),
(100002, 'metatron', 'USER', 'Editor', 'ws-03');

INSERT INTO role_set_workspace(RS_ID, WS_ID) VALUES
('DEFAULT_ROLE_SET', 'ws-03'),
('DEFAULT_ROLE_SET', 'ws-10');

-- DataSource
INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_src_type,ds_conn_type, ds_granularity, ds_status, ds_published, version, created_time, created_by, modified_time, modified_by) values
('ds-gis-37', 'sales', 'sales_geo', 'polaris', 'Sales data (2011~2014)', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris');

INSERT INTO field(id, ds_id, seq, field_name, field_type, field_logical_type, field_role, field_format) values
(10047000, 'ds-gis-37', 0, 'OrderDate', 'TIMESTAMP', null, 'TIMESTAMP', '{"type":"time_format","format":"yyyy-MM-dd HH:mm:ss"}'),
(10047001, 'ds-gis-37', 1, 'Category', 'STRING', null, 'DIMENSION', null),
(10047002, 'ds-gis-37', 2, 'City', 'STRING', null, 'DIMENSION', null),
(10047003, 'ds-gis-37', 3, 'Country', 'STRING', null, 'DIMENSION', null),
(10047004, 'ds-gis-37', 4, 'CustomerName', 'STRING', null, 'DIMENSION', null),
(10047005, 'ds-gis-37', 5, 'Discount', 'DOUBLE', null, 'MEASURE', null),
(10047006, 'ds-gis-37', 6, 'OrderID', 'STRING', null, 'DIMENSION', null),
(10047007, 'ds-gis-37', 7, 'PostalCode', 'STRING', null, 'DIMENSION', null),
(10047008, 'ds-gis-37', 8, 'ProductName', 'STRING', null, 'DIMENSION', null),
(10047009, 'ds-gis-37', 9, 'Profit', 'DOUBLE', null, 'MEASURE', null),
(10047010, 'ds-gis-37', 10, 'Quantity', 'STRING', null, 'DIMENSION', null),
(10047011, 'ds-gis-37', 11, 'Region', 'STRING', null, 'DIMENSION', null),
(10047012, 'ds-gis-37', 12, 'Sales', 'DOUBLE', null, 'MEASURE', null),
(10047013, 'ds-gis-37', 13, 'Segment', 'STRING', null, 'DIMENSION', null),
(10047014, 'ds-gis-37', 14, 'ShipDate', 'STRING', 'TIMESTAMP', 'DIMENSION', '{"type":"time_format","format":"yyyy. MM. dd.","timeZone":"DISABLE_ZONE"}'),
(10047015, 'ds-gis-37', 15, 'ShipMode', 'STRING', null, 'DIMENSION', null),
(10047016, 'ds-gis-37', 16, 'State', 'STRING', null, 'DIMENSION', null),
(10047017, 'ds-gis-37', 17, 'Sub-Category', 'STRING', null, 'DIMENSION', null),
(10047018, 'ds-gis-37', 18, 'DaystoShipActual', 'DOUBLE', null, 'MEASURE', null),
(10047019, 'ds-gis-37', 19, 'SalesForecast', 'DOUBLE', null, 'MEASURE', null),
(10047020, 'ds-gis-37', 20, 'ShipStatus', 'STRING', null, 'DIMENSION', null),
(10047021, 'ds-gis-37', 21, 'DaystoShipScheduled', 'DOUBLE', null, 'MEASURE', null),
(10047022, 'ds-gis-37', 22, 'OrderProfitable', 'STRING', null, 'DIMENSION', null),
(10047023, 'ds-gis-37', 23, 'SalesperCustomer', 'DOUBLE', null, 'MEASURE', null),
(10047024, 'ds-gis-37', 24, 'ProfitRatio', 'DOUBLE', null, 'MEASURE', null),
(10047025, 'ds-gis-37', 25, 'SalesaboveTarget', 'STRING', null, 'DIMENSION', null),
(10047026, 'ds-gis-37', 26, 'latitude', 'STRING', 'LNT', 'DIMENSION', null),
(10047027, 'ds-gis-37', 27, 'longitude', 'STRING', 'LNG', 'DIMENSION', null),
(10047028, 'ds-gis-37', 27, 'location', 'STRUCT', 'GEO_POINT', 'DIMENSION', null);
 
COMMIT;
