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

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.domain.workbook.configurations.WidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;

/**
 * Created by kyungtaak on 2016. 5. 20..
 */
@JsonTypeName("filter")
public class FilterWidgetConfiguration extends WidgetConfiguration {

  /**
   * DataSource 정보
   */
  DataSource dataSource;

  Filter filter;

  public FilterWidgetConfiguration() {
    // Empty Constructor
  }

  public FilterWidgetConfiguration(Filter filter) {
    this.filter = filter;
  }

  public DataSource getDataSource() {
    return dataSource;
  }

  public void setDataSource(DataSource dataSource) {
    this.dataSource = dataSource;
  }

  public Filter getFilter() {
    return filter;
  }

  public void setFilter(Filter filter) {
    this.filter = filter;
  }

  @Override
  public String toString() {
    return "FilterWidgetConfiguration{" +
        "filter=" + filter +
        "} " + super.toString();
  }
}
