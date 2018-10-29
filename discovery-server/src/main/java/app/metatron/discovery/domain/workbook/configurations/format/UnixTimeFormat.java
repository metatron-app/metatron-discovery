package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import app.metatron.discovery.util.EnumUtils;
import app.metatron.discovery.util.TimeUnits;

/**
 *
 */
public class UnixTimeFormat extends TimeFieldFormat implements FieldFormat {

  TimeUnits unit;

  public UnixTimeFormat() {
  }

  @JsonCreator
  public UnixTimeFormat(
      @JsonProperty("timeZone") String timeZone,
      @JsonProperty("locale") String locale,
      @JsonProperty("unit") String unit,
      @JsonProperty("filteringType") String filteringType) {

    super(timeZone, locale, filteringType);

    this.unit = EnumUtils.getEnum(TimeUnits.class, unit, TimeUnits.MILLISECOND);
    switch (this.unit) {
      case SECOND:
      case MILLISECOND:
        break;
      default:
        throw new IllegalArgumentException(this.unit + " unit is not used.");
    }
  }

  public TimeUnits getUnit() {
    return unit;
  }

  @Override
  public String getFormat() {
    return DEFAULT_DATETIME_FORMAT;
  }

  @Override
  public String getSortFormat() {
    return null;
  }

  @Override
  public boolean enableSortField() {
    return false;
  }

  @Override
  public String getSortComparator() {
    return null;
  }
}
