/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

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

package app.metatron.discovery.domain.datasource.connection.jdbc;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.DateValue;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import net.sf.jsqlparser.expression.StringValue;
import net.sf.jsqlparser.expression.operators.conditional.AndExpression;
import net.sf.jsqlparser.expression.operators.relational.Between;
import net.sf.jsqlparser.expression.operators.relational.EqualsTo;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.schema.Column;
import net.sf.jsqlparser.schema.Table;
import net.sf.jsqlparser.statement.select.Limit;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.statement.select.SelectExpressionItem;
import net.sf.jsqlparser.statement.select.SelectItem;
import net.sf.jsqlparser.util.SelectUtils;
import net.sf.jsqlparser.util.cnfexpression.MultiAndExpression;
import net.sf.jsqlparser.util.cnfexpression.MultiOrExpression;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.stereotype.Component;
import org.supercsv.prefs.CsvPreference;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.common.exception.FunctionWithException;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.domain.dataconnection.query.NativeCriteria;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeBetweenExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeCurrentDatetimeExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeDateFormatExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeDisjunctionExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeEqExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeOrderExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeProjection;
import app.metatron.discovery.domain.dataconnection.query.utils.VarGenerator;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.data.CandidateQueryRequest;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.BatchIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.LinkIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.SelectQueryBuilder;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.IntervalFilter;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

/**
 *
 */
@Component
public class JdbcConnectionService {

  private static final Logger LOGGER = LoggerFactory.getLogger(JdbcConnectionService.class);

  private static final String RESULTSET_COLUMN_PREFIX = SelectQueryBuilder.TEMP_TABLE_NAME + ".";
  private static final String ANONYMOUS_COLUMN_PREFIX = "anonymous";

  @Autowired
  EngineProperties engineProperties;

  /**
   * Check JDBC connection.
   */
  public Map<String, Object> checkConnection(JdbcConnectInformation connectInformation) {
    return DataConnectionHelper.getAccessor(connectInformation).checkConnection();
  }

  /**
   * Find list of JDBC database from connection
   */
  public Map<String, Object> getDatabases(JdbcConnectInformation connectInformation, String databaseNamePattern, Pageable pageable) {
    return getDatabases(connectInformation, null, databaseNamePattern, pageable);
  }

  public Map<String, Object> getDatabases(JdbcConnectInformation connectInformation,
                                          Connection connection,
                                          String databaseNamePattern,
                                          Pageable pageable) {
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(connectInformation);
    jdbcDataAccessor.setConnection(connection);
    return jdbcDataAccessor.getDatabases(connectInformation.getCatalog(), databaseNamePattern,
                                         pageable == null ? null : pageable.getPageSize(),
                                         pageable == null ? null : pageable.getPageNumber());
  }

  public void changeDatabase(JdbcConnectInformation connectInformation, String databaseName) {
    changeDatabase(connectInformation, databaseName, null);
  }

  public void changeDatabase(JdbcConnectInformation connectInformation, String databaseName, Connection connection) {
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(connectInformation);
    jdbcDataAccessor.setConnection(connection);
    jdbcDataAccessor.useDatabase(connectInformation.getCatalog(), databaseName);
  }

  /**
   * Find list of table names from database
   */
  public Map<String, Object> getTables(JdbcConnectInformation connectInformation, String databaseName,
                                       Pageable pageable) {
    return getTables(connectInformation, databaseName, null, null, pageable);
  }

  /**
   * Find list of table names from database
   */
  public Map<String, Object> getTables(JdbcConnectInformation connectInformation, String databaseName,
                                       String tableNamePattern, Pageable pageable) {
    return getTables(connectInformation, databaseName, tableNamePattern, null, pageable);
  }

  /**
   * Find list of table names from database
   */
  public Map<String, Object> getTables(JdbcConnectInformation connectInformation, String databaseName,
                                       String tableName, Connection connection, Pageable pageable) {
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(connectInformation);
    jdbcDataAccessor.setConnection(connection);
    Map<String, Object> searchedTableMap = jdbcDataAccessor.getTables(connectInformation.getCatalog(), databaseName, tableName,
                                                                      pageable == null ? null : pageable.getPageSize(),
                                                                      pageable == null ? null : pageable.getPageNumber());
    return searchedTableMap;
  }

  /**
   * Find list of table names from database
   */
  public Map<String, Object> getTableNames(JdbcConnectInformation connectInformation, String databaseName,
                                           Pageable pageable) {
    return getTableNames(connectInformation, databaseName, null, null, pageable);
  }

  /**
   * Find list of table names from database
   */
  public Map<String, Object> getTableNames(JdbcConnectInformation connectInformation, String databaseName,
                                           String tableNamePattern, Pageable pageable) {
    return getTableNames(connectInformation, databaseName, tableNamePattern, null, pageable);
  }

  /**
   * Find list of table names from database
   */
  public Map<String, Object> getTableNames(JdbcConnectInformation connectInformation, String databaseName,
                                           String tableName, Connection connection, Pageable pageable) {
    Map<String, Object> searchedTableMap = getTables(connectInformation, databaseName, tableName, connection, pageable);
    List<Map<String, Object>> tableMapList = (List<Map<String, Object>>) searchedTableMap.get("tables");
    List<String> tableNameList = tableMapList.stream()
                                             .map(tableMap -> (String) tableMap.get("name"))
                                             .collect(Collectors.toList());
    searchedTableMap.put("tables", tableNameList);
    return searchedTableMap;
  }

