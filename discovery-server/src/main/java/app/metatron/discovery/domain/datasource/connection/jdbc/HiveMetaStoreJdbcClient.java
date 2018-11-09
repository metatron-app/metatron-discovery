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

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.util.Assert;

import javax.sql.DataSource;
import java.util.List;
import java.util.Map;


public class HiveMetaStoreJdbcClient {

  public HiveMetaStoreJdbcClient(DataSource dataSource){
    Assert.notNull(dataSource, "Hive DataSource must not be null");

    this.dataSource = dataSource;
    initial();
  }

  public HiveMetaStoreJdbcClient(String url, String userName, String password, String driverName){
    this.connectionURL = url;
    this.connectionUserName = userName;
    this.connectionPassword = password;
    this.connectionDriverName = driverName;
  }

  private static final Logger LOGGER = LoggerFactory.getLogger(HiveMetaStoreJdbcClient.class);

  private static final String CONNECTION_URL_PROP = "javax.jdo.option.ConnectionURL";
  private static final String CONNECTION_DRIVER_NAME_PROP = "javax.jdo.option.ConnectionDriverName";
  private static final String CONNECTION_USERNAME_PROP = "javax.jdo.option.ConnectionUserName";
  private static final String CONNECTION_PASSWORD_PROP = "javax.jdo.option.ConnectionPassword";

  private DataSource dataSource;
  private String connectionURL;
  private String connectionDriverName;
  private String connectionUserName;
  private String connectionPassword;

  private void initial(){
    JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

    Map<String, Object> connectionURLMap = jdbcTemplate.queryForMap("SET " + CONNECTION_URL_PROP);
    Map<String, Object> connectionDriverNameMap = jdbcTemplate.queryForMap("SET " + CONNECTION_DRIVER_NAME_PROP);
    Map<String, Object> connectionUserNameMap = jdbcTemplate.queryForMap("SET " + CONNECTION_USERNAME_PROP);
    Map<String, Object> connectionPasswordMap = jdbcTemplate.queryForMap("SET " + CONNECTION_PASSWORD_PROP);

    this.connectionURL = getValueFromPropertyMap(connectionURLMap, CONNECTION_URL_PROP);
    this.connectionDriverName = getValueFromPropertyMap(connectionDriverNameMap, CONNECTION_DRIVER_NAME_PROP);
    this.connectionUserName = getValueFromPropertyMap(connectionUserNameMap, CONNECTION_USERNAME_PROP);
    this.connectionPassword = getValueFromPropertyMap(connectionPasswordMap, CONNECTION_PASSWORD_PROP);

    LOGGER.debug(this.toString());

    if(!StringUtils.containsIgnoreCase(connectionURL, "mysql")){
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.HIVE_METASTORE_ERROR_CODE,
              "Hive Metastore is not MySQL");
    }

