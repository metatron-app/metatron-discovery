/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.mdm;

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;
import org.springframework.data.rest.core.event.AfterCreateEvent;
import org.springframework.data.rest.core.event.BeforeCreateEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.supercsv.prefs.CsvPreference;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;

import app.metatron.discovery.common.data.projection.DataGrid;
import app.metatron.discovery.common.data.projection.Row;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.activities.ActivityStream;
import app.metatron.discovery.domain.activities.ActivityStreamRepository;
import app.metatron.discovery.domain.activities.spec.ActivityType;
import app.metatron.discovery.domain.activities.spec.Actor;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcCSVWriter;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcConnectionService;
import app.metatron.discovery.domain.datasource.data.DataSourceValidator;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.mdm.preview.MetadataEngineDataPreview;
import app.metatron.discovery.domain.mdm.preview.MetadataJdbcDataPreview;
import app.metatron.discovery.domain.mdm.source.MetaSourceService;
import app.metatron.discovery.domain.mdm.source.MetadataSource;
import app.metatron.discovery.domain.storage.StorageProperties;
import app.metatron.discovery.domain.user.CachedUserService;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workbench.WorkbenchRepository;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.DashboardRepository;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;


@Component
@Transactional
public class MetadataService implements ApplicationEventPublisherAware {

  private static Logger LOGGER = LoggerFactory.getLogger(MetadataService.class);

  @Autowired
  MetaSourceService metaSourceService;

  @Autowired
  JdbcConnectionService jdbcConnectionService;

  @Autowired
  StorageProperties storageProperties;

  @Autowired
  EngineProperties engineProperties;

  @Autowired
  MetadataRepository metadataRepository;

  @Autowired
  EngineQueryService engineQueryService;

  @Autowired
  DataSourceValidator dataSourceValidator;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  ActivityStreamRepository activityStreamRepository;

  @Autowired
  CachedUserService cachedUserService;

  @Autowired
  DashboardRepository dashboardRepository;

  @Autowired
  WorkbenchRepository workbenchRepository;


  private ApplicationEventPublisher publisher;

