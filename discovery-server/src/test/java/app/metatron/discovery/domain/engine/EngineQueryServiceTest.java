/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.engine;

import org.assertj.core.util.Lists;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.datasource.Field;

public class EngineQueryServiceTest extends AbstractIntegrationTest {

  @Autowired
  EngineQueryService engineQueryService;

  @Test
  public void geoBoundary() {
    Field field1 = new Field();
    field1.setName("gis");
    field1.setLogicalType(LogicalType.GEO_POINT);
    System.out.println(engineQueryService.geoBoundary("estate", Lists.newArrayList(field1)));

    Field field2 = new Field();
    field2.setName("geom");
    field2.setLogicalType(LogicalType.GEO_LINE);
    System.out.println(engineQueryService.geoBoundary("seoul_roads", Lists.newArrayList(field2)));
  }
}