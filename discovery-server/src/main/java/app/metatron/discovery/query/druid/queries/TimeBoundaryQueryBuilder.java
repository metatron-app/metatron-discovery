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

package app.metatron.discovery.query.druid.queries;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Query;

/**
 * Created by kyungtaak on 2016. 10. 24..
 */
public class TimeBoundaryQueryBuilder extends AbstractQueryBuilder {

  public TimeBoundaryQueryBuilder(DataSource dataSource) {

    // Timeboundary Query는 MappingDataSource 를 지원하지 않아 DefaultDataSource 로 변환
    if(dataSource instanceof MappingDataSource) {
      this.dataSource = new DefaultDataSource(dataSource.getName());
      this.dataSource.setMetaDataSource(dataSource.getMetaDataSource());
    } else {
      this.dataSource = dataSource;
    }

    // Segmentmeta Query 의 경우 별로 datasource 메타정보가 필요없는 경우가 존재함
    if (dataSource.getMetaDataSource() != null) {
      super.mainMetaDataSource = dataSource.getMetaDataSource();
      super.metaFieldMap.putAll(mainMetaDataSource.getMetaFieldMap(false, ""));
    }

  }

  public TimeBoundaryQueryBuilder filters(List<Filter> reqfilters) {
    extractPartitions(reqfilters);
    return this;
  }

  @Override
  public Query build() {
    TimeBoundaryQuery query = new TimeBoundaryQuery();
    query.setDataSource(getDataSourceSpec(dataSource));

    return query;
  }
}