  public Map<String, Object> getTableColumns(JdbcConnectInformation connectInformation, String schema,
                                                String tableName, String columnNamePattern, Pageable pageable) {
    return getTableColumns(connectInformation, null, schema, tableName, columnNamePattern, pageable);
  }

  public Map<String, Object> getTableColumns(JdbcConnectInformation connectInformation, Connection connection, String schema,
                                                String tableName, String columnNamePattern, Pageable pageable) {
    Map<String, Object> columnMap = new LinkedHashMap<>();
    List<Map<String, Object>> columnNames  = getTableColumnNames(connectInformation, connection, schema, tableName,
                                                                         columnNamePattern, pageable);

    //Just dummy paging information
    Map<String, Integer> pageInfoMap = new HashMap<>();
    pageInfoMap.put("size", columnNames.size());
    pageInfoMap.put("totalElements", columnNames.size());
    pageInfoMap.put("totalPages", (int) Math.ceil((double) columnNames.size() / (double) columnNames.size()));
    pageInfoMap.put("number", 0);

    columnMap.put("columns", columnNames);
    columnMap.put("page", pageInfoMap);
    return columnMap;
  }

  public List<Map<String, Object>> getTableColumnNames(JdbcConnectInformation connectInformation, Connection connection, String schema,
                                                String tableName, String columnNamePattern, Pageable pageable) {
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(connectInformation);
    jdbcDataAccessor.setConnection(connection);
    return jdbcDataAccessor.getColumns(connectInformation.getCatalog(), schema, tableName, columnNamePattern);
  }

  /**
   * Show table description map.
   *
   * @param connectInformation the connectInformation
   * @param schema     the schema
   * @param tableName  the table name
   * @return the map
   */
  public Map<String, Object> showTableDescription(JdbcConnectInformation connectInformation, String schema, String tableName) {
    return showTableDescription(connectInformation, null, schema, tableName);
  }

  public Map<String, Object> showTableDescription(JdbcConnectInformation connectInformation,
                                                  Connection connection,
                                                  String schema, String tableName) {
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(connectInformation);
    jdbcDataAccessor.setConnection(connection);
    return jdbcDataAccessor.showTableDescription(connectInformation.getCatalog(), schema, tableName);
  }

  public int executeUpdate(JdbcConnectInformation connectInformation, String query) {
    return executeUpdate(connectInformation, null, query);
  }

  public int executeUpdate(JdbcConnectInformation connectInformation, Connection connection, String query) {
    LOGGER.debug("executeUpdate : {} ", query);
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(connectInformation);
    jdbcDataAccessor.setConnection(connection);
    try{
      return jdbcDataAccessor.executeUpdate(jdbcDataAccessor.getConnection(), query);
    } catch (SQLException e){
      LOGGER.error("Fail to executeUpdate query : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to executeUpdate query : " + e.getMessage());
    }
  }


  public JdbcQueryResultResponse selectQuery(JdbcConnectInformation connectInformation, Connection conn, String query) {
    return selectQuery(connectInformation, conn, query, -1, false);
  }

  public JdbcQueryResultResponse selectQuery(JdbcConnectInformation connectInformation, Connection conn, String query,
                                             int limit, boolean extractColumnName) {

    JdbcDialect dialect = DataConnectionHelper.lookupDialect(connectInformation);
    // int totalRows = countOfSelectQuery(connection, ingestion);
    JdbcQueryResultResponse queryResultSet = null;

    LOGGER.debug("selectQuery : {} ", query);

    Statement stmt = null;
    ResultSet rs = null;
    try {
      stmt = conn.createStatement();

      if (limit > 0)
        stmt.setMaxRows(limit);

      rs = stmt.executeQuery(query);

      queryResultSet = getJdbcQueryResult(rs, dialect, extractColumnName);
      // queryResultSet.setTotalRows(totalRows);
    } catch (SQLException e) {
      LOGGER.error("Fail to query for select : SQLState({}), ErrorCode({}), Message : {}"
          , e.getSQLState(), e.getErrorCode(), e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.PREVIEW_TABLE_SQL_ERROR,
                                            "Fail to query : " + e.getSQLState() + ", " + e.getErrorCode() + ", " + e.getMessage());
    } catch (Exception e) {
      LOGGER.error("Fail to query for select :  {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to query : " + e.getMessage());
    } finally {
      closeConnection(conn, stmt, rs);
    }

    return queryResultSet;
  }

  public JdbcQueryResultResponse selectQueryForIngestion(JdbcConnectInformation connectInformation,
                                                         String schema,
                                                         JdbcIngestionInfo.DataType type,
                                                         String query,
                                                         List<Map<String, Object>> partitionList,
                                                         int limit,
                                                         boolean extractColumnName) {
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(connectInformation);
    Connection conn = jdbcDataAccessor.getConnection(schema, true);
    JdbcDialect dialect = DataConnectionHelper.lookupDialect(connectInformation);

    JdbcQueryResultResponse queryResultSet = null;
    String queryString;
    if (type == JdbcIngestionInfo.DataType.TABLE) {
      NativeCriteria nativeCriteria = new NativeCriteria(connectInformation.getImplementor());
      String tableName = dialect.getTableName(connectInformation, connectInformation.getCatalog(), schema, query);
      String tableAlias = dialect.getTableName(connectInformation, connectInformation.getCatalog(), "", query);
      nativeCriteria.addTable(tableName, tableAlias);

      //add projection for partition
      if (partitionList != null && !partitionList.isEmpty()) {

        for (Map<String, Object> partitionMap : partitionList) {
          for (String keyStr : partitionMap.keySet()) {
            nativeCriteria.add(new NativeEqExp(keyStr, partitionMap.get(keyStr)));
          }
        }
      }

      queryString = nativeCriteria.toSQL();
    } else {
      queryString = query;
    }

    LOGGER.debug("selectQueryForIngestion SQL : {} ", queryString);
    return selectQuery(connectInformation, conn, queryString, limit, extractColumnName);
  }

