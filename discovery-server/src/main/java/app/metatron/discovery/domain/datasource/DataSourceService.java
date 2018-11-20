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

import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.engine.DruidEngineMetaRepository;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.engine.model.SegmentMetaDataResponse;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.user.group.GroupMember;
import app.metatron.discovery.domain.user.group.GroupMemberRepository;
import app.metatron.discovery.domain.user.group.GroupService;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspaceRepository;
import app.metatron.discovery.domain.workspace.WorkspaceService;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.PolarisUtils;
import com.google.common.collect.Lists;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
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
  GroupMemberRepository groupMemberRepository;

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
    dataSource.setSegGranularity(reqDataSource.getSegGranularity() == null ? DataSource.GranularityType.DAY : reqDataSource.getSegGranularity());
    dataSource.setGranularity(reqDataSource.getGranularity() == null ? DataSource.GranularityType.NONE : reqDataSource.getGranularity());
    dataSource.setStatus(DataSource.Status.ENABLED);
    dataSource.setFields(segmentMetaData.getConvertedField(reqDataSource.getFields()));

    return dataSourceRepository.saveAndFlush(dataSource);
  }

  public void setDataSourceStatus(String datasourceId, DataSource.Status status, DataSourceSummary summary) {
    DataSource dataSource = dataSourceRepository.findOne(datasourceId);
    dataSource.setStatus(status);
    dataSource.setSummary(summary);
  }

  @Transactional(readOnly = true)
  public List<DataSourceTemporary> getMatchedTemporaries(String dataSourceId, List<Filter> filters) {

    List<DataSourceTemporary> matchedTempories = Lists.newArrayList();
    List<DataSourceTemporary> temporaries = temporaryRepository.findByDataSourceIdOrderByModifiedTimeDesc(dataSourceId);

    for (DataSourceTemporary temporary : temporaries) {
      List<Filter> originalFilters = temporary.getFilterList();
      // Filter 설정을 비교대상 모두 하지 않은 경우, matched
      if (CollectionUtils.isEmpty(originalFilters) == CollectionUtils.isEmpty(filters)) {
        matchedTempories.add(temporary);
        continue;
      }

      // Filter 설정이 둘중 한쪽이 없는 경우, pass
      if (!(CollectionUtils.isNotEmpty(originalFilters) == CollectionUtils.isNotEmpty(filters))) {
        continue;
      }

      // Filter 개수가 다른 경우, pass
      if (!(originalFilters.size() == filters.size())) {
        continue;
      }

      boolean compareResult = true;
      for (int i = 0; originalFilters.size() > 0; i++) {
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
      LOGGER.debug("Find temporary datasource : {}" + dataSourceId);

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
  
  public List<DataSourceListCriterion> getDataSourceListCriterion(){

    List<DataSourceListCriterion> criteria = new ArrayList<>();
    
    //Status
    criteria.add(new DataSourceListCriterion(DataSourceListCriterion.CriterionKey.STATUS,
            DataSourceListCriterion.CriterionType.CHECKBOX, "msg.storage.ui.criterion.status"));

    //Publish
    criteria.add(new DataSourceListCriterion(DataSourceListCriterion.CriterionKey.PUBLISH,
            DataSourceListCriterion.CriterionType.CHECKBOX, "msg.storage.ui.criterion.publish", true));

    //Creator
    criteria.add(new DataSourceListCriterion(DataSourceListCriterion.CriterionKey.CREATOR,
            DataSourceListCriterion.CriterionType.CHECKBOX, "msg.storage.ui.criterion.creator", true));

    //CreatedTime
    DataSourceListCriterion createdTimeCriterion
            = new DataSourceListCriterion(DataSourceListCriterion.CriterionKey.CREATED_TIME,
            DataSourceListCriterion.CriterionType.RANGE_DATETIME, "msg.storage.ui.criterion.created-time");
    createdTimeCriterion.addFilter(new DataSourceListFilter(DataSourceListCriterion.CriterionKey.CREATED_TIME,
            "createdTimeFrom", "createdTimeTo", "", "",
            "msg.storage.ui.criterion.created-time"));
    criteria.add(createdTimeCriterion);

    //DateTime
//    criteria.add(new DataSourceListCriterion(DataSourceListCriterion.CriterionKey.DATETIME,
//            DataSourceListCriterion.CriterionType.RADIO, "msg.storage.ui.criterion.datetime"));

    //more
    DataSourceListCriterion moreCriterion = new DataSourceListCriterion(DataSourceListCriterion.CriterionKey.MORE,
            DataSourceListCriterion.CriterionType.CHECKBOX, "msg.storage.ui.criterion.more");
//    DateTime currentDateTime = DateTime.now();
//    DateTime recentlyDateTime = currentDateTime.minusDays(7);
//    String fromStr = recentlyDateTime.toString();
//    String toStr = currentDateTime.toString();
//    moreCriterion.addFilter(new DataSourceListFilter(DataSourceListCriterion.CriterionKey.MODIFIED_TIME,
//            "modifiedTimeFrom", "modifiedTimeTo", fromStr, toStr,
//            "msg.storage.ui.criterion.recently-modified-time"));
//    moreCriterion.addFilter(new DataSourceListFilter(DataSourceListCriterion.CriterionKey.CREATED_TIME,
//            "createdTimeFrom", "createdTimeTo", fromStr, toStr,
//            "msg.storage.ui.criterion.recently-created-time"));

    moreCriterion.addSubCriterion(new DataSourceListCriterion(DataSourceListCriterion.CriterionKey.CONNECTION_TYPE,
            DataSourceListCriterion.CriterionType.CHECKBOX, "msg.storage.ui.criterion.connection-type"));
    moreCriterion.addSubCriterion(new DataSourceListCriterion(DataSourceListCriterion.CriterionKey.DATASOURCE_TYPE,
            DataSourceListCriterion.CriterionType.CHECKBOX, "msg.storage.ui.criterion.ds-type"));
    moreCriterion.addSubCriterion(new DataSourceListCriterion(DataSourceListCriterion.CriterionKey.SOURCE_TYPE,
            DataSourceListCriterion.CriterionType.CHECKBOX, "msg.storage.ui.criterion.source-type"));
    moreCriterion.addSubCriterion(new DataSourceListCriterion(DataSourceListCriterion.CriterionKey.CONNECTION_TYPE,
            DataSourceListCriterion.CriterionType.CHECKBOX, "msg.storage.ui.criterion.connection-type"));
    criteria.add(moreCriterion);

    //description
//    DataSourceListCriterion descriptionCriterion
//            = new DataSourceListCriterion(DataSourceListCriterion.CriterionKey.CONTAINS_TEXT,
//            DataSourceListCriterion.CriterionType.TEXT, "msg.storage.ui.criterion.contains-text");
//    descriptionCriterion.addFilter(new DataSourceListFilter(DataSourceListCriterion.CriterionKey.CONTAINS_TEXT,
//            "containsText", "", "msg.storage.ui.criterion.contains-text"));
//    criteria.add(descriptionCriterion);

    return criteria;
  }

  public DataSourceListCriterion getDataSourceListCriterionByKey(DataSourceListCriterion.CriterionKey criterionKey){
    DataSourceListCriterion criterion = new DataSourceListCriterion();
    criterion.setCriterionKey(criterionKey);

    switch (criterionKey){
      case STATUS:
        for(DataSource.Status status : DataSource.Status.values()){
          String filterName = status.toString();
          filterName = filterName.substring(0, 1).toUpperCase() + filterName.substring(1).toLowerCase();
          criterion.addFilter(new DataSourceListFilter(criterionKey, "status", status.toString(), filterName));
        }
        break;
      case DATASOURCE_TYPE:
        for(DataSource.DataSourceType dataSourceType : DataSource.DataSourceType.values()){
          String filterName = dataSourceType.toString();
          filterName = filterName.substring(0, 1).toUpperCase() + filterName.substring(1).toLowerCase();
          criterion.addFilter(new DataSourceListFilter(criterionKey, "dataSourceType",
                  dataSourceType.toString(), filterName));
        }
        break;
      case SOURCE_TYPE:
        for(DataSource.SourceType sourceType : DataSource.SourceType.values()){
          String filterName = sourceType.toString();
          filterName = filterName.substring(0, 1).toUpperCase() + filterName.substring(1).toLowerCase();
          criterion.addFilter(new DataSourceListFilter(criterionKey, "sourceType",
                  sourceType.toString(), filterName));
        }
        break;
      case CONNECTION_TYPE:
        for(DataSource.ConnectionType connectionType : DataSource.ConnectionType.values()){
          String filterName = connectionType.toString();
          filterName = filterName.substring(0, 1).toUpperCase() + filterName.substring(1).toLowerCase();
          criterion.addFilter(new DataSourceListFilter(criterionKey, "connectionType",
                  connectionType.toString(), filterName));
        }
        break;
      case PUBLISH:
        //allow search
        criterion.setSearchable(true);
        //my private workspace
        Workspace myWorkspace = workspaceRepository.findPrivateWorkspaceByOwnerId(AuthUtils.getAuthUserName());
        criterion.addFilter(new DataSourceListFilter(criterionKey, "workspace",
                myWorkspace.getId(), myWorkspace.getName()));

        //my public workspace
        List<Workspace> publicWorkspaces
                = workspaceService.getPublicWorkspaces(false, false, false, null);
        for(Workspace workspace : publicWorkspaces){
          criterion.addFilter(new DataSourceListFilter(criterionKey, "workspace",
                  workspace.getId(), workspace.getName()));
        }
        break;
      case CREATOR:
        //allow search
        criterion.setSearchable(true);
        String userName = AuthUtils.getAuthUserName();
        User user = userRepository.findByUsername(userName);

        // me
        DataSourceListCriterion meCriterion = new DataSourceListCriterion();
        meCriterion.setCriterionName("msg.storage.ui.criterion.me");
        meCriterion.setCriterionType(DataSourceListCriterion.CriterionType.CHECKBOX);
        meCriterion.addFilter(new DataSourceListFilter("createdBy", userName,
                user.getFullName() + "(" + userName + ")"));
        criterion.addSubCriterion(meCriterion);

        //my group
        DataSourceListCriterion myGroupCriterion = new DataSourceListCriterion();
        myGroupCriterion.setCriterionName("msg.storage.ui.criterion.my-groups");
        List<Map<String, Object>> groupList = groupService.getJoinedGroupsForProjection(userName, false);
        for(Map<String, Object> groupMap : groupList){
          DataSourceListFilter filter = new DataSourceListFilter("userGroup", groupMap.get("id").toString(),
                  groupMap.get("name").toString());
          myGroupCriterion.addFilter(filter);
        }
        criterion.addSubCriterion(myGroupCriterion);

        //datasource created users
        DataSourceListCriterion dsCreatedUserCriterion = new DataSourceListCriterion();
        dsCreatedUserCriterion.setCriterionName("msg.storage.ui.criterion.all-users");
        List<String> creatorIdList = dataSourceRepository.findDistinctCreatedBy();
        List<User> creatorUserList = userRepository.findByUsernames(creatorIdList);
        for(User creator : creatorUserList){
          DataSourceListFilter filter = new DataSourceListFilter("createdBy", creator.getUsername(),
                  creator.getFullName() + "(" + creator.getUsername() + ")");
          dsCreatedUserCriterion.addFilter(filter);
        }
        criterion.addSubCriterion(dsCreatedUserCriterion);

        //data manager group
        DataSourceListCriterion dataManagerCriterion = new DataSourceListCriterion();
        dataManagerCriterion.setCriterionName("msg.storage.ui.criterion.data-managers");

        List<GroupMember> memberResults = groupMemberRepository.findByGroupId("ID_GROUP_DATA_MANAGER");
        if(memberResults != null && !memberResults.isEmpty()){
          List<String> memberUserNameList = memberResults.stream()
                  .map(member -> member.getMemberId())
                  .collect(Collectors.toList());
          List<User> dataManagerUserList = userRepository.findByUsernames(memberUserNameList);
          for(User member : dataManagerUserList){
            DataSourceListFilter filter = new DataSourceListFilter("createdBy", member.getUsername(),
                    member.getFullName() + "(" + member.getUsername() + ")");
            dataManagerCriterion.addFilter(filter);
          }
        }
        criterion.addSubCriterion(dataManagerCriterion);
        break;
      case DATETIME:
        //created_time
        DataSourceListCriterion createdTimeCriterion = new DataSourceListCriterion();
        createdTimeCriterion.setCriterionName("msg.storage.ui.criterion.created-time");
        createdTimeCriterion.addFilter(new DataSourceListFilter(DataSourceListCriterion.CriterionKey.CREATED_TIME,
                "createdTimeFrom", "createdTimeTo", "", "",
                "msg.storage.ui.criterion.created-time"));
        criterion.addSubCriterion(createdTimeCriterion);

        //modified_time
        DataSourceListCriterion modifiedTimeCriterion = new DataSourceListCriterion();
        modifiedTimeCriterion.setCriterionName("msg.storage.ui.criterion.modified-time");
        modifiedTimeCriterion.addFilter(new DataSourceListFilter(DataSourceListCriterion.CriterionKey.MODIFIED_TIME,
                "modifiedTimeFrom", "modifiedTimeTo", "", "",
                "msg.storage.ui.criterion.modified-time"));
        criterion.addSubCriterion(modifiedTimeCriterion);
        break;
      case CREATED_TIME:
        //created_time
        criterion.addFilter(new DataSourceListFilter(DataSourceListCriterion.CriterionKey.CREATED_TIME,
                "createdTimeFrom", "createdTimeTo", "", "",
                "msg.storage.ui.criterion.created-time"));
        break;
      default:
        break;
    }

    return criterion;
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
          Pageable pageable){

    //add userGroups member to createdBy
    List<GroupMember> groupMembers = groupMemberRepository.findByGroupIds(userGroups);
    if(groupMembers != null && !groupMembers.isEmpty()){
      if(createdBys == null)
        createdBys = new ArrayList<>();

      for(GroupMember groupMember : groupMembers){
        createdBys.add(groupMember.getMemberId());
      }
    }

    // Get Predicate
    Predicate searchPredicated = DataSourcePredicate.searchList(statuses, workspaces, createdBys, createdTimeFrom,
            createdTimeTo, modifiedTimeFrom, modifiedTimeTo, containsText, dataSourceTypes, sourceTypes, connectionTypes);

    // Find by predicated
    Page<DataSource> dataSources = dataSourceRepository.findAll(searchPredicated, pageable);

    return dataSources;
  }


}
