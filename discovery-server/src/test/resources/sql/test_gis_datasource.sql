INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status) VALUES
('gis_01', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', 'estate', 'NONE', null, 0, 'estate', null, 'NONE', 'IMPORT', 'ENABLED');

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10090001, 'NONE', null, 'TIMESTAMP', 'event_time', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_01'),
(10090002, 'NONE', null, 'STRING', 'idx', null, 'DIMENSION', 1, 'LONG', null, 'gis_01'),
(10090003, 'NONE', null, 'STRING', 'gu', null, 'DIMENSION', 2, 'STRING', null, 'gis_01'),
(10090004, 'NONE', null, 'GEO_POINT', 'gis', null, 'DIMENSION', 3, 'STRUCT', null, 'gis_01'),
(10090005, 'NONE', null, 'INTEGER', 'amt', null, 'MEASURE', 4, 'LONG', null, 'gis_01'),
(10090006, 'NONE', null, 'DOUBLE', 'py', null, 'MEASURE', 5, 'FLOAT', null, 'gis_01');


INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status) VALUES
('gis_02', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', 'gis_fcltc_cbl_bas_jongro', 'NONE', null, 0, 'gis_fcltc_cbl_bas_jongro', null, 'YEAR', 'IMPORT', 'ENABLED');

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10091901, 'NONE', 'yyyy-MM-dd HH:mm:ss.S', 'TIMESTAMP', 'cmpl_date', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_02'),
(10091902, 'NONE', null, 'GEO_LINE', 'geo', null, 'DIMENSION', 1, 'STRING', null, 'gis_02'),
(10091903, 'NONE', null, 'STRING', 'cbl_mgmt_no', null, 'DIMENSION', 2, 'STRING', null, 'gis_02'),
(10091904, 'NONE', null, 'STRING', 'cbl_sk_mgmt_no', null, 'DIMENSION', 3, 'STRING', null, 'gis_02'),
(10091905, 'NONE', null, 'STRING', 'cbl_unq_mgmt_no', null, 'DIMENSION', 4, 'STRING', null, 'gis_02'),
(10091906, 'NONE', null, 'STRING', 'fclt_nm', null, 'DIMENSION', 5, 'STRING', null, 'gis_02'),
(10091907, 'NONE', null, 'STRING', 'ldong_cd', null, 'DIMENSION', 6, 'STRING', null, 'gis_02'),
(10091908, 'NONE', null, 'STRING', 'use_cl_cd', null, 'DIMENSION', 7, 'STRING', null, 'gis_02'),
(10091909, 'NONE', null, 'STRING', 'own_cl_cd', null, 'DIMENSION', 8, 'STRING', null, 'gis_02'),
(10091910, 'NONE', null, 'STRING', 'cox_cbl_cl_cd', null, 'DIMENSION', 9, 'STRING', null, 'gis_02'),
(10091911, 'NONE', null, 'STRING', 'cbl_ungr_loc_cd', null, 'DIMENSION', 10, 'STRING', null, 'gis_02'),
(10091912, 'NONE', null, 'STRING', 'cell_mgmt_no', null, 'DIMENSION', 11, 'STRING', null, 'gis_02'),
(10091913, 'NONE', null, 'STRING', 'cox_mnft_vndr_cd', null, 'DIMENSION', 12, 'STRING', null, 'gis_02'),
(10091914, 'NONE', null, 'STRING', 'cox_supl_vndr_desc', null, 'DIMENSION', 13, 'STRING', null, 'gis_02'),
(10091915, 'NONE', null, 'STRING', 'eqp_mdl_nm', null, 'DIMENSION', 14, 'STRING', null, 'gis_02'),
(10091916, 'NONE', null, 'STRING', 'cstr_cd', null, 'DIMENSION', 15, 'STRING', null, 'gis_02'),
(10091917, 'NONE', 'yyyy-MM-dd HH:mm:ss.S', 'TIMESTAMP', 'edit_date', null, 'DIMENSION', 16, 'STRING', null, 'gis_02'),
(10091918, 'NONE', null, 'STRING', 'edit_user_id', null, 'DIMENSION', 17, 'STRING', null, 'gis_02'),
(10091919, 'NONE', null, 'STRING', 'cox_cbl_rmk', null, 'DIMENSION', 18, 'STRING', null, 'gis_02'),
(10091920, 'NONE', null, 'STRING', 'cox_cbl_typ_cd', null, 'DIMENSION', 19, 'STRING', null, 'gis_02'),
(10091921, 'NONE', null, 'STRING', 'systm_cl_cd', null, 'DIMENSION', 20, 'STRING', null, 'gis_02'),
(10091922, 'NONE', null, 'STRING', 'spa_srno', null, 'DIMENSION', 21, 'STRING', null, 'gis_02'),
(10091923, 'NONE', null, 'STRING', 'spa_sty_val', null, 'DIMENSION', 22, 'STRING', null, 'gis_02'),
(10091924, 'NONE', null, 'INTEGER', 'cox_cbl_core_cnt', null, 'MEASURE', 23, 'LONG', null, 'gis_02'),
(10091925, 'NONE', null, 'DOUBLE', 'cmpl_distm', null, 'MEASURE', 24, 'DOUBLE', null, 'gis_02'),
(10091926, 'NONE', null, 'DOUBLE', 'map_distm', null, 'MEASURE', 25, 'DOUBLE', null, 'gis_02');