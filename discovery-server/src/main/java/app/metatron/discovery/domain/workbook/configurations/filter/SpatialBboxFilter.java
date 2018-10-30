package app.metatron.discovery.domain.workbook.configurations.filter;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class SpatialBboxFilter extends SpatialFilter  {

  String lowerCorner;
  String upperCorner;

  @JsonCreator
  public SpatialBboxFilter(@JsonProperty("dataSource") String dataSource,
                           @JsonProperty("field") String field,
                           @JsonProperty("ref") String ref,
                           @JsonProperty("lowerCorner") String lowerCorner,
                           @JsonProperty("upperCorner") String upperCorner) {
    super(dataSource, field, ref);
    this.lowerCorner = lowerCorner;
    this.upperCorner = upperCorner;
  }

  public String getLowerCorner() {
    return lowerCorner;
  }

  public String getUpperCorner() {
    return upperCorner;
  }

  @Override
  public boolean compare(Filter filter) {
    return false;
  }
}
