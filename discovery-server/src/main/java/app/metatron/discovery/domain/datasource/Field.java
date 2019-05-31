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
import com.google.common.collect.Ordering;
import com.google.common.collect.Sets;
import com.google.common.primitives.Longs;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;

import java.io.Serializable;
import java.util.Comparator;
import java.util.List;
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
import app.metatron.discovery.domain.datasource.ingestion.rule.IngestionRule;
import app.metatron.discovery.domain.mdm.MetadataColumn;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeFilter;
import app.metatron.discovery.domain.workbook.configurations.format.ContinuousTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.CustomDateTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.UnixTimeFormat;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.aggregations.ApproxHistogramFoldAggregation;
import app.metatron.discovery.query.druid.aggregations.AreaAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericMaxAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericMinAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericSumAggregation;
import app.metatron.discovery.query.druid.aggregations.RangeAggregation;
import app.metatron.discovery.query.druid.aggregations.RelayAggregation;
import app.metatron.discovery.query.druid.aggregations.VarianceAggregation;
import app.metatron.discovery.spec.druid.ingestion.parser.TimestampSpec;
import app.metatron.discovery.util.TimeUnits;

import static app.metatron.discovery.domain.workbook.configurations.field.MeasureField.AggregationType.NONE;

/**
 * Created by kyungtaak on 2015. 12. 8..
 */
@Entity
@Table(name = "field")
public class Field implements MetatronDomain<Long> {

  public final static String FIELD_NAME_CURRENT_TIMESTAMP = "__ctime";
  public final static String COLUMN_NAME_CURRENT_DATETIME = "current_datetime";
  public final static String[] RESERVED_FIELDS = { "count", "__time", "timestamp" };

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
  @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
  @GenericGenerator(name = "native", strategy = "native")
  @Id
  private Long id;

  /**
   * Field name on engine
   */
  @Column(name = "field_name")
  @NotBlank
  private String name;

  /**
   * Field logical name
   */
  @Column(name = "field_logical_name")
  private String logicalName;

  /**
   * Original field name, column name of source data before ingestion
   */
  @Column(name = "field_sql_name")
  private String sqlName;

  /**
   * Field description
   */
  @Column(name = "field_desc", length = 1000)
  @Size(max = 900)
  private String description;

  /**
   * Physical data type on engine
   */
  @Column(name = "field_type")
  @Enumerated(EnumType.STRING)
  @NotNull
  private DataType type;

  /**
   * Logical data type
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
   * Whether partitioned field
   */
  @Column(name = "field_partitioned")
  private Boolean partitioned;

  /**
   * Whether to use as mandatory filter
   */
  @Column(name = "field_filtering")
  private Boolean filtering;

  /**
   * Sequence for mandatory filtered field
   */
  @Column(name = "field_filtering_seq")
  private Long filteringSeq;

