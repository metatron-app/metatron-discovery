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

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.audit.Audit;
import app.metatron.discovery.domain.audit.AuditRepository;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceUtils;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.WebSocketUtils;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.Select;
import net.sf.jsqlparser.util.TablesNamesFinder;
import org.apache.commons.lang3.StringUtils;
import org.apache.hive.jdbc.HiveStatement;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.supercsv.cellprocessor.Optional;
import org.supercsv.cellprocessor.*;
import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvMapReader;
import org.supercsv.io.ICsvMapReader;
import org.supercsv.prefs.CsvPreference;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static app.metatron.discovery.domain.workbench.WorkbenchErrorCodes.CSV_FILE_NOT_FOUND;

@Service
public class QueryEditorService {

  private static Logger LOGGER = LoggerFactory.getLogger(QueryEditorService.class);

  @Autowired
  private WorkbenchProperties workbenchProperties;

  @Autowired
  private QueryHistoryRepository queryHistoryRepository;

  @Autowired
  private AuditRepository auditRepository;

  @Autowired
  private JdbcConnectionService jdbcConnectionService;

  @Autowired
  public SimpMessageSendingOperations messagingTemplate;

  public QueryStatus getQueryStatus(String webSocketId) {
    WorkbenchDataSource dataSourceInfo = WorkbenchDataSourceUtils.findDataSourceInfo(webSocketId);
    return dataSourceInfo == null ? null : dataSourceInfo.getQueryStatus();
  }

  public List<QueryResult> getQueryResult(
          QueryEditor queryEditor, JdbcDataConnection jdbcDataConnection,
          Workbench workbench, String query, String webSocketId) {

    return getQueryResult(queryEditor, jdbcDataConnection, workbench, query, webSocketId, null, 0);
  }

  public List<QueryResult> getQueryResult(
          QueryEditor queryEditor, JdbcDataConnection jdbcDataConnection,
          Workbench workbench, String query, String webSocketId, String databaseName, int numRows) {
    List<QueryResult> queryResults = new ArrayList<>();

    //1. 쿼리 목록으로 변환
    List<String> queryList = getSubstitutedQueryList(query, workbench);

    //2. 순차적 Query 실행
    //DataSource
    WorkbenchDataSource dataSourceInfo = WorkbenchDataSourceUtils.findDataSourceInfo(webSocketId);
    if(dataSourceInfo == null){
      throw new ResourceNotFoundException("WorkbenchDataSource(webSocketId = " + webSocketId + ")");
    }
    dataSourceInfo.setQueryList(queryList);

    int queryIndex = 0;
    while(!queryList.isEmpty()){
      String substitutedQuery = queryList.remove(0);

      boolean saveToTempTable = jdbcDataConnection instanceof HiveConnection;
      saveToTempTable = false;

      //Query History 선저장
      QueryHistory queryHistory = new QueryHistory();
      queryHistory.setQueryEditor(queryEditor);
      queryHistory.setQuery(substitutedQuery);
      queryHistory.setDataConnectionId(jdbcDataConnection.getId());
      queryHistory.setDatabaseName(databaseName);
      queryHistoryRepository.saveAndFlush(queryHistory);
      LOGGER.debug("QueryHistory Created : " + queryHistory.getId());
      Long queryHistoryId = queryHistory.getId();

      //Audit 저장
      Audit audit = new Audit();
      audit.setDataConnectionId(jdbcDataConnection.getId());
      audit.setDataConnectionHostName(jdbcDataConnection.getHostname());
      audit.setDataConnectionPort(jdbcDataConnection.getPort());
      audit.setDataConnectionDatabase(databaseName);
      audit.setDataConnectionConnectUrl(jdbcDataConnection.getConnectUrl());
      audit.setDataConnectionImplementor(jdbcDataConnection.getImplementor());
      audit.setJobName(substitutedQuery);
      audit.setQuery(substitutedQuery);
      audit.setType(Audit.AuditType.QUERY);
      audit.setQueryHistoryId(queryHistory.getId());
      audit.setStartTime(DateTime.now());
      audit.setUser(AuthUtils.getAuthUserName());
      auditRepository.saveAndFlush(audit);
      String auditId = audit.getId();

      LOGGER.debug("Audit Created : " + auditId);

      QueryResult queryResult = executeQuery(dataSourceInfo, substitutedQuery, workbench.getId(), webSocketId, jdbcDataConnection,
              queryHistoryId, auditId, saveToTempTable, numRows, queryIndex, queryEditor.getId());
      queryResults.add(queryResult);

      //increase query index
      queryIndex++;
    }

    dataSourceInfo.setQueryStatus(QueryStatus.IDLE);

    //3. Query History Update
    for(QueryResult queryResult : queryResults){
      QueryHistory queryHistory = queryHistoryRepository.getOne(queryResult.getQueryHistoryId());
      queryHistory.setQueryEditor(queryEditor);
      queryHistory.setQuery(queryResult.getRunQuery());
      queryHistory.setQueryFinishTime(queryResult.getFinishDateTime());
      queryHistory.setQueryStartTime(queryResult.getStartDateTime());
      queryHistory.setQueryResultStatus(queryResult.getQueryResultStatus());
      queryHistory.setQueryTimeTaken(queryResult.getFinishDateTime().toDate().getTime() - queryResult.getStartDateTime().toDate().getTime());
      queryHistory.setDataConnectionId(jdbcDataConnection.getId());
      queryHistory.setDatabaseName(databaseName);
      queryHistory.setQueryLog(queryResult.getMessage());
      queryHistory.setNumRows(queryResult.getNumRows());
      queryHistoryRepository.saveAndFlush(queryHistory);

//        Audit.AuditStatus auditStatus;
//        if(queryResult.getQueryResultStatus() == QueryResult.QueryResultStatus.SUCCESS){
//          auditStatus = Audit.AuditStatus.SUCCESS;
//        } else {
//          auditStatus = Audit.AuditStatus.FAIL;
//        }
//        Audit audit = auditRepository.getOne(queryResult.getAuditId());
//        audit.setStatus(auditStatus);
//        audit.setElapsedTime(queryHistory.getQueryTimeTaken());
//        audit.setFinishTime(queryResult.getFinishDateTime());
//        audit.setNumRows(queryResult.getNumRows());
//        auditRepository.saveAndFlush(audit);
    }

    return queryResults;
  }

