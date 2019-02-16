/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

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

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.search.annotations.Analyze;
import org.hibernate.search.annotations.FieldBridge;
import org.hibernate.search.annotations.Fields;
import org.hibernate.search.annotations.Indexed;
import org.hibernate.search.annotations.IndexedEmbedded;
import org.hibernate.search.annotations.SortableField;
import org.hibernate.search.annotations.Store;
import org.hibernate.search.bridge.builtin.BooleanBridge;
import org.hibernate.search.bridge.builtin.EnumBridge;
import org.hibernate.validator.constraints.NotBlank;
import org.joda.time.DateTime;
import org.joda.time.Interval;
import org.joda.time.Period;
import org.springframework.data.rest.core.annotation.RestResource;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.CustomCollectors;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.entity.Spec;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.context.ContextEntity;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import app.metatron.discovery.domain.datasource.ingestion.HdfsIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.HiveIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;
import app.metatron.discovery.domain.datasource.ingestion.IngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.LocalFileIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.RealtimeIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.BatchIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.JdbcIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.SingleIngestionInfo;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataColumn;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.PolarisUtils;

import static app.metatron.discovery.domain.datasource.DataSource.SourceType.FILE;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.HDFS;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.HIVE;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.JDBC;
import static app.metatron.discovery.domain.datasource.DataSource.SourceType.REALTIME;
import static app.metatron.discovery.domain.workbook.configurations.field.Field.FIELD_NAMESPACE_SEP;
import static org.hibernate.search.annotations.Index.NO;

@Entity
@Table(name = "datasource",
    indexes = {
        @Index(name = "idx_datasource_name", columnList = "ds_name"),
        @Index(name = "idx_datasource_engine_name", columnList = "ds_engine_name", unique = true)
    })
@Indexed
public class DataSource extends AbstractHistoryEntity implements MetatronDomain<String>, ContextEntity {

  /**
   * ID
   */
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  String id;

  /**
   * 데이터 소스 명
   */
  @Column(name = "ds_name")
  @NotBlank
  @Size(max = 150)
  @Fields({
      @org.hibernate.search.annotations.Field(analyze = Analyze.YES, store = Store.YES),
      @org.hibernate.search.annotations.Field(name = "sortName", analyze = Analyze.NO, store = Store.NO, index = NO)
  })
  @SortableField(forField = "sortName")
  String name;

  /**
   * 엔진내 사용하는 데이터 소스(실제 Query에서 활용하는 데이터 소스명)
   */
  @Column(name = "ds_engine_name", unique = true)
  @Size(max = 150)
  String engineName;

  /**
   * 데이터 소스 사용자 ID
   */
  @Column(name = "ds_owner_id")
  @org.hibernate.search.annotations.Field(analyze = Analyze.NO, store = Store.YES)
  String ownerId;

  /**
   * 데이터 소스 설명
   */
  @Column(name = "ds_desc", length = 1000)
  @org.hibernate.search.annotations.Field(store = Store.NO)
  @Size(max = 900)
  String description;

  @Column(name = "ds_type")
  @NotNull
  @Enumerated(EnumType.STRING)
  @org.hibernate.search.annotations.Field(analyze = Analyze.NO, store = Store.NO)
  @FieldBridge(impl = EnumBridge.class)
  DataSourceType dsType;

  @Column(name = "ds_conn_type")
  @NotNull
  @Enumerated(EnumType.STRING)
  @org.hibernate.search.annotations.Field(analyze = Analyze.NO, store = Store.NO)
  @FieldBridge(impl = EnumBridge.class)
  ConnectionType connType;

  @Column(name = "ds_src_type")
  @NotNull
  @Enumerated(EnumType.STRING)
  @org.hibernate.search.annotations.Field(analyze = Analyze.NO, store = Store.NO)
  @FieldBridge(impl = EnumBridge.class)
  SourceType srcType;

  @Column(name = "ds_granularity")
  @Enumerated(EnumType.STRING)
  GranularityType granularity;

  @Column(name = "ds_seg_granularity")
  @Enumerated(EnumType.STRING)
  GranularityType segGranularity;

  /**
   * 파티션을 구성하는 필드 명 목록 (,) 구분자 사용
   */
  @Column(name = "ds_partition_keys")
  String partitionKeys;

