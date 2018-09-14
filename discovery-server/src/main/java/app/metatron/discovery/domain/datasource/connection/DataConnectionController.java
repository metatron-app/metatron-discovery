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

package app.metatron.discovery.domain.datasource.connection;

import com.google.common.collect.Maps;

import com.querydsl.core.types.Predicate;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.sql.DataSource;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.datasource.DataSourceProperties;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.HiveTableInformation;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcQueryResultResponse;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.mdm.source.MetadataSource;
import app.metatron.discovery.domain.mdm.source.MetadataSourceRepository;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workbench.WorkbenchRepository;
import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceUtils;

/**
 * Created by kyungtaak on 2016. 6. 10..
 */
@RepositoryRestController
public class DataConnectionController {

  private static Logger LOGGER = LoggerFactory.getLogger(DataConnectionController.class);

  @Autowired
  JdbcConnectionService connectionService;

  @Autowired
  DataConnectionRepository connectionRepository;

  @Autowired
  WorkbenchRepository workbenchRepository;

  @Autowired
  DataSourceProperties dataSourceProperties;

  @Autowired
  EngineProperties engineProperties;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  MetadataSourceRepository metadataSourceRepository;

  /**
   * 서비스에서 이용가능한 JDBC 종류 전달
   *
   * @return
   */
  @RequestMapping(value = "/connections/available", method = RequestMethod.GET,  produces = "application/json")
  public @ResponseBody ResponseEntity<?> available() {
    return ResponseEntity.ok(dataSourceProperties.getConnections());
  }