  public JdbcQueryResultResponse selectQueryForIngestion(JdbcConnectInformation connectInformation,
                                                         String schema,
                                                         JdbcIngestionInfo.DataType type,
                                                         String query,
                                                         int limit,
                                                         boolean extractColumnName) {
    return selectQueryForIngestion(connectInformation, schema, type, query, null, limit, extractColumnName);
  }

  public List<String> selectQueryToCsv(JdbcConnectInformation connectInformation,
                                       JdbcIngestionInfo ingestionInfo,
                                       String dataSourceName,
                                       List<Field> fields) {
    return selectQueryToCsv(connectInformation, ingestionInfo, dataSourceName, fields, null);
  }

  public List<String> selectQueryToCsv(JdbcConnectInformation connectInformation,
                                       JdbcIngestionInfo ingestionInfo,
                                       String dataSourceName,
                                       List<Field> fields, Integer limit) {
    return selectQueryToCsvWithoutFilter(connectInformation, ingestionInfo, null, dataSourceName, fields, limit);
  }

  public List<String> selectQueryToCsv(JdbcConnectInformation connectInformation,
                                       JdbcIngestionInfo ingestionInfo,
                                       String baseDir,
                                       String dataSourceName,
                                       List<Field> fields,
                                       List<Filter> filters,
                                       Integer limit) {

    int fetchSize = ingestionInfo.getFetchSize();
    int maxLimit = limit == null ? ingestionInfo.getMaxLimit() : limit;

    // Get JDBC Connection and set database
    JdbcConnectInformation realConnection = connectInformation == null ? ingestionInfo.getConnection() : connectInformation;
    Preconditions.checkNotNull(realConnection, "connection info. required.");

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(realConnection);
    JdbcDialect jdbcDialect = jdbcDataAccessor.getDialect();
    Connection connection = jdbcDataAccessor.getConnection();

    List<String> tempCsvFiles = Lists.newArrayList();

    String queryString;

    NativeCriteria nativeCriteria = new NativeCriteria(realConnection.getImplementor());
    if (ingestionInfo.getDataType() == JdbcIngestionInfo.DataType.TABLE) {
      String database = ingestionInfo.getDatabase();
      String table = ingestionInfo.getQuery();
      String tableName = jdbcDialect.getTableName(realConnection, realConnection.getCatalog(), database, table);
      String tableAlias = jdbcDialect.getTableName(realConnection, realConnection.getCatalog(), null, table);
      nativeCriteria.addTable(tableName, tableAlias);
    } else {
      nativeCriteria.addSubQuery(StringUtils.replaceAll(ingestionInfo.getQuery(), ";", ""));
    }

    if (fields != null && !fields.isEmpty()) {
      NativeProjection nativeProjection = new NativeProjection();

      for (Field field : fields) {
        if (field.isNotPhysicalField()) {
          continue;
        }
        String fieldAlias = field.getLogicalName();
        String fieldName;
        if (StringUtils.contains(fieldAlias, ".")) {
          String[] splicedFieldAlias = StringUtils.split(fieldAlias, ".");
          fieldName = splicedFieldAlias[splicedFieldAlias.length - 1];
        } else {
          fieldName = fieldAlias;
        }

        if (Field.COLUMN_NAME_CURRENT_DATETIME.equals(field.getName()) && field.getRole() == Field.FieldRole.TIMESTAMP) {
          nativeProjection.addProjection(new NativeCurrentDatetimeExp(fieldName));
        } else if (StringUtils.isEmpty(field.getTimeFormat()) &&
            (field.getRole() == Field.FieldRole.TIMESTAMP ||
                (field.getRole() == Field.FieldRole.DIMENSION && field.getType() == DataType.TIMESTAMP))) {
          nativeProjection.addProjection(new NativeDateFormatExp(fieldName, null));
          field.setFormat(NativeDateFormatExp.COMMON_DEFAULT_DATEFORMAT);
        } else {
          nativeProjection.addProjection(fieldName, fieldName);
        }
      }

      nativeCriteria.setProjection(nativeProjection);
    }

    if (filters != null && !filters.isEmpty()) {
      for (Filter filter : filters) {
        //Inclusion Filter
        if (filter instanceof InclusionFilter) {
          List<String> valueList = ((InclusionFilter) filter).getValueList();
          if (valueList != null) {
            NativeDisjunctionExp disjunctionExp = new NativeDisjunctionExp();
            for (String value : valueList) {
              disjunctionExp.add(new NativeEqExp(filter.getColumn(), value));
            }
            nativeCriteria.add(disjunctionExp);
          }

          // Interval Filter
        } else if (filter instanceof IntervalFilter) {
          IntervalFilter.SelectorType selectorType = ((IntervalFilter) filter).getSelector();

          //최신 유형일 경우
          if (selectorType == IntervalFilter.SelectorType.RELATIVE) {
            DateTime startDateTime = ((IntervalFilter) filter).getRelativeStartDate();
            DateTime endDateTime = ((IntervalFilter) filter).utcFakeNow();
            nativeCriteria.add(new NativeBetweenExp(filter.getColumn(), startDateTime, endDateTime));
            //기간 지정일 경우
          } else if (selectorType == IntervalFilter.SelectorType.RANGE) {
            List<String> intervals = ((IntervalFilter) filter).getEngineIntervals();
            if (intervals != null && !intervals.isEmpty()) {
              NativeDisjunctionExp disjunctionExp = new NativeDisjunctionExp();
              for (String interval : intervals) {
                DateTime startDateTime = new DateTime(interval.split("/")[0]);
                DateTime endDateTime = new DateTime(interval.split("/")[1]);
                disjunctionExp.add(new NativeBetweenExp(filter.getColumn(), startDateTime, endDateTime));
              }
              nativeCriteria.add(disjunctionExp);
            }
          }
        }
      }
    }

    if (limit != null) {
      nativeCriteria.setLimit(maxLimit);
    }

    queryString = nativeCriteria.toSQL();

    LOGGER.info("Generated SQL Query: {}", queryString);

    // 쿼리 결과 저장
    String tempFileName = getTempFileName(baseDir, EngineProperties.TEMP_CSV_PREFIX + "_"
            + dataSourceName + "_" + System.currentTimeMillis());
    JdbcCSVWriter jdbcCSVWriter = null;
    try {
      jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(tempFileName), CsvPreference.STANDARD_PREFERENCE);
      jdbcCSVWriter.setConnection(connection);
      jdbcCSVWriter.setQuery(queryString);
      jdbcCSVWriter.setFileName(tempFileName);
      jdbcCSVWriter.setFetchSize(fetchSize);
      jdbcCSVWriter.setWithHeader(false);
    } catch (IOException e) {
    }

