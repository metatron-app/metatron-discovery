package app.metatron.discovery.domain.datasource.ingestion;

import org.datanucleus.util.StringUtils;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.Table;

import app.metatron.discovery.common.datasource.DataType;

/**
 * Ingestion Advanced Options
 */
@Entity
@Table(name = "datasource_ingestion_options")
public class IngestionOption {

  /**
   * Option Id ({optionType_ingestionType_name})
   */
  @Id
  @Column(name = "id")
  String id;

  /**
   * Option Type
   */
  @Column(name = "option_type")
  @Enumerated(EnumType.STRING)
  OptionType type;

  /**
   * Name of option
   */
  @Column(name = "option_name")
  String name;

  /**
   * Ingestion Type
   */
  @Column(name = "option_ingestion_type")
  @Enumerated(EnumType.STRING)
  IngestionType ingestionType;

  /**
   * Data type for validation
   */
  @Column(name = "option_data_type")
  @Enumerated(EnumType.STRING)
  DataType dataType;

  /**
   * Description of option
   */
  @Column(name = "option_desc")
  String description;

  /**
   * Default Value
   */
  @Column(name = "option_default_value")
  String defaultValue;

  /**
   * Enumerated value for validation (Separated by character "|")
   */
  @Column(name = "option_enum_value")
  String enumValues;

  /**
   * Minimum value for validation
   */
  @Column(name = "option_min_value")
  Number min;

  /**
   * Maximum value for validation
   */
  @Column(name = "option_max_value")
  Number max;

  public IngestionOption() {
  }

  public Object defaultValueByType() {
    if (StringUtils.isEmpty(defaultValue)) {
      return null;
    }

    switch (dataType) {
      case INTEGER:
      case LONG:
        return Long.parseLong(defaultValue);
      case FLOAT:
      case DOUBLE:
        return Double.parseDouble(defaultValue);
      case STRING:
        return defaultValue;
      default:
        return defaultValue;
    }
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

  public OptionType getType() {
    return type;
  }

  public void setType(OptionType type) {
    this.type = type;
  }

  public IngestionType getIngestionType() {
    return ingestionType;
  }

  public void setIngestionType(IngestionType ingestionType) {
    this.ingestionType = ingestionType;
  }

  public DataType getDataType() {
    return dataType;
  }

  public void setDataType(DataType dataType) {
    this.dataType = dataType;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getDefaultValue() {
    return defaultValue;
  }

  public void setDefaultValue(String defaultValue) {
    this.defaultValue = defaultValue;
  }

  public String getEnumValues() {
    return enumValues;
  }

  public void setEnumValues(String enumValues) {
    this.enumValues = enumValues;
  }

  public Number getMin() {
    return min;
  }

  public void setMin(Number min) {
    this.min = min;
  }

  public Number getMax() {
    return max;
  }

  public void setMax(Number max) {
    this.max = max;
  }

  public enum IngestionType {
    BATCH, HADOOP, REALTIME
  }

  public enum OptionType {
    TUNING, JOB
  }
}
