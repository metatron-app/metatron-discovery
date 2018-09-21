INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_src_type, ds_conn_type, ds_granularity, ds_status, ds_published, version, created_time, created_by, modified_time, modified_by) values
('ds-sample-network', 'sample-network', 'sample_network_ingestion_01', 'polaris', 'Sample Network', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris');

INSERT INTO field(id, ds_id, seq, field_name, field_type, field_logical_type, field_role, field_format) values
(20037020, 'ds-sample-network', 0, 'time', 'TIMESTAMP', 'TIMESTAMP', 'TIMESTAMP', 'yyyy-MM-dd'),
(20037021, 'ds-sample-network', 1, 'd', 'STRING', 'STRING', 'DIMENSION', null),
(20037022, 'ds-sample-network', 2, 'nd', 'STRING', 'STRING', 'DIMENSION', null),
(20037023, 'ds-sample-network', 3, 'sd', 'STRING', 'STRING', 'DIMENSION', null),
(20037024, 'ds-sample-network', 4, 'm1', 'INTEGER', 'INTEGER', 'MEASURE', null),
(20037025, 'ds-sample-network', 5, 'm2', 'INTEGER', 'INTEGER', 'MEASURE', null);