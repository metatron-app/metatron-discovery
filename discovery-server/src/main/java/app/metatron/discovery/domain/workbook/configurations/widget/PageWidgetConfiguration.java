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
 * Page widget specification
 */
@JsonTypeName("page")
public class PageWidgetConfiguration extends WidgetConfiguration {

  /**
   * DataSource using page widget
   */
  DataSource dataSource;

  /**
   * Filter in page
   *
   */
  List<Filter> filters;

  /**
   * Shelf for pivot, need to move shelf property
   *
   */
  Pivot pivot;

  /**
   * Shelf Info. ex. pivot/geo/graph
   */
  Shelf shelf;

  /**
   * User-Defined Field info. (Not used)
   *
   */
  List<UserDefinedField> fields;

  /**
   * Chart Specification
   */
  Chart chart;

  /**
   * Limit info. (Count limitation, Sort)
   */
  Limit limit;

  /**
   * Embedded Analysis Specification
   */
  Analysis analysis;

  /**
   * Common Format Specification (Not used)
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

    // For backward compatibility
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

  /*
   * Getter / Setter
   */

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
    // For backward compatibility
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
