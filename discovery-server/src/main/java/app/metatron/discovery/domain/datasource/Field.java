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
import com.google.common.collect.Ordering;
import com.google.common.primitives.Longs;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;

import java.io.Serializable;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.entity.Spec;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.datasource.connection.jdbc.JdbcDataConnection;
import app.metatron.discovery.domain.datasource.ingestion.IngestionRule;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.IntervalFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeFilter;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.aggregations.ApproxHistogramFoldAggregation;
import app.metatron.discovery.query.druid.aggregations.AreaAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericMaxAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericMinAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericSumAggregation;
import app.metatron.discovery.query.druid.aggregations.RangeAggregation;
import app.metatron.discovery.query.druid.aggregations.VarianceAggregation;

import static app.metatron.discovery.domain.workbook.configurations.field.MeasureField.AggregationType.NONE;

/**
 * Created by kyungtaak on 2015. 12. 8..
 */
@Entity
@Table(name = "field")
public class Field implements MetatronDomain<Long> {

  public final static String FIELD_NAME_CURRENT_TIMESTAMP = "__ctime";
  public final static String COLUMN_NAME_CURRENT_DATETIME = "current_datetime";

  static final Comparator<Field> FILTERING_COMPARATOR = new Ordering<Field>() {
    @Override
    public int compare(Field f1, Field f2) {
      return Longs.compare(f1.getFilteringSeq(), f2.getFilteringSeq());
    }
  }.nullsLast();

  /**
   * ID
   */
  @Column(name = "id")
//  @GeneratedValue(strategy = GenerationType.AUTO)
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Id
  private Long id;

  /**
   * Field 명 (물리명)
   */
  @Column(name = "field_name")
  @NotBlank
  private String name;

  /**
   * Field 별칭 (논리명)
   */
  @Column(name = "field_alias")
  private String alias;

  /**
   * Field 설명
   */
  @Column(name = "field_desc", length = 1000)
  @Size(max = 900)
  private String description;

  /**
   * 데이터 타입
   */
  @Column(name = "field_type")
  @Enumerated(EnumType.STRING)
  @NotNull
  private DataType type;

  /**
   * 저장공간과 다른 논리적 데이터 타입
   */
  @Column(name = "field_logical_type")
  @Enumerated(EnumType.STRING)
  private LogicalType logicalType;

  /**
   * OLAP Role
   */
  @Column(name = "field_role")
  @Enumerated(EnumType.STRING)
  private FieldRole role;

  /**
   * Partition 대상 필드 인지 여부
   */
  @Column(name = "field_partitioned")
  private Boolean partitioned;

  /**
   * 필수적으로 필터링을 수행해야하는 필드인지 여부
   */
  @Column(name = "field_filtering")
  private Boolean filtering;

  /**
   * 필수 필터링 순서 지정
   */
  @Column(name = "field_filtering_seq")
  private Long filteringSeq;

