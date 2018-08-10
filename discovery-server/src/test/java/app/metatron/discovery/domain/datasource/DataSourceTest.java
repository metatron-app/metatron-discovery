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

package app.metatron.discovery.domain.datasource;

import com.google.common.collect.Sets;

import com.facebook.presto.jdbc.internal.guava.collect.Maps;

import org.junit.Test;

import java.util.LinkedHashMap;
import java.util.Set;

/**
 * Created by kyungtaak on 2016. 10. 20..
 */
public class DataSourceTest {
  @Test
  public void getRegexDataSourceName() throws Exception {

    DataSource dataSource = new DataSource();
    dataSource.setName("fdc_summary");
    dataSource.setPartitionKeys("fab,eqp_id");
    dataSource.setPartitionSeparator("_");

    // 2개 모두 비어있는 경우
    LinkedHashMap<String, Set<String>> model1 = Maps.newLinkedHashMap();
    model1.put("fab", Sets.newHashSet());
    model1.put("eqp_id", Sets.newHashSet());
    System.out.println(dataSource.getRegexDataSourceName(model1));

    // 첫번째 값이 비어있는 경우
    LinkedHashMap<String, Set<String>> model2 = Maps.newLinkedHashMap();
    model2.put("fab", Sets.newHashSet());
    model2.put("eqp_id", Sets.newHashSet("CMP102"));
    System.out.println(dataSource.getRegexDataSourceName(model2));

    // 마지막 값이 비어있는 경우
    LinkedHashMap<String, Set<String>> model3 = Maps.newLinkedHashMap();
    model3.put("fab", Sets.newHashSet("M10"));
    model3.put("eqp_id", Sets.newHashSet());
    System.out.println(dataSource.getRegexDataSourceName(model3));
  }

}
