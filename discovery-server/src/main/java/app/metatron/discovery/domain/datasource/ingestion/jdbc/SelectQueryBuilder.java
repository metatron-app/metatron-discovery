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

import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.format.UnixTimeFormat;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.util.TimeUnits;

import static app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo.DataType.TABLE;

/**
 * Build "SELECT" SQL for datasource ingestion
 */
public class SelectQueryBuilder {

  public static final String TEMP_TABLE_NAME = "TTB";

  private JdbcConnectInformation connectInformation;
  private JdbcDialect jdbcDialect;

  private String projection;

  private String query;

  private String limit;

  private boolean countMode;

  private String incremental;

  public SelectQueryBuilder(JdbcConnectInformation connectInformation, JdbcDialect jdbcDialect) {
    this.connectInformation = connectInformation;
    this.jdbcDialect = jdbcDialect;
  }

  public SelectQueryBuilder incremental(Field field, String lastIncremetalTime) {

    StringBuilder builder = new StringBuilder();
    builder.append("WHERE ");

    if (field.getLogicalType() == LogicalType.TIMESTAMP) {
      String projectionName = getProjectionName(field);

      if(field.getFormatObject() instanceof UnixTimeFormat){
        builder.append(projectionName);
        builder.append(" >= ");
        builder.append(jdbcDialect.getCharToUnixTimeStmt(connectInformation, "'" + lastIncremetalTime + "'"));

        if(((UnixTimeFormat) field.getFormatObject()).getUnit() == TimeUnits.MILLISECOND){
          builder.append(" * 1000 ");
        }
      } else {
        if(field.getType() == DataType.STRING){
          String strToDateStmt = jdbcDialect.getCharToDateStmt(connectInformation, projectionName, field.getTimeFormat());
          builder.append(strToDateStmt).append(" ");
        } else {
          builder.append(projectionName);
          builder.append(" ");
        }

        builder.append(">= ");
        builder.append(jdbcDialect.getCharToDateStmt(connectInformation, "'" + lastIncremetalTime + "'", JdbcDialect.DEFAULT_FORMAT));
        builder.append(" ");
      }
    } else {
      throw new RuntimeException("Invalid timestamp type.");
    }

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
    String fieldName = StringUtils.isEmpty(field.getOriginalName())
        ? field.getName()
        : field.getOriginalName();

    String projectionName = StringUtils.contains(fieldName, ".")
        ? StringUtils.substring(fieldName, StringUtils.lastIndexOf(fieldName, ".") + 1, fieldName.length())
        : fieldName;

    return jdbcDialect.getQuotedFieldName(connectInformation, projectionName);

  }

  public SelectQueryBuilder query(JdbcIngestionInfo ingestionInfo, JdbcConnectInformation connectInformation) {
    if (ingestionInfo.getDataType() == TABLE) {
      StringBuilder selectAllQuery = new StringBuilder();
      selectAllQuery.append("SELECT * FROM ");
      selectAllQuery.append(jdbcDialect.getTableName(connectInformation,
                                                     connectInformation.getCatalog(),
                                                     ingestionInfo.getDatabase(),
                                                     ingestionInfo.getQuery()));
      this.query = selectAllQuery.toString();
    } else {
      this.query = getRefinedQuery(ingestionInfo.getQuery());
    }
    return this;
  }

  public SelectQueryBuilder query(String schema, JdbcIngestionInfo.DataType dataType, String value) {
    if (dataType == JdbcIngestionInfo.DataType.TABLE) {
      StringBuilder selectAllQuery = new StringBuilder();
      selectAllQuery.append("SELECT * FROM ");
      selectAllQuery.append(jdbcDialect.getTableName(connectInformation, connectInformation.getCatalog(), schema, value));
      this.query = selectAllQuery.toString();
    } else {
      this.query = value;
    }

    return this;
  }

  public String getRefinedQuery(String query){
    // split line separator
    String[] queryByLine = StringUtils.split(query, System.lineSeparator());

    List<String> semicolonRemoved = new ArrayList<>();
    int lineCount = queryByLine.length;
    for(int i = 0; i < lineCount; ++i) {
      String newSql = queryByLine[i];

      //find last line with semicolon
      int validSemicolonIdx = getValidIndex(newSql, ";");
      //remove semicolon
      while (validSemicolonIdx >= 0) {
        newSql = StringUtils.replaceFirst(newSql, ";", "");
        validSemicolonIdx = getValidIndex(newSql, ";");
      }
      semicolonRemoved.add(newSql);
    }

    return StringUtils.join(semicolonRemoved, System.lineSeparator());
  }

  public int getValidIndex(String query, String targetStr){
    int targetStrIndex = StringUtils.indexOf(query, targetStr);
    int hyphenIndex = StringUtils.indexOf(query, "--");
    int sharpIndex = StringUtils.indexOf(query, "#");
    int commentIndex = (hyphenIndex >= 0 && sharpIndex >= 0)
        ? Math.min(hyphenIndex, sharpIndex)
        : Math.max(hyphenIndex, sharpIndex);

    //last line
    if(targetStrIndex > -1 && commentIndex > -1 && targetStrIndex < commentIndex){
      return targetStrIndex;
    } else if(targetStrIndex > -1 && commentIndex < 0){
      return targetStrIndex;
    }
    return -1;
  }

  public SelectQueryBuilder limit(int initial, int limit) {

    StringBuilder limitClause = new StringBuilder();

    if (connectInformation.getImplementor().equals("ORACLE")
        || connectInformation.getImplementor().equals("TIBERO")) {
      if (StringUtils.isEmpty(incremental)) {
        limitClause.append("WHERE ");
      } else {
        limitClause.append("AND ");
      }
      limitClause.append("ROWNUM >= ").append(initial)
                 .append(" AND ROWNUM <= ").append(initial + limit);

    } else if (connectInformation.getImplementor().equals("PRESTO")
        || connectInformation.getImplementor().equals("STAGE")
        || connectInformation.getImplementor().equals("HIVE")) {  // limit 만 지원하는 Connection 타입
      limitClause.append("LIMIT ").append(limit);
    } else if (connectInformation.getImplementor().equals("MSSQL")) {
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
    if (StringUtils.isNotEmpty(limit) && connectInformation.getImplementor().equals("MSSQL")) {
      selectQuery.append(limit + " ");
    }
    selectQuery.append(projection);
    selectQuery.append(" FROM ( ");
    selectQuery.append(System.lineSeparator());
    selectQuery.append(query);
    selectQuery.append(System.lineSeparator());
    if (connectInformation.getImplementor().equals("ORACLE")
        || connectInformation.getImplementor().equals("TIBERO")) {
      selectQuery.append(" ) ");
    } else {
      selectQuery.append(" ) AS ").append(TEMP_TABLE_NAME).append(" ");
    }

    if (StringUtils.isNotEmpty(incremental)) {
      selectQuery.append(incremental).append(" ");
    }

    if (StringUtils.isNotEmpty(limit) && !connectInformation.getImplementor().equals("MSSQL")) {
      selectQuery.append(limit);
    }

    return selectQuery.toString();
  }

}
