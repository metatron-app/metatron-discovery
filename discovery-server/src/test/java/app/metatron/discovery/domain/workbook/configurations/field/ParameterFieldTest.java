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

package app.metatron.discovery.domain.workbook.configurations.field;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.junit.Test;

import java.io.IOException;
import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;

public class ParameterFieldTest {

  @Test
  public void serialize() throws IOException {
    Map<String,Object> req = Maps.newHashMap();
    req.put("type", "parameter");
    req.put("name", "test parameter");
    req.put("defaultValue", 1);
    req.put("values", Lists.newArrayList(1, 3));

    String reqJson = GlobalObjectMapper.writeValueAsString(req);

    System.out.println(reqJson);

    System.out.println(GlobalObjectMapper.getDefaultMapper().readValue(reqJson, ParameterField.class));
  }
}
