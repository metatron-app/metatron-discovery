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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.data.projection.ColumnDescription;
import app.metatron.discovery.common.data.projection.ColumnHistogram;
import app.metatron.discovery.common.data.projection.DataGrid;
import app.metatron.discovery.common.data.projection.DataHistogram;
import app.metatron.discovery.common.data.projection.Row;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataColumn;

/**
 * The type Metadata data preview.
 */
public abstract class MetadataDataPreview implements DataGrid, DataHistogram {

  private static Logger LOGGER = LoggerFactory.getLogger(MetadataDataPreview.class);

  /**
   * The Column names.
   */
  //Columns
  List<String> columnNames = Lists.newArrayList();
  /**
   * The Column descriptions.
   */
  List<ColumnDescription> columnDescriptions = Lists.newArrayList();
  /**
   * The Column index.
   */
  Map<String, Integer> columnIndex = Maps.newLinkedHashMap();

  /**
   * The Rows.
   */
  //Rows
  List<Row> rows = Lists.newArrayList();

  /**
   * The Histograms.
   */
  //Histograms
  List<ColumnHistogram> histograms = Lists.newArrayList();

  /**
   * The Limit.
   */
  Integer limit;

  /**
   * The Metadata.
   */
  @JsonIgnore
  Metadata metadata;

  @Override
  public Integer getColumnCount() {
    return columnNames.size();
  }

  @Override
  public List<String> getColumnNames() {
    return columnNames;
  }

  @Override
  public List<ColumnDescription> getColumnDescriptions() {
    return columnDescriptions;
  }

  @Override
  public Map<String, Integer> getColumnIndex() {
    return columnIndex;
  }

  @Override
  public List<Row> getRows() {
    return rows;
  }

  @Override
  public Integer getRowCount() {
    return rows.size();
  }

  @Override
  public List<ColumnHistogram> getHistograms() {
    return histograms;
  }

  /**
   * Instantiates a new Metadata data preview.
   *
   * @param metadata the metadata
   */
  public MetadataDataPreview(Metadata metadata){
    this.metadata = metadata;
  }

  /**
   * Gets limit.
   *
   * @return the limit
   */
  public Integer getLimit() {
    return limit;
  }

  /**
   * Sets limit.
   *
   * @param limit the limit
   */
  public void setLimit(Integer limit) {
    this.limit = limit;
  }

  /**
   * Get data.
   */
  public void getData(){
    generateColumns(metadata);
    getDataGrid(metadata);
  }

  /**
   * Generate columns.
   *
   * @param metadata the metadata
   */
  protected void generateColumns(Metadata metadata){
    for(MetadataColumn metadataColumn : metadata.getColumns()){
      columnNames.add(metadataColumn.getPhysicalName());

      ColumnDescription columnDescription = new ColumnDescription(metadataColumn.getPhysicalName(),
                                                                  metadataColumn.getPhysicalType(),
                                                                  metadataColumn.getName(),
                                                                  metadataColumn.getType().toString(),
                                                                  GlobalObjectMapper.readValue(metadataColumn.getFormat()),
                                                                  metadataColumn.getAdditionalContextMap());
      columnDescriptions.add(columnDescription);

      columnIndex.put(metadataColumn.getPhysicalName(), metadata.getColumns().indexOf(metadataColumn));
    }
  }

  /**
   * Gets data grid.
   *
   * @param metadata the metadata
   */
  abstract protected void getDataGrid(Metadata metadata);
}
