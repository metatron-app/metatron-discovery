-- DataSource
INSERT INTO dataconnection(dc_implementor, id, created_by, created_time, modified_by, modified_time, version, dc_name, dc_hostname, dc_port, dc_type, dc_username, dc_password, dc_database, dc_options) VALUES
('HIVE', 'dc-hive-01', 'polaris', NOW(), 'polaris', NOW(), 0, 'hive-local', 'localhost', 10000, 'JDBC', 'hive', 'hive', NULL, NULL);

INSERT INTO ingestion(id, ingest_data_type, ingest_data_database, ingest_data_schema, ingest_data_query) values
(520, 'TABLE', NULL, 'default', 'sales');

INSERT INTO datasource(id, ds_name, ds_alias, ds_owner_id, ds_desc, ds_filter_at_select, ds_type, ds_conn_type, ds_granularity, ds_enabled, ds_status, dc_id, ingest_id, version, created_time, created_by, modified_time, modified_by) VALUES
('ds-hive-01', 'sales_hive', 'sales_hive_live', 'polaris', 'sales data (2011~2014)', true, 'MASTER', 'LIVE', 'DAY', true, 'ENABLED', 'dc-hive-01', 520, 1.0, NOW(), 'admin',  NOW(), 'admin');

INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042000, 'ds-hive-01', 0, 'OrderDate', 'TIMESTAMP', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042001, 'ds-hive-01', 1, 'Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042002, 'ds-hive-01', 2, 'City', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042003, 'ds-hive-01', 3, 'Country', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042004, 'ds-hive-01', 4, 'CustomerName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042005, 'ds-hive-01', 5, 'Discount', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042006, 'ds-hive-01', 6, 'OrderId', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042007, 'ds-hive-01', 7, 'PostalCode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042008, 'ds-hive-01', 8, 'ProductName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042009, 'ds-hive-01', 9, 'Profit', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042010, 'ds-hive-01', 10, 'Quantity', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042011, 'ds-hive-01', 11, 'Region', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042012, 'ds-hive-01', 12, 'Sales', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042013, 'ds-hive-01', 13, 'Segment', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042014, 'ds-hive-01', 14, 'ShipDate', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042015, 'ds-hive-01', 15, 'ShipMode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042016, 'ds-hive-01', 16, 'State', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042017, 'ds-hive-01', 17, 'Sub-Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042018, 'ds-hive-01', 18, 'DaystoShipActual', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042019, 'ds-hive-01', 19, 'SalesForecast', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042020, 'ds-hive-01', 20, 'ShipStatus', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042021, 'ds-hive-01', 21, 'DaystoShipScheduled', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042022, 'ds-hive-01', 22, 'orderprofitable', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042023, 'ds-hive-01', 23, 'SalesperCustomer', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042024, 'ds-hive-01', 24, 'ProfitRatio', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042025, 'ds-hive-01', 25, 'SalesAboveTarget', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042026, 'ds-hive-01', 26, 'latitude', 'LNT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(11042027, 'ds-hive-01', 27, 'longitude', 'LNG', 'DIMENSION' );

COMMIT;
