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

import com.facebook.presto.jdbc.PrestoArray;

import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.DateValue;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import net.sf.jsqlparser.expression.StringValue;
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
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.security.UserGroupInformation;
import org.joda.time.DateTime;
import org.postgresql.jdbc.PgArray;
import org.postgresql.util.PGobject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.stereotype.Component;
import org.supercsv.prefs.CsvPreference;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

import javax.sql.DataSource;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.ConnectionRequest;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.query.NativeCriteria;
import app.metatron.discovery.domain.datasource.connection.jdbc.query.expression.NativeCurrentDatetimeExp;
import app.metatron.discovery.domain.datasource.connection.jdbc.query.expression.NativeDateFormatExp;
import app.metatron.discovery.domain.datasource.connection.jdbc.query.expression.NativeEqExp;
import app.metatron.discovery.domain.datasource.connection.jdbc.query.expression.NativeOrderExp;
import app.metatron.discovery.domain.datasource.connection.jdbc.query.expression.NativeProjection;
import app.metatron.discovery.domain.datasource.connection.jdbc.query.utils.VarGenerator;
import app.metatron.discovery.domain.datasource.data.CandidateQueryRequest;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.BatchIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.LinkIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.SelectQueryBuilder;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.user.CachedUserService;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceUtils;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.IntervalFilter;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.PolarisUtils;

import static app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection.CURRENT_DATE_FORMAT;
import static java.util.stream.Collectors.toList;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
@Component
public class JdbcConnectionService {

  private static final Logger LOGGER = LoggerFactory.getLogger(JdbcConnectionService.class);

  private static final int MAX_FETCH_SIZE = 100000;

  private static final String RESULTSET_COLUMN_PREFIX = SelectQueryBuilder.TEMP_TABLE_NAME + ".";

  private static final String[] RESULTSET_TABLE_TYPES = new String[]{"TABLE", "VIEW"};
  private static final String[] RESULTSET_TABLE_TYPES_PRESTO = new String[]{"TABLE"};

  @Autowired
  EngineProperties engineProperties;

  @Autowired
  CachedUserService cachedUserService;

  @Value("${polaris.engine.ingestion.hive.keytab:}")
  String keyTabPath;

  /**
   * Check JDBC connection.
   */
  public Map<String, Object> checkConnection(JdbcDataConnection connection) {
    DriverManager.setLoginTimeout(30);
    return checkConnection(connection, getDataSource(connection, true));
  }

  /**
   * Check JDBC connection using created JDBC datasource
   */
  public Map<String, Object> checkConnection(JdbcDataConnection connection, DataSource dataSource) {

    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
    Map<String, Object> resultMap = Maps.newHashMap();
    resultMap.put("connected", true);
    try {
      jdbcTemplate.execute(connection.getTestQuery());
    } catch (Exception e) {
      LOGGER.warn("Fail to check query : {}", e.getMessage());
      resultMap.put("connected", false);
      resultMap.put("message", e.getMessage());
      return resultMap;
    }

    return resultMap;
  }

  /**
   * Find list of JDBC database from connection
   */
  public Map<String, Object> findDatabases(JdbcDataConnection connection, Pageable pageable) {
    return findDatabases(connection, null, null, pageable);
  }

  /**
   * Find list of JDBC database from connection
   */
  public Map<String, Object> findDatabases(JdbcDataConnection connection, String databaseName, String webSocketId, Pageable pageable) {

    DataSource dataSource = getDataSource(connection, true, webSocketId);

    // JDBC 종류별 데이터 베이스 목록 조회 변경 필요.
    Map<String, Object> resultMap;
    if (connection instanceof PrestoConnection
        || connection instanceof OracleConnection
        || connection instanceof TiberoConnection
        || connection instanceof PostgresqlConnection
        || connection instanceof PhoenixConnection
        || connection instanceof MssqlConnection
        || connection instanceof HiveConnection) {
      resultMap = searchSchemas(connection, dataSource, databaseName, pageable);
    } else {
      resultMap = searchDatabases(connection, dataSource, databaseName, pageable);
    }

    return resultMap;
  }

  /**
   * Find list of table from database
   */
  public Map<String, Object> findTablesInDatabase(JdbcDataConnection connection, String databaseName,
                                                  Pageable pageable) {
    return findTablesInDatabase(connection, databaseName, null, null, pageable);
  }

  /**
   * Find list of table from database
   */
  public Map<String, Object> findTablesInDatabase(JdbcDataConnection connection, String databaseName,
                                                  String tableName, String webSocketId, Pageable pageable) {

    DataSource dataSource = getDataSource(connection, true, webSocketId);

    Map<String, Object> searchedTableMap = searchTables(connection, dataSource, databaseName, tableName, pageable);
    List<Map<String, Object>> tableMapList = (List<Map<String, Object>>) searchedTableMap.get("tables");
    List<String> tableNameList = tableMapList.stream()
                                             .map(tableMap -> (String) tableMap.get("name"))
                                             .collect(Collectors.toList());
    searchedTableMap.put("tables", tableNameList);
    return searchedTableMap;
  }

  public List<Map<String, Object>> showTableColumns(JdbcDataConnection connection,
                                                    String schema,
                                                    String tableName) {

    DataSource dataSource = getDataSource(connection, false, null);

    List<Map<String, Object>> columnNames = searchTableColumnsWithMetatdata(connection, dataSource, schema, tableName, "");
    return columnNames;
  }

  /**
   * Show table description map.
   *
   * @param connection the connection
   * @param dataSource the data source
   * @param schema     the schema
   * @param tableName  the table name
   * @return the map
   */
  public Map<String, Object> showTableDescription(JdbcDataConnection connection, DataSource dataSource,
                                                  String schema, String tableName) {
    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    String tableDescQuery = connection.getTableDescQuery(schema, tableName);

    LOGGER.debug("Execute Table Desc query : {}", tableDescQuery);

    Map<String, Object> tableInfoMap = null;
    try {
      if (connection instanceof HiveConnection) {
        tableInfoMap = new LinkedHashMap<>();
        HiveTableInformation hiveTableInformation = showHiveTableDescription(connection, dataSource, schema, tableName, true);
        if (hiveTableInformation.getPartitionInformation() != null)
          tableInfoMap.putAll(hiveTableInformation.getPartitionInformation());
        if (hiveTableInformation.getDetailInformation() != null)
          tableInfoMap.putAll(hiveTableInformation.getDetailInformation());
        if (hiveTableInformation.getStorageInformation() != null)
          tableInfoMap.putAll(hiveTableInformation.getStorageInformation());
      } else {
        //MySQLConnection, MssqlConnection, PhoenixConnection, PrestoConnection, PostgresqlConnection, OracleConnection
        tableInfoMap = jdbcTemplate.queryForMap(tableDescQuery);
      }
    } catch (Exception e) {
      LOGGER.error("Fail to get desc of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get desc of table : " + e.getMessage());
    }

    //Filter
    //    String[] describeProps = connection.getDescribeProperties();
    //    if (describeProps != null && describeProps.length > 0) {
    //      tableInfoMap = tableInfoMap.entrySet().stream()
    //                                 .filter(map -> Arrays.stream(describeProps)
    //                                                      .anyMatch(map.getKey()::equals))
    //                                 .collect(Collectors.toMap(p -> p.getKey(), p -> Optional.ofNullable(p.getValue()).orElse("")));
    //    }
    return tableInfoMap;
  }

  public Map<String, Object> showTableDescription(JdbcDataConnection connection,
                                                  String schema, String tableName) {
    return showTableDescription(connection, getDataSource(connection, true), schema, tableName);
  }

  public HiveTableInformation showHiveTableDescription(JdbcDataConnection connection,
                                                       String schema, String tableName, boolean includeInformationHeader) {
    return showHiveTableDescription(connection, getDataSource(connection, true), schema, tableName, includeInformationHeader);
  }

