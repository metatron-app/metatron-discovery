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

package app.metatron.discovery.domain.user.group;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

public class GroupPredicate {

  /**
   * 그룹 정보 조회 조건
   *
   * @param nameContains
   * @param searchDateBy
   * @param from
   * @param to
   * @return
   */
  public static Predicate searchGroupList(String nameContains, String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QGroup group = QGroup.group;

    if(from != null && to != null) {
      if(StringUtils.isNotEmpty(searchDateBy) && "CREATED".equalsIgnoreCase(searchDateBy)) {
        builder.and(group.createdTime.between(from, to));
      } else {
        builder.and(group.modifiedTime.between(from, to));
      }
    }

    if(StringUtils.isNotEmpty(nameContains)) {
      builder.and(group.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }

  /**
   * Group 명 중복 조회 조건
   *
   * @param name
   * @return
   */
  public static Predicate searchDuplicatedName(String name) {

    BooleanBuilder builder = new BooleanBuilder();
    QGroup group = QGroup.group;

    builder = builder.and(group.name.eq(name));

    return builder;
  }

  /**
   * 특정 사용자가 포함된 Group 조회
   *
   * @param username
   * @return
   */
  public static Predicate searchGroupByMemberId(String username) {

    BooleanBuilder builder = new BooleanBuilder();
    QGroup group = QGroup.group;

    builder = builder.and(group.members.any().memberId.eq(username));

    return builder;
  }

}
