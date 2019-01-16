
INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_src_type, ds_conn_type, ds_granularity, ds_status, ds_published, version, created_time, created_by, modified_time, modified_by) values
('ds-37', 'sales', 'sales1', 'polaris', 'Sales data (2011~2014)', 'MASTER', 'FILE', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, '2018-01-10 01:00:00.000', 'polaris',  '2017-01-10 01:00:00.000', 'polaris')
,('ds-38', 'sales', 'sales2', 'polaris', 'Sales data (2011~2014)', 'JOIN', 'HDFS', 'LINK', 'DAY', 'DISABLED', true, 1.0, '2018-01-11 01:00:00.000', 'polaris',  '2017-01-11 01:00:00.000', 'polaris')
,('ds-39', 'sales', 'sales3', 'polaris', 'Sales data (2011~2014)', 'VOLATILITY', 'HIVE', 'ENGINE', 'DAY', 'PREPARING', true, 1.0, '2018-01-12 01:00:00.000', 'polaris',  '2017-01-12 01:00:00.000', 'polaris')
,('ds-40', 'sales', 'sales4', 'polaris', 'Sales data (2011~2014)', 'MASTER', 'JDBC', 'LINK', 'DAY', 'BAD', true, 1.0, '2018-01-13 01:00:00.000', 'polaris',  '2017-01-13 01:00:00.000', 'polaris')
,('ds-41', 'sales', 'sales5', 'polaris', 'Sales data (2011~2014)', 'JOIN', 'REALTIME', 'ENGINE', 'DAY', 'FAILED', true, 1.0, '2018-01-14 01:00:00.000', 'polaris',  '2017-01-14 01:00:00.000', 'polaris')

,('ds-42', 'sales', 'sales6', 'metatron', 'Sales data (2011~2014)', 'VOLATILITY', 'IMPORT', 'LINK', 'DAY', 'ENABLED', true, 1.0, '2018-01-10 01:00:00.000', 'metatron',  '2017-01-10 01:00:00.000', 'metatron')
,('ds-43', 'sales', 'sales7', 'metatron', 'Sales data (2011~2014)', 'MASTER', 'SNAPSHOT', 'ENGINE', 'DAY', 'DISABLED', true, 1.0, '2018-01-11 01:00:00.000', 'metatron',  '2017-01-11 01:00:00.000', 'metatron')
,('ds-44', 'sales', 'sales8', 'metatron', 'Sales data (2011~2014)', 'JOIN', 'NONE', 'LINK', 'DAY', 'PREPARING', true, 1.0, '2018-01-12 01:00:00.000', 'metatron',  '2017-01-12 01:00:00.000', 'metatron')
,('ds-45', 'sales', 'sales9', 'metatron', 'Sales data (2011~2014)', 'VOLATILITY', 'FILE', 'ENGINE', 'DAY', 'BAD', true, 1.0, '2018-01-13 01:00:00.000', 'metatron',  '2017-01-13 01:00:00.000', 'metatron')
,('ds-46', 'sales', 'sales10', 'metatron', 'Sales data (2011~2014)', 'MASTER', 'HDFS', 'LINK', 'DAY', 'FAILED', true, 1.0, '2018-01-14 01:00:00.000', 'metatron',  '2017-01-14 01:00:00.000', 'metatron')

,('ds-47', 'sales', 'sales11', 'temp_user', 'Sales data (2011~2014)', 'VOLATILITY', 'HDFS', 'LINK', 'DAY', 'FAILED', true, 1.0, '2018-01-14 01:00:00.000', 'admin',  '2017-01-14 01:00:00.000', 'admin')
;

INSERT INTO datasource_workspace(DS_ID, WS_ID) VALUES
('ds-37', 'ws-00')
,('ds-38', 'ws-02')
,('ds-39', 'ws-03')
,('ds-40', 'ws-05')
;

COMMIT;
