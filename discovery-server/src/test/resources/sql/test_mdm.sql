INSERT INTO mdm_code_table(id, table_name, table_desc, created_by, created_time, modified_by, modified_time, version) values
('test_code_table1', 'Test Code Table 1', 'Code Table Desc. 1', 'admin', NOW(),'admin', NOW(), 1.0),
('test_code_table2', 'Test Code Table 2', 'Code Table Desc. 2', 'admin', NOW(),'admin', NOW(), 1.0),
('test_code_table3', 'Test Code Table 3', 'Code Table Desc. 3', 'admin', NOW(),'admin', NOW(), 1.0),
('test_code_table4', 'Test Code Table 4', 'Code Table Desc. 4', 'admin', NOW(),'admin', NOW(), 1.0);

INSERT INTO mdm_code_value_pair(id, code_table_code, code_table_value, code_table_desc, table_id) values
(100000011, 'Table 1 - Code 1', 'Table 1 - Value 1', null, 'test_code_table1'),
(100000012, 'Table 1 - Code 2', 'Table 1 - Value 2', null, 'test_code_table1'),
(100000021, 'Table 2 - Code 1', 'Table 2 - Value 1', null, 'test_code_table2'),
(100000022, 'Table 2 - Code 2', 'Table 2 - Value 2', null, 'test_code_table2');

INSERT INTO mdm_code_value_pair(id, code_table_code, code_table_value, code_table_desc, table_id) values
(100000041, 'Furniture', '가구', null, 'test_code_table4'),
(100000042, 'Office Supplies', '사무용품', null, 'test_code_table4'),
(100000043, 'Technology', '가전', null, 'test_code_table4');

INSERT INTO mdm_column_dictionary(id, column_name, column_logical_name, column_desc, column_data_type, column_logical_type, column_sgst_name, column_sgst_shortname, column_format, table_id, created_by, created_time, modified_by, modified_time, version) values
('test_dictionary1', 'Test Dictionary 1', 'dic logical name 1', 'desc1', 'STRING', 'STRING', 'Suggestion1', 'SGST1', null, 'test_code_table1', 'admin', NOW(),'admin', NOW(), 1.0),
('test_dictionary2', 'Test Dictionary 2', 'dic logical name 2', 'desc2', 'STRING', 'STRING', 'Suggestion2', 'SGST2', null, 'test_code_table1', 'admin', NOW(),'admin', NOW(), 1.0),
('test_dictionary3', 'Test Dictionary 3', 'dic logical name 3', 'desc3', 'STRING', 'STRING', 'Suggestion3', 'SGST3', null, 'test_code_table2', 'admin', NOW(),'admin', NOW(), 1.0),
('test_dictionary4', 'Test Dictionary 4', 'dic logical name 4', 'desc4', 'STRING', 'STRING', 'Suggestion4', 'SGST4', null, null, 'admin', NOW(),'admin', NOW(), 1.0);

INSERT INTO mdm_catalog(id, catalog_name, catalog_desc, catalog_parent_id, created_by, created_time, modified_by, modified_time, version) values
('catalog1', 'catalog 1', 'desc1', null, 'admin', NOW(),'admin', NOW(), 1.0),
('catalog2', 'catalog 2', 'desc2', null, 'admin', NOW(),'admin', NOW(), 1.0),
('catalog1_1', 'catalog 1-1', 'desc 1-1', 'catalog1', 'admin', NOW(),'admin', NOW(), 1.0),
('catalog1_2', 'catalog 1-2', 'desc 1-2', 'catalog1', 'admin', NOW(),'admin', NOW(), 1.0),
('catalog1_1_1', 'catalog 1-1-1', 'desc 1-1-1', 'catalog1-1', 'admin', NOW(),'admin', NOW(), 1.0);

INSERT INTO mdm_catalog_tree(catalog_ancestor, catalog_descendant, catalog_depth) VALUES
('catalog1', 'catalog1', 0),
('catalog2', 'catalog2', 0),
('catalog1_1', 'catalog1_1', 0),
('catalog1', 'catalog1_1', 1),
('catalog1_2', 'catalog1_2', 0),
('catalog1', 'catalog1_2', 1),
('catalog1_1_1', 'catalog1_1_1', 0),
('catalog1_1', 'catalog1_1_1', 1),
('catalog1', 'catalog1_1_1', 2);

INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_src_type,ds_conn_type, ds_granularity, ds_status, ds_published, version, created_time, created_by, modified_time, modified_by) values
('ds_mdm_01_id', 'ds_mdm_01', 'ds_mdm_01', 'polaris', 'Dummy datasource #1', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds_mdm_02_id', 'ds_mdm_02', 'ds_mdm_02', 'polaris', 'Dummy datasource #2', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds_mdm_03_id', 'ds_mdm_03', 'ds_mdm_03', 'polaris', 'Dummy datasource #3', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds_mdm_04_id', 'ds_mdm_04', 'ds_mdm_04', 'polaris', 'Dummy datasource #4', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds_mdm_05_id', 'ds_mdm_05', 'ds_mdm_05', 'polaris', 'Dummy datasource #5', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds_mdm_06_id', 'ds_mdm_06', 'ds_mdm_06', 'polaris', 'Dummy datasource #6', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds_mdm_07_id', 'ds_mdm_07', 'ds_mdm_07', 'polaris', 'Dummy datasource #7', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds_mdm_08_id', 'ds_mdm_08', 'ds_mdm_08', 'polaris', 'Dummy datasource #8', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
('ds_mdm_09_id', 'ds_mdm_09', 'ds_mdm_09', 'polaris', 'Dummy datasource #9', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris');

INSERT INTO mdm_metadata_source(id, meta_source_type, meta_source_name, meta_source_id, meta_source_schema, meta_source_table, created_by, created_time, modified_by, modified_time, version) values
('test_engine_source_01', 'ENGINE', 'engine_datasource_01', 'source_id_1', null, null, 'admin', NOW(),'admin', NOW(), 1.0),
('test_engine_source_02', 'ENGINE', 'engine_datasource_02', 'source_id_2', null, null,'admin', NOW(),'admin', NOW(), 1.0),
('test_engine_source_03', 'JDBC', 'engine_datasource_02', 'source_id_3', 'test_schema1', 'test_table1', 'admin', NOW(),'admin', NOW(), 1.0),
('test_engine_source_04', 'JDBC', 'engine_datasource_04', 'source_id_4', 'test_schema1', 'test_table1', 'admin', NOW(),'admin', NOW(), 1.0),
('test_engine_source_05', 'JDBC', 'engine_datasource_05', 'source_id_5', 'test_schema1', 'test_table1', 'admin', NOW(),'admin', NOW(), 1.0),
('test_engine_source_06', 'JDBC', 'engine_datasource_06', 'source_id_6', 'test_schema1', 'test_table1', 'admin', NOW(),'admin', NOW(), 1.0),
('test_engine_source_07', 'JDBC', 'engine_datasource_07', 'source_id_7', 'test_schema1', 'test_table1', 'admin', NOW(),'admin', NOW(), 1.0),
('test_engine_source_08', 'JDBC', 'engine_datasource_08', 'source_id_8', 'test_schema1', 'test_table1', 'admin', NOW(),'admin', NOW(), 1.0),
('test_engine_source_09', 'JDBC', 'engine_datasource_09', 'source_id_9', 'test_schema1', 'test_table1', 'admin', NOW(),'admin', NOW(), 1.0);


INSERT INTO mdm_metadata(id, meta_name, meta_desc, meta_source_type, source_id, created_by, created_time, modified_by, modified_time, version) values
('test_meta1', 'Test metadata 1', 'meta description1', 'ENGINE', 'test_engine_source_01', 'admin', NOW(),'admin', NOW(), 1.0),
('test_meta2', 'Test metadata 2', 'meta description2', 'ENGINE', 'test_engine_source_02', 'admin', NOW(),'admin', NOW(), 1.0),
('test_meta3', 'Test metadata 3', 'meta description3', 'ENGINE', 'test_engine_source_03', 'admin', NOW(),'admin', NOW(), 1.0),
('test_meta4', 'Test metadata 4', 'meta description4', 'ENGINE', 'test_engine_source_04', 'admin', NOW(),'admin', NOW(), 1.0),
('test_meta5', 'Test metadata 5', 'meta description5', 'ENGINE', 'test_engine_source_05', 'admin', NOW(),'admin', NOW(), 1.0),
('test_meta6', 'Test metadata 6', 'meta description6', 'ENGINE', 'test_engine_source_06', 'admin', NOW(),'admin', NOW(), 1.0),
('test_meta7', 'Test metadata 7', 'meta description7', 'ENGINE', 'test_engine_source_07', 'admin', NOW(),'admin', NOW(), 1.0),
('test_meta8', 'Test metadata 8', 'meta description8', 'ENGINE', 'test_engine_source_08', 'admin', NOW(),'admin', NOW(), 1.0),
('test_meta9', 'Test metadata 9', 'meta description9', 'ENGINE', 'test_engine_source_09', 'admin', NOW(),'admin', NOW(), 1.0);

INSERT INTO mdm_metadata_column(id, meta_id, column_physical_type, column_physical_name, dictionary_id, column_type, column_name, column_format, table_id, column_seq) values
(100011, 'test_meta1', 'STRING', 'pcolumn01', 'test_dictionary1', null, null, null, null, 1),
(100012, 'test_meta1', 'STRING', 'pcolumn02', null, 'STRING', 'logical name2', null, 'test_code_table2', 2),
(100013, 'test_meta1', 'STRING', 'pcolumn03', null, 'STRING', 'logical name3', null, null, 3),
(100021, 'test_meta2', 'STRING', 'pcolumn01', null, 'STRING', 'logical name1', null, null, 1),
(100022, 'test_meta2', 'STRING', 'pcolumn02', null, 'STRING', 'logical name2', null, null, 2),
(100031, 'test_meta3', 'STRING', 'pcolumn', null, 'STRING', 'logical name2', null, null, 1);

INSERT INTO catalog_metadata(catalog_id, meta_id) VALUES
('catalog1_1', 'test_meta1'),
('catalog1_1', 'test_meta2'),
('catalog1_2', 'test_meta1'),
('catalog1_1_1', 'test_meta3');

INSERT INTO tag (id, tag_domain, tag_name, tag_scope, created_by, created_time) VALUES
('tag_01', 'METADATA', 'meta_tag1', 'DOMAIN', 'admin', NOW()),
('tag_02', 'METADATA', 'meta_tag2', 'DOMAIN', 'admin', NOW());

INSERT INTO tag_domain (domain_id, domain_type, tag_id, created_by, created_time) VALUES
('test_meta1', 'METADATA', 'tag_01', 'admin', NOW()),
('test_meta2', 'METADATA', 'tag_02', 'admin', NOW());
