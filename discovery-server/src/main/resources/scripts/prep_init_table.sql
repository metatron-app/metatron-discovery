/**
    Drop Tables ; Prefix = 'prep_'
    
    Drop order by Constraint
        [
         3. prep_dataset_column_info
         4. prep_imported_dataset_info
         //5. prep_preview_line
         6. prep_snapshot
         7. prep_transform_rule
         8. prep_transition
        ]                       \
                                 \ 
                                  [ 9. prep_dataset ]
                                 /
        [ 1. prep_dataflow_dataset ]
                                 \
                                  [ 2. prep_dataflow ]
**/
DROP TABLE IF EXISTS `prep_upstream`;
DROP TABLE IF EXISTS `prep_dataflow_dataset`;
DROP TABLE IF EXISTS `prep_dataflow`;
DROP TABLE IF EXISTS `prep_dataset_column_info`;
DROP TABLE IF EXISTS `prep_imported_dataset_info`;
DROP TABLE IF EXISTS `prep_preview_line`;
DROP TABLE IF EXISTS `prep_snapshot`;
DROP TABLE IF EXISTS `prep_transform_rule`;
DROP TABLE IF EXISTS `prep_transition`;
DROP TABLE IF EXISTS `prep_dataset`;


/**
    Create Tables ; Prefix = 'prep_'
    Reverse order when drop
**/

CREATE TABLE `prep_dataset` (
  `ds_id` varchar(255) NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_time` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `modified_time` datetime DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `creator_df_id` varchar(255) DEFAULT NULL,
  `custom` longtext DEFAULT NULL,
  `ds_desc` varchar(256) DEFAULT NULL,
  `ds_name` varchar(128) NOT NULL,
  `ds_type` varchar(255) DEFAULT NULL,
  `rule_cnt` int(11) DEFAULT NULL,
  `rule_cur_idx` int(11) DEFAULT NULL,
  `session_revision` int(11) DEFAULT NULL,
  `total_bytes` bigint(20) DEFAULT NULL,
  `total_lines` int(11) DEFAULT NULL,
  PRIMARY KEY (`ds_id`)
);

CREATE TABLE `prep_dataflow` (
  `df_id` varchar(255) NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_time` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `modified_time` datetime DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `custom` longtext DEFAULT NULL,
  `df_desc` varchar(256) DEFAULT NULL,
  `df_name` varchar(128) NOT NULL,
  PRIMARY KEY (`df_id`)
);

CREATE TABLE `prep_dataflow_dataset` (
  `df_id` varchar(255) NOT NULL,
  `ds_id` varchar(255) NOT NULL,
  KEY `FK_prep_dataflow_dataset_ds_id` (`ds_id`),
  KEY `FK_prep_dataflow_dataset_df_id` (`df_id`),
  CONSTRAINT `FK_prep_dataflow_dataset_ds_id` FOREIGN KEY (`ds_id`) REFERENCES `prep_dataset` (`ds_id`),
  CONSTRAINT `FK_prep_dataflow_dataset_df_id` FOREIGN KEY (`df_id`) REFERENCES `prep_dataflow` (`df_id`)
);

