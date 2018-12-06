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

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.GlobalErrorCodes;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.workbench.*;
import app.metatron.discovery.domain.workbench.dto.ImportCsvFile;
import app.metatron.discovery.domain.workbench.dto.ImportExcelFile;
import app.metatron.discovery.domain.workbench.dto.ImportFile;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceUtils;
import app.metatron.discovery.util.csv.CsvTemplate;
import app.metatron.discovery.util.excel.ExcelTemplate;
import com.google.common.collect.Maps;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkbenchHiveService {
  private static Logger LOGGER = LoggerFactory.getLogger(WorkbenchHiveService.class);

  private DataTableHiveRepository dataTableHiveRepository;

  private WorkbenchProperties workbenchProperties;

  private JdbcConnectionService jdbcConnectionService;

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

  public void importFileToPersonalDatabase(HiveConnection hiveConnection, ImportFile importFile) {
    DataTable dataTable = convertUploadFileToDataTable(importFile);

    String hdfsDataFilePath = dataTableHiveRepository.saveToHdfs(hiveConnection, new Path(workbenchProperties.getTempDataTableHdfsPath()), dataTable);

    SavingHiveTable savingHiveTable = new SavingHiveTable();
    savingHiveTable.setTableName(importFile.getTableName());
    savingHiveTable.setDataTable(dataTable);
    savingHiveTable.setHdfsDataFilePath(hdfsDataFilePath);
    savingHiveTable.setWebSocketId(importFile.getWebSocketId());
    savingHiveTable.setLoginUserId(importFile.getLoginUserId());
    saveAsHiveTableFromHdfsDataTable(hiveConnection, savingHiveTable);
  }

  private void saveAsHiveTableFromHdfsDataTable(HiveConnection hiveConnection, SavingHiveTable savingHiveTable) {
    String saveAsTableScript = generateSaveAsTableScript(hiveConnection, savingHiveTable);
    WorkbenchDataSource dataSourceInfo = WorkbenchDataSourceUtils.findDataSourceInfo(savingHiveTable.getWebSocketId());
    SingleConnectionDataSource secondaryDataSource = dataSourceInfo.getSecondarySingleConnectionDataSource();

    List<String> queryList = Arrays.asList(saveAsTableScript.split(";"));
    for (String query : queryList) {
      try {
        jdbcConnectionService.ddlQuery(hiveConnection, secondaryDataSource, query);
      } catch(Exception e) {
        if(e.getMessage().indexOf("AlreadyExistsException") > -1) {
          throw new WorkbenchException(WorkbenchErrorCodes.TABLE_ALREADY_EXISTS, "Table already exists.");
        }
        throw new MetatronException(GlobalErrorCodes.DEFAULT_GLOBAL_ERROR_CODE, "Failed save as hive table.", e);
      }
    }
  }

  private String generateSaveAsTableScript(HiveConnection hiveConnection, SavingHiveTable savingHiveTable) {
    StringBuffer script = new StringBuffer();
    // 1. Create Database
    final String personalDatabaseName = String.format("%s_%s", hiveConnection.getPropertiesMap().get(HiveConnection.PROPERTY_KEY_PERSONAL_DATABASE_PREFIX),
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
    if(Files.notExists((Paths.get(importFile.getFilePath())))) {
      throw new BadRequestException(String.format("File not found : %s", importFile.getFilePath()));
    }

    File uploadedFile = new File(importFile.getFilePath());
    if(importFile instanceof ImportCsvFile){
      return convertCsvFileToDataTable(uploadedFile, importFile.getFirstRowHeadColumnUsed(),
          ((ImportCsvFile)importFile).getDelimiter(), ((ImportCsvFile)importFile).getLineSep());
    } else if(importFile instanceof ImportExcelFile) {
      return convertExcelFileToDataTable(uploadedFile, ((ImportExcelFile)importFile).getSheetName(), importFile.getFirstRowHeadColumnUsed());
    } else {
      throw new BadRequestException("Not supported file type");
    }
  }

  private DataTable convertCsvFileToDataTable(File uploadedFile, Boolean firstRowHeadColumnUsed, String delimiter, String lineSep) {
    CsvTemplate csvTemplate = new CsvTemplate(uploadedFile, lineSep, delimiter);
    Map<Integer, String> headers = Maps.newTreeMap();
    List<Map<String, Object>> records = csvTemplate.getRows(
        new ImportCsvFileRowMapper(headers, firstRowHeadColumnUsed)
    );

    List<String> fields = headers.values().stream().collect(Collectors.toList());
    return new DataTable(fields, records);
  }

  private DataTable convertExcelFileToDataTable(File uploadedFile, String sheetName, Boolean firstRowHeadColumnUsed) {
    ExcelTemplate excelTemplate = null;
    try {
      excelTemplate = new ExcelTemplate(uploadedFile);
    } catch (IOException e) {
      throw new MetatronException("엑셀 오류,,,,");
    }

    Map<Integer, String> headers = Maps.newTreeMap();
    List<Map<String, Object>> records = excelTemplate.getRows(sheetName,
        new ImportExcelFileRowMapper(headers, firstRowHeadColumnUsed));

    List<String> fields = headers.values().stream().collect(Collectors.toList());
    return new DataTable(fields, records);
  }
}