  public List<String> getSubstitutedQueryList(String queryStr, Workbench workbench) {
    List<String> returnList = new ArrayList<>();

    //1. semicolon split
    List<String> queryList = Arrays.asList(queryStr.split(";"));


    //2. GlobalVar replace
    HashMap<String, String> globalVarMap = getGlobalVarMap(workbench);

    for(String query : queryList){
      //if trimmed query is empty...continue..
      if(query.trim().isEmpty()){
        continue;
      }

      LOGGER.debug("query = {}", query);

      //start with carriage return remove
      String substitutedQuery = StringUtils.trim(query);
      String globalVarPatternStr = "[$]\\{(.*?)\\}";
      Pattern globalVarPattern = Pattern.compile(globalVarPatternStr);
      Matcher globalVarMatcher = globalVarPattern.matcher(query);

      LOGGER.debug("GlobalVar Matcher Founded = {}", globalVarMatcher.groupCount() );
      while (globalVarMatcher.find()) {
        String globalVar = globalVarMatcher.group();          //${var1}
        String globalVarNameStr = globalVarMatcher.group(1);  //var1
        LOGGER.debug("Globalvar Founded Group = {}", globalVar );

        if(globalVarMap.containsKey(globalVarNameStr)){
          LOGGER.debug("GlobalVarMap Containas {}", globalVarNameStr );
          LOGGER.debug("query replace {} -> {}", globalVar, globalVarMap.get(globalVarNameStr) );
          substitutedQuery = substitutedQuery.replaceAll(Pattern.quote(globalVar), globalVarMap.get(globalVarNameStr));
        }
      }

      returnList.add(substitutedQuery);
    }

    return returnList;
  }

  private HashMap<String, String> getGlobalVarMap(Workbench workbench) {
    String globalVarStr = workbench.getGlobalVar();
    HashMap<String, String> returnMap = new HashMap<>();

    if(StringUtils.isNotEmpty(globalVarStr)){
      List<HashMap<String, String>> globalVars = GlobalObjectMapper.readValue(globalVarStr, List.class);

      if(globalVars != null){
        for(HashMap<String, String> globalVarMap : globalVars) {
          String globalVarKey = globalVarMap.get(Workbench.GLOBAL_VAR_KEY_NAME);
          String globalVarValue = globalVarMap.get(Workbench.GLOBAL_VAR_KEY_VALUE);
          returnMap.put(globalVarKey, globalVarValue);
        }
      }
    }

    return returnMap;
  }

