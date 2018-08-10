-- 테스트 Workbook 생성
INSERT INTO BOOK(TYPE, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, BOOK_DESC, BOOK_FAVORITE, BOOK_FOLDER_ID, BOOK_NAME, BOOK_TAG, WS_ID) VALUES
('workbook', 'wb-001', 'admin', now(), 'admin', now(), 0, NULL, FALSE, 'ROOT', 'testworkbook-1', '', 'ws-02');
INSERT INTO BOOK_WORKBOOK(ID) VALUES('wb-001');

INSERT INTO PUBLIC.DASHBOARD(ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, BOARD_CONF, BOARD_DESCRIPTION, BOARD_IMAGE_URL, BOARD_NAME, BOARD_TAG, BOARD_SEQ, BOARD_HIDING, BOOK_ID) VALUES
('db-001', 'polaris', now(), 'polaris', now(), 0, '{"dataSource":{"type": "default", "name": "sales"}}', NULL, NULL, 'dashboard-test1', NULL, 0, TRUE ,'wb-001');

INSERT INTO PUBLIC.DATASOURCE_DASHBOARD(DASHBOARD_ID, DS_ID) VALUES
('db-001', 'ds-37');

INSERT INTO DASHBOARD_WIDGET(WIDGET_TYPE, ID, CREATED_BY, CREATED_TIME, MODIFIED_BY, MODIFIED_TIME, VERSION, WIDGET_CONF, WIDGET_DESCRIPTION, WIDGET_NAME, PAGE_IMAGE_URL, WIDGET_TEXT_CONTENTS, BOARD_ID) VALUES
('page', 'widget-page-001', 'polaris', now(), 'polaris', now(), 0, '{"type":"page","dataSource":{"type":"default","name":"sales"},"filters":[{"type":"include","field":"Category","valueList":["Furniture"]}],"pivot":{"columns":[{"type":"dimension","name":"Category","alias":"Category","granularity":null,"timeExprUnit":null,"timeZone":null,"locale":null,"format":null,"ref":null}],"rows":null,"aggregations":[{"type":"measure","name":"Sales","alias":"AVG(Sales)","ref":null,"aggregationType":"AVG","options":null}]}}', 'desc', 'widget-page-001', '/test/abc1.png', NULL, 'db-001');

