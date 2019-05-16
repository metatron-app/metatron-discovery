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

package app.metatron.discovery.domain.datasource;

import com.google.common.collect.Lists;

import com.querydsl.core.types.Predicate;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.Interval;
import org.joda.time.Period;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.common.criteria.ListCriterion;
import app.metatron.discovery.common.criteria.ListCriterionType;
import app.metatron.discovery.common.criteria.ListFilter;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.engine.model.SegmentMetaDataResponse;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataService;
import app.metatron.discovery.domain.storage.StorageProperties;
import app.metatron.discovery.domain.user.DirectoryProfile;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.user.group.GroupMember;
import app.metatron.discovery.domain.user.group.GroupMemberRepository;
import app.metatron.discovery.domain.user.group.GroupService;
import app.metatron.discovery.domain.user.role.RoleDirectory;
import app.metatron.discovery.domain.user.role.RoleDirectoryRepository;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspaceRepository;
import app.metatron.discovery.domain.workspace.WorkspaceService;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.granularities.DurationGranularity;
import app.metatron.discovery.query.druid.granularities.PeriodGranularity;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.PolarisUtils;

import static app.metatron.discovery.domain.datasource.DataSourceTemporary.ID_PREFIX;

/**
 * Created by kyungtaak on 2017. 5. 12..
 */
@Component
@Transactional
public class DataSourceService {

  private static Logger LOGGER = LoggerFactory.getLogger(DataSourceService.class);

  @Autowired
  EngineQueryService queryService;

  @Autowired
  MetadataService metadataService;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  DataSourceTemporaryRepository temporaryRepository;

  @Autowired
  DruidEngineMetaRepository engineMetaRepository;

  @Autowired
  WorkspaceRepository workspaceRepository;

  @Autowired
  WorkspaceService workspaceService;

  @Autowired
  UserRepository userRepository;

  @Autowired
  GroupService groupService;

  @Autowired
  RoleDirectoryRepository roleDirectoryRepository;

  @Autowired
  GroupMemberRepository groupMemberRepository;

  @Autowired
  DataSourceProperties dataSourceProperties;

  @Autowired
  StorageProperties storageProperties;

  /**
   * 데이터 소스 엔진 적재시 name 을 기반으로 engin 내 데이터 소스 지정
   */
  public DataSource importEngineDataSource(String engineName, DataSource reqDataSource) {

    SegmentMetaDataResponse segmentMetaData = queryService.segmentMetadata(engineName);

    DataSource dataSource = new DataSource();
    dataSource.setName(StringUtils.isEmpty(reqDataSource.getName()) ? engineName : reqDataSource.getName());
    dataSource.setDescription(reqDataSource.getDescription());
    dataSource.setEngineName(engineName);
    dataSource.setSrcType(DataSource.SourceType.IMPORT);
    dataSource.setConnType(DataSource.ConnectionType.ENGINE);
    dataSource.setDsType(DataSource.DataSourceType.MASTER);

    dataSource.setGranularity(isEmptyGranularity(segmentMetaData.getQueryGranularity())? DataSource.GranularityType.NONE
        : getGranularityType(segmentMetaData.getQueryGranularity()));

    dataSource.setSegGranularity(isEmptyGranularity(segmentMetaData.getSegmentGranularity()) ? DataSource.GranularityType.DAY
        : getGranularityType(segmentMetaData.getSegmentGranularity()));

    dataSource.setStatus(DataSource.Status.ENABLED);
    dataSource.setFields(segmentMetaData.getConvertedField(reqDataSource.getFields()));

    // save datasource and metadata at the same time
    DataSource importedDataSource = dataSourceRepository.saveAndFlush(dataSource);
    metadataService.saveFromDataSource(importedDataSource);

    return importedDataSource;
  }

  private boolean isEmptyGranularity(Granularity granularity) {
    if (granularity == null) {
      return true;
    } else if (granularity instanceof SimpleGranularity && ((SimpleGranularity) granularity).getValue() == null) {
      return true;
    } else {
      return false;
    }
  }

