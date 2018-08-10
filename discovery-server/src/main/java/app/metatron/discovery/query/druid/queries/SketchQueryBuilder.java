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

import com.google.common.collect.Lists;

import org.apache.commons.collections.CollectionUtils;

import java.util.List;

import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.datasource.DataSource;
import app.metatron.discovery.query.druid.datasource.UnionDataSource;

/**
 *
 */
public class SketchQueryBuilder extends AbstractQueryBuilder {

  private DataSource dataSource;

  private List<String> intervals = Lists.newArrayList();

  public SketchQueryBuilder() {
    super();
  }

  public SketchQueryBuilder unionDatasource(List<String> dataSources) {
    dataSource = UnionDataSource.of(dataSources);

    return this;
  }

  @Override
  public SketchQuery build() {

    SketchQuery sketchQuery = new SketchQuery();

    sketchQuery.setDataSource(dataSource);

    if (CollectionUtils.isEmpty(intervals)) {
      sketchQuery.setIntervals(DEFAULT_INTERVALS);
    } else {
      sketchQuery.setIntervals(intervals);
    }

    return sketchQuery;
  }

}
