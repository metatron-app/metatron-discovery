

-- create table with predicate
-- sales + sales_category + sales_region -> sales_joined (SqlFile : HL_BDA_ECI001L.HQL)
INSERT INTO data_lineage (cluster, current_db, job_id, ms, owner, predicate, predicate_str, pruning, source_db_name, source_field_comment, source_field_name, source_field_type, source_tb_name, sql_expr, sql_file, sql_hash, sql_id, sql_query, sql_type, target_db_name, target_field_comment, target_field_name, target_field_type, target_tb_name, target_table_temporary, target_table_type, event_time, user_ip_addr)
VALUES
('', 'default', '', null, 'sohncw', false, '', false, 'default', '', 'orderdate', 'timestamp', 'sales', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', 'orderdate', 'timestamp', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', false, '', false, 'default', '', 'category', 'string', 'sales', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', 'category', 'string', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', false, '', false, 'default', '', 'region', 'string', 'sales', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', 'region', 'string', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', false, '', false, 'default', '', 'orderid', 'string', 'sales', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', 'orderid', 'string', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', false, '', false, 'default', '', 'categoryname', 'string', 'sales_category', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', 'categoryname', 'string', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', false, '', false, 'default', '', 'regionname', 'string', 'sales_region', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', 'regionname', 'string', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', true, '(t1.category = t2.category)', false, 'default', '????', 'category', 'string', 'sales', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', '', '', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', true, '(t1.category = t2.category)', false, 'default', '', 'category', 'string', 'sales_category', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', '', '', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', true, '(t1._col9 = t3.region)', false, 'default', '??', 'region', 'string', 'sales', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', '', '', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', true, '(t1._col9 = t3.region)', false, 'default', '', 'region', 'string', 'sales_region', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', '', '', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', true, '((t1.category = t2.category) and (t1.region = t3.region))', false, 'default', '????', 'category', 'string', 'sales', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', '', '', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', true, '((t1.category = t2.category) and (t1.region = t3.region))', false, 'default', '', 'category', 'string', 'sales_category', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', '', '', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', true, '((t1.category = t2.category) and (t1.region = t3.region))', false, 'default', '??', 'region', 'string', 'sales', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', '', '', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '')
, ('', 'default', '', null, 'sohncw', true, '((t1.category = t2.category) and (t1.region = t3.region))', false, 'default', '', 'region', 'string', 'sales_region', '', 'HL_BDA_ECI001L.HQL', '326ed72e14dae0b83847055b3e096fe7', 'e641f8d31d6a426e7333f727d92e22b5', 'create table sales_joined AS select t1.OrderDate, t1.category, t1.region, t1.orderid, t2.categoryname, t3.RegionName  where t1.Category = t2.Category and t1.Region = t3.Region', 'CREATETABLE_AS_SELECT', 'default', '', '', '', 'sales_joined', false, 'MANAGED_TABLE', '2018-01-19 15:19:25', '');


-- create table with predicate
-- sales_joined + sales_category + sales_region -> sales_joined2
INSERT INTO data_lineage
(event_time,cluster,current_db, target_table_type,target_table_temporary,predicate,pruning,sql_query,sql_type,owner, sql_file,job_id,user_ip_addr,predicate_str,source_db_name,source_tb_name,source_field_name,source_field_type,source_field_comment,target_db_name,target_tb_name,target_field_name,target_field_type,target_field_comment)
VALUES
('2017-10-29T20:06:17.700','collector','default','MANAGED_TABLE',false,false,false,'create table sales_joined2\nAS\nselect t1.OrderDate, t1.category, t1.region, t1.orderid, t2.city, t3.categoryname\nfrom sales_joined t1, sales t2, sales_category t3\nwhere t1.orderid = t2.orderid\nand t1.category = t3.category\nand t1.region = South','CREATETABLE_AS_SELECT','sohncw','',null,null,null,'default','sales_joined','orderdate','timestamp',null,'default','sales_joined2','orderdate','timestamp',null),
('2017-10-29T20:06:17.700','collector','default','MANAGED_TABLE',false,false,false,'create table sales_joined2\nAS\nselect t1.OrderDate, t1.category, t1.region, t1.orderid, t2.city, t3.categoryname\nfrom sales_joined t1, sales t2, sales_category t3\nwhere t1.orderid = t2.orderid\nand t1.category = t3.category\nand t1.region = South','CREATETABLE_AS_SELECT','sohncw','',null,null,null,'default','sales_joined','category','string',null,'default','sales_joined2','category','string',null),
('2017-10-29T20:06:17.700','collector','default','MANAGED_TABLE',false,false,false,'create table sales_joined2\nAS\nselect t1.OrderDate, t1.category, t1.region, t1.orderid, t2.city, t3.categoryname\nfrom sales_joined t1, sales t2, sales_category t3\nwhere t1.orderid = t2.orderid\nand t1.category = t3.category\nand t1.region = South','CREATETABLE_AS_SELECT','sohncw','',null,null,null,'default','sales_joined','region','string',null,'default','sales_joined2','region','string',null),
('2017-10-29T20:06:17.700','collector','default','MANAGED_TABLE',false,false,false,'create table sales_joined2\nAS\nselect t1.OrderDate, t1.category, t1.region, t1.orderid, t2.city, t3.categoryname\nfrom sales_joined t1, sales t2, sales_category t3\nwhere t1.orderid = t2.orderid\nand t1.category = t3.category\nand t1.region = South','CREATETABLE_AS_SELECT','sohncw','',null,null,null,'default','sales_joined','orderid','string',null,'default','sales_joined2','orderid','string',null),
('2017-10-29T20:06:17.700','collector','default','MANAGED_TABLE',false,false,false,'create table sales_joined2\nAS\nselect t1.OrderDate, t1.category, t1.region, t1.orderid, t2.city, t3.categoryname\nfrom sales_joined t1, sales t2, sales_category t3\nwhere t1.orderid = t2.orderid\nand t1.category = t3.category\nand t1.region = South','CREATETABLE_AS_SELECT','sohncw','',null,null,null,'default','sales','city','string',null,'default','sales_joined2','city','string',null),
('2017-10-29T20:06:17.700','collector','default','MANAGED_TABLE',false,false,false,'create table sales_joined2\nAS\nselect t1.OrderDate, t1.category, t1.region, t1.orderid, t2.city, t3.categoryname\nfrom sales_joined t1, sales t2, sales_category t3\nwhere t1.orderid = t2.orderid\nand t1.category = t3.category\nand t1.region = South','CREATETABLE_AS_SELECT','sohncw','',null,null,null,'default','sales_category','categoryname','string',null,'default','sales_joined2','categoryname','string',null)
;

-- create table without predicate
-- test -> test333 (SqlFile : HL_BDA_CAL005L.HQL)
INSERT INTO data_lineage (cluster, current_db, job_id, ms, owner, predicate, predicate_str, pruning, source_db_name, source_field_comment, source_field_name, source_field_type, source_tb_name, sql_expr, sql_file, sql_hash, sql_id, sql_query, sql_type, target_db_name, target_field_comment, target_field_name, target_field_type, target_tb_name, target_table_temporary, target_table_type, event_time, user_ip_addr)
VALUES ('', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_orderkey', 'bigint', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_orderkey', 'bigint', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_orderkey', 'bigint', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_orderkey', 'bigint', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_partkey', 'bigint', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_partkey', 'bigint', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_suppkey', 'bigint', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_suppkey', 'bigint', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_linenumber', 'bigint', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_linenumber', 'bigint', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_quantity', 'float', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_quantity', 'float', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_extendedprice', 'float', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_extendedprice', 'float', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_discount', 'float', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_discount', 'float', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_tax', 'float', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_tax', 'float', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_returnflag', 'string', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_returnflag', 'string', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_linestatus', 'string', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_linestatus', 'string', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_shipdate', 'string', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_shipdate', 'string', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_commitdate', 'string', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_commitdate', 'string', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_receiptdate', 'string', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_receiptdate', 'string', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_shipinstruct', 'string', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_shipinstruct', 'string', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_shipmode', 'string', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_shipmode', 'string', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
, ('azure', 'default', '', null, 'hadoop', false, '', false, 'default', '', 'l_comment', 'string', 'test', '', 'HL_BDA_CAL005L.HQL', '4bfdfe1d8e7ae48034229497491ef0ff', '6b12d98babae3e53f4ddef152e1d9ed4', 'create table test333 as select * from test limit 10', 'CREATETABLE_AS_SELECT', 'default', '', 'l_comment', 'string', 'test333', false, 'MANAGED_TABLE', '2018-01-19 16:16:42', '')
;

INSERT INTO data_lineage_workflow (name, shape_id, task_content, task_description, task_file, task_hadoop, task_id, task_name, task_type, workflow_id) 
VALUES ('Hive WorkFlow 1(w/HQL)', '297f73b8-a44f-49d2-979f-59acae352a87', '{"selectedHive":"employees@metatron-poc-h04@10000@employees@hive@hive","hql":"select id  from employees.employees where emp_no=''${EMP_NO}''","path":"","sqlInputType":"D","args":["EMP_NO=${EMP_NO}"],"delList":[],"mkList":[]}', '', null, null, '673814cc-65c3-4584-a480-20c4d37caff4', '변수가 있는 Hive Task', 'HIVE', 'caeaa142-76f9-4446-8b6b-066a667416ec')
, ('Hive WorkFlow 2(w/FILE)', '5100f2f3-b579-4ab1-904a-9e654232850b', '{"path":"hdfs://collect-cluster/userl/etluser/sql/tat_D_ana_I01.hql","hql":"show databases;","selectedHive":"hive1@metatron-poc-h04@10000@default@hadoop@none","delList":[],"mkList":[]}', '', null, null, '8d5076ae-6b6e-46d1-8e34-7165fbc318a4', 'hive task #1', 'HIVE', '82145f3d-4510-4397-bf1b-dbffbe8183fb')
, ('Hive WorkFlow 3(w/FILE,VAR)', '839a171a-a0d8-43c2-baa0-b6aee2580f9f', '{"selectedHive":"employees@metatron-poc-h04@10000@employees@hive@hive","hql":"select id  from employees.employees where emp_no=''${EMP_NO}''","path":"/user/etluser/hql/HL_BDA_ECI001L.HQL","sqlInputType":"D","args":["EMP_NO=${EMP_NO}"],"delList":[],"mkList":[]}', '', null, null, '673814cc-65c3-4584-a480-20c4d37caff4', '변수가 있는 Hive Task', 'HIVE', 'f4e0d1c9-2305-4af9-b79c-c2400729d911')
, ('Hive WorkFlow 4(w/HQL)', 'b91666b4-1911-4d3a-a28a-48424483fc19', '{"selectedHive":"employees@metatron-poc-h04@10000@employees@hive@hive","hql":"select id  from employees.employees where emp_no=''${EMP_NO}''","path":"/user/hql/HL_BDA_CAL005L.HQL","sqlInputType":"D","args":["EMP_NO=${EMP_NO}"],"delList":[],"mkList":[]}', '', null, null, '673814cc-65c3-4584-a480-20c4d37caff4', '변수가 있는 Hive Task', 'HIVE', '6bde2796-0389-44a9-a7a4-b9d3f9d5ebc5')
, ('Hive WorkFlow 5(w/HQL)', 'e211d850-62f8-468c-9463-1d6946e2fdea', '{"selectedHive":"employees@metatron-poc-h04@10000@employees@hive@hive","hql":"DROP TABLE IF EXISTS EMPLOYEES.ORC_EMPLOYEES;\\nCREATE TABLE EMPLOYEES.ORC_EMPLOYEES STORED AS ORC AS SELECT *, current_date() AS job_ts FROM EMPLOYEES.EMPLOYEES;\\n","path":"","sqlInputType":"D","args":[],"delList":[],"mkList":[]}', 'ORC 형식의 employees 테이블로 Transform', null, null, '37dce932-b523-4282-8bb7-8c412aab5d5e', 'Create employees table AS ORC', 'HIVE', '9bd789d7-b802-4634-b9eb-c2e170e21f80')
, ('Hive WorkFlow 6(w/HQL)', 'ee08c7e5-5761-41c2-9ae3-0e4d2b3f9b69', '{"selectedHive":"employees@metatron-poc-h04@10000@employees@hive@hive","hql":"select count(*) from employees;","path":"","sqlInputType":"D","args":["TMP_TABLE=${TMP_TABLE}","NAMENODE=${nameNode}","ETL_YMD=${ETL_YMD}"],"delList":[],"mkList":[]}', '', null, null, 'ec366579-8c6a-4d60-a027-661c6b0c7c67', 'hive #1', 'HIVE', '1e78ebe5-a738-4ee3-9cc3-0a50191684a7')
, ('Hive WorkFlow 7(w/HQL)', 'e2f7a733-a4e4-4390-b563-b5d5f0021569', '{"selectedHive":"employees@metatron-poc-h04@10000@employees@hive@hive","hql":"DROP TABLE IF EXISTS EMPLOYEES.ORC_EMPLOYEES;\\nCREATE TABLE EMPLOYEES.ORC_EMPLOYEES STORED AS ORC AS SELECT *, current_date() AS job_ts FROM EMPLOYEES.EMPLOYEES;\\n","path":"","sqlInputType":"D","args":[],"delList":[],"mkList":[]}', 'ORC 형식의 employees 테이블로 Transform', null, null, '37dce932-b523-4282-8bb7-8c412aab5d5e', 'Create employees table AS ORC', 'HIVE', 'e56059f1-c039-4807-8e82-cc359c6fa6a8')
, ('JAVA WorkFlow 1', '2a0b064c-830e-4cf4-8041-cae641392b42', '{"exec":"workflow.sh","file":["/workflow_task/c3a825f3-770a-4ae6-b132-00a04ed67fd6/workflow.sh"],"readonly":[true],"args":["${NAMENODE}${ETL_BASE_PATH}/${ETL_YMD}/${TMP_TABLE}","${TMP_TABLE}","${OWN_TABLE}","${INSERT_SCRIPT_TYPE}","${ETL_YMD}","${SYS_CODE}"],"delList":[],"mkList":[]}', '', null, null, 'c3a825f3-770a-4ae6-b132-00a04ed67fd6', 'exec #1', 'EXEC', '1e78ebe5-a738-4ee3-9cc3-0a50191684a7')
, ('JAVA WorkFlow 2', '40ec4ac4-7440-49e0-8f93-f33c08c4ab69', '{"name":"","description":"","main-class":"com.metatron.discovery.audit.HiveMetaGatherer","file":[],"readonly":[],"args":["jdbc:hive2://metatron-poc-h04:10000","org.apache.hive.jdbc.HiveDriver","hive","hive","jdbc:mysql://metatron-poc-a01:3306/polaris_v2_2","com.mysql.jdbc.Driver","polaris","polaris"],"delList":[],"mkList":[]}', '', null, null, 'c0f8ef02-684d-4d70-9779-2300f953b9ea', 'Data Lineage - Hive Table Info Gatherer', 'JAVA', '32c99d5b-00a5-4b8b-9133-95727b77196b')
, ('Data Lineage WorkFlow', '8174487e-824f-407e-90a4-53ca9e936019', '{"name":"","description":"","main-class":"com.metatron.discovery.audit.HiveMetaGatherer","file":[],"readonly":[],"args":["jdbc:hive2://metatron-poc-h04:10000","org.apache.hive.jdbc.HiveDriver","hive","hive","jdbc:mysql://metatron-poc-a01:3306/polaris_v2_2","com.mysql.jdbc.Driver","polaris","polaris"],"delList":[],"mkList":[]}', '', null, null, 'c0f8ef02-684d-4d70-9779-2300f953b9ea', 'Data Lineage - Hive Table Info Gatherer', 'JAVA', '353a293e-4fa1-465a-8947-b112adb6d335')
, ('JAVA WorkFlow 3', '41a07852-4a6a-4cb7-9fa3-c5b0e29fcc2e', '{"name":"","description":"","main-class":"ab","java-opts":"ab","file":["./ab"],"readonly":[false],"args":["ab"],"delList":["ab"],"mkList":["ab"]}', 'ab', null, null, 'fe26c80d-6a2e-4f91-80d9-f6667b06ffb6', 'ab', 'JAVA', '80d9d2bd-dc5d-4ebc-8158-8777a7899c4f')
, ('JAVA WorkFlow 4', '59ad7e6c-e10d-4bc3-8684-010afde9d039', '{"name":"","description":"","main-class":"abc","java-opts":"","file":[],"readonly":[],"args":[],"delList":[],"mkList":[]}', '', null, null, '3e14df11-f389-4d7b-946b-3530cff778e0', 'abcrr', 'JAVA', '133ae423-c7cd-4272-bd6e-ddac493dd639')
, ('JAVA WorkFlow 5', 'ab4156dd-c3a7-4aa1-a150-a40c71ad70ab', '{"name":"","description":"","main-class":"main","file":["/user/hadoop/integrator/task/a0ea744a-4877-41fe-b439-2793178755fd/HanaFinancialInvestment%20(2).html"],"readonly":[false],"args":["${TASK}"],"delList":[],"mkList":[]}', '', null, null, 'a0ea744a-4877-41fe-b439-2793178755fd', 'aaaa', 'JAVA', 'a1889cd7-e322-4bc3-bb61-9741ff0c3c42')
, ('180119-02-001ad', 'be1d2ba3-3875-442d-9f47-d42e8552e548', '{"name":"","description":"","main-class":"com.metatron.discovery.audit.HiveMetaGatherer","file":[],"readonly":[],"args":["jdbc:hive2://metatron-poc-h04:10000","org.apache.hive.jdbc.HiveDriver","hive","hive","jdbc:mysql://metatron-poc-a01:3306/polaris_v2_2","com.mysql.jdbc.Driver","polaris","polaris"],"delList":[],"mkList":[]}', '', null, null, 'c0f8ef02-684d-4d70-9779-2300f953b9ea', 'Data Lineage - Hive Table Info Gatherer', 'JAVA', '4cce4b33-6a16-43bf-af17-2435f8b8f65f')
, ('MR WorkFlow', '977a1d63-cfa3-4de0-ab93-950adb3062aa', '{"file":["/user/hadoop/integrator/task/6d9ec10e-e22c-446b-a27e-882300d0267e/Penguins.jpg","/user/hadoop/integrator/task/6d9ec10e-e22c-446b-a27e-882300d0267e/Garden.jpg","/user/hadoop/integrator/task/6d9ec10e-e22c-446b-a27e-882300d0267e/20170529_002_%EC%8B%9C%EA%B0%84%20-%20%EB%B3%B5%EC%82%AC%EB%B3%B8.xlsx","/user/hadoop/integrator/task/6d9ec10e-e22c-446b-a27e-882300d0267e/20170525_001.csv","./agsdfa"],"readonly":[false,false,false,false,false],"configuration":[{"name":"d","value":"d","type":""},{"name":"d","value":"d","type":""},{"name":"d","value":"d","type":""},{"name":"d","value":"d","type":""}],"delList":["dd","d","d","d","d","d","d","d","d"],"mkList":[]}', '', null, null, '6d9ec10e-e22c-446b-a27e-882300d0267e', 'ddd', 'MR', '60af26f0-6be7-47d9-b895-03365a804e91')
, ('EXEC WorkFlow 1', '51a4b84a-6ca7-4835-b2fb-99f755cc924a', '{"exec":"exam.sh","file":["/workflow_task/1feebd02-5e8c-44d2-a8b0-c18dff9ea17e/exam.sh"],"readonly":[true],"args":["${ETL_YMD}"],"delList":[],"mkList":[]}', '', null, null, '1feebd02-5e8c-44d2-a8b0-c18dff9ea17e', 'exec #2', 'EXEC', 'caeaa142-76f9-4446-8b6b-066a667416ec')
, ('변수 워크플로우 #1', '6aeca830-341f-4d14-90c6-51ff96656f58', '{"exec":"exam.sh","file":["/workflow_task/1feebd02-5e8c-44d2-a8b0-c18dff9ea17e/exam.sh"],"readonly":[true],"args":["${ETL_YMD}"],"delList":[],"mkList":[]}', '', null, null, '1feebd02-5e8c-44d2-a8b0-c18dff9ea17e', 'exec #2', 'EXEC', '1e78ebe5-a738-4ee3-9cc3-0a50191684a7')
, ('EXEC WorkFlow 2', '9a6c9752-3167-452a-9312-13deb0c3272f', '{"exec":"/workflow/ext_script/get_hostname.py","file":["/workflow/ext_script/get_hostname.py"],"readonly":[false],"args":["test"],"delList":[],"mkList":[]}', '', null, null, 'b183cb5a-b620-4b91-a225-5bb6457619fe', 'exec sample task', 'EXEC', 'c44f6034-2dd0-4430-8c93-02d3ffeb8186')
, ('EXEC WorkFlow 3', 'b95ebcb9-873c-45c6-ae6e-453e205cbcb0', '{"exec":"lib/exam.sh","file":["/workflow_task/2df292bd-7d12-458b-9347-c16c1bb3ea51/lib/exam.sh"],"readonly":[],"args":["aaaa"],"delList":[],"mkList":[]}', '', null, null, '2df292bd-7d12-458b-9347-c16c1bb3ea51', 'exam.sh', 'EXEC', 'f4e0d1c9-2305-4af9-b79c-c2400729d911')
, ('EXEC WorkFlow 4', 'e4394631-f7aa-43c5-b179-bdbf284bbce1', '{"exec":"lib/exam.sh","file":["/workflow_task/2df292bd-7d12-458b-9347-c16c1bb3ea51/lib/exam.sh"],"readonly":[],"args":["aaaa"],"delList":[],"mkList":[]}', '', null, null, '2df292bd-7d12-458b-9347-c16c1bb3ea51', 'exam.sh', 'EXEC', '60af26f0-6be7-47d9-b895-03365a804e91')
, ('SSH WorkFlow 1', 'e759c258-b8fc-4bc6-8ff6-539980813fe5', '{"command":"test.exezz","host":"idzz@host.test.comzz","args":["11zz","zzz"]}', 'zzz', null, null, 'e1708784-cca6-4367-9242-f294dcbec6d1', 'SSH', 'SSH', '9fd80d6c-e37c-4450-9938-a8522f145782')
;

INSERT INTO data_lineage_table (col_name, comment, data_type, info_type, schema_name, table_name) 
VALUES
('foo', '', 'uniontype<int,double,array<string>,struct<a:int,b:string>>', 'COLUMN', 'default', 'test')
, ('# Detailed Table Information', null, null, 'DETAILED', 'default', 'test')
, ('Database:', null, 'default', 'DETAILED', 'default', 'test')
, ('Owner:', null, 'hive', 'DETAILED', 'default', 'test')
, ('CreateTime:', null, 'Tue Dec 12 11:21:34 KST 2017', 'DETAILED', 'default', 'test')
, ('LastAccessTime:', null, 'UNKNOWN', 'DETAILED', 'default', 'test')
, ('Retention:', null, '0', 'DETAILED', 'default', 'test')
, ('Location:', null, 'hdfs://localhost:9000/user/hive/warehouse/test', 'DETAILED', 'default', 'test')
, ('Table Type:', null, 'MANAGED_TABLE', 'DETAILED', 'default', 'test')
, ('Table Parameters:', null, null, 'DETAILED', 'default', 'test')
, ('', '{\\"BASIC_STATS\\":\\"true\\"}', 'COLUMN_STATS_ACCURATE', 'DETAILED', 'default', 'test')
, ('', '0', 'numFiles', 'DETAILED', 'default', 'test')
, ('', '0', 'numRows', 'DETAILED', 'default', 'test')
, ('', '0', 'rawDataSize', 'DETAILED', 'default', 'test')
, ('', '0', 'totalSize', 'DETAILED', 'default', 'test')
, ('', '1513045294', 'transient_lastDdlTime', 'DETAILED', 'default', 'test')
, ('# Storage Information', null, null, 'STORAGE', 'default', 'test')
, ('SerDe Library:', null, 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe', 'STORAGE', 'default', 'test')
, ('InputFormat:', null, 'org.apache.hadoop.mapred.TextInputFormat', 'STORAGE', 'default', 'test')
, ('OutputFormat:', null, 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat', 'STORAGE', 'default', 'test')
, ('Compressed:', null, 'No', 'STORAGE', 'default', 'test')
, ('Num Buckets:', null, '-1', 'STORAGE', 'default', 'test')
, ('Bucket Columns:', null, '[]', 'STORAGE', 'default', 'test')
, ('Sort Columns:', null, '[]', 'STORAGE', 'default', 'test')
, ('Storage Desc Params:', null, null, 'STORAGE', 'default', 'test')
, ('', '1', 'serialization.format', 'STORAGE', 'default', 'test')

, ('eventtime', '', 'bigint', 'COLUMN', 'default', 'test333')
, ('cluster', '', 'string', 'COLUMN', 'default', 'test333')
, ('currentdatabase', '', 'string', 'COLUMN', 'default', 'test333')
, ('targettabletype', '', 'string', 'COLUMN', 'default', 'test333')
, ('expr', '', 'string', 'COLUMN', 'default', 'test333')
, ('jobid', '', 'string', 'COLUMN', 'default', 'test333')
, ('owner', '', 'string', 'COLUMN', 'default', 'test333')
, ('predicatestr', '', 'string', 'COLUMN', 'default', 'test333')
, ('sourcedatabasename', '', 'string', 'COLUMN', 'default', 'test333')
, ('sourcefieldcomment', '', 'string', 'COLUMN', 'default', 'test333')
, ('sourcefieldname', '', 'string', 'COLUMN', 'default', 'test333')
, ('sourcefieldtype', '', 'string', 'COLUMN', 'default', 'test333')
, ('sourcetablename', '', 'string', 'COLUMN', 'default', 'test333')
, ('targetdatabasename', '', 'string', 'COLUMN', 'default', 'test333')
, ('targetfieldcomment', '', 'string', 'COLUMN', 'default', 'test333')
, ('targetfieldname', '', 'string', 'COLUMN', 'default', 'test333')
, ('targetfieldtype', '', 'string', 'COLUMN', 'default', 'test333')
, ('targettablename', '', 'string', 'COLUMN', 'default', 'test333')
, ('sql', '', 'string', 'COLUMN', 'default', 'test333')
, ('sqlfile', '', 'string', 'COLUMN', 'default', 'test333')
, ('sqlhash', '', 'string', 'COLUMN', 'default', 'test333')
, ('sqlid', '', 'string', 'COLUMN', 'default', 'test333')
, ('sqltype', '', 'string', 'COLUMN', 'default', 'test333')
, ('useripaddress', '', 'string', 'COLUMN', 'default', 'test333')
, ('workflowid', '', 'string', 'COLUMN', 'default', 'test333')
, ('targettabletemporary', '', 'boolean', 'COLUMN', 'default', 'test333')
, ('pruning', '', 'boolean', 'COLUMN', 'default', 'test333')
, ('predicate', '', 'boolean', 'COLUMN', 'default', 'test333')
, ('# Detailed Table Information', null, null, 'DETAILED', 'default', 'test333')
, ('Database:', null, 'default', 'DETAILED', 'default', 'test333')
, ('Owner:', null, 'hive', 'DETAILED', 'default', 'test333')
, ('CreateTime:', null, 'Tue Jan 23 17:51:04 KST 2018', 'DETAILED', 'default', 'test333')
, ('LastAccessTime:', null, 'UNKNOWN', 'DETAILED', 'default', 'test333')
, ('Retention:', null, '0', 'DETAILED', 'default', 'test333')
, ('Location:', null, 'hdfs://localhost:9000/user/hive/warehouse/lineage', 'DETAILED', 'default', 'test333')
, ('Table Type:', null, 'MANAGED_TABLE', 'DETAILED', 'default', 'test333')
, ('Table Parameters:', null, null, 'DETAILED', 'default', 'test333')
, ('', '{\\"BASIC_STATS\\":\\"true\\"}', 'COLUMN_STATS_ACCURATE', 'DETAILED', 'default', 'test333')
, ('', '0', 'numFiles', 'DETAILED', 'default', 'test333')
, ('', '0', 'numRows', 'DETAILED', 'default', 'test333')
, ('', 'snappy', 'orc.compress', 'DETAILED', 'default', 'test333')
, ('', '0', 'rawDataSize', 'DETAILED', 'default', 'test333')
, ('', '0', 'totalSize', 'DETAILED', 'default', 'test333')
, ('', '1516697464', 'transient_lastDdlTime', 'DETAILED', 'default', 'test333')
, ('# Storage Information', null, null, 'STORAGE', 'default', 'test333')
, ('SerDe Library:', null, 'org.apache.hadoop.hive.ql.io.orc.OrcSerde', 'STORAGE', 'default', 'test333')
, ('InputFormat:', null, 'org.apache.hadoop.hive.ql.io.orc.OrcInputFormat', 'STORAGE', 'default', 'test333')
, ('OutputFormat:', null, 'org.apache.hadoop.hive.ql.io.orc.OrcOutputFormat', 'STORAGE', 'default', 'test333')
, ('Compressed:', null, 'No', 'STORAGE', 'default', 'test333')
, ('Num Buckets:', null, '-1', 'STORAGE', 'default', 'test333')
, ('Bucket Columns:', null, '[]', 'STORAGE', 'default', 'test333')
, ('Sort Columns:', null, '[]', 'STORAGE', 'default', 'test333')
, ('Storage Desc Params:', null, null, 'STORAGE', 'default', 'test333')
, ('', '1', 'serialization.format', 'STORAGE', 'default', 'test333')

, ('orderdate', '', 'timestamp', 'COLUMN', 'default', 'sales'),
('category', '', 'string', 'COLUMN', 'default', 'sales'),
('city', '', 'string', 'COLUMN', 'default', 'sales'),
('country', '', 'string', 'COLUMN', 'default', 'sales'),
('customername', '', 'string', 'COLUMN', 'default', 'sales'),
('orderid', '', 'string', 'COLUMN', 'default', 'sales'),
('postalcode', '', 'string', 'COLUMN', 'default', 'sales'),
('productname', '', 'string', 'COLUMN', 'default', 'sales'),
('quantity', '', 'string', 'COLUMN', 'default', 'sales'),
('region', '', 'string', 'COLUMN', 'default', 'sales'),
('segment', '', 'string', 'COLUMN', 'default', 'sales'),
('shipdate', '', 'string', 'COLUMN', 'default', 'sales'),
('shipmode', '', 'string', 'COLUMN', 'default', 'sales'),
('state', '', 'string', 'COLUMN', 'default', 'sales'),
('sub-category', '', 'string', 'COLUMN', 'default', 'sales'),
('shipstatus', '', 'string', 'COLUMN', 'default', 'sales'),
('orderprofitable', '', 'string', 'COLUMN', 'default', 'sales'),
('salesabovetarget', '', 'string', 'COLUMN', 'default', 'sales'),
('latitude', '', 'string', 'COLUMN', 'default', 'sales'),
('longitude', '', 'string', 'COLUMN', 'default', 'sales'),
('discount', '', 'double', 'COLUMN', 'default', 'sales'),
('profit', '', 'double', 'COLUMN', 'default', 'sales'),
('sales', '', 'double', 'COLUMN', 'default', 'sales'),
('daystoshipactual', '', 'double', 'COLUMN', 'default', 'sales'),
('salesforecast', '', 'double', 'COLUMN', 'default', 'sales'),
('daystoshipscheduled', '', 'double', 'COLUMN', 'default', 'sales'),
('salespercustomer', '', 'double', 'COLUMN', 'default', 'sales'),
('profitratio', '', 'double', 'COLUMN', 'default', 'sales'),
('# Detailed Table Information', 'null', 'null', 'DETAILED', 'default', 'sales'),
('Database:', 'null', 'default', 'DETAILED', 'default', 'sales'),
('Owner:', 'null', 'sohncw', 'DETAILED', 'default', 'sales'),
('CreateTime:', 'null', 'Mon Jul 24 09:51:17 KST 2017', 'DETAILED', 'default', 'sales'),
('LastAccessTime:', 'null', 'UNKNOWN', 'DETAILED', 'default', 'sales'),
('Protect Mode:', 'null', 'None', 'DETAILED', 'default', 'sales'),
('Retention:', 'null', '0', 'DETAILED', 'default', 'sales'),
('Location:', 'null', 'hdfs://localhost:9000/user/hive/warehouse/sales', 'DETAILED', 'default', 'sales'),
('Table Type:', 'null', 'MANAGED_TABLE', 'DETAILED', 'default', 'sales'),
('Table Parameters:', 'null', 'null', 'DETAILED', 'default', 'sales'),
('', 'false', 'COLUMN_STATS_ACCURATE', 'DETAILED', 'default', 'sales'),
('', '123', 'comment', 'DETAILED', 'default', 'sales'),
('', 'sohncw', 'last_modified_by', 'DETAILED', 'default', 'sales'),
('', '1508289564', 'last_modified_time', 'DETAILED', 'default', 'sales'),
('', '1', 'numFiles', 'DETAILED', 'default', 'sales'),
('', '-1', 'numRows', 'DETAILED', 'default', 'sales'),
('', '-1', 'rawDataSize', 'DETAILED', 'default', 'sales'),
('', '2731122', 'totalSize', 'DETAILED', 'default', 'sales'),
('', '1508289564', 'transient_lastDdlTime', 'DETAILED', 'default', 'sales'),
('# Storage Information', 'null', 'null', 'STORAGE', 'default', 'sales'),
('SerDe Library:', 'null', 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe', 'STORAGE', 'default', 'sales'),
('InputFormat:', 'null', 'org.apache.hadoop.mapred.TextInputFormat', 'STORAGE', 'default', 'sales'),
('OutputFormat:', 'null', 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat', 'STORAGE', 'default', 'sales'),
('Compressed:', 'null', 'No', 'STORAGE', 'default', 'sales'),
('Num Buckets:', 'null', '-1', 'STORAGE', 'default', 'sales'),
('Bucket Columns:', 'null', '[]', 'STORAGE', 'default', 'sales'),
('Sort Columns:', 'null', '[]', 'STORAGE', 'default', 'sales'),
('Storage Desc Params:', 'null', 'null', 'STORAGE', 'default', 'sales'),
('', '\t', 'field.delim', 'STORAGE', 'default', 'sales'),
('', '\t', 'serialization.format', 'STORAGE', 'default', 'sales'),
('created', '', 'timestamp', 'COLUMN', 'default', 'sales_category'),
('category', '', 'string', 'COLUMN', 'default', 'sales_category'),
('categoryname', '', 'string', 'COLUMN', 'default', 'sales_category'),
('categorycode', '', 'string', 'COLUMN', 'default', 'sales_category'),
('# Detailed Table Information', 'null', 'null', 'DETAILED', 'default', 'sales_category'),
('Database:', 'null', 'default', 'DETAILED', 'default', 'sales_category'),
('Owner:', 'null', 'sohncw', 'DETAILED', 'default', 'sales_category'),
('CreateTime:', 'null', 'Wed Oct 25 09:10:51 KST 2017', 'DETAILED', 'default', 'sales_category'),
('LastAccessTime:', 'null', 'UNKNOWN', 'DETAILED', 'default', 'sales_category'),
('Protect Mode:', 'null', 'None', 'DETAILED', 'default', 'sales_category'),
('Retention:', 'null', '0', 'DETAILED', 'default', 'sales_category'),
('Location:', 'null', 'hdfs://localhost:9000/user/hive/warehouse/sales_category', 'DETAILED', 'default', 'sales_category'),
('Table Type:', 'null', 'MANAGED_TABLE', 'DETAILED', 'default', 'sales_category'),
('Table Parameters:', 'null', 'null', 'DETAILED', 'default', 'sales_category'),
('', 'true', 'COLUMN_STATS_ACCURATE', 'DETAILED', 'default', 'sales_category'),
('', '1', 'numFiles', 'DETAILED', 'default', 'sales_category'),
('', '0', 'numRows', 'DETAILED', 'default', 'sales_category'),
('', '0', 'rawDataSize', 'DETAILED', 'default', 'sales_category'),
('', '130', 'totalSize', 'DETAILED', 'default', 'sales_category'),
('', '1508890251', 'transient_lastDdlTime', 'DETAILED', 'default', 'sales_category'),
('# Storage Information', 'null', 'null', 'STORAGE', 'default', 'sales_category'),
('SerDe Library:', 'null', 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe', 'STORAGE', 'default', 'sales_category'),
('InputFormat:', 'null', 'org.apache.hadoop.mapred.TextInputFormat', 'STORAGE', 'default', 'sales_category'),
('OutputFormat:', 'null', 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat', 'STORAGE', 'default', 'sales_category'),
('Compressed:', 'null', 'No', 'STORAGE', 'default', 'sales_category'),
('Num Buckets:', 'null', '-1', 'STORAGE', 'default', 'sales_category'),
('Bucket Columns:', 'null', '[]', 'STORAGE', 'default', 'sales_category'),
('Sort Columns:', 'null', '[]', 'STORAGE', 'default', 'sales_category'),
('Storage Desc Params:', 'null', 'null', 'STORAGE', 'default', 'sales_category'),
('', ',', 'field.delim', 'STORAGE', 'default', 'sales_category'),
('', ',', 'serialization.format', 'STORAGE', 'default', 'sales_category'),
('created', '', 'timestamp', 'COLUMN', 'default', 'sales_region'),
('region', '', 'string', 'COLUMN', 'default', 'sales_region'),
('regionname', '', 'string', 'COLUMN', 'default', 'sales_region'),
('# Detailed Table Information', 'null', 'null', 'DETAILED', 'default', 'sales_region'),
('Database:', 'null', 'default', 'DETAILED', 'default', 'sales_region'),
('Owner:', 'null', 'sohncw', 'DETAILED', 'default', 'sales_region'),
('CreateTime:', 'null', 'Wed Oct 25 09:10:51 KST 2017', 'DETAILED', 'default', 'sales_region'),
('LastAccessTime:', 'null', 'UNKNOWN', 'DETAILED', 'default', 'sales_region'),
('Protect Mode:', 'null', 'None', 'DETAILED', 'default', 'sales_region'),
('Retention:', 'null', '0', 'DETAILED', 'default', 'sales_region'),
('Location:', 'null', 'hdfs://localhost:9000/user/hive/warehouse/sales_region', 'DETAILED', 'default', 'sales_region'),
('Table Type:', 'null', 'MANAGED_TABLE', 'DETAILED', 'default', 'sales_region'),
('Table Parameters:', 'null', 'null', 'DETAILED', 'default', 'sales_region'),
('', 'true', 'COLUMN_STATS_ACCURATE', 'DETAILED', 'default', 'sales_region'),
('', '1', 'numFiles', 'DETAILED', 'default', 'sales_region'),
('', '0', 'numRows', 'DETAILED', 'default', 'sales_region'),
('', '0', 'rawDataSize', 'DETAILED', 'default', 'sales_region'),
('', '131', 'totalSize', 'DETAILED', 'default', 'sales_region'),
('', '1508890252', 'transient_lastDdlTime', 'DETAILED', 'default', 'sales_region'),
('# Storage Information', 'null', 'null', 'STORAGE', 'default', 'sales_region'),
('SerDe Library:', 'null', 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe', 'STORAGE', 'default', 'sales_region'),
('InputFormat:', 'null', 'org.apache.hadoop.mapred.TextInputFormat', 'STORAGE', 'default', 'sales_region'),
('OutputFormat:', 'null', 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat', 'STORAGE', 'default', 'sales_region'),
('Compressed:', 'null', 'No', 'STORAGE', 'default', 'sales_region'),
('Num Buckets:', 'null', '-1', 'STORAGE', 'default', 'sales_region'),
('Bucket Columns:', 'null', '[]', 'STORAGE', 'default', 'sales_region'),
('Sort Columns:', 'null', '[]', 'STORAGE', 'default', 'sales_region'),
('Storage Desc Params:', 'null', 'null', 'STORAGE', 'default', 'sales_region'),
('', ',', 'field.delim', 'STORAGE', 'default', 'sales_region'),
('', ',', 'serialization.format', 'STORAGE', 'default', 'sales_region'),
('orderdate', '', 'timestamp', 'COLUMN', 'default', 'sales_joined'),
('category', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('city', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('country', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('customername', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('orderid', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('postalcode', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('productname', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('quantity', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('region', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('segment', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('shipdate', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('shipmode', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('state', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('sub-category', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('shipstatus', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('orderprofitable', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('salesabovetarget', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('latitude', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('longitude', '', 'string', 'COLUMN', 'default', 'sales_joined'),
('discount', '', 'double', 'COLUMN', 'default', 'sales_joined'),
('profit', '', 'double', 'COLUMN', 'default', 'sales_joined'),
('sales', '', 'double', 'COLUMN', 'default', 'sales_joined'),
('daystoshipactual', '', 'double', 'COLUMN', 'default', 'sales_joined'),
('salesforecast', '', 'double', 'COLUMN', 'default', 'sales_joined'),
('daystoshipscheduled', '', 'double', 'COLUMN', 'default', 'sales_joined'),
('salespercustomer', '', 'double', 'COLUMN', 'default', 'sales_joined'),
('profitratio', '', 'double', 'COLUMN', 'default', 'sales_joined'),
('# Detailed Table Information', 'null', 'null', 'DETAILED', 'default', 'sales_joined'),
('Database:', 'null', 'default', 'DETAILED', 'default', 'sales_joined'),
('Owner:', 'null', 'sohncw', 'DETAILED', 'default', 'sales_joined'),
('CreateTime:', 'null', 'Mon Jul 24 09:51:17 KST 2017', 'DETAILED', 'default', 'sales_joined'),
('LastAccessTime:', 'null', 'UNKNOWN', 'DETAILED', 'default', 'sales_joined'),
('Protect Mode:', 'null', 'None', 'DETAILED', 'default', 'sales_joined'),
('Retention:', 'null', '0', 'DETAILED', 'default', 'sales_joined'),
('Location:', 'null', 'hdfs://localhost:9000/user/hive/warehouse/sales', 'DETAILED', 'default', 'sales_joined'),
('Table Type:', 'null', 'MANAGED_TABLE', 'DETAILED', 'default', 'sales_joined'),
('Table Parameters:', 'null', 'null', 'DETAILED', 'default', 'sales_joined'),
('', 'false', 'COLUMN_STATS_ACCURATE', 'DETAILED', 'default', 'sales_joined'),
('', '123', 'comment', 'DETAILED', 'default', 'sales_joined'),
('', 'sohncw', 'last_modified_by', 'DETAILED', 'default', 'sales_joined'),
('', '1508289564', 'last_modified_time', 'DETAILED', 'default', 'sales_joined'),
('', '1', 'numFiles', 'DETAILED', 'default', 'sales_joined'),
('', '-1', 'numRows', 'DETAILED', 'default', 'sales_joined'),
('', '-1', 'rawDataSize', 'DETAILED', 'default', 'sales_joined'),
('', '2731122', 'totalSize', 'DETAILED', 'default', 'sales_joined'),
('', '1508289564', 'transient_lastDdlTime', 'DETAILED', 'default', 'sales_joined'),
('# Storage Information', 'null', 'null', 'STORAGE', 'default', 'sales_joined'),
('SerDe Library:', 'null', 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe', 'STORAGE', 'default', 'sales_joined'),
('InputFormat:', 'null', 'org.apache.hadoop.mapred.TextInputFormat', 'STORAGE', 'default', 'sales_joined'),
('OutputFormat:', 'null', 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat', 'STORAGE', 'default', 'sales_joined'),
('Compressed:', 'null', 'No', 'STORAGE', 'default', 'sales_joined'),
('Num Buckets:', 'null', '-1', 'STORAGE', 'default', 'sales_joined'),
('Bucket Columns:', 'null', '[]', 'STORAGE', 'default', 'sales_joined'),
('Sort Columns:', 'null', '[]', 'STORAGE', 'default', 'sales_joined'),
('Storage Desc Params:', 'null', 'null', 'STORAGE', 'default', 'sales_joined'),
('', '\t', 'field.delim', 'STORAGE', 'default', 'sales_joined'),
('', '\t', 'serialization.format', 'STORAGE', 'default', 'sales_joined'),
('orderdate', '', 'timestamp', 'COLUMN', 'default', 'sales_joined2'),
('category', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('city', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('country', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('customername', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('orderid', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('postalcode', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('productname', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('quantity', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('region', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('segment', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('shipdate', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('shipmode', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('state', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('sub-category', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('shipstatus', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('orderprofitable', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('salesabovetarget', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('latitude', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('longitude', '', 'string', 'COLUMN', 'default', 'sales_joined2'),
('discount', '', 'double', 'COLUMN', 'default', 'sales_joined2'),
('profit', '', 'double', 'COLUMN', 'default', 'sales_joined2'),
('sales', '', 'double', 'COLUMN', 'default', 'sales_joined2'),
('daystoshipactual', '', 'double', 'COLUMN', 'default', 'sales_joined2'),
('salesforecast', '', 'double', 'COLUMN', 'default', 'sales_joined2'),
('daystoshipscheduled', '', 'double', 'COLUMN', 'default', 'sales_joined2'),
('salespercustomer', '', 'double', 'COLUMN', 'default', 'sales_joined2'),
('profitratio', '', 'double', 'COLUMN', 'default', 'sales_joined2'),
('# Detailed Table Information', 'null', 'null', 'DETAILED', 'default', 'sales_joined2'),
('Database:', 'null', 'default', 'DETAILED', 'default', 'sales_joined2'),
('Owner:', 'null', 'sohncw', 'DETAILED', 'default', 'sales_joined2'),
('CreateTime:', 'null', 'Mon Jul 24 09:51:17 KST 2017', 'DETAILED', 'default', 'sales_joined2'),
('LastAccessTime:', 'null', 'UNKNOWN', 'DETAILED', 'default', 'sales_joined2'),
('Protect Mode:', 'null', 'None', 'DETAILED', 'default', 'sales_joined2'),
('Retention:', 'null', '0', 'DETAILED', 'default', 'sales_joined2'),
('Location:', 'null', 'hdfs://localhost:9000/user/hive/warehouse/sales', 'DETAILED', 'default', 'sales_joined2'),
('Table Type:', 'null', 'MANAGED_TABLE', 'DETAILED', 'default', 'sales_joined2'),
('Table Parameters:', 'null', 'null', 'DETAILED', 'default', 'sales_joined2'),
('', 'false', 'COLUMN_STATS_ACCURATE', 'DETAILED', 'default', 'sales_joined2'),
('', '123', 'comment', 'DETAILED', 'default', 'sales_joined2'),
('', 'sohncw', 'last_modified_by', 'DETAILED', 'default', 'sales_joined2'),
('', '1508289564', 'last_modified_time', 'DETAILED', 'default', 'sales_joined2'),
('', '1', 'numFiles', 'DETAILED', 'default', 'sales_joined2'),
('', '-1', 'numRows', 'DETAILED', 'default', 'sales_joined2'),
('', '-1', 'rawDataSize', 'DETAILED', 'default', 'sales_joined2'),
('', '2731122', 'totalSize', 'DETAILED', 'default', 'sales_joined2'),
('', '1508289564', 'transient_lastDdlTime', 'DETAILED', 'default', 'sales_joined2'),
('# Storage Information', 'null', 'null', 'STORAGE', 'default', 'sales_joined2'),
('SerDe Library:', 'null', 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe', 'STORAGE', 'default', 'sales_joined2'),
('InputFormat:', 'null', 'org.apache.hadoop.mapred.TextInputFormat', 'STORAGE', 'default', 'sales_joined2'),
('OutputFormat:', 'null', 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat', 'STORAGE', 'default', 'sales_joined2'),
('Compressed:', 'null', 'No', 'STORAGE', 'default', 'sales_joined2'),
('Num Buckets:', 'null', '-1', 'STORAGE', 'default', 'sales_joined2'),
('Bucket Columns:', 'null', '[]', 'STORAGE', 'default', 'sales_joined2'),
('Sort Columns:', 'null', '[]', 'STORAGE', 'default', 'sales_joined2'),
('Storage Desc Params:', 'null', 'null', 'STORAGE', 'default', 'sales_joined2'),
('', '\t', 'field.delim', 'STORAGE', 'default', 'sales_joined2'),
('', '\t', 'serialization.format', 'STORAGE', 'default', 'sales_joined2');
