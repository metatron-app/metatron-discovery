INSERT INTO datasource (id, created_by, created_time, modified_by, modified_time, version, ds_conn_type, datasource_contexts, ds_desc, ds_type, ds_engine_name, ds_granularity, ingestion_conf, ds_linked_workspaces, ds_name, ds_owner_id, ds_seg_granularity, ds_src_type, ds_status) VALUES
('gis_01', 'admin', NOW(), 'unknown', NOW(), 0, 'ENGINE', null, null, 'MASTER', 'estate', 'NONE', null, 0, 'estate', null, 'NONE', 'IMPORT', 'ENABLED');

INSERT INTO field (id, pre_aggr_type, field_format, field_logical_type, field_name, field_partitioned, field_role, seq, field_type, ref_id, ds_id) VALUES
(10090001, 'NONE', null, 'TIMESTAMP', 'event_time', null, 'TIMESTAMP', 0, 'TIMESTAMP', null, 'gis_01'),
(10090002, 'NONE', null, 'STRING', 'idx', null, 'DIMENSION', 1, 'LONG', null, 'gis_01'),
(10090003, 'NONE', null, 'STRING', 'gu', null, 'DIMENSION', 2, 'STRING', null, 'gis_01'),
(10090004, 'NONE', null, 'GEO_POINT', 'gis', null, 'DIMENSION', 3, 'STRUCT', null, 'gis_01'),
(10090005, 'NONE', null, 'INTEGER', 'amt', null, 'MEASURE', 4, 'LONG', null, 'gis_01'),
(10090006, 'NONE', null, 'DOUBLE', 'py', null, 'MEASURE', 5, 'FLOAT', null, 'gis_01');

INSERT INTO datasource(id, ds_name, ds_engine_name, ds_owner_id, ds_desc, ds_type, ds_src_type,ds_conn_type, ds_granularity, ds_status, ds_published, version, created_time, created_by, modified_time, modified_by) values
('ds-gis-37', 'sales_geo', 'sales_geo', 'polaris', 'Sales data (2011~2014)', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris');

INSERT INTO field(id, ds_id, seq, field_name, field_type, field_logical_type, field_role, field_format) values
(10047000, 'ds-gis-37', 0, 'OrderDate', 'TIMESTAMP', null, 'TIMESTAMP', null),
(10047001, 'ds-gis-37', 1, 'Category', 'STRING', null, 'DIMENSION', null),
(10047002, 'ds-gis-37', 2, 'City', 'STRING', null, 'DIMENSION', null),
(10047003, 'ds-gis-37', 3, 'Country', 'STRING', null, 'DIMENSION', null),
(10047004, 'ds-gis-37', 4, 'CustomerName', 'STRING', null, 'DIMENSION', null),
(10047005, 'ds-gis-37', 5, 'Discount', 'DOUBLE', null, 'MEASURE', null),
(10047006, 'ds-gis-37', 6, 'OrderID', 'STRING', null, 'DIMENSION', null),
(10047007, 'ds-gis-37', 7, 'PostalCode', 'STRING', null, 'DIMENSION', null),
(10047008, 'ds-gis-37', 8, 'ProductName', 'STRING', null, 'DIMENSION', null),
(10047009, 'ds-gis-37', 9, 'Profit', 'DOUBLE', null, 'MEASURE', null),
(10047010, 'ds-gis-37', 10, 'Quantity', 'STRING', null, 'DIMENSION', null),
(10047011, 'ds-gis-37', 11, 'Region', 'STRING', null, 'DIMENSION', null),
(10047012, 'ds-gis-37', 12, 'Sales', 'DOUBLE', null, 'MEASURE', null),
(10047013, 'ds-gis-37', 13, 'Segment', 'STRING', null, 'DIMENSION', null),
(10047014, 'ds-gis-37', 14, 'ShipDate', 'STRING', 'TIMESTAMP', 'DIMENSION',  'yyyy. MM. dd.'),
(10047015, 'ds-gis-37', 15, 'ShipMode', 'STRING', null, 'DIMENSION', null),
(10047016, 'ds-gis-37', 16, 'State', 'STRING', null, 'DIMENSION', null),
(10047017, 'ds-gis-37', 17, 'Sub-Category', 'STRING', null, 'DIMENSION', null),
(10047018, 'ds-gis-37', 18, 'DaystoShipActual', 'DOUBLE', null, 'MEASURE', null),
(10047019, 'ds-gis-37', 19, 'SalesForecast', 'DOUBLE', null, 'MEASURE', null),
(10047020, 'ds-gis-37', 20, 'ShipStatus', 'STRING', null, 'DIMENSION', null),
(10047021, 'ds-gis-37', 21, 'DaystoShipScheduled', 'DOUBLE', null, 'MEASURE', null),
(10047022, 'ds-gis-37', 22, 'OrderProfitable', 'STRING', null, 'DIMENSION', null),
(10047023, 'ds-gis-37', 23, 'SalesperCustomer', 'DOUBLE', null, 'MEASURE', null),
(10047024, 'ds-gis-37', 24, 'ProfitRatio', 'DOUBLE', null, 'MEASURE', null),
(10047025, 'ds-gis-37', 25, 'SalesaboveTarget', 'STRING', null, 'DIMENSION', null),
(10047026, 'ds-gis-37', 26, 'latitude', 'STRING', 'LNT', 'DIMENSION', null),
(10047027, 'ds-gis-37', 27, 'longitude', 'STRING', 'LNG', 'DIMENSION', null),
(10047028, 'ds-gis-37', 27, 'location', 'STRUCT', 'GEO_POINT', 'DIMENSION', null);