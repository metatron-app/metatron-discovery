-- DataSource
INSERT INTO dataconnection(dc_implementor, id, created_by, created_time, modified_by, modified_time, version, dc_name, dc_hostname, dc_port, dc_type, dc_username, dc_password, dc_database, dc_options) VALUES('PHOENIX', 'dc-phoenix-01', 'polaris@metatron.com', NOW(), 'polaris@metatron.com', NOW(), 0, 'phoenix-local', 'localhost', 8765, 'JDBC', 'phoenix', 'phoenix', NULL, NULL);

INSERT INTO ingestion(id, ingest_data_type, ingest_data_database, ingest_data_schema, ingest_data_query) values(420, 'TABLE', NULL, NULL, 'sales');

INSERT INTO datasource(id, ds_name, ds_alias, ds_owner_id, ds_desc, ds_filter_at_select, ds_type, ds_conn_type, ds_granularity, ds_enabled, ds_status, dc_id, ingest_id, version, created_time, created_by, modified_time, modified_by) VALUES('ds-42', 'sales_phoenix', 'sales_phoenix_live', 'polaris@metatron.com', 'sales data (2011~2014)', true, 'MASTER', 'LIVE', 'DAY', true, 'ENABLED', 'dc-phoenix-01', 420, 1.0, NOW(), 'admin@metatron.com',  NOW(), 'admin@metatron.com');

INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042000, 'ds-42', 0, 'OrderDate', 'TIMESTAMP', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042001, 'ds-42', 1, 'Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042002, 'ds-42', 2, 'City', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042003, 'ds-42', 3, 'Country', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042004, 'ds-42', 4, 'CustomerName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042005, 'ds-42', 5, 'Discount', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042006, 'ds-42', 6, 'OrderId', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042007, 'ds-42', 7, 'PostalCode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042008, 'ds-42', 8, 'ProductName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042009, 'ds-42', 9, 'Profit', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042010, 'ds-42', 10, 'Quantity', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042011, 'ds-42', 11, 'Region', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042012, 'ds-42', 12, 'Sales', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042013, 'ds-42', 13, 'Segment', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042014, 'ds-42', 14, 'ShipDate', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042015, 'ds-42', 15, 'ShipMode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042016, 'ds-42', 16, 'State', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042017, 'ds-42', 17, 'Sub-Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042018, 'ds-42', 18, 'DaystoShipActual', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042019, 'ds-42', 19, 'SalesForecast', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042020, 'ds-42', 20, 'ShipStatus', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042021, 'ds-42', 21, 'DaystoShipScheduled', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042022, 'ds-42', 22, 'orderprofitable', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042023, 'ds-42', 23, 'SalesperCustomer', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042024, 'ds-42', 24, 'ProfitRatio', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042025, 'ds-42', 25, 'SalesAboveTarget', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042026, 'ds-42', 26, 'latitude', 'LNT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10042027, 'ds-42', 27, 'longitude', 'LNG', 'DIMENSION' );

COMMIT;
