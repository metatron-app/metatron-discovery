-- DataSource
INSERT INTO dataconnection(dc_implementor, id, created_by, created_time, modified_by, modified_time, version, dc_desc, dc_hostname, dc_name, dc_password, dc_port, dc_type, dc_url, dc_username, dc_database, dc_options, dc_sid, dc_catalog) VALUES
('ORACLE', 'dc-oracle-01', 'admin', NOW(), 'admin', NOW(), 0, NULL, '50.1.101.124', 'Oracle-LabDev', 'fdc', 1521, 'JDBC', NULL, 'fdc', NULL, NULL, 'ORCL', NULL);

INSERT INTO ingestion(id, ingest_data_type, ingest_data_database, ingest_data_schema, ingest_data_query) values(10050, 'TABLE', NULL, NULL, 'sales');

INSERT INTO datasource(id, ds_name, ds_alias, ds_owner_id, ds_desc, ds_filter_at_select, ds_type, ds_conn_type, ds_granularity, ds_enabled, ds_status, dc_id, ingest_id, version, created_time, created_by, modified_time, modified_by) values
('ds-oracle-01', 'sales_oracle', 'sale_oracle_live', 'admin', 'sales data (2011~2014)', true, 'MASTER', 'LIVE', 'DAY', true, 'ENABLED', 'dc-oracle-01', 10050, 1.0, NOW(), 'admin',  NOW(), 'admin');

INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049000, 'ds-oracle-01', 0, 'OrderDate', 'TIMESTAMP', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049001, 'ds-oracle-01', 1, 'Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049002, 'ds-oracle-01', 2, 'City', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049003, 'ds-oracle-01', 3, 'Country', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049004, 'ds-oracle-01', 4, 'CustomerName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049005, 'ds-oracle-01', 5, 'Discount', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049006, 'ds-oracle-01', 6, 'OrderId', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049007, 'ds-oracle-01', 7, 'PostalCode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049008, 'ds-oracle-01', 8, 'ProductName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049009, 'ds-oracle-01', 9, 'Profit', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049010, 'ds-oracle-01', 10, 'Quantity', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049011, 'ds-oracle-01', 11, 'Region', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049012, 'ds-oracle-01', 12, 'Sales', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049013, 'ds-oracle-01', 13, 'Segment', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049014, 'ds-oracle-01', 14, 'ShipDate', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049015, 'ds-oracle-01', 15, 'ShipMode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049016, 'ds-oracle-01', 16, 'State', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049017, 'ds-oracle-01', 17, 'Sub-Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049018, 'ds-oracle-01', 18, 'DaystoShipActual', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049019, 'ds-oracle-01', 19, 'SalesForecast', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049020, 'ds-oracle-01', 20, 'ShipStatus', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049021, 'ds-oracle-01', 21, 'DaystoShipScheduled', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049022, 'ds-oracle-01', 22, 'orderprofitable', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049023, 'ds-oracle-01', 23, 'SalesperCustomer', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049024, 'ds-oracle-01', 24, 'ProfitRatio', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049025, 'ds-oracle-01', 25, 'SalesAboveTarget', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049026, 'ds-oracle-01', 26, 'latitude', 'LNT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10049027, 'ds-oracle-01', 27, 'longitude', 'LNG', 'DIMENSION' );

COMMIT;
