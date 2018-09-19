package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;

public class GeoJoinFormat extends GeoFormat implements FieldFormat {

  @JsonCreator
  public GeoJoinFormat() {
  }

}
