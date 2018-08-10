-- DataSource
INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_conn_type, ds_src_type, ds_granularity, ds_status, ds_published, version, created_time, created_by, modified_time, modified_by) values
('ds-sales-join-01', 'sales joins category', 'sales_join_category', 'polaris', 'sales join category', 'MASTER', 'ENGINE', 'IMPORT', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris');
INSERT INTO field(id, ds_id, seq, field_name, field_type, field_logical_type, field_role, field_format) values
(10038001, 'ds-sales-join-01', 0, 'time', 'TIMESTAMP', 'TIMESTAMP', 'TIMESTAMP', 'yyyy-MM-dd'),
(10038002, 'ds-sales-join-01', 2, 'cat', 'STRING', 'STRING', 'DIMENSION', null ),
(10038003, 'ds-sales-join-01', 3, 'value', 'STRING', 'STRING', 'DIMENSION', null ),
(10038004, 'ds-sales-join-01', 4, 'abbr', 'STRING', 'STRING', 'DIMENSION', null ),
(10038005, 'ds-sales-join-01', 5, 'count', 'DOUBLE', 'DOUBLE', 'MEASURE', null );
INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_conn_type, ds_src_type, ds_granularity, ds_status, ds_published, version, created_time, created_by, modified_time, modified_by) values
('ds-sales-join-02', 'sales multi joins', 'sales_multi_join_category', 'polaris', 'sales multi join category', 'MASTER', 'ENGINE', 'IMPORT', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris');
INSERT INTO field(id, ds_id, seq, field_name, field_type, field_logical_type, field_role, field_format) values
(10039001, 'ds-sales-join-02', 0, 'time', 'TIMESTAMP',  'TIMESTAMP', 'TIMESTAMP', 'yyyy-MM-dd'),
(10039002, 'ds-sales-join-02', 1, 'cat', 'STRING', 'STRING', 'DIMENSION', null ),
(10039003, 'ds-sales-join-02', 2, 'subcat', 'STRING', 'STRING', 'DIMENSION', null ),
(10039004, 'ds-sales-join-02', 3, 'value', 'STRING', 'STRING', 'DIMENSION', null ),
(10039005, 'ds-sales-join-02', 4, 'subvalue', 'STRING', 'STRING', 'DIMENSION', null ),
(10039006, 'ds-sales-join-02', 5, 'abbr', 'STRING', 'STRING', 'DIMENSION', null ),
(10039007, 'ds-sales-join-02', 6, 'count', 'DOUBLE', 'DOUBLE', 'MEASURE', null );
INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_conn_type, ds_src_type, ds_granularity, ds_status, ds_published, version, created_time, created_by, modified_time, modified_by) values
('ds-sales-join-03', 'sales joins region', 'sales_join_region', 'polaris', 'sales join region', 'MASTER', 'ENGINE', 'IMPORT', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris');
INSERT INTO field(id, ds_id, seq, field_name, field_type, field_logical_type, field_role, field_format) values
(10040001, 'ds-sales-join-03', 0, 'time', 'TIMESTAMP', 'TIMESTAMP', 'TIMESTAMP', 'yyyy-MM-dd'),
(10040002, 'ds-sales-join-03', 1, 'region', 'STRING', 'STRING', 'DIMENSION', null ),
(10040003, 'ds-sales-join-03', 2, 'value', 'STRING', 'STRING', 'DIMENSION', null ),
(10040004, 'ds-sales-join-03', 3, 'count', 'DOUBLE', 'DOUBLE', 'MEASURE', null );
INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_conn_type, ds_src_type, ds_granularity, ds_status, ds_published, version, created_time, created_by, modified_time, modified_by) values
('ds-sales-join-04', 'sales joins cat - abbr', 'sales_join_category_abbr', 'polaris', 'sales join cat - abbr', 'MASTER', 'ENGINE', 'IMPORT', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris');
INSERT INTO field(id, ds_id, seq, field_name, field_type, field_logical_type, field_role, field_format) values
(10041001, 'ds-sales-join-04', 0, 'time', 'TIMESTAMP', 'TIMESTAMP', 'TIMESTAMP', 'yyyy-MM-dd'),
(10041002, 'ds-sales-join-04', 1, 'cat', 'STRING', 'STRING', 'DIMENSION', null ),
(10041003, 'ds-sales-join-04', 2, 'abbr', 'STRING', 'STRING', 'DIMENSION', null ),
(10041004, 'ds-sales-join-04', 3, 'count', 'DOUBLE', 'DOUBLE', 'MEASURE', null );
COMMIT;
