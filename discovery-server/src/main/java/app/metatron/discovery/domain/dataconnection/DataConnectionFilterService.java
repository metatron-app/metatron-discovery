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

package app.metatron.discovery.domain.dataconnection;

import com.querydsl.core.types.Predicate;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.criteria.ListCriterion;
import app.metatron.discovery.common.criteria.ListCriterionType;
import app.metatron.discovery.common.criteria.ListFilter;
import app.metatron.discovery.domain.datasource.DataSourceListCriterionKey;
import app.metatron.discovery.domain.user.DirectoryProfile;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.user.group.GroupMember;
import app.metatron.discovery.domain.user.group.GroupMemberRepository;
import app.metatron.discovery.domain.user.group.GroupService;
import app.metatron.discovery.domain.user.role.RoleDirectory;
import app.metatron.discovery.domain.user.role.RoleDirectoryRepository;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspaceRepository;
import app.metatron.discovery.domain.workspace.WorkspaceService;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.util.AuthUtils;

/**
 *
 */
@Component
public class DataConnectionFilterService {

  @Autowired
  UserRepository userRepository;

  @Autowired
  DataConnectionRepository dataConnectionRepository;

  @Autowired
  GroupService groupService;

  @Autowired
  RoleDirectoryRepository roleDirectoryRepository;

  @Autowired
  WorkspaceRepository workspaceRepository;

  @Autowired
  WorkspaceService workspaceService;

  @Autowired
  GroupMemberRepository groupMemberRepository;

  @Autowired
  DataConnectionProperties dataConnectionProperties;

  @Autowired
  List<JdbcDialect> jdbcDialects;

