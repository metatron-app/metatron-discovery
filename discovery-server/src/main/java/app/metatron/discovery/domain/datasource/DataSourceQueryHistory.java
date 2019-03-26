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

package app.metatron.discovery.domain.datasource;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.datasource.data.CandidateQueryRequest;
import app.metatron.discovery.domain.datasource.data.CovarianceQueryRequest;
import app.metatron.discovery.domain.datasource.data.MetaQueryRequest;
import app.metatron.discovery.domain.datasource.data.QueryRequest;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.datasource.data.SummaryQueryRequest;
import app.metatron.discovery.domain.datasource.data.forward.ResultForward;

import static app.metatron.discovery.domain.datasource.DataSourceQueryHistory.QueryType.CANDIDATE;
import static app.metatron.discovery.domain.datasource.DataSourceQueryHistory.QueryType.COVARIANCE;
import static app.metatron.discovery.domain.datasource.DataSourceQueryHistory.QueryType.META;
import static app.metatron.discovery.domain.datasource.DataSourceQueryHistory.QueryType.SEARCH;
import static app.metatron.discovery.domain.datasource.DataSourceQueryHistory.QueryType.SIMILARITY;
import static app.metatron.discovery.domain.datasource.DataSourceQueryHistory.QueryType.SUMMARY;

/**
 * Created by kyungtaak on 2016. 8. 30..
 */
@Entity
@Table(name = "datasource_query")
public class DataSourceQueryHistory extends AbstractHistoryEntity implements MetatronDomain<String>  {

  /**
   *  ID
   */
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  String id;

  /**
   *  Metatron 질의 스펙
   */
  @Column(name = "query")
  @Lob
  String query;

  /**
   *  질의 대상 DataSource Id
   */
  @Column(name = "query_ds_id")
  String dataSourceId;

  /**
   *  질의 대상 연결 타입
   */
  @Column(name = "query_connection_type")
  DataSource.ConnectionType connType;

  /**
   *  Metatron 질의 타입
   */
  @Column(name = "query_type")
  @Enumerated(EnumType.STRING)
  QueryType queryType;

  /**
   * 엔진 질의 스펙
   */
  @Column(name = "query_engine")
  @Lob
  String engineQuery;

  /**
   * 엔진 질의 ID
   */
  @Column(name = "query_engine_id")
  String engineQueryId;

  /**
   * 엔진 질의 타입
   */
  @Column(name = "query_engine_type")
  @Enumerated(EnumType.STRING)
  EngineQueryType engineQueryType;

  /**
   * 엔진 결과 처리 타입
   */
  @Column(name = "query_engine_forward")
  @Enumerated(EnumType.STRING)
  ResultForward.ForwardType forwardType;

  /**
   * 질의 성공 여부
   */
  @Column(name = "query_succeed")
  Boolean succeed;

  /**
   * 질의 실패시 메시지 표시
   */
  @Column(name = "query_message")
  @Size(max = 5000)
  String message;

  /**
   * 질의 결과 카운트
   */
  @Column(name = "query_result_count")
  Long resultCount;

  /**
   * 질의 결과 Size
   */
  @Column(name = "query_result_size")
  Long resultSize;

  /**
   * 전체 질의 소요시간
   */
  @Column(name = "query_elapsed_time")
  Long elapsedTime;

  /**
   * 엔진 질의 시간
   */
  @Column(name = "query_engine_elapsed_time")
  Long engineElapsedTime;

  @Column(name = "query_from_uri", length = 65535, columnDefinition = "TEXT")
  String fromUri;

  @Column(name = "query_from_dashboard_id")
  String fromDashBoardId;

  @Column(name = "query_from_widget_id")
  String fromWidgetId;

  public DataSourceQueryHistory() {
  }

  public void initRequest(QueryRequest request) {

    if (request.getDataSource() != null) {
      DataSource dataSource = request.getDataSource().getMetaDataSource();
      if (dataSource != null) {
        dataSourceId = dataSource.getId();
        connType = dataSource.getConnType();
      }
    }

    query = GlobalObjectMapper.writeValueAsString(request);

    if (request instanceof SearchQueryRequest) {
      queryType = SEARCH;
      SearchQueryRequest searchQueryRequest = (SearchQueryRequest) request;
      if (searchQueryRequest.getResultForward() != null) {
        forwardType = searchQueryRequest.getResultForward().getForwardType();
      }
    } else if (request instanceof CandidateQueryRequest) {
      queryType = CANDIDATE;
    } else if (request instanceof SummaryQueryRequest) {
      queryType = SUMMARY;
    } else if (request instanceof CovarianceQueryRequest) {
      queryType = COVARIANCE;
    } else if (request instanceof MetaQueryRequest) {
      queryType = META;
    } else if (request instanceof SimilarityQueryRequest) {
      queryType = SIMILARITY;
    }

    this.fromUri = request.getContextValue(QueryRequest.CONTEXT_ROUTE_URI);
    this.fromDashBoardId = request.getContextValue(QueryRequest.CONTEXT_DASHBOARD_ID);
    this.fromWidgetId = request.getContextValue(QueryRequest.CONTEXT_WIDGET_ID);
  }