  public HiveTableInformation showHiveTableDescription(JdbcDataConnection connection, DataSource dataSource,
                                                       String schema, String tableName, boolean includeInformationHeader) {
    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    String tableDescQuery = connection.getTableDescQuery(schema, tableName);

    LOGGER.debug("Execute Table Desc query : {}", tableDescQuery);

    HiveTableInformation hiveTableInformation = new HiveTableInformation();
    try {
      if (connection instanceof HiveConnection) {

        //Table 상세 정보 조회
        List<Map<String, Object>> tableDescList = jdbcTemplate.queryForList(tableDescQuery);

        boolean isColumnInfo = true;
        boolean isPartitionInfo = false;
        boolean isDetailedInfo = false;
        boolean isStorageInfo = false;

        List<Field> fields = new ArrayList<>();
        Map<String, Object> partitionInfoMap = new LinkedHashMap<>();
        Map<String, Object> detailInfoMap = new LinkedHashMap<>();
        Map<String, Object> storageInfoMap = new LinkedHashMap<>();

        for (int rowCnt = 2; rowCnt < tableDescList.size(); ++rowCnt) {
          Map<String, Object> tableDescRow = tableDescList.get(rowCnt);
          String columnName = StringUtils.trim((String) tableDescRow.get("col_name"));
          String descType = StringUtils.trim((String) tableDescRow.get("data_type"));
          String descValue = StringUtils.trim((String) tableDescRow.get("comment"));

          //Column List 끝났는지 여부.
          if (isColumnInfo && StringUtils.isEmpty(columnName)) {
            isColumnInfo = false;
          }

          //ColumnName이 # col_name 이거나 3가지 값 모두 empty일 경우는 의미없는 Row
          if (columnName.equals("# col_name")
              || (StringUtils.isEmpty(columnName) && StringUtils.isEmpty(descType) && StringUtils.isEmpty(descValue))) {
            continue;
          }

          //아직 Column List 이면 Continue
          if (isColumnInfo) {
            Field field = new Field();
            field.setName(removeDummyPrefixColumnName(columnName));
            field.setType(DataType.jdbcToFieldType(descType));
            field.setRole(field.getType().toRole());
            field.setOriginalType(descType);
            fields.add(field);
            continue;
          }

          //# Partition Information 정보..시작 할 경우
          if (columnName.equals("# Partition Information")) {
            isPartitionInfo = true;
            isDetailedInfo = false;
            isStorageInfo = false;
            if (!includeInformationHeader)
              continue;
          }

          if (columnName.equals("# Detailed Table Information")) {
            isPartitionInfo = false;
            isDetailedInfo = true;
            isStorageInfo = false;
            if (!includeInformationHeader)
              continue;
          }

          if (columnName.equals("# Storage Information")) {
            isPartitionInfo = false;
            isDetailedInfo = false;
            isStorageInfo = true;
            if (!includeInformationHeader)
              continue;
          }

          String key = StringUtils.isNotEmpty(columnName) ? columnName : descType;
          String value = StringUtils.isNotEmpty(columnName) ? descType : descValue;

          //Partition Information
          if (isPartitionInfo) {
            partitionInfoMap.put(key, value);
          }

          //# Detailed Table Information 정보
          if (isDetailedInfo) {
            detailInfoMap.put(key, value);
          }

          //# Storage Information 정보
          if (isStorageInfo) {
            storageInfoMap.put(key, value);
          }
        }

        hiveTableInformation.setFields(fields);
        hiveTableInformation.setPartitionInformation(partitionInfoMap);
        hiveTableInformation.setDetailInformation(detailInfoMap);
        hiveTableInformation.setStorageInformation(storageInfoMap);
      }
    } catch (Exception e) {
      LOGGER.error("Fail to get desc of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get desc of table : " + e.getMessage());
    }

    return hiveTableInformation;
  }

  public Map<String, Object> searchTableColumns(JdbcDataConnection connection, DataSource dataSource, String schema,
                                                String tableName, String columnNamePattern, Pageable pageable) {
    Map<String, Object> columnMap = new LinkedHashMap<>();
    List<Map<String, Object>> columnNames;
    if (connection instanceof PrestoConnection) {
      columnNames = searchTableColumnsWithQuery(connection, dataSource, schema, tableName, columnNamePattern);
    } else {
      columnNames = searchTableColumnsWithMetatdata(connection, dataSource, schema, tableName, columnNamePattern);
    }

    columnMap.put("columns", columnNames);
    columnMap.put("page", createPageInfoMap(columnNames.size(), columnNames.size(), 0));
    return columnMap;
  }

  public Map<String, Object> searchTableColumns(JdbcDataConnection connection, String schema,
                                                String tableName, String columnNamePattern, Pageable pageable) {
    return searchTableColumns(connection, getDataSource(connection, true), schema, tableName,
                              columnNamePattern, pageable);
  }

  public List<Map<String, Object>> searchTableColumnsWithQuery(JdbcDataConnection connection, DataSource dataSource,
                                                               String schema, String tableName, String columnNamePattern) {
    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    String columnListQuery = connection.getSearchColumnQuery(schema, tableName, columnNamePattern, null);

    LOGGER.debug("Execute Column List query : {}", columnListQuery);

    List<Map<String, Object>> columns = Lists.newArrayList();
    try {
      columns = jdbcTemplate.queryForList(columnListQuery).stream()
                            .map(columnMap -> {
                              LinkedHashMap<String, Object> newColumnMap = new LinkedHashMap<>();
                              newColumnMap.put("columnName", columnMap.get("Column"));
                              newColumnMap.put("columnType", columnMap.get("Type"));
                              newColumnMap.put("columnComment", columnMap.get("Comment"));
                              return newColumnMap;
                            }).collect(toList());
    } catch (Exception e) {
      LOGGER.error("Fail to get list of Columns : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of Columns : " + e.getMessage());
    }
    return columns;
  }

  public List<Map<String, Object>> searchTableColumnsWithMetatdata(JdbcDataConnection connection, DataSource dataSource,
                                                                   String schema, String tableName, String columnNamePattern) {
    List<Map<String, Object>> columns = Lists.newArrayList();
    String catalog = schema;
    Connection conn = null;
    ResultSet resultSet = null;

    if (connection instanceof MssqlConnection) {
      catalog = null;
    } else if (connection instanceof PrestoConnection) {
      catalog = ((PrestoConnection) connection).getCatalog();
    }
    try {
      conn = dataSource.getConnection();
      String columnName = null;
      if (StringUtils.isNotEmpty(columnNamePattern)) {
        columnName = "%" + columnNamePattern + "%";
      }
      resultSet = conn.getMetaData().getColumns(catalog, schema, tableName, columnName);

      //      1.TABLE_CAT String => table catalog (may be null)
      //      2.TABLE_SCHEM String => table schema (may be null)
      //      3.TABLE_NAME String => table name
      //      4.COLUMN_NAME String => column name
      //      5.DATA_TYPE int => SQL type from java.sql.Types
      //      6.TYPE_NAME String => Data source dependent type name, for a UDT the type name is fully qualified
      //      7.COLUMN_SIZE int => column size.
      //      8.BUFFER_LENGTH is not used.
      //      9.DECIMAL_DIGITS int => the number of fractional digits. Null is returned for data types where DECIMAL_DIGITS is not applicable.
      //      10.NUM_PREC_RADIX int => Radix (typically either 10 or 2)
      //      11.NULLABLE int => is NULL allowed.
      //        columnNoNulls - might not allow NULL values
      //        columnNullable - definitely allows NULL values
      //        columnNullableUnknown - nullability unknown
      //      12.REMARKS String => comment describing column (may be null)
      //      13.COLUMN_DEF String => default value for the column, which should be interpreted as a string when the value is enclosed in single quotes (may be null)
      //      14.SQL_DATA_TYPE int => unused
      //      15.SQL_DATETIME_SUB int => unused
      //      16.CHAR_OCTET_LENGTH int => for char types the maximum number of bytes in the column
      //      17.ORDINAL_POSITION int => index of column in table (starting at 1)
      //      18.IS_NULLABLE String => ISO rules are used to determine the nullability for a column.
      //        YES --- if the column can include NULLs
      //        NO --- if the column cannot include NULLs
      //        empty string --- if the nullability for the column is unknown
      //      19.SCOPE_CATALOG String => catalog of table that is the scope of a reference attribute (null if DATA_TYPE isn't REF)
      //      20.SCOPE_SCHEMA String => schema of table that is the scope of a reference attribute (null if the DATA_TYPE isn't REF)
      //      21.SCOPE_TABLE String => table name that this the scope of a reference attribute (null if the DATA_TYPE isn't REF)
      //      22.SOURCE_DATA_TYPE short => source type of a distinct type or user-generated Ref type, SQL type from java.sql.Types (null if DATA_TYPE isn't DISTINCT or user-generated REF)
      //      23.IS_AUTOINCREMENT String => Indicates whether this column is auto incremented
      //        YES --- if the column is auto incremented
      //        NO --- if the column is not auto incremented
      //        empty string --- if it cannot be determined whether the column is auto incremented
      //      24.IS_GENERATEDCOLUMN String => Indicates whether this is a generated column
      //        YES --- if this a generated column
      //        NO --- if this not a generated column
      //        empty string --- if it cannot be determined whether this is a generated column
      while (resultSet.next()) {
        Map<String, Object> rowMap = Maps.newHashMap();
        rowMap.put("columnName", resultSet.getString(4));
        rowMap.put("columnType", resultSet.getString(6));
        rowMap.put("columnComment", resultSet.getString(12));
        rowMap.put("columnSize", resultSet.getInt(7));
        columns.add(rowMap);
      }
    } catch (Exception e) {
      LOGGER.error("Fail to get list of columns : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of columns : " + e.getMessage());
    } finally {
      closeConnection(conn, null, resultSet);
    }

    return columns;
  }

  public List<String> showDatabases(JdbcDataConnection connection, DataSource dataSource) {

    List<String> databaseNames = Lists.newArrayList();

    Connection conn = null;
    ResultSet resultSet = null;

    try {
      conn = dataSource.getConnection();
      resultSet = conn.getMetaData().getCatalogs();

      // 1. TABLE_CAT String => catalog name
      while (resultSet.next()) {
        databaseNames.add(resultSet.getString(1));
      }
    } catch (Exception e) {
      LOGGER.error("Fail to get list of database : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of database : " + e.getMessage());
    } finally {
      closeConnection(conn, null, resultSet);
    }

    return databaseNames;

  }