  /**
   * 필수 필터링 옵션 지정
   */
  @Column(name = "field_filtering_options", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @Spec(target = FilterOption.class)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String filteringOptions;

  /**
   * 사전 집계 타입
   */
  @Column(name = "pre_aggr_type")
  @Enumerated(EnumType.STRING)
  private MeasureField.AggregationType aggrType = NONE;

  /**
   * 필드 정렬 순서
   */
  @Column(name = "seq")
  private Long seq;

  /**
   * 적재 방식 (Discard or Set Default Value)
   */
  @Column(name = "field_ingestion_rule", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @Spec(target = IngestionRule.class)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String ingestionRule;

  /**
   * 필드 데이터 형태 </br>
   * (timestamp type인 경우, ISO8601 Date format)
   */
  @Column(name = "field_format")
  private String format;

  @ManyToOne(cascade={CascadeType.ALL})
  @JoinColumn(name = "ref_id", referencedColumnName = "id")
  private Field mapper;

  /**
   * 기존 물리적인 필드를 매핑하여 신규 필드를 구성할 경우 관련 필드 정보
   */
  @OneToMany(mappedBy = "mapper")
  @JsonBackReference
  private Set<Field> mappedField;

  @Transient
  private String originalName;

  @Transient
  private String originalType;

  /**
   * 필드 삭제 여부 처리
   */
  @Transient
  @JsonProperty
  private Boolean removed;

  public Field() {
    // Empty Constructor
  }

  public Field(String name, DataType type, long seq) {
    this(name, type, null, seq);
  }

  public Field(String name, DataType type, FieldRole role, long seq) {
    this.name = name;
    this.type = type;
    this.role = role == null ? this.type.toRole() : role;
    this.seq = seq;
  }

  public Field(CollectionPatch patch) {
    this.name = patch.getValue("name");
    this.alias = patch.getValue("alias");
    this.description = patch.getValue("description");
    this.type = SearchParamValidator.enumUpperValue(DataType.class, patch.getValue("type"), "type");
    this.role = SearchParamValidator.enumUpperValue(FieldRole.class, patch.getValue("role"), "role");
    this.logicalType = SearchParamValidator.enumUpperValue(LogicalType.class, patch.getValue("logicalType"), "logicalType");
    this.aggrType = SearchParamValidator.enumUpperValue(MeasureField.AggregationType.class, patch.getValue("aggrType"), "aggrType");
    this.format = patch.getValue("format");
    this.seq = patch.getLongValue("seq");

    this.filtering = patch.getValue("filtering");
    this.filteringSeq = patch.getLongValue("filteringSeq");
    setFilteringOptions(patch.getObjectValue("filteringOptions"));
  }

  public void updateField(CollectionPatch patch) {
    // if(patch.hasProperty("name")) this.name = patch.getValue("name");
    if(patch.hasProperty("alias")) this.alias = patch.getValue("alias");
    if(patch.hasProperty("description")) this.description = patch.getValue("description");
    if(patch.hasProperty("logicalType")) this.logicalType = SearchParamValidator.enumUpperValue(LogicalType.class, patch.getValue("logicalType"), "logicalType");
    if(patch.hasProperty("format")) this.format = patch.getValue("format");
    if(patch.hasProperty("filtering")) this.filtering = patch.getValue("filtering");
    if(patch.hasProperty("filteringOptions")) setFilteringOptions(patch.getObjectValue("filteringOptions"));
    if(patch.hasProperty("filteringSeq")) this.filteringSeq = patch.getLongValue("filteringSeq");
    if(patch.hasProperty("seq")) this.seq = patch.getLongValue("seq");
  }

  /**
   * Ingestion spec. 처리시 확인 할 것
   */
  @JsonIgnore
  public Aggregation getAggregation() {

    if (aggrType == null) {
      return new GenericSumAggregation(name, name, "double");
    }

    // TODO: SUM/MIN/MAX 타입도 체크해야하는지 확인 해볼것
    switch (aggrType) {
      case SUM:
        return new GenericSumAggregation(name, name, "double");
      case MIN:
        return new GenericMinAggregation(name, name, "double");
      case MAX:
        return new GenericMaxAggregation(name, name, "double");
      case AREA:
        return new AreaAggregation(name, name);
      case RANGE:
        return new RangeAggregation(name, name);
      case VARIATION:
        return new VarianceAggregation(name, name);
      case APPROX:
        return new ApproxHistogramFoldAggregation(name, name);
      default:
        return new GenericSumAggregation(name, name, "double");
    }
  }

  public void setColumnType(JdbcDataConnection connection, String columnType) {

    if (StringUtils.isEmpty(columnType)) {
      this.type = DataType.STRING;
      this.role = FieldRole.DIMENSION;
      return;
    }

    String typeName = StringUtils.substringBefore(columnType, "(").toUpperCase();

    switch (typeName) {
      case "STRING":
      case "VARCHAR":
      case "CHAR":
        this.type = DataType.STRING;
        this.role = FieldRole.DIMENSION;
        break;
      case "TIMESTAMP":
      case "DATE":
        this.type = DataType.TIMESTAMP;
        this.role = FieldRole.DIMENSION;
        this.format = connection.getDefaultTimeFormat();
        break;
      case "FLOAT":
        this.type = DataType.FLOAT;
        this.role = FieldRole.MEASURE;
        break;
      case "DOUBLE":
      case "DECIMAL":
        this.type = DataType.DOUBLE;
        this.role = FieldRole.MEASURE;
        break;
      case "TINYINT":
      case "SMALLINT":
      case "INT":
      case "BIGINT":
        this.type = DataType.INTEGER;
        this.role = FieldRole.MEASURE;
        break;
      default:
        this.type = DataType.STRING;
        this.role = FieldRole.DIMENSION;
        break;
    }
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
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

  public DataType getType() {
    return type;
  }

  public void setType(DataType type) {
    this.type = type;
  }

  public LogicalType getLogicalType() {
    if(logicalType == null) {
      return type.toLogicalType();
    }
    return logicalType;
  }

  public void setLogicalType(LogicalType logicalType) {
    this.logicalType = logicalType;
  }

  public Long getSeq() {
    return seq;
  }

  public void setSeq(Long seq) {
    this.seq = seq;
  }

  @JsonIgnore
  @Deprecated
  public BIType getBiType() {
    if(role == null) {
      return null;
    }
    return BIType.valueOf(role.name());
  }

  public FieldRole getRole() {
    return role;
  }

  public void setRole(FieldRole role) {
    this.role = role;
  }

  public MeasureField.AggregationType getAggrType() {
    return aggrType;
  }

  public void setAggrType(MeasureField.AggregationType aggrType) {
    this.aggrType = aggrType;
  }

  public String getAlias() {
    if (StringUtils.isEmpty(alias)) {
      return name;
    }
    return alias;
  }

  public void setAlias(String alias) {
    this.alias = alias;
  }

  public String getIngestionRule() {
    return ingestionRule;
  }

  @JsonIgnore
  public IngestionRule getIngestionRuleObject() {
    return GlobalObjectMapper.readValue(ingestionRule, IngestionRule.class);
  }

  public void setIngestionRule(String ingestionRule) {
    this.ingestionRule = ingestionRule;
  }

  public String getFormat() {
    return format;
  }

  public void setFormat(String format) {
    this.format = format;
  }

  public Boolean getPartitioned() {
    return partitioned;
  }

  public void setPartitioned(Boolean partitioned) {
    this.partitioned = partitioned;
  }

  public Boolean getFiltering() {
    return filtering;
  }

  public void setFiltering(Boolean filtering) {
    this.filtering = filtering;
  }

  public Long getFilteringSeq() {
    return filteringSeq;
  }

  public void setFilteringSeq(Long filteringSeq) {
    this.filteringSeq = filteringSeq;
  }

  public String getFilteringOptions() {
    return filteringOptions;
  }

  public void setFilteringOptions(Object object) {
    FilterOption option = GlobalObjectMapper.getDefaultMapper().convertValue(object, Field.FilterOption.class);
    this.filteringOptions = GlobalObjectMapper.writeValueAsString(option);
  }

  public void setFilteringOptions(String filteringOptions) {
    this.filteringOptions = filteringOptions;
  }

  public Field getMapper() {
    return mapper;
  }

  public void setMapper(Field mapper) {
    this.mapper = mapper;
  }

  public Set<Field> getMappedField() {
    return mappedField;
  }

  public void setMappedField(Set<Field> mappedField) {
    this.mappedField = mappedField;
  }

  public String getOriginalName() {
    return originalName;
  }

  public void setOriginalName(String originalName) {
    this.originalName = originalName;
  }

  public String getOriginalType() {
    return originalType;
  }

  public void setOriginalType(String originalType) {
    this.originalType = originalType;
  }

  public Boolean getRemoved() {
    return removed;
  }

  public void setRemoved(Boolean removed) {
    this.removed = removed;
  }

  @Override
  public String toString() {
    return "Field{" +
        "id=" + id +
        ", name='" + name + '\'' +
        ", type='" + type + '\'' +
        ", role=" + getRole() +
        ", seq=" + seq +
        '}';
  }

  public enum BIType {
    DIMENSION,
    MEASURE,
    TIMESTAMP
  }

  public enum FieldRole {
    DIMENSION,
    MEASURE,
    TIMESTAMP
  }

  public static class RequiredSeqAscCompare implements Comparator<Field> {

    /**
     * 오름차순(ASC)
     */
    @Override
    public int compare(Field field1, Field field2) {
      Long seq1 = field1.getFilteringSeq();
      Long seq2 = field2.getFilteringSeq();

      if (seq1 == null && seq2 == null) {
        return 0;
      }

      if (seq1 != null && seq2 == null) {
        return -1;
      }

      if (seq1 == null && seq2 != null) {
        return 1;
      }

      return seq1.compareTo(seq2);
    }

  }

  public enum AllowFilterOptionType {
    TIME, INCLUSION;

    public String checkSelector(String selectorType) {
      Preconditions.checkNotNull(selectorType, "selectorType required");
      switch (this) {
        case TIME:
          if(TimeFilter.filterOptionTypes.contains(selectorType.toUpperCase())) {
            return selectorType;
          }
        case INCLUSION:
          InclusionFilter.SelectorType.valueOf(selectorType.toUpperCase());
          return selectorType;
      }
      throw new IllegalArgumentException("Invalid selector name : " + selectorType);
    }
  }

  /**
   * Recommendation Filter Options
   */
  public static class FilterOption implements Serializable {
    AllowFilterOptionType type;
    String defaultSelector;
    List<String> allowSelectors;

    @JsonCreator
    public FilterOption(
        @JsonProperty("type") String type,
        @JsonProperty("defaultSelector") String defaultSelector,
        @JsonProperty("allowSelectors") List<String> allowSelectors) {

      this.type = SearchParamValidator.enumUpperValue(AllowFilterOptionType.class,
                                                      type, "type");

      this.defaultSelector = this.type.checkSelector(defaultSelector);

      if(CollectionUtils.isNotEmpty(allowSelectors)) {
        this.allowSelectors = allowSelectors.stream()
                                          .map(s -> this.type.checkSelector(s))
                                          .collect(Collectors.toList());
      }
    }

    public AllowFilterOptionType getType() {
      return type;
    }

    public String getDefaultSelector() {
      return defaultSelector;
    }

    public List<String> getAllowSelectors() {
      return allowSelectors;
    }
  }
}