    String resultFileName = jdbcCSVWriter.write();

    // 결과 셋이 없는 경우 처리
    File file = new File(resultFileName);
    if (!file.exists() && file.length() == 0) {
      return null;
    }

    LOGGER.debug("Created result file : {} ", resultFileName);

    tempCsvFiles.add(tempFileName);

    return tempCsvFiles;

  }

  public List<String> selectQueryToCsvWithoutFilter(JdbcConnectInformation connectInformation,
                                       JdbcIngestionInfo ingestionInfo,
                                       String baseDir,
                                       String dataSourceName,
                                       List<Field> fields,
                                       Integer limit) {

    int fetchSize = ingestionInfo.getFetchSize();
    int maxLimit = limit == null ? ingestionInfo.getMaxLimit() : limit;

    // Get JDBC Connection and set database
    JdbcConnectInformation realConnection = connectInformation == null ? ingestionInfo.getConnection() : connectInformation;
    Preconditions.checkNotNull(realConnection, "connection info. required.");

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(realConnection);
    JdbcDialect jdbcDialect = jdbcDataAccessor.getDialect();
    Connection connection = jdbcDataAccessor.getConnection();

    List<String> tempCsvFiles = Lists.newArrayList();

    String queryString;

    NativeCriteria nativeCriteria = new NativeCriteria(realConnection.getImplementor());
    if (ingestionInfo.getDataType() == JdbcIngestionInfo.DataType.TABLE) {
      String database = ingestionInfo.getDatabase();
      String table = ingestionInfo.getQuery();
      String tableName = jdbcDialect.getTableName(realConnection, realConnection.getCatalog(), database, table);
      String tableAlias = jdbcDialect.getTableName(realConnection, realConnection.getCatalog(), null, table);
      nativeCriteria.addTable(tableName, tableAlias);
      queryString = nativeCriteria.toSQL();
    } else {
      queryString = ingestionInfo.getQuery();
    }

    LOGGER.info("Generated selectQueryToCsvWithoutFilter: {}", queryString);

    // 쿼리 결과 저장
    String tempFileName = getTempFileName(baseDir, EngineProperties.TEMP_CSV_PREFIX + "_"
            + dataSourceName + "_" + System.currentTimeMillis());
    JdbcCSVWriter jdbcCSVWriter = null;
    try {
      jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(tempFileName), CsvPreference.STANDARD_PREFERENCE);
      jdbcCSVWriter.setConnection(connection);
      jdbcCSVWriter.setQuery(queryString);
      jdbcCSVWriter.setFileName(tempFileName);
      jdbcCSVWriter.setFetchSize(fetchSize);
      jdbcCSVWriter.setMaxRow(maxLimit);
      jdbcCSVWriter.setWithHeader(false);
    } catch (IOException e) {
    }

    String resultFileName = jdbcCSVWriter.write();

    // 결과 셋이 없는 경우 처리
    File file = new File(resultFileName);
    if (!file.exists() && file.length() == 0) {
      return null;
    }

    LOGGER.debug("Created result file : {} ", resultFileName);

    tempCsvFiles.add(tempFileName);

    return tempCsvFiles;

  }

  public Select createSelect(JdbcIngestionInfo ingestionInfo) throws JSQLParserException {
    Select select;
    if (ingestionInfo.getDataType() == JdbcIngestionInfo.DataType.TABLE) {
      String database = ingestionInfo.getDatabase();
      String table = ingestionInfo.getQuery();
      String tableName = (!table.contains(".") && database != null) ? database + "." + table : table;
      select = SelectUtils.buildSelectFromTable(new Table(tableName));
    } else {
      net.sf.jsqlparser.statement.Statement parsedStmt = CCJSqlParserUtil.parse(ingestionInfo.getQuery());
      if (!(parsedStmt instanceof Select)) {
        throw new JSQLParserException("query is not select");
      }

      select = (Select) parsedStmt;
    }
    return select;
  }

  public PlainSelect addFields(PlainSelect selectBody, List<Field> fields, DataConnection realConnection) {
    if (CollectionUtils.isNotEmpty(fields)) {
      //change projection
      List<SelectItem> newSelectItems = Lists.newArrayList();
      for (Field field : fields) {
        //
        if (field.isNotPhysicalField()) {
          continue;
        }

        String implementor = realConnection.getImplementor();
        String columnName;
        if (Field.COLUMN_NAME_CURRENT_DATETIME.equals(field.getName()) && field.getRole() == Field.FieldRole.TIMESTAMP) {
          NativeCurrentDatetimeExp nativeCurrentDatetimeExp = new NativeCurrentDatetimeExp(field.getName());
          columnName = nativeCurrentDatetimeExp.toSQL(implementor);
        } else if (StringUtils.isEmpty(field.getTimeFormat()) &&
            (field.getRole() == Field.FieldRole.TIMESTAMP ||
                (field.getRole() == Field.FieldRole.DIMENSION && field.getType() == DataType.TIMESTAMP))) {
          NativeDateFormatExp nativeDateFormatExp = new NativeDateFormatExp(field.getName(), null);
          columnName = nativeDateFormatExp.toSQL(implementor);
          field.setFormat(NativeDateFormatExp.COMMON_DEFAULT_DATEFORMAT);
        } else {
          columnName = NativeProjection.getQuotedColumnName(implementor, field.getName());
        }

        SelectExpressionItem selectExpressionItem = new SelectExpressionItem(new Column(columnName));
        //          selectExpressionItem.setAlias(new Alias(field.getAlias()));
        newSelectItems.add(selectExpressionItem);
      }
      selectBody.setSelectItems(newSelectItems);
    }

    return selectBody;
  }

  public PlainSelect addFilter(PlainSelect selectBody, List<Filter> filters) {
    if (filters != null && !filters.isEmpty()) {
      List<Expression> andExprList = new ArrayList<>();
      for (Filter filter : filters) {
        //Inclusion Filter
        if (filter instanceof InclusionFilter) {
          List<String> valueList = ((InclusionFilter) filter).getValueList();
          if (valueList != null) {
            List<Expression> inclusionExprList = new ArrayList<>();
            for (String value : valueList) {
              EqualsTo equalsTo = new EqualsTo();
              equalsTo.setLeftExpression(new Column(filter.getColumn()));
              equalsTo.setRightExpression(new StringValue(value));
              inclusionExprList.add(equalsTo);
            }
            andExprList.add(new MultiOrExpression(inclusionExprList));
          }

          // Interval Filter
        } else if (filter instanceof IntervalFilter) {
          IntervalFilter.SelectorType selectorType = ((IntervalFilter) filter).getSelector();

          //최신 유형일 경우
          if (selectorType == IntervalFilter.SelectorType.RELATIVE) {
            DateTime startDateTime = ((IntervalFilter) filter).getRelativeStartDate();
            DateTime endDateTime = ((IntervalFilter) filter).utcFakeNow();

            DateValue startDateValue = new DateValue("");
            startDateValue.setValue(new Date(startDateTime.getMillis()));

            DateValue endDateValue = new DateValue("");
            endDateValue.setValue(new Date(endDateTime.getMillis()));

            Between between = new Between();
            between.setLeftExpression(new Column(filter.getColumn()));
            between.setBetweenExpressionStart(startDateValue);
            between.setBetweenExpressionEnd(endDateValue);

            andExprList.add(between);
            //기간 지정일 경우
          } else if (selectorType == IntervalFilter.SelectorType.RANGE) {
            List<String> intervals = ((IntervalFilter) filter).getEngineIntervals();
            if (intervals != null && !intervals.isEmpty()) {
              List<Expression> intervalExprList = new ArrayList<>();
              for (String interval : intervals) {
                DateTime startDateTime = new DateTime(interval.split("/")[0]);
                DateTime endDateTime = new DateTime(interval.split("/")[1]);

                DateValue startDateValue = new DateValue("");
                startDateValue.setValue(new Date(startDateTime.getMillis()));

                DateValue endDateValue = new DateValue("");
                endDateValue.setValue(new Date(endDateTime.getMillis()));

                Between between = new Between();
                between.setLeftExpression(new Column(filter.getColumn()));
                between.setBetweenExpressionStart(startDateValue);
                between.setBetweenExpressionEnd(endDateValue);
                intervalExprList.add(between);
              }
              andExprList.add(new MultiOrExpression(intervalExprList));
            }
          }
        }
      }

      if (selectBody.getWhere() != null) {
        selectBody.setWhere(new AndExpression(selectBody.getWhere(), new MultiAndExpression(andExprList)));
      } else {
        selectBody.setWhere(new MultiAndExpression(andExprList));
      }
    }
    return selectBody;
  }

  public PlainSelect addLimit(PlainSelect selectBody, int maxLimit) {
    Limit limitExpression = new Limit();
    limitExpression.setRowCount(new LongValue(maxLimit));
    selectBody.setLimit(limitExpression);
    return selectBody;
  }

  public List<Map<String, Object>> selectCandidateQuery(CandidateQueryRequest queryRequest) {

    app.metatron.discovery.domain.workbook.configurations.field.Field targetField = queryRequest.getTargetField();

    //필수값 체크 target field
    Preconditions.checkNotNull(targetField, "target field. required.");

    //MetaDataSource
    app.metatron.discovery.domain.datasource.DataSource metaDataSource = queryRequest.getDataSource().getMetaDataSource();
    app.metatron.discovery.domain.datasource.Field metaField = metaDataSource.getMetaFieldMap(false, "")
                                                                             .get(targetField.getName());

    //Jdbc Connection
    DataConnection jdbcDataConnection = metaDataSource.getConnection();

    //Ingestion Info (Link)
    LinkIngestionInfo ingestionInfo = (LinkIngestionInfo) metaDataSource.getIngestionInfo();

    // TODO: 중복 코드를 해결 필요
    DataConnection realConnection = metaDataSource.getJdbcConnectionForIngestion();
    Preconditions.checkNotNull(realConnection, "connection info. required.");

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(realConnection);
    JdbcDialect jdbcDialect = jdbcDataAccessor.getDialect();
    Connection connection = jdbcDataAccessor.getConnection(ingestionInfo.getDatabase(),true);

    NativeCriteria nativeCriteria = new NativeCriteria(jdbcDataConnection.getImplementor());
    NativeProjection nativeProjection = new NativeProjection();

    String targetFieldName = targetField.getName();
    if (StringUtils.contains(targetFieldName, ".")) {
      targetFieldName = StringUtils.split(targetFieldName, ".")[1];
    }

    if (metaField.getLogicalType() == LogicalType.TIMESTAMP) {
      nativeProjection.addAggregateProjection(targetFieldName, "minTime", NativeProjection.AggregateProjection.MIN);
      nativeProjection.addAggregateProjection(targetFieldName, "maxTime", NativeProjection.AggregateProjection.MAX);
      nativeCriteria.setProjection(nativeProjection);
      if (ingestionInfo.getDataType() == JdbcIngestionInfo.DataType.TABLE) {
        String database = ingestionInfo.getDatabase();
        String table = ingestionInfo.getQuery();
        String tableName = jdbcDialect.getTableName(realConnection, realConnection.getCatalog(), database, table);
        String tableAlias = jdbcDialect.getTableName(realConnection, realConnection.getCatalog(), null, table);
        nativeCriteria.addTable(tableName, tableAlias);
      } else {
        nativeCriteria.addSubQuery(ingestionInfo.getQuery());
      }
    } else {
      nativeProjection.addProjection(targetFieldName, "field");
      nativeProjection.addAggregateProjection(targetFieldName, "count", NativeProjection.AggregateProjection.COUNT);
      nativeCriteria.setProjection(nativeProjection);
      if (ingestionInfo.getDataType() == JdbcIngestionInfo.DataType.TABLE) {
        String database = ingestionInfo.getDatabase();
        String table = ingestionInfo.getQuery();
        String tableName = jdbcDialect.getTableName(realConnection, realConnection.getCatalog(), database, table);
        String tableAlias = jdbcDialect.getTableName(realConnection, realConnection.getCatalog(), null, table);
        nativeCriteria.addTable(tableName, tableAlias);
      } else {
        nativeCriteria.addSubQuery(ingestionInfo.getQuery());
      }
      nativeCriteria.setOrder((new NativeOrderExp()).add("count", NativeOrderExp.OrderType.DESC));
    }
    nativeCriteria.setLimit(10000);

    String query = nativeCriteria.toSQL();

    LOGGER.debug("Candidate Query : {} ", query);

    JdbcQueryResultResponse queryResult = selectQuery(jdbcDataConnection, connection, query);
    return queryResult.getData();
  }

  private String getTempFileName(String fileName) {
    return getTempFileName(null, fileName);
  }

  private String getTempFileName(String baseDir, String fileName) {
    if (StringUtils.isEmpty(baseDir)) {
      baseDir = engineProperties.getIngestion().getLocalBaseDir();
    }

    return baseDir + File.separator + fileName + ".csv";
  }

  public List<String> selectIncrementalQueryToCsv(JdbcConnectInformation connectInformation,
                                                  JdbcIngestionInfo ingestionInfo,
                                                  String dataSourceName,
                                                  DateTime maxTime,
                                                  List<Field> fields) {

    Preconditions.checkArgument(ingestionInfo instanceof BatchIngestionInfo,
                                "Required Batch type Jdbc ingestion information.");

    int fetchSize = ingestionInfo.getFetchSize();
    int maxLimit = ingestionInfo.getMaxLimit();

    Field timestampField = fields.stream()
                                 .filter(field -> field.getRole() == Field.FieldRole.TIMESTAMP)
                                 .findFirst().orElseThrow(() -> new RuntimeException("Timestamp field required."));

    BatchIngestionInfo batchIngestionInfo = (BatchIngestionInfo) ingestionInfo;

    // Get JDBC Connection
    JdbcConnectInformation realConnection = connectInformation == null ? ingestionInfo.getConnection() : connectInformation;
    Preconditions.checkNotNull(realConnection, "connection info. required.");

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(realConnection);
    Connection connection = jdbcDataAccessor.getConnection(ingestionInfo.getDatabase(),true);

    // Max time 이 없는 경우 고려
    DateTime incrementalTime = maxTime == null ? new DateTime(0L) : maxTime;

    List<String> tempCsvFiles = Lists.newArrayList();

    // 증분 Query 작성
    String queryString = new SelectQueryBuilder(realConnection, jdbcDataAccessor.getDialect())
        .projection(fields)
        .query(batchIngestionInfo, connectInformation)
        .incremental(timestampField, incrementalTime.toString(JdbcDialect.CURRENT_DATE_FORMAT))
        .limit(0, maxLimit)
        .build();

    LOGGER.debug("Generated incremental query : {} ", queryString);

//    Select select = null;
//    PlainSelect selectBody;
//    try {
//
//      select = createSelect(ingestionInfo);
//      selectBody = (PlainSelect) select.getSelectBody();
//      addFields(selectBody, fields, realConnection);
//
//      if (timestampField.getLogicalType() == LogicalType.TIMESTAMP) {
//        GreaterThanEquals greaterThanEquals = new GreaterThanEquals();
//        if (realConnection instanceof HiveConnection) {
//          greaterThanEquals.setLeftExpression(new Column("unix_timestamp(" + timestampField.getName() + ", '" + timestampField.getTimeFormat() + "')"));
//        } else {
//          greaterThanEquals.setLeftExpression(new Column(timestampField.getName()));
//        }
//        String rightExprStr = realConnection.getCharToDateStmt(incrementalTime.toString(CURRENT_DATE_FORMAT), JdbcDataConnection.DEFAULT_FORMAT);
//        greaterThanEquals.setRightExpression(new Column(rightExprStr));
//
//        if (selectBody.getWhere() != null) {
//          AndExpression andExpression = new AndExpression(selectBody.getWhere(), greaterThanEquals);
//          selectBody.setWhere(andExpression);
//        } else {
//          selectBody.setWhere(greaterThanEquals);
//        }
//      } else {
//        throw new RuntimeException("Invalid timestamp type.");
//      }
//
//      if (maxLimit > 0) {
//        Limit limitExpression = new Limit();
//        limitExpression.setRowCount(new LongValue(maxLimit));
//        selectBody.setLimit(limitExpression);
//      }
//    } catch (JSQLParserException e) {
//      throw new RuntimeException(e.getMessage());
//    }
//
//    String queryString = select.toString();
//
//    LOGGER.debug("Generated incremental query from JPQL : {} ", queryString);

    // 쿼리 결과 저장
    String tempFileName = getTempFileName(dataSourceName + "_" + incrementalTime.toString());
    JdbcCSVWriter jdbcCSVWriter = null;
    try {
      jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(tempFileName), CsvPreference.STANDARD_PREFERENCE);
      jdbcCSVWriter.setConnection(connection);
      jdbcCSVWriter.setQuery(queryString);
      jdbcCSVWriter.setFetchSize(fetchSize);
      jdbcCSVWriter.setFileName(tempFileName);
      jdbcCSVWriter.setWithHeader(false);
    } catch (IOException e) {
    }

    String resultFileName = jdbcCSVWriter.write();

    // 결과 셋이 없는 경우 처리
    File file = new File(resultFileName);
    if (!file.exists() || file.length() == 0) {
      return null;
    }

    LOGGER.debug("Created result file : {} ", resultFileName);

    tempCsvFiles.add(tempFileName);

    return tempCsvFiles;
  }

  public int countOfSelectQuery(JdbcConnectInformation connectInformation, JdbcIngestionInfo jdbcInfo) {
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(connectInformation);
    Connection connection = jdbcDataAccessor.getConnection();
    return countOfSelectQuery(connectInformation, connection, jdbcInfo);
  }

  public int countOfSelectQuery(JdbcConnectInformation connectInformation, Connection conn, JdbcIngestionInfo jdbcInfo) {
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(connectInformation);
    JdbcDialect jdbcDialect = DataConnectionHelper.lookupDialect(connectInformation);
    String queryString = new SelectQueryBuilder(connectInformation, jdbcDialect)
        .countProjection()
        .query(jdbcInfo, connectInformation)
        .build();

    int count = 0;
    try {
      // 20억건 이상 처리하는게 있을지?
      count = jdbcDataAccessor.executeQueryForObject(conn, queryString, Integer.class);
    } catch (Exception e) {
      LOGGER.error("Fail to get count of query : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get count of query : " + e.getMessage());
    }

    return count;
  }

  public JdbcQueryResultResponse getJdbcQueryResult(ResultSet rs, JdbcDialect dialect) throws SQLException {
    return getJdbcQueryResult(rs, dialect, false);
  }

  public JdbcQueryResultResponse getJdbcQueryResult(ResultSet rs, JdbcDialect dialect, boolean extractColumnName) throws SQLException {
    List<Field> fields = getFieldList(rs, extractColumnName);
    List<Map<String, Object>> data = getDataList(rs, fields, dialect.resultObjectConverter());
    return new JdbcQueryResultResponse(fields, data);
  }

  /**
   * Remove prefix for dummy table
   */
  private String removeDummyPrefixColumnName(String name) {
    return StringUtils.removeStartIgnoreCase(name, RESULTSET_COLUMN_PREFIX);
  }

  /**
   * Remove table name
   */
  private String extractColumnName(String name) {
    if (StringUtils.contains(name, ".")) {
      return StringUtils.substring(name, StringUtils.lastIndexOf(name, ".") + 1, name.length());
    }
    return name;
  }

  private String generateUniqueColumnName(String fieldName, List<Field> fieldList) {
    //Field 명 중복시 난수 추가
    long duplicated = fieldList.stream()
                               .filter(field -> field.getName().equals(fieldName))
                               .count();
    if (duplicated > 0) {
      if (StringUtils.contains(fieldName, ".")) {
        return StringUtils.split(fieldName, ".")[0] + "." + VarGenerator.gen(fieldName + "_");
      } else {
        return VarGenerator.gen(fieldName + "_");
      }
    }
    return fieldName;
  }

  public void closeConnection(Connection connection, Statement stmt, ResultSet rs) {
    JdbcUtils.closeResultSet(rs);
    JdbcUtils.closeStatement(stmt);
    JdbcUtils.closeConnection(connection);
  }

  public int writeResultSetToCSV(ResultSet resultSet, String tempCsvFilePath, List<String> headers) throws SQLException {
    JdbcCSVWriter jdbcCSVWriter = null;
    int rowNumber = 0;
    try {
      jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(tempCsvFilePath), CsvPreference.STANDARD_PREFERENCE);

      //write header from list if exist
      if (headers != null && !headers.isEmpty()) {
        jdbcCSVWriter.setWithHeader(false);
        jdbcCSVWriter.writeHeaders(headers);
      }
      jdbcCSVWriter.write(resultSet, false);
      rowNumber = jdbcCSVWriter.getRowNumber();
    } catch (IOException e) {
      LOGGER.error("writeResultSetToCSV error", e);
    } finally {
      try {
        if (jdbcCSVWriter != null)
          jdbcCSVWriter.close();
      } catch (IOException e) {
      }
    }
    return rowNumber;
  }

  public List<Field> getFieldList(ResultSet rs, boolean extractColumnName) throws SQLException {
    ResultSetMetaData metaData = rs.getMetaData();

    int colNum = metaData.getColumnCount();

    List<Field> fields = Lists.newArrayList();
    for (int i = 1; i <= colNum; i++) {

      String columnLabel = metaData.getColumnLabel(i);

      if(StringUtils.isEmpty(columnLabel)){
        columnLabel = ANONYMOUS_COLUMN_PREFIX + i;
      }

      String fieldName;
      String tableName;

      if (extractColumnName) {
        fieldName = extractColumnName(columnLabel);
      } else {
        fieldName = removeDummyPrefixColumnName(columnLabel);
      }

      String uniqueFieldName = generateUniqueColumnName(fieldName, fields);

      Field field = new Field();
      field.setName(uniqueFieldName);
      field.setLogicalName(fieldName);
      field.setType(DataType.jdbcToFieldType((metaData.getColumnType(i))));
      field.setRole(field.getType().toRole());
      fields.add(field);
    }
    return fields;
  }


  public List<Map<String, Object>> getDataList(ResultSet rs,
                                               List<Field> fields,
                                               FunctionWithException<Object, Object, SQLException> objectConverter)
      throws SQLException {
    ResultSetMetaData metaData = rs.getMetaData();
    int colNum = metaData.getColumnCount();

    List<Map<String, Object>> dataList = Lists.newArrayList();
    while (rs.next()) {
      Map<String, Object> rowMap = Maps.newLinkedHashMap();
      for (int i = 1; i <= colNum; i++) {
        String fieldName = fields.get(i - 1).getName();
        Object resultObject = rs.getObject(i);
        if(objectConverter != null){
          rowMap.put(fieldName, objectConverter.apply(resultObject));
        } else {
          rowMap.put(fieldName, resultObject);
        }
      }
      dataList.add(rowMap);
    }
    return dataList;
  }

  public boolean isSupportSaveAsHiveTable(DataConnection jdbcDataConnection){
    JdbcDialect dialect = DataConnectionHelper.lookupDialect(jdbcDataConnection);
    if(dialect instanceof HiveDialect){
      return HiveDialect.isSupportSaveAsHiveTable(jdbcDataConnection);
    }
    return false;
  }

  public Object getConnectionInformation(DataConnection jdbcDataConnection){
    JdbcDialect dialect = DataConnectionHelper.lookupDialect(jdbcDataConnection);

    Map<String, Object> extensionInfo = new HashMap<>();
    extensionInfo.put("name", dialect.getName());
    extensionInfo.put("implementor", dialect.getImplementor());
    extensionInfo.put("scope", dialect.getScope());
    extensionInfo.put("inputSpec", dialect.getInputSpec());
    extensionInfo.put("iconResource1", dialect.getIconResource1());
    extensionInfo.put("iconResource2", dialect.getIconResource2());
    extensionInfo.put("iconResource3", dialect.getIconResource3());
    extensionInfo.put("iconResource4", dialect.getIconResource4());
    return extensionInfo;
  }

}
