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

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.supercsv.prefs.CsvPreference;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.audit.Audit;
import app.metatron.discovery.domain.audit.AuditRepository;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.DataConnectionRepository;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcCSVWriter;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceManager;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.util.HibernateUtils;
import app.metatron.discovery.util.HttpUtils;

@RepositoryRestController
public class QueryEditorController {

  private static Logger LOGGER = LoggerFactory.getLogger(QueryEditorController.class);

  @Autowired
  QueryEditorService queryEditorService;

  @Autowired
  QueryEditorRepository queryEditorRepository;

  @Autowired
  AuditRepository auditRepository;

  @Autowired
  DataConnectionRepository dataConnectionRepository;

  @Autowired
  JdbcConnectionService jdbcConnectionService;

  @Autowired
  private WorkbenchProperties workbenchProperties;

  @Autowired
  EntityManager entityManager;

  @Autowired
  WorkbenchDataSourceManager workbenchDataSourceManager;

  @RequestMapping(path = "/queryeditors/{id}/query/run", method = RequestMethod.POST)
  @ResponseBody
  public ResponseEntity<?> runQuery(@PathVariable("id") String id,
                               @RequestBody QueryRunRequest queryRunRequest) {

    //1. Parameter 확인

    //Request Param 확인
    String query = StringUtils.defaultString(queryRunRequest.getQuery());
    String webSocketId = StringUtils.defaultString(queryRunRequest.getWebSocketId());
    String database = StringUtils.defaultString(queryRunRequest.getDatabase());
//    int numRows = requestBody.getNumRows();

    LOGGER.debug("id : {}", id);
    LOGGER.debug("query : {}", query);
    LOGGER.debug("webSocketId : {}", webSocketId);
    LOGGER.debug("database : {}", database);
//    LOGGER.debug("numRows : {}", numRows);

    Assert.isTrue(!query.isEmpty(), "Parameter 'query' is empty.");
    Assert.isTrue(!webSocketId.isEmpty(), "Parameter 'webSocketId' is empty.");

    //QueryEditor Entity 확인
    QueryEditor queryEditor = queryEditorRepository.findOne(id);
    if(queryEditor == null){
      throw new ResourceNotFoundException("QueryEditor(" + id + ")");
    }

    //Connection Entity 확인
    Workbench workbench = queryEditor.getWorkbench();

    if(workbench == null){
      throw new ResourceNotFoundException("Workbench");
    }

    //Hibernate Proxy Initialize
    DataConnection dataConnection = HibernateUtils.unproxy(workbench.getDataConnection());
    if(dataConnection == null){
      throw new ResourceNotFoundException("DataConnection");
    }

    WorkbenchDataSource dataSourceInfo = workbenchDataSourceManager.findDataSourceInfo(webSocketId);
    if(dataSourceInfo == null){
      throw new WorkbenchException(WorkbenchErrorCodes.DATASOURCE_NOT_EXISTED, "DataSource for webSocket(" + webSocketId + ") is not existed.");
    }

    //2. 현재 실행중인 쿼리 상태 확인
    QueryStatus queryStatus = queryEditorService.getQueryStatus(webSocketId);
    if(queryStatus != null && queryStatus == QueryStatus.RUNNING) {
      //실행중일 경우 에러 메시지 Return
      throw new WorkbenchException(WorkbenchErrorCodes.QUERY_STATUS_ERROR_CODE, "Query is Running");
    }

    //3. 쿼리 실행 서비스 호출
    List<QueryResult> queryResults = queryEditorService.getQueryResult(queryEditor, dataConnection, workbench,
            query, webSocketId, database);


    //Hive Hook에서 Update할때 버전이 안맞아 업데이트 에러방지
    entityManager.clear();

    //4. 쿼리 결과를 나중에 복원하기 위해 저장
    saveQueryEditorResults(id, queryResults, queryRunRequest);

    //5. Audit에 쿼리 결과 저장 (Hive Audit Hook와 충돌 방지 하기 위해 Controller 레벨에서 수행함)
    for(QueryResult queryResult : queryResults){
      Audit.AuditStatus auditStatus = Audit.AuditStatus.valueOf(queryResult.getQueryResultStatus().toString());
      Audit audit = auditRepository.findOne(queryResult.getAuditId());
      audit.setStatus(auditStatus);
      audit.setElapsedTime(queryResult.getFinishDateTime().toDate().getTime() - queryResult.getStartDateTime().toDate().getTime());
      audit.setFinishTime(queryResult.getFinishDateTime());
      audit.setNumRows(queryResult.getNumRows());
      audit.setJobLog(queryResult.getMessage());
      audit.setQueryHistoryId(queryResult.getQueryHistoryId());
      auditRepository.saveAndFlush(audit);
    }

    return ResponseEntity.ok(queryResults);
  }

