package app.metatron.discovery.spec.druid.ingestion.index;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import app.metatron.discovery.query.druid.ShapeFormat;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = LuceneIndexStrategy.TextStrategy.class, name = "text"),
    @JsonSubTypes.Type(value = LuceneIndexStrategy.LatLonStrategy.class, name = "latlon"),
    @JsonSubTypes.Type(value = LuceneIndexStrategy.LatLonShapeStrategy.class, name = "latlon.shape"),
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

  public static class LatLonShapeStrategy extends LuceneIndexStrategy {

    ShapeFormat shapeFormat;

    String crs;

    public LatLonShapeStrategy(String fieldName, ShapeFormat shapeFormat, String crs) {
      super(fieldName);
      this.shapeFormat = shapeFormat;
      this.crs = crs;
    }

    public ShapeFormat getShapeFormat() {
      return shapeFormat;
    }

    public String getCrs() {
      return crs;
    }
  }

  public static class ShapeStrategy extends LuceneIndexStrategy {

    ShapeFormat shapeFormat;

    /**
     * 1 : 5,009.4km x 4,992.6km
     * 2 : 1,252.3km x 624.1km
     * 3 : 156.5km x 156km
     * 4 : 39.1km x 19.5km
     * 5 : 4.9km x 4.9km
     * 6 : 1.2km x 609.4m
     * 7 : 152.9m x 152.4m
     * 8 : 38.2m x 19m
     * 9 : 4.8m x 4.8m
     * 10 : 1.2m x 59.5cm
     * 11 : 14.9cm x 14.9cm
     * 12 : 3.7cm x 1.9cm
     */
    Integer maxLevels;

    String crs;


    public ShapeStrategy(String fieldName, ShapeFormat shapeFormat, Integer maxLevels, String crs) {
      super(fieldName);
      this.shapeFormat = shapeFormat;
      this.maxLevels = maxLevels;
      this.crs = crs;
    }

    public ShapeFormat getShapeFormat() {
      return shapeFormat;
    }

    public Integer getMaxLevels() {
      return maxLevels;
    }

    public String getCrs() {
      return crs;
    }
  }
}
