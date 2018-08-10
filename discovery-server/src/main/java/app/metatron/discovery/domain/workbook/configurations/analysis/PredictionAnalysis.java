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

package app.metatron.discovery.domain.workbook.configurations.analysis;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.io.Serializable;
import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;

/**
 * Created by kyungtaak on 2017. 2. 8..
 */
@JsonTypeName("prediction")
public class PredictionAnalysis implements Analysis {

  /**
   *  표시할 시리즈 타입
   */
  List<SeriesType> seriesTypes = Lists.newArrayList();

  /**
   * 예측 기간
   */
  Integer interval;

  /**
   * 예측 기간 단위 (시간일 경우, Optional)
   */
  TimeFieldFormat.TimeUnit timeUnit;

  /**
   * Forecast 설정
   */
  Forecast forecast;

  /**
   * Confidence 설정
   */
  Confidence confidence;

  public PredictionAnalysis() {
    // Empty Constructor
  }

  public List<SeriesType> getSeriesTypes() {
    return seriesTypes;
  }

  public void setSeriesTypes(List<SeriesType> seriesTypes) {
    this.seriesTypes = seriesTypes;
  }

  public Integer getInterval() {
    return interval;
  }

  public void setInterval(Integer interval) {
    this.interval = interval;
  }

  public TimeFieldFormat.TimeUnit getTimeUnit() {
    return timeUnit;
  }

  public void setTimeUnit(TimeFieldFormat.TimeUnit timeUnit) {
    this.timeUnit = timeUnit;
  }

  public Forecast getForecast() {
    return forecast;
  }

  public void setForecast(Forecast forecast) {
    this.forecast = forecast;
  }

  public Confidence getConfidence() {
    return confidence;
  }

  public void setConfidence(Confidence confidence) {
    this.confidence = confidence;
  }

  @Override
  public String getVersionKey() {
    return "predict";
  }

  public static class Forecast implements Serializable {

    /**
     * 분석 관련 파라미터
     */
    List<HyperParameter> parameters;

    /**
     * 예측선 표시 관련 스타일 정의
     */
    Style style;

    public Forecast() {
    }

    public Forecast(List<HyperParameter> parameters, Style style) {
      this.parameters = parameters;
      this.style = style;
    }

    public List<HyperParameter> getParameters() {
      return parameters;
    }

    public void setParameters(List<HyperParameter> parameters) {
      this.parameters = parameters;
    }

    public Style getStyle() {
      return style;
    }

    public void setStyle(Style style) {
      this.style = style;
    }
  }

  public static class Confidence implements Serializable {

    /**
     * 신뢰구간
     */
    Number confidenceInterval;

    /**
     * 신뢰 구간 표시 관련 스타일 정의
     */
    Style style;

    public Confidence() {
      // Empty Constructor
    }

    public Confidence(Number confidenceInterval) {
      this.confidenceInterval = confidenceInterval;
    }

    public Confidence(Number confidenceInterval, Style style) {
      this.confidenceInterval = confidenceInterval;
      this.style = style;
    }

    public Number getConfidenceInterval() {
      return confidenceInterval;
    }

    public void setConfidenceInterval(Number confidenceInterval) {
      this.confidenceInterval = confidenceInterval;
    }

    public Style getStyle() {
      return style;
    }

    public void setStyle(Style style) {
      this.style = style;
    }
  }

  public static class HyperParameter implements Serializable{

    /**
     * 대상 Measure 필드명 (alias)
     */
    String field;

    /**
     * alpha
     */
    Number alpha;

    /**
     * Beta
     */
    Number beta;

    /**
     * Gamma
     */
    Number gamma;

    /**
     * Period
     */
    Integer period;

    /**
     * Trend 반영 여부
     */
    Boolean showTrend;

    /**
     * Seasonal 반영 여부
     */
    Boolean showSeasonal;

    /**
     * 파마미터 값을 곱할지(multiplicative) 여부 (기본값은 덧셈 - additive)
     */
    Boolean isMultiple;

    public HyperParameter() {
      // Empty Constructor
    }

    public HyperParameter(String field, Number alpha, Number beta, Number gamma, Integer period, Boolean isMultiple) {
      this.field = field;
      this.alpha = alpha;
      this.beta = beta;
      this.gamma = gamma;
      this.period = period;
      this.isMultiple = isMultiple;
    }

    public HyperParameter(String field) {
      this.field = field;
    }

    public String getField() {
      return field;
    }

    public void setField(String field) {
      this.field = field;
    }

    public Number getAlpha() {
      return alpha;
    }

    public void setAlpha(Number alpha) {
      this.alpha = alpha;
    }

    public Number getBeta() {
      return beta;
    }

    public void setBeta(Number beta) {
      this.beta = beta;
    }

    public Number getGamma() {
      return gamma;
    }

    public void setGamma(Number gamma) {
      this.gamma = gamma;
    }

    public Integer getPeriod() {
      return period;
    }

    public void setPeriod(Integer period) {
      this.period = period;
    }

    public Boolean getShowTrend() {
      return showTrend;
    }

    public void setShowTrend(Boolean showTrend) {
      this.showTrend = showTrend;
    }

    public Boolean getShowSeasonal() {
      return showSeasonal;
    }

    public void setShowSeasonal(Boolean showSeasonal) {
      this.showSeasonal = showSeasonal;
    }

    public Boolean getMultiple() {
      return isMultiple;
    }

    public void setMultiple(Boolean multiple) {
      isMultiple = multiple;
    }
  }

  /**
   * Series Types
   */
  public enum SeriesType {
    FORECAST, CONFIDENCE
  }

}
