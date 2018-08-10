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

package app.metatron.discovery.domain.workbench;

import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;

/**
 * Created by h on 2016. 10. 31..
 */
@RepositoryRestResource(path = "queryhistories", itemResourceRel = "queryhistory"
        , collectionResourceRel = "queryhistories", excerptProjection = QueryHistoryProjections.DefaultProjection.class)
public interface QueryHistoryRepository extends JpaRepository<QueryHistory, Long>,
        QueryDslPredicateExecutor<QueryHistory> {

  @Override
  @RestResource(exported = false)
  <S extends QueryHistory> List<S> save(Iterable<S> iterable);

 @Override
  @RestResource(exported = false)
  <S extends QueryHistory> S saveAndFlush(S s);

  @Override
  @RestResource(exported = false)
  <S extends QueryHistory> S save(S s);

  @Override
  @RestResource(exported = false)
  void deleteInBatch(Iterable<QueryHistory> iterable);

  @Override
  @RestResource(exported = false)
  void delete(Long s);

  @Override
  @RestResource(exported = false)
  void delete(QueryHistory queryHistory);

  @Override
  @RestResource(exported = false)
  void delete(Iterable<? extends QueryHistory> iterable);

  @Override
  @RestResource(exported = false)
  void deleteAll();

  @Override
  @RestResource(exported = false)
  void deleteAllInBatch();


  @Query("select year(h.queryStartTime), month(h.queryStartTime), day(h.queryStartTime), " +
          " COUNT(CASE WHEN(h.queryResultStatus = 'SUCCESS') THEN 1 ELSE NULL END), " +
          " COUNT(CASE WHEN(h.queryResultStatus = 'FAIL') THEN 1 ELSE NULL END) " +
          "from QueryHistory h " +
          "where h.queryStartTime > :criteriaTime " +
          "group by year(h.queryStartTime), month(h.queryStartTime), day(h.queryStartTime) " +
          "order by year(h.queryStartTime), month(h.queryStartTime), day(h.queryStartTime) ASC ")
  List<Object[]> countStatusByDate(@Param("criteriaTime") DateTime criteriaTime);

  @Query("select h.createdBy, count(*) " +
          "from QueryHistory h " +
          "where h.queryStartTime > :criteriaTime " +
          "group by h.createdBy " +
          "order by h.createdBy ASC ")
  List<Object[]> countHistoryByUser(@Param("criteriaTime") DateTime criteriaTime);

  @Query("select " +
          " count(CASE WHEN h.queryTimeTaken < 1000*60 THEN 1 END), " +
          " count(CASE WHEN h.queryTimeTaken > 1000*60 AND h.queryTimeTaken < 1000*60*5 THEN 1 END), " +
          " count(CASE WHEN h.queryTimeTaken > 1000*60*5 THEN 1 END) " +
          "from QueryHistory h " +
          "where h.queryStartTime > :criteriaTime ")
  List<Object[]> countHistoryByElaspedTime(@Param("criteriaTime") DateTime criteriaTime);

 @Query("select h.query, COUNT(h) as cnt " +
         "from QueryHistory h " +
         "where h.queryResultStatus = :queryStatus " +
         "group by h.query ")
 Page<Object[]> countHistoryByQuery(@Param("queryStatus") QueryResult.QueryResultStatus queryStatus, Pageable pageable);
}
