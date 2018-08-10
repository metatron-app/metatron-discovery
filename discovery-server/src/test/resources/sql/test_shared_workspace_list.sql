INSERT INTO workspace(id, ws_name, ws_owner_id, ws_pub_type, ws_desc, ws_published, ws_active, version, created_time, created_by, modified_time, modified_by) VALUES
('ws-0001', 'Shared Workspace11', 'admin', 'SHARED', '', NULL, NULL, 1.0, NOW(), 'admin',  NOW(), 'admin'),
('ws-0002', 'Shared Workspace12', 'admin', 'SHARED', '', NULL, NULL, 1.0, NOW(), 'admin',  NOW(), 'admin'),
('ws-0003', 'Shared Workspace23', 'admin', 'SHARED', '', NULL, NULL, 1.0, NOW(), 'admin',  NOW(), 'admin'),
('ws-0004', 'Shared Workspace24', 'polaris', 'SHARED', '', true, NULL, 1.0, NOW(), 'admin',  NOW(), 'admin'),
('ws-0005', 'Shared Workspace25', 'polaris', 'SHARED', '', NULL, false, 1.0, NOW(), 'admin',  NOW(), 'admin');

INSERT INTO workspace_member(id, member_id, member_type, member_role, ws_id) VALUES
(500011, 'polaris', 'USER', 'WORKSPACE_EDITOR', 'ws-0001'),
(500012, 'metatron', 'USER', 'WORKSPACE_VIEWER', 'ws-0001'),
(500021, 'polaris', 'USER', 'WORKSPACE_ADMIN', 'ws-0002'),
(500031, 'polaris', 'USER', 'WORKSPACE_EDITOR', 'ws-0003'),
(500041, 'polaris', 'USER', 'WORKSPACE_VIEWER', 'ws-0004'),
(500051, 'polaris', 'USER', 'WORKSPACE_VIEWER', 'ws-0005');

COMMIT;