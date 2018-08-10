INSERT INTO cloud_cluster (id, cluster_name, cluster_type, cluster_desc, created_by, created_time, modified_by, modified_time, version)
values
('test-cloud1', 'Test Cloud 1', 'KUBERNETES', 'DESC 111', 'admin', NOW(),'admin', NOW(), 1.0);



INSERT INTO cloud_application (app_type, id, created_by, created_time, modified_by, modified_time, version, app_name, cluster_id, app_conf) VALUES
('NGINX', 'web-01', 'admin', '2018-04-13 02:27:12', 'admin', '2018-04-13 02:27:12', 0, 'WEB-Test1', 'test-cloud1', null)
,('NGINX', 'web-02', 'admin', '2018-04-13 02:27:15', 'admin', '2018-04-13 02:27:15', 0, 'WEB-Test2', 'test-cloud1', null)
,('NGINX', 'web-03', 'admin', '2018-04-13 02:33:56', 'admin', '2018-04-13 02:33:56', 0, 'WEB-Test3', 'test-cloud1', null)
,('DRUID', 'druid-1', 'admin', '2018-04-13 02:27:01', 'admin', '2018-04-13 02:27:01', 0, 'Druid-Test1', 'test-cloud1', null)
,('DRUID', 'druid-2', 'admin', '2018-04-15 03:58:31', 'admin', '2018-04-15 03:58:31', 0, 'Druid-TestWith JSON', 'test-cloud1', '{"type":"DRUID","overlordReplicaCount":1,"overlordPort":8090,"coordinatorReplicaCount":1,"coordinatorPort":8081,"historicalReplicaCount":1,"historicalPort":8083,"brokerReplicaCount":1,"brokerPort":8082,"middlemanagerReplicaCount":1,"middlemanagerPort":8091,"specRewriter":{}}')
;