  /**
   * Option of mandatory filter
   */
  @Column(name = "field_filtering_options", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @Spec(target = FilterOption.class)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String filteringOptions;

  /**
   * Type of pre-aggregation
   */
  @Column(name = "pre_aggr_type")
  @Enumerated(EnumType.STRING)
  private MeasureField.AggregationType aggrType = NONE;

  /**
   * Whether to exclude what to load to engine
   */
  @Column(name = "field_unloaded")
  private Boolean unloaded;

  /**
   * Sequence for field alignment
   */
  @Column(name = "seq")
  private Long seq;

  /**
   * Whether to derived field (not physical field)
   */
  @Column(name = "field_derived")
  private Boolean derived;

  /**
   * Derivation rule
   */
  @Column(name = "field_derivation_rule", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @Spec(target = IngestionRule.class)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String derivationRule;

  /**
   * Ingestion rule (Discard or Set Default Value)
   */
  @Column(name = "field_ingestion_rule", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @Spec(target = IngestionRule.class)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String ingestionRule;

  /**
   * Field data format
   */
  @Column(name = "field_format", length = 65535, columnDefinition = "TEXT")
  @Spec(target = FieldFormat.class)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String format;

  @ManyToOne(cascade = {CascadeType.ALL})
  @JoinColumn(name = "ref_id", referencedColumnName = "id")
  private Field mapper;

  /**
   * Related field information, When you configure a new field by mapping an existing physical
   * field
   */
  @OneToMany(mappedBy = "mapper")
  @JsonBackReference
  private Set<Field> mappedField;

  @Transient
  @JsonProperty
  private String originalName;

  @Transient
  @JsonProperty
  private String originalType;

  @Transient
  @JsonProperty
  private Boolean duplicated;

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
    this.logicalName = patch.getValue("logicalName");
    this.description = patch.getValue("description");
    this.type = SearchParamValidator.enumUpperValue(DataType.class, patch.getValue("type"), "type");
    this.role = SearchParamValidator.enumUpperValue(FieldRole.class, patch.getValue("role"), "role");
    this.logicalType = SearchParamValidator.enumUpperValue(LogicalType.class, patch.getValue("logicalType"), "logicalType");
    this.aggrType = SearchParamValidator.enumUpperValue(MeasureField.AggregationType.class, patch.getValue("aggrType"), "aggrType");
    this.seq = patch.getLongValue("seq");

    this.filtering = patch.getValue("filtering");

    if (BooleanUtils.isTrue(this.filtering)) {
      this.filteringSeq = patch.getLongValue("filteringSeq");
      setFilteringOptions(patch.getObjectValue("filteringOptions"));
    }

    setFormat(patch.getObjectValue("format"));
  }

  public static void checkDuplicatedField(List<Field> fields, boolean changeOriginalName) {

    String dupSuffixFormat = "_DUP%d";

    List<String> fieldNames = fields.stream().map(f -> f.getName()).collect(Collectors.toList());

    Set<String> allItems = Sets.newHashSet();
    Set<String> duplicates = fieldNames.stream()
                                       .filter(n -> !allItems.add(n))
                                       .collect(Collectors.toSet());

    for (String duplicate : duplicates) {
      List<Field> dupFields = fields.stream()
                                    .filter(f -> duplicate.equals(f.getName()))
                                    .collect(Collectors.toList());

      for (int i = 0; i < dupFields.size(); i++) {
        Field field = dupFields.get(i);
        String originalName = field.getName();
        String duplicatedName = field.getName() + String.format(dupSuffixFormat, i + 1);
        field.setName(duplicatedName);
        field.setLogicalName(originalName);
        field.setDuplicated(true);

        if (changeOriginalName) {
          field.setOriginalName(duplicatedName);
        } else {
          field.setOriginalName(originalName);
        }
      }
    }

  }

  public void updateField(CollectionPatch patch) {
    // if(patch.hasProperty("name")) this.name = patch.getValue("name");
    if (patch.hasProperty("logicalName")) this.logicalName = patch.getValue("logicalName");

    if (patch.hasProperty("description")) this.description = patch.getValue("description");

    if (patch.hasProperty("logicalType"))
      this.logicalType = SearchParamValidator.enumUpperValue(LogicalType.class, patch.getValue("logicalType"), "logicalType");

    if (patch.hasProperty("format")) setFormat(patch.getObjectValue("format"));

    if (patch.hasProperty("seq")) this.seq = patch.getLongValue("seq");

    if (patch.hasProperty("filtering")) this.filtering = patch.getValue("filtering");

    if (BooleanUtils.isTrue(this.filtering)) {
      if (patch.hasProperty("filteringOptions"))
        setFilteringOptions(patch.getObjectValue("filteringOptions"));
      if (patch.hasProperty("filteringSeq")) this.filteringSeq = patch.getLongValue("filteringSeq");
    } else {
      this.filteringOptions = null;
      this.filteringSeq = null;
    }

  }

  public void updateFromMetaColumn(MetadataColumn column) {
    this.logicalName = column.getName();
    this.logicalType = column.getType();
    this.description = column.getDescription();
    this.format = column.getFormat();
    this.seq = column.getSeq();
  }

  public boolean changedName() {
    if (StringUtils.isEmpty(name)) {
      return false;
    }

    if (!name.equals(getOriginalName())) {
      return true;
    }

    return false;
  }

  /**
   * for backward compatibility of timezone
   */
  public static Field ofFakeTimestamp() {
    Field field = new Field();
    field.setFormat(null);
    return field;
  }

  /**
   * Ingestion spec. 처리시 확인 할 것
   */
  @JsonIgnore
  public Aggregation getAggregation(boolean isRelay) {

    if (isRelay) {
      return new RelayAggregation(name, getOriginalName(), logicalType.toEngineMetricType());
    }

    if (aggrType == null) {
      return new GenericSumAggregation(name, getOriginalName(), "double");
    }

    // TODO: SUM/MIN/MAX 타입도 체크해야하는지 확인 해볼것
    switch (aggrType) {
      case SUM:
        return new GenericSumAggregation(name, getOriginalName(), "double");
      case MIN:
        return new GenericMinAggregation(name, getOriginalName(), "double");
      case MAX:
        return new GenericMaxAggregation(name, getOriginalName(), "double");
      case AREA:
        return new AreaAggregation(name, getOriginalName());
      case RANGE:
        return new RangeAggregation(name, getOriginalName());
      case VARIATION:
        return new VarianceAggregation(name, getOriginalName());
      case APPROX:
        return new ApproxHistogramFoldAggregation(name, getOriginalName());
      default:
        return new GenericSumAggregation(name, getOriginalName(), "double");
    }
  }

  @JsonIgnore
  public boolean isGeoType() {
    LogicalType logicalType = getLogicalType();
    return logicalType == LogicalType.GEO_POINT
        || logicalType == LogicalType.GEO_LINE
        || logicalType == LogicalType.GEO_POLYGON;
  }

  public void setColumnType(JdbcDialect jdbcDialect, String columnType) {

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
        this.format = jdbcDialect.getDefaultTimeFormat(null);
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

  @JsonIgnore
  public String getTimeFormat() {

    if (StringUtils.isEmpty(format)) {
      return format;
    }

    FieldFormat fieldFormat = getFormatObject();

    // If it is a simple string, it is recognized as datetime format
    if (StringUtils.isNotEmpty(format)
        && (fieldFormat == null || !(fieldFormat instanceof TimeFieldFormat))) {
      return format;
    }

    return ((TimeFieldFormat) fieldFormat).getFormat();
  }

  @JsonIgnore
  public TimestampSpec createTimestampSpec() {

    TimestampSpec timestampSpec = new TimestampSpec();
    timestampSpec.setColumn(this.getOriginalName());
    timestampSpec.setReplaceWrongColumn(true);

    FieldFormat fieldFormat = GlobalObjectMapper.readValue(this.format, FieldFormat.class);

    // If it is a simple string, it is recognized as datetime format
    if (StringUtils.isNotEmpty(this.format) && fieldFormat == null) {
      timestampSpec.setFormat(this.format);
      return timestampSpec;
    }

    if (fieldFormat == null && !(fieldFormat instanceof TimeFieldFormat)) {
      timestampSpec.setFormat("auto");
      return timestampSpec;
    }

    TimeFieldFormat timeFieldFormat = (TimeFieldFormat) fieldFormat;

    DateTime defaultReplaceDateTime = DateTime.now(DateTimeZone.forID(timeFieldFormat.selectTimezone()));
    timestampSpec.setInvalidValue(defaultReplaceDateTime);
    timestampSpec.setMissingValue(defaultReplaceDateTime);

    if (fieldFormat instanceof CustomDateTimeFormat) {
      timestampSpec.setFormat(timeFieldFormat.getFormat());
    } else if (fieldFormat instanceof UnixTimeFormat) {
      TimeUnits unit = ((UnixTimeFormat) fieldFormat).getUnit();
      if (unit != null && unit == TimeUnits.SECOND) {
        timestampSpec.setFormat("posix");
      } else {
        timestampSpec.setFormat("millis");
      }
    } else if (fieldFormat instanceof ContinuousTimeFormat) {
      timestampSpec.setFormat(timeFieldFormat.getFormat());
    }

    timestampSpec.setTimeZone(timeFieldFormat.selectTimezone());
    timestampSpec.setLocale(timeFieldFormat.getLocale());

    return timestampSpec;
  }

  /**
   * For backward compatibility of timezone. <br/>
   * Defines the conditions under which backward compatibility should be performed.
   */
  public boolean backwardTime() {
    FieldFormat fieldFormat = GlobalObjectMapper.readValue(format, FieldFormat.class);
    if (fieldFormat == null) {
      return true;
    }
    return false;
  }

  @JsonIgnore
  public boolean isNotPhysicalField() {
    return BooleanUtils.isTrue(derived) || BooleanUtils.isTrue(unloaded);
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

  public String getLogicalName() {
    if (StringUtils.isEmpty(logicalName)) {
      return name;
    }
    return logicalName;
  }

  public void setLogicalName(String logicalName) {
    this.logicalName = logicalName;
  }

  public LogicalType getLogicalType() {
    if (logicalType == null) {
      return type.toLogicalType();
    }
    return logicalType;
  }

  public void setLogicalType(LogicalType logicalType) {
    this.logicalType = logicalType;
  }

  public String getSqlName() {
    return sqlName;
  }

  public void setSqlName(String sqlName) {
    this.sqlName = sqlName;
  }

  public Long getSeq() {
    return seq;
  }

  public void setSeq(Long seq) {
    this.seq = seq;
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

  @JsonIgnore
  public IngestionRule getDerivationRuleObject() {
    return GlobalObjectMapper.readValue(derivationRule, IngestionRule.class);
  }

  public String getDerivationRule() {
    return derivationRule;
  }

  public void setDerivationRule(String derivationRule) {
    this.derivationRule = derivationRule;
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

  @JsonIgnore
  public FieldFormat getFormatObject() {
    FieldFormat fieldFormat = GlobalObjectMapper.readValue(format, FieldFormat.class);
    if (getLogicalType() == LogicalType.TIMESTAMP && fieldFormat == null) {
      fieldFormat = new CustomDateTimeFormat(format);
    }
    return fieldFormat;
  }

  public String getFormat() {
    if (format == null) {
      return null;
    }

    // For the backward compatibility of existing plain text.
    return GlobalObjectMapper.writeValueAsString(getFormatObject());
  }

  public void setFormat(Object object) {
    if (object == null) {
      this.format = null;
    } else {
      FieldFormat format = GlobalObjectMapper.getDefaultMapper().convertValue(object, FieldFormat.class);
      this.format = GlobalObjectMapper.writeValueAsString(format);
    }
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

  public Boolean getUnloaded() {
    return unloaded;
  }

  public void setUnloaded(Boolean unloaded) {
    this.unloaded = unloaded;
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
    if (object == null) {
      this.filteringOptions = null;
    } else {
      FilterOption option = GlobalObjectMapper.getDefaultMapper().convertValue(object, Field.FilterOption.class);
      this.filteringOptions = GlobalObjectMapper.writeValueAsString(option);
    }
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

  public Boolean getDerived() {
    return derived;
  }

  public void setDerived(Boolean derived) {
    this.derived = derived;
  }

  public String getOriginalName() {
    if (StringUtils.isEmpty(originalName)) {
      return name;
    }
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

  public Boolean getDuplicated() {
    return duplicated;
  }

  public void setDuplicated(Boolean duplicated) {
    this.duplicated = duplicated;
  }

  @Override
  public String toString() {
    return "Field{" +
        "id=" + id +
        ", name='" + name + '\'' +
        ", type=" + type +
        ", logicalType=" + logicalType +
        ", role=" + role +
        ", format='" + format + '\'' +
        '}';
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
          if (TimeFilter.filterOptionTypes.contains(selectorType.toUpperCase())) {
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

      if (CollectionUtils.isNotEmpty(allowSelectors)) {
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
