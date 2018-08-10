/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.role;

import org.apache.commons.lang3.builder.ToStringStyle;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.annotation.Rollback;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;

import app.metatron.discovery.config.MainApplicationConfig;
import app.metatron.discovery.domain.user.role.PermissionRepository;
import app.metatron.discovery.domain.user.role.Role;
import app.metatron.discovery.domain.user.role.RoleRepository;

import static org.apache.commons.lang3.builder.ToStringBuilder.reflectionToString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

/**
 * Created by kyungtaak on 2016. 1. 7..
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {MainApplicationConfig.class})
@Transactional
@Rollback
public class RoleRepositoryTest {

  @Inject
  RoleRepository roleRepository;

  @Inject
  PermissionRepository permissionRepository;

  @Test
  public void test_basic_crud() {

    // 1. Creat Role
    Role role = new Role();
    role.setName("test-role");

    Role createdRole = roleRepository.saveAndFlush(role);

    assertNotNull(role.getId());
    assertEquals(role.getName(), createdRole.getName());
    // System.out.println(reflectionToString(createdWorkSpace, ToStringStyle.MULTI_LINE_STYLE));

    // 2. Update Role
    createdRole.setName("update-role");
    Role updateRole = roleRepository.saveAndFlush(createdRole);
    assertEquals(createdRole.getName(), updateRole.getName());
    // System.out.println(reflectionToString(updateWorkSpace, ToStringStyle.MULTI_LINE_STYLE));

    // 3. Find Role
    Role findRole = roleRepository.findOne(updateRole.getId());
    assertEquals(updateRole.getName(), findRole.getName());
    System.out.println(reflectionToString(findRole, ToStringStyle.MULTI_LINE_STYLE));

    // 4. Delete Role
    roleRepository.delete(findRole.getId());

    assertNull(roleRepository.findOne(findRole.getId()));

  }

//  @Test
//  public void test_role_perm_crud() {
//
//    Role role1 = roleRepository.save(new Role("ROLE_1"));
//    Role role2 = roleRepository.save(new Role("ROLE_2"));
//
//    Permission perm1 = permissionRepository.save(new Permission("PERM_1"));
//    Permission perm2 = permissionRepository.save(new Permission("PERM_2"));
//    Permission perm3 = permissionRepository.save(new Permission("PERM_3"));
//
//    role1.addPermission(perm1);
//    role1.addPermission(perm2);
//
//    role2.addPermission(perm1);
//    role2.addPermission(perm3);
//
//    Role role1_perm1_perm2 = roleRepository.save(role1);
//    Role role2_perm1_perm3 = roleRepository.save(role2);
//
//    System.out.println("Result 1 :: \n" + ToStringBuilder.reflectionToString(role1_perm1_perm2, ToStringStyle.MULTI_LINE_STYLE));
//    System.out.println("Result 2 :: \n" + ToStringBuilder.reflectionToString(role2_perm1_perm3, ToStringStyle.MULTI_LINE_STYLE));
//    System.out.println("Result 3 :: \n" + ToStringBuilder.reflectionToString(permissionRepository.getOne(perm1.getId()), ToStringStyle.MULTI_LINE_STYLE));
//
//  }

//  @Test
//  public void test_role_perm_crud() {
//
//  @Test
//    public void test_update_role_permission() {
//      //
//    }

}
