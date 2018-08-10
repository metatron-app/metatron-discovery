INSERT INTO users(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, USER_EMAIL, USER_FULL_NAME, USER_IMAGE_URL, USER_STATUS, USER_STATUS_MSG, USER_TEL, USER_NAME, USER_PASSWORD) VALUES
('mobigen', 'admin', now(), 'admin', now(), 0, 'mobigen@mobigen.com', 'IBK', NULL, 'ACTIVATED', NULL, NULL, 'mobigen', 'mobigen');
INSERT INTO user_role(USER_ID, ROLE_ID) VALUES
('mobigen', 'ROLE_SYSTEM_SUPERVISOR');
INSERT INTO workspace(id, ws_name, ws_owner_id, ws_pub_type, ws_desc, version, created_time, created_by, modified_time, modified_by) VALUES
('ws-200', 'Mobigen Workspace', 'mobigen', 'PRIVATE', '', 1.0, NOW(), 'admin',  NOW(), 'admin');

INSERT INTO users(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, USER_EMAIL, USER_FULL_NAME, USER_IMAGE_URL, USER_STATUS, USER_STATUS_MSG, USER_TEL, USER_NAME, USER_PASSWORD) VALUES
('metatron_test1', 'admin', now(), 'admin', now(), 0, 'metatron_test1@metatron.com', '테스트1', NULL, 'ACTIVATED', NULL, NULL, 'metatron_test1', 'metatron_test');
INSERT INTO user_role(USER_ID, ROLE_ID) VALUES
('metatron_test1', 'ROLE_SYSTEM_ADMIN');
INSERT INTO workspace(id, ws_name, ws_owner_id, ws_pub_type, ws_desc, version, created_time, created_by, modified_time, modified_by) VALUES
('ws-501', '테스트1 Workspace', 'metatron_test1', 'PRIVATE', '', 1.0, NOW(), 'admin',  NOW(), 'admin');

INSERT INTO users(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, USER_EMAIL, USER_FULL_NAME, USER_IMAGE_URL, USER_STATUS, USER_STATUS_MSG, USER_TEL, USER_NAME, USER_PASSWORD) VALUES
('metatron_test2', 'admin', now(), 'admin', now(), 0, 'metatron_test2@metatron.com', '테스트2', NULL, 'ACTIVATED', NULL, NULL, 'metatron_test2', 'metatron_test');
INSERT INTO user_role(USER_ID, ROLE_ID) VALUES
('metatron_test2', 'ROLE_SYSTEM_SUPERVISOR');
INSERT INTO workspace(id, ws_name, ws_owner_id, ws_pub_type, ws_desc, version, created_time, created_by, modified_time, modified_by) VALUES
('ws-502', '테스트2 Workspace', 'metatron_test2', 'PRIVATE', '', 1.0, NOW(), 'admin',  NOW(), 'admin');

INSERT INTO users(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, USER_EMAIL, USER_FULL_NAME, USER_IMAGE_URL, USER_STATUS, USER_STATUS_MSG, USER_TEL, USER_NAME, USER_PASSWORD) VALUES
('metatron_test3', 'admin', now(), 'admin', now(), 0, 'metatron_test3@metatron.com', '테스트3', NULL, 'ACTIVATED', NULL, NULL, 'metatron_test3', 'metatron_test');
INSERT INTO user_role(USER_ID, ROLE_ID) VALUES
('metatron_test3', 'ROLE_SYSTEM_USER');
INSERT INTO workspace(id, ws_name, ws_owner_id, ws_pub_type, ws_desc, version, created_time, created_by, modified_time, modified_by) VALUES
('ws-503', '테스트3 Workspace', 'metatron_test3', 'PRIVATE', '', 1.0, NOW(), 'admin',  NOW(), 'admin');

INSERT INTO users(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, USER_EMAIL, USER_FULL_NAME, USER_IMAGE_URL, USER_STATUS, USER_STATUS_MSG, USER_TEL, USER_NAME, USER_PASSWORD) VALUES
('skl', 'admin', now(), 'admin', now(), 0, 'skl@metatron.com', 'SKL', NULL, 'ACTIVATED', NULL, NULL, 'skl', 'skl');
INSERT INTO user_role(USER_ID, ROLE_ID) VALUES
('skl', 'ROLE_SYSTEM_SUPERVISOR');
INSERT INTO workspace(id, ws_name, ws_owner_id, ws_pub_type, ws_desc, version, created_time, created_by, modified_time, modified_by) VALUES
('ws-802', 'SKL Workspace', 'skl', 'PRIVATE', '', 1.0, NOW(), 'admin',  NOW(), 'admin');

INSERT INTO users(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, USER_EMAIL, USER_FULL_NAME, USER_IMAGE_URL, USER_STATUS, USER_STATUS_MSG, USER_TEL, USER_NAME, USER_PASSWORD) VALUES
('o2o', 'admin', now(), 'admin', now(), 0, 'o2o@metatron.com', 'O2O', NULL, 'ACTIVATED', NULL, NULL, 'o2o', 'o2o');
INSERT INTO user_role(USER_ID, ROLE_ID) VALUES
('o2o', 'ROLE_SYSTEM_SUPERVISOR');
INSERT INTO workspace(id, ws_name, ws_owner_id, ws_pub_type, ws_desc, version, created_time, created_by, modified_time, modified_by) VALUES
('ws-902', 'O2O Workspace', 'o2o', 'PRIVATE', '', 1.0, NOW(), 'admin',  NOW(), 'admin');
