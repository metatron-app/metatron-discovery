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

package app.metatron.discovery.domain.user;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import java.util.List;

import static app.metatron.discovery.domain.user.User.Status.ACTIVATED;
import static app.metatron.discovery.domain.user.User.Status.DELETED;
import static app.metatron.discovery.domain.user.User.Status.EXPIRED;
import static app.metatron.discovery.domain.user.User.Status.LOCKED;
import static app.metatron.discovery.domain.user.User.Status.REJECTED;
import static app.metatron.discovery.domain.user.User.Status.REQUESTED;

public class UserPredicate {

  public static Predicate searchList(String level, Boolean active, List<User.Status> status,
                                     String nameContains,
                                     String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QUser user = QUser.user;

    // status 가 active 파라미터와 동시에 쓰였을 경우 status 가 우선순위가 있음
    if(CollectionUtils.isEmpty(status)) {
      // 사용자 목록 기본 목록은 DELETED, EXPIRED, REJECTED, REQUESTED 상태는 제외하고
      // ACTIVATED, LOCKED 상태만 조회 가능
      if (active == null) {
        builder = builder.and(user.status.notIn(DELETED, EXPIRED, REJECTED, REQUESTED));
      } else {
        builder = active ? builder.and(user.status.eq(ACTIVATED)) : builder.and(user.status.eq(LOCKED));
      }
    } else {
      builder = builder.and(user.status.in(status));
    }

    if(from != null && to != null) {
      if(StringUtils.isNotEmpty(searchDateBy) && "CREATED".equalsIgnoreCase(searchDateBy)) {
        builder = builder.and(user.createdTime.between(from, to));
      } else {
        builder = builder.and(user.modifiedTime.between(from, to));
      }
    }

    if(StringUtils.isNotEmpty(nameContains)) {
      builder = builder.andAnyOf(user.username.containsIgnoreCase(nameContains),
                                 //user.email.containsIgnoreCase(nameContains),
                                 user.fullName.containsIgnoreCase(nameContains));
    }

    return builder;
  }
}
