INSERT INTO roles(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, ROLE_DESC, ROLE_NAME, ROLE_PREDEFINED, ROLE_REF_NAME, ROLE_SCOPE, WS_ID) VALUES
('role_test_search_001', 'admin', now(), 'admin', now(), 0, NULL, 'test_abc', TRUE, 'SYSTEM_ADMIN', 'GLOBAL', NULL),
('role_test_search_002', 'admin', now(), 'admin', now(), 0, NULL, '테스트 그룹', TRUE, 'SYSTEM_SUPERVISOR', 'GLOBAL', NULL),
('role_test_search_003', 'admin', now(), 'admin', now(), 0, NULL, '45.abc', TRUE, 'SYSTEM_USER', 'GLOBAL', NULL);
INSERT INTO role_perm(ROLE_ID, PERM_ID) VALUES
('role_test_search_003', 100003),
('role_test_search_002', 100003),
('role_test_search_002', 100002),
('role_test_search_001', 100003),
('role_test_search_001', 100002),
('role_test_search_001', 100001);
COMMIT ;
