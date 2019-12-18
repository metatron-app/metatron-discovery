package app.metatron.discovery.plugins.hive_personal_database;

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
import app.metatron.discovery.domain.workbench.hive.DataTable;
import app.metatron.discovery.domain.workbench.hive.DataTableHiveRepository;
import app.metatron.discovery.domain.workbench.hive.HivePersonalDatasource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceManager;
import app.metatron.discovery.plugins.hive_personal_database.dto.*;
import app.metatron.discovery.plugins.hive_personal_database.file.ImportExcelFileRowMapper;
import app.metatron.discovery.plugins.hive_personal_database.file.excel.ExcelTemplate;
import app.metatron.discovery.plugins.hive_personal_database.script.AbstractSaveAsTableScriptGenerator;
import app.metatron.discovery.plugins.hive_personal_database.script.SaveAsDefaultTableScriptGenerator;
import app.metatron.discovery.plugins.hive_personal_database.script.SaveAsPartitionTableScriptGenerator;
import app.metatron.discovery.plugins.hive_personal_database.script.ScriptGenerator;
import app.metatron.discovery.util.csv.CsvTemplate;
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
public class HivePersonalDatabaseService {
  private static Logger LOGGER = LoggerFactory.getLogger(HivePersonalDatabaseService.class);

  private WorkbenchDataSourceManager workbenchDataSourceManager;

  private DataTableHiveRepository dataTableHiveRepository;

  private WorkbenchProperties workbenchProperties;

  private JdbcConnectionService jdbcConnectionService;

  private MetatronProperties metatronProperties;

  private JdbcConnectionService connectionService;

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
  public void setConnectionService(JdbcConnectionService connectionService) {
    this.connectionService = connectionService;
  }

  @Autowired
  public void setConnectionConfigProperties(ConnectionConfigProperties connectionConfigProperties) {
    this.connectionConfigProperties = connectionConfigProperties;
  }

  @Autowired
  public void setWorkbenchDataSourceManager(WorkbenchDataSourceManager workbenchDataSourceManager) {
    this.workbenchDataSourceManager = workbenchDataSourceManager;
  }

