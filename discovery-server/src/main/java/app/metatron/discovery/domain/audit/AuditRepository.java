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

package app.metatron.discovery.domain.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 1. 26..
 */
@RepositoryRestResource(path = "audits", itemResourceRel = "audit"
        , collectionResourceRel = "audits", excerptProjection = AuditProjections.DefaultProjection.class)
public interface AuditRepository extends JpaRepository<Audit, String>, QueryDslPredicateExecutor<Audit>, AuditRepositoryCustom {

  @Query("select a.jobName, COUNT(a) as cnt " +
          "from Audit a " +
          "where a.status = :status " +
          "and a.type = 'QUERY' " +
          "group by a.jobName ")
  Page<Object[]> countHistoryByQuery(@Param("status") Audit.AuditStatus status, Pageable pageable);

  List<Audit> findByQueryId(@Param("queryId") String queryId);

  Audit findTop1ByApplicationIdAndVcoreSecondsLessThanOrderByVcoreSecondsDesc(String applicationId, Long vcoreSeconds);
}
