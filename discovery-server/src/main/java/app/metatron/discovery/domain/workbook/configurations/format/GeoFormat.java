package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;

public class GeoFormat implements FieldFormat {

  String originalSrsName;

  Integer maxLevels;

  @JsonCreator
  public GeoFormat() {
  }

  public GeoFormat(String originalSrsName, Integer maxLevels) {
    this.originalSrsName = originalSrsName;
    this.maxLevels = maxLevels;
  }

  public String getOriginalSrsName() {
    return originalSrsName;
  }

  public Integer getMaxLevels() {
    return maxLevels;
  }
}
