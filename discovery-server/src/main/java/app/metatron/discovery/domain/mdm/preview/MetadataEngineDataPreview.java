/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.mdm.preview;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;

import app.metatron.discovery.common.data.projection.ColumnDescription;
import app.metatron.discovery.common.data.projection.Row;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.datasource.data.result.ObjectResultFormat;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;

/**
 * The type Metadata engine data preview.
 */
public class MetadataEngineDataPreview extends MetadataDataPreview {
  private static Logger LOGGER = LoggerFactory.getLogger(MetadataEngineDataPreview.class);

  /**
   * The Search query request.
   */
  @JsonIgnore
  SearchQueryRequest searchQueryRequest;

  /**
   * The Engine query service.
   */
  @JsonIgnore
  EngineQueryService engineQueryService;

  /**
   * The Engine data source.
   */
  @JsonIgnore
  DataSource engineDataSource;

  /**
   * Instantiates a new Metadata engine data preview.
   *
   * @param metadata the metadata
   */
  public MetadataEngineDataPreview(Metadata metadata) {
    super(metadata);
  }

  /**
   * Sets search query request.
   *
   * @param searchQueryRequest the search query request
   */
  public void setSearchQueryRequest(SearchQueryRequest searchQueryRequest) {
    this.searchQueryRequest = searchQueryRequest;
  }

  /**
   * Sets engine query service.
   *
   * @param engineQueryService the engine query service
   */
  public void setEngineQueryService(EngineQueryService engineQueryService) {
    this.engineQueryService = engineQueryService;
  }

  /**
   * Sets engine data source.
   *
   * @param engineDataSource the engine data source
   */
  public void setEngineDataSource(DataSource engineDataSource) {
    this.engineDataSource = engineDataSource;
  }

  @Override
  protected void getDataGrid(Metadata metadata){
    if (searchQueryRequest == null) {
      searchQueryRequest = new SearchQueryRequest();
    }

    DefaultDataSource defaultDataSource = new DefaultDataSource(engineDataSource.getEngineName());
    defaultDataSource.setMetaDataSource(engineDataSource);

    if (searchQueryRequest.getResultFormat() == null) {
      ObjectResultFormat resultFormat = new ObjectResultFormat();
      resultFormat.setRequest(searchQueryRequest);
      searchQueryRequest.setResultFormat(resultFormat);
    }
    searchQueryRequest.setDataSource(defaultDataSource);

    if (CollectionUtils.isEmpty(searchQueryRequest.getProjections())) {
      searchQueryRequest.setProjections(new ArrayList<>());
    }

    // max 1,000,000
    if (limit > 1000000) {
      limit = 1000000;
    }
    searchQueryRequest.setLimits(new Limit(limit));
    ArrayNode engineData = (ArrayNode) engineQueryService.search(searchQueryRequest);


    engineData.forEach(rowNode -> {
      Row row = new Row();
      for(ColumnDescription columnDescription : this.columnDescriptions){
        String columnName = columnDescription.getName();
        Object columnValue = null;

        JsonNode valueNode = rowNode.get(columnName);
        if(valueNode.isNull()){
          row.values.add(null);
          continue;
        }

        switch(columnDescription.getType().toUpperCase()){
          case "LONG" :
            columnValue = valueNode.asLong();
            break;
          case "BOOLEAN" :
            columnValue = valueNode.asBoolean();
            break;
          case "DOUBLE" :
            columnValue = valueNode.asDouble();
            break;
          default :
            columnValue = valueNode.asText();
            break;
        }
        row.values.add(columnValue);
      }
      this.rows.add(row);
    });
  }
}
