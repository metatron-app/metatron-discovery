package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class GeoLineFormat extends GeoFormat implements FieldFormat {

  public GeoLineFormat() {
  }

  @JsonCreator
  public GeoLineFormat(@JsonProperty("originalSrsName") String originalSrsName,
                       @JsonProperty("maxLevels") Integer maxLevels) {
    super(originalSrsName, maxLevels);
  }

}