  private void saveQueryEditorResults(String queryEditorId, List<QueryResult> queryResults, QueryRunRequest queryRunRequest) {
    if(CollectionUtils.isNotEmpty(queryResults)) {
      try {
        // 이전에 entityManager를 clear 하기 때문에 변경 감지 기능을 사용하여 queryEditor 엔티티의 queryEditorResult 를 사용할 수 없음
        // 따라서 queryEditor를 다시 managed 상태로 하기 위해 재 조회
        QueryEditor queryEditor = queryEditorRepository.findOne(queryEditorId);

        if(queryRunRequest.isFirstRunInQueryEditor()) {
          queryEditor.clearQueryResults();
        }

        if(queryRunRequest.isRetryRun()) {
          if(queryResults.size() != 1) {
            throw new Exception("The queryResults must be one.");
          }
          QueryEditorResult queryEditorResult = queryEditor.getQueryResults().get(queryRunRequest.getRetryQueryResultOrder() - 1);

          queryEditorResult.setFilePath(queryResults.get(0).getCsvFilePath());
          queryEditorResult.setFields(queryResults.get(0).getFields());
          queryEditorResult.setNumRows(queryResults.get(0).getNumRows());
        } else {
          for(QueryResult queryResult : queryResults){
            queryEditor.addQueryResult(
                new QueryEditorResult(queryResult.getRunQuery(),
                    queryResult.getCsvFilePath(), queryResult.getFields(),
                    queryResult.getNumRows(), queryResult.getDefaultNumRows()));
          }
        }
      } catch(Exception e) {
        LOGGER.error("Fail to save Queryeditor's results", e);
      }
    }
  }

  @RequestMapping(path = "/queryeditors/{id}/query/cancel", method = RequestMethod.POST,
          produces = MediaType.APPLICATION_JSON_VALUE)
  @ResponseBody
  public ResponseEntity<?> cancelQuery(@PathVariable("id") String id,
                                       @RequestBody QueryRunRequest requestBody) {

    //Result Map
    Map<String, Object> returnMap = new HashMap<>();

    //1. Parameter 확인

    //Request Param 확인
    String webSocketId = StringUtils.defaultString(requestBody.getWebSocketId());

    LOGGER.debug("id : {}", id);
    LOGGER.debug("webSocketId : {}", webSocketId);

    Assert.isTrue(!webSocketId.isEmpty(), "Parameter 'webSocketId' is empty.");

    //2. 현재 실행중인 쿼리 상태 확인
    QueryStatus queryStatus = queryEditorService.getQueryStatus(webSocketId);
//    if(queryStatus == null || queryStatus != QueryStatus.RUNNING) {
//      //실행중일 경우 에러 메시지 Return
//      throw new WorkbenchException(WorkbenchErrorCodes.QUERY_STATUS_ERROR_CODE, "Query is Not Running");
//    }

    //QueryEditor Entity 확인
    QueryEditor queryEditor = queryEditorRepository.findOne(id);
    if(queryEditor == null){
      throw new ResourceNotFoundException("QueryEditor(" + id + ")");
    }

    //Workbench Entity 확인
    Workbench workbench = queryEditor.getWorkbench();
    if(workbench == null){
      throw new ResourceNotFoundException("Workbench");
    }

    //Connection Entity 확인
    //Hibernate Proxy Initialize
    DataConnection dataConnection = HibernateUtils.unproxy(workbench.getDataConnection());
    if(dataConnection == null){
      throw new ResourceNotFoundException("DataConnection");
    }

    queryEditorService.cancelQuery(dataConnection, webSocketId);

    return ResponseEntity.ok().build();
  }


