INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status, ds_include_geo) VALUES
('gis_01', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', 'estate', 'NONE', null, 0, 'estate', null, 'NONE', 'IMPORT', 'ENABLED', TRUE);

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10090001, 'NONE', null, 'TIMESTAMP', 'event_time', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_01'),
(10090002, 'NONE', null, 'STRING', 'idx', null, 'DIMENSION', 1, 'LONG', null, 'gis_01'),
(10090003, 'NONE', null, 'STRING', 'gu', null, 'DIMENSION', 2, 'STRING', null, 'gis_01'),
(10090004, 'NONE', null, 'GEO_POINT', 'gis', null, 'DIMENSION', 3, 'STRUCT', null, 'gis_01'),
(10090005, 'NONE', null, 'INTEGER', 'amt', null, 'MEASURE', 4, 'LONG', null, 'gis_01'),
(10090006, 'NONE', null, 'DOUBLE', 'py', null, 'MEASURE', 5, 'FLOAT', null, 'gis_01');

INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status, ds_include_geo) VALUES
('gis_20', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', 'seoul_roads', 'NONE', null, 0, 'seoul roads', null, 'NONE', 'IMPORT', 'ENABLED', TRUE);

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10191221, 'NONE', null, 'TIMESTAMP', 'event_time', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_20'),
(10191222, 'NONE', null, 'STRING', 'id', null, 'DIMENSION', 1, 'STRING', null, 'gis_20'),
(10191223, 'NONE', null, 'STRING', 'name', null, 'DIMENSION', 2, 'STRING', null, 'gis_20'),
(10191224, 'NONE', null, 'GEO_LINE', 'geom', null, 'DIMENSION', 3, 'STRING', null, 'gis_20');

INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status, ds_include_geo) VALUES
('gis_21', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', 'usa_states', 'NONE', null, 0, 'USA States', null, 'NONE', 'IMPORT', 'ENABLED', TRUE);

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10192221, 'NONE', null, 'TIMESTAMP', 'event_time', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_21'),
(10192222, 'NONE', null, 'STRING', 'state_name', null, 'DIMENSION', 1, 'STRING', null, 'gis_21'),
(10192224, 'NONE', null, 'GEO_POLYGON', 'state_geom', null, 'DIMENSION', 2, 'STRING', null, 'gis_21');