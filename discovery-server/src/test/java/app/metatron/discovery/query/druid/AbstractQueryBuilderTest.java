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

package app.metatron.discovery.query.druid;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.junit.Test;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;

/**
 * Created by kyungtaak on 2016. 7. 13..
 */
public class AbstractQueryBuilderTest {

  @Test
  public void joiner() {
    Map<String, List<String>> partitions = Maps.newLinkedHashMap();
    partitions.put("A", Lists.newArrayList("1", "2"));
    partitions.put("B", Lists.newArrayList("a", "b", "c"));

    TestQueryBuiler builder = new TestQueryBuiler(null);

    System.out.println(builder.targetPartitionPostfixs);
  }

  public class TestQueryBuiler extends AbstractQueryBuilder {

    protected TestQueryBuiler(DataSource dataSource) {
      super(dataSource);
    }

    @Override
    public Query build() {
      return null;
    }


  }
}
