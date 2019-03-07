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

package app.metatron.discovery.domain.mdm;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleAfterSave;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeDelete;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceService;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveTableInformation;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.mdm.source.MetaSourceService;
import app.metatron.discovery.domain.mdm.source.MetadataSource;
import app.metatron.discovery.domain.storage.StorageProperties;

/**
 * Created by kyungtaak on 2016. 5. 13..
 */
@RepositoryEventHandler(Metadata.class)
public class MetadataEventHandler {

  @Autowired
  MetaSourceService metaSourceService;

  @Autowired
  DataSourceService dataSourceService;

  @Autowired
  JdbcConnectionService jdbcConnectionService;

  @Autowired
  EngineProperties engineProperties;

  @Autowired
  StorageProperties storageProperties;

  @HandleBeforeCreate
  public void handleBeforeCreate(Metadata metadata) {

    MetadataSource metadataSource = metadata.getSource();

    if (metadataSource.getType() == Metadata.SourceType.ENGINE) {

      // Check engine datasource info.
      if (StringUtils.isEmpty(metadataSource.getSourceId())) {
        throw new IllegalArgumentException("DataSource info. required.");
      }

      DataSource originalDataSource = (DataSource) metaSourceService
          .getSourcesBySourceId(metadataSource.getType(), metadataSource.getSourceId());

      if (CollectionUtils.isNotEmpty(metadata.getColumns())) {
        // 전달 받은 Column 정보와 실제 데이터 소스내 데이터가 일치하는지 확인
        Map<String, Field> metaFieldMap = originalDataSource.getMetaFieldMap();
        for (MetadataColumn metadataColumn : metadata.getColumns()) {
          String physicalName = metadataColumn.getPhysicalName();
          String physicalType = metadataColumn.getPhysicalType();
          if (metaFieldMap.containsKey(physicalName)) {
            DataType dataType = metaFieldMap.get(physicalName).getType();
            if (!physicalType.equals(dataType.name())) {
              throw new IllegalArgumentException("Invalid physical column type. original type is '"
                                                     + dataType.name() + "' but '" + physicalName);
            }
          } else {
            throw new IllegalArgumentException("Invalid physical column name : " + physicalName);
          }

        }
      } else {
        // 자동으로 데이터 소스내 필드 정보를 column 정보로 매핑함
        for (Field field : originalDataSource.getFields()) {
          metadata.addColumn(new MetadataColumn(field, metadata));
        }
      }

    } else if (metadataSource.getType() == Metadata.SourceType.JDBC) {

      // Check jdbc connection info.
      if (StringUtils.isEmpty(metadataSource.getSourceId())) {
        throw new IllegalArgumentException("DataConnection info. required.");
      }

      JdbcDataConnection jdbcDataConnection = (JdbcDataConnection) metaSourceService
          .getSourcesBySourceId(metadataSource.getType(), metadataSource.getSourceId());
      String schema = metadataSource.getSchema();
      String tableName = metadataSource.getTable();

      if (jdbcDataConnection instanceof HiveConnection) {
        HiveTableInformation hiveTableInformation =
            jdbcConnectionService.showHiveTableDescription(jdbcDataConnection,
                                                           schema, tableName, false);

        //Column 목록 저장하기
        for (Field field : hiveTableInformation.getFields()) {
          metadata.addColumn(new MetadataColumn(field, metadata));
        }

        //Detail 정보 저장하기
        Map<String, Object> detailInfo = new HashMap<>();
        detailInfo.put("Detail Information", hiveTableInformation.getDetailInformation());
        detailInfo.put("Storage Information", hiveTableInformation.getStorageInformation());
        detailInfo.put("Partition Information", hiveTableInformation.getPartitionInformation());
        detailInfo.put("Partition Fields", hiveTableInformation.getPartitionFields());

        metadataSource.setSourceInfo(GlobalObjectMapper.writeValueAsString(detailInfo));
      } else {
        List<Map<String, Object>> columns = jdbcConnectionService.showTableColumns(jdbcDataConnection, schema, tableName);
        for (Map<String, Object> column : columns) {
          MetadataColumn metadataColumn = new MetadataColumn();
          metadataColumn.setName((String) column.get("columnName"));
          metadataColumn.setPhysicalName((String) column.get("columnName"));
          metadataColumn.setPhysicalType((String) column.get("columnType"));
          metadataColumn.setDescription((String) column.get("columnComment"));
          metadataColumn.setMetadata(metadata);
          metadata.addColumn(metadataColumn);
        }
      }
    } else if (metadataSource.getType() == Metadata.SourceType.STAGEDB) {

      String schema = metadataSource.getSchema();
      String tableName = metadataSource.getTable();

      StorageProperties.StageDBConnection stageDBConnection = storageProperties.getStagedb();

      if (stageDBConnection == null) {
        throw new IllegalArgumentException("Staging Hive DB info. required.");
      }

      HiveConnection hiveConnection = new HiveConnection();
      hiveConnection.setUrl(stageDBConnection.getUrl());
      hiveConnection.setHostname(stageDBConnection.getHostname());
      hiveConnection.setPort(stageDBConnection.getPort());
      hiveConnection.setUsername(stageDBConnection.getUsername());
      hiveConnection.setPassword(stageDBConnection.getPassword());

      HiveTableInformation hiveTableInformation =
          jdbcConnectionService.showHiveTableDescription(hiveConnection,
                                                         schema, tableName, false);

      //Column 목록 저장하기
      for (Field field : hiveTableInformation.getFields()) {
        metadata.addColumn(new MetadataColumn(field, metadata));
      }

      //Detail 정보 저장하기
      Map<String, Object> detailInfo = new HashMap<>();
      detailInfo.put("Detail Information", hiveTableInformation.getDetailInformation());
      detailInfo.put("Storage Information", hiveTableInformation.getStorageInformation());
      detailInfo.put("Partition Information", hiveTableInformation.getPartitionInformation());
      detailInfo.put("Partition Fields", hiveTableInformation.getPartitionFields());

      metadataSource.setSourceInfo(GlobalObjectMapper.writeValueAsString(detailInfo));

    } else {
      throw new IllegalArgumentException("Not support source type.");
    }
  }

  @HandleAfterCreate
  public void handleAfterCreate(Metadata metadata) {
  }

  @HandleAfterSave
  public void handleAfterSave(Metadata metadata) {

    // Sync with datasource
    if (metadata.getSourceType() == Metadata.SourceType.ENGINE) {
      dataSourceService.updateFromMetadata(metadata, false);
    }
  }

  @HandleBeforeDelete
  public void handleBeforeDelete(Metadata metadata) {
  }
}
