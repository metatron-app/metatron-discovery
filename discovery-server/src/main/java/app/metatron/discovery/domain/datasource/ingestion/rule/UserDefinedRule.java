package app.metatron.discovery.domain.datasource.ingestion.rule;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.lang3.StringUtils;

import app.metatron.discovery.spec.druid.ingestion.Evaluation;

/**
 * Creates a new column through an expression.
 */
public class UserDefinedRule extends EvaluationRule implements IngestionRule {

  /**
   * Expression
   */
  String expr;

  @JsonCreator
  public UserDefinedRule(@JsonProperty("name") String name,
                         @JsonProperty("expr") String expr) {
    super(name);
    this.expr = expr;
  }

  @Override
  public Evaluation toEvaluation(String name) {
    return new Evaluation(StringUtils.isNotEmpty(name) ? name : this.name, expr);
  }

  public String getExpr() {
    return expr;
  }

}
