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

import app.metatron.discovery.common.MetatronProperties;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.GlobalErrorCodes;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.workbench.ImportExcelFileRowMapper;
import app.metatron.discovery.domain.workbench.WorkbenchErrorCodes;
import app.metatron.discovery.domain.workbench.WorkbenchException;
import app.metatron.discovery.domain.workbench.WorkbenchProperties;
import app.metatron.discovery.domain.workbench.dto.ImportCsvFile;
import app.metatron.discovery.domain.workbench.dto.ImportExcelFile;
import app.metatron.discovery.domain.workbench.dto.ImportFile;
import app.metatron.discovery.domain.workbench.hive.scriptgenerator.AbstractSaveAsTableScriptGenerator;
import app.metatron.discovery.domain.workbench.hive.scriptgenerator.SaveAsDefaultTableScriptGenerator;
import app.metatron.discovery.domain.workbench.hive.scriptgenerator.SaveAsPartitionTableScriptGenerator;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceManager;
import app.metatron.discovery.util.csv.CsvTemplate;
import app.metatron.discovery.util.excel.ExcelTemplate;
import com.google.common.collect.Maps;
import org.apache.commons.lang3.StringUtils;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
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

  private JdbcConnectionService connectionService;

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
  public void setConnectionService(JdbcConnectionService connectionService) {
    this.connectionService = connectionService;
  }

  public void importFileToDatabase(DataConnection hiveConnection, ImportFile importFile) {
    final DataTable dataTable = convertUploadFileToDataTable(importFile);

    if(importFile.isTableOverwrite()) {
      validateTableSchema(hiveConnection, importFile.getDatabaseName(), importFile.getTableName(), dataTable.getFields());
    }

    final String savedHDFSDataFilePath = dataTableHiveRepository.saveToHdfs(hiveConnection, new Path(workbenchProperties.getTempDataTableHdfsPath()), dataTable);

    SavingHiveTable savingHiveTable = new SavingHiveTable(importFile, savedHDFSDataFilePath, dataTable);
    saveAsHiveTableFromHdfsDataTable(importFile.getWebSocketId(), hiveConnection, savingHiveTable);
  }

  private void validateTableSchema(DataConnection hiveConnection, String database, String table, List<String> fields) {
    List<Map<String, Object>> columns = connectionService.getTableColumnNames(hiveConnection, null, database, table, null, null);
    List<String> columnNames = columns.stream().map(col -> (String)col.get("columnName")).collect(Collectors.toList());

    columnNames.forEach(col -> {
      if(fields.contains(col) == false) {
        throw new WorkbenchException(WorkbenchErrorCodes.TABLE_SCHEMA_DOES_NOT_MATCH, "Table schema does not match.");
      }
    });
  }

  private void saveAsHiveTableFromHdfsDataTable(String webSocketId, DataConnection hiveConnection, SavingHiveTable savingHiveTable) {
    if(savingHiveTable.isTableOverwrite()) {
      final String tablePartitionColumn = findTablePartitionColumn(hiveConnection, savingHiveTable.getDatabaseName(), savingHiveTable.getTableName());
      if(StringUtils.isNotEmpty(tablePartitionColumn)) {
        savingHiveTable.setTablePartitionColumn(tablePartitionColumn);
      }
    }

    AbstractSaveAsTableScriptGenerator tableScriptGenerator;
    if(savingHiveTable.isPartitioningTable()) {
      tableScriptGenerator = new SaveAsPartitionTableScriptGenerator(savingHiveTable);
    } else {
      tableScriptGenerator = new SaveAsDefaultTableScriptGenerator(savingHiveTable);
    }
    final String saveAsTableScript = tableScriptGenerator.generate();
    LOGGER.info("Generated Save as Hive Table script : " + saveAsTableScript);

    WorkbenchDataSource dataSourceInfo = workbenchDataSourceManager.findDataSourceInfo(webSocketId);
    Connection secondaryConnection = dataSourceInfo.getSecondaryConnection();

    List<String> queryList = Arrays.asList(saveAsTableScript.split(";"));
    for (String query : queryList) {
      try {
        jdbcConnectionService.executeUpdate(hiveConnection, secondaryConnection, query);
      } catch(Exception e) {

        String rollbackScript = tableScriptGenerator.rollbackScript();
        if(StringUtils.isNotEmpty(rollbackScript)) {
          List<String> rollbackQueries = Arrays.asList(rollbackScript.split(";"));
          rollbackQueries.forEach(rollbackQuery -> {
            try {
              jdbcConnectionService.executeUpdate(hiveConnection, secondaryConnection, rollbackQuery);
            } catch(Exception re) {
              LOGGER.error("rollback error", re);
            }
          });
        }

        if(e.getMessage().indexOf("AlreadyExistsException") > -1) {
          throw new WorkbenchException(WorkbenchErrorCodes.TABLE_ALREADY_EXISTS, "Table already exists.");
        }
        throw new MetatronException(GlobalErrorCodes.DEFAULT_GLOBAL_ERROR_CODE, "Failed save as hive table.", e);
      }
    }
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

  private DataTable convertExcelFileToDataTable(File uploadedFile, String sheetName, Boolean firstRowHeadColumnUsed) {
    ExcelTemplate excelTemplate = null;
    try {
      excelTemplate = new ExcelTemplate(uploadedFile);
    } catch (IOException e) {
      throw new MetatronException("Invalid Excel file");
    }

    Map<Integer, String> headers = Maps.newTreeMap();
    List<Map<String, Object>> records = excelTemplate.getRows(sheetName,
        new ImportExcelFileRowMapper(headers, firstRowHeadColumnUsed));

    List<String> fields = headers.values().stream().collect(Collectors.toList());
    return new DataTable(fields, records);
  }

  private String findTablePartitionColumn(DataConnection dataConnection, String database, String table) {
    Map<String, Object> tableInfoMap = connectionService.showTableDescription(dataConnection, null, database, table);

    boolean partitionInfoStartFlag = false;
    String partitionColumn = "";
    for ( Map.Entry<String, Object> entry : tableInfoMap.entrySet() ) {
      if(entry.getKey().contains("# Partition Information")) {
        partitionInfoStartFlag = true;
        continue;
      }

      if(partitionInfoStartFlag == true) {
        partitionColumn = entry.getKey();
        break;
      }
    }

    return partitionColumn;
  }

}
