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
import org.codehaus.jackson.annotate.JsonProperty;
import org.codehaus.jackson.annotate.JsonTypeName;

import java.io.Serializable;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
      if (name.equals(dataSource.getName())) {
        return Optional.of(dataSource);
      }
    }
    return Optional.empty();
  }

  public List<DataSource> getDataSources() {
    return dataSources;
  }

  public List<Association> getAssociations() {
    return associations;
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
