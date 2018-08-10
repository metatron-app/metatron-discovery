-- DataSource
INSERT INTO dataconnection(ds_implementor, id, created_by, created_time, modified_by, modified_time, version, dc_name, ds_hostname, ds_port, dc_type, ds_username, ds_password, dc_database) VALUES
('HIVE', 'dc-hive-01', 'polaris@metatron.com', NOW(), 'polaris@metatron.com', NOW(), 0, 'Hive-Local', 'localhost', 10000, 'JDBC', 'hive', 'hive', 'default');

INSERT INTO ingestion(id, ingest_data_database, ingest_data_schema, ingest_data_type, ingest_data_query) values(430, 'default', NULL, 'TABLE', 'sales');

INSERT INTO datasource(id, ds_name, ds_alias, ds_owner_id, ds_desc, ds_filter_at_select, ds_type, ds_conn_type, ds_granularity, ds_enabled, ds_published, dc_id, ingest_id, version, created_time, created_by, modified_time, modified_by) values
('ds-43', 'sales', 'sale_hive', 'polaris@metatron.com', 'sales data (2011~2014)', true, 'MASTER', 'LIVE', 'DAY', true, true, 'dc-hive-01', 430, 1.0, NOW(), 'admin@metatron.com',  NOW(), 'admin@metatron.com');

INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043000, 'ds-43', 0, 'OrderDate', 'TIMESTAMP', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043001, 'ds-43', 1, 'Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043002, 'ds-43', 2, 'City', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043003, 'ds-43', 3, 'Country', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043004, 'ds-43', 4, 'CustomerName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043005, 'ds-43', 5, 'Discount', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043006, 'ds-43', 6, 'OrderId', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043007, 'ds-43', 7, 'PostalCode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043008, 'ds-43', 8, 'ProductName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043009, 'ds-43', 9, 'Profit', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043010, 'ds-43', 10, 'Quantity', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043011, 'ds-43', 11, 'Region', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043012, 'ds-43', 12, 'Sales', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043013, 'ds-43', 13, 'Segment', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043014, 'ds-43', 14, 'ShipDate', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043015, 'ds-43', 15, 'ShipMode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043016, 'ds-43', 16, 'State', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043017, 'ds-43', 17, 'Sub-Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043018, 'ds-43', 18, 'DaystoShipActual', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043019, 'ds-43', 19, 'SalesForecast', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043020, 'ds-43', 20, 'ShipStatus', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043021, 'ds-43', 21, 'DaystoShipScheduled', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043022, 'ds-43', 22, 'orderprofitable', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043023, 'ds-43', 23, 'SalesperCustomer', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043024, 'ds-43', 24, 'ProfitRatio', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043025, 'ds-43', 25, 'SalesAboveTarget', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043026, 'ds-43', 26, 'latitude', 'LNT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10043027, 'ds-43', 27, 'longitude', 'LNG', 'DIMENSION' );

COMMIT;
