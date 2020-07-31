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
import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.RevisionType;
import org.hibernate.envers.query.AuditEntity;
import org.hibernate.envers.query.AuditQuery;
import org.hibernate.proxy.HibernateProxy;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;

import app.metatron.discovery.common.data.projection.DataGrid;
import app.metatron.discovery.common.data.projection.Row;
import app.metatron.discovery.common.entity.DomainType;
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
import app.metatron.discovery.domain.datasource.ingestion.jdbc.LinkIngestionInfo;
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.favorite.Favorite;
import app.metatron.discovery.domain.favorite.FavoriteRepository;
import app.metatron.discovery.domain.favorite.FavoriteService;
import app.metatron.discovery.domain.mdm.preview.MetadataEngineDataPreview;
import app.metatron.discovery.domain.mdm.preview.MetadataJdbcDataPreview;
import app.metatron.discovery.domain.mdm.source.MetaSourceService;
import app.metatron.discovery.domain.mdm.source.MetadataSource;
import app.metatron.discovery.domain.revision.MetatronRevisionEntity;
import app.metatron.discovery.domain.storage.StorageProperties;
import app.metatron.discovery.domain.tag.Tag;
import app.metatron.discovery.domain.tag.TagDomain;
import app.metatron.discovery.domain.tag.TagDomainRepository;
import app.metatron.discovery.domain.tag.TagRepository;
import app.metatron.discovery.domain.user.CachedUserService;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.workbench.QueryEditor;
import app.metatron.discovery.domain.workbench.QueryHistory;
import app.metatron.discovery.domain.workbench.QueryHistoryRepository;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workbench.WorkbenchRepository;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.DashboardRepository;
import app.metatron.discovery.domain.workbook.WorkBook;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspacePermissions;
import app.metatron.discovery.domain.workspace.WorkspaceService;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.HibernateUtils;


