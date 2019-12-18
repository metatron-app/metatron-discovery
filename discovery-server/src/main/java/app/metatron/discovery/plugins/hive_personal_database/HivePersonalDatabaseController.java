package app.metatron.discovery.plugins.hive_personal_database;

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.datasource.DataSourceIngestionException;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workbench.WorkbenchRepository;
import app.metatron.discovery.plugins.hive_personal_database.dto.CreateTableInformation;
import app.metatron.discovery.plugins.hive_personal_database.dto.ImportFile;
import app.metatron.discovery.plugins.hive_personal_database.dto.ImportFilePreview;
import app.metatron.discovery.plugins.hive_personal_database.file.ImportCsvFileRowMapper;
import app.metatron.discovery.plugins.hive_personal_database.file.ImportExcelFileRowMapper;
import app.metatron.discovery.plugins.hive_personal_database.file.excel.ExcelTemplate;
import app.metatron.discovery.util.HibernateUtils;
import app.metatron.discovery.util.csv.CsvTemplate;
import com.google.common.collect.Maps;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
public class HivePersonalDatabaseController {

  private static Logger LOGGER = LoggerFactory.getLogger(HivePersonalDatabaseController.class);

  private WorkbenchRepository workbenchRepository;

  private HivePersonalDatabaseService hivePersonalDatabaseService;

  @Autowired
  public void setWorkbenchRepository(WorkbenchRepository workbenchRepository) {
    this.workbenchRepository = workbenchRepository;
  }

  @Autowired
  public void setHivePersonalDatabaseService(HivePersonalDatabaseService hivePersonalDatabaseService) {
    this.hivePersonalDatabaseService = hivePersonalDatabaseService;
  }

  @RequestMapping(value = "/api/plugins/hive-personal-database/workbenches/{id}/databases/{database}/tables", method = RequestMethod.POST)
  @ResponseBody
  public ResponseEntity<?> createTable(@PathVariable("id") String id,
                                       @PathVariable("database") String database,
                                       @RequestBody CreateTableInformation createTableInformation) {
    Workbench workbench = workbenchRepository.findOne(id);

    if(workbench == null) {
      throw new ResourceNotFoundException("Workbench(" + id + ")");
    }

    DataConnection dataConnection = HibernateUtils.unproxy(workbench.getDataConnection());
    createTableInformation.setDatabase(database);
    hivePersonalDatabaseService.createTable(dataConnection, createTableInformation);

    return ResponseEntity.noContent().build();
  }

  /**
   * 파일 업로드
   */
  @PostMapping("/api/plugins/hive-personal-database/file-upload")
  public Map<String, Object> uploadTempFile(@RequestParam("file") MultipartFile file) {
    // 파일명 가져오기
    String fileName = file.getOriginalFilename();

    // 파일명을 통해 확장자 정보 얻기
    String extensionType = FilenameUtils.getExtension(fileName).toLowerCase();

    // Upload 파일 처리
    String tempFileName = "TEMP_FILE_" + UUID.randomUUID().toString() + "." + extensionType;
    String tempFilePath = System.getProperty("java.io.tmpdir") + File.separator + tempFileName;

    Map<String, Object> responseMap = Maps.newHashMap();
    responseMap.put("filekey", tempFileName);
    responseMap.put("filePath", tempFilePath);

    try {
      File tempFile = new File(tempFilePath);
      file.transferTo(tempFile);
    } catch (IOException e) {
      LOGGER.error("Failed to upload file : {}", e.getMessage());
      throw new DataSourceIngestionException("Fail to upload file.", e.getCause());
    }

    return responseMap;
  }


