package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class GeoFormat implements FieldFormat {

  public static final String DEFAULT_SRSNAME = "EPSG:4326";

  String originalSrsName;

  Integer maxLevels;

  @JsonCreator
  public GeoFormat() {
  }

  public GeoFormat(String originalSrsName, Integer maxLevels) {
    this.originalSrsName = originalSrsName;
    this.maxLevels = maxLevels;
  }

  @JsonIgnore
  public String notDefaultSrsName() {
    if (DEFAULT_SRSNAME.equals(originalSrsName)) {
      return null;
    }

    return originalSrsName;
  }

  public String getOriginalSrsName() {
    return originalSrsName;
  }

  public Integer getMaxLevels() {
    return maxLevels;
  }
}
