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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.connection.DataConnectionRepository;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataController;
import app.metatron.discovery.domain.workbook.DashboardRepository;

@Component
@Transactional(readOnly = true)
public class MetaSourceService {

  private static Logger LOGGER = LoggerFactory.getLogger(MetadataController.class);

  @Autowired
  MetadataSourceRepository metadataSourceRepository;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  DataConnectionRepository dataConnectionRepository;

  @Autowired
  DashboardRepository dashboardRepository;

  public List<MetadataSource> findMetadataSourcesBySourceId(String type, String sourceId) {
    return null;
  }

  /**
   * Get Metadata source by source id
   *
   * @param type
   * @param sourceId
   * @return
   */
  public Object getSourcesBySourceId(Metadata.SourceType type, String sourceId) {

    switch (type) {
      case ENGINE:
        return dataSourceRepository.findOne(sourceId);
      case JDBC:
        return dataConnectionRepository.findOne(sourceId);
    }

    return null;
  }
}
