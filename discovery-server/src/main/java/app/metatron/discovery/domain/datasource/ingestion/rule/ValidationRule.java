package app.metatron.discovery.domain.datasource.ingestion.rule;

import app.metatron.discovery.spec.druid.ingestion.Validation;

public abstract class ValidationRule {
  public abstract Validation toValidation(String name);
}
