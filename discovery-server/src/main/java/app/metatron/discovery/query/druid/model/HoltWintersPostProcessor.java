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

package app.metatron.discovery.query.druid.model;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.analysis.PredictionAnalysis;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.format.ContinuousTimeFormat;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.PostProcessor;
import app.metatron.discovery.query.druid.funtions.TimeFormatFunc;
import app.metatron.discovery.query.druid.funtions.TimestampFunc;
import app.metatron.discovery.query.druid.postaggregations.MathPostAggregator;

@JsonTypeName("holtWinters")
public class HoltWintersPostProcessor implements PostProcessor {

  private Double alpha;

  private Double beta;

  private Double gamma;

  private Integer period;

  private SeasonalityType seasonalityType;

  private Boolean pad;

  private List<String> values;

  private Integer numPrediction;

  private Integer limit;

  private Integer confidence;

  private String timeExpression;

  private String timeGranularity;

  private List<PostAggregation> postAggregations;

  /**
   * HoltWintersPostProcessor 설정
   *
   * 엔진내 Default Setting
   *
   * DEFAULT_ALPHA = 0.3 <br/>
   * DEFAULT_BETA = 0.1 <br/>
   * DEFAULT_BETA = 0.3 <br/>
   * DEFAULT_PERIOD = 1 <br/>
   * DEFAULT_SEASONALITY_TYPE = SeasonalityType.ADDITIVE <br/>
   * DEFAULT_PAD = false <br/>
   * DEFAULT_USE_LAST_N = 4096 <br/>
   * DEFAULT_NUM_PREDICTION = 32 <br/>
   * DEFAULT_CONFIDENCE = 95 <br/>
   */
  @JsonCreator
  public HoltWintersPostProcessor(
      @JsonProperty("alpha") Double alpha,
      @JsonProperty("beta") Double beta,
      @JsonProperty("gamma") Double gamma,
      @JsonProperty("period") Integer period,
      @JsonProperty("seasonalityType") SeasonalityType seasonalityType,
      @JsonProperty("pad") Boolean pad,
      @JsonProperty("values") List<String> values,
      @JsonProperty("useLastN") Integer useLastN,
      @JsonProperty("numPrediction") Integer numPrediction,
      @JsonProperty("confidence") Integer confidence,
      @JsonProperty("timeExpression") String timeExpression,
      @JsonProperty("timeGranularity") String timeGranularity,
      @JsonProperty("postAggregations") List<PostAggregation> postAggregations
      ) {
    this.alpha = alpha;
    this.beta = beta;
    this.gamma = gamma;
    this.period = period;
    this.seasonalityType = seasonalityType;
    this.pad = pad;
    this.values = values;
    this.limit = useLastN;
    this.numPrediction = numPrediction;
    this.confidence = confidence;
    this.timeExpression = timeExpression;
    this.timeGranularity = timeGranularity;
    this.postAggregations = postAggregations;
  }

  public HoltWintersPostProcessor(PredictionAnalysis analysis, Field timeField, List<Field> measureFields) {

    ContinuousTimeFormat timeFormat = (ContinuousTimeFormat) timeField.getFormat();

    this.numPrediction = analysis.getInterval();

    PredictionAnalysis.Confidence  confidence = analysis.getConfidence();
    this.confidence = confidence == null ? null : (Integer) confidence.getConfidenceInterval();

    PredictionAnalysis.Forecast forecast = analysis.getForecast();
    List<PredictionAnalysis.HyperParameter> parameters = forecast.getParameters();

    this.values = Lists.newArrayList();
    // HyperParameter 가 없을 경우 기존 MeasureField 로 대체, 공통 옵션 따름
    if(CollectionUtils.isEmpty(parameters)) {
      for (Field measureField : measureFields) {
        this.values.add(measureField.getAlias());
      }
      this.period = analysis.getInterval();
    } else {
      boolean first = true;
      for (PredictionAnalysis.HyperParameter parameter : parameters) {
        this.values.add(parameter.getField());
        if (first) {
          this.alpha = parameter.getAlpha() == null ? null : parameter.getAlpha().doubleValue();
          this.beta = parameter.getBeta() == null ? null : parameter.getBeta().doubleValue();
          this.gamma = parameter.getGamma() == null ? null : parameter.getGamma().doubleValue();
          this.period = parameter.getPeriod() == null ? analysis.getInterval() : parameter.getPeriod();
          this.seasonalityType = BooleanUtils.isTrue(parameter.getMultiple()) ?
              SeasonalityType.MULTIPLICATIVE : SeasonalityType.ADDITIVE;
          first = false;
        }
      }
    }

    // Timestamp role이 아닌 경우 처리
    if(timeField instanceof DimensionField) {
      this.timeGranularity = timeFormat.getUnit().name();
      TimestampFunc timestampFunc = new TimestampFunc("\"" + timeField.getAlias() + "\"", timeFormat.getSortFormat(), null, null);
      this.timeExpression = timestampFunc.toExpression();
    }

    // 클라이언트가 지정한 Format 으로 변환
    TimeFormatFunc postFormatFunc = new TimeFormatFunc("__time",
                                                       timeFormat.getFormat(),
                                                       timeFormat.selectTimezone(),
                                                       timeFormat.getLocale());

    MathPostAggregator mathPostAggregator = new MathPostAggregator(timeField.getAlias(), postFormatFunc.toExpression(), null);

    this.postAggregations = Lists.newArrayList(mathPostAggregator);

  }

  public Double getAlpha() {
    return alpha;
  }

  public Double getBeta() {
    return beta;
  }

  public Double getGamma() {
    return gamma;
  }

  public Integer getPeriod() {
    return period;
  }

  public SeasonalityType getSeasonalityType() {
    return seasonalityType;
  }

  public Boolean getPad() {
    return pad;
  }

  public List<String> getValues() {
    return values;
  }

  public Integer getNumPrediction() {
    return numPrediction;
  }

  public Integer getLimit() {
    return limit;
  }

  public Integer getConfidence() {
    return confidence;
  }

  public String getTimeExpression() {
    return timeExpression;
  }

  public String getTimeGranularity() {
    return timeGranularity;
  }

  public List<PostAggregation> getPostAggregations() {
    return postAggregations;
  }

  public enum SeasonalityType {
    ADDITIVE, MULTIPLICATIVE
  }

}