  public List<String> showSchemas(JdbcDataConnection connection, DataSource dataSource) {

    List<String> schemaNames = Lists.newArrayList();
    Connection conn = null;
    ResultSet resultSet = null;
    try {
      conn = dataSource.getConnection();
      resultSet = conn.getMetaData().getSchemas();

      // 1. TABLE_SCHEM String => schema name
      // 2. TABLE_CATALOG String => catalog name (may be null)
      while (resultSet.next()) {
        if (connection instanceof PrestoConnection &&
            !StringUtils.equalsIgnoreCase(((PrestoConnection) connection).getCatalog(), resultSet.getString(2))) {
          continue;
        }
        schemaNames.add(resultSet.getString(1));
      }
    } catch (Exception e) {
      LOGGER.error("Fail to get list of schema : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of schema : " + e.getMessage());
    } finally {
      closeConnection(conn, null, resultSet);
    }

    // TODO : 임시조치
    if (connection instanceof StageDataConnection) {
      schemaNames = schemaNames.stream()
                               .filter(s -> !s.startsWith("FLOW_"))
                               .collect(toList());
    }

    return schemaNames;

  }

  public List<Map<String, String>> showTables(JdbcDataConnection connection, DataSource dataSource, String schema) {

    List<Map<String, String>> tableInfos = Lists.newArrayList();
    Connection conn = null;
    ResultSet resultSet = null;

    try {
      conn = dataSource.getConnection();
      if (connection instanceof MySQLConnection
          || connection instanceof HiveConnection) {
        schema = schema == null ? connection.getDatabase() : schema;
        resultSet = conn.getMetaData().getTables(schema,
                                                 schema, null, RESULTSET_TABLE_TYPES);
      } else if (connection instanceof PrestoConnection) {
        resultSet = conn.getMetaData().getTables(connection.getDatabase(), schema, null, RESULTSET_TABLE_TYPES_PRESTO);
      } else {
        resultSet = conn.getMetaData().getTables(connection.getDatabase(), schema, null, RESULTSET_TABLE_TYPES);
      }

      while (resultSet.next()) {
        Map<String, String> tableInfo = Maps.newHashMap();
        // 1. TABLE_CAT String => table catalog (may be null)
        // 2. TABLE_SCHEM String => table schema (may be null)
        // 3. TABLE_NAME String => table name
        // 4. TABLE_TYPE String => table type. Typical types are "TABLE", "VIEW", "SYSTEM TABLE", "GLOBAL TEMPORARY", "LOCAL TEMPORARY", "ALIAS", "SYNONYM".
        // 5. REMARKS String => explanatory comment on the table
        // 6. TYPE_CAT String => the types catalog (may be null)
        // 7. TYPE_SCHEM String => the types schema (may be null)
        // 8. TYPE_NAME String => type name (may be null)
        // 9. SELF_REFERENCING_COL_NAME String => name of the designated "identifier" column of a typed table (may be null)
        // 10. REF_GENERATION String => specifies how values in SELF_REFERENCING_COL_NAME are created. Values are "SYSTEM", "USER", "DERIVED". (may be null)
        LOGGER.debug("SCHEMA: {} - NAME: {} - TYPE: {}", resultSet.getString(2), resultSet.getString(3), resultSet.getString(4));

        String tableType = resultSet.getString(4);
        if (!("TABLE".equals(tableType) || "VIEW".equals(tableType))) {
          continue;
        }

        tableInfo.put("name", resultSet.getString(3));
        tableInfo.put("type", resultSet.getString(4));
        tableInfo.put("comment", resultSet.getString(5));

        tableInfos.add(tableInfo);
      }
    } catch (Exception e) {
      LOGGER.error("Fail to get list of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of table : " + e.getMessage());
    } finally {
      closeConnection(conn, null, resultSet);
    }

    return tableInfos;
  }

  public List<Map<String, String>> showTables(JdbcDataConnection connection, String schema) {
    boolean includeDatabases = false;
    if (StringUtils.isEmpty(schema)) {
      includeDatabases = true;
    }

    return showTables(connection, getDataSource(connection, includeDatabases), schema);
  }

  public Map<String, Object> searchTables(JdbcDataConnection connection, String schema,
                                          String tableNamePattern, Pageable pageable) {

    return searchTables(connection, getDataSource(connection, true), schema, tableNamePattern, pageable);
  }

  public Map<String, Object> searchTables(JdbcDataConnection connection, String schema,
                                          String tableNamePattern, String webSocketId, Pageable pageable) {
    DataSource dataSource = getDataSource(connection, true, webSocketId);
    return searchTables(connection, dataSource, schema, tableNamePattern, pageable);
  }

  public Map<String, Object> searchTables(JdbcDataConnection connection, DataSource dataSource, String schema,
                                          String tableNamePattern, Pageable pageable) {

    if (connection instanceof MySQLConnection
        || connection instanceof MssqlConnection
        || connection instanceof OracleConnection
        || connection instanceof PhoenixConnection
        || connection instanceof PostgresqlConnection) {
      return searchTablesWithQueryPageable(connection, dataSource, schema, tableNamePattern, pageable);
    } else if (connection instanceof HiveMetastoreConnection && ((HiveMetastoreConnection) connection).includeMetastoreInfo()) {
      return searchTablesWithHiveMetastore(connection, dataSource, schema, tableNamePattern, pageable);
    } else if (connection instanceof HiveConnection || connection instanceof PrestoConnection){
      return searchTablesWithQuery(connection, dataSource, schema, tableNamePattern);
    } else {
      return searchTablesWithMetadata(connection, dataSource, schema, tableNamePattern);
    }
  }

  public Map<String, Object> searchTablesWithQueryPageable(JdbcDataConnection connection, DataSource dataSource,
                                                           String schema, String tableNamePattern, Pageable pageable) {
    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    String tableCountQuery = connection.getTableCountQuery(schema, tableNamePattern);
    String tableListQuery = connection.getSearchTableQuery(schema, tableNamePattern, pageable);

    LOGGER.debug("Execute Table Count query : {}", tableCountQuery);
    LOGGER.debug("Execute Table List query : {}", tableListQuery);

    int tableCount = 0;
    List<Map<String, Object>> tableNames = null;
    try {
      tableCount = jdbcTemplate.queryForObject(tableCountQuery, Integer.class);
      tableNames = jdbcTemplate.queryForList(tableListQuery);
    } catch (Exception e) {
      LOGGER.error("Fail to get list of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of database : " + e.getMessage());
    }

    int size = 20;
    int page = 0;
    if (pageable != null) {
      size = pageable.getPageSize();
      page = pageable.getPageNumber();
    }
    Map<String, Object> databaseMap = new LinkedHashMap<>();
    databaseMap.put("tables", tableNames);
    databaseMap.put("page", createPageInfoMap(size, tableCount, page));
    return databaseMap;
  }

  public Map<String, Object> searchTablesWithQuery(JdbcDataConnection connection, DataSource dataSource,
                                                           String schema, String tableNamePattern) {
    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    String tableListQuery = connection.getShowTableQuery(schema);

    LOGGER.debug("Execute Table List query : {}", tableListQuery);

    List<Map<String, Object>> tableNames = null;
    try {
      tableNames = jdbcTemplate.queryForList(tableListQuery);
    } catch (Exception e) {
      LOGGER.error("Fail to get list of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
              "Fail to get list of database : " + e.getMessage());
    }

    tableNames.stream()
            .forEach(tableMap -> {
              tableMap.put("name", tableMap.get(connection.getTableNameColumn()));
              tableMap.remove(connection.getTableNameColumn());
            });

    Map<String, Object> databaseMap = new LinkedHashMap<>();
    if(StringUtils.isEmpty(tableNamePattern)){
      databaseMap.put("tables", tableNames);
      databaseMap.put("page", createPageInfoMap(tableNames.size(), tableNames.size(), 0));
    } else {
      List filteredList = tableNames.stream()
              .filter(tableMap -> tableMap.get("name").toString().contains(tableNamePattern))
              .collect(Collectors.toList());
      databaseMap.put("tables", filteredList);
      databaseMap.put("page", createPageInfoMap(filteredList.size(), filteredList.size(), 0));
    }

    return databaseMap;
  }

