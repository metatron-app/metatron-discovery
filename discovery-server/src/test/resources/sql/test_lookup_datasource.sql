INSERT INTO datasource(id, ds_name, ds_alias, ds_owner_id, ds_desc, ds_filter_at_select, ds_type, ds_conn_type, ds_granularity, ds_enabled, ds_status, dc_id, ingest_id, version, created_time, created_by, modified_time, modified_by) values
('lookup-test', 'lookup_test', 'lookup-test', 'polaris', 'lookup desc', true, 'LOOKUP', 'ENGINE', NULL, true, 'ENABLED', NULL, NULL, 1.0, NOW(), 'admin',  NOW(), 'admin');
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values
(11141010, 'lookup-test', 0, 'cat', 'TEXT', 'DIMENSION' ),
(11141012, 'lookup-test', 2, 'lv1', 'TEXT', 'DIMENSION' ),
(11141013, 'lookup-test', 3, 'lv2', 'TEXT', 'DIMENSION' );
INSERT INTO datasource(id, ds_name, ds_alias, ds_owner_id, ds_desc, ds_filter_at_select, ds_type, ds_conn_type, ds_granularity, ds_enabled, ds_status, dc_id, ingest_id, version, created_time, created_by, modified_time, modified_by) values
('lookup-multi-test', 'lookup_multi_test', 'lookup-test', 'polaris', 'lookup desc', true, 'LOOKUP', 'ENGINE', NULL, true, 'ENABLED', NULL, NULL, 1.0, NOW(), 'admin',  NOW(), 'admin');
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values
(11141000, 'lookup-multi-test', 0, 'cat', 'TEXT', 'DIMENSION' ),
(11141001, 'lookup-multi-test', 1, 'subcat', 'TEXT', 'DIMENSION' ),
(11141002, 'lookup-multi-test', 2, 'lv1', 'TEXT', 'DIMENSION' ),
(11141003, 'lookup-multi-test', 3, 'lv2', 'TEXT', 'DIMENSION' );
