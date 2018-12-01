package app.metatron.discovery.domain.datasource.ingestion.rule;

import app.metatron.discovery.spec.druid.ingestion.Evaluation;

public abstract class EvaluationRule {

  /**
   * Output Name
   */
  protected String name;

  public abstract Evaluation toEvaluation(String name);

  public EvaluationRule(String name) {
    this.name = name;
  }

  public String getName() {
    return name;
  }
}
