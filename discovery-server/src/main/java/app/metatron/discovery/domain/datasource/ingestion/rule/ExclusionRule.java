package app.metatron.discovery.domain.datasource.ingestion.rule;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import app.metatron.discovery.spec.druid.ingestion.Validation;

public class ExclusionRule extends ValidationRule implements IngestionRule {

  String expr;

  @JsonCreator
  public ExclusionRule(@JsonProperty("expr") String expr) {
    this.expr = expr;
  }

  public String getExpr() {
    return expr;
  }

  @Override
  public Validation toValidation(String name) {
    return null;
  }
}