  public DataSource.GranularityType getGranularityType(Granularity granularity) {

    if (granularity instanceof PeriodGranularity) {
      Period period = Period.parse(((PeriodGranularity) granularity).getPeriod());
      return DataSource.GranularityType.fromPeriod(period);
    } else if (granularity instanceof DurationGranularity) {
      Interval interval = Interval.parse(((DurationGranularity) granularity).getDuration());
      return  DataSource.GranularityType.fromInterval(interval);
    } else {
      return DataSource.GranularityType.valueOf(((SimpleGranularity) granularity).getValue());
    }

  }

  public void setDataSourceStatus(String datasourceId, DataSource.Status status, DataSourceSummary summary, Boolean failOnEngine) {
    DataSource dataSource = dataSourceRepository.findOne(datasourceId);
    dataSource.setStatus(status);
    dataSource.setFailOnEngine(failOnEngine);
    dataSource.setSummary(summary);
  }

  @Transactional(readOnly = true)
  public List<DataSourceTemporary> getMatchedTemporaries(String dataSourceId, List<Filter> filters) {

    List<DataSourceTemporary> matchedTempories = Lists.newArrayList();
    List<DataSourceTemporary> temporaries = temporaryRepository.findByDataSourceIdOrderByModifiedTimeDesc(dataSourceId);

    for (DataSourceTemporary temporary : temporaries) {
      List<Filter> originalFilters = temporary.getFilterList();
      // Filter 설정을 비교대상 모두 하지 않은 경우, matched
      if (CollectionUtils.isEmpty(originalFilters) && CollectionUtils.isEmpty(filters)) {
        matchedTempories.add(temporary);
        continue;
      }

      // Filter 설정이 둘중 한쪽이 없는 경우, pass
      if (originalFilters == null || filters == null) {
        continue;
      }

      // Filter 개수가 다른 경우, pass
      if (!(originalFilters.size() == filters.size())) {
        continue;
      }

      boolean compareResult = true;
      for (int i = 0; i < originalFilters.size(); i++) {
        Filter originalFilter = originalFilters.get(i);
        Filter reqFilter = filters.get(i);

        if (!originalFilter.compare(reqFilter)) {
          compareResult = false;
          break;
        }
      }

      if (compareResult) {
        matchedTempories.add(temporary);
      }

    }

    return matchedTempories;
  }

  /**
   * 데이터 소스 엔진 적재시 name 을 기반으로 engin 내 데이터 소스 지정
   */
  @Transactional(readOnly = true)
  public List<String> findImportAvailableEngineDataSource() {

    List<String> engineDataSourceNames = engineMetaRepository.getAllDataSourceNames();
    List<String> mappedEngineNames = dataSourceRepository.findEngineNameByAll();

    for (String mappedEngineName : mappedEngineNames) {
      engineDataSourceNames.remove(mappedEngineName);
    }

    return engineDataSourceNames;
  }

  /**
   * 데이터 소스 엔진 적재시 name 을 기반으로 engine 내 데이터 소스 지정
   */
  @Transactional(readOnly = true)
  public String convertName(String name) {

    String tempName = PolarisUtils.convertDataSourceName(name);

    StringBuilder newName = new StringBuilder();
    newName.append(tempName);

    List<DataSource> dataSources = dataSourceRepository.findByEngineNameStartingWith(tempName);
    if (CollectionUtils.isNotEmpty(dataSources)) {
      newName.append("_").append(dataSources.size());
    }

    return newName.toString();
  }

  /**
   * 데이터 소스 상세 조회 (임시 데이터 소스도 함께 조회 가능)
   */
  @Transactional(readOnly = true)
  public DataSource findDataSourceIncludeTemporary(String dataSourceId, Boolean includeUnloadedField) {

    DataSource dataSource;
    if (dataSourceId.indexOf(ID_PREFIX) == 0) {
      LOGGER.debug("Find temporary datasource : {}", dataSourceId);

      DataSourceTemporary temporary = temporaryRepository.findOne(dataSourceId);
      if (temporary == null) {
        throw new ResourceNotFoundException(dataSourceId);
      }

      dataSource = dataSourceRepository.findOne(temporary.getDataSourceId());
      if (dataSource == null) {
        throw new DataSourceTemporaryException(DataSourceErrorCodes.VOLATILITY_NOT_FOUND_CODE,
                                               "Not found related datasource :" + temporary.getDataSourceId());
      }

      dataSource.setEngineName(temporary.getName());
      dataSource.setTemporary(temporary);

    } else {
      dataSource = dataSourceRepository.findOne(dataSourceId);
      if (dataSource == null) {
        throw new ResourceNotFoundException(dataSourceId);
      }
    }

    if (BooleanUtils.isNotTrue(includeUnloadedField)) {
      dataSource.excludeUnloadedField();
    }

    return dataSource;
  }

