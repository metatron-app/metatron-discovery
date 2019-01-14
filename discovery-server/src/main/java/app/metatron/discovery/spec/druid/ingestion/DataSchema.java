/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.spec.druid.ingestion;

import com.google.common.collect.Lists;

import java.util.List;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.spec.druid.ingestion.granularity.GranularitySpec;
import app.metatron.discovery.spec.druid.ingestion.parser.Parser;

/**
 * Created by kyungtaak on 2016. 6. 17..
 */
public class DataSchema {

  @NotNull
  String dataSource;

  @NotNull
  Parser parser;

  @NotNull
  List<Aggregation> metricsSpec;

  @NotNull
  GranularitySpec granularitySpec;

  /**
   * Perform type casting at the time of parsing row, if true.
   */
  Boolean enforceType = true;

  /**
   * 검증조건 기입
   */
  List<Validation> validations;

  /**
   * 대체조건 기입
   */
  List<Evaluation> evaluations;

  public DataSchema() {
  }

  public DataSchema(String dataSource, Parser parser, List<Aggregation> metricsSpec, GranularitySpec granularitySpec) {
    this.dataSource = dataSource;
    this.parser = parser;
    this.metricsSpec = metricsSpec;
    this.granularitySpec = granularitySpec;
  }

  public void addMetrics(Aggregation aggregation) {

    if(metricsSpec == null) {
      metricsSpec = Lists.newArrayList();
    }
    if(aggregation != null) {
      metricsSpec.add(aggregation);
    }
  }

  public void addValidation(Validation validation) {
    if(validations == null) {
      validations = Lists.newArrayList();
    }
    validations.add(validation);
  }

  public void addEvaluation(Evaluation evaluation) {
    if(evaluations == null) {
      evaluations = Lists.newArrayList();
    }
    evaluations.add(evaluation);
  }

  public String getDataSource() {
    return dataSource;
  }

  public void setDataSource(String dataSource) {
    this.dataSource = dataSource;
  }

  public Parser getParser() {
    return parser;
  }

  public void setParser(Parser parser) {
    this.parser = parser;
  }

  public List<Aggregation> getMetricsSpec() {
    return metricsSpec;
  }

  public void setMetricsSpec(List<Aggregation> metricsSpec) {
    this.metricsSpec = metricsSpec;
  }

  public GranularitySpec getGranularitySpec() {
    return granularitySpec;
  }

  public void setGranularitySpec(GranularitySpec granularitySpec) {
    this.granularitySpec = granularitySpec;
  }

  public Boolean getEnforceType() {
    return enforceType;
  }

  public void setEnforceType(Boolean enforceType) {
    this.enforceType = enforceType;
  }

  public List<Validation> getValidations() {
    return validations;
  }

  public void setValidations(List<Validation> validations) {
    this.validations = validations;
  }

  public List<Evaluation> getEvaluations() {
    return evaluations;
  }

  public void setEvaluations(List<Evaluation> evaluations) {
    this.evaluations = evaluations;
  }
}
