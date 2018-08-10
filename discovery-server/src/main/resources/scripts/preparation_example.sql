delete from prep_snapshot where ds_id in (''101'', ''102'', ''103'', ''104'', ''105'', ''106'');
delete from prep_preview_line where ds_id in (''101'', ''102'', ''103'', ''104'', ''105'', ''106'');
delete from prep_stream where df_id in (''1001'') OR ds_id in (''101'', ''102'', ''103'', ''104'', ''105'', ''106'');
delete from prep_imported_dataset_info where ds_id in (''101'', ''102'', ''103'', ''104'', ''105'', ''106'');
delete from prep_dataflow_dataset where df_id in (''1001'') OR ds_id in (''101'', ''102'', ''103'', ''104'', ''105'', ''106'');
delete from prep_dataset where ds_id in (''101'', ''102'', ''103'', ''104'', ''105'', ''106'');
delete from prep_dataflow where df_id = ''1001'';

insert into prep_dataflow
  (df_id, df_name, df_desc, created_time, modified_time, created_by, modified_by, version)
values
  (''1001'', ''df1'', NULL, now(), now(), ''user1'', ''user1'', 2)
;

insert into prep_dataset
  (ds_id, ds_name, ds_desc, ds_type, creator_df_id, created_time, modified_time, total_lines, total_bytes,
   rule_cur_idx, custom, version, created_by, modified_by)
values
  (''101'', ''ds1'', ''ds1'', ''IMPORTED'', ''1001'', now(), now(), 20000, 10000, -1, ''{"fileType":"CSV", "delimiter":","}'', 2, ''user1'', ''user1''),
  (''102'', ''ds2'', ''ds2'', ''IMPORTED'', ''1001'', now(), now(), 20000, 10000, -1, ''{"fileType":"EXCEL", "sheet":1}'', 2, ''user1'', ''user1''),
  (''103'', ''ds3'', ''ds3'', ''IMPORTED'', ''1001'', now(), now(), 20000, 10000, -1, NULL, 2, ''user1'', ''user1''),
  (''104'', ''ds4'', ''ds4'', ''IMPORTED'', ''1001'', now(), now(), 20000, 10000, -1, NULL, 2, ''user1'', ''user1''),
  (''105'', ''ds5'', ''ds5'', ''WRANGLED'', ''1001'', now(), now(), 20000, 10000, -1, NULL, 2, ''user1'', ''user1''),
  (''106'', ''ds6'', ''ds6'', ''WRANGLED'', ''1001'', now(), now(), 20000, 10000, -1, NULL, 2, ''user1'', ''user1'')
;

insert into prep_imported_dataset_info
  (ds_id, import_type, file_type, filekey, rs_type, query_stmt)
VALUEs
  (''101'', ''FILE'', ''LOCAL'', ''filekey1'', NULL, NULL),
  (''102'', ''FILE'', ''LOCAL'', ''filekey2'', NULL, NULL),
  (''103'', ''DB'', NULL, NULL, ''TABLE'', NULL),
  (''104'', ''DB'', NULL, NULL, ''SQL'', ''select * from emp'')
;

insert into prep_dataflow_dataset
  (df_id, ds_id)
values
  (''1001'', ''101''),
  (''1001'', ''102''),
  (''1001'', ''103''),
  (''1001'', ''104''),
  (''1001'', ''105''),
  (''1001'', ''106'')
;

INSERT INTO PREP_STREAM(
    df_id, upstream_ds_id, ds_id, version
) VALUES
    (''1001'', ''101'', ''102'', 2),
    (''1001'', ''101'', ''103'', 2),
    (''1001'', ''102'', ''104'', 2)
;


INSERT INTO PREP_PREVIEW_LINE(
    ds_id, row_no, col_no, col_value
) VALUES
    (''101'', 1, 1, ''1 of 1''),
    (''101'', 1, 2, ''2 of 1''),
    (''101'', 2, 1, ''1 of 2''),
    (''101'', 2, 2, ''2 of 2'')
;

INSERT INTO PREP_SNAPSHOT(
    ss_id, ss_name, ds_id, format,compression, part_key, profile,CREATED_BY,  	CREATED_TIME,  	MODIFIED_BY,  	MODIFIED_TIME,  	VERSION,  	CREATOR_DF_NAME,  	DS_NAME,  	FINISH_TIME,  	LAUNCH_TIME,  		TOTAL_BYTES , 	TOTAL_LINES , 	URI
) VALUES
    (''10001'',''101_123456789'',''101'',''CSV'',''NONE'',''test key'',1,''polaris'',now(),''polaris'',now(),2,''1001 df'',''101 ds'',now(),now(),0,0,''/test/uri''),
    (''10002'',''102_999999999'',''102'',''JSON'',''GZIP'',''test part key'',1,''polaris'',now(),''polaris'',now(),2,''1001 df'',''102 ds'',now(),now(),0,0,''/test/uri/102'')
;


