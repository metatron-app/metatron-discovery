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

package app.metatron.discovery.domain.engine;

import com.google.common.collect.Lists;

import com.facebook.presto.jdbc.internal.guava.collect.Sets;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.IntervalFilter;

import static app.metatron.discovery.domain.workbook.configurations.field.MeasureField.AggregationType.NONE;

/**
 * Created by kyungtaak on 2016. 8. 25..
 */
public abstract class AbstractQueryService implements QueryService {

  protected void checkRequriedFilter(app.metatron.discovery.domain.datasource.DataSource mainDataSource,
                                     List<Filter> filters, List<Field> projections) {

    Map<String, app.metatron.discovery.domain.datasource.Field> metaFields = mainDataSource.getMetaFieldMap(false, "");
    Map<String, app.metatron.discovery.domain.datasource.Field> requiredFields = mainDataSource.getRequiredFilterFieldMap();
    Map<String, app.metatron.discovery.domain.datasource.Field> partitionedFields = mainDataSource.getPartitionedFieldMap();

    // 필수 필터가 지정되지 않았다면 Pass.
    if (requiredFields.size() == 0) {
      return;
    }

    Set<String> requiredKeys = requiredFields.keySet();
    Set<String> projectionKeys = projections.stream()
                                            .map(filter -> filter.getColunm())
                                            .collect(Collectors.toSet());

    // 조회하려는 대상이 필수 필터로 지정된 필드만 조회할 경우 예외 처리
    // ex. 엔진 내부에서 Candidate Query시 필수 필터 지정 화면 전 조회 경우 (추가 논의 필요)
    //    if(mainDataSource.getConnType() == DataSource.ConnectionType.ENGINE
    //        && requiredFields.size() >= projections.size()
    //        && !projectionKeys.isEmpty()
    //        && CollectionUtils.containsAll(requiredKeys, projectionKeys)) {
    //      return;
    //    }

    // 파티션이 존재하지 않은 데이터 소스 중 필수 필터와 관계없이 Timeboundary

    if (mainDataSource.getConnType() == DataSource.ConnectionType.ENGINE
        && projections.size() == 1
        && (projections.get(0) instanceof TimestampField
        || (metaFields.containsKey(projections.get(0).getColunm())))) {
      return;
    }

    // 파티션이 존재하지 않고 필수필터로만 지정된 경우, 필터지정된 필드를 조회하는 경우는 예외
    if (requiredFields.size() >= projections.size()
        && !projectionKeys.isEmpty()
        && CollectionUtils.containsAll(requiredKeys, projectionKeys)) {
      return;
    }

    // 필수 필터의 경우 InclusionFilter의 경우만 허용
    Set<String> filterKeys = filters.stream()
                                    .filter(filter ->
                                                (filter instanceof InclusionFilter || filter instanceof IntervalFilter)
                                                    && filter.getField() != null)
                                    .map(filter -> filter.getField())
                                    .collect(Collectors.toSet());

    // 필터내 필드가 Required 항목에 포함이 되어 있는지 여부
    if (!CollectionUtils.containsAll(filterKeys, requiredKeys)) {
      throw new IllegalArgumentException("Required Filter(" + StringUtils.join(requiredKeys, ",") + ") did not set.");
    }
  }

  /**
   * Search 요청 중 Select or GroupBy 처리인지 확인
   */
  protected boolean checkSelectQuery(List<Field> projections, List<UserDefinedField> userFields) {

    if (projections.isEmpty()) {
      return true;
    }

    // 사용자 정의 필드에서 참조한 값이 있는지 확인하는 용도
    Map<String, UserDefinedField> userFieldMap = userFields.stream()
                                                           .collect(Collectors.toMap(UserDefinedField::getName, f -> f));

    // check aggregation type
    for (app.metatron.discovery.domain.workbook.configurations.field.Field projection : projections) {
      if (!(projection instanceof MeasureField)) {
        continue;
      }

      MeasureField measureField = (MeasureField) projection;

      // GroupBy 조건 1. UserDefinedField 중 ExpressionField 이고 aggregate 되어있는 경우
      UserDefinedField userDefinedField = userFieldMap.get(measureField.getName());
      if (userDefinedField != null
          && userDefinedField instanceof ExpressionField && ((ExpressionField) userDefinedField).isAggregated()) {
        return false;
      }

      // GroupBy 조건 2. aggreationType 이 null 그리고 NONE 이 아닌경우
      if (measureField.getAggregationType() != null && measureField.getAggregationType() != NONE) {
        return false;
      }
    }

    return true;
  }

  /**
   * Target Field 가 partitioned 필드이고, filter내 partitined filter만 있는 경우 True
   */
  protected int getPartitionedIndex(DataSource dataSource, List<Filter> filters, Field targetField) {

    // 데이터 소스내 Partitioned Field 가 있는지 확인
    Map<String, app.metatron.discovery.domain.datasource.Field> metaPartitionedMap = dataSource.getPartitionedFieldMap();
    List<String> orderedFieldNames = Lists.newArrayList(metaPartitionedMap.keySet());
    if (metaPartitionedMap.isEmpty()) {
      return 0;
    }

    // Target 필드가 파티션된 필드여야 함
    if (!orderedFieldNames.contains(targetField.getColunm())) {
      return 0;
    }

    final int idx = orderedFieldNames.indexOf(targetField.getColunm());

    Set<Filter> removeFields = Sets.newHashSet();
    filters.forEach(filter -> {
      if (filter instanceof InclusionFilter
          && !targetField.getColunm().equals(filter.getColumn())
          && orderedFieldNames.indexOf(filter.getField()) < idx) {
        return;
      } else {
        removeFields.add(filter);
      }
    });

    removeFields.forEach(filter -> {
      filters.remove(filter);
    });

    return idx + 1;
  }
}
