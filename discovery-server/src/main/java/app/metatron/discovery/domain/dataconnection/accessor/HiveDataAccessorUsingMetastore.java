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

import org.pf4j.Extension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveMetaStoreJdbcClient;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;
import app.metatron.discovery.util.PolarisUtils;

import static java.util.stream.Collectors.toList;

@Extension
public class HiveDataAccessorUsingMetastore extends HiveDataAccessor {

  private static final Logger LOGGER = LoggerFactory.getLogger(HiveDataAccessorUsingMetastore.class);

  private static final String TABLE_NAME_COLUMN = "tab_name";

  @Override
  public Map<String, Object> getTables(String catalog,
                                       String schemaPattern,
                                       String tableNamePattern,
                                       Integer pageSize,
                                       Integer pageNumber) {
    HiveMetaStoreJdbcClient hiveMetaStoreJdbcClient = this.getHiveMetaStoreJdbcClient();

    if(pageSize == null){
      pageSize = 5000;
    }

    if(pageNumber == null){
      pageNumber = 0;
    }

    List<Map<String, Object>> tableNames
        = hiveMetaStoreJdbcClient.getTable(schemaPattern, tableNamePattern, null, pageSize, pageNumber);
    Integer tableCount = hiveMetaStoreJdbcClient.getTableCount(schemaPattern, tableNamePattern, null);

    //exclude table
    List<String> excludeTables = getExcludeTables();
    if (excludeTables != null) {
      tableNames = tableNames.stream()
                             .filter(tableInfoMap -> excludeTables.indexOf(tableInfoMap.get("name").toString()) < 0)
                             .collect(toList());
    }

    Map<String, Object> databaseMap = new LinkedHashMap<>();
    databaseMap.put("tables", tableNames);
    databaseMap.put("page", createPageInfoMap(pageSize, tableCount, pageNumber));
    return databaseMap;
  }

  @Override
  public List<Map<String, Object>> getColumns(String catalog, String schemaPattern, String tableNamePattern, String columnNamePattern) {
    HiveMetaStoreJdbcClient hiveMetaStoreJdbcClient = this.getHiveMetaStoreJdbcClient();
    return hiveMetaStoreJdbcClient.getColumns(schemaPattern, tableNamePattern, columnNamePattern);
  }

  public List<Map<String, Object>> getPartitionList(String database, String table) {
    HiveMetaStoreJdbcClient hiveMetaStoreJdbcClient = this.getHiveMetaStoreJdbcClient();
    List partitionInfoList = hiveMetaStoreJdbcClient.getPartitionList(database, table, null);
    return partitionInfoList;
  }

  public List<Map<String, Object>> validatePartition(String database, String table, List<Map<String, Object>> partitions) {
    HiveMetaStoreJdbcClient hiveMetaStoreJdbcClient = this.getHiveMetaStoreJdbcClient();

    List<String> partitionNameList = new ArrayList<>();
    for (Map<String, Object> partitionNameMap : partitions) {
      partitionNameList.addAll(PolarisUtils.mapWithRangeExpressionToList(partitionNameMap));
    }
    //1. partition info 가져오기
    List<Map<String, Object>> partitionInfoList = new ArrayList<>();
    try {
      partitionInfoList = hiveMetaStoreJdbcClient.getPartitionList(database, table, partitionNameList);
    } catch (Exception e) {
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.PARTITION_NOT_EXISTED, e.getCause().getMessage());
    }

    //2. partition parameter가 모두 존재하는지 여부
    for (String partitionNameParam : partitionNameList) {
      //must exist partition exclude asterisk
      boolean isPartitionExist = false;
      if (partitionNameParam.contains("{*}")) {
        isPartitionExist = true;
      } else {
        for (Map<String, Object> existPartition : partitionInfoList) {
          String existPartName = existPartition.get("PART_NAME").toString();
          if (partitionNameParam.equals(existPartName)) {
            isPartitionExist = true;
            break;
          }
        }
      }

      if (!isPartitionExist)
        throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.PARTITION_NOT_EXISTED,
                                              "partition (" + partitionNameParam + ") is not exists in " + table + ".");
    }

    if (partitionInfoList == null || partitionInfoList.isEmpty())
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.PARTITION_NOT_EXISTED,
                                            "partition is not exists in " + table + ".");

    return partitionInfoList;
  }

  private HiveMetaStoreJdbcClient getHiveMetaStoreJdbcClient(){
    String metastoreConnectionUrl = ((HiveDialect) dialect).makeMetastoreConnectUrl(connectionInfo);
    String metastoreDriverClass = ((HiveDialect) dialect).getMetastoreDriverClass(connectionInfo);

    Map<String, String> propMap = connectionInfo.getPropertiesMap();
    String metastoreUsername = propMap.get(HiveDialect.PROPERTY_KEY_METASTORE_USERNAME);
    String metastorePassword = propMap.get(HiveDialect.PROPERTY_KEY_METASTORE_PASSWORD);

    HiveMetaStoreJdbcClient hiveMetaStoreJdbcClient = new HiveMetaStoreJdbcClient(
        metastoreConnectionUrl,
        metastoreUsername,
        metastorePassword,
        metastoreDriverClass);
    return hiveMetaStoreJdbcClient;
  }
}