  private QueryResult executeQuery(WorkbenchDataSource dataSourceInfo, String query, String workbenchId, String webSocketId,
                                   JdbcDataConnection jdbcDataConnection, long queryHistoryId, String auditId,
                                   Boolean saveToTempTable, int numRows, int queryIndex, String queryEditorId){

    ResultSet resultSet = null;
    QueryResult queryResult = null;
    Statement stmt = null;
    Connection connection = null;
    Thread logThread = null;

    if(isComment(query)){
      queryResult = createMessageResult("OK", query, QueryResult.QueryResultStatus.SUCCESS);
      queryResult.setStartDateTime(DateTime.now());
      queryResult.setFinishDateTime(DateTime.now());
      queryResult.setAuditId(auditId);
      queryResult.setQueryHistoryId(queryHistoryId);
      queryResult.setQueryEditorId(queryEditorId);
      return queryResult;
    }

    //DataSource
    SingleConnectionDataSource singleConnectionDataSource = dataSourceInfo.getSingleConnectionDataSource();

    //시작시간
    DateTime startDateTime = DateTime.now();
    try {
      sendWebSocketMessage(WorkbenchWebSocketController.WorkbenchWebSocketCommand.GET_CONNECTION, queryIndex,
              queryEditorId, workbenchId, webSocketId);
      connection = singleConnectionDataSource.getConnection();

      sendWebSocketMessage(WorkbenchWebSocketController.WorkbenchWebSocketCommand.CREATE_STATEMENT, queryIndex,
              queryEditorId, workbenchId, webSocketId);
      stmt = connection.createStatement();
      stmt.setFetchSize(workbenchProperties.getMaxFetchSize());

      //Query 실행 상태 RUNNING로 전환
      dataSourceInfo.setQueryStatus(QueryStatus.RUNNING);
      dataSourceInfo.setCurrentStatement(stmt);

      boolean usingCSV = true;
      int maxResultSize = workbenchProperties.getMaxResultSize();
      int defaultResultSize = workbenchProperties.getDefaultResultSize();

      if(usingCSV){
        stmt.setMaxRows(maxResultSize);
      } else {
        int maxRows = 0;
        if(numRows <= 0){
          maxRows = defaultResultSize;
        } else if(numRows <= maxResultSize){
          maxRows = numRows;
        } else {
          maxRows = maxResultSize;
        }
        stmt.setMaxRows(maxRows);
      }

      if(saveToTempTable && isSelectQuery(query) && !isTempTable(query)){
        String tempTableName = createTempTable(stmt, query, webSocketId);

        String selectQuery = "SELECT * FROM " + tempTableName;

        if(stmt.execute(selectQuery)){
          resultSet = stmt.getResultSet();
          queryResult = getQueryResult(resultSet, query, tempTableName, numRows, queryEditorId, queryIndex);
        } else {
          queryResult = createMessageResult("OK", query, QueryResult.QueryResultStatus.SUCCESS);
        }
      } else {

        LOGGER.debug("jdbcDataConnection : {}", jdbcDataConnection.getClass().getName());
        sendWebSocketMessage(WorkbenchWebSocketController.WorkbenchWebSocketCommand.EXECUTE_QUERY, queryIndex,
                queryEditorId, workbenchId, webSocketId);
        if(stmt instanceof HiveStatement){
          //send set audit query id
          setAuditId(connection, auditId);

          //Set Logging level for progress log
//          setHiveLoggingLevel(connection, "VERBOSE");

          //Set InPlaceProgress false (generate progress log without logging level verbose)
          setHiveInPlaceLog(connection, false);

          //create hive query log print thread
          logThread = new Thread(
                  new HiveQueryLogThread((HiveStatement) stmt, workbenchId, webSocketId, queryIndex, queryEditorId,
                          1000L, messagingTemplate)
          );

          logThread.start();
          boolean hasResult = ((HiveStatement) stmt).execute(query);
          logThread.interrupt();

          if(hasResult){
            sendWebSocketMessage(WorkbenchWebSocketController.WorkbenchWebSocketCommand.GET_RESULTSET, queryIndex,
                    queryEditorId, workbenchId, webSocketId);
            resultSet = stmt.getResultSet();
            queryResult = getQueryResult(resultSet, query, null, numRows, queryEditorId, queryIndex);
          } else {
            queryResult = createMessageResult("OK", query, QueryResult.QueryResultStatus.SUCCESS);
          }
        } else {
          if(stmt.execute(query)){
            sendWebSocketMessage(WorkbenchWebSocketController.WorkbenchWebSocketCommand.GET_RESULTSET, queryIndex,
                    queryEditorId, workbenchId, webSocketId);
            resultSet = stmt.getResultSet();
            queryResult = getQueryResult(resultSet, query, null, numRows, queryEditorId, queryIndex);
          } else {
            queryResult = createMessageResult("OK", query, QueryResult.QueryResultStatus.SUCCESS);
          }
          sendWebSocketMessage(WorkbenchWebSocketController.WorkbenchWebSocketCommand.DONE, queryIndex,
                  queryEditorId, workbenchId, webSocketId);
        }
      }
    } catch(Exception e){
      e.printStackTrace();
      LOGGER.error("Query Execute Error : {}", e.getMessage());
      queryResult = createMessageResult(e.getMessage(), query, QueryResult.QueryResultStatus.FAIL);
    } finally {
      if (logThread != null) {
        if (!logThread.isInterrupted()) {
          logThread.interrupt();
        }
      }
      JdbcUtils.closeResultSet(resultSet);
      JdbcUtils.closeStatement(stmt);
      JdbcUtils.closeConnection(connection);

      //Query 실행 상태 IDLE로 전환
      dataSourceInfo.setQueryStatus(QueryStatus.IDLE);
      dataSourceInfo.setCurrentStatement(null);

      //종료시간
      DateTime finishDateTime = DateTime.now();

      //Query 시작 종료 시간 기록
      queryResult.setStartDateTime(startDateTime);
      queryResult.setFinishDateTime(finishDateTime);
      queryResult.setAuditId(auditId);
      queryResult.setQueryHistoryId(queryHistoryId);
      queryResult.setQueryEditorId(queryEditorId);
    }

    return queryResult;
  }
  
