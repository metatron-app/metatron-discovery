INSERT INTO `datasource` (`id`,`created_by`,`created_time`,`modified_by`,`modified_time`,`version`,`ds_conn_type`,`datasource_contexts`,`ds_desc`,`ds_type`,`ds_engine_name`,`ds_granularity`,`ds_linked_workspaces`,`ds_name`,`ds_owner_id`,`ds_seg_granularity`,`ds_src_type`,`ds_status`) VALUES
('test_ds_id','admin', now(),'admin', now(), 2,'ENGINE',NULL,'','MASTER','test_datasource_engine','DAY',0,'test_datasource','admin','MONTH','FILE','ENABLED');

INSERT INTO `field` (`id`,`field_name`,`field_logical_name`,`field_desc`,`field_format`,`field_logical_type`,`field_role`,`seq`,`field_type`,`ref_id`,`ds_id`) VALUES
(10037064,'time','TIME','time desc','{"type":"time_format","format":"yyyy-MM-dd"}','TIMESTAMP','TIMESTAMP',0,'STRING',NULL,'test_ds_id'),
(10037065,'d','D','d desc',NULL,'STRING','DIMENSION',1,'STRING',NULL,'test_ds_id'),
(10037066,'sd','SD','sd desc',NULL,'STRING','DIMENSION',2,'STRING',NULL,'test_ds_id'),
(10037067,'m1','ME1','m1 desc',NULL,'INTEGER','MEASURE',3,'INTEGER',NULL,'test_ds_id'),
(10037068,'m2','ME2','m2 desc',NULL,'INTEGER','MEASURE',4,'INTEGER',NULL,'test_ds_id');

INSERT INTO mdm_metadata_source(id, meta_source_type, meta_source_name, meta_source_id, meta_source_schema, meta_source_table, created_by, created_time, modified_by, modified_time, version) values
('test_engine_source_01', 'ENGINE', 'test_datasource', 'test_ds_id', null, null, 'admin', NOW(),'admin', NOW(), 1.0);

INSERT INTO mdm_metadata(id, meta_name, meta_desc, meta_source_type, source_id, created_by, created_time, modified_by, modified_time, version) values
('test_meta1', 'test_datasource', 'meta description1', 'ENGINE', 'test_engine_source_01', 'admin', NOW(),'admin', NOW(), 1.0);

INSERT INTO mdm_metadata_column(id, meta_id, column_physical_type, column_physical_name, dictionary_id, column_type, column_name, column_format, column_field_ref) values
(10001, 'test_meta1', 'TIMESTAMP', 'time', null, 'TIMESTAMP', 'TIME', '{"type":"time_format","format":"yyyy-MM-dd"}', 10037064),
(10002, 'test_meta1', 'STRING', 'd', null, 'STRING', 'D', null, 10037065),
(10003, 'test_meta1', 'STRING', 'sd', null, 'STRING', 'SD', null, 10037066),
(10004, 'test_meta1', 'INTEGER', 'm1', null, 'INTEGER', 'ME1', null, 10037067),
(10005, 'test_meta1', 'INTEGER', 'm2', null, 'INTEGER', 'ME2', null, 10037068);