    if(StringUtils.isEmpty(connectionDriverName)){
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.HIVE_METASTORE_ERROR_CODE,
              "Hive Metastore Connection Driver is not set");
    }
  }

  private String getValueFromPropertyMap(Map<String, Object> propertyMap, String property){
    String valueStr = (String) propertyMap.get("set");
    if(StringUtils.containsIgnoreCase(valueStr, property + "=")){
      return valueStr.replaceAll(property + "=", "");
    } else {
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.HIVE_METASTORE_ERROR_CODE,
              property + " is not valid.");
    }
  }

  private DataSource getDataSource(){
    DriverManagerDataSource driverManagerDataSource =
            new DriverManagerDataSource(this.connectionURL, this.connectionUserName, this.connectionPassword);
    driverManagerDataSource.setDriverClassName(this.connectionDriverName);
    return driverManagerDataSource;
  }

  public List<Map<String, Object>> getTable(String databaseName, String tableNamePattern, String columnNamePattern,
                               Pageable pageable){

    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT DISTINCT t.TBL_NAME name, t.TBL_TYPE type, tp.PARAM_VALUE comment");
    builder.append(" FROM DBS d ");
    builder.append("   JOIN TBLS t ON t.DB_ID = d.DB_ID ");
    builder.append("   JOIN SDS s ON t.SD_ID = s.SD_ID ");
    builder.append("   JOIN COLUMNS_V2 c ON c.CD_ID = s.CD_ID ");
    builder.append("   LEFT JOIN TABLE_PARAMS tp ON t.TBL_ID = tp.TBL_ID AND tp.param_key = 'comment' ");
    builder.append(" WHERE 1=1 ");
    builder.append("   AND CONVERT(d.NAME USING UTF8) = '" + databaseName + "' ");
    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append("   AND ( ");
      builder.append("     CONVERT(t.TBL_NAME USING UTF8) LIKE '%" + tableNamePattern + "%' ");
      builder.append("     OR CONVERT(tp.PARAM_VALUE USING UTF8) LIKE '%" + tableNamePattern + "%' ");
      if(StringUtils.isNotEmpty(columnNamePattern)){
        builder.append("   OR CONVERT(COLUMN_NAME USING UTF8) LIKE '%" + columnNamePattern + "%' ");
        builder.append("   OR CONVERT(COMMENT USING UTF8) LIKE '%" + columnNamePattern + "%' ");
      }
      builder.append("   ) ");
    }
    builder.append(" ORDER BY t.TBL_NAME");
    if(pageable != null){
      builder.append(" LIMIT " + (pageable.getPageNumber() * pageable.getPageSize()) + ", " + pageable.getPageSize());
    }

    String selectQuery = builder.toString();

    JdbcTemplate jdbcTemplate = new JdbcTemplate(getDataSource());

    List<Map<String, Object>> tableMapList = jdbcTemplate.queryForList(selectQuery);

    return tableMapList;
  }

  public int getTableCount(String databaseName, String tableNamePattern, String columnNamePattern){
    StringBuilder builder = new StringBuilder();
    builder.append(" SELECT COUNT(DISTINCT t.TBL_NAME) AS COUNT");
    builder.append(" FROM DBS d ");
    builder.append("   JOIN TBLS t ON t.DB_ID = d.DB_ID ");
    builder.append("   JOIN SDS s ON t.SD_ID = s.SD_ID ");
    builder.append("   JOIN COLUMNS_V2 c ON c.CD_ID = s.CD_ID ");
    builder.append("   LEFT JOIN TABLE_PARAMS tp ON t.TBL_ID = tp.TBL_ID AND tp.param_key = 'comment' ");
    builder.append(" WHERE 1=1 ");
    builder.append("   AND CONVERT(d.NAME USING UTF8) = '" + databaseName + "' ");
    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append("   AND ( ");
      builder.append("     CONVERT(t.TBL_NAME USING UTF8) LIKE '%" + tableNamePattern + "%' ");
      builder.append("     OR CONVERT(tp.PARAM_VALUE USING UTF8) LIKE '%" + tableNamePattern + "%' ");
      if(StringUtils.isNotEmpty(columnNamePattern)){
        builder.append("   OR CONVERT(c.COLUMN_NAME USING UTF8) LIKE '%" + columnNamePattern + "%' ");
        builder.append("   OR CONVERT(c.COMMENT USING UTF8) LIKE '%" + columnNamePattern + "%' ");
      }
      builder.append("   ) ");
    }

    String countQuery = builder.toString();

    JdbcTemplate jdbcTemplate = new JdbcTemplate(getDataSource());
    Map<String, Object> tableCountMap = jdbcTemplate.queryForMap(countQuery);
    long tableCount = tableCountMap.containsKey("COUNT") ? (long) tableCountMap.get("COUNT") : 0L;
    return Math.toIntExact(tableCount);
  }

  public List<Map<String, Object>> getColumns(String databaseName, String tableName, String columnNamePattern){
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT DISTINCT COLUMN_NAME, TYPE_NAME, COMMENT ");
    builder.append(" FROM COLUMNS_V2 c ");
    builder.append("   JOIN SDS s ON c.CD_ID = s.SD_ID ");
    builder.append("   JOIN TBLS t ON t.SD_ID = s.SD_ID ");
    builder.append("   JOIN DBS d ON t.DB_ID = d.DB_ID ");
    builder.append(" WHERE 1=1 ");
    builder.append("   AND CONVERT(d.NAME USING UTF8) = '" + databaseName + "' ");
    builder.append("   AND CONVERT(t.TBL_NAME USING UTF8) LIKE '" + tableName + "' ");
    if(StringUtils.isNotEmpty(columnNamePattern)){
      builder.append("   AND ( ");
      builder.append("     CONVERT(c.COLUMN_NAME USING UTF8) LIKE '%" + columnNamePattern + "%' ");
      builder.append("     OR CONVERT(c.COMMENT USING UTF8) LIKE '%" + columnNamePattern + "%' ");
      builder.append("   ) ");
    }
    builder.append(" ORDER BY t.TBL_NAME");

    JdbcTemplate jdbcTemplate = new JdbcTemplate(getDataSource());
    return jdbcTemplate.queryForList(builder.toString());
  }

  public List<Map<String, Object>> getPartitionList(String databaseName, String tableName, List<String> partitionNameList){
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT A.PART_ID, B.PART_NAME, A.NUM_ROWS, A.TOTAL_SIZE, B.CREATE_TIME ");
    builder.append(" FROM ");
    builder.append("   (SELECT PART_ID, ");
    builder.append("           (SELECT PARAM_VALUE FROM PARTITION_PARAMS WHERE PARAM_KEY = 'numRows' AND PART_ID = T1.PART_ID) AS NUM_ROWS, ");
    builder.append("           (SELECT PARAM_VALUE FROM PARTITION_PARAMS WHERE PARAM_KEY = 'totalSize' AND PART_ID = T1.PART_ID) AS TOTAL_SIZE ");
    builder.append("    FROM PARTITION_PARAMS AS T1 ");
    builder.append("    WHERE T1.PART_ID IN ");
    builder.append("      (SELECT PART_ID ");
    builder.append("       FROM PARTITIONS ");
    builder.append("       WHERE TBL_ID = ");
    builder.append("         (SELECT A.TBL_ID ");
    builder.append("          FROM TBLS AS A, DBS AS B ");
    builder.append("          WHERE A.DB_ID = B.DB_ID ");
    builder.append("          AND B.NAME = '" + databaseName + "' ");
    builder.append("          AND A.TBL_NAME = '" + tableName + "' ");
    builder.append("          ) ");
    builder.append("       ) ");
    builder.append("    GROUP BY PART_ID ) AS A, ");
    if(partitionNameList != null && !partitionNameList.isEmpty()){
      builder.append("   (  ");
      builder.append("     SELECT *  ");
      builder.append("     FROM PARTITIONS ");
      builder.append("     WHERE ");
      for(int i = 0; i < partitionNameList.size(); ++i){
        String partitionName = partitionNameList.get(i);

        if(i > 0)
          builder.append("   OR ");

        //like statement for blank partition
        if(partitionName.contains("{*}")){
          builder.append("   PART_NAME LIKE '" + StringUtils.substring(partitionName, 0, partitionName.indexOf("{*}")) + "%'");
        } else {
          builder.append("   PART_NAME = '" + partitionName + "'");
        }
      }
      builder.append("   ) AS B ");
    } else {
      builder.append("   PARTITIONS AS B ");
    }
    builder.append(" WHERE A.PART_ID = B.PART_ID ");
    builder.append(" ORDER BY B.CREATE_TIME DESC ");

//    SELECT
//            PART_ID,
//            PART_NAME,
//    SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(PART_NAME, '/', 1), '/', -1), '=', -1) AS YM,
//    SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(PART_NAME, '/', 2), '/', -1), '=', -1) AS DD
//    FROM PARTITIONS
//    WHERE TBL_ID = '3';

    System.out.println("builder.toString() = " + builder.toString());
    JdbcTemplate jdbcTemplate = new JdbcTemplate(getDataSource());
    List<Map<String, Object>> partitionInfoList = jdbcTemplate.queryForList(builder.toString());
    return partitionInfoList;
  }

  @Override
  public String toString(){
    return "HiveMetaStoreConnection{\n"
            + "connectionURL = '" + connectionURL + "'\n"
            + ", connectionDriverName = '" + connectionDriverName + "'\n"
            + ", connectionUserName = '" + connectionUserName + "'\n"
            + ", connectionPassword = '" + connectionPassword + "'\n"
            + "}";
  }
}
