INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag01', 'admin', '2019-09-23 08:38:35', 'METADATA', 'test_tag_01', 'DOMAIN');
INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag02', 'admin', '2019-09-23 10:32:13', 'METADATA', 'test_tag_02', 'DOMAIN');
INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag03', 'admin', '2019-09-23 08:39:40', 'DASHBOARD', 'test_tag_03', 'DOMAIN');
INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag04', 'admin', '2019-09-23 08:38:43', 'METADATA', 'test_tag_04', 'DOMAIN');
INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag05', 'admin', '2019-09-23 08:38:56', 'METADATA', 'test_tag_05', 'DOMAIN');
INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag06', 'admin', '2019-09-23 08:39:39', 'DASHBOARD', 'test_tag_06', 'DOMAIN');
INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag07', 'admin', '2019-09-23 08:38:36', 'METADATA', 'test_tag_07', 'DOMAIN');
INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag08', 'admin', '2019-09-23 08:39:36', 'METADATA', 'test_tag_08', 'DOMAIN');
INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag09', 'admin', '2019-09-23 08:39:42', 'METADATA', 'test_tag_09', 'DOMAIN');
INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag10', 'admin', '2019-09-23 08:38:33', 'METADATA', 'test_tag_10', 'DOMAIN');
INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag11', 'admin', '2019-09-23 08:38:55', 'METADATA', 'test_tag_11', 'DOMAIN');
INSERT INTO tag (id, created_by, created_time, tag_domain, tag_name, tag_scope) VALUES ('tag12', 'admin', '2019-09-23 08:39:05', 'METADATA', 'test_tag_12', 'DOMAIN');

INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (1, 'admin', '2019-09-23 08:38:33', 'test_meta1', 'METADATA', 'tag01');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (2, 'admin', '2019-09-23 08:38:35', 'test_meta1', 'METADATA', 'tag02');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (3, 'admin', '2019-09-23 08:38:36', 'test_meta1', 'METADATA', 'tag03');

INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (4, 'admin', '2019-09-23 08:38:40', 'test_meta2', 'METADATA', 'tag01');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (5, 'admin', '2019-09-23 08:38:41', 'test_meta2', 'METADATA', 'tag02');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (6, 'admin', '2019-09-23 08:38:42', 'test_meta2', 'METADATA', 'tag03');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (7, 'admin', '2019-09-23 08:38:43', 'test_meta2', 'METADATA', 'tag04');

INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (8, 'admin', '2019-09-23 08:38:51', 'test_meta3', 'METADATA', 'tag01');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (9, 'admin', '2019-09-23 08:38:52', 'test_meta3', 'METADATA', 'tag02');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (10, 'admin', '2019-09-23 08:38:53', 'test_meta3', 'METADATA', 'tag03');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (11, 'admin', '2019-09-23 08:38:54', 'test_meta3', 'METADATA', 'tag04');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (12, 'admin', '2019-09-23 08:38:55', 'test_meta3', 'METADATA', 'tag05');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (13, 'admin', '2019-09-23 08:38:56', 'test_meta3', 'METADATA', 'tag06');

INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (14, 'admin', '2019-09-23 08:39:00', 'test_db4', 'DASHBOARD', 'tag01');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (15, 'admin', '2019-09-23 08:39:01', 'test_db4', 'DASHBOARD', 'tag02');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (16, 'admin', '2019-09-23 08:39:02', 'test_db4', 'DASHBOARD', 'tag03');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (17, 'admin', '2019-09-23 08:39:02', 'test_db4', 'DASHBOARD', 'tag04');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (18, 'admin', '2019-09-23 08:39:03', 'test_db4', 'DASHBOARD', 'tag05');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (19, 'admin', '2019-09-23 08:39:04', 'test_db4', 'DASHBOARD', 'tag06');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (20, 'admin', '2019-09-23 08:39:05', 'test_db4', 'DASHBOARD', 'tag07');

INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (21, 'admin', '2019-09-23 08:39:35', 'test_meta5', 'METADATA', 'tag01');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (22, 'admin', '2019-09-23 08:39:36', 'test_meta5', 'METADATA', 'tag02');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (23, 'admin', '2019-09-23 08:39:36', 'test_meta5', 'METADATA', 'tag03');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (24, 'admin', '2019-09-23 08:39:37', 'test_meta5', 'METADATA', 'tag04');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (25, 'admin', '2019-09-23 08:39:39', 'test_meta5', 'METADATA', 'tag05');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (26, 'admin', '2019-09-23 08:39:40', 'test_meta5', 'METADATA', 'tag06');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (27, 'admin', '2019-09-23 08:39:42', 'test_meta5', 'METADATA', 'tag07');
INSERT INTO tag_domain (id, created_by, created_time, domain_id, domain_type, tag_id) VALUES (28, 'admin', '2019-09-23 08:39:43', 'test_meta5', 'METADATA', 'tag08');