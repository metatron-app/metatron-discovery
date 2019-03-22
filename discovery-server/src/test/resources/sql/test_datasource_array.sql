INSERT INTO `datasource` (`id`,`created_by`,`created_time`,`modified_by`,`modified_time`,`version`,`ds_conn_type`,`datasource_contexts`,`ds_desc`,`ds_type`,`ds_engine_name`,`ds_granularity`,`ds_linked_workspaces`,`ds_name`,`ds_owner_id`,`ds_seg_granularity`,`ds_src_type`,`ds_status`) VALUES
('test_ds_array_01','admin', now(),'admin', now(), 2,'ENGINE',NULL,'','MASTER','array_datasource','DAY',0,'test_datasource','admin','MONTH','FILE','ENABLED');

INSERT INTO `field` (`id`,`field_name`,`field_desc`,`field_format`,`field_logical_type`,`field_role`,`seq`,`field_type`,`ref_id`,`ds_id`) VALUES
(10037064,'time', 'time desc','{"type":"time_format","format":"yyyy-MM-dd"}','TIMESTAMP','TIMESTAMP',0,'STRING',NULL,'test_ds_array_01'),
(10037065,'d','d desc',NULL,'STRING','DIMENSION',1,'STRING',NULL,'test_ds_array_01'),
(10037066,'sd','sd desc',NULL,'ARRAY','DIMENSION',2,'STRING',NULL,'test_ds_array_01'),
(10037067,'array_measure', 'm1 desc',NULL,'ARRAY','MEASURE',3,'ARRAY',NULL,'test_ds_array_01');