  public List<ListCriterion> getListCriterion(){

    List<ListCriterion> criteria = new ArrayList<>();

    //Publish
    criteria.add(new ListCriterion(DataConnectionListCriterionKey.PUBLISH,
            ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.publish", true));

    //Creator
    criteria.add(new ListCriterion(DataConnectionListCriterionKey.CREATOR,
            ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.creator", true));

    //DB TYPE
    criteria.add(new ListCriterion(DataConnectionListCriterionKey.IMPLEMENTOR,
            ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.implementor"));

    //AUTH_TYPE
    criteria.add(new ListCriterion(DataConnectionListCriterionKey.AUTH_TYPE,
            ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.auth-type"));

    //CreatedTime
    ListCriterion createdTimeCriterion
            = new ListCriterion(DataConnectionListCriterionKey.CREATED_TIME,
            ListCriterionType.RANGE_DATETIME, "msg.storage.ui.criterion.created-time");
    createdTimeCriterion.addFilter(new ListFilter(DataConnectionListCriterionKey.CREATED_TIME,
            "createdTimeFrom", "createdTimeTo", "", "",
            "msg.storage.ui.criterion.created-time"));
    criteria.add(createdTimeCriterion);

    //more
    ListCriterion moreCriterion = new ListCriterion(DataConnectionListCriterionKey.MORE,
            ListCriterionType.CHECKBOX, "msg.storage.ui.criterion.more");
    moreCriterion.addSubCriterion(new ListCriterion(DataConnectionListCriterionKey.MODIFIED_TIME,
            ListCriterionType.RANGE_DATETIME, "msg.storage.ui.criterion.modified-time"));
    criteria.add(moreCriterion);

    return criteria;
  }

  public ListCriterion getListCriterionByKey(DataConnectionListCriterionKey criterionKey){
    ListCriterion criterion = new ListCriterion();
    criterion.setCriterionKey(criterionKey);

    switch(criterionKey){
      case IMPLEMENTOR:
        for(JdbcDialect jdbcDialect : jdbcDialects){
          if(jdbcDialect.getImplementor().equals("STAGE")){
            continue;
          }
          criterion.addFilter(new ListFilter(criterionKey, "implementor", jdbcDialect.getImplementor(), jdbcDialect.getName()));
        }
        break;
      case AUTH_TYPE:
        criterion.addFilter(new ListFilter(criterionKey, "authenticationType", DataConnection.AuthenticationType.MANUAL.toString(), "msg.storage.li.connect.always"));
        criterion.addFilter(new ListFilter(criterionKey, "authenticationType", DataConnection.AuthenticationType.USERINFO.toString(), "msg.storage.li.connect.account"));
        criterion.addFilter(new ListFilter(criterionKey, "authenticationType", DataConnection.AuthenticationType.DIALOG.toString(), "msg.storage.li.connect.id"));
        break;
      case CREATED_TIME:
        //created_time
        criterion.addFilter(new ListFilter(DataConnectionListCriterionKey.CREATED_TIME,
                "createdTimeFrom", "createdTimeTo", "", "",
                "msg.storage.ui.criterion.created-time"));
        break;
      case MODIFIED_TIME:
        //created_time
        criterion.addFilter(new ListFilter(DataConnectionListCriterionKey.MODIFIED_TIME,
                "modifiedTimeFrom", "modifiedTimeTo", "", "",
                "msg.storage.ui.criterion.modified-time"));
        break;
      case CREATOR:
        //allow search
        criterion.setSearchable(true);
        String userName = AuthUtils.getAuthUserName();
        User user = userRepository.findByUsername(userName);

        //user
        ListCriterion userCriterion = new ListCriterion();

        userCriterion.setCriterionName("msg.storage.ui.criterion.users");
        userCriterion.setCriterionType(ListCriterionType.CHECKBOX);
        criterion.addSubCriterion(userCriterion);

        //me
        userCriterion.addFilter(new ListFilter("createdBy", userName,
                user.getFullName() + " (me)"));

        //dataconnection create users
        List<String> creatorIdList = dataConnectionRepository.findDistinctCreatedBy();
        List<User> creatorUserList = userRepository.findByUsernames(creatorIdList);
        for(User creator : creatorUserList){
          if(!creator.getUsername().equals(userName)){
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
        if(groupList != null && !groupList.isEmpty()){
          for(Map<String, Object> groupMap : groupList){
            ListFilter filter = new ListFilter("userGroup", groupMap.get("id").toString(),
                    groupMap.get("name").toString() + " (my)");
            groupCriterion.addFilter(filter);
          }
        }

        //data manager group
        List<RoleDirectory> roleDirectoryList
                = roleDirectoryRepository.findByTypeAndRoleId(DirectoryProfile.Type.GROUP, "ROLE_SYSTEM_DATA_MANAGER");
        if(roleDirectoryList != null && !roleDirectoryList.isEmpty()){
          for(RoleDirectory roleDirectory : roleDirectoryList){
            //duplicate group check
            boolean duplicated = false;
            if(groupList != null && !groupList.isEmpty()){
              long duplicatedCnt = groupList.stream()
                      .filter(groupMap -> roleDirectory.getDirectoryId().equals(groupMap.get("id").toString()))
                      .count();
              duplicated = duplicatedCnt > 0;
            }

            if(!duplicated){
              ListFilter filter = new ListFilter("userGroup", roleDirectory.getDirectoryId(),
                      roleDirectory.getDirectoryName());
              groupCriterion.addFilter(filter);
            }
          }
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
        for(Workspace workspace : memberPublicWorkspaces){
          criterion.addFilter(new ListFilter(criterionKey, "workspace",
                  workspace.getId(), workspace.getName()));
        }
        break;
      default:
        break;
    }

    return criterion;
  }

  public Page<DataConnection> findDataConnectionByFilter(
          List<String> workspaces,
          List<String> createdBys,
          List<String> userGroups,
          List<String> implementors,
          List<DataConnection.AuthenticationType> authenticationTypes,
          DateTime createdTimeFrom,
          DateTime createdTimeTo,
          DateTime modifiedTimeFrom,
          DateTime modifiedTimeTo,
          String containsText,
          List<Boolean> published,
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
    Predicate searchPredicated = DataConnectionPredicate.searchList(workspaces, createdBys, implementors,
            authenticationTypes, createdTimeFrom, createdTimeTo, modifiedTimeFrom, modifiedTimeTo, containsText, published);

    // Find by predicated
    Page<DataConnection> dataConnections = dataConnectionRepository.findAll(searchPredicated, pageable);

    return dataConnections;
  }

  public List<ListFilter> getDefaultFilter(){
    List<DataConnectionProperties.DefaultFilter> defaultFilters = dataConnectionProperties.getDefaultFilters();

    List<ListFilter> defaultCriteria = new ArrayList<>();

    if(defaultFilters != null){
      for(DataConnectionProperties.DefaultFilter defaultFilter : defaultFilters){
        //me
        if(defaultFilter.getFilterValue().equals("me")){
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
}