  public DataSourceQueryHistory(String dataSourceId) {
    this.dataSourceId = dataSourceId;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getDataSourceId() {
    return dataSourceId;
  }

  public void setDataSourceId(String dataSourceId) {
    this.dataSourceId = dataSourceId;
  }

  public DataSource.ConnectionType getConnType() {
    return connType;
  }

  public void setConnType(DataSource.ConnectionType connType) {
    this.connType = connType;
  }

  public String getQuery() {
    return query;
  }

  public void setQuery(String query) {
    this.query = query;
  }

  public String getEngineQueryId() {
    return engineQueryId;
  }

  public void setEngineQueryId(String engineQueryId) {
    this.engineQueryId = engineQueryId;
  }

  public QueryType getQueryType() {
    return queryType;
  }

  public void setQueryType(QueryType queryType) {
    this.queryType = queryType;
  }

  public String getEngineQuery() {
    return engineQuery;
  }

  public void setEngineQuery(String engineQuery) {
    this.engineQuery = engineQuery;
  }

  public EngineQueryType getEngineQueryType() {
    return engineQueryType;
  }

  public void setEngineQueryType(EngineQueryType engineQueryType) {
    this.engineQueryType = engineQueryType;
  }

  public ResultForward.ForwardType getForwardType() {
    return forwardType;
  }

  public void setForwardType(ResultForward.ForwardType forwardType) {
    this.forwardType = forwardType;
  }

  public Boolean getSucceed() {
    return succeed;
  }

  public void setSucceed(Boolean succeed) {
    this.succeed = succeed;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public Long getResultCount() {
    return resultCount;
  }

  public void setResultCount(Long resultCount) {
    this.resultCount = resultCount;
  }

  public Long getResultSize() {
    return resultSize;
  }

  public void setResultSize(Long resultSize) {
    this.resultSize = resultSize;
  }

  public Long getElapsedTime() {
    return elapsedTime;
  }

  public void setElapsedTime(Long elapsedTime) {
    this.elapsedTime = elapsedTime;
  }

  public Long getEngineElapsedTime() {
    return engineElapsedTime;
  }

  public void setEngineElapsedTime(Long engineElapsedTime) {
    this.engineElapsedTime = engineElapsedTime;
  }

  public String getFromUri() {
    return fromUri;
  }

  public void setFromUri(String fromUri) {
    this.fromUri = fromUri;
  }

  public String getFromDashBoardId() {
    return fromDashBoardId;
  }

  public void setFromDashBoardId(String fromDashBoardId) {
    this.fromDashBoardId = fromDashBoardId;
  }

  public String getFromWidgetId() {
    return fromWidgetId;
  }

  public void setFromWidgetId(String fromWidgetId) {
    this.fromWidgetId = fromWidgetId;
  }

  @Override
  public String toString() {
    return "DataSourceQueryHistory{" +
        "id='" + id + '\'' +
        ", dataSourceId='" + dataSourceId + '\'' +
        ", connType=" + connType +
        ", queryType=" + queryType +
        ", engineQueryType=" + engineQueryType +
        ", forwardType=" + forwardType +
        ", succeed=" + succeed +
        ", message='" + message + '\'' +
        ", resultCount=" + resultCount +
        ", resultSize=" + resultSize +
        ", elapsedTime=" + elapsedTime +
        ", fromUri='" + fromUri + '\'' +
        ", fromDashBoardId='" + fromDashBoardId + '\'' +
        ", fromWidgetId='" + fromWidgetId + '\'' +
        "} ";
  }

  public enum QueryType {
    CANDIDATE, META, SEARCH, SUMMARY, COVARIANCE, SIMILARITY
  }

  public enum EngineQueryType {
    TOPN, TIMEBOUNDARY, SEARCH, SELECT, SEGMENTMETA, SELECTMETA, GROUPBY, GROUPBYMETA, SUMMARY, COVARIANCE, SIMILARITY
  }
}