  private QueryResult getQueryResult(ResultSet resultSet, String query, String tempTable, int pageSize, String queryEditorId, int queryIndex) throws SQLException{
    //1. create CSV File with header
    String csvBaseDir = workbenchProperties.getTempCSVPath();
    if(!csvBaseDir.endsWith(File.separator)){
      csvBaseDir = csvBaseDir + File.separator;
    }

    String tempFileName = generateTempCSVFileName(csvBaseDir, queryEditorId, queryIndex);
    LOGGER.debug("writeResultSetToCSV csvBaseDir : {}", csvBaseDir);
    LOGGER.debug("writeResultSetToCSV tempFileName : {}", tempFileName);
    int rowNumber = jdbcConnectionService.writeResultSetToCSV(resultSet, csvBaseDir + tempFileName);

    //2. get field info from resultset
    List<Field> fieldList = jdbcConnectionService.getFieldList(resultSet, false);

    //3. get data list from csv file
    List<Map<String, Object>> dataList = readCsv(csvBaseDir + tempFileName, fieldList, 0, pageSize);

    //4. generate Query Result
    QueryResult queryResult = new QueryResult();
    queryResult.setRunQuery(query);
    queryResult.setFields(fieldList);
    queryResult.setData(dataList);
    queryResult.setTempTable(tempTable);
    queryResult.setNumRows(Long.valueOf(rowNumber));
    queryResult.setQueryResultStatus(QueryResult.QueryResultStatus.SUCCESS);
    queryResult.setCsvFilePath(tempFileName);
    LOGGER.info("Query row count : {}", queryResult.getNumRows());

    return queryResult;
  }

  private QueryResult createMessageResult(String message, String query, QueryResult.QueryResultStatus queryResultStatus){
    QueryResult queryResult = new QueryResult();
    queryResult.setRunQuery(query);
    queryResult.setQueryResultStatus(queryResultStatus);
    queryResult.setMessage(message);
    return queryResult;
  }

  public void cancelQuery(JdbcDataConnection jdbcDataConnection, String webSocketId){
    WorkbenchDataSource dataSourceInfo = null;
    Statement stmt = null;
    try{
      dataSourceInfo = WorkbenchDataSourceUtils.findDataSourceInfo(webSocketId);
      if(dataSourceInfo != null){
        //pending query list remove all
        while(dataSourceInfo.getQueryList() != null && !dataSourceInfo.getQueryList().isEmpty()){
          dataSourceInfo.getQueryList().remove(0);
        }
        LOGGER.debug("Removed remain query all");
        stmt = dataSourceInfo.getCurrentStatement();
        if(stmt != null)
          stmt.cancel();
        LOGGER.debug("Statement is canceled");
      }
    } catch (SQLException sqle) {
    } finally {
      JdbcUtils.closeStatement(stmt);
    }
  }
  
