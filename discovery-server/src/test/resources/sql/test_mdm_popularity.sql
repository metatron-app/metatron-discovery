INSERT INTO mdm_metadata_source(id, meta_source_type, meta_source_name, meta_source_id, meta_source_schema, meta_source_table, created_by, created_time, modified_by, modified_time, version) values
('test_engine_source_04', 'ENGINE', 'engine_datasource_04', 'source_id_4', null, null,'admin', NOW(),'admin', NOW(), 1.0);

INSERT INTO mdm_metadata(id, meta_name, meta_desc, meta_source_type, source_id, created_by, created_time, modified_by, modified_time, version) values
('test_meta4', 'Test metadata 4', 'Metadata with null popularity', 'ENGINE', 'test_engine_source_04', 'admin', NOW(), 'admin', NOW(), 1.0);

INSERT INTO mdm_metadata_column(id, meta_id, column_physical_type, column_physical_name, dictionary_id, column_type, column_name, column_format, table_id) values
(100041, 'test_meta4', 'STRING', 'pcolumn04', null, 'STRING', 'logical name4', null, null);

INSERT INTO mdm_metadata_popularity (id, popularity_column_id, popularity_metacolumn_id, popularity_metadata_id, popularity_value, popularity_score, popularity_source_id, popularity_type) values
(100061, null, null, 'test_meta4', null, null, 'test_engine_source_04', 'METADATA');