@Component("metadataService")
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
  MetadataColumnRepository metadataColumnRepository;

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

  @Autowired
  QueryHistoryRepository queryHistoryRepository;

  @Autowired
  WorkspaceService workspaceService;

  @Autowired
  EntityManager entityManager;

  @Autowired
  FavoriteService favoriteService;

  @Autowired
  FavoriteRepository favoriteRepository;

  @Autowired
  TagRepository tagRepository;

  @Autowired
  TagDomainRepository tagDomainRepository;

  @Autowired
  MetadataPopularityService metadataPopularityService;

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

        //if jdbcDataConnection is not exist, check ingestion conf
        if(jdbcDataConnection == null){
          LinkIngestionInfo ingestionInfo = (LinkIngestionInfo) metadataSourceDetail.getIngestionInfo();
          jdbcDataConnection = ingestionInfo.getConnection();
        }

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

    queryString = jdbcConnectionService.generateSelectQuery(jdbcConnection, schema, type, query, null, 50);
    return queryString;
  }

  public List<?> getFrequentUser(Metadata metadata, int maxCount){
    Metadata.SourceType sourceType = metadata.getSourceType();
    LOGGER.debug("Getting frequent top {} user about : {}", maxCount, sourceType);

    List<Map> frequentUserList = new ArrayList<>();
    switch (sourceType){
      case ENGINE:
        //getting DataSourceId
        String dataSourceId = metadata.getSource().getSourceId();

        //getting Dashboard list that use the datasource
        Set<DashBoard> dashboardsInDataSource = dataSourceRepository.findDashboardsInDataSource(dataSourceId);

        //If no dashboard uses this data source, it returns an empty list.
        if(dashboardsInDataSource.isEmpty()){
          break;
        }

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

          //get Workbook
          WorkBook workbook = HibernateUtils.unproxy(dashBoard.getWorkBook());

          //get Workspace Permission
          Workspace workspace = workbook.getWorkspace();
          Boolean hasPermission = getWorkspacePermission(workspace, WorkspacePermissions.PERM_WORKSPACE_VIEW_WORKBOOK);

          Map<String, Object> accessMap = new HashMap<>();
          accessMap.put("user", actor);
          accessMap.put("dashboard", dashBoard);
          accessMap.put("workbook", workbook);
          accessMap.put("hasPermission", hasPermission);
          accessMap.put("count", activityCount);
          accessMap.put("lastPublishedTime", activityStream.getPublishedTime());

          frequentUserList.add(accessMap);
        }
        break;
      case STAGEDB:
        break;
      case JDBC:
        //getting DataConnectionId
        String dataConnectionId = metadata.getSource().getSourceId();

        List queryHistoryCountByUser
            = queryHistoryRepository.countHistoryByUserAndDataConnection(DateTime.now().minusMonths(100), dataConnectionId);

        //top 3
        for(int i = 0; i < Math.min(maxCount, queryHistoryCountByUser.size()); i++){
          Map<String, Object> queryHistoryInfo = (Map) queryHistoryCountByUser.get(i);
          Long queryHistoryId = (Long) queryHistoryInfo.get("ID");
          Long queryHistoryCount = (Long) queryHistoryInfo.get("CNT");

          //get RecentQueryHistory
          QueryHistory queryHistory = queryHistoryRepository.findOne(queryHistoryId);

          QueryEditor queryEditor = queryHistory.getQueryEditor();

          Workbench workbench = queryEditor == null ? null : queryEditor.getWorkbench();

          //get user info
          User actor = cachedUserService.findUser(queryHistory.getCreatedBy());

          //get Workspace Permission
          Workspace workspace = workbench.getWorkspace();
          Boolean hasPermission = getWorkspacePermission(workspace, WorkspacePermissions.PERM_WORKSPACE_VIEW_WORKBENCH);

          Map<String, Object> accessMap = new HashMap<>();
          accessMap.put("user", actor);
          accessMap.put("workbench", HibernateUtils.unproxy(workbench));
          accessMap.put("count", queryHistoryCount);
          accessMap.put("hasPermission", hasPermission);
          accessMap.put("lastPublishedTime", queryHistory.getCreatedTime());
          frequentUserList.add(accessMap);
        }
        break;
      default:

        break;
    }
    return frequentUserList;
  }

  public List<?> getUpdateHistory(Metadata metadata, int limit){
    List<Map> historyList = new ArrayList<>();

    //metadata revision list
    AuditReader auditReader = AuditReaderFactory.get(entityManager);
    AuditQuery metadataAuditQuery = auditReader.createQuery()
                                               .forRevisionsOfEntityWithChanges(Metadata.class, true)
                                               .add(AuditEntity.id().eq(metadata.getId()))
                                               .addOrder(AuditEntity.revisionNumber().desc());
    if(limit > 0){
      metadataAuditQuery.setMaxResults(limit);
    }
    List<Object[]> metadataList = metadataAuditQuery.getResultList();

    metadataList.stream().forEach(objectArr -> {
      Metadata metadataEntity = (Metadata) objectArr[0];
      MetatronRevisionEntity revisionEntity = (MetatronRevisionEntity) objectArr[1];
      RevisionType revisionType = (RevisionType) objectArr[2];
      String contents = "";
      if(revisionType == RevisionType.ADD){
        contents = "Metadata Created.";
      } else if(revisionType == RevisionType.DEL){
        contents = "Metadata Deleted.";
      } else if(revisionType == RevisionType.MOD){
        Set<String> propertiesChanged = (Set<String>) objectArr[3];
        contents = "Metadata Changed." +
            " Fields : " + StringUtils.join(propertiesChanged, ",") + "";
      }

      Map<String, Object> revisionMap = new HashMap<>();
      revisionMap.put("createdTime", revisionEntity.getRevisionDate());
      revisionMap.put("user", cachedUserService.findUser(revisionEntity.getUsername()));
      revisionMap.put("contents", contents);
      revisionMap.put("revisionType", revisionType);
      historyList.add(revisionMap);
    });

    //metadata column revision list
    AuditQuery auditQuery = auditReader.createQuery()
                                       .forRevisionsOfEntityWithChanges(MetadataColumn.class, true)
                                       .add(AuditEntity.relatedId("metadata").eq(metadata.getId()))
                                       .addOrder(AuditEntity.revisionNumber().desc());
    if(limit > 0){
      auditQuery.setMaxResults(limit);
    }
    List<Object[]> columnList = auditQuery.getResultList();

    columnList.stream().forEach(objectArr -> {
      MetadataColumn metadataColumn = (MetadataColumn) objectArr[0];
      MetatronRevisionEntity revisionEntity = (MetatronRevisionEntity) objectArr[1];
      RevisionType revisionType = (RevisionType) objectArr[2];

      String contents = "";
      if(revisionType == RevisionType.ADD){
        contents = "Column Created.";
      } else if(revisionType == RevisionType.DEL){
        contents = "Column Deleted.";
      } else if(revisionType == RevisionType.MOD){
        Set<String> propertiesChanged = (Set<String>) objectArr[3];
        contents = "Column Changed." +
            " Column : " + metadataColumn.getPhysicalName() +
            ", Fields : " + StringUtils.join(propertiesChanged, ",");
      }

      Map<String, Object> revisionMap = new HashMap<>();
      revisionMap.put("createdTime", revisionEntity.getRevisionDate());
      revisionMap.put("user", cachedUserService.findUser(revisionEntity.getUsername()));
      revisionMap.put("contents", contents);
      revisionMap.put("revisionType", revisionType);
      historyList.add(revisionMap);
    });

    //order by createdTime desc
    historyList.sort((a, b) -> {
      Date aDate = (Date) a.get("createdTime");
      Date bDate = (Date) b.get("createdTime");
      if(aDate.getTime() == bDate.getTime()){
        return 0;
      } else if(aDate.getTime() > bDate.getTime()){
        return -1;
      } else {
        return 1;
      }
    });

    if(limit > 0 && historyList.size() > limit){
      while(historyList.size() > limit){
        historyList.remove(historyList.size() - 1);
      }
    }

    return historyList;
  }

  public Boolean getWorkspacePermission(Object workspace, String permission){
    Boolean hasPermission = false;

    Workspace targetWorkspace = null;

    if(workspace instanceof Workspace){
      targetWorkspace = (Workspace) workspace;
    } else if(workspace instanceof HibernateProxy){
      targetWorkspace = (Workspace) HibernateUtils.unproxy(workspace);
    }

    if(targetWorkspace != null && targetWorkspace.getActive()){
      if(Workspace.PublicType.SHARED.equals(targetWorkspace.getPublicType()) && targetWorkspace.getPublished()){
        hasPermission = true;
      } else {
        Set<String> permissions = workspaceService.getPermissions(targetWorkspace);
        hasPermission = permissions.contains(permission);
      }
    }
    return hasPermission;
  }

  public Page<?> getRelatedEntityByMetadata(Metadata metadata, Pageable pageable){
    Metadata.SourceType sourceType = metadata.getSourceType();
    Page<?> relatedEntityPage = null;
    switch (sourceType){
      case ENGINE:
        MetadataSource metadataSource = metadata.getSource();
        DataSource metadataSourceDetail
            = (DataSource) metaSourceService.getSourcesBySourceId(metadataSource.getType(), metadataSource.getSourceId());

        if(metadataSourceDetail == null){
          throw new ResourceNotFoundException("Metadata Source (" + metadataSource.getType() + " : " + metadataSource.getSourceId() + ") not exist.");
        }

        //getting dashboard list reference metadata
        Page<DashBoard> dashBoardPage = dashboardRepository.findAllByDataSources(Lists.newArrayList(metadataSourceDetail), pageable);

        if(dashBoardPage.hasContent()){
          List<DashBoard> dashBoardList = dashBoardPage.getContent();
          List<Map> dashBoardWithPermission = new ArrayList<>();
          List<DashBoard> dashBoardWithPermission2 = new ArrayList<>();

          dashBoardList.stream().forEach(
              dashBoard -> {

                //get Workbook
                WorkBook workbook = HibernateUtils.unproxy(dashBoard.getWorkBook());

                //get Workspace Permission
                Workspace workspace = workbook.getWorkspace();
                Boolean hasPermission = getWorkspacePermission(workspace, WorkspacePermissions.PERM_WORKSPACE_VIEW_WORKBOOK);

                Map<String, Object> dashBoardMap = new HashMap<>();
                dashBoardMap.put("dashboard", dashBoard);
                dashBoardMap.put("workbook", workbook);
                dashBoardMap.put("hasPermission", hasPermission);
                dashBoardWithPermission.add(dashBoardMap);
                dashBoardWithPermission2.add(dashBoard);
              }
          );
          relatedEntityPage = new PageImpl(dashBoardWithPermission2, pageable, dashBoardPage.getTotalElements());
        } else {
          relatedEntityPage = new PageImpl(Lists.newArrayList(), pageable, 0);
        }
        break;
      default:
        //default blank page
        //need implement additional sourceTypes later
        relatedEntityPage = new PageImpl(Lists.newArrayList(), pageable, 0);
        break;
    }
    return relatedEntityPage;
  }

  public Page<Metadata> getMyFavoriteMetadatas(Pageable pageable){
    // getting favorites....
    Page<Favorite> favorites = favoriteRepository.findByCreatedByAndDomainType(AuthUtils.getAuthUserName(), DomainType.METADATA, pageable);

    Page<Metadata> metadataPage = null;

    if(favorites.getContent() == null || favorites.getContent().isEmpty()){
      metadataPage = new PageImpl<>(Lists.newArrayList(), pageable, favorites.getTotalElements());
    } else {
      // metadata id list
      List<String> metadataIdList = favorites.getContent()
                                             .stream()
                                             .map(favorite -> favorite.getTargetId())
                                             .collect(Collectors.toList());

      // getting metadata
      List<Metadata> metadatas = metadataRepository.findByIdIn(metadataIdList);

      //add projection property
      addProjectionProperties(metadatas);

      //sort by favorites order
      metadatas.sort((a, b) -> {
        int aIndex = metadataIdList.indexOf(a.getId());
        int bIndex = metadataIdList.indexOf(b.getId());
        if(aIndex == bIndex){
          return 0;
        } else if(aIndex > bIndex){
          return 1;
        } else {
          return -1;
        }
      });
      metadataPage = new PageImpl<>(metadatas, pageable, favorites.getTotalElements());
    }

    return metadataPage;
  }

  public void addProjectionProperties(List<Metadata> metadataList){
    markFavorite(metadataList);
    findTags(metadataList);
    findPopularities(metadataList);
  }

  public List<Metadata> markFavorite(List<Metadata> metadataList){
    if(metadataList != null && !metadataList.isEmpty()){
      List<String> metadataIds = metadataList.stream().map(metadata -> metadata.getId()).collect(Collectors.toList());
      List<String> favoriteMetadataList = favoriteService.getFavoriteDomainIdList(metadataIds, DomainType.METADATA);
      if(favoriteMetadataList != null && !favoriteMetadataList.isEmpty()){
        metadataList.stream()
                    .filter(metadata -> favoriteMetadataList.contains(metadata.getId()))
                    .forEach(metadata -> metadata.setFavorite(true));
      }
    }
    return metadataList;
  }

  public List<Metadata> findTags(List<Metadata> metadataList){
    if(metadataList != null && !metadataList.isEmpty()){
      List<String> metadataIds = metadataList.stream().map(metadata -> metadata.getId()).collect(Collectors.toList());

      //tag domain list
      List<TagDomain> tagDomainList = tagDomainRepository.findByDomainTypeAndDomainIdIn(DomainType.METADATA, metadataIds);

      List<String> tagIdList = tagDomainList.stream().map(tagDomain -> tagDomain.getTag().getId()).collect(Collectors.toList());

      //extract tag id
      List<Tag> tagList = tagRepository.findAll(tagIdList);

      if(tagList != null && !tagList.isEmpty()){
        //convert list to map by metadataId
        Map<String, List<Tag>> tagByMetadataIdMap = new HashMap<>();
        tagDomainList.stream().forEach(tagDomain -> {
          String metadataId = tagDomain.getDomainId();
          List<Tag> tagListInMap = tagByMetadataIdMap.get(metadataId);
          if(tagListInMap == null){
            tagListInMap = Lists.newArrayList();
            tagByMetadataIdMap.put(metadataId, tagListInMap);
          }
          tagListInMap.add(tagDomain.getTag());
        });

        metadataList.stream().forEach(metadata -> {
          metadata.setTags(tagByMetadataIdMap.get(metadata.getId()));
        });

      }
    }
    return metadataList;
  }

  public List<Metadata> findPopularities(List<Metadata> metadataList){
    if(metadataList != null && !metadataList.isEmpty()){
      List<String> metadataIds = metadataList.stream().map(metadata -> metadata.getId()).collect(Collectors.toList());
      List<MetadataPopularity> popularities = metadataPopularityService.getPopularity(metadataIds);

      metadataList.stream().forEach(metadata -> {
        Optional<MetadataPopularity> metadataPopularity =
            popularities.stream().filter(popularity -> popularity.getMetadataId().equals(metadata.getId())).findFirst();

        if(metadataPopularity.isPresent()){
          metadata.setPopularity(metadataPopularity.get().popularity);
        } else {
          metadata.setPopularity(0.0);
        }
      });
    }

    return metadataList;
  }

  public boolean isFavorite(Metadata metadata){
    return favoriteService.isFavorite(metadata.getId(), DomainType.METADATA);
  }
}