CREATE TABLE `prep_dataset_column_info` (
  `col_no` int(11) NOT NULL,
  `col_name` varchar(255) DEFAULT NULL,
  `col_type` varchar(255) DEFAULT NULL,
  `ds_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`col_no`),
  KEY `FK_prep_dataset_column_info_ds_id` (`ds_id`),
  CONSTRAINT `FK_prep_dataset_column_info_ds_id` FOREIGN KEY (`ds_id`) REFERENCES `prep_dataset` (`ds_id`)
);

CREATE TABLE `prep_imported_dataset_info` (
  `charset` varchar(16) DEFAULT NULL,
  `dc_id` varchar(255) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `filekey` varchar(255) DEFAULT NULL,
  `filename` varchar(255) DEFAULT NULL,
  `import_type` varchar(255) DEFAULT NULL,
  `query_stmt` longtext DEFAULT NULL,
  `rs_type` varchar(255) DEFAULT NULL,
  `table_name` varchar(256) DEFAULT NULL,
  `ds_id` varchar(255) NOT NULL,
  PRIMARY KEY (`ds_id`),
  CONSTRAINT `FK_prep_imported_dataset_info_ds_id` FOREIGN KEY (`ds_id`) REFERENCES `prep_dataset` (`ds_id`)
);

/*
CREATE TABLE `prep_preview_line` (
  `col_name` varchar(255) NOT NULL,
  `ds_id` varchar(255) NOT NULL,
  `row_no` int(11) NOT NULL,
  `col_no` int(11) DEFAULT NULL,
  `col_type` varchar(255) DEFAULT NULL,
  `col_value` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`col_name`,`ds_id`,`row_no`),
  KEY `FK_prep_preview_line_ds_id` (`ds_id`),
  CONSTRAINT `FK_prep_preview_line_ds_id` FOREIGN KEY (`ds_id`) REFERENCES `prep_dataset` (`ds_id`)
);
*/

CREATE TABLE `prep_snapshot` (
  `ss_id` varchar(255) NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_time` datetime DEFAULT NULL,
  `modified_by` varchar(255) DEFAULT NULL,
  `modified_time` datetime DEFAULT NULL,
  `version` bigint(20) DEFAULT NULL,
  `compression` varchar(255) DEFAULT NULL,
  `creator_df_name` varchar(255) DEFAULT NULL,
  `custom` longtext DEFAULT NULL,
  `db_name` varchar(255) DEFAULT NULL,
  `ds_name` varchar(255) DEFAULT NULL,
  `ext_hdfs_dir` varchar(4096) DEFAULT NULL,
  `finish_time` datetime DEFAULT NULL,
  `format` varchar(255) DEFAULT NULL,
  `launch_time` datetime DEFAULT NULL,
  `lineage_info` longtext DEFAULT NULL,
  `mode` varchar(255) DEFAULT NULL,
  `engine` varchar(255) DEFAULT NULL,
  `out_path` varchar(4096) DEFAULT NULL,
  `profile` bit(1) NOT NULL,
  `ss_name` varchar(2000) DEFAULT NULL,
  `ss_type` varchar(255) DEFAULT NULL,
  `stat` longtext DEFAULT NULL,
  `tbl_name` varchar(255) DEFAULT NULL,
  `total_bytes` bigint(20) DEFAULT NULL,
  `total_lines` bigint(20) DEFAULT NULL,
  `uri` varchar(4000) DEFAULT NULL,
  PRIMARY KEY (`ss_id`)
);

CREATE TABLE `prep_transform_rule` (
  `ds_id` varchar(255) NOT NULL,
  `rule_no` int(11) NOT NULL,
  `custom` text DEFAULT NULL,
  `is_valid` bit(1) NOT NULL,
  `json_rule_string` text DEFAULT NULL,
  `rule_string` varchar(4000) NOT NULL,
  PRIMARY KEY (`ds_id`,`rule_no`),
  CONSTRAINT `FK_prep_transform_rule_ds_id` FOREIGN KEY (`ds_id`) REFERENCES `prep_dataset` (`ds_id`)
);

CREATE TABLE `prep_transition` (
  `change_no` int(11) NOT NULL,
  `ds_id` varchar(255) NOT NULL,
  `ds_revision` int(11) NOT NULL,
  `dst_idx` int(11) NOT NULL,
  `op` varchar(255) NOT NULL,
  `rule_cnt_after` int(11) NOT NULL,
  `rule_cnt_before` int(11) NOT NULL,
  `rule_cur_idx_after` int(11) NOT NULL,
  `rule_cur_idx_before` int(11) NOT NULL,
  `rule_string` varchar(4000) DEFAULT NULL,
  `src_idx` int(11) NOT NULL,
  PRIMARY KEY (`change_no`,`ds_id`),
  KEY `FK_prep_transition_ds_id` (`ds_id`),
  CONSTRAINT `FK_prep_transition_ds_id` FOREIGN KEY (`ds_id`) REFERENCES `prep_dataset` (`ds_id`)
);

