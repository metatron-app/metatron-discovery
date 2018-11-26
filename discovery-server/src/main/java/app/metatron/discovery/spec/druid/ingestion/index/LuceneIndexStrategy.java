package app.metatron.discovery.spec.druid.ingestion.index;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = LuceneIndexStrategy.TextStrategy.class, name = "text"),
    @JsonSubTypes.Type(value = LuceneIndexStrategy.LatLonStrategy.class, name = "latlon"),
    @JsonSubTypes.Type(value = LuceneIndexStrategy.ShapeStrategy.class, name = "shape")
})
public abstract class LuceneIndexStrategy {

  protected String fieldName;

  public LuceneIndexStrategy(String fieldName) {
    this.fieldName = fieldName;
  }

  public String getFieldName() {
    return fieldName;
  }

  public static class TextStrategy extends LuceneIndexStrategy {

    public TextStrategy(String fieldName) {
      super(fieldName);
    }
  }

  public static class LatLonStrategy extends LuceneIndexStrategy {

    String latitude;

    String longitude;

    String crs;

    public LatLonStrategy(String fieldName, String latitude, String longitude, String crs) {
      super(fieldName);
      this.latitude = latitude;
      this.longitude = longitude;
      this.crs = crs;
    }

    public String getLatitude() {
      return latitude;
    }

    public String getLongitude() {
      return longitude;
    }

    public String getCrs() {
      return crs;
    }
  }

  public static class ShapeStrategy extends LuceneIndexStrategy {

    String shapeFormat;

    Integer maxLevels;

    public ShapeStrategy(String fieldName, String shapeFormat, Integer maxLevels) {
      super(fieldName);
      this.shapeFormat = shapeFormat;
      this.maxLevels = maxLevels;
    }

    public String getShapeFormat() {
      return shapeFormat;
    }

    public Integer getMaxLevels() {
      return maxLevels;
    }
  }
}
