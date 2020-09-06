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

package app.metatron.discovery.domain.workbook.configurations.datasource;

import com.google.common.base.Preconditions;

import org.codehaus.jackson.annotate.JsonCreator;
import org.codehaus.jackson.annotate.JsonIgnore;
import org.codehaus.jackson.annotate.JsonProperty;
import org.codehaus.jackson.annotate.JsonTypeName;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import app.metatron.discovery.domain.datasource.data.QueryRequest;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.workbook.configurations.analysis.Analysis;
import app.metatron.discovery.domain.workbook.configurations.analysis.GeoSpatialAnalysis;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.GeoShelf;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.MapViewLayer;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.Shelf;

/**
 *
 */
@JsonTypeName("multi")
public class MultiDataSource extends DataSource {

  /**
   * list of datasource
   */
  List<DataSource> dataSources;

  /**
   * association with datasources
   */
  List<Association> associations;

  @JsonIgnore
  DataSource mainDataSource;

  public MultiDataSource() {
  }

  @JsonCreator
  public MultiDataSource(@JsonProperty("dataSources") List<DataSource> dataSources,
                         @JsonProperty("associations") List<Association> associations) {
    this.dataSources = dataSources;
    this.associations = associations;
  }

  /**
   * find datasource by name (in multiple datasource)
   */
  public Optional<DataSource> getDatasourceByName(String name) {
    Preconditions.checkNotNull(name, "Name of datasource is required.");

    for (DataSource dataSource : dataSources) {
      String dataSourceName = dataSource.getName();

      if (name.equals(dataSourceName) || (
              dataSource.getConnType() == app.metatron.discovery.domain.datasource.DataSource.ConnectionType.LINK &&
                      dataSource.getName().startsWith(name + "_"))
      ) {
          return Optional.of(dataSource);
      }
    }

    return Optional.empty();
  }

  /**
   * Elect main datasource from search request
   */
  public void electMainDataSource(QueryRequest queryRequest) {

    if (queryRequest instanceof SearchQueryRequest) {
      SearchQueryRequest searchQueryRequest = (SearchQueryRequest) queryRequest;
      Shelf shelf = searchQueryRequest.getShelf();
      Analysis analysis = searchQueryRequest.getAnalysis();

      if (shelf instanceof GeoShelf) {
        GeoShelf geoShelf = (GeoShelf) shelf;
        MapViewLayer mainLayer;
        if (analysis instanceof GeoSpatialAnalysis) {
          String mainLayerName = ((GeoSpatialAnalysis) analysis).getMainLayer();
          mainLayer = geoShelf.getLayerByName(mainLayerName)
                              .orElseThrow(() -> new IllegalArgumentException("layer({}) in shelf not found"));
        } else {
          mainLayer = geoShelf.getLayers().get(0);
        }
        mainDataSource = this.getDatasourceByName(mainLayer.getRef())
                             .orElseThrow(() -> new IllegalArgumentException("'ref' value in layer doesn't include multi-datasource"));
      } else {
        mainDataSource = this.getDataSources().get(0);
      }
    } else {
      mainDataSource = this.getDataSources().get(0);
    }
  }

  /**
   * Elect main datasource from map view layer
   */
  public void electMainDataSource(MapViewLayer layer) {
    this.mainDataSource = getDatasourceByName(layer.getRef())
        .orElseThrow(() -> new IllegalArgumentException("Invalid datasource name in layer"));
  }

  public app.metatron.discovery.domain.datasource.DataSource getMetaDataSource() {
    if (mainDataSource == null) {
      return dataSources.get(0).getMetaDataSource();
    }
    return mainDataSource.getMetaDataSource();
  }

  public List<DataSource> getDataSources() {
    return dataSources;
  }

  public List<Association> getAssociations() {
    return associations;
  }

  public DataSource getMainDataSource() {
    return mainDataSource;
  }

  @Override
  public String toString() {
    return "MultiDataSource{" +
        "dataSources=" + dataSources +
        ", associations=" + associations +
        '}';
  }

  public static class Association implements Serializable {

    /**
     * source datasource name
     */
    String source;

    /**
     * target datasource name
     */
    String target;

    /**
     * column pair for association ("column name of source datasource" : "column name of target datasource")
     */
    Map<String, String> columnPair;

    public Association() {
    }

    @JsonCreator
    public Association(@JsonProperty("source") String source,
                       @JsonProperty("target") String target,
                       @JsonProperty("keyColumns") Map<String, String> columnPair) {
      this.source = source;
      this.target = target;
      this.columnPair = columnPair;
    }

    public String getSource() {
      return source;
    }

    public String getTarget() {
      return target;
    }

    public Map<String, String> getColumnPair() {
      return columnPair;
    }

    @Override
    public String toString() {
      return "Association{" +
          "source='" + source + '\'' +
          ", target='" + target + '\'' +
          ", columnPair=" + columnPair +
          '}';
    }
  }
}
