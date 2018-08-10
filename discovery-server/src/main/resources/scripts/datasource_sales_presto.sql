-- DataSource
INSERT INTO dataconnection(dc_implementor, id, created_by, created_time, modified_by, modified_time, version, dc_desc, dc_hostname, dc_name, dc_password, dc_port, dc_type, dc_url, dc_username, dc_database, dc_options, dc_catalog) VALUES
('PRESTO', 'dc-presto-01', 'polaris', NOW(), 'polaris', NOW(), 0, NULL, 'localhost', 'Presto-Local', 'hive', 8080, 'JDBC', NULL, 'hive', NULL, NULL, 'hive');

INSERT INTO ingestion(id, ingest_data_type, ingest_data_database, ingest_data_schema, ingest_data_query) values(410, 'TABLE', 'default', 'default', 'sales');

INSERT INTO datasource(id, ds_name, ds_alias, ds_owner_id, ds_desc, ds_filter_at_select, ds_type, ds_conn_type, ds_granularity, ds_enabled, ds_status, dc_id, ingest_id, version, created_time, created_by, modified_time, modified_by) values
('ds-presto-01', 'sales_presto', 'sale_presto_live', 'polaris', 'sales data (2011~2014)', true, 'MASTER', 'LIVE', 'DAY', true, 'ENABLED', 'dc-presto-01', 410, 1.0, NOW(), 'admin',  NOW(), 'admin');

INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041000, 'ds-presto-01', 0, 'OrderDate', 'TIMESTAMP', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041001, 'ds-presto-01', 1, 'Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041002, 'ds-presto-01', 2, 'City', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041003, 'ds-presto-01', 3, 'Country', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041004, 'ds-presto-01', 4, 'CustomerName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041005, 'ds-presto-01', 5, 'Discount', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041006, 'ds-presto-01', 6, 'OrderId', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041007, 'ds-presto-01', 7, 'PostalCode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041008, 'ds-presto-01', 8, 'ProductName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041009, 'ds-presto-01', 9, 'Profit', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041010, 'ds-presto-01', 10, 'Quantity', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041011, 'ds-presto-01', 11, 'Region', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041012, 'ds-presto-01', 12, 'Sales', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041013, 'ds-presto-01', 13, 'Segment', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041014, 'ds-presto-01', 14, 'ShipDate', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041015, 'ds-presto-01', 15, 'ShipMode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041016, 'ds-presto-01', 16, 'State', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041017, 'ds-presto-01', 17, 'Sub-Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041018, 'ds-presto-01', 18, 'DaystoShipActual', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041019, 'ds-presto-01', 19, 'SalesForecast', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041020, 'ds-presto-01', 20, 'ShipStatus', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041021, 'ds-presto-01', 21, 'DaystoShipScheduled', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041022, 'ds-presto-01', 22, 'orderprofitable', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041023, 'ds-presto-01', 23, 'SalesperCustomer', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041024, 'ds-presto-01', 24, 'ProfitRatio', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041025, 'ds-presto-01', 25, 'SalesAboveTarget', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041026, 'ds-presto-01', 26, 'latitude', 'LNT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10041027, 'ds-presto-01', 27, 'longitude', 'LNG', 'DIMENSION' );

COMMIT;
