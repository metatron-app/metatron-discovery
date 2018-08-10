INSERT INTO DATASOURCE_QUERY(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, QUERY_DS_ID, QUERY_ELAPSED_TIME, QUERY_ENGINE_ELAPSED_TIME, QUERY_ENGINE, QUERY_ENGINE_TYPE, QUERY_ENGINE_FORWARD, QUERY_MESSAGE, QUERY, QUERY_TYPE, QUERY_RESULT_COUNT, QUERY_RESULT_SIZE, QUERY_SUCCEED) VALUES
('query-001', 'polaris@metatron.com', TIMESTAMP '2016-09-01 01:33:09.819', 'polaris@metatron.com', TIMESTAMP '2016-09-01 01:33:09.819', 0, 'ds-37', 30, 30, '{druid_query}', 'GROUPBY', 'NONE', NULL, '{metatron_query}', 'SEARCH', 3, NULL, TRUE),
('query-002', 'test1@metatron.com', TIMESTAMP '2016-09-01 02:33:09.819', 'test1@metatron.com', TIMESTAMP '2016-09-01 02:33:09.819', 0, 'ds-37', 330, 30, '{druid_query}', 'GROUPBY', 'NONE', NULL, '{metatron_query}', 'SEARCH', 3, NULL, TRUE),
('query-003', 'polaris@metatron.com', TIMESTAMP '2016-09-01 02:33:09.819', 'polaris@metatron.com', TIMESTAMP '2016-09-01 02:33:09.819', 0, 'ds-37', 3000, 30, '{druid_query}', 'TOPN', 'NONE', NULL, '{metatron_query}', 'CANDIDATE', 3, NULL, TRUE),
('query-004', 'polaris@metatron.com', TIMESTAMP '2016-09-01 03:33:09.819', 'polaris@metatron.com', TIMESTAMP '2016-09-01 03:33:09.819', 0, 'ds-37', 5000, 30, '{druid_query}', 'GROUPBY', 'NONE', NULL, '{metatron_query}', 'SEARCH', 3, NULL, TRUE),
('query-005', 'test1@metatron.com', TIMESTAMP '2016-09-01 04:33:09.819', 'test1@metatron.com', TIMESTAMP '2016-09-01 04:33:09.819', 0, 'ds-37', 12000, 30, '{druid_query}', 'GROUPBY', 'NONE', NULL, '{metatron_query}', 'SEARCH', 3, NULL, TRUE),
('query-006', 'polaris@metatron.com', TIMESTAMP '2016-09-01 05:33:09.819', 'polaris@metatron.com', TIMESTAMP '2016-09-01 05:33:09.819', 0, 'ds-37', 50000, 30, '{druid_query}', 'TOPN', 'NONE', NULL, '{metatron_query}', 'CANDIDATE', 3, NULL, FALSE),
('query-007', 'polaris@metatron.com', TIMESTAMP '2016-09-01 05:33:09.819', 'polaris@metatron.com', TIMESTAMP '2016-09-01 05:33:09.819', 0, 'ds-37', 3220000, 30, '{druid_query}', 'GROUPBY', 'NONE', NULL, '{metatron_query}', 'SEARCH', 3, NULL, TRUE),
('query-008', 'polaris@metatron.com', TIMESTAMP '2016-09-01 05:33:09.819', 'polaris@metatron.com', TIMESTAMP '2016-09-01 05:33:09.819', 0, 'ds-37', 300, 30, '{druid_query}', 'SEARCH', 'NONE', NULL, '{metatron_query}', 'CANDIDATE', 3, NULL, TRUE),
('query-009', 'test1@metatron.com', TIMESTAMP '2016-09-01 06:33:09.819', 'test1@metatron.com', TIMESTAMP '2016-09-01 06:33:09.819', 0, 'ds-37', 300, 30, '{druid_query}', 'SEARCH', 'NONE', NULL, '{metatron_query}', 'CANDIDATE', 3, NULL, FALSE),
('query-010', 'polaris@metatron.com', TIMESTAMP '2016-09-01 07:33:09.819', 'polaris@metatron.com', TIMESTAMP '2016-09-01 07:33:09.819', 0, 'ds-37', 310, 30, '{druid_query}', 'GROUPBY', 'NONE', NULL, '{metatron_query}', 'SEARCH', 3, NULL, TRUE),
('query-011', 'polaris@metatron.com', TIMESTAMP '2016-09-01 08:33:09.819', 'polaris@metatron.com', TIMESTAMP '2016-09-01 08:33:09.819', 0, 'ds-37', 310, 30, '{druid_query}', 'SEARCH', 'NONE', NULL, '{metatron_query}', 'CANDIDATE', 3, NULL, TRUE),
('query-012', 'polaris@metatron.com', TIMESTAMP '2016-09-01 09:33:09.819', 'polaris@metatron.com', TIMESTAMP '2016-09-01 09:33:09.819', 0, 'ds-37', 3100, 30, '{druid_query}', 'GROUPBY', 'NONE', NULL, '{metatron_query}', 'SEARCH', 3, NULL, FALSE),
('query-013', 'test2@metatron.com', TIMESTAMP '2016-09-01 10:33:09.819', 'test2@metatron.com', TIMESTAMP '2016-09-01 10:33:09.819', 0, 'ds-37', 310000, 30, '{druid_query}', 'SELECT', 'NONE', NULL, '{metatron_query}', 'SEARCH', 3, NULL, TRUE),
('query-014', 'test2@metatron.com', TIMESTAMP '2016-09-01 11:33:09.819', 'test2@metatron.com', TIMESTAMP '2016-09-01 11:33:09.819', 0, 'ds-37', 31000, 30, '{druid_query}', 'SELECT', 'NONE', NULL, '{metatron_query}', 'SEARCH', 3, NULL, TRUE);

