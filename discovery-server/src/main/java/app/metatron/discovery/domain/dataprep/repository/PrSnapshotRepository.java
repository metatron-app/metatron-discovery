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

package app.metatron.discovery.domain.dataprep.repository;

import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshotProjections;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(path = "preparationsnapshots", itemResourceRel = "preparationsnapshot" , collectionResourceRel = "preparationsnapshots",
        excerptProjection = PrSnapshotProjections.DefaultProjection.class)
public interface PrSnapshotRepository extends JpaRepository<PrSnapshot, String> {

    /*
    @RestResource(path = "query")
    @Query("select ss from PrSnapshot ss where ss.ssId= :q")  // fake!!
    Page<PrSnapshot> searchByQuery(@Param("q") String query, Pageable pageable);
    */

    Page<PrSnapshot> findBySsNameContaining(@Param("ssName") String ssName, Pageable pageable);
    Page<PrSnapshot> findBySsNameContainingAndSsTypeIn(@Param("ssName") String ssName, @Param("ssTypes") List<PrSnapshot.SS_TYPE> ssTypeList, Pageable pageable);
    Page<PrSnapshot> findBySsNameContainingAndStatusIn(@Param("ssName") String ssName, @Param("statuses") List<PrSnapshot.STATUS> statusList, Pageable pageable);
    Page<PrSnapshot> findBySsNameContainingAndStatusInAndSsTypeIn(@Param("ssName") String ssName, @Param("statuses") List<PrSnapshot.STATUS> statusList, @Param("ssTypes") List<PrSnapshot.SS_TYPE> ssTypes, Pageable pageable);

}
