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

import org.joda.time.DateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.activities.spec.ActivityType;
import app.metatron.discovery.domain.activities.spec.Actor;

/**
 *
 */
@RepositoryRestResource(path = "activities", itemResourceRel = "activity"
    , collectionResourceRel = "activities", excerptProjection = ActivityStreamProjections.DefaultProjection.class)
public interface ActivityStreamRepository extends JpaRepository<ActivityStream, Long>,
                                          QueryDslPredicateExecutor<ActivityStream>, ActivityStreamRepositoryExtends {


//  List<Object> findWorkspaceViewStat(String workspaceId, TimeFieldFormat.TimeUnit timeUnit, DateTime from, DateTime to);

  @Query("SELECT MAX(activityStream.id) AS ID, COUNT(activityStream.actor) AS CNT " +
      "FROM ActivityStream activityStream " +
      "WHERE activityStream.objectId IN (:objectIdList) " +
      "AND activityStream.action IN (:actionList) " +
      "AND activityStream.actorType = :actorType " +
      "AND activityStream.publishedTime BETWEEN :from AND :to " +
      "GROUP BY activityStream.actor " +
      "ORDER BY CNT DESC")
  List<Map<String, Object>> getActivityCountByUser(@Param("objectIdList") List<String> objectIdList,
                                                   @Param("actionList") List<ActivityType> actionList,
                                                   @Param("actorType") Actor.ActorType actorType,
                                                   @Param("from") DateTime from, @Param("to") DateTime to);
}