  /**
   * 파티션을 구성하는 구분자 </br> format : {datasource name}{partitionSeparator}{key1}{partitionSeparator}{key2}...
   */
  @Column(name = "ds_partition_separator")
  String partitionSeparator;

  @Column(name = "ds_status")
  @Enumerated(EnumType.STRING)
  Status status;

  /**
   * 전체 공개 여부, true일 경우 전체 공개
   */
  @Column(name = "ds_published")
  @org.hibernate.search.annotations.Field(analyze = Analyze.NO, store = Store.YES)
  @FieldBridge(impl = BooleanBridge.class)
  Boolean published;

  /**
   * Whether to include Geo Column.
   */
  @Column(name = "ds_include_geo")
  @org.hibernate.search.annotations.Field(analyze = Analyze.NO, store = Store.YES)
  @FieldBridge(impl = BooleanBridge.class)
  Boolean includeGeo;

  /**
   * 연결된 workspace 개수
   */
  @Column(name = "ds_linked_workspaces")
  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  Integer linkedWorkspaces = 0;

  /**
   * 데이터 소스 적재 정보
   */
  @Column(name = "ingestion_conf", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @Spec(target = IngestionInfo.class)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String ingestion;

  /**
   * 데이터 소스 필드 정보
   */
  @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  @JoinColumn(name = "ds_id", referencedColumnName = "id")
  @OrderBy("seq ASC")
  @BatchSize(size = 50)
  List<Field> fields;

  @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
  @JoinTable(name = "datasource_workspace",
      joinColumns = @JoinColumn(name = "ds_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "ws_id", referencedColumnName = "id"))
  @BatchSize(size = 25)
  @IndexedEmbedded(includePaths = {"id", "name"}, includeEmbeddedObjectId = true)
  Set<Workspace> workspaces;

  @ManyToMany(cascade = {CascadeType.MERGE})
  @JoinTable(name = "datasource_dashboard",
      joinColumns = @JoinColumn(name = "ds_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "dashboard_id", referencedColumnName = "id"))
  @BatchSize(size = 50)
  @RestResource(path = "dashboards")
  Set<DashBoard> dashBoards;

  @ManyToOne(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH})
  @JoinColumn(name = "dc_id")
  DataConnection connection;

  @OneToOne(fetch = FetchType.EAGER, cascade = {CascadeType.ALL})
  @JoinColumn(name = "smy_id", referencedColumnName = "id")
  DataSourceSummary summary;

  /**
   * 엔진 데이터 소스와 스키마 일치 여부
   */
  @Column(name = "ds_fields_matched")
  @FieldBridge(impl = BooleanBridge.class)
  Boolean fieldsMatched;

  /**
   * Whether to check data source that failed during ingestion process
   */
  @Column(name = "ds_fail_on_engine")
  @FieldBridge(impl = BooleanBridge.class)
  Boolean failOnEngine;

  /**
   * Spring data rest 제약으로 인한 Dummy Property. - Transient 어노테이션 구성시 HandleBeforeSave 에서 인식 못하는 문제
   * 발생
   */
  @Column(name = "datasource_contexts", length = 10000)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String contexts;

  @Transient
  IngestionHistory history;

  @Transient
  DataSourceTemporary temporary;

  @Transient
  @JsonIgnore
  IngestionInfo ingestionInfo;

  public DataSource() {
  }

  public DataSource(String name, Field... fields) {
    this.name = name;

    for (Field field : fields) {
      this.addField(field);
    }
  }

  @PreUpdate
  @Override
  public void preUpdate() {

    String modifiedUsername = AuthUtils.getAuthUserName();
    if ("unknown".equals(modifiedUsername)) {
      // Considered to be processed by the system, skip update history info.
      return;
    }

    modifiedBy = modifiedUsername;
    modifiedTime = DateTime.now();
  }

  public void addField(Field field) {
    if (fields == null) {
      fields = Lists.newArrayList();
    }

    this.fields.add(field);
  }

  public void addDashBoard(DashBoard dashBoard) {
    if (dashBoards == null) {
      dashBoards = Sets.newHashSet();
    }

    this.dashBoards.add(dashBoard);
  }

  public void updateFromMetadata(Metadata metadata, boolean includeColumns) {

    this.name = metadata.getName();
    this.description = metadata.getDescription();

    if (includeColumns) {
      updateFieldFromColumn(metadata);
    }

  }

  public void updateFieldFromColumn(Metadata metadata) {
    Map<Long, MetadataColumn> columnMap = metadata.getFieldRefMap();

    for (Field field : this.fields) {
      Long fieldId = field.getId();
      if (!columnMap.containsKey(field.getId())) {
        continue;
      }

      MetadataColumn metadataColumn = columnMap.get(fieldId);
      field.updateFromMetaColumn(metadataColumn);
    }

  }

  public void excludeUnloadedField() {
    if (CollectionUtils.isEmpty(this.fields)) {
      return;
    }

    fields = fields.stream()
                   .filter(field -> BooleanUtils.isNotTrue(field.getUnloaded()))
                   .collect(Collectors.toList());
  }

  /**
   * Used in Projection
   */
  public List<Field> findUnloadedField() {
    if (CollectionUtils.isEmpty(this.fields)) {
      return Lists.newArrayList();
    }

    return fields.stream()
                 .filter(field -> BooleanUtils.isNotTrue(field.getUnloaded()))
                 .collect(Collectors.toList());
  }

  @JsonIgnore
  public boolean existTimestampField() {

    long timeFieldCnt = getFields().stream()
                                   .filter(field -> field.getRole() == Field.FieldRole.TIMESTAMP)
                                   .count();

    return timeFieldCnt > 0;
  }

  @JsonIgnore
  public boolean existFieldName(final String name) {
    return getFields().parallelStream()
                      .anyMatch(field -> field.getName().equals(name));
  }

  @JsonIgnore
  public List<Field> getFieldByRole(Field.FieldRole role) {

    Preconditions.checkNotNull(role);

    return fields.stream()
                 .filter(field -> field.getRole() == role)
                 .collect(Collectors.toList());
  }

  @JsonIgnore
  public Field getFieldByName(String name) {

    if (fields == null) {
      return null;
    }

    for (Field field : fields) {
      if (name.equals(field.getName())) {
        return field;
      }
    }

    return null;

  }

  @JsonIgnore
  public boolean existGeoField() {

    long timeFieldCnt = getFields().stream()
                                   .filter(field -> field.isGeoType())
                                   .count();

    return timeFieldCnt > 0;
  }

  /**
   * Select Query 생성시 Projection 이 아무것도 없을 경우, DataSource 내 Field 데이터를 기반으로 전달
   */
  @JsonIgnore
  public List<app.metatron.discovery.domain.workbook.configurations.field.Field> getAllSpecFields(boolean joinQuery, String joinAlias) {

    List<app.metatron.discovery.domain.workbook.configurations.field.Field> resultFields = Lists.newArrayList();

    for (Field field : fields) {

      String ref = null;
      if (joinQuery) {
        if (StringUtils.isNotEmpty(joinAlias)) {
          ref = joinAlias + FIELD_NAMESPACE_SEP + engineName;
        } else {
          ref = engineName;
        }
      }
      String fieldName = field.getName();

      switch (field.getRole()) {
        case DIMENSION:
          resultFields.add(new DimensionField(fieldName, ref, field.getFormatObject()));
          break;
        case MEASURE:
          resultFields.add(new MeasureField(fieldName, ref));
          break;
        case TIMESTAMP:
          if (BooleanUtils.isNotTrue(field.getDerived())) {
            resultFields.add(new TimestampField(fieldName, ref, field.getFormatObject()));
          }
          break;
      }
    }

    return resultFields;
  }

  @JsonIgnore
  public Map<String, Field> getPartitionedFieldMap() {
    return fields.stream()
                 .filter(field -> field.getPartitioned() != null && field.getPartitioned() &&
                     field.getFiltering() != null && field.getFiltering())
                 .sorted(Field.FILTERING_COMPARATOR)
                 .collect(CustomCollectors.toLinkedMap(Field::getName, field -> field));
  }

  @JsonIgnore
  public Map<String, Field> getRequiredFilterFieldMap() {
    return fields.stream()
                 .filter(field -> field.getFiltering() != null && field.getFiltering())
                 .sorted(new Field.RequiredSeqAscCompare())
                 .collect(CustomCollectors.toLinkedMap(Field::getName, field -> field));
  }

  @JsonIgnore
  public Map<Long, Field> getFieldMap() {
    return fields.stream().collect(Collectors.toMap(Field::getId, field -> field));
  }

  @JsonIgnore
  public Map<String, Field> getMetaFieldMap() {
    return getMetaFieldMap(false, null);
  }

  @JsonIgnore
  public Map<String, Field> getMetaFieldMap(final boolean includePrefix, String joinAlias) {
    Map<String, Field> metaFieldMap = Maps.newLinkedHashMap();

    for (Field field : fields) {
      StringBuilder key = new StringBuilder();
      if (includePrefix) {
        if (StringUtils.isNotEmpty(joinAlias)) {
          key.append(joinAlias).append(FIELD_NAMESPACE_SEP);
        }
        key.append(engineName).append(FIELD_NAMESPACE_SEP);
      }
      key.append(field.getName());
      metaFieldMap.put(key.toString(), field);
    }

    return metaFieldMap;
  }

  /**
   * 파티션된 데이터 소스 명을 찾기 위한 정규표현식 생성
   *
   * @param partitionTargetMap 파티션 필드 순서에 따른 LinkedHashMap 타입의 Map 객체 생성 필요
   */
  @JsonIgnore
  public List<String> getRegexDataSourceName(Map<String, Set<String>> partitionTargetMap) {

    StringBuilder builder = new StringBuilder();
    builder.append(PolarisUtils.escapeSpecialRegexChars(name));

    String allToken = "([^" + partitionSeparator + "]*)";

    for (Set<String> values : partitionTargetMap.values()) {
      if (values.isEmpty()) {
        builder.append(partitionSeparator).append("?").append(allToken);
      } else {
        builder.append(partitionSeparator);
        StringJoiner joiner = new StringJoiner("|", "(", ")");
        values.forEach(value -> joiner.add(PolarisUtils.escapeSpecialRegexChars(value)));
        builder.append(joiner.toString());
      }
    }

    return Lists.newArrayList(builder.toString());
  }

  public Boolean rollup() {
    if (StringUtils.isEmpty(ingestion)) {
      return false;
    }

    IngestionInfo ingestionInfo = getIngestionInfo();
    if (ingestionInfo == null) {
      return false;
    }

    return BooleanUtils.isTrue(ingestionInfo.getRollup());
  }

  @JsonIgnore
  public String getIngestionType() {
    if (connType == ConnectionType.ENGINE
        && ingestion != null) {

      IngestionInfo info = getIngestionInfo();
      if (info == null) {
        return "none";
      }

      if (info instanceof SingleIngestionInfo) {
        return "single";
      } else if (info instanceof BatchIngestionInfo) {
        return "batch";
      } else if (info instanceof RealtimeIngestionInfo) {
        return "realtime";
      }
    }

    return "none";
  }

  @JsonIgnore
  public <T extends IngestionInfo> T getIngestionInfoByType() {

    if (ingestion == null) {
      return null;
    }

    try {
      ingestionInfo = GlobalObjectMapper.getDefaultMapper().readValue(ingestion, IngestionInfo.class);
    } catch (IOException e) {
    }

    if (!checkMatchedSrcTypeAndIngetsionInfo(ingestionInfo)) {
      throw new IllegalArgumentException("Invalid ingestion infomation : srcType not match");
    }

    return (T) ingestionInfo;
  }

  @JsonIgnore
  public DataConnection getJdbcConnectionForIngestion() {

    JdbcIngestionInfo jdbcInfo = this.getIngestionInfoByType();

    DataConnection jdbcConnection = Preconditions.checkNotNull(this.getConnection() == null ?
                                                                   jdbcInfo.getConnection() : this.getConnection(),
                                                               "Required connection info.");

    if (jdbcConnection.getAuthenticationType() == DataConnection.AuthenticationType.USERINFO) {
      //username priority : AuthUtils.getAuthUserName() > this.getCreatedBy()
      String dataSourceUsername = AuthUtils.getAuthUserName().equals("unknown")
          ? this.getCreatedBy()
          : AuthUtils.getAuthUserName();

      jdbcConnection.setUsername(dataSourceUsername);
    } else if (jdbcConnection.getAuthenticationType() == DataConnection.AuthenticationType.DIALOG) {
      jdbcConnection.setUsername(jdbcInfo.getConnectionUsername());
      jdbcConnection.setPassword(jdbcInfo.getConnectionPassword());
    }

    return jdbcConnection;
  }

  public boolean checkMatchedSrcTypeAndIngetsionInfo(IngestionInfo info) {

    if (info == null) {
      return false;
    }

    if (info instanceof HdfsIngestionInfo && srcType == HDFS) {
      return true;
    } else if (info instanceof HiveIngestionInfo && srcType == HIVE) {
      return true;
    } else if (info instanceof JdbcIngestionInfo && srcType == JDBC) {
      return true;
    } else if (info instanceof LocalFileIngestionInfo && srcType == FILE) {
      return true;
    } else if (info instanceof RealtimeIngestionInfo && srcType == REALTIME) {
      return true;
    }

    return false;
  }

  @Override
  public Map<String, String> getContextMap() {
    if (StringUtils.isEmpty(this.contexts)) {
      return null;
    }

    return GlobalObjectMapper.readValue(this.contexts, Map.class);
  }

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

  public String getEngineName() {
    return engineName;
  }

  public void setEngineName(String engineName) {
    this.engineName = engineName;
  }

  public String getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(String ownerId) {
    this.ownerId = ownerId;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public List<Field> getFields() {
    return fields;
  }

  public void setFields(List<Field> fields) {
    this.fields = fields;
  }

  @Deprecated
  public String getAlias() {
    return name;
  }

  public Integer getLinkedWorkspaces() {
    return linkedWorkspaces;
  }

  public void setLinkedWorkspaces(Integer linkedWorkspaces) {
    this.linkedWorkspaces = linkedWorkspaces;
  }

  public Set<Workspace> getWorkspaces() {
    return workspaces;
  }

  public void setWorkspaces(Set<Workspace> workspaces) {
    this.workspaces = workspaces;
  }

  public Set<DashBoard> getDashBoards() {
    return dashBoards;
  }

  public void setDashBoards(Set<DashBoard> dashBoards) {
    this.dashBoards = dashBoards;
  }

  public DataSourceType getDataSourceType() {
    return dsType;
  }

  public void setDataSourceType(DataSourceType dsType) {
    this.dsType = dsType;
  }

  public DataSourceType getDsType() {
    return dsType;
  }

  public void setDsType(DataSourceType dsType) {
    this.dsType = dsType;
  }

  public ConnectionType getConnType() {
    return connType;
  }

  public void setConnType(ConnectionType connType) {
    this.connType = connType;
  }

  public SourceType getSrcType() {
    return srcType;
  }

  public void setSrcType(SourceType srcType) {
    this.srcType = srcType;
  }

  public GranularityType getGranularity() {
    return granularity;
  }

  public void setGranularity(GranularityType granularity) {
    this.granularity = granularity;
  }

  public GranularityType getSegGranularity() {
    return segGranularity;
  }

  public void setSegGranularity(GranularityType segGranularity) {
    this.segGranularity = segGranularity;
  }

  public String getPartitionKeys() {
    return partitionKeys;
  }

  public void setPartitionKeys(String partitionKeys) {
    this.partitionKeys = partitionKeys;
  }

  public String getPartitionSeparator() {
    return partitionSeparator;
  }

  public void setPartitionSeparator(String partitionSeparator) {
    this.partitionSeparator = partitionSeparator;
  }

  public Status getStatus() {
    return status;
  }

  public void setStatus(Status status) {
    this.status = status;
  }

  public Boolean getPublished() {
    return published;
  }

  public void setPublished(Boolean published) {
    this.published = published;
  }

  public Boolean getIncludeGeo() {
    return includeGeo;
  }

  public void setIncludeGeo(Boolean includeGeo) {
    this.includeGeo = includeGeo;
  }

  public DataConnection getConnection() {
    return connection;
  }

  public void setConnection(DataConnection connection) {
    this.connection = connection;
  }

  public String getIngestion() {
    return ingestion;
  }

  public void setIngestion(String ingestion) {
    this.ingestion = ingestion;
  }

  public DataSourceSummary getSummary() {
    return summary;
  }

  public void setSummary(DataSourceSummary summary) {
    this.summary = summary;
  }

  public IngestionHistory getHistory() {
    return history;
  }

  public void setHistory(IngestionHistory history) {
    this.history = history;
  }

  public DataSourceTemporary getTemporary() {
    return temporary;
  }

  public void setTemporary(DataSourceTemporary temporary) {
    this.temporary = temporary;
  }

  public IngestionInfo getIngestionInfo() {
    if (ingestionInfo == null) {
      return getIngestionInfoByType();
    }
    return ingestionInfo;
  }

  public void setIngestionInfo(IngestionInfo ingestionInfo) {
    this.ingestionInfo = ingestionInfo;
    this.ingestion = GlobalObjectMapper.writeValueAsString(ingestionInfo);
  }

  public String getContexts() {
    return contexts;
  }

  public void setContexts(String contexts) {
    this.contexts = contexts;
  }

  public Boolean getFieldsMatched() {
    return fieldsMatched;
  }

  public void setFieldsMatched(Boolean fieldsMatched) {
    this.fieldsMatched = fieldsMatched;
  }

  public Boolean getFailOnEngine() {
    return failOnEngine;
  }

  public void setFailOnEngine(Boolean failOnEngine) {
    this.failOnEngine = failOnEngine;
  }

  public boolean isFieldMatchedByNames(final List<String> matchingFieldNames) {
    if (this.getFields() == null || this.getFields().isEmpty()) {
      return false;
    }

    final List<String> fieldNames = this.getFields().stream()
                                        .filter(field -> field.getRole() != Field.FieldRole.TIMESTAMP)
                                        .map(field -> field.getName())
                                        .collect(Collectors.toList());

    return fieldNames.containsAll(matchingFieldNames);
  }

  public void synchronizeFields(List<Field> candidateFields) {
    final List<String> fieldNames = this.getFields().stream()
                                        .filter(field -> field.getRole() != Field.FieldRole.TIMESTAMP)
                                        .map(field -> field.getName())
                                        .collect(Collectors.toList());

    long lastFieldSeq = getLastFieldSeq();
    long nextSeq = lastFieldSeq + 1;

    for (Field candidateField : candidateFields) {
      if (fieldNames.contains(candidateField.getName()) == false) {
        candidateField.setSeq(nextSeq);
        this.addField(candidateField);
        nextSeq++;
      }
    }

    this.fieldsMatched = true;
  }

  private long getLastFieldSeq() {
    Field lastField = this.getFields().stream().sorted(Comparator.comparing(Field::getSeq)).reduce((first, second) -> second).orElse(null);
    if (lastField == null) {
      return 0l;
    } else {
      return lastField.getSeq().longValue();
    }
  }

  @Override
  public String toString() {
    return "DataSource{" +
        "id='" + id + '\'' +
        ", name='" + name + '\'' +
        ", engineName='" + engineName + '\'' +
        ", ownerId='" + ownerId + '\'' +
        ", dsType=" + dsType +
        ", connType=" + connType +
        ", srcType=" + srcType +
        ", granularity=" + granularity +
        ", segGranularity=" + segGranularity +
        ", status=" + status +
        "} ";
  }

  public enum DataSourceType {
    MASTER, JOIN, VOLATILITY
  }

  public enum ConnectionType {
    ENGINE, LINK
  }

  public enum Status {
    ENABLED, PREPARING, FAILED, BAD, DISABLED
  }

  public enum SourceType {
    FILE, HDFS, HIVE, JDBC, REALTIME, IMPORT, SNAPSHOT, NONE
  }

  public enum GranularityType {

    ALL(Long.MAX_VALUE),
    SECOND(1000L, "PT1S"),
    MINUTE(60 * 1000L, "PT1M"),
    FIVE_MINUTE(5 * 60 * 1000L, "PT5M"),
    TEN_MINUTE(10 * 60 * 1000L, "PT10M"),
    FIFTEEN_MINUTE(15 * 60 * 1000L, "PT15M"),
    THIRTY_MINUTE(30 * 60 * 1000L, "PT30M"),
    HOUR(60 * 60 * 1000L, "PT1H"),
    SIX_HOUR(6 * 60 * 60 * 1000L, "PT6H"),
    DAY(24 * 60 * 60 * 1000L, "P1D"),
    DAYOFWEEK(24 * 60 * 60 * 1000L),    // Use only at timeExprUnit
    WEEK(7 * 24 * 60 * 60 * 1000L, "P1W"),
    MONTH(31 * 24 * 60 * 60 * 1000L, "P1M"),
    QUARTER(4 * 31 * 24 * 60 * 60 * 1000L, "P3M"),
    YEAR(365 * 24 * 60 * 60 * 1000L, "P1Y"),
    NONE(0L);

    long mils;
    Period period;

    GranularityType(long mils) {
      this.mils = mils;
      this.period = null;
    }

    GranularityType(long mils, String period) {
      this.mils = mils;
      this.period = new Period(period);
    }

    public long getMils() {
      return this.mils;
    }

    /**
     * 비교 대상 파라미터의 값보다 크면 true, 작으면 false
     *
     * @param compareType 비교 대상
     */
    public boolean compareWith(GranularityType compareType) {
      return this.mils > compareType.mils ? true : false;
    }

    public String getTimeFormat() {
      String resultFormat;
      switch (this) {
        case SECOND:
          resultFormat = "yyyy-MM-dd HH:mm:ss";
          break;
        case MINUTE:
        case FIVE_MINUTE:
        case TEN_MINUTE:
        case FIFTEEN_MINUTE:
        case THIRTY_MINUTE:
          resultFormat = "yyyy-MM-dd HH:mm";
          break;
        case HOUR:
        case SIX_HOUR:
          resultFormat = "yyyy-MM-dd HH";
          break;
        case DAY:
          resultFormat = "yyyy-MM-dd";
          break;
        case WEEK:
          resultFormat = "yyyy-ww";
          break;
        case MONTH:
          resultFormat = "yyyy-MM";
          break;
        case QUARTER:
          resultFormat = "yyyy-qq";
          break;
        case YEAR:
          resultFormat = "yyyy";
          break;
        case NONE:
        case ALL:
        default:
          resultFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
      }
      return resultFormat;
    }

    public String getTimeUnitFormat() {

      String resultFormat;
      switch (this) {
        case SECOND:
          resultFormat = "ss";
          break;
        case MINUTE:
          resultFormat = "mm";
          break;
        case HOUR:
          resultFormat = "HH";
          break;
        case DAY:
          resultFormat = "dd";
          break;
        case WEEK:
          resultFormat = "ww";
          break;
        case DAYOFWEEK:
          resultFormat = "EEEE";
          break;
        case MONTH:
          resultFormat = "MM";
          break;
        case QUARTER:
          resultFormat = "qq";
          break;
        case YEAR:
          resultFormat = "yyyy";
          break;
        case NONE:
        case ALL:
        default:
          resultFormat = "yyyy-MM-dd HH:mm:ss.SSS";
      }
      return resultFormat;

    }

    public static String getTimeFormat(String granularity) {

      GranularityType type = GranularityType.valueOf(granularity);
      if (type == null) {
        type = NONE;
      }

      return type.getTimeFormat();
    }

    public static String getTimeUnit(String granularity) {

      GranularityType type = GranularityType.valueOf(granularity);
      if (type == null) {
        type = NONE;
      }

      return type.getTimeUnitFormat();
    }

    public static GranularityType fromPeriod(Period period) {
      int [] vals = period.getValues();
      int index = -1;
      for (int i = 0; i < vals.length; i++) {
        if (vals[i] != 0) {
          if (index < 0) {
            index = i;
          } else {

            throw new MetatronException("Granularity is not supported : " + period);
          }
        }
      }

      switch (index) {
        case 0:
          return GranularityType.YEAR;
        case 1:
          if (vals[index] == 3) {
            return GranularityType.QUARTER;
          } else if (vals[index] == 1) {
            return GranularityType.MONTH;
          }
          break;
        case 2:
          return GranularityType.WEEK;
        case 3:
          return GranularityType.DAY;
        case 4:
          if (vals[index] == 6) {
            return GranularityType.SIX_HOUR;
          } else if (vals[index] == 1) {
            return GranularityType.HOUR;
          }
          break;
        case 5:
          if (vals[index] == 30) {
            return GranularityType.THIRTY_MINUTE;
          } else if (vals[index] == 15) {
            return GranularityType.FIFTEEN_MINUTE;
          } else if (vals[index] == 10) {
            return GranularityType.TEN_MINUTE;
          } else if (vals[index] == 5) {
            return GranularityType.FIVE_MINUTE;
          } else if (vals[index] == 1) {
            return GranularityType.MINUTE;
          }
          break;
        case 6:
          return GranularityType.SECOND;
        default:
          break;
      }
      throw new MetatronException("Granularity is not supported : " + period);
    }

    public static GranularityType fromInterval(Interval interval)
    {
      try {
        return fromPeriod(new Period(interval.getStart(), interval.getEnd()));
      }
      catch (Exception e) {
        return null;
      }
    }
  }
}