  private Map<String, Object> getColumnInfo(String columnNameFromMetaData, JdbcDataConnection jdbcDataConnection){
    Map<String, Object> columnInfo = new LinkedHashMap<>();

    //Field, DisplayName 기본값은 동일
    String field = getFieldFromColumnName(columnNameFromMetaData);
    String displayName = columnNameFromMetaData;

    //Hive의 경우는 displayName과 field 동일하게 사용함
    if(jdbcDataConnection instanceof HiveConnection){
      displayName = field;
    }

    columnInfo.put("field", field);
    columnInfo.put("displayName", displayName);

    return columnInfo;
  }

  private String getFieldFromColumnName(String columnNameFromMetaData){
    String field = columnNameFromMetaData;
    //columnNameFromMetaData .이 포함될 경우 . 이후의 텍스트를 field 로 사용함
    int stIndex = columnNameFromMetaData.lastIndexOf(".");
    if(stIndex > 0){
      int edIndex = columnNameFromMetaData.length();
      field = columnNameFromMetaData.substring(stIndex+1, edIndex);
    }
    return field;
  }

  private String createTempTable(Statement stmt, String query, String tableSuffix) throws SQLException{
    //temp_polaris
    String schema = WorkbenchProperties.TEMP_SCHEMA_PREFIX + AuthUtils.getAuthUserName();

    //wb_webSocketId_1503450
    String tempTableName = WorkbenchProperties.TEMP_TABLE_PREFIX
            + (StringUtils.isNotEmpty(tableSuffix) ? tableSuffix + "_" : "")
            + DateTime.now().toDate().getTime();

    String createSchemaQuery = "CREATE SCHEMA IF NOT EXISTS "
            + schema + " LOCATION '"
            + workbenchProperties.getTempHdfsPath() + "'";
    stmt.execute(createSchemaQuery);

    String dropQuery = "DROP TABLE IF EXISTS " + schema + "." + tempTableName;
    stmt.execute(dropQuery);

    String createQuery = "CREATE TEMPORARY TABLE " + schema + "." + tempTableName + " AS " + query;
    stmt.execute(createQuery);

    return schema + '.' + tempTableName;
  }

  private boolean isSelectQuery(String query) {
    try{
      net.sf.jsqlparser.statement.Statement parsedStmt = CCJSqlParserUtil.parse(query);
      return parsedStmt instanceof Select;
    } catch(JSQLParserException e){

    }
    return false;
  }

  private boolean isTempTable(String query) {
    try{
      net.sf.jsqlparser.statement.Statement parsedStmt = CCJSqlParserUtil.parse(query);
      Select selectStatement = (Select) parsedStmt;
      TablesNamesFinder tablesNamesFinder = new TablesNamesFinder();
      List<String> tableList = tablesNamesFinder.getTableList(selectStatement);
      for(String tableName : tableList){
        if(StringUtils.containsIgnoreCase(tableName, WorkbenchProperties.TEMP_TABLE_PREFIX)){
          return true;
        }
      }
    } catch(JSQLParserException e){

    }
    return false;
  }

  private void setAuditId(Connection connection, String auditId){
    Statement stmt = null;
    try{
      stmt = connection.createStatement();
      String setHiveAuditIdQuery = "SET _hive.audit.query.id = " + auditId;
      LOGGER.debug("setHiveAuditIdQuery : {}", setHiveAuditIdQuery);
      stmt.execute(setHiveAuditIdQuery);
      LOGGER.debug("setHiveAuditIdQuery Executed.");
    } catch (SQLException e){
      LOGGER.error(e.getMessage());
    } finally {
      JdbcUtils.closeStatement(stmt);
    }
  }

  private void setHiveLoggingLevel(Connection connection, String loggingLevel){
    //VERBOSE, EXECUTION, PERFORMANCE
    Statement stmt = null;
    try{
      stmt = connection.createStatement();
      String hiveLoggingLevel = "set hive.server2.logging.operation.level = " + loggingLevel;
      LOGGER.debug("hiveLoggingLevel : {}", hiveLoggingLevel);
      stmt.execute(hiveLoggingLevel);
      LOGGER.debug("hiveLoggingLevel Executed.");
    } catch (SQLException e){
      LOGGER.error(e.getMessage());
    } finally {
      JdbcUtils.closeStatement(stmt);
    }
  }