  /**
   * Connection 목록 조회
   * @param name
   * @param implementor
   * @param usageScope
   * @param searchDateBy
   * @param from
   * @param to
   * @param pageable
   * @param resourceAssembler
   * @return
   */
  @RequestMapping(value = "/connections", method = RequestMethod.GET,  produces = "application/json")
  public @ResponseBody ResponseEntity<?> findConnections(
      @RequestParam(value = "name", required = false) String name,
      @RequestParam(value = "type", required = false) String type,
      @RequestParam(value = "implementor", required = false) String implementor,
      @RequestParam(value = "usageScope", required = false) String usageScope,
      @RequestParam(value = "authenticationType", required = false) String authenticationType,
      @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
      @RequestParam(value = "from", required = false)
      @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
      @RequestParam(value = "to", required = false)
      @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
      Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    LOGGER.debug("name = {}", name);
    LOGGER.debug("implementor = {}", implementor);
    LOGGER.debug("usageScope = {}", usageScope);
    LOGGER.debug("authenticationType = {}", authenticationType);
    LOGGER.debug("searchDateBy = {}", searchDateBy);
    LOGGER.debug("from = {}", from);
    LOGGER.debug("to = {}", to);
    LOGGER.debug("pageable = {}", pageable);

    // Validate UsageScope
    DataConnection.UsageScope usageScopeType = null;
    if(StringUtils.isNotEmpty(usageScope) && !"ALL".equalsIgnoreCase(usageScope)){
      usageScopeType = SearchParamValidator
          .enumUpperValue(DataConnection.UsageScope.class, usageScope, "usageScope");
    }

    // Validate UsageScope
    DataConnection.AuthenticationType authenticationTypeValue = null;
    if(StringUtils.isNotEmpty(authenticationType)){
      authenticationTypeValue = SearchParamValidator
              .enumUpperValue(DataConnection.AuthenticationType.class, authenticationType, "authenticationType");
    }

    // Validate Implementor
    DataConnection.SourceType sourceType = SearchParamValidator
        .enumUpperValue(DataConnection.SourceType.class, type, "type");

    // Validate Implementor
    DataConnection.Implementor implementorType = SearchParamValidator
        .enumUpperValue(DataConnection.Implementor.class, implementor, "implementor");

    // Validate searchByTime
    SearchParamValidator.range(searchDateBy, from, to);

    // Get Predicate
    Predicate searchPredicated = DataConnectionPredicate
        .searchList(name, usageScopeType, sourceType, implementorType, searchDateBy, from, to, authenticationTypeValue);

    // 기본 정렬 조건 셋팅
    if(pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.ASC, "createdTime", "name"));
    }
    Page<DataConnection> connections = connectionRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(connections, resourceAssembler));
  }

  @RequestMapping(value = "/connections/query/check", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> queryForConnection(@RequestBody ConnectionRequest checkRequest) {

    // 추가 유효성 체크
    Map<String, Object> resultMap = connectionService.checkConnection(checkRequest.getConnection());

    return ResponseEntity.ok(resultMap);
  }

  @RequestMapping(value = "/connections/query/databases", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> queryForListOfDatabases(@RequestBody ConnectionRequest checkRequest,
                                                                 Pageable pageable) {
    return ResponseEntity.ok(
        connectionService.findDatabases(checkRequest.getConnection(), pageable)
    );
  }

  @RequestMapping(value = "/connections/query/hive/databases", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> queryForListOfHiveDatabases(Pageable pageable) {

    EngineProperties.HiveConnection hivePropertyConnection = engineProperties.getIngestion().getHive();

    if(hivePropertyConnection == null){
      throw new ResourceNotFoundException("EngineProperties.HiveConnection");
    }

    HiveConnection hiveConnection = new HiveConnection();
    hiveConnection.setUrl(hivePropertyConnection.getUrl());
    hiveConnection.setHostname(hivePropertyConnection.getHostname());
    hiveConnection.setPort(hivePropertyConnection.getPort());
    hiveConnection.setUsername(hivePropertyConnection.getUsername());
    hiveConnection.setPassword(hivePropertyConnection.getPassword());

    return ResponseEntity.ok(
            connectionService.findDatabases(hiveConnection, pageable)
    );
  }

  @RequestMapping(value = "/connections/query/tables", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> queryForListOfTables(@RequestBody ConnectionRequest checkRequest,
                                                              Pageable pageable) {

    return ResponseEntity.ok(
        connectionService.findTablesInDatabase(checkRequest.getConnection(), checkRequest.getDatabase(), pageable)
    );
  }

  @RequestMapping(value = "/connections/query/hive/tables", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> queryForListOfHiveTables(@RequestBody ConnectionRequest checkRequest,
                                                              Pageable pageable) {

    //유효성 체크
    SearchParamValidator.checkNull(checkRequest.getDatabase(), "database");

    EngineProperties.HiveConnection hivePropertyConnection = engineProperties.getIngestion().getHive();

    if(hivePropertyConnection == null){
      throw new ResourceNotFoundException("EngineProperties.HiveConnection");
    }

    HiveConnection hiveConnection = new HiveConnection();
    hiveConnection.setUrl(hivePropertyConnection.getUrl());
    hiveConnection.setHostname(hivePropertyConnection.getHostname());
    hiveConnection.setPort(hivePropertyConnection.getPort());
    hiveConnection.setUsername(hivePropertyConnection.getUsername());
    hiveConnection.setPassword(hivePropertyConnection.getPassword());

    return ResponseEntity.ok(
            connectionService.findTablesInDatabase(hiveConnection, checkRequest.getDatabase(), pageable)
    );
  }

  @RequestMapping(value = "/connections/query/data", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> queryBySelect(@RequestBody ConnectionRequest checkRequest,
                                                       @RequestParam(required = false, defaultValue = "50") int limit,
                                                       @RequestParam(required = false) boolean extractColumnName) {

    // 추가 유효성 체크
    SearchParamValidator.checkNull(checkRequest.getType(), "type");
    SearchParamValidator.checkNull(checkRequest.getQuery(), "query");

    JdbcQueryResultResponse resultSet =
        connectionService.selectQueryForIngestion(checkRequest.getConnection(), checkRequest.getDatabase(),
                checkRequest.getType(),checkRequest.getQuery(), limit, extractColumnName);

    return ResponseEntity.ok(resultSet);
  }

  @RequestMapping(value = "/connections/query/hive/data", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> queryBySelectForHiveIngestion(@RequestBody ConnectionRequest checkRequest,
                                                                       @RequestParam(required = false, defaultValue = "50") int limit,
                                                                       @RequestParam(required = false) boolean extractColumnName) {

    // 추가 유효성 체크
    SearchParamValidator.checkNull(checkRequest.getType(), "type");
    SearchParamValidator.checkNull(checkRequest.getQuery(), "query");
    SearchParamValidator.checkNull(checkRequest.getDatabase(), "database");

    EngineProperties.HiveConnection hivePropertyConnection = engineProperties.getIngestion().getHive();

    if(hivePropertyConnection == null){
      throw new ResourceNotFoundException("EngineProperties.HiveConnection");
    }

    HiveConnection hiveConnection = new HiveConnection();
    hiveConnection.setUrl(hivePropertyConnection.getUrl());
    hiveConnection.setHostname(hivePropertyConnection.getHostname());
    hiveConnection.setPort(hivePropertyConnection.getPort());
    hiveConnection.setUsername(hivePropertyConnection.getUsername());
    hiveConnection.setPassword(hivePropertyConnection.getPassword());

    if(checkRequest.getDatabase() != null && checkRequest.getType() == JdbcIngestionInfo.DataType.QUERY) {
      hiveConnection.setDatabase(checkRequest.getDatabase());
    }

    JdbcQueryResultResponse resultSet =
            connectionService.selectQueryForIngestion(hiveConnection, checkRequest.getDatabase(),
                    checkRequest.getType(), checkRequest.getQuery(), limit, extractColumnName);

    //Partition 정보 ..
    if(checkRequest.getType() == JdbcIngestionInfo.DataType.TABLE){
      HiveTableInformation hiveTableInformation = connectionService.showHiveTableDescription(hiveConnection,
              checkRequest.getDatabase(), checkRequest.getQuery(), false);

      //Partition Field
      resultSet.setPartitionFields(hiveTableInformation.getPartitionFields());

      //File Format
      resultSet.setFileFormat(hiveTableInformation.getFileFormat());
    }

    return ResponseEntity.ok(resultSet);
  }

  @RequestMapping(value = "/connections/query/information", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> queryForTableInfo(@RequestBody ConnectionRequest checkRequest) {

    // 추가 유효성 체크
    SearchParamValidator.checkNull(checkRequest.getTable(), "table");
    SearchParamValidator.checkNull(checkRequest.getDatabase(), "database");

    JdbcDataConnection dataConnection = checkRequest.getConnection();

    DataSource dataSource = connectionService.getDataSource(dataConnection, true);

    Map<String, Object> tableInfoMap = connectionService.showTableDescription(dataConnection, dataSource,
            checkRequest.getDatabase(), checkRequest.getTable());

    return ResponseEntity.ok(tableInfoMap);
  }

  @RequestMapping(value = "/connections/{connectionId}/databases", method = RequestMethod.GET)
  public @ResponseBody ResponseEntity<?> queryForListOfDatabasesByConnectionId(
          @PathVariable("connectionId") String connectionId,
          @RequestParam(required = false) String databaseName,
          @RequestParam(required = false) String webSocketId,
          Pageable pageable) {

    DataConnection connection = connectionRepository.findOne(connectionId);
    if(connection == null) {
      throw new ResourceNotFoundException(connectionId);
    }

    return ResponseEntity.ok(connectionService.findDatabases((JdbcDataConnection) connection, databaseName, webSocketId, pageable));
  }

  @RequestMapping(value = "/connections/{connectionId}/databases/{databaseName}/tables", method = RequestMethod.GET,
                  produces = "application/json")
  public @ResponseBody ResponseEntity<?> queryForListOfTablesByConnectionIdAndDatabaseName(
          @PathVariable("connectionId") String connectionId,
          @PathVariable("databaseName") String databaseName,
          @RequestParam(required = false) String tableName,
          @RequestParam(required = false) String webSocketId,
          Pageable pageable) {

    DataConnection connection = connectionRepository.findOne(connectionId);
    if(connection == null) {
      throw new ResourceNotFoundException(connectionId);
    }

    return ResponseEntity.ok(
        connectionService.searchTables((JdbcDataConnection) connection, databaseName, tableName, webSocketId, pageable)
    );
  }

  @RequestMapping(value = "/connections/{connectionId}/databases/{databaseName}/tables/{tableName}/columns",
          method = RequestMethod.GET,  produces = "application/json")
  public @ResponseBody ResponseEntity<?> queryForListOfDatabasesByConnectionid(
          @PathVariable("connectionId") String connectionId,
          @PathVariable("databaseName") String databaseName,
          @PathVariable("tableName") String tableName,
          @RequestParam(required = false) String webSocketId,
          @RequestParam(required = false) String columnNamePattern,
          Pageable pageable) {

    DataConnection dataConnection = connectionRepository.findOne(connectionId);
    if(dataConnection == null) {
      throw new ResourceNotFoundException("DataConnection(" + connectionId + ")");
    }

    DataSource dataSource = connectionService.getDataSource((JdbcDataConnection) dataConnection, true, webSocketId);
    if(dataSource == null){

    }
    Map<String, Object> columnsMap = connectionService.searchTableColumns((JdbcDataConnection) dataConnection,
            dataSource, databaseName, tableName, columnNamePattern, pageable);

    return ResponseEntity.ok(columnsMap);
  }

  @RequestMapping(value = "/connections/{connectionId}/databases/{databaseName}/tables/{tableName}/information",
          method = RequestMethod.GET,  produces = "application/json")
  public @ResponseBody ResponseEntity<?> getTableInformation(
          @PathVariable("connectionId") String connectionId,
          @PathVariable("databaseName") String databaseName,
          @PathVariable("tableName") String tableName,
          @RequestParam(required = false) String webSocketId) {

    DataConnection dataConnection = connectionRepository.findOne(connectionId);
    if(dataConnection == null) {
      throw new ResourceNotFoundException("DataConnection(" + connectionId + ")");
    }

    DataSource dataSource = connectionService.getDataSource((JdbcDataConnection) dataConnection, true, webSocketId);

    Map<String, Object> tableInfoMap = connectionService.showTableDescription((JdbcDataConnection) dataConnection,
            dataSource, databaseName, tableName);

    return ResponseEntity.ok(tableInfoMap);
  }

  @RequestMapping(value = "/connections/{connectionId}/databases/{databaseName}/change",
          method = RequestMethod.POST,  produces = "application/json")
  public @ResponseBody ResponseEntity<?> changeDatabase(
          @PathVariable("connectionId") String connectionId,
          @PathVariable("databaseName") String databaseName,
          @RequestBody Map<String, String> requestBodyMap) {

    DataConnection dataConnection = connectionRepository.findOne(connectionId);
    if(dataConnection == null) {
      throw new ResourceNotFoundException("DataConnection(" + connectionId + ")");
    }

    String webSocketId = requestBodyMap.get("webSocketId");
    DataSource dataSource = connectionService.getDataSource((JdbcDataConnection) dataConnection, true, webSocketId);

    connectionService.changeDatabase((JdbcDataConnection) dataConnection, dataSource, databaseName);

    //Workbench의 선택된 Database 속성 업데이트
    String workbenchId = requestBodyMap.get("workbenchId");
    if(StringUtils.isNotEmpty(workbenchId)){
      Workbench workbench = workbenchRepository.findOne(workbenchId);
      if(workbench == null){
        throw new ResourceNotFoundException("Workbench(" + workbenchId + ") is not found.");
      }
      workbench.setDatabaseName(databaseName);
      workbenchRepository.saveAndFlush(workbench);
    }

    return ResponseEntity.ok().build();
  }

  @RequestMapping(value = "/connections/{connectionId}/datasource",
          method = RequestMethod.POST,  produces = "application/json")
  public @ResponseBody ResponseEntity<?> createDataSource(
          @PathVariable("connectionId") String connectionId,
          @RequestBody Map<String, String> requestBodyMap) {

    DataConnection dataConnection = connectionRepository.findOne(connectionId);
    if(dataConnection == null) {
      throw new ResourceNotFoundException("DataConnection(" + connectionId + ")");
    }
    String webSocketId = requestBodyMap.get("webSocketId");
    WorkbenchDataSourceUtils.createDataSourceInfo((JdbcDataConnection) dataConnection, webSocketId, true);

    return ResponseEntity.ok().build();
  }

  @RequestMapping(value = "/connections/metadata/tables/jdbc", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> listOfTablesForMdm(@RequestBody ConnectionRequest checkRequest) {
    //Whole Table Name List
    Map<String, Object> tables = connectionService.findTablesInDatabase(checkRequest.getConnection(), checkRequest.getDatabase(), null);
    List<String> tableNameList = (List) tables.get("tables");

    //Staging MetaDataSource List
    Set<MetadataSource> metadataSourceList = metadataSourceRepository.findMetadataSourcesByTypeAndSchemaAndSourceId(
            MetadataSource.MetadataSourceType.JDBC,
            checkRequest.getDatabase(),
            checkRequest.getConnection().getId()
    );

    //extract table name
    Set<String> existTableName = metadataSourceList.stream()
            .map(metadataSource -> metadataSource.getTable())
            .collect(Collectors.toSet());

    //filter already inserted table
    List<String> filteredTableNameList = tableNameList.stream()
            .filter(tableName -> !existTableName.contains(tableName))
            .collect(Collectors.toList());

    Map<String, Object> returnMap = Maps.newHashMap();
    returnMap.put("tables", filteredTableNameList);
    return ResponseEntity.ok(returnMap);
  }

  @RequestMapping(value = "/connections/metadata/tables/stage", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> listOfHiveTablesForMdm(@RequestBody ConnectionRequest checkRequest) {

    //유효성 체크
    SearchParamValidator.checkNull(checkRequest.getDatabase(), "database");

    EngineProperties.HiveConnection hivePropertyConnection = engineProperties.getIngestion().getHive();

    if(hivePropertyConnection == null){
      throw new ResourceNotFoundException("EngineProperties.HiveConnection");
    }

    HiveConnection hiveConnection = new HiveConnection();
    hiveConnection.setUrl(hivePropertyConnection.getUrl());
    hiveConnection.setHostname(hivePropertyConnection.getHostname());
    hiveConnection.setPort(hivePropertyConnection.getPort());
    hiveConnection.setUsername(hivePropertyConnection.getUsername());
    hiveConnection.setPassword(hivePropertyConnection.getPassword());

    //Whole Table Name List
    Map<String, Object> tables = connectionService.findTablesInDatabase(hiveConnection, checkRequest.getDatabase(), null);

    List<String> filteredTableNameList =
            filterTableForMdm((List) tables.get("tables"), checkRequest, MetadataSource.MetadataSourceType.STAGE);

    Map<String, Object> returnMap = Maps.newHashMap();
    returnMap.put("tables", filteredTableNameList);
    return ResponseEntity.ok(returnMap);
  }

  public List<String> filterTableForMdm(List<String> tableNameList,
                                        ConnectionRequest checkRequest,
                                        MetadataSource.MetadataSourceType metadataSourceType){
    //Staging MetaDataSource List
    Set<MetadataSource> metadataSourceList = null;
    switch ( metadataSourceType){
      case JDBC:
        metadataSourceList =
                metadataSourceRepository.findMetadataSourcesByTypeAndSchemaAndSourceId(
                        MetadataSource.MetadataSourceType.JDBC,
                        checkRequest.getDatabase(),
                        checkRequest.getConnection().getId()
                );
        break;
      case STAGE:
        metadataSourceList =
                metadataSourceRepository.findMetadataSourcesByTypeAndSchema(
                        MetadataSource.MetadataSourceType.STAGE,
                        checkRequest.getDatabase()
                );
        break;
    }

    if(metadataSourceList == null || metadataSourceList.size() == 0){
      return tableNameList;
    }

    //extract table name
    Set<String> existTableName = metadataSourceList.stream()
            .map(metadataSource -> metadataSource.getTable())
            .collect(Collectors.toSet());

    //filter already inserted table
    List<String> filteredTableNameList = tableNameList.stream()
            .filter(tableName -> !existTableName.contains(tableName))
            .collect(Collectors.toList());

    return filteredTableNameList;
  }

}

