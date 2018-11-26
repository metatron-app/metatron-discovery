package app.metatron.discovery.domain.datasource.ingestion.rule;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.lang3.StringUtils;

import app.metatron.discovery.spec.druid.ingestion.Evaluation;
import app.metatron.discovery.spec.druid.ingestion.expr.Struct;

/**
 * Creates a new Geo Point type by combining latitude and longitude fields.
 */
public class GeoPointRule extends EvaluationRule implements IngestionRule {

  /**
   * Latitude Field
   */
  String latField;

  /**
   * Longitude Field
   */
  String lonField;

  @JsonCreator
  public GeoPointRule(@JsonProperty("name") String name,
                      @JsonProperty("latField") String latField,
                      @JsonProperty("lonField") String lonField) {
    super(name);
    this.latField = latField;
    this.lonField = lonField;
  }

  @Override
  public Evaluation toEvaluation(String name) {
    String outputName = StringUtils.isNotEmpty(name) ? name : this.name;
    Struct struct = new Struct(latField, lonField);
    return new Evaluation(outputName, struct.expr());
  }

  public String getLatField() {
    return latField;
  }

  public String getLonField() {
    return lonField;
  }

  @Override
  public String toString() {
    return "GeoPointRule{" +
        "latField='" + latField + '\'' +
        ", lonField='" + lonField + '\'' +
        "} " + super.toString();
  }
}
