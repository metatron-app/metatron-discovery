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

package app.metatron.discovery.domain.datasource.data;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.DataSourceTemporary;
import app.metatron.discovery.domain.datasource.DataSourceTemporaryRepository;
import app.metatron.discovery.domain.datasource.data.alias.ValueRefAlias;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.JoinMapping;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MultiDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;

/**
 * Created by kyungtaak on 2016. 8. 29..
 */
@Component
public class DataSourceValidator {

  private static final Logger LOGGER = LoggerFactory.getLogger(DataSourceValidator.class);

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  AliasFactory aliasFactory;

  @Autowired
  DataSourceTemporaryRepository temporaryRepository;

  public DataSourceValidator() {
  }

  public void validateQuery(QueryRequest queryRequest) {

    if (queryRequest.getAliases() == null & StringUtils.isNotEmpty(queryRequest.getValueAliasRef())) {
      queryRequest.addAlias(new ValueRefAlias(queryRequest.getValueAliasRef()));
    }

    if (CollectionUtils.isNotEmpty(queryRequest.getAliases())) {

      Map<String, Map<String, String>> aliasMap = aliasFactory.getAliasMap(queryRequest.getAliases());
      if (MapUtils.isNotEmpty(aliasMap)) {
        if (queryRequest instanceof SearchQueryRequest) {
          List<Field> fields = ((SearchQueryRequest) queryRequest).getProjections();
          for (Field field : fields) {
            if (aliasMap.containsKey(field.getName())) {
              field.setValuePair(aliasMap.get(field.getName()));
            }
          }

          List<Filter> filters = ((SearchQueryRequest) queryRequest).getFilters();
          for (Filter filter : filters) {
            if (filter instanceof InclusionFilter
                && aliasMap.containsKey(filter.getField())) {
              ((InclusionFilter) filter).setValuePair(aliasMap.get(filter.getField()));
            }
          }
        } else if (queryRequest instanceof CandidateQueryRequest) {
          Field field = ((CandidateQueryRequest) queryRequest).getTargetField();
          if (aliasMap.containsKey(field.getName())) {
            field.setValuePair(aliasMap.get(field.getName()));
          }

          List<Filter> filters = ((CandidateQueryRequest) queryRequest).getFilters();
          for (Filter filter : filters) {
            if (filter instanceof InclusionFilter
                && aliasMap.containsKey(filter.getField())) {
              ((InclusionFilter) filter).setValuePair(aliasMap.get(filter.getField()));
            }
          }
        }
      }
    }

    validateQuery(queryRequest.getDataSource(), queryRequest);

  }

  public void validateQuery(DataSource dataSource) {
    validateQuery(dataSource, null);
  }

  public void validateQuery(DataSource dataSource, QueryRequest queryRequest) {

    if(dataSource instanceof MultiDataSource) {
      MultiDataSource multiDataSource = (MultiDataSource) dataSource;
      for (DataSource source : multiDataSource.getDataSources()) {
        validateQuery(source, queryRequest);
      }

      multiDataSource.electMainDataSource(queryRequest);

      return;
    }

    app.metatron.discovery.domain.datasource.DataSource metaDataSource = null;

    if (BooleanUtils.isTrue(dataSource.getTemporary())) {
      DataSourceTemporary temporaryDataSource = temporaryRepository.findByName(dataSource.getName());
      if (temporaryDataSource == null) {
        LOGGER.error("Temporary DataSource({}) not found.", dataSource.getName());
        throw new IllegalArgumentException("Temporary DataSource( " + dataSource.getName() + ") not found.");
      }
      metaDataSource = dataSourceRepository.findByIdIncludeConnection(temporaryDataSource.getDataSourceId());
    } else {
      metaDataSource = dataSourceRepository.findByEngineName(dataSource.getName());
    }

    if (metaDataSource == null) {
      LOGGER.error("DataSource({}) not found.", dataSource.getName());
      throw new IllegalArgumentException("DataSource(" + dataSource.getName() + ") not found.");
    } else {
      dataSource.setMetaDataSource(metaDataSource);
    }

    if (dataSource instanceof DefaultDataSource) {
      return;
    }

    MappingDataSource mappingDataSource = (MappingDataSource) dataSource;
    mappingDataSource.getJoins().forEach(joinMapping -> visitJoinMapping(joinMapping));

  }

  private void visitJoinMapping(JoinMapping joinMapping) {
    if (joinMapping == null) {
      return;
    }

    app.metatron.discovery.domain.datasource.DataSource metaDataSource =
        dataSourceRepository.findByEngineName(joinMapping.getName());

    if (metaDataSource == null) {
      LOGGER.error("DataSource({}) not found.", joinMapping.getName());
      throw new IllegalArgumentException("DataSource( " + joinMapping.getName() + ") not found.");
    } else {
      joinMapping.setMetaDataSource(metaDataSource);
    }

    visitJoinMapping(joinMapping.getJoin());

  }


}