  public Map<String, Object> searchTablesWithHiveMetastore(JdbcDataConnection connection, DataSource dataSource,
                                                           String schema, String tableNamePattern, Pageable pageable) {

    HiveMetastoreConnection hiveConnection = (HiveMetastoreConnection) connection;

    int tableCount;
    List<Map<String, Object>> tableNames;
    try {
      HiveMetaStoreJdbcClient metaStoreJdbcClient = new HiveMetaStoreJdbcClient(
          hiveConnection.getMetastoreURL(),
          hiveConnection.getMetastoreUserName(),
          hiveConnection.getMetastorePassword(),
          hiveConnection.getMetastoreDriverName());
      tableCount = metaStoreJdbcClient.getTableCount(schema, tableNamePattern, tableNamePattern);
      tableNames = metaStoreJdbcClient.getTable(schema, tableNamePattern, tableNamePattern, pageable);
    } catch (JdbcDataConnectionException jdbce) {
      if (jdbce.getCode() == JdbcDataConnectionErrorCodes.HIVE_METASTORE_ERROR_CODE) {
        LOGGER.debug("Fail to Connect To Hive MetaStore Directly : {}", jdbce.getMessage());
        return searchTablesWithMetadata(connection, dataSource, schema, tableNamePattern);
      } else {
        LOGGER.error("Fail to get list of table : {}", jdbce.getMessage());
        throw jdbce;
      }
    } catch (Exception e) {
      LOGGER.error("Fail to get list of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of table : " + e.getMessage());
    }

    int size = 20;
    int page = 0;
    if (pageable != null) {
      size = pageable.getPageSize();
      page = pageable.getPageNumber();
    }
    Map<String, Object> databaseMap = new LinkedHashMap<>();
    databaseMap.put("tables", tableNames);
    databaseMap.put("page", createPageInfoMap(size, tableCount, page));
    return databaseMap;
  }

  public Map<String, Object> searchTablesWithMetadata(JdbcDataConnection connection, DataSource dataSource,
                                                      String schema, String tableName) {

    String tableNamePattern = null;
    if (!StringUtils.isEmpty(tableName)) {
      tableNamePattern = "%" + tableName + "%";
    }

    List<Map<String, String>> tableInfos = Lists.newArrayList();
    Connection conn = null;
    ResultSet resultSet = null;
    try {
      conn = dataSource.getConnection();
      if (connection instanceof MySQLConnection
          || connection instanceof HiveConnection) {
        String targetSchema = schema == null ? connection.getDatabase() : schema;
        resultSet = conn.getMetaData().getTables(targetSchema, targetSchema, tableNamePattern, RESULTSET_TABLE_TYPES);
      } else if (connection instanceof PrestoConnection) {
        String catalog = ((PrestoConnection) connection).getCatalog();
        resultSet = conn.getMetaData().getTables(catalog, schema, tableNamePattern, RESULTSET_TABLE_TYPES_PRESTO);
      } else {
        resultSet = conn.getMetaData().getTables(connection.getDatabase(), schema, tableNamePattern, RESULTSET_TABLE_TYPES);
      }

      while (resultSet.next()) {
        Map<String, String> tableInfo = Maps.newHashMap();
        // 1. TABLE_CAT String => table catalog (may be null)
        // 2. TABLE_SCHEM String => table schema (may be null)
        // 3. TABLE_NAME String => table name
        // 4. TABLE_TYPE String => table type. Typical types are "TABLE", "VIEW", "SYSTEM TABLE", "GLOBAL TEMPORARY", "LOCAL TEMPORARY", "ALIAS", "SYNONYM".
        // 5. REMARKS String => explanatory comment on the table
        // 6. TYPE_CAT String => the types catalog (may be null)
        // 7. TYPE_SCHEM String => the types schema (may be null)
        // 8. TYPE_NAME String => type name (may be null)
        // 9. SELF_REFERENCING_COL_NAME String => name of the designated "identifier" column of a typed table (may be null)
        // 10. REF_GENERATION String => specifies how values in SELF_REFERENCING_COL_NAME are created. Values are "SYSTEM", "USER", "DERIVED". (may be null)
        LOGGER.debug("SCHEMA: {} - NAME: {} - TYPE: {}", resultSet.getString(2), resultSet.getString(3), resultSet.getString(4));

        String tableType = resultSet.getString(4);
        if (!("TABLE".equals(tableType) || "VIEW".equals(tableType))) {
          continue;
        }

        tableInfo.put("name", resultSet.getString(3));
        tableInfo.put("type", resultSet.getString(4));
        tableInfo.put("comment", resultSet.getString(5));

        tableInfos.add(tableInfo);
      }
    } catch (Exception e) {
      LOGGER.error("Fail to get list of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of table : " + e.getMessage());
    } finally {
      closeConnection(conn, null, resultSet);
    }

    Map<String, Object> tableMap = new LinkedHashMap<>();
    int tableCount = tableInfos.size();

    //    tableMap.put("tables", tableInfos
    //        .stream()
    //        .map(info -> info.get("name"))
    //        .sorted()
    //        .collect(toList()));
    tableMap.put("tables", tableInfos);
    tableMap.put("page", createPageInfoMap(tableCount, tableCount, 0));
    return tableMap;
  }

  public JdbcQueryResultResponse selectQuery(JdbcDataConnection connection, DataSource dataSource, String query) {
    return selectQuery(connection, dataSource, query, -1, false);
  }

  public JdbcQueryResultResponse selectQuery(JdbcDataConnection connection, DataSource dataSource, String query,
                                             int limit, boolean extractColumnName) {

    // int totalRows = countOfSelectQuery(connection, ingestion);
    JdbcQueryResultResponse queryResultSet = null;

    LOGGER.debug("Query : {} ", query);

    Connection conn = null;
    Statement stmt = null;
    ResultSet rs = null;
    try {
      conn = dataSource.getConnection();
      stmt = conn.createStatement();

      if (limit > 0)
        stmt.setMaxRows(limit);

      rs = stmt.executeQuery(query);

      queryResultSet = getJdbcQueryResult(rs, extractColumnName);
      // queryResultSet.setTotalRows(totalRows);
    } catch (SQLException e) {
      LOGGER.error("Fail to query for select : SQLState({}), ErrorCode({}), Message : {}"
              , e.getSQLState(), e.getErrorCode(), e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.PREVIEW_TABLE_SQL_ERROR,
              "Fail to query : " + e.getSQLState() + ", "  + e.getErrorCode() + ", " + e.getMessage());
    } catch (Exception e) {
      LOGGER.error("Fail to query for select :  {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to query : " + e.getMessage());
    } finally {
      closeConnection(conn, stmt, rs);
    }

    return queryResultSet;
  }

  public JdbcQueryResultResponse selectQueryForIngestion(JdbcDataConnection connection,
                                                         DataSource dataSource,
                                                         String schema,
                                                         JdbcIngestionInfo.DataType type,
                                                         String query,
                                                         List<Map<String, Object>> partitionList,
                                                         int limit,
                                                         boolean extractColumnName) {
    if (connection instanceof MySQLConnection
        || connection instanceof HiveConnection
        || connection instanceof PrestoConnection) {
      if (schema != null && type == JdbcIngestionInfo.DataType.QUERY) {
        connection.setDatabase(schema);
      }
    }

    JdbcQueryResultResponse queryResultSet = null;

    if (type == JdbcIngestionInfo.DataType.TABLE) {
      NativeCriteria nativeCriteria = new NativeCriteria(DataConnection.Implementor.getImplementor(connection));
      String database = schema;
      String table = query;
      String tableName = (!table.contains(".") && database != null) ? database + "." + table : table;
      nativeCriteria.addTable(tableName, table);

      //add projection for partition
      if(partitionList != null && !partitionList.isEmpty()){

        for(Map<String, Object> partitionMap : partitionList){
          for(String keyStr : partitionMap.keySet()){
            nativeCriteria.add(new NativeEqExp(keyStr, partitionMap.get(keyStr)));
          }
        }
      }

      String queryString = nativeCriteria.toSQL();
      LOGGER.debug("selectQueryForIngestion SQL : {} ", queryString);
      queryResultSet = selectQuery(connection, dataSource, queryString, limit, extractColumnName);
    } else {
      LOGGER.debug("selectQueryForIngestion SQL : {} ", query);
      queryResultSet = selectQuery(connection, dataSource, query, limit, extractColumnName);
    }


    return queryResultSet;
  }

  public JdbcQueryResultResponse selectQueryForIngestion(JdbcDataConnection connection,
                                                         String schema,
                                                         JdbcIngestionInfo.DataType type,
                                                         String query,
                                                         List<Map<String, Object>> partitionList,
                                                         int limit,
                                                         boolean extractColumnName) {
    return selectQueryForIngestion(connection, getDataSource(connection, true),
            schema, type, query, partitionList, limit, extractColumnName);
  }

  public JdbcQueryResultResponse selectQueryForIngestion(JdbcDataConnection connection,
                                                         String schema,
                                                         JdbcIngestionInfo.DataType type,
                                                         String query,
                                                         int limit,
                                                         boolean extractColumnName) {
    return selectQueryForIngestion(connection, getDataSource(connection, true),
                                   schema, type, query, null, limit, extractColumnName);
  }

//  public JdbcQueryResultResponse selectQueryForIngestion(JdbcDataConnection connection,
//                                                         String schema,
//                                                         JdbcIngestionInfo.DataType type,
//                                                         String query,
//                                                         int limit) {
//    return selectQueryForIngestion(connection, getDataSource(connection, true),
//                                   schema, type, query, null, limit, false);
//  }

