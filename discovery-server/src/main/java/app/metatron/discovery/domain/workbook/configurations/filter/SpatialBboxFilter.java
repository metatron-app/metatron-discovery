package app.metatron.discovery.domain.workbook.configurations.filter;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.lang3.StringUtils;

public class SpatialBboxFilter extends SpatialFilter {

  String lowerCorner;

  String upperCorner;

  @JsonIgnore
  String[] uppers;

  @JsonIgnore
  String[] lowers;

  @JsonCreator
  public SpatialBboxFilter(@JsonProperty("dataSource") String dataSource,
                           @JsonProperty("field") String field,
                           @JsonProperty("ref") String ref,
                           @JsonProperty("lowerCorner") String lowerCorner,
                           @JsonProperty("upperCorner") String upperCorner) {
    super(dataSource, field, ref);

    uppers = StringUtils.split(upperCorner, " ");
    if (uppers.length == 2) {
      this.upperCorner = upperCorner;
    } else {
      throw new IllegalArgumentException("Invalid upperCorner format : " + upperCorner);
    }

    lowers = StringUtils.split(lowerCorner, " ");
    if (lowers.length == 2) {
      this.lowerCorner = lowerCorner;
    } else {
      throw new IllegalArgumentException("Invalid lowerCorner format : " + upperCorner);
    }
  }

  public double[] findLatitudes() {
    return new double[]{Double.parseDouble(lowers[1]), Double.parseDouble(uppers[1])};
  }

  public double[] findLongitudes() {
    return new double[]{Double.parseDouble(uppers[0]), Double.parseDouble(lowers[0])};
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
