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

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

import app.metatron.discovery.domain.datasource.data.CandidateQueryRequest;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.SearchQuerySpec;
import app.metatron.discovery.query.druid.dimensions.DefaultDimension;
import app.metatron.discovery.query.druid.dimensions.LookupDimension;
import app.metatron.discovery.query.druid.filters.AndFilter;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;
import app.metatron.discovery.query.druid.lookup.MapLookupExtractor;
import app.metatron.discovery.query.druid.searches.AllSearchQuerySpec;
import app.metatron.discovery.query.druid.searches.FragmentSearchQuerySpec;
import app.metatron.discovery.query.druid.searches.InsensitiveContainsSearchQuerySpec;
import app.metatron.discovery.query.druid.sorts.SearchHitSort;
import app.metatron.discovery.query.druid.virtualcolumns.IndexVirtualColumn;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;

import static app.metatron.discovery.domain.workbook.configurations.field.Field.FIELD_NAMESPACE_SEP;

/**
 *
 */
public class SearchQueryBuilder extends AbstractQueryBuilder {

  private final Logger LOGGER = LoggerFactory.getLogger(SearchQueryBuilder.class);

  private AndFilter filter = new AndFilter();

  private List<Dimension> dimensions = Lists.newArrayList();

  private SearchQuerySpec query;

  private Granularity granularity;

  private Integer limit = 1000;

  private List<String> intervals = Lists.newArrayList();

  private SearchHitSort sort;

  public SearchQueryBuilder(DataSource dataSource) {
    super(dataSource);
  }

  public SearchQueryBuilder initVirtualColumns(List<UserDefinedField> userFields) {

    setVirtualColumns(userFields);

    return this;
  }

  public SearchQueryBuilder fields(List<Field> reqFields) {

    Preconditions.checkArgument(CollectionUtils.isNotEmpty(reqFields), "Required fields.");

    for (Field field : reqFields) {

      String fieldName = checkColumnName(field.getColunm());
      String engineColumnName = engineColumnName(fieldName);

      if (!fieldName.equals(field.getColunm())) {
        field.setRef(StringUtils.substringBeforeLast(fieldName, FIELD_NAMESPACE_SEP));
      }

      String alias = field.getAlias();

      if (field instanceof DimensionField) {

        if (virtualColumns.containsKey(fieldName)) {          // from virtual column
          VirtualColumn virtualColumn = virtualColumns.get(fieldName);
          if (virtualColumn instanceof IndexVirtualColumn) {
            dimensions.add(new DefaultDimension(((IndexVirtualColumn) virtualColumn).getKeyDimension(), alias));
          } else {
            dimensions.add(new DefaultDimension(engineColumnName, alias));
          }
        } else if (metaFieldMap.containsKey(fieldName)) {     // from datasource
          // ValueAlias 처리
          if (MapUtils.isNotEmpty(field.getValuePair())) {
            dimensions.add(new LookupDimension(engineColumnName,
                                               alias,
                                               new MapLookupExtractor(field.getValuePair())));
          } else {
            dimensions.add(new DefaultDimension(engineColumnName, alias));
          }
        } else {
          LOGGER.debug("Unusable dimension : {}", fieldName);
        }
      }
    }

    return this;
  }

  public SearchQueryBuilder filters(List<app.metatron.discovery.domain.workbook.configurations.filter.Filter> reqFilters) {

    extractPartitions(reqFilters);

    setFilters(filter, reqFilters, intervals);

    return this;
  }


  public SearchQueryBuilder limit(Integer reqLimit) {
    if (reqLimit != null) {
      limit = reqLimit;
    }
    return this;
  }

  public SearchQueryBuilder sort(CandidateQueryRequest.SortCreteria sortCreteria) {
    sort = SearchHitSort.searchSort(sortCreteria);
    return this;
  }

  public SearchQueryBuilder query(String searchWord) {

    if (StringUtils.isEmpty(searchWord)) {
      query = new AllSearchQuerySpec();
      return this;
    }

    String[] splitedWords = StringUtils.split(searchWord, " ");
    if (splitedWords.length > 1) {
      query = new FragmentSearchQuerySpec(false, Lists.newArrayList(splitedWords));
    } else if (splitedWords.length == 1) {
      query = new InsensitiveContainsSearchQuerySpec(splitedWords[0]);
    } else {
      query = new AllSearchQuerySpec();
    }

    return this;
  }

  public SearchQuery build() {

    SearchQuery searchQuery = new SearchQuery();

    searchQuery.setDataSource(getDataSourceSpec(dataSource));
    searchQuery.setSearchDimensions(dimensions);

    if (filter != null && CollectionUtils.isEmpty(filter.getFields())) {
      searchQuery.setFilter(null);
    } else {
      searchQuery.setFilter(filter);
    }

    if (MapUtils.isNotEmpty(virtualColumns)) {
      searchQuery.setVirtualColumns(Lists.newArrayList(virtualColumns.values()));
    }

    searchQuery.setGranularity(new SimpleGranularity("all"));

    if (CollectionUtils.isEmpty(intervals)) {
      searchQuery.setIntervals(DEFAULT_INTERVALS);
    } else {
      searchQuery.setIntervals(intervals);
    }

    searchQuery.setQuery(query);

    if (sort != null) {
      searchQuery.setSort(sort);
    }

    searchQuery.setLimit(limit);

    if (StringUtils.isNotEmpty(queryId)) {
      addQueryId(queryId);
    }

    if (context != null) {
      searchQuery.setContext(context);
    }

    return searchQuery;

  }

}
