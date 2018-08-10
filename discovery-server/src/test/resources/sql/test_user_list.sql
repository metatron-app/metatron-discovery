INSERT INTO users(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, USER_EMAIL, USER_FULL_NAME, USER_IMAGE_URL, USER_STATUS, USER_STATUS_MSG, USER_TEL, USER_NAME, USER_PASSWORD) VALUES
('test-admin-01', 'admin', TIMESTAMP '2017-09-10 10:30:00.00', 'admin', now(), 0, 'admin01@metatron.com', 'Administrator01', NULL, 'ACTIVATED', NULL, NULL, 'admin01', 'admin01'),
('test-admin-02', 'admin', TIMESTAMP '2017-09-12 10:30:00.00', 'admin', now(), 0, 'admin02@metatron.com', 'Administrator02', NULL, 'LOCKED', NULL, NULL, 'admin02', 'admin02'),
('test-super-01', 'admin', TIMESTAMP '2017-09-10 10:30:00.00', 'admin', now(), 0, 'super01@metatron.com', 'Supervisor01', NULL, 'ACTIVATED', NULL, NULL, 'super01', 'super01'),
('test-super-02', 'admin', TIMESTAMP '2017-09-12 10:30:00.00', 'admin', now(), 0, 'super02@metatron.com', 'Supervisor02', NULL, 'REJECTED', NULL, NULL, 'super02', 'super02'),
('test-user-01', 'admin', TIMESTAMP '2017-09-10 10:30:00.00', 'admin', now(), 0, 'user01@metatron.com', 'User01', NULL, 'ACTIVATED', NULL, NULL, 'user01', 'user01'),
('test-user-02', 'admin', TIMESTAMP '2017-09-11 10:30:00.00', 'admin', now(), 0, 'user02@metatron.com', 'User02', NULL, 'REQUESTED', NULL, NULL, 'user02', 'user02'),
('test-user-03', 'admin', TIMESTAMP '2017-09-12 10:30:00.00', 'admin', now(), 0, 'user03@metatron.com', 'User03', NULL, 'LOCKED', NULL, NULL, 'user03', 'user03');

INSERT INTO role_directory(ID, ROLE_ID, DIRECTORY_ID, DIRECTORY_NAME, DIRECTORY_TYPE, CREATED_TIME) VALUES
(500001, 'ROLE_SYSTEM_ADMIN', 'admin01', 'Administrator01', 'USER', NOW()),
(500002, 'ROLE_SYSTEM_ADMIN', 'admin02', 'Administrator02', 'USER', NOW()),
(500003, 'ROLE_SYSTEM_DATA_MANAGER', 'super01', 'Supervisor01', 'USER', NOW()),
(500004, 'ROLE_SYSTEM_DATA_MANAGER', 'super02', 'Supervisor02', 'USER', NOW()),
(500005, 'ROLE_SYSTEM_SHARED_USER', 'user01', 'User01', 'USER', NOW()),
(500006, 'ROLE_SYSTEM_SHARED_USER', 'user02', 'User02', 'USER', NOW()),
(500007, 'ROLE_SYSTEM_SHARED_USER', 'user03', 'User03', 'USER', NOW());
