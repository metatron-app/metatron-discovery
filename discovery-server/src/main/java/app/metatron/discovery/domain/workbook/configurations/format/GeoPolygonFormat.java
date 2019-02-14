package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class GeoPolygonFormat extends GeoFormat implements FieldFormat {

  public GeoPolygonFormat() {
  }

  @JsonCreator
  public GeoPolygonFormat(@JsonProperty("originalSrsName") String originalSrsName,
                          @JsonProperty("maxLevels") Integer maxLevels) {
    super(originalSrsName, maxLevels);
  }

}
