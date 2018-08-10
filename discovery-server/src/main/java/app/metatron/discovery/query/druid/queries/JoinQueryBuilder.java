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
import com.google.common.collect.Maps;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.JoinMapping;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.datasource.QueryDataSource;
import app.metatron.discovery.query.druid.datasource.TableDataSource;

import static app.metatron.discovery.domain.workbook.configurations.field.Field.FIELD_NAMESPACE_SEP;
import static java.util.stream.Collectors.toList;

public class JoinQueryBuilder extends AbstractQueryBuilder {

  Map<String, app.metatron.discovery.query.druid.datasource.DataSource> joinDataSources = Maps.newLinkedHashMap();

  List<JoinElement> elements = Lists.newArrayList();

  Boolean prefixAlias = true;

  Integer limit = 100000;

  private List<String> intervals = Lists.newArrayList(JoinQueryBuilder.DEFAULT_INTERVALS);

  public JoinQueryBuilder(DataSource dataSource) {
    Preconditions.checkArgument(dataSource instanceof MappingDataSource, "MappingDataSource required.");

    this.dataSource = dataSource;

    joinDataSources.put(dataSource.getName(), new TableDataSource(dataSource.getName()));
    ((MappingDataSource) dataSource).getJoins()
              .forEach(joinMapping -> visitJoinMapping(dataSource.getName(), joinMapping));
  }

  private void visitJoinMapping(String leftAlias, JoinMapping joinMapping) {

    if(joinMapping.getJoin() == null) {
      // join 대상 데이터 소스를 선언하고, join mapping 을 수행
      joinDataSources.put(joinMapping.getName(), new TableDataSource(joinMapping.getName()));
      elements.add(new JoinElement(
          JoinElement.JoinType.valueOf(joinMapping.getType().name()),
          leftAlias,
          Lists.newArrayList(joinMapping.getKeyPair().keySet()),
          joinMapping.getName(),
          Lists.newArrayList(joinMapping.getKeyPair().values())
      ));
    } else {

      JoinMapping childJoiner = joinMapping.getJoin();

      MappingDataSource joinDataSource = new MappingDataSource();
      joinDataSource.setName(joinMapping.getName());
      joinDataSource.setMetaDataSource(joinMapping.getMetaDataSource());
      joinDataSource.setJoins(Lists.newArrayList(childJoiner));


      joinDataSources.put(joinMapping.getJoinAlias(), new QueryDataSource(JoinQuery.builder(joinDataSource).build()));

      // 하위 QueryDataSource 의 네이밍에 맞춰 prefix 로 구성
      List<String> rightColumns = childJoiner.getKeyPair().values().stream()
                 .map(value -> joinMapping.getName() + FIELD_NAMESPACE_SEP + value)
                 .collect(toList());

      elements.add(new JoinElement(
          JoinElement.JoinType.valueOf(joinMapping.getType().name()),
          leftAlias,
          Lists.newArrayList(joinMapping.getKeyPair().keySet()),
          joinMapping.getJoinAlias(),
          rightColumns
      ));
    }

  }

  public JoinQueryBuilder prefixAlias(boolean prefixAlias) {
    this.prefixAlias(prefixAlias);

    return this;
  }

  public JoinQueryBuilder limit(int limit) {
    this.limit = limit;
    return this;
  }

  public JoinQueryBuilder limit(Limit limit) {
    if(limit != null) {
      this.limit = limit.getLimit();
    }
    return this;
  }

  public JoinQueryBuilder intervals(List<String> intervals) {
    this.intervals = intervals;
    return this;
  }

  @Override
  public JoinQuery build() {
    JoinQuery joinQuery = new JoinQuery();

    joinQuery.setDataSources(joinDataSources);
    joinQuery.setElements(elements);
    joinQuery.setPrefixAlias(prefixAlias);
    joinQuery.setNumPartition(1);
    joinQuery.setLimit(limit);
    joinQuery.setIntervals(intervals);

    return joinQuery;
  }
}
