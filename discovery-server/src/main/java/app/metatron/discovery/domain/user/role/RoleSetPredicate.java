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
import org.joda.time.DateTime;

public class RoleSetPredicate {

  /**
   * RoleSet 정보 조회 조건
   *
   * @param nameContains
   * @param searchDateBy
   * @param from
   * @param to
   * @return
   */
  public static Predicate searchRoleSetList(RoleSet.RoleSetScope scope, String nameContains,
                                            String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QRoleSet roleSet = QRoleSet.roleSet;

    if(scope != null) {
      builder.and(roleSet.scope.eq(scope));
    }

    if(from != null && to != null) {
      if(StringUtils.isNotEmpty(searchDateBy) && "CREATED".equalsIgnoreCase(searchDateBy)) {
        builder.and(roleSet.createdTime.between(from, to));
      } else {
        builder.and(roleSet.modifiedTime.between(from, to));
      }
    }

    if(StringUtils.isNotEmpty(nameContains)) {
      builder.and(roleSet.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }

  /**
   * RoleSet 명 중복 조회 조건
   *
   * @param name
   * @return
   */
  public static Predicate searchDuplicatedName(String name, boolean like) {

    BooleanBuilder builder = new BooleanBuilder();
    QRoleSet roleSet = QRoleSet.roleSet;

    if(like) {
      builder.and(roleSet.name.startsWith(name));
    } else {
      builder.and(roleSet.name.eq(name));
    }

    return builder;
  }

}
