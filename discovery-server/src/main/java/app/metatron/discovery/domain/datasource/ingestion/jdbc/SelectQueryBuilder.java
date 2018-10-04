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

package app.metatron.discovery.domain.datasource.ingestion.jdbc;

import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.StringJoiner;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.MssqlConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.OracleConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.PrestoConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.StageDataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.TiberoConnection;

import static app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo.DataType.TABLE;

/**
 * Build "SELECT" SQL for datasource ingestion
 */
public class SelectQueryBuilder {

  public static final String TEMP_TABLE_NAME = "TTB";

  private JdbcDataConnection jdbcDataConnection;

  private String projection;

  private String query;

  private String limit;

  private boolean countMode;

  private String incremental;

  public SelectQueryBuilder(JdbcDataConnection jdbcDataConnection) {
    this.jdbcDataConnection = jdbcDataConnection;
  }

  public SelectQueryBuilder incremental(Field field, String lastIncremetalTime) {

    StringBuilder builder = new StringBuilder();
    builder.append("WHERE ");
    if(field.getLogicalType() == LogicalType.STRING) {
      // 어떻게 할지 확인할것!
      // Text 일경우 구현이 괭장히 어려움
    } if(field.getLogicalType() == LogicalType.TIMESTAMP) {
      if(jdbcDataConnection instanceof HiveConnection) {
        builder.append("unix_timestamp(").append(field.getName()).append(", '").append(field.getFormat()).append("')");
      } else {
        builder.append(field.getName()).append(" ");
      }
    } else {
      throw new RuntimeException("Invalid timestamp type.");
    }

    builder.append(">= ");
    builder.append(jdbcDataConnection.getCharToDateStmt(lastIncremetalTime, JdbcDataConnection.DEFAULT_FORMAT));
    builder.append(" ");

    incremental = builder.toString();

    return this;
  }

  public SelectQueryBuilder allProjection() {
    this.projection = "*";

    return this;
  }

  /**
   * Count 구문 선택, Limit 관련 구문은 무시됨
   *
   * @return this
   */
  public SelectQueryBuilder countProjection() {
    this.projection = "count(*)";
    this.countMode = true;
    return this;
  }

  public SelectQueryBuilder projection(List<Field> fields) {

    StringJoiner projections = new StringJoiner(",");

    for (Field field : fields) {
      projections.add(getProjectionName(field));
    }

    this.projection = projections.toString();

    return this;
  }

  private String getProjectionName(Field field) {

    // 기존 컬럼외 추가로 지정한 TIME
    if ("current_datetime".equals(field.getName()) && field.getRole() == Field.FieldRole.TIMESTAMP) {
      return jdbcDataConnection.getCurrentTimeStamp();
    }

    return jdbcDataConnection.getQuotatedFieldName(
        StringUtils.isEmpty(field.getOriginalName()) ? field.getName() : field.getOriginalName());

  }

  public SelectQueryBuilder query(JdbcIngestionInfo ingestionInfo) {

    if (ingestionInfo.getDataType() == TABLE) {
      StringBuilder selectAllQuery = new StringBuilder();
      selectAllQuery.append("SELECT * FROM ");
      selectAllQuery.append(jdbcDataConnection.getTableName(ingestionInfo.getDatabase(), ingestionInfo.getQuery()));
      this.query = selectAllQuery.toString();
    } else {
      this.query = ingestionInfo.getQuery();
    }


    return this;
  }

  public SelectQueryBuilder query(String schema, JdbcIngestionInfo.DataType dataType, String value) {

    if (dataType == JdbcIngestionInfo.DataType.TABLE) {
      StringBuilder selectAllQuery = new StringBuilder();
      selectAllQuery.append("SELECT * FROM ");
      selectAllQuery.append(jdbcDataConnection.getTableName(schema, value));
      this.query = selectAllQuery.toString();
    } else {
      this.query = value;
    }

    return this;
  }

  public SelectQueryBuilder limit(int initial, int limit) {

    StringBuilder limitClause = new StringBuilder();

    if (jdbcDataConnection instanceof OracleConnection || jdbcDataConnection instanceof TiberoConnection) {
      if(StringUtils.isEmpty(incremental)) {
        limitClause.append("WHERE ");
      } else {
        limitClause.append("AND ");
      }
      limitClause.append("ROWNUM >= ").append(initial)
              .append(" AND ROWNUM <= ").append(initial + limit);
    } else if (jdbcDataConnection instanceof PrestoConnection
            || jdbcDataConnection instanceof StageDataConnection
            || jdbcDataConnection instanceof HiveConnection) {  // limit 만 지원하는 Connection 타입
      limitClause.append("LIMIT ").append(limit);
    } else if (jdbcDataConnection instanceof MssqlConnection) {
      limitClause.append("TOP " + limit);
    } else {
      limitClause.append("LIMIT ").append(limit).append(" OFFSET ").append(initial);
    }

    this.limit = limitClause.toString();

    return this;
  }

  public String build() {

    StringBuilder selectQuery = new StringBuilder();
    selectQuery.append("SELECT ");
    if (StringUtils.isNotEmpty(limit) && jdbcDataConnection instanceof MssqlConnection) {
      selectQuery.append(limit + " ");
    }
    selectQuery.append(projection);
    selectQuery.append(" FROM ( ");
    selectQuery.append(query);
    if (this.jdbcDataConnection instanceof OracleConnection || this.jdbcDataConnection instanceof TiberoConnection) {
      selectQuery.append(" ) ");
    } else {
      selectQuery.append(" ) AS ").append(TEMP_TABLE_NAME).append(" ");
    }

    if(StringUtils.isNotEmpty(incremental)) {
      selectQuery.append(incremental).append(" ");
    }

    if (StringUtils.isNotEmpty(limit) && !(jdbcDataConnection instanceof MssqlConnection)) {
      selectQuery.append(limit);
    }

    return selectQuery.toString();
  }

}