  public JdbcQueryResultResponse ddlQuery(JdbcDataConnection connection,
                                          DataSource dataSource,
                                          String query) {

    JdbcQueryResultResponse queryResultSet = null;

    LOGGER.debug("Query : {} ", query);

    Connection conn = null;
    Statement stmt = null;
    ResultSet rs = null;
    try {
      conn = dataSource.getConnection();
      stmt = conn.createStatement();
      stmt.executeUpdate(query);
    } catch (Exception e) {
      LOGGER.error("Fail to query for select :  {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to query : " + e.getMessage());
    } finally {
      closeConnection(conn, stmt, rs);
    }

    return queryResultSet;
  }

  public JdbcQueryResultResponse ddlQuery(JdbcDataConnection connection, String query) {
    return ddlQuery(connection, getDataSource(connection, true), query);
  }

  public List<String> selectQueryToCsv(JdbcDataConnection connection,
                                       JdbcIngestionInfo ingestionInfo,
                                       String dataSourceName,
                                       List<Field> fields) {

    if (connection instanceof MySQLConnection
        || connection instanceof HiveConnection
        || connection instanceof PrestoConnection) {
      if (ingestionInfo.getDatabase() != null && ingestionInfo.getDataType() == JdbcIngestionInfo.DataType.QUERY) {
        connection.setDatabase(ingestionInfo.getDatabase());
      }
    }

    return selectQueryToCsv(connection, ingestionInfo, dataSourceName, fields, null);
  }

  public List<String> selectQueryToCsv(JdbcDataConnection connection,
                                       JdbcIngestionInfo ingestionInfo,
                                       String dataSourceName,
                                       List<Field> fields, Integer limit) {
    return selectQueryToCsv(connection, ingestionInfo, dataSourceName, fields, null, limit);
  }

  public List<String> selectQueryToCsv(JdbcDataConnection connection,
                                       JdbcIngestionInfo ingestionInfo,
                                       String dataSourceName,
                                       List<Field> fields,
                                       List<Filter> filters,
                                       Integer limit) {
    return selectQueryToCsv(connection, ingestionInfo, null, dataSourceName, fields, filters, limit);

  }

//  public List<String> selectQueryToCsv(JdbcDataConnection connection,
//                                       JdbcIngestionInfo ingestionInfo,
//                                       String baseDir,
//                                       String dataSourceName,
//                                       List<Field> fields,
//                                       List<Filter> filters,
//                                       Integer limit) {
//
//    int fetchSize = ingestionInfo.getFetchSize();
//    int maxLimit = limit == null ? ingestionInfo.getMaxLimit() : limit;
//
//    // Get JDBC Connection and set database
//    JdbcDataConnection realConnection = connection == null ? ingestionInfo.getConnection() : connection;
//    if (connection instanceof MySQLConnection
//        || connection instanceof HiveConnection
//        || connection instanceof PrestoConnection) {
//      if (ingestionInfo.getDatabase() != null) {
//        realConnection.setDatabase(ingestionInfo.getDatabase());
//      }
//    }
//
//    DataSource dataSource = getDataSource(Preconditions.checkNotNull(realConnection, "connection info. required."),
//                                          true);
//
//    List<String> tempCsvFiles = Lists.newArrayList();
//
//    String queryString;
//
//    NativeCriteria nativeCriteria = new NativeCriteria(DataConnection.Implementor.getImplementor(realConnection));
//    if (ingestionInfo.getDataType() == JdbcIngestionInfo.DataType.TABLE) {
//      String database = ingestionInfo.getDatabase();
//      String table = ingestionInfo.getQuery();
//      String tableName = (!table.contains(".") && database != null) ? database + "." + table : table;
//      nativeCriteria.addTable(tableName, table);
//    } else {
//      nativeCriteria.addSubQuery(ingestionInfo.getQuery());
//    }
//
//    if (fields != null && !fields.isEmpty()) {
//      NativeProjection nativeProjection = new NativeProjection();
//
//      for (Field field : fields) {
//        String fieldAlias = field.getAlias();
//        String fieldName;
//        if (StringUtils.contains(fieldAlias, ".")) {
//          String[] splicedFieldAlias = StringUtils.split(fieldAlias, ".");
//          fieldName = splicedFieldAlias[splicedFieldAlias.length - 1];
//        } else {
//          fieldName = fieldAlias;
//        }
//
//        if (Field.COLUMN_NAME_CURRENT_DATETIME.equals(field.getName()) && field.getRole() == Field.FieldRole.TIMESTAMP) {
//          nativeProjection.addProjection(new NativeCurrentDatetimeExp(fieldName));
//        } else if (StringUtils.isEmpty(field.getTimeFormat()) &&
//            (field.getRole() == Field.FieldRole.TIMESTAMP ||
//                (field.getRole() == Field.FieldRole.DIMENSION && field.getType() == DataType.TIMESTAMP))) {
//          nativeProjection.addProjection(new NativeDateFormatExp(fieldName, null));
//          field.setFormat(NativeDateFormatExp.COMMON_DEFAULT_DATEFORMAT);
//        } else {
//          nativeProjection.addProjection(fieldName, fieldName);
//        }
//      }
//
//      nativeCriteria.setProjection(nativeProjection);
//    }
//
//    if (filters != null && !filters.isEmpty()) {
//      for (Filter filter : filters) {
//        //Inclusion Filter
//        if (filter instanceof InclusionFilter) {
//          List<String> valueList = ((InclusionFilter) filter).getValueList();
//          if (valueList != null) {
//            NativeDisjunctionExp disjunctionExp = new NativeDisjunctionExp();
//            for (String value : valueList) {
//              disjunctionExp.add(new NativeEqExp(filter.getColumn(), value));
//            }
//            nativeCriteria.add(disjunctionExp);
//          }
//
//          // Interval Filter
//        } else if (filter instanceof IntervalFilter) {
//          IntervalFilter.SelectorType selectorType = ((IntervalFilter) filter).getSelector();
//
//          //최신 유형일 경우
//          if (selectorType == IntervalFilter.SelectorType.RELATIVE) {
//            DateTime startDateTime = ((IntervalFilter) filter).getRelativeStartDate();
//            DateTime endDateTime = ((IntervalFilter) filter).utcFakeNow();
//            nativeCriteria.add(new NativeBetweenExp(filter.getColumn(), startDateTime, endDateTime));
//            //기간 지정일 경우
//          } else if (selectorType == IntervalFilter.SelectorType.RANGE) {
//            List<String> intervals = ((IntervalFilter) filter).getEngineIntervals();
//            if (intervals != null && !intervals.isEmpty()) {
//              NativeDisjunctionExp disjunctionExp = new NativeDisjunctionExp();
//              for (String interval : intervals) {
//                DateTime startDateTime = new DateTime(interval.split("/")[0]);
//                DateTime endDateTime = new DateTime(interval.split("/")[1]);
//                disjunctionExp.add(new NativeBetweenExp(filter.getColumn(), startDateTime, endDateTime));
//              }
//              nativeCriteria.add(disjunctionExp);
//            }
//          }
//        }
//      }
//    }
//
//    if (limit != null) {
//      nativeCriteria.setLimit(maxLimit);
//    }
//
//    queryString = nativeCriteria.toSQL();
//
//    //    if(limit == null) {
//    //      // 질의 쿼리 작성
//    //      queryString = new SelectQueryBuilder(realConnection)
//    //              .projection(fields)
//    //              .query(ingestionInfo)
//    //              .build();
//    //    } else {
//    //      // 질의 쿼리 작성
//    //      queryString = new SelectQueryBuilder(realConnection)
//    //              .projection(fields)
//    //              .query(ingestionInfo)
//    //              .limit(0, limit)
//    //              .build();
//    //    }
//
//    LOGGER.info("Generated SQL Query: {}", queryString);
//
//    // 쿼리 결과 저장
//    String tempFileName = getTempFileName(baseDir, EngineProperties.TEMP_CSV_PREFIX + "_"
//            + dataSourceName + "_" + System.currentTimeMillis());
//    JdbcCSVWriter jdbcCSVWriter = null;
//    try {
//      jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(tempFileName), CsvPreference.STANDARD_PREFERENCE);
//      jdbcCSVWriter.setConnection(realConnection);
//      jdbcCSVWriter.setDataSource(dataSource);
//      jdbcCSVWriter.setQuery(queryString);
//      jdbcCSVWriter.setFileName(tempFileName);
//      jdbcCSVWriter.setFetchSize(fetchSize);
//      jdbcCSVWriter.setWithHeader(false);
//    } catch (IOException e) {
//    }
//
//    String resultFileName = jdbcCSVWriter.write();
//
//    // 결과 셋이 없는 경우 처리
//    File file = new File(resultFileName);
//    if (!file.exists() && file.length() == 0) {
//      return null;
//    }
//
//    LOGGER.debug("Created result file : {} ", resultFileName);
//
//    tempCsvFiles.add(tempFileName);
//
//    return tempCsvFiles;
//
//  }

