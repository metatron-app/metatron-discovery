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

package app.metatron.discovery.domain.dataconnection.accessor;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.pf4j.Extension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveTableInformation;
import app.metatron.discovery.domain.workbench.hive.HiveNamingRule;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.AbstractJdbcDataAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;
import app.metatron.discovery.util.AuthUtils;

import static java.util.stream.Collectors.toList;

@Extension
public class HiveDataAccessor extends AbstractJdbcDataAccessor {

  private static final Logger LOGGER = LoggerFactory.getLogger(HiveDataAccessor.class);

  private static final String TABLE_NAME_COLUMN = "tab_name";

  @Override
  public Map<String, Object> getDatabases(String catalog, String schemaPattern, Integer pageSize, Integer pageNumber) {
    Map<String, Object> databaseMap = super.getDatabases(catalog, schemaPattern, pageSize, pageNumber);

    List<String> databaseNames = (List) databaseMap.get("databases");
    //filter personal database
    String loginUserId = AuthUtils.getAuthUserName();
    if(StringUtils.isNotEmpty(loginUserId)
        && HiveDialect.isSupportSaveAsHiveTable(connectionInfo)) {
      databaseNames
          = filterOtherPersonalDatabases(databaseNames,
                                         connectionInfo.getPropertiesMap().get(HiveDialect.PROPERTY_KEY_PERSONAL_DATABASE_PREFIX),
                                         HiveNamingRule.replaceNotAllowedCharacters(loginUserId));
    }

    int databaseCount = databaseNames.size();
    databaseMap.put("databases", databaseNames);
    databaseMap.put("page", createPageInfoMap(databaseCount, databaseCount, 0));
    return databaseMap;
  }

  @Override
  public Map<String, Object> getTables(String catalog,
                                       String schemaPattern,
                                       String tableNamePattern,
                                       Integer pageSize,
                                       Integer pageNumber) {

    List<Map<String, Object>> tableNames = null;
    try {
      String tableListQuery
          = dialect.getTableQuery(connectionInfo, catalog, schemaPattern,
                                  tableNamePattern, getExcludeTables(), pageSize, pageNumber);
      LOGGER.debug("Execute Table List query : {}", tableListQuery);

      tableNames = this.executeQueryForList(this.getConnection(), tableListQuery, null);
    } catch (Exception e) {
      LOGGER.error("Fail to get list of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get list of database : " + e.getMessage());
    }

    tableNames.stream()
              .forEach(tableMap -> {
                tableMap.put("name", tableMap.get(TABLE_NAME_COLUMN));
                tableMap.remove(TABLE_NAME_COLUMN);
              });

    //exclude table
    List<String> excludeTables = getExcludeTables();
    if (excludeTables != null) {
      tableNames = tableNames.stream()
                             .filter(tableInfoMap -> excludeTables.indexOf(tableInfoMap.get("name").toString()) < 0)
                             .collect(toList());
    }

    Map<String, Object> databaseMap = new LinkedHashMap<>();
    if (StringUtils.isEmpty(tableNamePattern)) {
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

  @Override
  public Map<String, Object> showTableDescription(String catalog, String schema, String tableName) {

    Map<String, Object> tableInfoMap = null;
    try {
      tableInfoMap = new LinkedHashMap<>();
      HiveTableInformation hiveTableInformation
          = showHiveTableDescription(connectionInfo, catalog, schema, tableName, true);
      if (hiveTableInformation.getPartitionInformation() != null)
        tableInfoMap.putAll(hiveTableInformation.getPartitionInformation());
      if (hiveTableInformation.getDetailInformation() != null)
        tableInfoMap.putAll(hiveTableInformation.getDetailInformation());
      if (hiveTableInformation.getStorageInformation() != null)
        tableInfoMap.putAll(hiveTableInformation.getStorageInformation());
    } catch (Exception e) {
      LOGGER.error("Fail to get desc of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get desc of table : " + e.getMessage());
    }
    return tableInfoMap;
  }

  public HiveTableInformation showHiveTableDescription(JdbcConnectInformation connectionInfo,
                                                       String catalog, String schema, String tableName,
                                                       boolean includeInformationHeader) {

    String tableDescQuery = dialect.getTableDescQuery(connectionInfo, catalog, schema, tableName);
    LOGGER.debug("Execute Table Desc query : {}", tableDescQuery);

    HiveTableInformation hiveTableInformation = new HiveTableInformation();
    try {
      //Table 상세 정보 조회
      List<Map<String, Object>> tableDescList = this.executeQueryForList(this.getConnection(), tableDescQuery, null);

      boolean isInit = false;
      boolean isColumnInfo = true;
      boolean isPartitionInfo = false;
      boolean isDetailedInfo = false;
      boolean isStorageInfo = false;

      List<Field> fields = new ArrayList<>();
      Map<String, Object> partitionInfoMap = new LinkedHashMap<>();
      Map<String, Object> detailInfoMap = new LinkedHashMap<>();
      Map<String, Object> storageInfoMap = new LinkedHashMap<>();

      for (int rowCnt = 0; rowCnt < tableDescList.size(); ++rowCnt) {
        Map<String, Object> tableDescRow = tableDescList.get(rowCnt);
        String columnName = StringUtils.trim((String) tableDescRow.get("col_name"));
        String descType = StringUtils.trim((String) tableDescRow.get("data_type"));
        String descValue = StringUtils.trim((String) tableDescRow.get("comment"));

        //유의미한 row에 도달했는지 확인.
        if(!isInit){
          //ColumnName이 # col_name 이거나 3가지 값 모두 empty일 경우는 의미없는 Row
          if (columnName.equals("# col_name")) {
            continue;
          }
          if (StringUtils.isEmpty(columnName) && StringUtils.isEmpty(descType) && StringUtils.isEmpty(descValue)) {
            continue;
          }

          isInit = true;
        }

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
          field.setName(columnName);
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
    } catch (Exception e) {
      LOGGER.error("Fail to get desc of table : {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to get desc of table : " + e.getMessage());
    }

    return hiveTableInformation;
  }

  @Override
  public List<Map<String, Object>> getColumns(String catalog, String schemaPattern, String tableNamePattern, String columnNamePattern) {
    //use schema as catalog
    return super.getColumns(schemaPattern, schemaPattern, tableNamePattern, columnNamePattern);
  }

  private List<String> filterOtherPersonalDatabases(List<String> databases, String personalDatabasePrefix, String loginUserId) {
    final String personalDatabase = String.format("%s_%s", personalDatabasePrefix, loginUserId);

    if(CollectionUtils.isNotEmpty(databases)) {
      return databases.stream().filter(database -> {
        if (database.startsWith(personalDatabasePrefix + "_")) {
          if (database.equalsIgnoreCase(personalDatabase)) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      }).collect(Collectors.toList());
    } else {
      return Collections.emptyList();
    }
  }
}
