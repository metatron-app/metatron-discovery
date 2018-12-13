INSERT INTO `datasource` (`id`,`created_by`,`created_time`,`modified_by`,`modified_time`,`version`,`ds_conn_type`,`datasource_contexts`,`ds_desc`,`ds_type`,`ds_engine_name`,`ds_granularity`,`ds_linked_workspaces`,`ds_name`,`ds_owner_id`,`ds_seg_granularity`,`ds_src_type`,`ds_status`)
VALUES ('7b8005ae-eca0-4a56-9072-c3811138c7a6','admin','2018-10-01 05:18:23','admin','2018-10-01 05:20:00',2,'ENGINE',NULL,'','MASTER','testsampleds','DAY',0,'test-sample-ds','admin','MONTH','FILE','ENABLED');

INSERT INTO `field` (`id`,`pre_aggr_type`,`field_alias`,`field_desc`,`field_filtering`,`field_filtering_options`,`field_filtering_seq`,`field_format`,`field_ingestion_rule`,`field_logical_type`,`field_name`,`field_partitioned`,`field_role`,`seq`,`field_type`,`ref_id`,`ds_id`)
VALUES (10037064,'NONE','time',NULL,NULL,NULL,NULL,'yyyy-MM-dd',NULL,'TIMESTAMP','time',NULL,'TIMESTAMP',0,'STRING',NULL,'7b8005ae-eca0-4a56-9072-c3811138c7a6');

INSERT INTO `field` (`id`,`pre_aggr_type`,`field_alias`,`field_desc`,`field_filtering`,`field_filtering_options`,`field_filtering_seq`,`field_format`,`field_ingestion_rule`,`field_logical_type`,`field_name`,`field_partitioned`,`field_role`,`seq`,`field_type`,`ref_id`,`ds_id`)
VALUES (10037065,'NONE','d',NULL,NULL,NULL,NULL,NULL,NULL,'STRING','d',NULL,'DIMENSION',1,'STRING',NULL,'7b8005ae-eca0-4a56-9072-c3811138c7a6');

INSERT INTO `field` (`id`,`pre_aggr_type`,`field_alias`,`field_desc`,`field_filtering`,`field_filtering_options`,`field_filtering_seq`,`field_format`,`field_ingestion_rule`,`field_logical_type`,`field_name`,`field_partitioned`,`field_role`,`seq`,`field_type`,`ref_id`,`ds_id`)
VALUES (10037066,'NONE','sd',NULL,NULL,NULL,NULL,NULL,NULL,'STRING','sd',NULL,'DIMENSION',2,'STRING',NULL,'7b8005ae-eca0-4a56-9072-c3811138c7a6');

INSERT INTO `field` (`id`,`pre_aggr_type`,`field_alias`,`field_desc`,`field_filtering`,`field_filtering_options`,`field_filtering_seq`,`field_format`,`field_ingestion_rule`,`field_logical_type`,`field_name`,`field_partitioned`,`field_role`,`seq`,`field_type`,`ref_id`,`ds_id`)
VALUES (10037067,'NONE','m1',NULL,NULL,NULL,NULL,NULL,NULL,'INTEGER','m1',NULL,'MEASURE',3,'STRING',NULL,'7b8005ae-eca0-4a56-9072-c3811138c7a6');

INSERT INTO `field` (`id`,`pre_aggr_type`,`field_alias`,`field_desc`,`field_filtering`,`field_filtering_options`,`field_filtering_seq`,`field_format`,`field_ingestion_rule`,`field_logical_type`,`field_name`,`field_partitioned`,`field_role`,`seq`,`field_type`,`ref_id`,`ds_id`)
VALUES (10037068,'NONE','m2',NULL,NULL,NULL,NULL,NULL,NULL,'INTEGER','m2',NULL,'MEASURE',4,'STRING',NULL,'7b8005ae-eca0-4a56-9072-c3811138c7a6');