  public List<String> selectQueryToCsv(JdbcDataConnection connection,
                                       JdbcIngestionInfo ingestionInfo,
                                       String baseDir,
                                       String dataSourceName,
                                       List<Field> fields,
                                       List<Filter> filters,
                                       Integer limit) {

    int fetchSize = ingestionInfo.getFetchSize();
    int maxLimit = limit == null ? ingestionInfo.getMaxLimit() : limit;

    // Get JDBC Connection and set database
    JdbcDataConnection realConnection = connection == null ? ingestionInfo.getConnection() : connection;
    if (connection instanceof MySQLConnection
            || connection instanceof HiveConnection
            || connection instanceof PrestoConnection) {
      if (ingestionInfo.getDatabase() != null) {
        realConnection.setDatabase(ingestionInfo.getDatabase());
      }
    }

    DataSource dataSource = getDataSource(Preconditions.checkNotNull(realConnection, "connection info. required."),
            true);

    List<String> tempCsvFiles = Lists.newArrayList();

    String queryString;
    Select select = null;
    PlainSelect selectBody;
    try{
      if (ingestionInfo.getDataType() == JdbcIngestionInfo.DataType.TABLE) {
        String database = ingestionInfo.getDatabase();
        String table = ingestionInfo.getQuery();
        String tableName = (!table.contains(".") && database != null) ? database + "." + table : table;
        select = SelectUtils.buildSelectFromTable(new Table(tableName));
      } else {
        net.sf.jsqlparser.statement.Statement parsedStmt = CCJSqlParserUtil.parse(ingestionInfo.getQuery());
        if(!(parsedStmt instanceof Select)){
          throw new JSQLParserException("query is not select");
        }

        select = (Select) parsedStmt;
      }

      selectBody = (PlainSelect) select.getSelectBody();

      if (CollectionUtils.isNotEmpty(fields)) {
        //change projection
        List<SelectItem> newSelectItems = Lists.newArrayList();
        for(Field field : fields){
          //
          if(field.isNotPhysicalField()) {
            continue;
          }

          DataConnection.Implementor implementor = DataConnection.Implementor.getImplementor(realConnection);
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

        selectBody.setWhere(new MultiAndExpression(andExprList));
      }

      if (limit != null) {
        Limit limitExpression = new Limit();
        limitExpression.setRowCount(new LongValue(maxLimit));
        selectBody.setLimit(limitExpression);
      }


    } catch (JSQLParserException e){
      e.printStackTrace();
    }


    queryString = select.toString();

    LOGGER.info("Generated SQL Query2: {}", queryString);

    // 쿼리 결과 저장
    String tempFileName = getTempFileName(baseDir, EngineProperties.TEMP_CSV_PREFIX + "_"
            + dataSourceName + "_" + System.currentTimeMillis());
    JdbcCSVWriter jdbcCSVWriter = null;
    try {
      jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(tempFileName), CsvPreference.STANDARD_PREFERENCE);
      jdbcCSVWriter.setConnection(realConnection);
      jdbcCSVWriter.setDataSource(dataSource);
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

  public List<Map<String, Object>> selectCandidateQuery(CandidateQueryRequest queryRequest) {

    app.metatron.discovery.domain.workbook.configurations.field.Field targetField = queryRequest.getTargetField();

    //필수값 체크 target field
    Preconditions.checkNotNull(targetField, "target field. required.");

    //MetaDataSource
    app.metatron.discovery.domain.datasource.DataSource metaDataSource = queryRequest.getDataSource().getMetaDataSource();
    app.metatron.discovery.domain.datasource.Field metaField = metaDataSource.getMetaFieldMap(false, "")
                                                                             .get(targetField.getName());

    //Jdbc Connection
    JdbcDataConnection jdbcDataConnection = (JdbcDataConnection) metaDataSource.getConnection();

    //Ingestion Info (Link)
    LinkIngestionInfo ingestionInfo = (LinkIngestionInfo) metaDataSource.getIngestionInfo();

    // TODO: 중복 코드를 해결 필요
    JdbcDataConnection realConnection = (JdbcDataConnection) metaDataSource.getJdbcConnectionForIngestion();

    if (realConnection instanceof MySQLConnection
        || realConnection instanceof HiveConnection
        || realConnection instanceof PrestoConnection) {
      if (ingestionInfo.getDatabase() != null) {
        realConnection.setDatabase(ingestionInfo.getDatabase());
      }
    }

    NativeCriteria nativeCriteria = new NativeCriteria(DataConnection.Implementor.getImplementor(jdbcDataConnection));
    NativeProjection nativeProjection = new NativeProjection();

    String targetFieldName = targetField.getName();
    if(StringUtils.contains(targetFieldName, ".")){
      targetFieldName = StringUtils.split(targetFieldName, ".")[1];
    }

    if (metaField.getLogicalType() == LogicalType.TIMESTAMP) {
      nativeProjection.addAggregateProjection(targetFieldName, "minTime", NativeProjection.AggregateProjection.MIN);
      nativeProjection.addAggregateProjection(targetFieldName, "maxTime", NativeProjection.AggregateProjection.MAX);
      nativeCriteria.setProjection(nativeProjection);
      if (ingestionInfo.getDataType() == JdbcIngestionInfo.DataType.TABLE) {
        nativeCriteria.addTable(ingestionInfo.getQuery(), ingestionInfo.getQuery());
      } else {
        nativeCriteria.addSubQuery(ingestionInfo.getQuery());
      }
    } else {
      nativeProjection.addProjection(targetFieldName, "field");
      nativeProjection.addAggregateProjection(targetFieldName, "count", NativeProjection.AggregateProjection.COUNT);
      nativeCriteria.setProjection(nativeProjection);
      if (ingestionInfo.getDataType() == JdbcIngestionInfo.DataType.TABLE) {
        nativeCriteria.addTable(ingestionInfo.getQuery(), ingestionInfo.getQuery());
      } else {
        nativeCriteria.addSubQuery(ingestionInfo.getQuery());
      }
      nativeCriteria.setOrder((new NativeOrderExp()).add("count", NativeOrderExp.OrderType.DESC));
    }
    nativeCriteria.setLimit(10000);

    String query = nativeCriteria.toSQL();

    LOGGER.debug("Candidate Query : {} ", query);

    JdbcQueryResultResponse queryResult =
        selectQuery(jdbcDataConnection, getDataSource(realConnection, true), query);
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

  public List<String> selectIncrementalQueryToCsv(JdbcDataConnection connection,
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
    JdbcDataConnection realConnection = connection == null ? ingestionInfo.getConnection() : connection;
    DataSource dataSource = getDataSource(Preconditions.checkNotNull(realConnection, "connection info. required."),
                                          true);

    // Max time 이 없는 경우 고려
    DateTime incrementalTime = maxTime == null ? new DateTime(0L) : maxTime;

    List<String> tempCsvFiles = Lists.newArrayList();

    // 증분 Query 작성
    String queryString = new SelectQueryBuilder(realConnection)
        .projection(fields)
        .query(batchIngestionInfo)
        .incremental(timestampField, incrementalTime.toString(CURRENT_DATE_FORMAT))
        .limit(0, maxLimit)
        .build();

    LOGGER.debug("Generated incremental query : {} ", queryString);

    // 쿼리 결과 저장
    String tempFileName = getTempFileName(dataSourceName + "_" + incrementalTime.toString());
    JdbcCSVWriter jdbcCSVWriter = null;
    try {
      jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(tempFileName), CsvPreference.STANDARD_PREFERENCE);
      jdbcCSVWriter.setConnection(realConnection);
      jdbcCSVWriter.setDataSource(dataSource);
      jdbcCSVWriter.setQuery(queryString);
      jdbcCSVWriter.setFetchSize(fetchSize);
      jdbcCSVWriter.setFileName(tempFileName);
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

  public int countOfSelectQuery(JdbcDataConnection connection, DataSource dataSource, JdbcIngestionInfo jdbcInfo) {

    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    String queryString = new SelectQueryBuilder(connection)
        .countProjection()
        .query(jdbcInfo)
        .build();

    int count = 0;
    try {
      // 20억건 이상 처리하는게 있을지?
      count = jdbcTemplate.queryForObject(queryString, Integer.class);
    } catch (Exception e) {
      LOGGER.error("Fail to get count of query : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get count of query : " + e.getMessage());
    }

    return count;
  }

  public int countOfSelectQuery(JdbcDataConnection connection, JdbcIngestionInfo jdbcInfo) {
    return countOfSelectQuery(connection, getDataSource(connection, true), jdbcInfo);
  }

  public JdbcQueryResultResponse getJdbcQueryResult(ResultSet rs) throws SQLException {
    return getJdbcQueryResult(rs, false);
  }

  public JdbcQueryResultResponse getJdbcQueryResult(ResultSet rs, boolean extractColumnName) throws SQLException {
    List<Field> fields = getFieldList(rs, extractColumnName);
    List<Map<String, Object>> data = getDataList(rs, fields);
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
    String uniqueFieldName = duplicated > 0 ? VarGenerator.gen(fieldName) : fieldName;
    return uniqueFieldName;
  }

  public Map<String, Object> searchSchemas(JdbcDataConnection connection, DataSource dataSource,
                                           String schemaNamePattern, Pageable pageable) {
    if (connection instanceof PrestoConnection
        || connection instanceof HiveConnection) {
      return searchSchemasWithQuery(connection, dataSource, schemaNamePattern, pageable);
    } else if (connection instanceof OracleConnection
        || connection instanceof PostgresqlConnection
        || connection instanceof MssqlConnection
        || connection instanceof PhoenixConnection) {
      return searchSchemasWithQueryPageable(connection, dataSource, schemaNamePattern, pageable);
    } else {
      return searchSchemasWithMetadata(connection, dataSource, schemaNamePattern, pageable);
    }
  }

  public Map<String, Object> searchSchemas(JdbcDataConnection connection,
                                           String schemaNamePattern, Pageable pageable) {
    return searchSchemas(connection, getDataSource(connection, true), schemaNamePattern, pageable);
  }

  public Map<String, Object> searchSchemasWithQueryPageable(JdbcDataConnection connection, DataSource dataSource,
                                                            String schemaNamePattern, Pageable pageable) {
    Map<String, Object> databaseMap = new LinkedHashMap<>();

    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    int size = 20;
    int page = 0;
    if (pageable != null) {
      size = pageable.getPageSize();
      page = pageable.getPageNumber();
    }

    String schemaCountQuery = connection.getSchemaCountQuery(schemaNamePattern);
    String schemaListQuery = connection.getSearchSchemaQuery(schemaNamePattern, pageable);

    LOGGER.debug("Execute Schema Count query : {}", schemaCountQuery);
    LOGGER.debug("Execute Schema List query : {}", schemaListQuery);

    int databaseCount = 0;
    List<String> databaseNames = null;
    try {
      databaseCount = jdbcTemplate.queryForObject(schemaCountQuery, Integer.class);
      databaseNames = jdbcTemplate.query(schemaListQuery, (resultSet, i) -> resultSet.getString(1));
    } catch (Exception e) {
      LOGGER.error("Fail to get list of database : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of database : " + e.getMessage());
    }

    databaseMap.put("databases", databaseNames);
    databaseMap.put("page", createPageInfoMap(size, databaseCount, page));
    return databaseMap;
  }

  public Map<String, Object> searchSchemasWithQuery(JdbcDataConnection connection, DataSource dataSource,
                                                    String schemaNamePattern, Pageable pageable) {
    Map<String, Object> databaseMap = new LinkedHashMap<>();

    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    String schemaListQuery = connection.getSearchSchemaQuery(schemaNamePattern, null);

    LOGGER.debug("Execute Schema List query : {}", schemaListQuery);

    int databaseCount = 0;
    List<String> databaseNames = null;
    try {
      databaseNames = jdbcTemplate.query(schemaListQuery, (resultSet, i) -> resultSet.getString(1));
      databaseCount = databaseNames.size();
    } catch (Exception e) {
      LOGGER.error("Fail to get list of database : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of database : " + e.getMessage());
    }

    databaseMap.put("databases", databaseNames);
    databaseMap.put("page", createPageInfoMap(databaseCount, databaseCount, 0));
    return databaseMap;
  }

  public Map<String, Object> searchSchemasWithMetadata(JdbcDataConnection connection, DataSource dataSource,
                                                       String schemaNamePattern, Pageable pageable) {
    Map<String, Object> schemaMap = new LinkedHashMap<>();

    List<String> schemaNames = showSchemas(connection, dataSource);
    List<String> filteredList = null;

    if (StringUtils.isEmpty(schemaNamePattern)) {
      filteredList = schemaNames;
    } else {
      filteredList = schemaNames.stream()
                                .filter(schema -> StringUtils.containsIgnoreCase(schema, schemaNamePattern))
                                .collect(toList());
    }

    schemaMap.put("databases", filteredList);
    schemaMap.put("page", createPageInfoMap(filteredList.size(), filteredList.size(), 0));
    return schemaMap;
  }

  public Map<String, Object> searchDatabases(JdbcDataConnection connection,
                                             String databaseNamePattern, Pageable pageable) {
    return searchDatabases(connection, getDataSource(connection, true), databaseNamePattern, pageable);
  }

  public Map<String, Object> searchDatabases(JdbcDataConnection connection, DataSource dataSource,
                                             String databaseNamePattern, Pageable pageable) {
    if (
            connection instanceof MySQLConnection ||
            connection instanceof MssqlConnection) {
      return searchDatabasesWithQueryPageable(connection, dataSource, databaseNamePattern, pageable);
    } else if (connection instanceof PostgresqlConnection) {
      return searchDatabasesWithQueryPageable(connection, dataSource, databaseNamePattern, pageable);
    } else if (connection instanceof PhoenixConnection) {
      return searchDatabasesWithMetadata(connection, dataSource, databaseNamePattern, pageable);
    } else {
      return searchDatabasesWithMetadata(connection, dataSource, databaseNamePattern, pageable);
    }
  }

  public Map<String, Object> searchDatabasesWithQueryPageable(JdbcDataConnection connection, DataSource dataSource,
                                                              String databaseNamePattern, Pageable pageable) {
    Map<String, Object> databaseMap = new LinkedHashMap<>();

    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    int size = 20;
    int page = 0;
    if (pageable != null) {
      size = pageable.getPageSize();
      page = pageable.getPageNumber();
    }

    String databaseCountQuery = connection.getDataBaseCountQuery(databaseNamePattern);
    String databaseListQuery = connection.getSearchDataBaseQuery(databaseNamePattern, pageable);

    LOGGER.debug("Execute Database Count query : {}", databaseCountQuery);
    LOGGER.debug("Execute Database List query : {}", databaseListQuery);

    int databaseCount = 0;
    List<String> databaseNames = null;
    try {
      databaseCount = jdbcTemplate.queryForObject(databaseCountQuery, Integer.class);
      databaseNames = jdbcTemplate.query(databaseListQuery, (resultSet, i) -> resultSet.getString(1));
    } catch (Exception e) {
      LOGGER.error("Fail to get list of database : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of database : " + e.getMessage());
    }

    databaseMap.put("databases", databaseNames);
    databaseMap.put("page", createPageInfoMap(size, databaseCount, page));
    return databaseMap;
  }

  public Map<String, Object> searchDatabasesWithQuery(JdbcDataConnection connection, DataSource dataSource,
                                                      String databaseNamePattern, Pageable pageable) {
    Map<String, Object> databaseMap = new LinkedHashMap<>();

    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    String databaseListQuery = connection.getSearchDataBaseQuery(databaseNamePattern, null);

    LOGGER.debug("Execute Database List query : {}", databaseListQuery);

    int databaseCount = 0;
    List<String> databaseNames = null;
    try {
      databaseNames = jdbcTemplate.query(databaseListQuery, (resultSet, i) -> resultSet.getString(1));
      databaseCount = databaseNames.size();
    } catch (Exception e) {
      LOGGER.error("Fail to get list of database : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of database : " + e.getMessage());
    }

    int size = 20;
    int page = 0;
    if (pageable != null) {
      size = pageable.getPageSize();
      page = pageable.getPageNumber();
    }

    int fromIndex = Math.min(page * size, databaseNames.size());
    int toIndex = Math.min((page + 1) * size, databaseNames.size());

    databaseMap.put("databases", databaseNames.subList(fromIndex, toIndex));
    databaseMap.put("page", createPageInfoMap(size, databaseCount, page));

    return databaseMap;
  }

  public Map<String, Object> searchDatabasesWithMetadata(JdbcDataConnection connection, DataSource dataSource,
                                                         String databaseNamePattern, Pageable pageable) {
    Map<String, Object> databaseMap = new LinkedHashMap<>();
    List<String> databaseNames = showDatabases(connection, dataSource);

    List<String> filteredList = null;

    if (StringUtils.isEmpty(databaseNamePattern)) {
      filteredList = databaseNames;
    } else {
      filteredList = databaseNames.stream()
                                  .filter(database -> StringUtils.containsIgnoreCase(database, databaseNamePattern))
                                  .collect(toList());
    }

    databaseMap.put("databases", filteredList);
    databaseMap.put("page", createPageInfoMap(filteredList.size(), filteredList.size(), 0));
    return databaseMap;
  }

  private Map<String, Integer> createPageInfoMap(int size, int totalElements, int page) {
    Map<String, Integer> pageInfoMap = new HashMap<>();
    pageInfoMap.put("size", size);
    pageInfoMap.put("totalElements", totalElements);
    pageInfoMap.put("totalPages", (int) Math.ceil((double) totalElements / (double) size));
    pageInfoMap.put("number", page);
    return pageInfoMap;
  }

  public void changeDatabase(JdbcDataConnection connection, DataSource dataSource, String databaseName) {

    String useDatabaseQuery = connection.getUseDatabaseQuery(databaseName);

    if (StringUtils.isNotEmpty(useDatabaseQuery)) {
      JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

      LOGGER.debug("Execute Use Database query : {}", useDatabaseQuery);

      try {
        jdbcTemplate.execute(useDatabaseQuery);
      } catch (Exception e) {
        LOGGER.error("Fail to Use database : {}", e.getMessage());
        throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                              "Fail to Use database : " + e.getMessage());
      }
    } else {
      LOGGER.debug("Database Change Not Supported.");
    }
  }

  /**
   * JDBC Connection 데이터소스 가져오기
   */
  public DataSource getDataSource(JdbcDataConnection connection, boolean includeDatabase, String webSocketId) {

    DataSource dataSource;

    if (StringUtils.isNotEmpty(webSocketId)) {
      WorkbenchDataSource workbenchDataSource = WorkbenchDataSourceUtils.findDataSourceInfo(webSocketId);
      if (workbenchDataSource == null) {
        throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.WEBSOCKET_NOT_FOUND_ERROR_CODE,
                                              "Fail to find dataSource(" + webSocketId + ") for workbench");
      }
      dataSource = workbenchDataSource.getSingleConnectionDataSource();
    } else {
      dataSource = getDataSource(connection, includeDatabase);
    }
    return dataSource;
  }

  public DataSource getDataSource(JdbcDataConnection connection, boolean includeDatabase) {
    String username;
    String password;
    if (connection.getAuthenticationType() == DataConnection.AuthenticationType.USERINFO) {
      username = StringUtils.isEmpty(connection.getUsername())
          ? AuthUtils.getAuthUserName()
          : connection.getUsername();

      User user = cachedUserService.findUser(username);
      if (user == null) {
        throw new ResourceNotFoundException("User(" + username + ")");
      }
      password = user.getPassword();
    } else {
      username = connection.getUsername();
      password = connection.getPassword();
    }

    String connUrl = connection.makeConnectUrl(includeDatabase);

    DriverManagerDataSource driverManagerDataSource;
    if (connection instanceof HiveConnection && ((HiveConnection) connection).isKerberos()) {
      try {
        Configuration conf = new Configuration();
        conf.set("hadoop.security.authentication", "Kerberos");
        UserGroupInformation.setConfiguration(conf);

        String kerberosUser = StringUtils.isNotEmpty(username)
            ? username
            : ((HiveConnection) connection).getKerberosPrincipal();
        LOGGER.debug("kerberosUser : {}", kerberosUser);
        LOGGER.debug("keyTabPath : {}", keyTabPath);
        UserGroupInformation.loginUserFromKeytab(kerberosUser, keyTabPath);
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    Properties properties = new Properties();
    properties.setProperty("user", username);
    properties.setProperty("password", password);

    //ad native properties
    if(connection.getPropertiesMap() != null){
      for(String propertyKey : connection.getPropertiesMap().keySet()){
        if(StringUtils.startsWith(propertyKey, JdbcDataConnection.JDBC_PROPERTY_PREFIX)){
          String nativePropertyKey = StringUtils.replaceFirst(propertyKey, JdbcDataConnection.JDBC_PROPERTY_PREFIX + ".'", "");
          properties.setProperty(nativePropertyKey, connection.getPropertiesMap().get(propertyKey));
        }
      }
    }

    driverManagerDataSource = new DriverManagerDataSource(connUrl, properties);
    driverManagerDataSource.setDriverClassName(connection.getDriverClass());

    LOGGER.debug("Created datasource : {}", connUrl);

    return driverManagerDataSource;
  }

  public void closeConnection(Connection connection, Statement stmt, ResultSet rs) {
    JdbcUtils.closeResultSet(rs);
    JdbcUtils.closeStatement(stmt);
    JdbcUtils.closeConnection(connection);
  }

  public int writeResultSetToCSV(ResultSet resultSet, String tempCsvFilePath) throws SQLException{
    JdbcCSVWriter jdbcCSVWriter = null;
    int rowNumber = 0;
    try {
      jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(tempCsvFilePath), CsvPreference.STANDARD_PREFERENCE);
      jdbcCSVWriter.write(resultSet, false);
      rowNumber = jdbcCSVWriter.getRowNumber();
    } catch (IOException e) {
      LOGGER.error("writeResultSetToCSV error", e);
    } finally {
      try{
        if(jdbcCSVWriter != null)
          jdbcCSVWriter.close();
      }catch (IOException e){}
    }
    return rowNumber;
  }

  public List<Field> getFieldList(ResultSet rs, boolean extractColumnName) throws SQLException {
    ResultSetMetaData metaData = rs.getMetaData();

    int colNum = metaData.getColumnCount();

    List<Field> fields = Lists.newArrayList();
    for (int i = 1; i <= colNum; i++) {

      String columnName = metaData.getColumnName(i);
      String columnLabel = metaData.getColumnLabel(i);

      String fieldName;

      if(extractColumnName){
        fieldName = extractColumnName(metaData.getColumnLabel(i));
      } else {
        fieldName = removeDummyPrefixColumnName(metaData.getColumnLabel(i));
      }

      //useOldAliasMetadataBehavior=true
      if(metaData instanceof com.mysql.jdbc.ResultSetMetaData){
        String tableName = metaData.getTableName(i);
        fieldName = tableName + "." + fieldName;
      }

      String uniqueFieldName = generateUniqueColumnName(fieldName, fields);

      Field field = new Field();
      field.setName(fieldName);
      field.setAlias(uniqueFieldName);
      field.setType(DataType.jdbcToFieldType((metaData.getColumnType(i))));
      field.setRole(field.getType().toRole());
      fields.add(field);
    }
    return fields;
  }

  public List<Map<String, Object>> getDataList(ResultSet rs, List<Field> fields) throws SQLException {
    ResultSetMetaData metaData = rs.getMetaData();
    int colNum = metaData.getColumnCount();

    List<Map<String, Object>> dataList = Lists.newArrayList();
    while (rs.next()) {
      Map<String, Object> rowMap = Maps.newLinkedHashMap();
      for (int i = 1; i <= colNum; i++) {
        String fieldName = fields.get(i - 1).getName();
        //@TODO require Oracle JDBC configuartion
//        if (rs.getObject(i) instanceof TIMESTAMP) { // Oracle Timestamp Case
//          TIMESTAMP timestamp = (TIMESTAMP) rs.getObject(i);
//          rowMap.put(fieldName, timestamp.timestampValue().toString());
//        } else
        if (rs.getObject(i) instanceof Timestamp) {
          rowMap.put(fieldName, rs.getObject(i).toString());
        } else if (rs.getObject(i) instanceof PgArray || rs.getObject(i) instanceof PGobject) {
          rowMap.put(fieldName, rs.getObject(i).toString());
        } else if (rs.getObject(i) instanceof PrestoArray) {
          rowMap.put(fieldName, ((PrestoArray) rs.getObject(i)).getArray());
        } else {
          rowMap.put(fieldName, rs.getObject(i));
        }
      }
      dataList.add(rowMap);
    }
    return dataList;
  }

  public List<Map<String, Object>> getPartitionList(HiveMetastoreConnection connection, ConnectionRequest connectionRequest){
    HiveMetaStoreJdbcClient hiveMetaStoreJdbcClient = new HiveMetaStoreJdbcClient(
            connection.getMetastoreURL(),
            connection.getMetastoreUserName(),
            connection.getMetastorePassword(),
            connection.getMetastoreDriverName());

    List partitionInfoList = hiveMetaStoreJdbcClient.getPartitionList(connectionRequest.getDatabase(), connectionRequest.getQuery(), null);
    return partitionInfoList;
  }

  public List<Map<String, Object>> validatePartition(HiveMetastoreConnection connection, ConnectionRequest connectionRequest){
    HiveMetaStoreJdbcClient hiveMetaStoreJdbcClient = new HiveMetaStoreJdbcClient(
            connection.getMetastoreURL(),
            connection.getMetastoreUserName(),
            connection.getMetastorePassword(),
            connection.getMetastoreDriverName());

    List<String> partitionNameList = new ArrayList<>();
    for(Map<String, Object> partitionNameMap : connectionRequest.getPartitions()){
      partitionNameList.addAll(PolarisUtils.mapWithRangeExpressionToList(partitionNameMap));
    }
    //1. partition info 가져오기
    List<Map<String, Object>> partitionInfoList = new ArrayList<>();
    try{
      partitionInfoList = hiveMetaStoreJdbcClient.getPartitionList(connectionRequest.getDatabase(), connectionRequest.getQuery(), partitionNameList);
    } catch (Exception e){
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.PARTITION_NOT_EXISTED, e.getCause().getMessage());
    }

    //2. partition parameter가 모두 존재하는지 여부
    for(String partitionNameParam : partitionNameList){
      //must exist partition exclude asterisk
      boolean isPartitionExist = false;
      if(partitionNameParam.contains("{*}")){
        isPartitionExist = true;
      } else {
        for(Map<String, Object> existPartition : partitionInfoList){
          String existPartName = existPartition.get("PART_NAME").toString();
          if(partitionNameParam.equals(existPartName)){
            isPartitionExist = true;
            break;
          }
        }
      }

      if(!isPartitionExist)
        throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.PARTITION_NOT_EXISTED,
                "partition (" + partitionNameParam + ") is not exists in " + connectionRequest.getQuery() + ".");
    }

    if(partitionInfoList == null || partitionInfoList.isEmpty())
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.PARTITION_NOT_EXISTED,
              "partition is not exists in " + connectionRequest.getQuery() + ".");

    return partitionInfoList;
  }
}
