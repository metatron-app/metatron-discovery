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

package app.metatron.discovery.domain.user.role;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import org.apache.commons.lang3.StringUtils;

import app.metatron.discovery.domain.user.DirectoryProfile;

public class RoleDirectoryPredicate {

  /**
   * Role을 지정한 Directory(user/group) 정보
   */
  public static Predicate searchRoleDirectoryList(Role role, DirectoryProfile.Type type,
                                                  String nameContains) {

    BooleanBuilder builder = new BooleanBuilder();
    QRoleDirectory roleDirectory = QRoleDirectory.roleDirectory;

    if(role != null) {
      builder.and(roleDirectory.role.eq(role));
    }

    if(type != null) {
      builder.and(roleDirectory.type.eq(type));
    }

    if (StringUtils.isNotEmpty(nameContains)) {
      builder.and(roleDirectory.directoryName.containsIgnoreCase(nameContains));
    }

    return builder;
  }

  public static Predicate searchUserSystemRoleList(String username) {

    BooleanBuilder builder = new BooleanBuilder();
    QRole role = QRole.role;

    builder.and(role.scope.eq(Role.RoleScope.GLOBAL));

    return builder;
  }

  /**
   * RoleSet 명 중복 조회 조건
   */
  public static Predicate searchDuplicatedName(String name) {

    BooleanBuilder builder = new BooleanBuilder();
    QRole role = QRole.role;

    builder = builder.and(role.name.eq(name));

    return builder;
  }

  /**
   * 워크스페이스 Role이 존재하고, 지정된 RoleSet에 포함이 되는 조건
   */
  public static Predicate searchWorkspaceRoleInRoleSet(String roleName, RoleSet roleSet) {
    BooleanBuilder builder = new BooleanBuilder();
    QRole role = QRole.role;

    builder.and(role.scope.eq(Role.RoleScope.WORKSPACE))
           .and(role.name.eq(roleName))
           .and(role.roleSet.eq(roleSet));

    return builder;
  }

}
