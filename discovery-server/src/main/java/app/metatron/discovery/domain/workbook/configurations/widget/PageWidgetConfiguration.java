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

package app.metatron.discovery.domain.workbook.configurations.widget;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.Pivot;
import app.metatron.discovery.domain.workbook.configurations.WidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.analysis.Analysis;
import app.metatron.discovery.domain.workbook.configurations.chart.Chart;
import app.metatron.discovery.domain.workbook.configurations.chart.MapChart;
import app.metatron.discovery.domain.workbook.configurations.chart.NetworkChart;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.PivotShelf;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.Shelf;

/**
 * Created by kyungtaak on 2016. 5. 20..
 */
@JsonTypeName("page")
public class PageWidgetConfiguration extends WidgetConfiguration {

  /**
   * DataSource 정보
   */
  DataSource dataSource;

  /**
   * Page 내 정의 할 수 있는 Filter
   *
   */
  List<Filter> filters;

  /**
   * 선반내 필드 배치 정보
   *
   */
  Pivot pivot;

  Shelf shelf;

  /**
   * Custom 필드 정보
   *
   */
  List<UserDefinedField> fields;

  /**
   * Page 내 차트 설정 정보
   */
  Chart chart;

  /**
   * Fetch 최대 Row Count 지정 및 Sorting 관련 정보
   */
  Limit limit;

  /**
   * Embedded Analysis 관련 설정
   */
  Analysis analysis;

  /**
   * 차트내 공통 포맷 지정
   *
   */
  FieldFormat format;

  public PageWidgetConfiguration() {
    // Empty Constructor
  }

  @JsonCreator
  public PageWidgetConfiguration(@JsonProperty("dataSource") DataSource dataSource,
                                 @JsonProperty("filters") List<Filter> filters,
                                 @JsonProperty("pivot") Pivot pivot,
                                 @JsonProperty("shelf") Shelf shelf,
                                 @JsonProperty("fields") List<UserDefinedField> fields,
                                 @JsonProperty("chart") Chart chart,
                                 @JsonProperty("limit") Limit limit,
                                 @JsonProperty("analysis") Analysis analysis,
                                 @JsonProperty("format") FieldFormat format) {
    this.dataSource = dataSource;
    this.filters = filters;
    this.pivot = pivot;
    this.fields = fields;
    this.chart = chart;
    this.limit = limit;
    this.analysis = analysis;
    this.format = format;

    // 하위 호환을 위한 로직 추가
    if(shelf == null) {
      if(this.chart instanceof NetworkChart) {
        this.shelf = pivot.toGraghShelf();
      } else {
        this.shelf = pivot.toPivotShelf();
      }
    } else {
      this.shelf = shelf;
    }
  }

  public List<Filter> getFilters() {
    return filters;
  }

  public void setFilters(List<Filter> filters) {
    this.filters = filters;
  }

  public DataSource getDataSource() {
    return dataSource;
  }

  public void setDataSource(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  public Pivot getPivot() {
    // 하위호환을 위한 로직 추가
    if(pivot == null && !(chart instanceof MapChart)) {
      PivotShelf pivotShelf = (PivotShelf) shelf;
      return new Pivot(pivotShelf.getColumns(), pivotShelf.getRows(), pivotShelf.getAggregations());
    }
    return pivot;
  }

  public void setPivot(Pivot pivot) {
    this.pivot = pivot;
  }

  public Shelf getShelf() {
    return shelf;
  }

  public void setShelf(Shelf shelf) {
    this.shelf = shelf;
  }

  public List<UserDefinedField> getFields() {
    return fields;
  }

  public void setFields(List<UserDefinedField> fields) {
    this.fields = fields;
  }

  public Chart getChart() {
    return chart;
  }

  public void setChart(Chart chart) {
    this.chart = chart;
  }

  public Limit getLimit() {
    return limit;
  }

  public void setLimit(Limit limit) {
    this.limit = limit;
  }

  public Analysis getAnalysis() {
    return analysis;
  }

  public void setAnalysis(Analysis analysis) {
    this.analysis = analysis;
  }

  public FieldFormat getFormat() {
    return format;
  }

  public void setFormat(FieldFormat format) {
    this.format = format;
  }

  @Override
  public String toString() {
    return "PageWidgetConfiguration{" +
        "filters=" + filters +
        ", pivot=" + pivot +
        ", fields=" + fields +
        ", chart=" + chart +
        ", limit=" + limit +
        ", analysis=" + analysis +
        ", format=" + format +
        ", dataSource=" + dataSource +
        "} " + super.toString();
  }
}
