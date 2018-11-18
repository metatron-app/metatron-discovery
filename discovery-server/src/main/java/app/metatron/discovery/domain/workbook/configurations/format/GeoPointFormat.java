package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import app.metatron.discovery.util.EnumUtils;

public class GeoPointFormat extends GeoFormat implements FieldFormat {

  GeoDataType dataType;

  @JsonCreator
  public GeoPointFormat(@JsonProperty("originalSrsName") String originalSrsName,
                        @JsonProperty("maxLevels") Integer maxLevels,
                        @JsonProperty("dataType") String dataType) {
    super(originalSrsName, maxLevels);
    this.dataType = EnumUtils.getUpperCaseEnum(GeoDataType.class, dataType, GeoDataType.STRUCT);
  }

  public GeoDataType getDataType() {
    return dataType;
  }

  public enum GeoDataType {
    STRUCT, WKT
  }
}