  /**
   * 데이터 소스 다건 상세 조회 (임시 데이터 소스도 함께 조회 가능)
   */
  @Transactional(readOnly = true)
  public List<DataSource> findMultipleDataSourceIncludeTemporary(List<String> dataSourceIds, Boolean includeUnloadedField) {

    List<String> temporaryIds = dataSourceIds.stream()
                                             .filter(s -> s.indexOf(ID_PREFIX) == 0)
                                             .collect(Collectors.toList());
    List<String> multipleIds = dataSourceIds.stream()
                                            .filter(s -> s.indexOf(ID_PREFIX) != 0)
                                            .collect(Collectors.toList());

    List<DataSource> dataSources = dataSourceRepository.findByDataSourceMultipleIds(multipleIds);

    for (String temporaryId : temporaryIds) {
      dataSources.add(findDataSourceIncludeTemporary(temporaryId, includeUnloadedField));
    }

    return dataSources;
  }

  public List<ListCriterion> getListCriterion() {

    List<ListCriterion> criteria = new ArrayList<>();

    //Status
    criteria.add(new ListCriterion(DataSourceListCriterionKey.STATUS,
                                   ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.status"));

    //Publish
    criteria.add(new ListCriterion(DataSourceListCriterionKey.PUBLISH,
                                   ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.publish", true));

    //Creator
    criteria.add(new ListCriterion(DataSourceListCriterionKey.CREATOR,
                                   ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.creator", true));

    //CreatedTime
    ListCriterion createdTimeCriterion
        = new ListCriterion(DataSourceListCriterionKey.CREATED_TIME,
                            ListCriterionType.RANGE_DATETIME, "msg.storage.ui.criterion.created-time");
    createdTimeCriterion.addFilter(new ListFilter(DataSourceListCriterionKey.CREATED_TIME,
                                                  "createdTimeFrom", "createdTimeTo", "", "",
                                                  "msg.storage.ui.criterion.created-time"));
    criteria.add(createdTimeCriterion);

    //DateTime
    //    criteria.add(new ListCriterion(DataSourceListCriterionKey.DATETIME,
    //            ListCriterionType.RADIO, "msg.storage.ui.criterion.datetime"));

    //more
    ListCriterion moreCriterion = new ListCriterion(DataSourceListCriterionKey.MORE,
                                                    ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.more");
    //    DateTime currentDateTime = DateTime.now();
    //    DateTime recentlyDateTime = currentDateTime.minusDays(7);
    //    String fromStr = recentlyDateTime.toString();
    //    String toStr = currentDateTime.toString();
    //    moreCriterion.addFilter(new ListFilter(DataSourceListCriterionKey.MODIFIED_TIME,
    //            "modifiedTimeFrom", "modifiedTimeTo", "", "",
    //            "msg.storage.ui.criterion.modified-time"));
    //    moreCriterion.addFilter(new ListFilter(DataSourceListCriterionKey.CREATED_TIME,
    //            "createdTimeFrom", "createdTimeTo", fromStr, toStr,
    //            "msg.storage.ui.criterion.recently-created-time"));

    moreCriterion.addSubCriterion(new ListCriterion(DataSourceListCriterionKey.MODIFIED_TIME,
                                                    ListCriterionType.RANGE_DATETIME, "msg.storage.ui.criterion.modified-time"));
    moreCriterion.addSubCriterion(new ListCriterion(DataSourceListCriterionKey.CONNECTION_TYPE,
                                                    ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.connection-type"));
    //    moreCriterion.addSubCriterion(new ListCriterion(DataSourceListCriterionKey.DATASOURCE_TYPE,
    //            ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.ds-type"));
    moreCriterion.addSubCriterion(new ListCriterion(DataSourceListCriterionKey.SOURCE_TYPE,
                                                    ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.source-type"));
    criteria.add(moreCriterion);

    //description
    //    ListCriterion descriptionCriterion
    //            = new ListCriterion(DataSourceListCriterionKey.CONTAINS_TEXT,
    //            ListCriterionType.TEXT, "msg.storage.ui.criterion.contains-text");
    //    descriptionCriterion.addFilter(new ListFilter(DataSourceListCriterionKey.CONTAINS_TEXT,
    //            "containsText", "", "msg.storage.ui.criterion.contains-text"));
    //    criteria.add(descriptionCriterion);

    return criteria;
  }

  public ListCriterion getListCriterionByKey(DataSourceListCriterionKey criterionKey) {
    ListCriterion criterion = new ListCriterion();
    criterion.setCriterionKey(criterionKey);

    switch (criterionKey) {
      case STATUS:
        DataSource.Status[] statuses = {
            DataSource.Status.ENABLED,
            DataSource.Status.PREPARING,
            DataSource.Status.FAILED,
            DataSource.Status.DISABLED
        };
        for (DataSource.Status status : statuses) {
          String filterName = status.toString();
          criterion.addFilter(new ListFilter(criterionKey, "status", status.toString(), filterName));
        }
        break;
      case DATASOURCE_TYPE:
        for (DataSource.DataSourceType dataSourceType : DataSource.DataSourceType.values()) {
          String filterName = dataSourceType.toString();
          criterion.addFilter(new ListFilter(criterionKey, "dataSourceType",
                                             dataSourceType.toString(), filterName));
        }
        break;
      case SOURCE_TYPE:
        DataSource.SourceType[] srcTypes = {
            DataSource.SourceType.FILE,
            DataSource.SourceType.HDFS,
            DataSource.SourceType.JDBC,
            DataSource.SourceType.REALTIME,
            DataSource.SourceType.IMPORT,
            DataSource.SourceType.SNAPSHOT
        };

        boolean supportStageDB = storageProperties.getStagedb() != null;
        if(supportStageDB){
          srcTypes = ArrayUtils.add(srcTypes, 2, DataSource.SourceType.HIVE);
        }

        for (DataSource.SourceType sourceType : srcTypes) {
          String filterName = sourceType.toString();
          criterion.addFilter(new ListFilter(criterionKey, "sourceType",
                                             sourceType.toString(), filterName));
        }
        break;
      case CONNECTION_TYPE:
        for (DataSource.ConnectionType connectionType : DataSource.ConnectionType.values()) {
          String filterName = connectionType.toString();
          criterion.addFilter(new ListFilter(criterionKey, "connectionType",
                                             connectionType.toString(), filterName));
        }
        break;
      case PUBLISH:
        //allow search
        criterion.setSearchable(true);

        //published workspace
        criterion.addFilter(new ListFilter(criterionKey, "published", "true", "msg.storage.ui.criterion.open-data"));

        //my private workspace
        Workspace myWorkspace = workspaceRepository.findPrivateWorkspaceByOwnerId(AuthUtils.getAuthUserName());
        criterion.addFilter(new ListFilter(criterionKey, "workspace",
                                           myWorkspace.getId(), myWorkspace.getName()));

        //owner public workspace not published
        List<Workspace> ownerPublicWorkspaces
            = workspaceService.getPublicWorkspaces(false, true, false, null);
        for(Workspace workspace : ownerPublicWorkspaces){
          criterion.addFilter(new ListFilter(criterionKey, "workspace",
                                             workspace.getId(), workspace.getName()));
        }

        //member public workspace not published
        List<Workspace> memberPublicWorkspaces
            = workspaceService.getPublicWorkspaces(false, false, false, null);
        for (Workspace workspace : memberPublicWorkspaces) {
          criterion.addFilter(new ListFilter(criterionKey, "workspace",
                                             workspace.getId(), workspace.getName()));
        }
        break;
      case CREATOR:
        //allow search
        criterion.setSearchable(true);
        String userName = AuthUtils.getAuthUserName();
        User user = userRepository.findByUsername(userName);

        // user
        ListCriterion userCriterion = new ListCriterion();

        userCriterion.setCriterionName("msg.storage.ui.criterion.users");
        userCriterion.setCriterionType(ListCriterionType.CHECKBOX);
        criterion.addSubCriterion(userCriterion);

        //me
        userCriterion.addFilter(new ListFilter("createdBy", userName,
                                               user.getFullName() + " (me)"));

        //datasource created users
        List<String> creatorIdList
                = dataSourceRepository.findDistinctCreatedBy(DataSource.DataSourceType.MASTER, DataSource.DataSourceType.JOIN);
        List<User> creatorUserList = userRepository.findByUsernames(creatorIdList);
        for (User creator : creatorUserList) {
          if (!creator.getUsername().equals(userName)) {
            ListFilter filter = new ListFilter("createdBy", creator.getUsername(),
                                               creator.getFullName());
            userCriterion.addFilter(filter);
          }
        }

        //groups
        ListCriterion groupCriterion = new ListCriterion();
        groupCriterion.setCriterionName("msg.storage.ui.criterion.groups");
        criterion.addSubCriterion(groupCriterion);

        //my group
        List<Map<String, Object>> groupList = groupService.getJoinedGroupsForProjection(userName, false);
        if (groupList != null && !groupList.isEmpty()) {
          for (Map<String, Object> groupMap : groupList) {
            ListFilter filter = new ListFilter("userGroup", groupMap.get("id").toString(),
                                               groupMap.get("name").toString() + " (my)");
            groupCriterion.addFilter(filter);
          }
        }

        //data manager group
        List<RoleDirectory> roleDirectoryList
            = roleDirectoryRepository.findByTypeAndRoleId(DirectoryProfile.Type.GROUP, "ROLE_SYSTEM_DATA_MANAGER");
        if (roleDirectoryList != null && !roleDirectoryList.isEmpty()) {
          for (RoleDirectory roleDirectory : roleDirectoryList) {
            //duplicate group check
            boolean duplicated = false;
            if (groupList != null && !groupList.isEmpty()) {
              long duplicatedCnt = groupList.stream()
                                            .filter(groupMap -> roleDirectory.getDirectoryId().equals(groupMap.get("id").toString()))
                                            .count();
              duplicated = duplicatedCnt > 0;
            }

            if (!duplicated) {
              ListFilter filter = new ListFilter("userGroup", roleDirectory.getDirectoryId(),
                                                 roleDirectory.getDirectoryName());
              groupCriterion.addFilter(filter);
            }
          }
        }
        //
        //        //data manager group member
        //        List<GroupMember> memberResults = groupMemberRepository.findByGroupId("ID_GROUP_DATA_MANAGER");
        //        if(memberResults != null && !memberResults.isEmpty()){
        //          List<String> memberUserNameList = memberResults.stream()
        //                  .map(member -> member.getMemberId())
        //                  .collect(Collectors.toList());
        //          List<User> dataManagerUserList = userRepository.findByUsernames(memberUserNameList);
        //          for(User member : dataManagerUserList){
        //            ListFilter filter = new ListFilter("createdBy", member.getUsername(),
        //                    member.getFullName() + "(" + member.getUsername() + ")");
        //            groupCriterion.addFilter(filter);
        //          }
        //        }
        break;
      case DATETIME:
        //created_time
        ListCriterion createdTimeCriterion = new ListCriterion();
        createdTimeCriterion.setCriterionName("msg.storage.ui.criterion.created-time");
        createdTimeCriterion.addFilter(new ListFilter(DataSourceListCriterionKey.CREATED_TIME,
                                                      "createdTimeFrom", "createdTimeTo", "", "",
                                                      "msg.storage.ui.criterion.created-time"));
        criterion.addSubCriterion(createdTimeCriterion);

        //modified_time
        ListCriterion modifiedTimeCriterion = new ListCriterion();
        modifiedTimeCriterion.setCriterionName("msg.storage.ui.criterion.modified-time");
        modifiedTimeCriterion.addFilter(new ListFilter(DataSourceListCriterionKey.MODIFIED_TIME,
                                                       "modifiedTimeFrom", "modifiedTimeTo", "", "",
                                                       "msg.storage.ui.criterion.modified-time"));
        criterion.addSubCriterion(modifiedTimeCriterion);
        break;
      case CREATED_TIME:
        //created_time
        criterion.addFilter(new ListFilter(DataSourceListCriterionKey.CREATED_TIME,
                                           "createdTimeFrom", "createdTimeTo", "", "",
                                           "msg.storage.ui.criterion.created-time"));
        break;
      case MODIFIED_TIME:
        //modified_time
        criterion.addFilter(new ListFilter(DataSourceListCriterionKey.MODIFIED_TIME,
                                           "modifiedTimeFrom", "modifiedTimeTo", "", "",
                                           "msg.storage.ui.criterion.modified-time"));
        break;
      default:
        break;
    }

    return criterion;
  }

  public List<ListFilter> getDefaultFilter() {
    List<DataSourceProperties.DefaultFilter> defaultFilters = dataSourceProperties.getDefaultFilters();

    List<ListFilter> defaultCriteria = new ArrayList<>();

    if (defaultFilters != null) {
      for (DataSourceProperties.DefaultFilter defaultFilter : defaultFilters) {
        //me
        if (defaultFilter.getFilterValue().equals("me")) {
          String userName = AuthUtils.getAuthUserName();
          User user = userRepository.findByUsername(userName);

          ListFilter meFilter = new ListFilter(DataSourceListCriterionKey.valueOf(defaultFilter.getCriterionKey())
              , "createdBy", null, userName, null, user.getFullName() + " (me)");
          defaultCriteria.add(meFilter);
        } else {
          ListFilter listFilter = new ListFilter(DataSourceListCriterionKey.valueOf(defaultFilter.getCriterionKey())
              , defaultFilter.getFilterKey(), null, defaultFilter.getFilterValue(), null
              , defaultFilter.getFilterName());
          defaultCriteria.add(listFilter);
        }
      }
    }
    return defaultCriteria;
  }

  public Page<DataSource> findDataSourceListByFilter(
      List<DataSource.Status> statuses,
      List<String> workspaces,
      List<String> createdBys,
      List<String> userGroups,
      DateTime createdTimeFrom,
      DateTime createdTimeTo,
      DateTime modifiedTimeFrom,
      DateTime modifiedTimeTo,
      String containsText,
      List<DataSource.DataSourceType> dataSourceTypes,
      List<DataSource.SourceType> sourceTypes,
      List<DataSource.ConnectionType> connectionTypes,
      List<Boolean> published,
      Pageable pageable) {

    //add userGroups member to createdBy
    List<GroupMember> groupMembers = groupMemberRepository.findByGroupIds(userGroups);
    if (groupMembers != null && !groupMembers.isEmpty()) {
      if (createdBys == null)
        createdBys = new ArrayList<>();

      for (GroupMember groupMember : groupMembers) {
        createdBys.add(groupMember.getMemberId());
      }
    }

    // Get Predicate
    Predicate searchPredicated = DataSourcePredicate.searchList(statuses, workspaces, createdBys, createdTimeFrom,
                                                                createdTimeTo, modifiedTimeFrom, modifiedTimeTo, containsText, dataSourceTypes, sourceTypes, connectionTypes,
                                                                published);

    // Find by predicated
    Page<DataSource> dataSources = dataSourceRepository.findAll(searchPredicated, pageable);

    return dataSources;
  }


  public void updateFromMetadata(Metadata metadata, boolean includeColumns) {

    if (metadata.getSource() == null) {
      return;
    }

    DataSource dataSource = dataSourceRepository.findOne(metadata.getSource().getSourceId());

    // check whether datasource exists
    if (dataSource == null) {
      return;
    }

    dataSource.updateFromMetadata(metadata, includeColumns);

    dataSourceRepository.save(dataSource);
  }

}
