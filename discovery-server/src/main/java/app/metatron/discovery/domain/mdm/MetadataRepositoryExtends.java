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

package app.metatron.discovery.domain.mdm;

import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MetadataRepositoryExtends {

  Page<Metadata> searchMetadatas(List<Metadata.SourceType> sourceType, String catalogId, String tag, String nameContains,
                                 String searchDateBy, DateTime from, DateTime to, Pageable pageable);

  Page<Metadata> searchMetadatas(String keyword, List<Metadata.SourceType> sourceType, String catalogId, String tag,
                                 String nameContains, String descContains, List<String> userIds,
                                 String searchDateBy, DateTime from, DateTime to, Pageable pageable);

  List<Metadata> findBySource(String sourceId, String schema, List<String> table);

  List<Metadata> findBySource(List<String> sourceIds);

  List<Metadata> findByName(String name);

  List<Metadata> findById(String id);

  List<MetadataStatsDto> countBySourceType();

  List<DataCreatorDTO> findDistinctCreatorByName(String nameContains);
}