  @Override
  public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
    this.publisher = applicationEventPublisher;
  }

  /**
   * find metadata from datasource identifier
   */
  @Transactional(readOnly = true)
  public Optional <Metadata> findByDataSource(String dataSourceId) {
    List <Metadata> results = metadataRepository.findBySource(dataSourceId, null, null);
    if (CollectionUtils.isEmpty(results)) {
      return Optional.empty();
    }

    return Optional.of(results.get(0));
  }

  /**
   * Save using datasource information
   */
  public void saveFromDataSource(DataSource dataSource) {
    Optional <Metadata> metadataExist = findByDataSource(dataSource.getId());

    if (metadataExist.isPresent()) {
      return;
    }

    // make metadata from datasource
    Metadata metadata = new Metadata(dataSource);

    metadataRepository.saveAndFlush(metadata);

    LOGGER.info("Successfully saved metadata({}) from datasource({})", metadata.getId(), dataSource.getId());
  }

  /**
   * Update from updated datasource
   */
  public void updateFromDataSource(DataSource dataSource, boolean includeFields) {
    Optional <Metadata> metadata = findByDataSource(dataSource.getId());

    if (!metadata.isPresent()) {
      return;
    }

    Metadata updateMetadata = metadata.get();
    updateMetadata.updateFromDataSource(dataSource, includeFields);

    metadataRepository.save(updateMetadata);
  }

  /**
   * Delete metadata
   */
  public void delete(String... metadataIds) {

    int deleteCnt = 0;
    for (String metadataId : metadataIds) {
      Metadata deletingMetadata = metadataRepository.findOne(metadataId);
      if (deletingMetadata == null) {
        continue;
      }
      metadataRepository.delete(metadataId);
      deleteCnt++;
    }

    LOGGER.info("Successfully delete {} metadata items", deleteCnt);
  }

  @Transactional
  public List<Metadata> createAndReturn(List<Metadata> metadataList){
    List<Metadata> returnBody = new ArrayList<>();
    for(Metadata metadata : metadataList){
      //trigger event
      publisher.publishEvent(new BeforeCreateEvent(metadata));
      Metadata savedObject = metadataRepository.save(metadata);
      publisher.publishEvent(new AfterCreateEvent(savedObject));
      returnBody.add(savedObject);
    }
    return returnBody;
  }

  public DataGrid getDataGrid(Metadata metadata, int limit) {
    DataGrid resultDataGrid = null;
    MetadataSource metadataSource = metadata.getSource();

    //1. SourceType=JDBC
    if (metadataSource.getType() == Metadata.SourceType.JDBC) {
      DataConnection jdbcDataConnection
          = (DataConnection) metaSourceService.getSourcesBySourceId(metadataSource.getType(), metadataSource.getSourceId());
      String query = makeQueryStatementForPreview(metadata);

      MetadataJdbcDataPreview metadataJdbcDataPreview = new MetadataJdbcDataPreview(metadata);
      metadataJdbcDataPreview.setConnectInformation(jdbcDataConnection);
      metadataJdbcDataPreview.setQuery(query);
      metadataJdbcDataPreview.setLimit(limit);
      metadataJdbcDataPreview.getData();

      resultDataGrid = metadataJdbcDataPreview;

    //2. SourceType=ENGINE
    } else if (metadataSource.getType() == Metadata.SourceType.ENGINE) {
      DataSource metadataSourceDetail
          = (DataSource) metaSourceService.getSourcesBySourceId(metadataSource.getType(), metadataSource.getSourceId());

      if(metadataSourceDetail == null){
        throw new ResourceNotFoundException("Metadata Source (" + metadataSource.getType() + " : " + metadataSource.getSourceId() + ") not exist.");
      }

      //2-1. SourceType=ENGINE, ConnectionType=ENGINE
      if(metadataSourceDetail.getConnType() == DataSource.ConnectionType.ENGINE){ //druid
        MetadataEngineDataPreview metadataEngineDataPreview = new MetadataEngineDataPreview(metadata);
        metadataEngineDataPreview.setEngineDataSource(metadataSourceDetail);
        metadataEngineDataPreview.setEngineQueryService(engineQueryService);
        metadataEngineDataPreview.setLimit(limit);
        metadataEngineDataPreview.getData();

        resultDataGrid = metadataEngineDataPreview;

      //2-2. SourceType=ENGINE, ConnectionType=LINK
      } else if (metadataSourceDetail.getConnType() == DataSource.ConnectionType.LINK) { //jdbc
        DataConnection jdbcDataConnection = metadataSourceDetail.getConnection();
        String query = makeQueryStatementForPreview(metadata);
        MetadataJdbcDataPreview metadataJdbcDataPreview = new MetadataJdbcDataPreview(metadata);
        metadataJdbcDataPreview.setConnectInformation(jdbcDataConnection);
        metadataJdbcDataPreview.setQuery(query);
        metadataJdbcDataPreview.setLimit(limit);
        metadataJdbcDataPreview.getData();

        resultDataGrid = metadataJdbcDataPreview;
      }

    //3. SourceType=STAGEDB
    } else if (metadataSource.getType() == Metadata.SourceType.STAGEDB) {
      StorageProperties.StageDBConnection stageDBConnection = storageProperties.getStagedb();

      if (stageDBConnection == null) {
        throw new IllegalArgumentException("Staging Hive DB info. required.");
      }

      DataConnection hiveConnection = new DataConnection();
      hiveConnection.setUrl(stageDBConnection.getUrl());
      hiveConnection.setHostname(stageDBConnection.getHostname());
      hiveConnection.setPort(stageDBConnection.getPort());
      hiveConnection.setUsername(stageDBConnection.getUsername());
      hiveConnection.setPassword(stageDBConnection.getPassword());
      hiveConnection.setImplementor("STAGE");

      String query = makeQueryStatementForPreview(metadata);

      MetadataJdbcDataPreview metadataJdbcDataPreview = new MetadataJdbcDataPreview(metadata);
      metadataJdbcDataPreview.setConnectInformation(hiveConnection);
      metadataJdbcDataPreview.setQuery(query);
      metadataJdbcDataPreview.setLimit(limit);
      metadataJdbcDataPreview.getData();

      resultDataGrid = metadataJdbcDataPreview;
    }

    if(resultDataGrid == null){
      throw new IllegalArgumentException("SourceType (" + metadataSource.getType() + ") is not supported.");
    }
    return resultDataGrid;
  }

  public void getDownloadData(Metadata metadata, String fileName, int limit) {
    DataGrid dataGrid = getDataGrid(metadata, limit);
    try {
      createCSVFile(dataGrid, fileName);
    } catch (Exception e) {
      LOGGER.error("getDownloadData : createCSVFile Exception " + e.getMessage());
    }
  }

  private Connection getConnection(Metadata metadata) {
    MetadataSource metadataSource = metadata.getSource();
    Connection conn = null;

    if (metadataSource.getType() == Metadata.SourceType.JDBC) {

      if (StringUtils.isEmpty(metadataSource.getSourceId())) {
        throw new IllegalArgumentException("DataConnection info. required.");
      }

      DataConnection jdbcDataConnection = (DataConnection) metaSourceService
          .getSourcesBySourceId(metadataSource.getType(), metadataSource.getSourceId());

      JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(jdbcDataConnection);
      try {
        conn = jdbcDataAccessor.getConnection();
      } catch (Exception e) {
        LOGGER.error("getConnection : [Type] Metadata.SourceType.JDBC Exception " + e.getMessage());
      }

    } else if (metadataSource.getType() == Metadata.SourceType.ENGINE) {
      DataSource metadataSourceDetail
          = (DataSource) metaSourceService.getSourcesBySourceId(metadataSource.getType(), metadataSource.getSourceId());
      JdbcAccessor jdbcDataAccessor = null;

      if(metadataSourceDetail.getConnType() == DataSource.ConnectionType.ENGINE){ //druid
        DataConnection jdbcDataConnection = new DataConnection();
        jdbcDataConnection.setImplementor("DRUID");
        jdbcDataConnection.setUrl(makeDruidEngineConnectUrl());

        jdbcDataAccessor = DataConnectionHelper.getAccessor(jdbcDataConnection);
      } else if(metadataSourceDetail.getConnType() == DataSource.ConnectionType.LINK){ //jdbc
        jdbcDataAccessor = DataConnectionHelper.getAccessor(metadataSourceDetail.getConnection());
      }

      try {
        conn = jdbcDataAccessor.getConnection();
      } catch (Exception e) {
        LOGGER.error("getConnection : [Type] Metadata.SourceType.ENGINE Exception " + e.getMessage());
      }
    } else if (metadataSource.getType() == Metadata.SourceType.STAGEDB) {
      StorageProperties.StageDBConnection stageDBConnection = storageProperties.getStagedb();

      if (stageDBConnection == null) {
        throw new IllegalArgumentException("Staging Hive DB info. required.");
      }

      DataConnection hiveConnection = new DataConnection();
      hiveConnection.setUrl(stageDBConnection.getUrl());
      hiveConnection.setHostname(stageDBConnection.getHostname());
      hiveConnection.setPort(stageDBConnection.getPort());
      hiveConnection.setUsername(stageDBConnection.getUsername());
      hiveConnection.setPassword(stageDBConnection.getPassword());
      hiveConnection.setImplementor("STAGE");

      JdbcAccessor jdbcDataAccessor = DataConnectionHelper.getAccessor(hiveConnection);

      try {
        conn = jdbcDataAccessor.getConnection();
      } catch (Exception e) {
        LOGGER.error("getConnection : [Type] Metadata.SourceType.STAGEDB Exception " + e.getMessage());
      }
    }

    if (conn == null) {
      throw new IllegalArgumentException("getConnection is null : " + metadataSource.getSourceId());
    }

    return conn;
  }

  public String getDownloadFilePath(String fileName) {
    String downloadFilePath = null;
    String fileDownalodLocalPath = System.getProperty("user.home") + File.separator + "metadatas" + File.separator + "downloads";

    File file = new File(fileDownalodLocalPath);
    if (!file.exists()) {
      file.mkdirs();
    }

    downloadFilePath = fileDownalodLocalPath + File.separator + fileName + "_" + Calendar.getInstance().getTime().getTime() + ".csv";

    if (downloadFilePath == null) {
      throw new IllegalArgumentException("getDownloadFilePath() : downloadFilePath is null ");
    }

    return downloadFilePath;
  }

  private void createCSVFile(DataGrid dataGrid, String filePath) throws IOException{
    BufferedWriter writer = Files.newBufferedWriter(Paths.get(filePath));

    String[] headers = new String[dataGrid.getColumnCount()];
    CSVFormat csvFormat = CSVFormat.DEFAULT.withHeader(dataGrid.getColumnNames().toArray(headers));

    CSVPrinter csvPrinter = new CSVPrinter(writer, csvFormat);

    for(Row row : dataGrid.getRows()){
      csvPrinter.printRecord(row.values);
    }

    csvPrinter.flush();

    LOGGER.debug("created csv file to : {}", filePath);
  }

  private void createCSVFile(Connection connection, String query, String fileName, int limit) throws IOException {

    try {
      JdbcCSVWriter jdbcCSVWriter = new JdbcCSVWriter(new FileWriter(fileName), CsvPreference.STANDARD_PREFERENCE);
      jdbcCSVWriter.setConnection(connection);
      jdbcCSVWriter.setFetchSize(1000);
      jdbcCSVWriter.setMaxRow(limit);
      jdbcCSVWriter.setQuery(query);
      jdbcCSVWriter.setFileName(fileName);
      jdbcCSVWriter.write();
    } catch (Exception e) {
      LOGGER.error(e.getMessage());
    }
  }

  private String makeDruidEngineConnectUrl() {

    String druidHost = engineProperties.getHostname().get("broker");
    StringBuilder stringBuilder = new StringBuilder();

    stringBuilder.append("jdbc:avatica:remote:url=")
        .append(druidHost)
        .append("/druid/v2/sql/avatica/");

    return stringBuilder.toString();
  }

  private String makeQueryStatementForPreview(Metadata metadata) {
    String queryString = null;
    MetadataSource metadataSource = metadata.getSource();

    DataConnection jdbcConnection = null;
    JdbcIngestionInfo.DataType type = null;   //TABLE, QUERY
    String schema = null;
    String query = null;  //tableName or query

    //1. SourceType=ENGINE
    if (metadataSource.getType() == Metadata.SourceType.ENGINE) {
      DataSource metadataSourceDetail
          = (DataSource) metaSourceService.getSourcesBySourceId(metadataSource.getType(), metadataSource.getSourceId());

      //1-1. SourceType=ENGINE, ConnectionType=ENGINE
      if (metadataSourceDetail.getConnType() == DataSource.ConnectionType.ENGINE){ //druid
        jdbcConnection = new DataConnection();
        jdbcConnection.setImplementor("DRUID");
        schema = "druid";
        query = metadataSourceDetail.getEngineName();
        type = JdbcIngestionInfo.DataType.TABLE;

        //1-2. SourceType=ENGINE, ConnectionType=LINKED
      } else if (metadataSourceDetail.getConnType() == DataSource.ConnectionType.LINK){ //jdbc
        JdbcIngestionInfo jdbcInfo = metadataSourceDetail.getIngestionInfoByType();
        jdbcConnection = metadataSourceDetail.getJdbcConnectionForIngestion();
        schema = jdbcInfo.getDatabase();
        query = jdbcInfo.getQuery();
        type = jdbcInfo.getDataType();
      }

    //2. SourceType=JDBC
    } else if (metadataSource.getType() == Metadata.SourceType.JDBC){
      jdbcConnection
          = (DataConnection) metaSourceService.getSourcesBySourceId(metadataSource.getType(), metadataSource.getSourceId());
      schema = metadataSource.getSchema();
      query = metadataSource.getTable();
      type = JdbcIngestionInfo.DataType.TABLE;

    //3. SourceType=STAGEDB
    } else if (metadataSource.getType() == Metadata.SourceType.STAGEDB){
      jdbcConnection = new DataConnection();
      jdbcConnection.setImplementor("STAGE");
      schema = metadataSource.getSchema();
      query = metadataSource.getTable();
      type = JdbcIngestionInfo.DataType.TABLE;
    }

    queryString = jdbcConnectionService.generateSelectQuery(jdbcConnection, schema, type, query, null);
    return queryString;
  }

  public List<?> getFrequentUser(Metadata metadata, int maxCount){
    Metadata.SourceType sourceType = metadata.getSourceType();
    LOGGER.debug("Getting frequent top 3 user about : {}", sourceType);

    List<Map> accessTop3List = new ArrayList<>();
    switch (sourceType){
      case ENGINE:
        //getting DataSourceId
        String dataSourceId = metadata.getSource().getSourceId();

        //getting Dashboard list that use the datasource
        Set<DashBoard> dashboardsInDataSource = dataSourceRepository.findDashboardsInDataSource(dataSourceId);

        //extract dashboard id
        List<String> dashboardIdList = dashboardsInDataSource.stream()
                                                             .map(dashBoard -> dashBoard.getId())
                                                             .collect(Collectors.toList());

        //we need just VIEW Action
        List<ActivityType> activityTypes = Lists.newArrayList(ActivityType.VIEW);

        //between 1 month
        DateTime toDatetime = DateTime.now();
        DateTime fromDatetime = toDatetime.minusMonths(1);

        List<Map<String, Object>> activityInfoList
            = activityStreamRepository.getActivityCountByUser(dashboardIdList, activityTypes, Actor.ActorType.PERSON,
                                                              fromDatetime, toDatetime);

        LOGGER.debug("Activity Count By User List : {}", activityInfoList.size());

        //top 3
        for(int i = 0; i < Math.min(maxCount, activityInfoList.size()); i++){
          Map<String, Object> activityInfo = activityInfoList.get(i);
          Long activityId = (Long) activityInfo.get("ID");
          Long activityCount = (Long) activityInfo.get("CNT");

          //get Recent Activity
          ActivityStream activityStream = activityStreamRepository.findOne(activityId);

          LOGGER.debug("User({}), Count({}), Date({})", activityStream.getActor(), activityCount, activityStream.getPublishedTime());

          //get user info
          User actor = cachedUserService.findUser(activityStream.getActor());
          //get dashboard info

          DashBoard dashBoard = dashboardRepository.findOne(activityStream.getObjectId());

          Map<String, Object> accessMap = new HashMap<>();
          accessMap.put("user", actor);
          accessMap.put("dashboard", dashBoard);
          accessMap.put("count", activityCount);
          accessMap.put("lastPublishedTime", activityStream.getPublishedTime());

          accessTop3List.add(accessMap);
        }
        break;
      case STAGEDB:
        break;
      case JDBC:
        int topCnt = getRandomNumberInRange(0, 3);
        List<Workbench> workbenches = workbenchRepository.findAll();

        for(int i = 0; i < Math.min(topCnt, workbenches.size()); ++i){
          Map<String, Object> top1User = new HashMap<>();
          top1User.put("count", 10);
          top1User.put("lastPublishedTime", DateTime.now());
          top1User.put("user", cachedUserService.findUser("admin"));
          top1User.put("workbench", workbenches.get(i));
          accessTop3List.add(top1User);
        }
        break;
      default:

        break;
    }
    return accessTop3List;
  }

  private int getRandomNumberInRange(int min, int max) {

    if (min >= max) {
      throw new IllegalArgumentException("max must be greater than min");
    }

    Random r = new Random();
    return r.nextInt((max - min) + 1) + min;
  }

  public List<?> getUpdateHistory(Metadata metadata){
    List<Map> updatedList = new ArrayList<>();
    int cnt = getRandomNumberInRange(1, 5);
    for(int i = 0; i < cnt; ++i){
      Map<String, Object> top1User = new HashMap<>();
      top1User.put("createdTime", DateTime.now());
      top1User.put("user", cachedUserService.findUser("admin"));
      if(i == 0){
        top1User.put("contents", "initial created.");
      } else {
        top1User.put("contents", "modified" + i);
      }
      updatedList.add(top1User);
    }
    return updatedList;
  }
}
