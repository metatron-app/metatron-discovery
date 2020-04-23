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

package app.metatron.discovery.domain.activities;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import java.util.List;

import app.metatron.discovery.domain.activities.spec.ActivityType;
import app.metatron.discovery.domain.activities.spec.Actor;

/**
 *
 */
public class ActivityStreamPredicate {

  public static Predicate searchList(String actor, List<ActivityType> actions,
                                     String nameContains, String clientContains,
                                     DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QActivityStream activityStream = QActivityStream.activityStream;

    if(StringUtils.isNotEmpty(actor)) {
      builder.and(activityStream.actor.eq(actor));
    }

    if(!CollectionUtils.isEmpty(actions)) {
      builder = builder.and(activityStream.action.in(actions));
    }

    if(StringUtils.isNotEmpty(nameContains)) {
      builder = builder.and(activityStream.actor.containsIgnoreCase(nameContains));
    }

    if(StringUtils.isNotEmpty(clientContains)) {
      builder = builder.and(activityStream.objectId.containsIgnoreCase(clientContains));
    }

    if(from != null && to != null) {
      builder = builder.and(activityStream.publishedTime.between(from, to));
    }

    return builder;
  }
}
