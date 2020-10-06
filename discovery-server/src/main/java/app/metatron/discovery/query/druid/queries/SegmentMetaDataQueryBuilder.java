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

import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;
import com.google.common.collect.Lists;

import org.apache.commons.collections.CollectionUtils;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.IntervalFilter;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.meta.AnalysisType;
import app.metatron.discovery.query.druid.meta.ListToInclude;
import app.metatron.discovery.util.EnumUtils;

/**
 * Created by hsp on 2016. 12. 1..
 */
public class SegmentMetaDataQueryBuilder extends AbstractQueryBuilder {

  private List<String> columns = Lists.newArrayList();

  private List<AnalysisType> analysisTypes = Lists.newArrayList();

  private List<String> intervals = Lists.newArrayList();

  private boolean merge;

  public SegmentMetaDataQueryBuilder(DataSource dataSource) {
    //super(dataSource);
    // SegmentMetaquery MappingDataSource 를 지원하지 않아 DefaultDataSource 로 변환
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

  public SegmentMetaDataQueryBuilder initVirtualColumns(List<UserDefinedField> customFields) {

    setVirtualColumns(customFields);

    return this;
  }

  public SegmentMetaDataQueryBuilder fields(List<Field> reqFields) {

    for (Field field : reqFields) {
      if("user_defined".equals(field.getRef())) {
        columns.add(field.getColunm());
      } else {
        columns.add(field.getName());
      }
    }

    return this;
  }

  public SegmentMetaDataQueryBuilder types(List<AnalysisType> types) {

    analysisTypes = types;

    return this;
  }

  public SegmentMetaDataQueryBuilder types(String... types) {

    for (String reqType : types) {
      AnalysisType type = EnumUtils.getUpperCaseEnum(AnalysisType.class, reqType);
      if (type != null) {
        analysisTypes.add(type);
      }
    }

    return this;
  }

  public SegmentMetaDataQueryBuilder filters(List<Filter> reqfilters) {

    for (app.metatron.discovery.domain.workbook.configurations.filter.Filter reqFilter : reqfilters) {
      if (reqFilter instanceof IntervalFilter) {
        IntervalFilter intervalFilter = (IntervalFilter) reqFilter;

        if (metaFieldMap.containsKey(intervalFilter.getField())
            && metaFieldMap.get(intervalFilter.getField()).getRole() == app.metatron.discovery.domain.datasource.Field.FieldRole.TIMESTAMP) {
          intervals.addAll(intervalFilter.getEngineIntervals());
        }
      }
    }
    return this;
  }

  public SegmentMetaDataQueryBuilder merge(boolean merge) {
    this.merge = merge;

    return this;
  }

  @Override
  public SegmentMetaDataQuery build() {

    SegmentMetaDataQuery query = new SegmentMetaDataQuery();

    query.setDataSource(getDataSourceSpec(dataSource));

    if (CollectionUtils.isNotEmpty(columns)) {
      query.setToInclude(new ListToInclude(columns));
    }

    if (virtualColumns != null) {
      removeUserDefinedAggregationFunction();
      query.setVirtualColumns(Lists.newArrayList(virtualColumns.values()));
    }

    if (CollectionUtils.isNotEmpty(analysisTypes)) {
      query.setAnalysisTypes(analysisTypes);
    }

    if (CollectionUtils.isEmpty(intervals)) {
      query.setIntervals(DEFAULT_INTERVALS);
    } else {
      query.setIntervals(intervals);
    }

    query.setMerge(merge);

    return query;
  }
}