  @RequestMapping(path = "/queryeditors/{id}/status", method = RequestMethod.POST)
  @ResponseBody
  public ResponseEntity<?> getStatus(@PathVariable("id") String id,
                                     @RequestBody QueryRunRequest requestBody) {

    //Request Param 확인
    String webSocketId = StringUtils.defaultString(requestBody.getWebSocketId());

    LOGGER.debug("id : {}", id);
    LOGGER.debug("webSocketId : {}", webSocketId);

    Assert.isTrue(!webSocketId.isEmpty(), "Parameter 'webSocketId' is empty.");

    //QueryEditor Entity 확인
    QueryEditor queryEditor = queryEditorRepository.findOne(id);
    if(queryEditor == null){
      throw new ResourceNotFoundException("QueryEditor(" + id + ")");
    }

    //2. 현재 실행중인 쿼리 상태 확인
    QueryStatus queryStatus = queryEditorService.getQueryStatus(webSocketId);

    if(queryStatus == null){
      throw new WorkbenchException(WorkbenchErrorCodes.DATASOURCE_NOT_EXISTED, "DataSource for webSocket(" + webSocketId + ") is not existed.");
    }
    return ResponseEntity.ok(queryStatus);
  }


  @RequestMapping(path = "/queryeditors/{id}/query/download", method = RequestMethod.POST,
          consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  public void downloadResultForm(@PathVariable("id") String id,
                                 @RequestParam Map<String, Object> requestParam,
                                 HttpServletResponse response) throws IOException {
    String query = (String) requestParam.get("query");
    String webSocketId = (String) requestParam.get("webSocketId");
    String connectionId = (String) requestParam.get("connectionId");
    String fileName = (String) requestParam.get("fileName");

    //1. 현재 실행중인 쿼리 상태 확인
    QueryStatus queryStatus = queryEditorService.getQueryStatus(webSocketId);
    if(queryStatus == null){
      throw new ResourceNotFoundException("WorkbenchDataSource For WebSocket(" + webSocketId + ")");
    } else if(queryStatus == QueryStatus.RUNNING) {
      //실행중일 경우 에러 메시지 Return
      throw new WorkbenchException(WorkbenchErrorCodes.QUERY_STATUS_ERROR_CODE, "Query is Running");
    }

    if(StringUtils.isEmpty(fileName)){
      fileName = "noname";
    }

    String csvPath = workbenchProperties.getTempCSVPath();
    String csvFilePath = csvPath + File.separator + fileName + "_" + Calendar.getInstance().getTime().getTime() + ".csv";

    createCSVFile(query, webSocketId, connectionId, fileName, csvFilePath);
    HttpUtils.downloadCSVFile(response, fileName, csvFilePath, "text/csv");
  }

  @RequestMapping(path = "/queryeditors/{id}/query/download", method = RequestMethod.POST,
          consumes = MediaType.APPLICATION_JSON_VALUE)
  @ResponseBody
  public void downloadResultJson(@PathVariable("id") String id,
                             @RequestBody Map<String, Object> requestBody,
                             HttpServletResponse response) throws IOException {
    String query = (String) requestBody.get("query");
    String webSocketId = (String) requestBody.get("webSocketId");
    String connectionId = (String) requestBody.get("connectionId");
    String fileName = (String) requestBody.get("fileName");

    if(StringUtils.isEmpty(fileName)){
      fileName = "noname";
    }

    String csvPath = workbenchProperties.getTempCSVPath();
    String csvFilePath = csvPath + File.separator + fileName + "_" + Calendar.getInstance().getTime().getTime() + ".csv";

    createCSVFile(query, webSocketId, connectionId, fileName, csvFilePath);
    HttpUtils.downloadCSVFile(response, fileName, csvFilePath, "text/csv; charset=utf-8");
  }

  private void createCSVFile(String query, String webSocketId,
                        String connectionId, String fileName, String csvFilePath) throws IOException{
    //Hibernate Proxy Initialize
    DataConnection dataConnection = dataConnectionRepository.findOne(connectionId);
    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(dataConnection);
    JdbcDialect jdbcDialect = jdbcDataAccessor.getDialect();

    if(dataConnection == null){
      throw new ResourceNotFoundException("DataConnection(" + connectionId + ")");
    }

    WorkbenchDataSource dataSourceInfo = workbenchDataSourceManager.findDataSourceInfo(webSocketId);
    if(dataSourceInfo == null){
      throw new WorkbenchException(WorkbenchErrorCodes.DATASOURCE_NOT_EXISTED, "DataSource for webSocket(" + webSocketId + ") is not existed.");
    }

    dataSourceInfo.setQueryStatus(QueryStatus.RUNNING);
    try{
      JdbcCSVWriter jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(csvFilePath), CsvPreference.STANDARD_PREFERENCE);
      jdbcCSVWriter.setJdbcDialect(jdbcDialect);
      jdbcCSVWriter.setConnection(dataSourceInfo.getPrimaryConnection());
      jdbcCSVWriter.setFetchSize(5000);
      jdbcCSVWriter.setMaxRow(1000000);
//      jdbcCSVWriter.setDataSourceInfo(dataSourceInfo);
      jdbcCSVWriter.setQuery(query);
      jdbcCSVWriter.setFileName(csvFilePath);
      jdbcCSVWriter.write();
    } catch(Exception e){
      LOGGER.error(e.getMessage());
      throw new WorkbenchException(WorkbenchErrorCodes.QUERY_STATUS_ERROR_CODE, "CSV Download Failed");
    } finally {
      dataSourceInfo.setQueryStatus(QueryStatus.IDLE);
      dataSourceInfo.setCurrentStatement(null);
    }

  }

