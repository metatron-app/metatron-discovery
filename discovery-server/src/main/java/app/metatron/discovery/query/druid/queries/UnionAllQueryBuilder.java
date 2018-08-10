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

import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.query.druid.AbstractQueryBuilder;
import app.metatron.discovery.query.druid.Query;

/**
 *
 */
public class UnionAllQueryBuilder extends AbstractQueryBuilder {

  private Query query;

  private Map<String, Object> context = Maps.newHashMap();

  public UnionAllQueryBuilder() {
  }

  public UnionAllQueryBuilder similarityQuery(List<String> dataSourceNames) {

    this.query = SketchQuery.builder()
                            .unionDatasource(dataSourceNames)
                            .build();

    Map<String, Object> simTypeMap = Maps.newHashMap();
    simTypeMap.put("type", "similarity");

    this.context.put("allColumnsForEmpty", true);
    this.context.put("postProcessing", simTypeMap);

    return this;
  }

  @Override
  public UnionAllQuery build() {

    UnionAllQuery unionAllQuery = new UnionAllQuery();
    unionAllQuery.setQuery(query);

    if(StringUtils.isNotEmpty(queryId)) {
      context.put("queryId", queryId);
    }

    unionAllQuery.setContext(context);

    return unionAllQuery;
  }

}
