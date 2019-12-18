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

package app.metatron.discovery.domain.workbench.hive;

import app.metatron.discovery.common.ConnectionConfigProperties;
import app.metatron.discovery.common.MetatronProperties;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.GlobalErrorCodes;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.workbench.WorkbenchErrorCodes;
import app.metatron.discovery.domain.workbench.WorkbenchException;
import app.metatron.discovery.domain.workbench.WorkbenchProperties;
import app.metatron.discovery.domain.workbench.dto.ImportCsvFile;
import app.metatron.discovery.domain.workbench.dto.ImportFile;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceManager;
import app.metatron.discovery.util.csv.CsvTemplate;
import com.google.common.collect.Maps;
import org.apache.commons.lang3.StringUtils;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkbenchHiveService {
  private static Logger LOGGER = LoggerFactory.getLogger(WorkbenchHiveService.class);

  @Autowired
  public WorkbenchDataSourceManager workbenchDataSourceManager;

  private DataTableHiveRepository dataTableHiveRepository;

  private WorkbenchProperties workbenchProperties;

  private JdbcConnectionService jdbcConnectionService;

  private MetatronProperties metatronProperties;

  private ConnectionConfigProperties connectionConfigProperties;

  @Autowired
  public void setWorkbenchProperties(WorkbenchProperties workbenchProperties) {
    this.workbenchProperties = workbenchProperties;
  }

  @Autowired
  public void setDataTableHiveRepository(DataTableHiveRepository dataTableHiveRepository) {
    this.dataTableHiveRepository = dataTableHiveRepository;
  }

  @Autowired
  public void setJdbcConnectionService(JdbcConnectionService jdbcConnectionService) {
    this.jdbcConnectionService = jdbcConnectionService;
  }

  @Autowired
  public void setMetatronProperties(MetatronProperties metatronProperties) {
    this.metatronProperties = metatronProperties;
  }

  @Autowired
  public void setConnectionConfigProperties(ConnectionConfigProperties connectionConfigProperties) {
    this.connectionConfigProperties = connectionConfigProperties;
  }

  public void importFileToPersonalDatabase(DataConnection hiveConnection, ImportFile importFile) {
    DataTable dataTable = convertUploadFileToDataTable(importFile);

    final String hivePersonalDataSourceName = hiveConnection.getPropertiesMap().get(HiveDialect.PROPERTY_KEY_PROPERTY_GROUP_NAME);
    HivePersonalDatasource hivePersonalDataSource = findHivePersonalDataSourceByName(hivePersonalDataSourceName);

    String hdfsDataFilePath = dataTableHiveRepository.saveToHdfs(hivePersonalDataSource, new Path(workbenchProperties.getTempDataTableHdfsPath()), dataTable, "");

    SavingHiveTable savingHiveTable = new SavingHiveTable();
    savingHiveTable.setTableName(importFile.getTableName());
    savingHiveTable.setDataTable(dataTable);
    savingHiveTable.setHdfsDataFilePath(hdfsDataFilePath);
    savingHiveTable.setWebSocketId(importFile.getWebSocketId());
    savingHiveTable.setLoginUserId(importFile.getLoginUserId());

    saveAsHiveTableFromHdfsDataTable(hiveConnection, hivePersonalDataSource, savingHiveTable);
  }

  private HivePersonalDatasource findHivePersonalDataSourceByName(String dataSourceName) {
    if(StringUtils.isEmpty(dataSourceName)) {
      LOGGER.error(String.format("Not found hive personal datasource name : %s", dataSourceName));
      throw new MetatronException(GlobalErrorCodes.DEFAULT_GLOBAL_ERROR_CODE, "Failed save as hive table.");
    }
    Map<String, String> findProperties = connectionConfigProperties.findPropertyGroupByName(dataSourceName);
    HivePersonalDatasource hivePersonalDatasource = new HivePersonalDatasource(findProperties);
    if(hivePersonalDatasource.isValidate()) {
      return hivePersonalDatasource;
    } else {
      LOGGER.error(String.format("Invalid hive personal datasource : %s", dataSourceName));
      throw new MetatronException(GlobalErrorCodes.DEFAULT_GLOBAL_ERROR_CODE, "Failed save as hive table.");
    }
  }

  private void saveAsHiveTableFromHdfsDataTable(DataConnection hiveConnection, HivePersonalDatasource hivePersonalDataSource, SavingHiveTable savingHiveTable) {
    String saveAsTableScript = generateSaveAsTableScript(hivePersonalDataSource, savingHiveTable);
    WorkbenchDataSource dataSourceInfo = workbenchDataSourceManager.findDataSourceInfo(savingHiveTable.getWebSocketId());

    Connection secondaryConnection = dataSourceInfo.getSecondaryConnection(hivePersonalDataSource.getAdminName(), hivePersonalDataSource.getAdminPassword());

    List<String> queryList = Arrays.asList(saveAsTableScript.split(";"));
    for (String query : queryList) {
      try {
        jdbcConnectionService.executeUpdate(hiveConnection, secondaryConnection, query);
      } catch(Exception e) {
        if(e.getMessage().indexOf("AlreadyExistsException") > -1) {
          throw new WorkbenchException(WorkbenchErrorCodes.TABLE_ALREADY_EXISTS, "Table already exists.");
        }
        throw new MetatronException(GlobalErrorCodes.DEFAULT_GLOBAL_ERROR_CODE, "Failed save as hive table.", e);
      }
    }
  }

  private String generateSaveAsTableScript(HivePersonalDatasource hivePersonalDataSource, SavingHiveTable savingHiveTable) {
    StringBuffer script = new StringBuffer();
    // 1. Create Database
    final String personalDatabaseName = String.format("%s_%s", hivePersonalDataSource.getPersonalDatabasePrefix(),
        HiveNamingRule.replaceNotAllowedCharacters(savingHiveTable.getLoginUserId()));
    script.append(String.format("CREATE DATABASE IF NOT EXISTS %s;", personalDatabaseName));

    // 2. Create Table
    List<String> fields = savingHiveTable.getDataTable().getFields();
    String storedDataFilePath = savingHiveTable.getHdfsDataFilePath();

    String columns = fields.stream().map(header -> {
      if(header.contains(".")) {
        return String.format("`%s`", header.substring(header.indexOf(".") + 1, header.length()));
      } else {
        return String.format("`%s`", header);
      }
    }).collect(Collectors.joining(" STRING, ", "", " STRING"));
    script.append(String.format("CREATE TABLE %s.%s (%s) ROW FORMAT DELIMITED FIELDS TERMINATED BY '\\001' LINES TERMINATED BY '\\n';",
        personalDatabaseName, savingHiveTable.getTableName(), columns));

    // 3. Load Data to Table
    script.append(String.format("LOAD DATA INPATH '%s' OVERWRITE INTO TABLE %s.%s;", storedDataFilePath, personalDatabaseName, savingHiveTable.getTableName()));

    LOGGER.info("Save as Hive Table Query : " + script.toString());
    return script.toString();
  }

  private DataTable convertUploadFileToDataTable(ImportFile importFile) {
    final String filePath = String.format("%s/%s", workbenchProperties.getTempCSVPath(), importFile.getUploadedFile());

    if(Files.notExists((Paths.get(filePath)))) {
      throw new BadRequestException(String.format("File not found : %s", filePath));
    }

    File uploadedFile = new File(filePath);
    if(importFile instanceof ImportCsvFile){
      return convertCsvFileToDataTable(uploadedFile, importFile.getFirstRowHeadColumnUsed(),
          ((ImportCsvFile)importFile).getDelimiter(), ((ImportCsvFile)importFile).getLineSep());
    } else {
      throw new BadRequestException("Not supported file type");
    }
  }

  private DataTable convertCsvFileToDataTable(File uploadedFile, Boolean firstRowHeadColumnUsed, String delimiter, String lineSep) {
    CsvTemplate csvTemplate = new CsvTemplate(uploadedFile);
    csvTemplate.setCsvMaxCharsPerColumn(metatronProperties.getCsvMaxCharsPerColumn());
    Map<Integer, String> headers = Maps.newTreeMap();
    List<Map<String, Object>> records = csvTemplate.getRows(lineSep, delimiter,
        (rowNumber, row) -> {
          if(rowNumber == 1) {
            if(firstRowHeadColumnUsed) {
              for (int i = 0; i < row.length; i++) {
                headers.put(i, row[i]);
              }
              return null;
            } else {
              for (int i = 0; i < row.length; i++) {
                headers.put(i, "col_" + (i + 1));
              }
            }
          }

          Map<String, Object> rowMap = Maps.newTreeMap();
          for (int i = 0; i < row.length; i++) {
            if (headers.containsKey(i)) {
              rowMap.put(headers.get(i), row[i]);
            }
          }

          return rowMap;
        });

    List<String> fields = headers.values().stream().collect(Collectors.toList());
    return new DataTable(fields, records);
  }
}
