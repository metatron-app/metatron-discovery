INSERT INTO ingestion(id, ingest_data_type, ingest_data_database, ingest_data_schema, ingest_data_query) values(520, 'TABLE', NULL, NULL, 'params');

INSERT INTO datasource(id, ds_name, ds_alias, ds_owner_id, ds_desc, ds_filter_at_select, ds_type, ds_conn_type, ds_granularity, ds_enabled, ds_status, dc_id, ingest_id, version, created_time, created_by, modified_time, modified_by) VALUES('ds-421', 'params', 'params_phoenix_live', 'polaris', 'params data', true, 'MASTER', 'LIVE', 'DAY', true, 'ENABLED', 'dc-phoenix-01', 520, 1.0, NOW(), 'admin',  NOW(), 'admin');

INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042100, 'ds-421', 0, 'Id', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042101, 'ds-421', 1, 'eqpId', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042102, 'ds-421', 2, 'ParamName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042103, 'ds-421', 3, 'ParamValue', 'TEXT', 'MEASURE' );
