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

package app.metatron.discovery.query.druid;


import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import app.metatron.discovery.query.druid.datasource.DataSource;
import app.metatron.discovery.query.druid.queries.*;

@JsonTypeInfo(use=JsonTypeInfo.Id.NAME, include= JsonTypeInfo.As.EXTERNAL_PROPERTY, property="queryType")
@JsonSubTypes({
    @JsonSubTypes.Type(value = TimeseriesQuery.class, name = "timeseries"),
    @JsonSubTypes.Type(value = JoinQuery.class, name = "join"),
    @JsonSubTypes.Type(value = GroupByQuery.class, name = "groupBy"),
    @JsonSubTypes.Type(value = GroupByMetaQuery.class, name = "groupBy.meta"),
    @JsonSubTypes.Type(value = SearchQuery.class, name = "search"),
    @JsonSubTypes.Type(value = DataSourceMetadataQuery.class, name = "dataSourceMetadata"),
    @JsonSubTypes.Type(value = SegmentMetaDataQuery.class, name = "segmentMetadata"),
    @JsonSubTypes.Type(value = SelectQuery.class, name = "select"),
    @JsonSubTypes.Type(value = SelectStreamQuery.class, name = "select.stream"),
    @JsonSubTypes.Type(value = SelectMetaQuery.class, name = "selectMeta"),
    @JsonSubTypes.Type(value = SummaryQuery.class, name = "summary"),
    @JsonSubTypes.Type(value = CovarianceQuery.class, name = "covariance"),
    @JsonSubTypes.Type(value = TimeBoundaryQuery.class, name = "timeBoundary"),
    @JsonSubTypes.Type(value = TopNQuery.class, name = "topN"),
    @JsonSubTypes.Type(value = PartitionRegexQuery.class, name = "partitioned"),
    @JsonSubTypes.Type(value = UnionAllQuery.class, name = "unionAll"),
    @JsonSubTypes.Type(value = SketchQuery.class, name = "sketch"),
    @JsonSubTypes.Type(value = GeoBoundaryFilterQuery.class, name = "geo.boundary"),
    @JsonSubTypes.Type(value = ChoroplethMapQuery.class, name = "choropleth")
})
public abstract class Query {

  public static final String RESERVED_WORD_COUNT = "count";

  public static final String POSTFIX_INNER_FIELD = ".inner";

  public static final String POSTFIX_SORT_FIELD = ".sort";

  DataSource dataSource;

  public Query() {
  }

  public Query(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  public DataSource getDataSource() {
    return dataSource;
  }

  public void setDataSource(DataSource dataSource) {
    this.dataSource = dataSource;
  }
}
