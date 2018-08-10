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

package app.metatron.discovery.domain.dataprep;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

@RepositoryRestResource(path = "preparationsnapshots", itemResourceRel = "preparationsnapshot" , collectionResourceRel = "preparationsnapshots",
        excerptProjection = PrepSnapshotProjections.DefaultProjection.class)
public interface PrepSnapshotRepository extends JpaRepository<PrepSnapshot, String> {

    @RestResource(path = "query")
    @Query("select ss from PrepSnapshot ss where ss.ssId= :q")  // fake!!
    Page<PrepSnapshot> searchByQuery(@Param("q") String query, Pageable pageable);

    Page<PrepSnapshot> findBySsNameContaining(@Param("ssName") String ssName, Pageable pageable);
}