  @RequestMapping(value = "/api/plugins/hive-personal-database/workbenches/{id}/import/files/{fileKey}/preview", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> previewImportFile(@PathVariable(value = "fileKey") String fileKey,
                                      @RequestParam(value = "sheet", required = false) String sheetName,
                                      @RequestParam(value = "lineSep", required = false, defaultValue = "\n") String lineSep,
                                      @RequestParam(value = "delimiter", required = false, defaultValue = ",") String delimiter,
                                      @RequestParam(value = "limit", required = false, defaultValue = "100") int limit,
                                      @RequestParam(value = "firstHeaderRow", required = false, defaultValue = "true") boolean firstHeaderRow) {
    ImportFilePreview preview = new ImportFilePreview();
    try {
      String filePath = System.getProperty("java.io.tmpdir") + File.separator + fileKey;

      File tempFile = new File(filePath);
      // 파일 확장자
      String extensionType = FilenameUtils.getExtension(fileKey);

      // 파일이 없을 경우
      if (!tempFile.exists()) {
        throw new BadRequestException("Invalid temporary file name.");
      }

      final int limitRows = firstHeaderRow ? limit + 1 : limit;

      if ("xlsx".equals(extensionType) || "xls".equals(extensionType)) {
        ExcelTemplate excelTemplate = new ExcelTemplate(new File(filePath));
        Map<Integer, String> headers = Maps.newTreeMap();
        List<Map<String, Object>> records =
            excelTemplate.getRows(sheetName, new ImportExcelFileRowMapper(headers, firstHeaderRow, excelTemplate.getFormulaEvaluator()), limitRows);

        List<String> fields = headers.values().stream().collect(Collectors.toList());
        preview.setFields(fields);
        preview.setRecords(records);
        preview.setSheets(excelTemplate.getSheetNames());

        final int totalRows = excelTemplate.getTotalRows(sheetName);
        preview.setTotalRecords(firstHeaderRow ? totalRows - 1 : totalRows);
      } else if ("csv".equals(extensionType)) {
        CsvTemplate csvTemplate = new CsvTemplate(tempFile);
        Map<Integer, String> headers = Maps.newTreeMap();

        List<Map<String, Object>> records =
            csvTemplate.getRows(lineSep, delimiter, new ImportCsvFileRowMapper(headers, firstHeaderRow), limitRows);

        List<String> fields = headers.values().stream().collect(Collectors.toList());
        preview.setFields(fields);
        preview.setRecords(records);
        final int totalRows = csvTemplate.getTotalRows(lineSep, delimiter);
        preview.setTotalRecords(firstHeaderRow ? totalRows - 1 : totalRows);

      } else {
        throw new BadRequestException("Invalid temporary file.");
      }

    } catch (Exception e) {
      LOGGER.error("Failed to parse file ({}) : {}", fileKey, e.getMessage());
      throw new DataSourceIngestionException("Fail to parse file.", e.getCause());
    }

    return ResponseEntity.ok(preview);
  }

  @RequestMapping(value = "/api/plugins/hive-personal-database/workbenches/{id}/databases/{database}/tables/import-file", method = RequestMethod.POST)
  @ResponseBody
  public ResponseEntity<?> createTableFromFile(@PathVariable("id") String id,
                                       @PathVariable("database") String database,
                                       @RequestBody ImportFile importFile) {
    Workbench workbench = workbenchRepository.findOne(id);

    if(workbench == null) {
      throw new ResourceNotFoundException("Workbench(" + id + ")");
    }

    importFile.setDatabaseName(database);
    DataConnection dataConnection = HibernateUtils.unproxy(workbench.getDataConnection());

    hivePersonalDatabaseService.importFileToDatabase(dataConnection, importFile);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(value = "/api/plugins/hive-personal-database/workbenches/{id}/databases/{database}/tables/{table}", method = RequestMethod.DELETE)
  @ResponseBody
  public ResponseEntity<?> deleteTable(@PathVariable("id") String id,
                                       @PathVariable("database") String database,
                                       @PathVariable("table") String table,
                                       @RequestParam(value = "webSocketId") String webSocketId) {
    Workbench workbench = workbenchRepository.findOne(id);

    if(workbench == null) {
      throw new ResourceNotFoundException("Workbench(" + id + ")");
    }

    DataConnection dataConnection = HibernateUtils.unproxy(workbench.getDataConnection());
    hivePersonalDatabaseService.deleteTable(dataConnection, database, table, webSocketId);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(value = "/api/plugins/hive-personal-database/workbenches/{id}/databases/{database}/tables/{table}", method = RequestMethod.PUT)
  @ResponseBody
  public ResponseEntity<?> renameTable(@PathVariable("id") String id,
                                       @PathVariable("database") String database,
                                       @PathVariable("table") String table,
                                       @RequestParam(value = "renameTable") String renameTable,
                                       @RequestParam(value = "webSocketId") String webSocketId) {
    Workbench workbench = workbenchRepository.findOne(id);

    if(workbench == null) {
      throw new ResourceNotFoundException("Workbench(" + id + ")");
    }

    DataConnection dataConnection = HibernateUtils.unproxy(workbench.getDataConnection());
    hivePersonalDatabaseService.renameTable(dataConnection, database, table, renameTable, webSocketId);

    return ResponseEntity.noContent().build();
  }
}