INSERT INTO DATASOURCE_SIZE_HISTORY(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, DS_ID, DS_SIZE) VALUES
('e852b895-cc8c-4c3c-ac04-b985cd6ae738', 'unknown', TIMESTAMP '2016-09-03 04:42:30.09', 'unknown', TIMESTAMP '2016-09-03 04:42:30.09', 0, 'ds-37', 2665078),
('c381cdc0-53a1-4c7e-822c-f9062b43fcd0', 'unknown', TIMESTAMP '2016-09-03 05:42:40.043', 'unknown', TIMESTAMP '2016-09-03 04:42:40.043', 0, 'ds-37', 2665078),
('cb1dfce8-f6a4-4927-8c30-81171c401c5d', 'unknown', TIMESTAMP '2016-09-03 06:42:50.043', 'unknown', TIMESTAMP '2016-09-03 04:42:50.043', 0, 'ds-37', 2665078),
('5d892244-8caa-4d00-80e4-4486904ee1b0', 'unknown', TIMESTAMP '2016-09-03 07:43:00.034', 'unknown', TIMESTAMP '2016-09-03 04:43:00.034', 0, 'ds-37', 2665078),
('b7fec573-5ac7-4027-95ab-3acda0fe67c6', 'unknown', TIMESTAMP '2016-09-03 08:43:10.034', 'unknown', TIMESTAMP '2016-09-03 04:43:10.034', 0, 'ds-37', 2665078),
('ee047490-54bb-4b55-be38-7a19f8a26484', 'unknown', TIMESTAMP '2016-09-03 09:43:20.047', 'unknown', TIMESTAMP '2016-09-03 04:43:20.047', 0, 'ds-37', 2665078),
('c95d7c1f-f73a-4015-8dbf-ea31b04c69ce', 'unknown', TIMESTAMP '2016-09-03 10:43:30.04', 'unknown', TIMESTAMP '2016-09-03 04:43:30.04', 0, 'ds-37', 2665078),
('3b42be3c-f9e4-40ca-92a9-943cf95f006c', 'unknown', TIMESTAMP '2016-09-03 11:43:40.042', 'unknown', TIMESTAMP '2016-09-03 04:43:40.042', 0, 'ds-37', 2665078);