  public void importFileToDatabase(DataConnection hiveConnection, ImportFile importFile) {
    final DataTable dataTable = convertUploadFileToDataTable(importFile);

    final String hivePersonalDataSourceName = hiveConnection.getPropertiesMap().get(HiveDialect.PROPERTY_KEY_PROPERTY_GROUP_NAME);
    HivePersonalDatasource hivePersonalDataSource = findHivePersonalDataSourceByName(hivePersonalDataSourceName);

    if(importFile.isTableOverwrite()) {
      validateTableSchema(hiveConnection, importFile.getDatabaseName(), importFile.getTableName(), dataTable.getFields());
    }

    final String savedHDFSDataFilePath = dataTableHiveRepository.saveToHdfs(hivePersonalDataSource, new Path(workbenchProperties.getTempDataTableHdfsPath()), dataTable, importFile.getTablePartitionColumn());

    SavingHiveTable savingHiveTable = new SavingHiveTable(importFile, savedHDFSDataFilePath, dataTable);
    saveAsHiveTableFromHdfsDataTable(importFile.getWebSocketId(), hiveConnection, hivePersonalDataSource, savingHiveTable);
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

  private void validateTableSchema(DataConnection hiveConnection, String database, String table, List<String> fields) {
    List<Map<String, Object>> columns = connectionService.getTableColumnNames(hiveConnection, null, database, table, null, null);
    List<String> columnNames = columns.stream().map(col -> (String)col.get("columnName")).collect(Collectors.toList());

    columnNames.forEach(col -> {
      if(fields.contains(col) == false) {
        throw new WorkbenchException(WorkbenchErrorCodes.TABLE_SCHEMA_DOES_NOT_MATCH, "Table schema does not match.");
      }
    });
  }

  private void saveAsHiveTableFromHdfsDataTable(String webSocketId, DataConnection hiveConnection, HivePersonalDatasource hivePersonalDataSource, SavingHiveTable savingHiveTable) {
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
    Connection secondaryConnection = dataSourceInfo.getSecondaryConnection(hivePersonalDataSource.getAdminName(), hivePersonalDataSource.getAdminPassword());

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
        new ImportExcelFileRowMapper(headers, firstRowHeadColumnUsed, excelTemplate.getFormulaEvaluator()));

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

  public void createTable(DataConnection dataConnection, CreateTableInformation createTableInformation) {
    // TODO 개인 데이터베이스가 아니면 권한 체크...
    ScriptGenerator scriptGenerator = new ScriptGenerator();
    String createTableScript = scriptGenerator.generateCreateTable(createTableInformation);
    LOGGER.info("Generated Create Hive Table script : " + createTableScript);

    final String hivePersonalDataSourceName = dataConnection.getPropertiesMap().get(HiveDialect.PROPERTY_KEY_PROPERTY_GROUP_NAME);
    HivePersonalDatasource hivePersonalDataSource = findHivePersonalDataSourceByName(hivePersonalDataSourceName);

    WorkbenchDataSource dataSourceInfo = workbenchDataSourceManager.findDataSourceInfo(createTableInformation.getWebSocketId());
    Connection secondaryConnection = dataSourceInfo.getSecondaryConnection(hivePersonalDataSource.getAdminName(), hivePersonalDataSource.getAdminPassword());

    List<String> queryList = Arrays.asList(createTableScript.split(";"));
    for (String query : queryList) {
      try {
        jdbcConnectionService.executeUpdate(dataConnection, secondaryConnection, query);
      } catch(Exception e) {
        if(e.getMessage().indexOf("AlreadyExistsException") > -1) {
          throw new WorkbenchException(WorkbenchErrorCodes.TABLE_ALREADY_EXISTS, "Table already exists.");
        }
        throw new MetatronException(GlobalErrorCodes.DEFAULT_GLOBAL_ERROR_CODE, "Failed create hive table.", e);
      }
    }
  }

  public void deleteTable(DataConnection dataConnection, String database, String table, String webSocketId) {
    final String query = String.format("DROP TABLE IF EXISTS %s.%s", database, table);

    final String hivePersonalDataSourceName = dataConnection.getPropertiesMap().get(HiveDialect.PROPERTY_KEY_PROPERTY_GROUP_NAME);
    HivePersonalDatasource hivePersonalDataSource = findHivePersonalDataSourceByName(hivePersonalDataSourceName);

    WorkbenchDataSource dataSourceInfo = workbenchDataSourceManager.findDataSourceInfo(webSocketId);
    Connection secondaryConnection = dataSourceInfo.getSecondaryConnection(hivePersonalDataSource.getAdminName(), hivePersonalDataSource.getAdminPassword());
    try {
      jdbcConnectionService.executeUpdate(dataConnection, secondaryConnection, query);
    } catch(Exception e) {
      throw new MetatronException(GlobalErrorCodes.DEFAULT_GLOBAL_ERROR_CODE, "Failed delete hive table.", e);
    }
  }

  public void renameTable(DataConnection dataConnection, String database, String table, String renameTable, String webSocketId) {
    final String query = String.format("ALTER TABLE %s.%s RENAME TO %s.%s", database, table, database, renameTable);

    final String hivePersonalDataSourceName = dataConnection.getPropertiesMap().get(HiveDialect.PROPERTY_KEY_PROPERTY_GROUP_NAME);
    HivePersonalDatasource hivePersonalDataSource = findHivePersonalDataSourceByName(hivePersonalDataSourceName);

    WorkbenchDataSource dataSourceInfo = workbenchDataSourceManager.findDataSourceInfo(webSocketId);
    Connection secondaryConnection = dataSourceInfo.getSecondaryConnection(hivePersonalDataSource.getAdminName(), hivePersonalDataSource.getAdminPassword());
    try {
      jdbcConnectionService.executeUpdate(dataConnection, secondaryConnection, query);
    } catch(Exception e) {
      throw new MetatronException(GlobalErrorCodes.DEFAULT_GLOBAL_ERROR_CODE, "Failed rename hive table.", e);
    }
  }
}
