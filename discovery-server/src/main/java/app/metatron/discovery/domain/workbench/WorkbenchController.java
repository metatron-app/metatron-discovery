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

package app.metatron.discovery.domain.workbench;

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.accessor.HiveDataAccessor;
import app.metatron.discovery.domain.dataconnection.dialect.HiveDialect;
import app.metatron.discovery.domain.datasource.DataSourceIngestionException;
import app.metatron.discovery.domain.workbench.dto.ImportFile;
import app.metatron.discovery.domain.workbench.dto.ImportFilePreview;
import app.metatron.discovery.domain.workbench.hive.WorkbenchHiveService;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceManager;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.util.HibernateUtils;
import app.metatron.discovery.util.csv.CsvTemplate;
import app.metatron.discovery.util.excel.ExcelTemplate;
import com.google.common.collect.Maps;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RepositoryRestController
public class WorkbenchController {

  private static Logger LOGGER = LoggerFactory.getLogger(WorkbenchController.class);

  @Autowired
  WorkbenchRepository workbenchRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  WorkbenchHiveService workbenchHiveService;

  @Autowired
  WorkbenchDataSourceManager workbenchDataSourceManager;

  @RequestMapping(value = "/workbenchs/{id}/navigation", method = RequestMethod.GET, produces = "application/json")
  @ResponseBody
  public ResponseEntity<?> listNavigation(@PathVariable("id") String id,
                                          @RequestParam(required=false) String namePattern,
                                          Pageable pageable,
                                          PersistentEntityResourceAssembler resourceAssembler) {

    Workbench workbench = workbenchRepository.findOne(id);
    if(workbench == null){
      throw new ResourceNotFoundException("Workbench(" + id + ")");
    }
    Workspace workspace = workbench.getWorkspace();
    if(workspace == null){
      throw new ResourceNotFoundException("Workspace");
    }
    Page<Workbench> workbenches = workbenchRepository.findByWorkspaceIdAndNameIgnoreCaseContaining(workspace.getId(),
            StringUtils.defaultString(namePattern, ""), pageable);
    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(workbenches, resourceAssembler));
  }

  @RequestMapping(value = "/workbenchs/connection", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> currentConnection() {
    Map<String, WorkbenchDataSource> dataSourceMap = workbenchDataSourceManager.getCurrentConnections();
    return ResponseEntity.ok(dataSourceMap);
  }

  @RequestMapping(value = "/workbenchs/{id}/import/files", method = RequestMethod.POST)
  @ResponseBody
  public ResponseEntity<?> importFileToPersonalDatabase(@PathVariable("id") String id,
                                                        @RequestBody ImportFile importFile) {
    Workbench workbench = workbenchRepository.findOne(id);

    if(workbench == null) {
      throw new ResourceNotFoundException("Workbench(" + id + ")");
    }

    DataConnection dataConnection = HibernateUtils.unproxy(workbench.getDataConnection());

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(dataConnection);

    if((jdbcDataAccessor instanceof HiveDataAccessor) == false ||
        HiveDialect.isSupportSaveAsHiveTable(dataConnection) == false) {
      throw new BadRequestException("Only Hive Connection supported save as hive table is allowed.");
    }

    workbenchHiveService.importFileToDatabase(dataConnection, importFile);

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(value = "/workbenchs/{id}/import/files/{fileKey}/preview", method = RequestMethod.GET)
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
            excelTemplate.getRows(sheetName, new ImportExcelFileRowMapper(headers, firstHeaderRow), limitRows);

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

}
