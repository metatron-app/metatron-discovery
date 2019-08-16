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

package app.metatron.discovery.domain.workspace;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.search.annotations.ContainedIn;
import org.hibernate.search.annotations.Field;
import org.hibernate.search.annotations.Store;
import org.hibernate.validator.constraints.NotBlank;
import org.joda.time.DateTime;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.*;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.context.ContextEntity;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.notebook.Notebook;
import app.metatron.discovery.domain.notebook.NotebookConnector;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserProfile;
import app.metatron.discovery.domain.user.role.Role;
import app.metatron.discovery.domain.user.role.RoleSet;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workbook.WorkBook;
import app.metatron.discovery.domain.workbook.WorkBookSummary;
import app.metatron.discovery.domain.workspace.folder.Folder;

import static com.fasterxml.jackson.annotation.JsonProperty.Access.READ_ONLY;
import static com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY;

/**
 * 분석을 위한 Workspace 모델 </br> 사용자별로 1개 이상의 Workspace를 가질수 있으며 타인/그룹과 공유가 가능한 Workspace를 생성할수 있다
 */
@Entity
@Table(name = "workspace")
public class Workspace extends AbstractHistoryEntity implements MetatronDomain<String>, ContextEntity {

  public static final List<String> workspaceTypes = Lists.newArrayList("DEFAULT", "TYPE_1", "TYPE_2");

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  String id;

  @Column(name = "ws_name", nullable = false)
  @Field(store = Store.YES)
  @NotBlank
  @Size(max = 150)
  String name;

  @Column(name = "ws_desc", length = 1000)
  @Size(max = 900)
  String description;

  @Column(name = "ws_type")
  @Size(max = 150)
  String type;

  @JsonProperty(access = WRITE_ONLY)
  @Column(name = "ws_owner_id")
  String ownerId;

  @JsonProperty(access = READ_ONLY)
  @Transient
  UserProfile owner;

  @Column(name = "ws_pub_type")
  @Enumerated(EnumType.STRING)
  PublicType publicType;

  @Column(name = "ws_published")
  Boolean published;

  @Column(name = "ws_active")
  Boolean active;

  @Column(name = "ws_last_accessed_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime lastAccessedTime;

  @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL)
  @OrderBy("modifiedTime DESC")
  @BatchSize(size = 50)
  Set<Book> books;

  @OneToMany(mappedBy = "workspace", cascade = {CascadeType.ALL}, orphanRemoval = true)
  @RestResource(exported = false, path = "members")
  @BatchSize(size = 100)
  @JsonBackReference
  Set<WorkspaceMember> members;

