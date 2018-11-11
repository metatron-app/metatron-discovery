package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;

public class TemporaryTimeFormat extends TimeFieldFormat implements FieldFormat {

  @JsonCreator
  public TemporaryTimeFormat() {
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