  private void setHiveInPlaceLog(Connection connection, boolean inPlaceLog){
    //set hive.server2.in.place.progress
    Statement stmt = null;
    try{
      stmt = connection.createStatement();
      String hiveInPlaceLog = "set hive.server2.in.place.progress=" + inPlaceLog;
      LOGGER.debug("HiveInPlaceLog : {}", hiveInPlaceLog);
      stmt.execute(hiveInPlaceLog);
      LOGGER.debug("HiveInPlaceLog Executed.");
    } catch (SQLException e){
      LOGGER.error(e.getMessage());
    } finally {
      JdbcUtils.closeStatement(stmt);
    }
  }

  public boolean isComment(String query){
    boolean isComment = true;
    String[] lineSplitedQueries = StringUtils.split(query, "\n");
    //all line starts with # or --
    for(String lineSplitedQuery : lineSplitedQueries){
      String lineTrimmed = lineSplitedQuery.trim();
      isComment = (isComment && (lineTrimmed.startsWith("#") || lineTrimmed.startsWith("--")));
    }
    return isComment;
  }

  public void sendWebSocketMessage(WorkbenchWebSocketController.WorkbenchWebSocketCommand command, int queryIndex,
                                   String queryEditorId, String workbenchId, String webSocketId){
    Map<String, Object> message = new HashMap<>();
    message.put("command", command);
    message.put("queryIndex", queryIndex);
    message.put("queryEditorId", queryEditorId);

    WebSocketUtils.sendMessage(messagingTemplate, webSocketId, "/queue/workbench/" + workbenchId, message);
  }

  public List<Map<String, Object>> readCsv(String fileName, List<Field> fieldList, int index, int length) {
    ICsvMapReader mapReader = null;
    List<Map<String, Object>> returnList = new ArrayList<>();
    try {
      mapReader = new CsvMapReader(new FileReader(fileName), CsvPreference.STANDARD_PREFERENCE);

      // the header columns are used as the keys to the Map
      final String[] header = mapReader.getHeader(true);

      Map<String, Object> rowMap;
      while( (rowMap = mapReader.read(header, getProcessors(fieldList))) != null && mapReader.getRowNumber() - 1 < index + length + 1) {
        if(mapReader.getRowNumber() - 1 > index){
          returnList.add(rowMap);
        }
      }
    } catch (FileNotFoundException e){
      throw new WorkbenchException(CSV_FILE_NOT_FOUND, "CSV File Not Founded.", e);
    } catch (IOException e){
      throw new WorkbenchException(CSV_FILE_NOT_FOUND, "read CSV IOException.", e);
    } finally {
      try {
        if(mapReader != null)
          mapReader.close();
      } catch (Exception e){}
    }
    return returnList;
  }

  private CellProcessor[] getProcessors(List<Field> fieldList) {
    List<CellProcessor> cellProcessorList = new ArrayList<>();
    for(Field field : fieldList){
      switch (field.getType()){
        case INTEGER:
          cellProcessorList.add(new org.supercsv.cellprocessor.Optional(new ParseInt()));
          break;
        case DECIMAL:
          cellProcessorList.add(new org.supercsv.cellprocessor.Optional(new ParseBigDecimal()));
          break;
        case DOUBLE: case FLOAT:
          cellProcessorList.add(new org.supercsv.cellprocessor.Optional(new ParseDouble()));
          break;
        case LONG: case NUMBER:
          cellProcessorList.add(new org.supercsv.cellprocessor.Optional(new ParseLong()));
          break;
        case BOOLEAN:
          cellProcessorList.add(new org.supercsv.cellprocessor.Optional(new ParseBool()));
          break;
        default:
          cellProcessorList.add(new Optional());
          break;
      }
    }
    return cellProcessorList.toArray(new CellProcessor[]{});
  }

  private String generateTempCSVFileName(String baseDir, String queryEditorId, int queryIndex){
    String tempFileName = DateTime.now().toString("yyyyMMddhhmmss") + "_" + queryEditorId.substring(0, 8) + "_" + queryIndex;
    String suffixStr = "_(1)";
    String filePathString = baseDir + File.separator + tempFileName + ".csv";
    while(Files.exists(Paths.get(filePathString))){
      tempFileName = tempFileName + suffixStr;
      filePathString = baseDir + File.separator + tempFileName + ".csv";
    }

    return tempFileName + ".csv";
  }
}
