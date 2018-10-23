package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UnixTimeFormat extends TimeFieldFormat implements FieldFormat {

  public UnixTimeFormat() {
  }

  @JsonCreator
  public UnixTimeFormat(
      @JsonProperty("timeZone") String timeZone,
      @JsonProperty("locale") String locale,
      @JsonProperty("filteringType") String filteringType) {
    super(timeZone, locale, filteringType);
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
