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

package app.metatron.discovery.domain.mdm.source;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.Set;

import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataProjections;

/**
 * Created by kyungtaak on 2016. 8. 30..
 */
@RepositoryRestResource(exported = false, itemResourceRel = "metasource", collectionResourceRel = "metasources",
    excerptProjection = MetadataProjections.DefaultProjection.class)
public interface MetadataSourceRepository extends JpaRepository<MetadataSource, String>,
    QueryDslPredicateExecutor<MetadataSource> {

  Set<MetadataSource> findMetadataSourcesByTypeAndSchema(Metadata.SourceType type, String schema);

  Set<MetadataSource> findMetadataSourcesByTypeAndSchemaAndSourceId(Metadata.SourceType type, String schema, String sourceId);
}
