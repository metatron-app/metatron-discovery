-- DataSource
INSERT INTO datasource(id, ds_name, ds_alias, ds_owner_id, ds_desc, ds_filter_at_select, ds_type, ds_conn_type, ds_granularity, version, created_time, created_by, modified_time, modified_by) values('ds-37', 'sale_02', 'sale_02', 'polaris@metatron.com', 'sale_02 data (2011~2014)', true, 'MASTER', 'ENGINE', 'DAY', 1.0, NOW(), 'admin@metatron.com',  NOW(), 'admin@metatron.com');

INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037001, 'ds-37', 1, 'Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type, field_filtering, field_filtering_seq, field_filtering_options) values(10037002, 'ds-37', 2, 'City', 'TEXT', 'DIMENSION', TRUE, 2, '[ {"type" : "MULTI_LIST", "default" : true}, {"type" : "MULTI_COMBO"} ]');
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037003, 'ds-37', 3, 'Country', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037004, 'ds-37', 4, 'CustomerName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037005, 'ds-37', 5, 'Discount', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037006, 'ds-37', 6, 'OrderID', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037007, 'ds-37', 7, 'PostalCode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037008, 'ds-37', 8, 'ProductName', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037009, 'ds-37', 9, 'Profit', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037010, 'ds-37', 10, 'Quantity', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037011, 'ds-37', 11, 'Region', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037012, 'ds-37', 12, 'Sales', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037013, 'ds-37', 13, 'Segment', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037014, 'ds-37', 14, 'ShipDate', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037015, 'ds-37', 15, 'ShipMode', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type, field_filtering, field_filtering_seq) values(10037016, 'ds-37', 16, 'State', 'TEXT', 'DIMENSION', TRUE, 1);
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037017, 'ds-37', 17, 'Sub-Category', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037018, 'ds-37', 18, 'DaystoShipActual', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037019, 'ds-37', 19, 'SalesForecast', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037020, 'ds-37', 20, 'ShipStatus', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037021, 'ds-37', 21, 'DaystoShipScheduled', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037022, 'ds-37', 22, 'OrderProfitable', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037023, 'ds-37', 23, 'SalesperCustomer', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037024, 'ds-37', 24, 'ProfitRatio', 'DOUBLE', 'MEASURE' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037025, 'ds-37', 25, 'SalesaboveTarget', 'TEXT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037026, 'ds-37', 26, 'latitude', 'LNT', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037027, 'ds-37', 27, 'longitude', 'LNG', 'DIMENSION' );
INSERT INTO field(id, ds_id, seq, field_name, field_type, bi_type) values(10037028, 'ds-37', 28, 'orderdate', 'TIMESTAMP', 'TIMESTAMP' );

COMMIT;