  @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
  @JoinTable(name = "role_set_workspace",
      joinColumns = @JoinColumn(name = "ws_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "rs_id", referencedColumnName = "id"))
  @JsonBackReference(value = "rolesets-workspaces")
  @RestResource(path = "rolesets")
  List<RoleSet> roleSets;

  @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
  @JoinTable(name = "connector_workspace",
      joinColumns = @JoinColumn(name = "ws_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "nc_id", referencedColumnName = "id"))
  @JsonBackReference(value = "connectors-workspaces")
  @RestResource(path = "connectors")
  Set<NotebookConnector> connectors;

  /**
   * Workspace는 여러개의 데이터 소스를 가질수 있다. Lookup 타입의 데이터 소스는 Workspace에 종속적이나 Main은 독립적이다 따라서 CascadeType
   * 중 Remove 시 타입에 따라 달라 질수 있다 Lookup Type일 경우 별도 처리 필요
   *
   * (참고) many to many 관계일 경우 owning 엔티티를 owner 처럼 설정해야 JoinTable 의 내용만 삭제됨
   */
  @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
  @JoinTable(name = "datasource_workspace",
      joinColumns = @JoinColumn(name = "ws_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "ds_id", referencedColumnName = "id"))
  @JsonBackReference(value = "datasources-workspaces")
  @RestResource(path = "datasources")
  @ContainedIn
  Set<DataSource> dataSources;

  @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
  @JoinTable(name = "dataconnection_workspace",
      joinColumns = @JoinColumn(name = "ws_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "dc_id", referencedColumnName = "id"))
  @JsonBackReference(value = "connections-workspaces")
  @RestResource(path = "connections")
  Set<DataConnection> dataConnections;

  @Transient
  Boolean favorite;

  @Transient
  Boolean linked;

  /**
   * BookList 조회시 Projection내 BookType 지정 용도로 활용
   */
  @Transient
  @JsonIgnore
  String bookType;

  /**
   * Spring data rest 제약으로 인한 Dummy Property. - Transient 어노테이션 구성시 HandleBeforeSave 에서 인식 못하는 문제
   * 발생
   */
  @Column(name = "workspace_contexts", length = 10000)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String contexts;

  public Workspace() {
    // Empty Constructor
  }

  /**
   * WorkBook 요약정보 목록 가져오기
   *
   * @return WorkBook 요약 정보
   */
  @JsonIgnore
  public List<WorkBookSummary> getWorkBookSummarys() {

    return this.books.stream()
                     .map((book) -> WorkBookSummary.valueOf(book)).collect(Collectors.toList());

  }

  /**
   * Book 타입별 Count 정보 가져오기
   *
   * @return book 요약 정보
   */
  public Map<String, Integer> countOfBookByType() {

    int countOfFolder = 0;
    int countOfWorkBook = 0;
    int countOfWorkBench = 0;
    int countOfNotebook = 0;

    if (this.books != null) {
      for (Book book : this.books) {
        if (book instanceof Folder) {
          countOfFolder++;
        } else if (book instanceof WorkBook) {
          countOfWorkBook++;
        } else if (book instanceof Workbench) {
          countOfWorkBench++;
        } else if (book instanceof Notebook) {
          countOfNotebook++;
        }
      }
    }

    Map<String, Integer> result = Maps.newHashMap();
    result.put("folder", countOfFolder);
    result.put("workBook", countOfWorkBook);
    result.put("workBench", countOfWorkBench);
    result.put("notebook", countOfNotebook);

    return result;

  }

  /**
   * Member 타입별 Count 정보 가져오기
   *
   * @return book 요약 정보
   */
  public Map<String, Integer> countOfMemberType() {

    int countOfGroup = 0;
    int countOfUser = 0;

    if (this.members != null) {
      for (WorkspaceMember member : this.members) {
        if (member.getMemberType() == null) {
          continue;
        }
        if (member.getMemberType() == WorkspaceMember.MemberType.GROUP) {
          countOfGroup++;
        } else {
          countOfUser++;
        }
      }
    }

    Map<String, Integer> result = Maps.newHashMap();
    result.put("group", countOfGroup);
    result.put("user", countOfUser);

    return result;

  }

  /**
   * Workspace MemberId 를 key 로 Map 객체 전달
   *
   * @return WorkBook 요약 정보
   */
  @JsonIgnore
  public Map<String, WorkspaceMember> getMemberIdMap() {
    return this.members.stream()
                       .collect(Collectors.toMap(WorkspaceMember::getMemberId, member -> member));
  }

  /**
   * Workspace 내 지정된 RoleSet내 포함된 Role 목록 전달
   */
  @JsonIgnore
  public List<Role> getRoles() {
    List<Role> roles = Lists.newArrayList();
    if (CollectionUtils.isEmpty(roleSets)) {
      return roles;
    }

    for (RoleSet roleSet : roleSets) {
      roles.addAll(roleSet.getRoles());
    }

    return roles;
  }

  /**
   * Workspace 내 지정된 RoleSet내 포함된 Role 명과 Role 객체 Map 전달
   *
   * @return Role 명과 Role 객체 Map
   */
  @JsonIgnore
  public Map<String, Role> getRoleMap() {
    List<Role> roles = getRoles();

    return roles.stream()
                .collect(Collectors.toMap(Role::getName, role -> role));
  }

  /**
   * Default Role 전달
   *
   */
  @JsonIgnore
  public Role getDefaultRole() {
    List<Role> roles = getRoles();

    return roles.stream()
                .filter(role -> role.getDefaultRole())
                .findFirst().orElseThrow(() -> new MetatronException("Default role required."));
  }

  public void deleteMember(String... memberIds) {

    Map<String, WorkspaceMember> memberMap = getMemberIdMap();

    List<WorkspaceMember> deleteMembers = Lists.newArrayList();
    for (String memberId : memberIds) {
      if (memberMap.containsKey(memberId)) {
        deleteMembers.add(memberMap.get(memberId));
      }
    }

    this.members.removeAll(deleteMembers);
  }

  /**
   * deprecated
   */
  public void deleteConnectorByType(String connectorType) {
    synchronized (connectors) {
      for (NotebookConnector connector : connectors) {
        if (connectorType.equals(connector.getType())) {
          connectors.remove(connector);
          break;
        }
      }
    }
  }

  public void addRoleSet(RoleSet roleSet) {
    if(roleSet == null) {
      return;
    }
    
    if (this.roleSets == null) {
      this.roleSets = Lists.newArrayList();
    }

    if(roleSets.contains(roleSet)) {
      return;
    }

    roleSet.plusLink();
    this.roleSets.add(roleSet);
  }

  public void removeRoleSet(RoleSet roleSet) {
    if (this.roleSets == null) {
      return;
    }

    if(!roleSets.contains(roleSet)) {
      return;
    }

    roleSet.minusLink();
    this.roleSets.remove(roleSet);
  }

  /**
   * Checks whether any workspace member has the same user name and member ID
   *
   * @param user User
   * @return boolean
   */
  public boolean checkMemberExistByUserName(final User user) {
    return this.members.stream().anyMatch(member -> member.memberId.equals(user.getUsername()));
  }

  @Override
  public Map<String, String> getContextMap() {
    if (StringUtils.isEmpty(this.contexts)) {
      return null;
    }

    return GlobalObjectMapper.readValue(this.contexts, Map.class);
  }

  @Override
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(String ownerId) {
    this.ownerId = ownerId;
  }

  public PublicType getPublicType() {
    return publicType;
  }

  public void setPublicType(PublicType publicType) {
    this.publicType = publicType;
  }

  public Boolean getPublished() {
    return published;
  }

  public void setPublished(Boolean published) {
    this.published = published;
  }

  public Boolean getActive() {
    if (active == null) {
      return true;
    }
    return active;
  }

  public void setActive(Boolean active) {
    this.active = active;
  }

  public Set<Book> getBooks() {
    return books;
  }

  public void setBooks(Set<Book> books) {
    this.books = books;
  }

  public Set<WorkspaceMember> getMembers() {
    return members;
  }

  public void setMembers(Set<WorkspaceMember> members) {
    this.members = members;
  }

  public List<RoleSet> getRoleSets() {
    return roleSets;
  }

  public void setRoleSets(List<RoleSet> roleSets) {
    this.roleSets = roleSets;
  }

  public Set<NotebookConnector> getConnectors() {
    return connectors;
  }

  public void setConnectors(Set<NotebookConnector> connectors) {
    this.connectors = connectors;
  }

  public Set<DataSource> getDataSources() {
    return dataSources;
  }

  public void setDataSources(Set<DataSource> dataSources) {
    this.dataSources = dataSources;
  }

  public UserProfile getOwner() {
    return owner;
  }

  public void setOwner(UserProfile owner) {
    this.owner = owner;
  }

  public Boolean getFavorite() {
    return favorite;
  }

  public void setFavorite(Boolean favorite) {
    this.favorite = favorite;
  }

  public Boolean getLinked() {
    return linked;
  }

  public DateTime getLastAccessedTime() {
    return lastAccessedTime;
  }

  public void setLastAccessedTime(DateTime lastAccessedTime) {
    this.lastAccessedTime = lastAccessedTime;
  }

  public void setLinked(Boolean linked) {
    this.linked = linked;
  }

  public String getBookType() {
    return bookType;
  }

  public void setBookType(String bookType) {
    this.bookType = bookType;
  }

  public Set<DataConnection> getDataConnections() {
    return dataConnections;
  }

  public void setDataConnections(Set<DataConnection> dataConnections) {
    this.dataConnections = dataConnections;
  }

  public String getContexts() {
    return contexts;
  }

  public void setContexts(String contexts) {
    this.contexts = contexts;
  }

  @Override
  public String toString() {
    return "Workspace{" +
        "id='" + id + '\'' +
        ", name='" + name + '\'' +
        ", description='" + description + '\'' +
        ", ownerId='" + ownerId + '\'' +
        ", publicType=" + publicType +
        '}';
  }

  public enum PublicType {
    PRIVATE, SHARED
  }
}
