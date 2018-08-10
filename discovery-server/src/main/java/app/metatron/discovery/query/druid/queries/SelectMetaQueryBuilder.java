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
import com.google.common.collect.Sets;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Set;

import app.metatron.discovery.domain.datasource.data.forward.ResultForward;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.dimensions.DefaultDimension;
import app.metatron.discovery.query.druid.filters.AndFilter;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;

import static app.metatron.discovery.domain.workbook.configurations.field.Field.FIELD_NAMESPACE_SEP;

/**
 * Created by kyungtaak on 2016. 7. 2..
 */
public class SelectMetaQueryBuilder extends AbstractQueryBuilder {

  private AndFilter filter = new AndFilter();

  private List<Dimension> dimensions = Lists.newArrayList();

  private Set<String> metrics = Sets.newLinkedHashSet();

  private Granularity granularity;

  private PagingSpec pagingSpec = new PagingSpec(100);

  private List<String> intervals = Lists.newArrayList();

  private boolean schemaOnly;

  public SelectMetaQueryBuilder(DataSource dataSource) {
    super(dataSource);
  }

  public SelectMetaQueryBuilder initVirtualColumns(List<UserDefinedField> userFields) {

    setVirtualColumns(userFields);

    return this;
  }

  public SelectMetaQueryBuilder fields(List<Field> reqFields) {

    // 별도 forward context 추가시 Projection 항목 지정 위함
    projections = reqFields;

    // 필드정보가 없을 경우 모든 필드를 대상으로 지정하는 것을 가정
    if (CollectionUtils.isEmpty(reqFields)) {
      reqFields = Lists.newArrayList();
      reqFields.addAll(getAllFieldsByMapping());
    }

    for (Field reqField : reqFields) {

      String fieldName = checkColumnName(reqField.getColunm());
      if(!fieldName.equals(reqField.getColunm())) {
        reqField.setRef(StringUtils.substringBeforeLast(fieldName, FIELD_NAMESPACE_SEP));
      }

      String aliasName = reqField.getAlias();

      if (reqField instanceof DimensionField || reqField instanceof TimestampField) {
          dimensions.add(new DefaultDimension(fieldName, aliasName));
      } else if (reqField instanceof MeasureField) {
        if (StringUtils.isEmpty(reqField.getRef())) {
          metrics.add(fieldName);
        } else {
          dimensions.add(new DefaultDimension(fieldName, aliasName));
        }
      } else if (reqField instanceof TimestampField) {
        throw new IllegalArgumentException("Not supported timestamp field role.");
      }
    }

    return this;
  }

  public SelectMetaQueryBuilder filters(List<app.metatron.discovery.domain.workbook.configurations.filter.Filter> reqFilters) {

    extractPartitions(reqFilters);

    setFilters(filter, reqFilters, intervals);

    return this;
  }

  public SelectMetaQueryBuilder schemaOnly(boolean schemaOnly) {

    this.schemaOnly = schemaOnly;

    return this;
  }

  public SelectMetaQueryBuilder limit(Limit reqLimit) {

    if (reqLimit != null) {
      pagingSpec.setThreshold(reqLimit.getLimit());
    } else {
      pagingSpec.setThreshold(100);
    }

    return this;
  }

  public SelectMetaQueryBuilder forward(ResultForward resultForward) {

    setForwardContext(resultForward);

    return this;
  }

  @Override
  public SelectMetaQuery build() {

    SelectMetaQuery selectMetaQuery = new SelectMetaQuery();

    selectMetaQuery.setDataSource(getDataSourceSpec(dataSource));
    selectMetaQuery.setDimensions(dimensions);

    // 빈 값을 넣을시 전체 metric 값 출력을 방지 위함
    if(metrics.isEmpty()) {
      metrics.add("__DUMMY");
    }
    selectMetaQuery.setMetrics(metrics);

    if (filter == null || CollectionUtils.isEmpty(filter.getFields())) {
      selectMetaQuery.setFilter(null);
    } else {
      selectMetaQuery.setFilter(filter);
    }

    if (virtualColumns != null) {
      selectMetaQuery.setVirtualColumns(Lists.newArrayList(virtualColumns.values()));
    }

    selectMetaQuery.setGranularity(new SimpleGranularity("all"));

    selectMetaQuery.setSchemaOnly(schemaOnly);

    if (CollectionUtils.isEmpty(intervals)) {
      selectMetaQuery.setIntervals(DEFAULT_INTERVALS);
    } else {
      selectMetaQuery.setIntervals(intervals);
    }

    selectMetaQuery.setPagingSpec(pagingSpec);

    if(StringUtils.isNotEmpty(queryId)) {
      addQueryId(queryId);
    }

    if(context != null) {
      selectMetaQuery.setContext(context);
    }

    return selectMetaQuery;

  }

}
