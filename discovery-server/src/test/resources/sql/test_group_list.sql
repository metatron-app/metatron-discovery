INSERT INTO user_group(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, GROUP_DESC, GROUP_NAME, GROUP_PREDEFINED, GROUP_MEMBER_COUNT) VALUES
('group_test_01', 'admin', TIMESTAMP '2017-09-10 10:30:00.00', 'admin', now(), 0, 'description_01', 'group-admin-01', FALSE, 3),
('group_test_02', 'admin', TIMESTAMP '2017-09-12 10:30:00.00', 'admin', now(), 0, 'description_01', 'group-super-01', FALSE, 1),
('group_test_03', 'admin', TIMESTAMP '2017-09-13 10:30:00.00', 'admin', now(), 0, 'description_01', 'group-user-01', FALSE, 2),
('group_test_04', 'admin', TIMESTAMP '2017-09-14 10:30:00.00', 'admin', now(), 0, 'description_01', 'group-admin-02', FALSE, 1),
('group_test_05', 'admin', TIMESTAMP '2017-09-15 10:30:00.00', 'admin', now(), 0, 'description_01', 'group-super-02', FALSE, 0),
('group_test_06', 'admin', TIMESTAMP '2017-09-16 10:30:00.00', 'admin', now(), 0, 'description_01', 'group-user-02', FALSE, 0);

INSERT INTO user_group_member(ID, MEMBER_ID, MEMBER_NAME, GROUP_ID) VALUES
(1000001, 'polaris', 'Polaris', 'group_test_01'),
(1000002, 'metatron', 'Metatron', 'group_test_01'),
(1000003, 'admin', 'Admin', 'group_test_02'),
(1000004, 'admin', 'Admin', 'group_test_03'),
(1000005, 'polaris', 'Polaris', 'group_test_03'),
(1000006, 'metatron', 'Metatron', 'group_test_04');

INSERT INTO user_org_member(ID, MEMBER_ID, MEMBER_NAME, MEMBER_TYPE, ORG_ID) VALUES
(998, 'group_test_01', 'group-admin-01', 'USER', 'org_test_01');