  @RequestMapping(path = "/queryeditors/{id}/query/result", method = RequestMethod.POST)
  @ResponseBody
  public ResponseEntity<?> getResult(@PathVariable("id") String id,
                                    @RequestBody QueryResultRequest requestBody) {

    //Request Param 확인
    String csvFilePath = StringUtils.defaultString(requestBody.getCsvFilePath());
    List<Field> fieldList = requestBody.getFieldList();
    Integer pageSize = requestBody.getPageSize();
    Integer pageNumber = requestBody.getPageNumber();

    LOGGER.debug("id : {}", id);
    LOGGER.debug("csvFilePath : {}", csvFilePath);
    LOGGER.debug("fieldList : {}", fieldList);
    LOGGER.debug("pageSize : {}", pageSize);
    LOGGER.debug("pageNumber : {}", pageNumber);

    if(pageSize == null || pageSize <= 0){
      pageSize = workbenchProperties.getDefaultResultSize();
    }

    if(pageNumber == null || pageNumber < 0){
      pageNumber = 0;
    }

    Assert.isTrue(!csvFilePath.isEmpty(), "Parameter 'csvFilePath' is empty.");
    Assert.isTrue(!fieldList.isEmpty(), "Parameter 'fieldList' is empty.");
    Assert.isTrue(pageSize != null && pageSize > 0, "Parameter 'pageSize' is required.");
    Assert.isTrue(pageNumber != null && pageNumber >= 0, "Parameter 'pageNumber' is required.");

    String csvBaseDir = workbenchProperties.getTempCSVPath();
    if(!csvBaseDir.endsWith(File.separator)){
      csvBaseDir = csvBaseDir + File.separator;
    }
    String filePath = csvBaseDir + csvFilePath;

    List dataList = queryEditorService.readCsv(filePath, fieldList, pageNumber * pageSize, pageSize);

    return ResponseEntity.ok(dataList);
  }

  @RequestMapping(path = "/queryeditors/{id}/query/download/csv", method = RequestMethod.POST,
          consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  public void downloadCSVForm(@PathVariable("id") String id,
                              @RequestParam Map<String, Object> requestParam,
                              HttpServletResponse response) throws IOException {
    String csvFilePath = (String) requestParam.get("csvFilePath");
    String fileName = (String) requestParam.get("fileName");

    if(StringUtils.isEmpty(fileName)){
      fileName = "noname";
    }

    String csvBaseDir = workbenchProperties.getTempCSVPath();
    if(!csvBaseDir.endsWith(File.separator)){
      csvBaseDir = csvBaseDir + File.separator;
    }
    String filePath = csvBaseDir + csvFilePath;

    HttpUtils.downloadCSVFile(response, fileName, filePath, "text/csv");
  }

  @RequestMapping(path = "/queryeditors/{id}/query/download/csv", method = RequestMethod.POST,
          consumes = MediaType.APPLICATION_JSON_VALUE)
  @ResponseBody
  public void downloadCSVJson(@PathVariable("id") String id,
                              @RequestBody Map<String, Object> requestBody,
                              HttpServletResponse response) throws IOException {
    String csvFilePath = (String) requestBody.get("csvFilePath");
    String fileName = (String) requestBody.get("fileName");

    if(StringUtils.isEmpty(fileName)){
      fileName = "noname";
    }

    String csvBaseDir = workbenchProperties.getTempCSVPath();
    if(!csvBaseDir.endsWith(File.separator)){
      csvBaseDir = csvBaseDir + File.separator;
    }
    String filePath = csvBaseDir + csvFilePath;
    HttpUtils.downloadCSVFile(response, fileName, filePath, "text/csv; charset=utf-8");
  }

}
