package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class GeoPointFormat extends GeoFormat implements FieldFormat {

  public GeoPointFormat() {
  }

  @JsonCreator
  public GeoPointFormat(@JsonProperty("originalSrsName") String originalSrsName,
                        @JsonProperty("maxLevels") Integer maxLevels) {
    super(originalSrsName, maxLevels);
  }

}
