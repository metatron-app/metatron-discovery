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

package app.metatron.discovery.domain.user.group;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.envers.Audited;
import org.hibernate.search.annotations.Analyze;
import org.hibernate.search.annotations.Field;
import org.hibernate.search.annotations.FieldBridge;
import org.hibernate.search.annotations.Fields;
import org.hibernate.search.annotations.Indexed;
import org.hibernate.search.annotations.SortableField;
import org.hibernate.search.annotations.Store;
import org.hibernate.search.bridge.builtin.BooleanBridge;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;
import java.util.Map;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.PostPersist;
import javax.persistence.Table;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.bridge.PredefinedRoleBridge;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.context.ContextEntity;

/**
 * Created by kyungtaak on 2016. 1. 5..
 */
@Entity
@Table(name = "user_group")
@Indexed
@Audited(withModifiedFlag = true)
public class Group extends AbstractHistoryEntity implements MetatronDomain<String>, ContextEntity {

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  String id;

  @Column(name = "group_name")
  @FieldBridge(impl = PredefinedRoleBridge.class)
  @Fields({
      @Field(name = "name", analyze = Analyze.YES, store = Store.YES),
      @Field(name = "name.sort", analyze = Analyze.NO, store = Store.NO)
  })
  @SortableField(forField = "name.sort")
  @NotBlank
  @Size(max = 150)
  String name;

  @Column(name = "group_desc", length = 1000)
  @Size(max = 900)
  String description;


  @Column(name = "group_predefined")
  @Field(analyze = Analyze.NO, store = Store.YES)
  @FieldBridge(impl = BooleanBridge.class)
  @SortableField
  Boolean predefined = false;

  /**
   * 기본 그룹 여부
   */
  @Column(name = "group_default")
  Boolean defaultGroup;

  /**
   * 화면내에서 수정할 수 없도록 구성하는 플래그
   */
  @Column(name = "group_read_only")
  Boolean readOnly;

  @Column(name = "group_member_count")
//  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  Integer memberCount = 0;

  @OneToMany(mappedBy = "group", cascade = { CascadeType.ALL }, orphanRemoval = true)
  @RestResource(exported = false)
  @BatchSize(size = 100)
  List<GroupMember> members = Lists.newArrayList();

  /**
   * Spring data rest 제약으로 인한 Dummy Property.
   *  - Transient 어노테이션 구성시 HandleBeforeSave 에서 인식 못하는 문제 발생
   */
  @Column(name = "group_contexts", length = 10000)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String contexts;

  public Group() {
    // Empty Constructor
  }

  public Group(String name) {
    this.name = name;
  }

  /**
   * Group 에 포함된 Member의 수를 저장해둠
   */
  @PostPersist
  public void postPersist() {
    this.memberCount = this.members.size();
  }

  public void addGroupMember(GroupMember member) {
    if(members == null) {
      members = Lists.newArrayList();
    }
    member.setGroup(this);
    members.add(member);

    memberCount++;
  }

  public void removeGroupMember(GroupMember member) {
    if(members == null) {
      members = Lists.newArrayList();
    }
    member.setGroup(null);
    members.remove(member);

    memberCount--;
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

  public Boolean getPredefined() {
    return predefined;
  }

  public void setPredefined(Boolean predefined) {
    this.predefined = predefined;
  }

  public Boolean getDefaultGroup() {
    return defaultGroup;
  }

  public void setDefaultGroup(Boolean defaultGroup) {
    this.defaultGroup = defaultGroup;
  }

  public Boolean getReadOnly() {
    return readOnly;
  }

  public void setReadOnly(Boolean readOnly) {
    this.readOnly = readOnly;
  }

  public Integer getMemberCount() {
    return memberCount;
  }

  public void setMemberCount(Integer memberCount) {
    this.memberCount = memberCount;
  }

  public List<GroupMember> getMembers() {
    return members;
  }

  public void setMembers(List<GroupMember> members) {
    this.members = members;
  }

  public String getContexts() {
    return contexts;
  }

  public void setContexts(String contexts) {
    this.contexts = contexts;
  }

  @Override
  public Map<String, String> getContextMap() {
    if(StringUtils.isEmpty(this.contexts)) {
      return null;
    }

    return GlobalObjectMapper.readValue(this.contexts, Map.class);
  }
}
