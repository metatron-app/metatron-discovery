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


INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status) VALUES
('gis_03', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', 'sigun', 'NONE', null, 0, 'korea_sigun', null, 'NONE', 'IMPORT', 'ENABLED');

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10098001, 'NONE', null, 'TIMESTAMP', 'date', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_03'),
(10098002, 'NONE', null, 'STRING', 'SIG_CD', null, 'DIMENSION', 1, 'STRING', null, 'gis_03'),
(10098003, 'NONE', null, 'STRING', 'SIG_ENG_NM', null, 'DIMENSION', 2, 'STRING', null, 'gis_03'),
(10098004, 'NONE', null, 'STRING', 'SIG_KOR_NM', null, 'DIMENSION', 3, 'STRING', null, 'gis_03'),
(10098005, 'NONE', null, 'GEO_POLYGON', 'WKT', null, 'DIMENSION', 4, 'STRING', null, 'gis_03');

INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status) VALUES
('gis_04', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', 'tour_de_france_geo', 'NONE', null, 0, 'tour_de_france_geo', null, 'NONE', 'IMPORT', 'ENABLED');

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10095001, 'NONE', null, 'TIMESTAMP', 'date', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_04'),
(10095002, 'NONE', null, 'STRING', 'Year', null, 'DIMENSION', 1, 'STRING', null, 'gis_04'),
(10095003, 'NONE', null, 'STRING', 'Winner', null, 'DIMENSION', 2, 'STRING', null, 'gis_04'),
(10095004, 'NONE', null, 'STRING', 'Winner_s_Nationality', null, 'DIMENSION', 3, 'STRING', null, 'gis_04'),
(10095005, 'NONE', null, 'STRING', 'Winner_s_Team', null, 'DIMENSION', 4, 'STRING', null, 'gis_04'),
(10095006, 'NONE', 'yyyy-MM-dd', 'STRING', 'Start_Date', null, 'DIMENSION', 5, 'STRING', null, 'gis_04'),
(10095007, 'NONE', 'yyyy-MM-dd', 'STRING', 'End_Date', null, 'DIMENSION', 6, 'STRING', null, 'gis_04'),
(10095008, 'NONE', null, 'STRING', 'Starting_city', null, 'DIMENSION', 7, 'STRING', null, 'gis_04'),
(10095009, 'NONE', null, 'STRING', 'Starting_country', null, 'DIMENSION', 8, 'STRING', null, 'gis_04'),
(10095010, 'NONE', null, 'STRING', 'Finishing_city', null, 'DIMENSION', 9, 'STRING', null, 'gis_04'),
(10095011, 'NONE', null, 'DOUBLE', 'Winner_s_avg_speed', null, 'MEASURE', 10, 'DOUBLE', null, 'gis_04'),
(10095012, 'NONE', null, 'DOUBLE', 'Total_distance_km', null, 'MEASURE', 11, 'DOUBLE', null, 'gis_04'),
(10095013, 'NONE', null, 'DOUBLE', 'Number_of_stages', null, 'MEASURE', 12, 'DOUBLE', null, 'gis_04'),
(10095014, 'NONE', null, 'DOUBLE', 'Finishers', null, 'MEASURE', 13, 'DOUBLE', null, 'gis_04'),
(10095015, 'NONE', null, 'DOUBLE', 'Entrants', null, 'MEASURE', 14, 'DOUBLE', null, 'gis_04'),
(10095016, 'NONE', null, 'GEO_POINT', 'start_spot', null, 'DIMENSION', 15, 'STRUCT', null, 'gis_04'),
(10095017, 'NONE', null, 'GEO_POINT', 'finish_spot', null, 'DIMENSION', 16, 'STRUCT', null, 'gis_04');


INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status) VALUES
('gis_05', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', 'cei_m1', 'NONE', null, 0, 'cei_m1', null, 'NONE', 'IMPORT', 'ENABLED');

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10097001, 'NONE', null, 'TIMESTAMP', 'date', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_05'),
(10097002, 'NONE', 'yyyyMMdd', 'STRING', 'occr_dt', null, 'DIMENSION', 1, 'STRING', null, 'gis_05'),
(10097003, 'NONE', 'yyyyMMdd', 'STRING', 'week_start_dt_sk', null, 'DIMENSION', 2, 'STRING', null, 'gis_05'),
(10097004, 'NONE', 'yyyyMMdd', 'STRING', 'week_start_dt', null, 'DIMENSION', 3, 'STRING', null, 'gis_05'),
(10097005, 'NONE', null, 'GEO_POINT', 'cell_point', null, 'DIMENSION', 4, 'STRUCT', null, 'gis_05'),
(10097006, 'NONE', null, 'STRING', 'week_no', null, 'DIMENSION', 5, 'STRING', null, 'gis_05'),
(10097007, 'NONE', null, 'STRING', 'wked_yn', null, 'DIMENSION', 6, 'STRING', null, 'gis_05'),
(10097008, 'NONE', null, 'STRING', 'hday_yn', null, 'DIMENSION', 7, 'STRING', null, 'gis_05'),
(10097009, 'NONE', null, 'STRING', 'city_id', null, 'DIMENSION', 8, 'STRING', null, 'gis_05'),
(10097010, 'NONE', null, 'STRING', 'city_name', null, 'DIMENSION', 9, 'STRING', null, 'gis_05'),
(10097011, 'NONE', null, 'STRING', 'gu_id', null, 'DIMENSION', 10, 'STRING', null, 'gis_05'),
(10097012, 'NONE', null, 'STRING', 'gu_name', null, 'DIMENSION', 11, 'STRING', null, 'gis_05'),
(10097013, 'NONE', null, 'STRING', 'dong_id', null, 'DIMENSION', 12, 'STRING', null, 'gis_05'),
(10097014, 'NONE', null, 'STRING', 'dong_name', null, 'DIMENSION', 13, 'STRING', null, 'gis_05'),
(10097015, 'NONE', null, 'STRING', 'branch_id', null, 'DIMENSION', 14, 'STRING', null, 'gis_05'),
(10097016, 'NONE', null, 'STRING', 'branch_name', null, 'DIMENSION', 15, 'STRING', null, 'gis_05'),
(10097017, 'NONE', null, 'STRING', 'team_id', null, 'DIMENSION', 16, 'STRING', null, 'gis_05'),
(10097018, 'NONE', null, 'STRING', 'team_name', null, 'DIMENSION', 17, 'STRING', null, 'gis_05'),
(10097019, 'NONE', null, 'STRING', 'company_id', null, 'DIMENSION', 18, 'STRING', null, 'gis_05'),
(10097020, 'NONE', null, 'STRING', 'company_name', null, 'DIMENSION', 19, 'STRING', null, 'gis_05'),
(10097021, 'NONE', null, 'STRING', 'part_id', null, 'DIMENSION', 20, 'STRING', null, 'gis_05'),
(10097022, 'NONE', null, 'STRING', 'part_name', null, 'DIMENSION', 21, 'STRING', null, 'gis_05'),
(10097023, 'NONE', null, 'STRING', 'ems_id', null, 'DIMENSION', 22, 'STRING', null, 'gis_05'),
(10097024, 'NONE', null, 'STRING', 'enb_cell_id', null, 'DIMENSION', 23, 'STRING', null, 'gis_05'),
(10097025, 'NONE', null, 'STRING', 'enb_id', null, 'DIMENSION', 24, 'STRING', null, 'gis_05'),
(10097026, 'NONE', null, 'STRING', 'enb_nm', null, 'DIMENSION', 25, 'STRING', null, 'gis_05'),
(10097027, 'NONE', null, 'STRING', 'cell_id', null, 'DIMENSION', 26, 'STRING', null, 'gis_05'),
(10097028, 'NONE', null, 'STRING', 'city_name', null, 'DIMENSION', 27, 'STRING', null, 'gis_05'),
(10097029, 'NONE', null, 'STRING', 'rep_ru_cuid', null, 'DIMENSION', 28, 'STRING', null, 'gis_05'),
(10097030, 'NONE', null, 'STRING', 'ru_nm', null, 'DIMENSION', 29, 'STRING', null, 'gis_05'),
(10097031, 'NONE', null, 'STRING', 'du_ver', null, 'DIMENSION', 30, 'STRING', null, 'gis_05'),
(10097032, 'NONE', null, 'STRING', 'op_stat_cd', null, 'DIMENSION', 31, 'STRING', null, 'gis_05'),
(10097033, 'NONE', null, 'STRING', 'freq_nm', null, 'DIMENSION', 32, 'STRING', null, 'gis_05'),
(10097034, 'NONE', null, 'DOUBLE', 'tot_et', null, 'MEASURE', 33, 'DOUBLE', null, 'gis_05'),
(10097035, 'NONE', null, 'DOUBLE', 'tot_calculated_et', null, 'MEASURE', 34, 'DOUBLE', null, 'gis_05'),
(10097036, 'NONE', null, 'DOUBLE', 'tot_voc_cei_value', null, 'MEASURE', 35, 'DOUBLE', null, 'gis_05'),
(10097037, 'NONE', null, 'DOUBLE', 'tot_cei_lv', null, 'MEASURE', 36, 'DOUBLE', null, 'gis_05'),
(10097038, 'NONE', null, 'DOUBLE', 'tot_cei_value', null, 'MEASURE', 37, 'DOUBLE', null, 'gis_05'),
(10097039, 'NONE', null, 'DOUBLE', 'tot_voc_lv', null, 'MEASURE', 38, 'DOUBLE', null, 'gis_05'),
(10097040, 'NONE', null, 'DOUBLE', 'tot_voc_cnt', null, 'MEASURE', 39, 'DOUBLE', null, 'gis_05'),
(10097041, 'NONE', null, 'DOUBLE', 'tot_user_cnt', null, 'MEASURE', 40, 'DOUBLE', null, 'gis_05'),
(10097042, 'NONE', null, 'DOUBLE', 'hdv_et', null, 'MEASURE', 41, 'DOUBLE', null, 'gis_05'),
(10097043, 'NONE', null, 'DOUBLE', 'hdv_voc_cei_lv', null, 'MEASURE', 42, 'DOUBLE', null, 'gis_05'),
(10097044, 'NONE', null, 'DOUBLE', 'hdv_cei_value', null, 'MEASURE', 43, 'DOUBLE', null, 'gis_05'),
(10097045, 'NONE', null, 'DOUBLE', 'hdv_voc_lv', null, 'MEASURE', 44, 'DOUBLE', null, 'gis_05'),
(10097046, 'NONE', null, 'DOUBLE', 'hdv_voc_cnt', null, 'MEASURE', 45, 'DOUBLE', null, 'gis_05'),
(10097047, 'NONE', null, 'DOUBLE', 'hdv_user_cnt', null, 'MEASURE', 46, 'DOUBLE', null, 'gis_05');


INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status) VALUES
('gis_06', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', 'usa_states', 'NONE', null, 0, 'usa_states', null, 'NONE', 'IMPORT', 'ENABLED');

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10098601, 'NONE', null, 'TIMESTAMP', 'date', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_06'),
(10098602, 'NONE', null, 'STRING', 'state_name', null, 'DIMENSION', 1, 'STRING', null, 'gis_06'),
(10098603, 'NONE', null, 'GEO_POLYGON', 'state_geom', null, 'DIMENSION', 2, 'STRING', null, 'gis_06');

INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status) VALUES
('gis_07', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', 'property_inspect', 'NONE', null, 0, 'property_inspect', null, 'NONE', 'IMPORT', 'ENABLED');

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10098801, 'NONE', null, 'TIMESTAMP', 'date', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_07'),
(10098802, 'NONE', null, 'STRING', 'property_id', null, 'DIMENSION', 1, 'STRING', null, 'gis_07'),
(10098803, 'NONE', null, 'STRING', 'city', null, 'DIMENSION', 2, 'STRING', null, 'gis_07'),
(10098804, 'NONE', null, 'STRING', 'cbsa_code', null, 'DIMENSION', 3, 'STRING', null, 'gis_07'),
(10098805, 'NONE', null, 'STRING', 'county_code ', null, 'DIMENSION', 4, 'STRING', null, 'gis_07'),
(10098806, 'NONE', null, 'STRING', 'state_code', null, 'DIMENSION', 5, 'STRING', null, 'gis_07'),
(10098807, 'NONE', null, 'STRING', 'zip', null, 'DIMENSION', 6, 'STRING', null, 'gis_07'),
(10098808, 'NONE', null, 'DOUBLE', 'inspection_score', null, 'MEASURE', 7, 'DOUBLE', null, 'gis_07'),
(10098809, 'NONE', null, 'GEO_POINT', 'gis', null, 'DIMENSION', 8, 'STRING', null, 'gis_07');

INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status) VALUES
('gis_08', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', ' cei_dong', 'NONE', null, 0, ' cei_dong', null, 'NONE', 'IMPORT', 'ENABLED');

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10099901, 'NONE', null, 'TIMESTAMP', 'date', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_08'),
(10099902, 'NONE', null, 'STRING', 'ldong_cd', null, 'DIMENSION', 1, 'STRING', null, 'gis_08'),
(10099903, 'NONE', null, 'STRING', 'ldong_nm', null, 'DIMENSION', 2, 'STRING', null, 'gis_08'),
(10099904, 'NONE', null, 'GEO_POLYGON', 'shape', null, 'DIMENSION', 3, 'STRING', null, 'gis_08'),
(10099905, 'NONE', null, 'DOUBLE', 'tot_cei_va', null, 'MEASURE', 4, 'DOUBLE', null, 'gis_08'),
(10099906, 'NONE', null, 'DOUBLE', 'tot_voc_cn', null, 'MEASURE', 5, 'DOUBLE', null, 'gis_08'),
(10099907, 'NONE', null, 'DOUBLE', 'tot_user_c', null, 'MEASURE', 6, 'DOUBLE', null, 'gis_08'),
(10099908, 'NONE', null, 'DOUBLE', 'hdv_cei_va', null, 'MEASURE', 7, 'DOUBLE', null, 'gis_08'),
(10099909, 'NONE', null, 'DOUBLE', 'hdv_voc_cn', null, 'MEASURE', 8, 'DOUBLE', null, 'gis_08'),
(10099910, 'NONE', null, 'DOUBLE', 'hdv_user_c', null, 'MEASURE', 9, 'DOUBLE', null, 'gis_08');