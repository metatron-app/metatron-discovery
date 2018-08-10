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

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Query;

/**
 * Created by kyungtaak on 2017. 5. 18..
 */
public class SummaryQueryBuilder extends AbstractQueryBuilder {

  List<String> dimensions = Lists.newArrayList();

  List<String> metrics = Lists.newArrayList();

  List<String> intervals;

  boolean includeTimeField;

  Map<String, Object> context;

  public SummaryQueryBuilder(DataSource dataSource) {
    super(dataSource);
  }

  public SummaryQueryBuilder initVirtualColumns(List<UserDefinedField> userDefinedFields) {

    setVirtualColumns(userDefinedFields);

    return this;
  }

  public SummaryQueryBuilder field(List<Field> reqFields) {

    if(CollectionUtils.isEmpty(reqFields)) {
      reqFields = getAllFieldsByMapping();
    }

    for (Field reqField : reqFields) {
      if(reqField instanceof MeasureField) {
        metrics.add(reqField.getColunm());
      } else if (reqField instanceof TimestampField) {
        includeTimeField = true;
      } else {
        dimensions.add(reqField.getColunm());
      }
    }

    return this;
  }

  @Override
  public Query build() {
    SummaryQuery summaryQuery = new SummaryQuery();

    // TODO: View Datasource 형태로 권장 하나, 테스트가 필요함
//    List<String> viewColunms = getAllFieldsByMapping().stream()
//                                .map(field -> field.getColunm())
//                                .collect(Collectors.toList());

//    DataSource dataSource = new ViewDataSource(mainMapping.getName(),
//        viewColunms,
//        virtualColumns == null ? null : Lists.newArrayList(virtualColumns.values()),
//        null);

    summaryQuery.setDataSource(getDataSourceSpec(dataSource));
    summaryQuery.setDimensions(dimensions);
    summaryQuery.setMetrics(metrics);

    if (CollectionUtils.isEmpty(intervals)) {
      summaryQuery.setIntervals(DEFAULT_INTERVALS);
    } else {
      summaryQuery.setIntervals(intervals);
    }

    if (StringUtils.isNotEmpty(queryId)) {
      addQueryId(queryId);
    }

    if(includeTimeField) {
      summaryQuery.setIncludeTimeStats(true);
    }

    if (context != null) {
      summaryQuery.setContext(context);
    }

    return summaryQuery;
  }
}
