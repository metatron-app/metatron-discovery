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

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;
import org.springframework.data.rest.core.event.AfterCreateEvent;
import org.springframework.data.rest.core.event.BeforeCreateEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import app.metatron.discovery.domain.datasource.DataSource;

@Component
@Transactional
public class MetadataService implements ApplicationEventPublisherAware {

  private static Logger LOGGER = LoggerFactory.getLogger(MetadataService.class);

  @Autowired
  private MetadataRepository metadataRepository;

  private ApplicationEventPublisher publisher;

  @Override
  public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
    this.publisher = applicationEventPublisher;
  }

  /**
   * find metadata from datasource identifier
   */
  @Transactional(readOnly = true)
  public Optional<Metadata> findByDataSource(String dataSourceId) {
    List<Metadata> results = metadataRepository.findBySource(dataSourceId, null, null);
    if (CollectionUtils.isEmpty(results)) {
      return Optional.empty();
    }

    return Optional.of(results.get(0));
  }

  /**
   * Save using datasource information
   */
  public void saveFromDataSource(DataSource dataSource) {
    // make metadata from datasource
    Metadata metadata = new Metadata(dataSource);

    metadataRepository.saveAndFlush(metadata);

    LOGGER.info("Successfully saved metadata({}) from datasource({})", metadata.getId(), dataSource.getId());
  }

  /**
   * Update from updated datasource
   */
  public void updateFromDataSource(DataSource dataSource, boolean includeFields) {

    Optional<Metadata> metadata = findByDataSource(dataSource.getId());
    if (!metadata.isPresent()) {
      return;
    }

    Metadata updateMetadata = metadata.get();
    updateMetadata.updateFromDataSource(dataSource, includeFields);

    metadataRepository.save(updateMetadata);
  }

  /**
   * Delete metadata
   */
  public void delete(String... metadataIds) {

    int deleteCnt = 0;
    for (String metadataId : metadataIds) {
      Metadata deletingMetadata = metadataRepository.findOne(metadataId);
      if (deletingMetadata == null) {
        continue;
      }
      metadataRepository.delete(metadataId);
      deleteCnt++;
    }

    LOGGER.info("Successfully delete {} metadata items", deleteCnt);
  }

  @Transactional
  public List<Metadata> createAndReturn(List<Metadata> metadataList){
    List<Metadata> returnBody = new ArrayList<>();
    for(Metadata metadata : metadataList){
      //trigger event
      publisher.publishEvent(new BeforeCreateEvent(metadata));
      Metadata savedObject = metadataRepository.save(metadata);
      publisher.publishEvent(new AfterCreateEvent(savedObject));
      returnBody.add(savedObject);
    }
    return returnBody;
  }
}
