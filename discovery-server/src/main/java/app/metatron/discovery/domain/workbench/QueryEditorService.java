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

import org.apache.commons.lang3.StringUtils;
import org.apache.hive.jdbc.HiveStatement;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;
import org.supercsv.cellprocessor.Optional;
import org.supercsv.cellprocessor.ParseBigDecimal;
import org.supercsv.cellprocessor.ParseBool;
import org.supercsv.cellprocessor.ParseDouble;
import org.supercsv.cellprocessor.ParseInt;
import org.supercsv.cellprocessor.ParseLong;
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
import java.sql.SQLFeatureNotSupportedException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.audit.Audit;
import app.metatron.discovery.domain.audit.AuditRepository;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSource;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceManager;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.WebSocketUtils;

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

  @Autowired
  EntityManager entityManager;

  @Autowired
  WorkbenchDataSourceManager workbenchDataSourceManager;

  public QueryStatus getQueryStatus(String webSocketId) {
    WorkbenchDataSource dataSourceInfo = workbenchDataSourceManager.findDataSourceInfo(webSocketId);
    return dataSourceInfo == null ? null : dataSourceInfo.getQueryStatus();
  }

  public List<QueryResult> getQueryResult(
          QueryEditor queryEditor, DataConnection jdbcDataConnection,
          Workbench workbench, String query, String webSocketId) {

    return getQueryResult(queryEditor, jdbcDataConnection, workbench, query, webSocketId, null);
  }

  public List<QueryResult> getQueryResult(
          QueryEditor queryEditor, DataConnection jdbcDataConnection,
          Workbench workbench, String query, String webSocketId, String databaseName) {
    List<QueryResult> queryResults = new ArrayList<>();

    //1. 쿼리 목록으로 변환
    List<String> queryList = getSubstitutedQueryList(query, workbench);

    //2. 순차적 Query 실행
    //DataSource
    WorkbenchDataSource dataSourceInfo = workbenchDataSourceManager.findDataSourceInfo(webSocketId);
    if(dataSourceInfo == null){
      throw new ResourceNotFoundException("WorkbenchDataSource(webSocketId = " + webSocketId + ")");
    }
    dataSourceInfo.setQueryList(queryList);

    JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(jdbcDataConnection);

    int queryIndex = 0;
    while(!queryList.isEmpty()){
      String substitutedQuery = queryList.remove(0);

      //Query History 선저장
      QueryHistory queryHistory = new QueryHistory();
      queryHistory.setQueryEditor(queryEditor);
      queryHistory.setQuery(substitutedQuery);
      queryHistory.setDataConnectionId(jdbcDataConnection.getId());
      queryHistory.setDatabaseName(databaseName);
      queryHistory.setQueryResultStatus(QueryResult.QueryResultStatus.RUNNING);
      queryHistoryRepository.saveAndFlush(queryHistory);
      LOGGER.debug("QueryHistory Created : " + queryHistory.getId());
      Long queryHistoryId = queryHistory.getId();

      //Audit 저장
      Audit audit = new Audit();
      audit.setDataConnectionId(jdbcDataConnection.getId());
      audit.setDataConnectionHostName(jdbcDataConnection.getHostname());
      audit.setDataConnectionPort(jdbcDataConnection.getPort());
      audit.setDataConnectionDatabase(databaseName);
      audit.setDataConnectionConnectUrl(jdbcDataAccessor.getDialect().getConnectUrl(jdbcDataConnection));
      audit.setDataConnectionImplementor(jdbcDataConnection.getImplementor());
      audit.setJobName(substitutedQuery);
      audit.setQuery(substitutedQuery);
      audit.setType(Audit.AuditType.QUERY);
      audit.setQueryHistoryId(queryHistory.getId());
      audit.setStartTime(DateTime.now());
      audit.setUser(AuthUtils.getAuthUserName());
      audit.setStatus(Audit.AuditStatus.RUNNING);
      auditRepository.saveAndFlush(audit);
      String auditId = audit.getId();

      LOGGER.debug("Audit Created : " + auditId);

      entityManager.clear();

      QueryResult queryResult = executeQuery(dataSourceInfo, substitutedQuery, workbench.getId(), webSocketId, jdbcDataConnection,
              queryHistoryId, auditId, queryIndex, queryEditor.getId());
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
      queryHistory.setQueryTimeTaken(queryResult.getFinishDateTime().toDate().getTime() - queryResult.getStartDateTime().toDate().getTime());
      queryHistory.setDataConnectionId(jdbcDataConnection.getId());
      queryHistory.setDatabaseName(databaseName);
      queryHistory.setQueryLog(queryResult.getMessage());
      queryHistory.setNumRows(queryResult.getNumRows());
      //cancelled should not update
      if(queryHistory.getQueryResultStatus() != QueryResult.QueryResultStatus.CANCELLED)
        queryHistory.setQueryResultStatus(queryResult.getQueryResultStatus());
      queryResult.setQueryResultStatus(queryHistory.getQueryResultStatus());
      queryHistoryRepository.save(queryHistory);
      LOGGER.debug("QueryHistory Updated : " + queryHistory.getId());

      queryResult.setQueryHistoryId(queryHistory.getId());
    }

    queryHistoryRepository.flush();

    return queryResults;
  }

  public List<String> multiLineQuerySplitter(String query){
    List<String> queryList = new ArrayList<>();
    String[] strByLine = StringUtils.split(query, System.lineSeparator());

    StringBuilder stringBuilder = new StringBuilder();
    int lineCount = strByLine.length;
    for(int i = 0; i < lineCount; ++i){
      String byLine = strByLine[i];

      stringBuilder.append(byLine);

      int semiColonIndex = StringUtils.indexOf(byLine, ";");
      int hyphenIndex = StringUtils.indexOf(byLine, "--");
      int sharpIndex = StringUtils.indexOf(byLine, "#");
      int commentIndex = (hyphenIndex >= 0 && sharpIndex >= 0)
          ? Math.min(hyphenIndex, sharpIndex)
          : Math.max(hyphenIndex, sharpIndex);

      //semicolon before comment
      if(semiColonIndex > -1 && commentIndex > -1 && semiColonIndex < commentIndex){
        queryList.add(stringBuilder.toString());
        stringBuilder = new StringBuilder();
      } else if(semiColonIndex > -1 && commentIndex < 0){
        queryList.add(stringBuilder.toString());
        stringBuilder = new StringBuilder();
      } else if(i < lineCount - 1){
        stringBuilder.append(System.lineSeparator());
      }
    }

    if(StringUtils.isNotEmpty(stringBuilder.toString())){
      queryList.add(stringBuilder.toString());
    }

    return queryList;
  }

  public List<String> getSubstitutedQueryList(String queryStr, Workbench workbench) {
    List<String> returnList = new ArrayList<>();

    //1. semicolon split
//    List<String> queryList = Arrays.asList(queryStr.split(";"));
    List<String> queryList = multiLineQuerySplitter(queryStr);


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
                                   DataConnection jdbcDataConnection, long queryHistoryId, String auditId,
                                   int queryIndex, String queryEditorId){

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

    //시작시간
    DateTime startDateTime = DateTime.now();
    Integer maxResultSize = workbenchProperties.getMaxResultSize();
    Integer defaultResultSize = workbenchProperties.getDefaultResultSize();

    try {
      sendWebSocketMessage(WorkbenchWebSocketController.WorkbenchWebSocketCommand.GET_CONNECTION, queryIndex,
              queryEditorId, workbenchId, webSocketId);
      connection = dataSourceInfo.getPrimaryConnection();

      sendWebSocketMessage(WorkbenchWebSocketController.WorkbenchWebSocketCommand.CREATE_STATEMENT, queryIndex,
              queryEditorId, workbenchId, webSocketId);
      stmt = connection.createStatement();
      stmt.setFetchSize(workbenchProperties.getMaxFetchSize());

      //Query 실행 상태 RUNNING로 전환
      dataSourceInfo.setQueryStatus(QueryStatus.RUNNING);
      dataSourceInfo.setCurrentStatement(stmt);
      dataSourceInfo.setQueryHistoryId(queryHistoryId);
      dataSourceInfo.setAuditId(auditId);

      stmt.setMaxRows(maxResultSize);


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
          queryResult = getQueryResult(resultSet, query, null, defaultResultSize, queryEditorId, queryIndex);
        } else {
          queryResult = createMessageResult("OK", query, QueryResult.QueryResultStatus.SUCCESS);
        }
      } else {
        if(stmt.execute(query)){
          sendWebSocketMessage(WorkbenchWebSocketController.WorkbenchWebSocketCommand.GET_RESULTSET, queryIndex,
                  queryEditorId, workbenchId, webSocketId);
          resultSet = stmt.getResultSet();
          queryResult = getQueryResult(resultSet, query, null, defaultResultSize, queryEditorId, queryIndex);
        } else {
          queryResult = createMessageResult("OK", query, QueryResult.QueryResultStatus.SUCCESS);
        }
      }
    } catch(SQLException e){
      LOGGER.error("Query Execute SQLException : ", e);
      queryResult
              = createMessageResult("An error occurred during query execution.  \n" +
              "Please contact your system administrator.  \n" +
              "(SQLException (" + e.getSQLState() + ") (" + e.getErrorCode() + ") : \n" +
              e.getMessage() + ")", query, QueryResult.QueryResultStatus.FAIL);
    } catch(Exception e){
      LOGGER.error("Query Execute Exception : ", e);
      queryResult = createMessageResult(e.getMessage(), query, QueryResult.QueryResultStatus.FAIL);
    } finally {
      if (logThread != null) {
        if (!logThread.isInterrupted()) {
          logThread.interrupt();
        }
      }

      LOGGER.debug("resultset close");
      JdbcUtils.closeResultSet(resultSet);
      LOGGER.debug("statement close");
      JdbcUtils.closeStatement(stmt);
      LOGGER.debug("connection close");
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
      queryResult.setMaxNumRows(Long.valueOf(maxResultSize));

      sendWebSocketMessage(WorkbenchWebSocketController.WorkbenchWebSocketCommand.DONE, queryIndex, queryEditorId,
              workbenchId, webSocketId);
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

    //2. get field info from resultset
    List<Field> fieldList = jdbcConnectionService.getFieldList(resultSet, false);

    //we don't know about timestamp's format...
    //so convert to STRING type for Temporary datasource
    if(fieldList != null) {
      fieldList.stream()
               .filter(field -> field.getType() == DataType.TIMESTAMP)
               .forEach(field -> field.setType(DataType.STRING));
    }

    //3. write csv
    int rowNumber = jdbcConnectionService.writeResultSetToCSV(
            resultSet,
            csvBaseDir + tempFileName,
            fieldList.stream().map(field -> field.getName()).collect(Collectors.toList()));


    //4. get data list from csv file
    List<Map<String, Object>> dataList = readCsv(csvBaseDir + tempFileName, fieldList, 0, pageSize);

    //5. generate Query Result
    QueryResult queryResult = new QueryResult();
    queryResult.setRunQuery(query);
    queryResult.setFields(fieldList);
    queryResult.setData(dataList);
    queryResult.setTempTable(tempTable);
    queryResult.setDefaultNumRows(pageSize <= 0 ? 0L : Long.valueOf(pageSize));
    queryResult.setNumRows(rowNumber <= 0 ? 0L : Long.valueOf(rowNumber - 1));
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

  public void cancelQuery(DataConnection jdbcDataConnection, String webSocketId){
    WorkbenchDataSource dataSourceInfo = null;
    Statement stmt = null;
    try{
      dataSourceInfo = workbenchDataSourceManager.findDataSourceInfo(webSocketId);
      if(dataSourceInfo != null){
        //pending query list remove all
        while(dataSourceInfo.getQueryList() != null && !dataSourceInfo.getQueryList().isEmpty()){
          dataSourceInfo.getQueryList().remove(0);
        }

        //update status
        QueryHistory qh = queryHistoryRepository.getOne(dataSourceInfo.getQueryHistoryId());
        if(qh != null){
          qh.setQueryResultStatus(QueryResult.QueryResultStatus.CANCELLED);
          queryHistoryRepository.saveAndFlush(qh);
        }
        Audit audit = auditRepository.getOne(dataSourceInfo.getAuditId());
        if(audit != null){
          audit.setStatus(Audit.AuditStatus.CANCELLED);
          auditRepository.saveAndFlush(audit);
        }
        entityManager.clear();
        
        LOGGER.debug("Removed remain query all");
        stmt = dataSourceInfo.getCurrentStatement();
        if(stmt != null){
          ResultSet rs = stmt.getResultSet();
          if(rs != null){
            LOGGER.debug("ResultSet is not null");
            JdbcUtils.closeResultSet(rs);
          }
          stmt.cancel();
        }

        LOGGER.debug("Statement is canceled");
      }
    } catch (SQLFeatureNotSupportedException e) {
      LOGGER.debug("Presto not Support cancel...");
    } catch (SQLException e) {
    } finally {
      JdbcUtils.closeStatement(stmt);
    }
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
      mapReader = new CsvMapReader(new FileReader(fileName)
              , new CsvPreference.Builder('"', ',', "\r\n")
              .ignoreEmptyLines(false)
              .build());

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
    StringBuilder sb = new StringBuilder();

    //add prefix
    sb.append(WorkbenchProperties.TEMP_CSV_PREFIX);

    //add datetime
    sb.append(DateTime.now().toString("yyyyMMddhhmmssSSS") + "_");

    //add queryEditorId
    sb.append(queryEditorId.substring(0, 8) + "_");

    //add queryIndex
    sb.append(queryIndex);

    //add suffix for duplicate filename
    String suffixStr = "_1";
    while(Files.exists(Paths.get(baseDir + File.separator + sb.toString() + ".csv"))){
      sb.append(suffixStr);
    }

    //add extension
    sb.append(".csv");

    //temporary_wb_20180101000000_abcdefgh_0.csv

    return sb.toString();
  }
}
