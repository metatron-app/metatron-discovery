-- Default Datasource Ingestion Options
INSERT INTO datasource_ingestion_options(id, option_type, option_name, option_ingestion_type, option_data_type, option_default_value, option_desc) VALUES
('tuning_batch_ignoreinvalidrows', 'TUNING', 'ignoreInvalidRows', 'BATCH', 'BOOLEAN', 'true', NULL),
('tuning_hadoop_ignoreinvalidrows', 'TUNING', 'ignoreInvalidRows', 'HADOOP', 'BOOLEAN', 'true', NULL),
('tuning_realtime_ignoreinvalidrows', 'TUNING', 'ignoreInvalidRows', 'REALTIME', 'BOOLEAN', 'true', NULL),
('tuning_batch_maxRowsInMemory', 'TUNING', 'maxRowsInMemory', 'BATCH', 'LONG', '75000', NULL),
('tuning_hadoop_maxRowsInMemory', 'TUNING', 'maxRowsInMemory', 'HADOOP', 'LONG', '75000', NULL),
('tuning_realtime_maxRowsInMemory', 'TUNING', 'maxRowsInMemory', 'REALTIME', 'LONG', '75000', NULL),
('tuning_hadoop_mapsplitsize', 'TUNING', 'mapSplitSize', 'HADOOP', 'STRING', '512M', NULL),
('job_hadoop_mapreduce.job.user.classpath.first', 'JOB', 'mapreduce.job.user.classpath.first', 'HADOOP', 'BOOLEAN', 'true', NULL),
('job_hadoop_mapreduce.map.memory.mb', 'JOB', 'mapreduce.map.memory.mb', 'HADOOP', 'INTEGER', '4096', NULL),
('job_hadoop_mapreduce.reduce.memory.mb', 'JOB', 'mapreduce.reduce.memory.mb', 'HADOOP', 'INTEGER', '4096', NULL);

COMMIT;
