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

package app.metatron.discovery.common;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.BeanDescription;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationConfig;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ser.BeanSerializerModifier;
import com.fasterxml.jackson.databind.ser.std.MapSerializer;
import com.fasterxml.jackson.databind.type.MapType;

import org.junit.Test;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.workbench.QueryResult;

import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

/**
 *
 */
public class ObjectMapperTest {

  @Test
  public void mapInListWithNullTest() throws IOException {

    List<Map<String, Object>> mapList = new ArrayList<>();
    Map map1 = new HashMap();
    map1.put("a", 1);
    map1.put("b", 2);
    mapList.add(map1);

    Map map2 = new HashMap();
    map2.put("a", null);
    map2.put("b", 2);
    mapList.add(map2);

    Map map3 = new HashMap();
    map3.put("a", null);
    map3.put("b", null);
    mapList.add(map3);

    QueryResult queryResult = new QueryResult();
    queryResult.setData(mapList);
    queryResult.setAuditId("123");

    String json2 = om().writeValueAsString(queryResult);
    System.out.println(json2);

    ObjectNode on = om().readValue(json2, ObjectNode.class);

    assertTrue(on.has("auditId"));
    assertTrue(!on.get("auditId").isNull());
    assertTrue(!on.has("message"));

    ArrayNode dataListNode = (ArrayNode) on.get("data");

    ObjectNode mapNode1 = (ObjectNode) dataListNode.get(0);
    assertTrue(mapNode1.has("a"));
    assertTrue(!mapNode1.get("a").isNull());
    assertTrue(mapNode1.has("b"));
    assertTrue(!mapNode1.get("b").isNull());

    ObjectNode mapNode2 = (ObjectNode) dataListNode.get(1);
    assertTrue(mapNode2.has("a"));
    assertTrue(mapNode2.get("a").isNull());
    assertTrue(mapNode2.has("b"));
    assertTrue(!mapNode2.get("b").isNull());

    ObjectNode mapNode3 = (ObjectNode) dataListNode.get(2);
    assertTrue(mapNode3.has("a"));
    assertTrue(mapNode3.get("a").isNull());
    assertTrue(mapNode3.has("b"));
    assertTrue(mapNode3.get("b").isNull());
  }

  ObjectMapper om() {
    ObjectMapper om = new ObjectMapper();
    om.setSerializationInclusion(JsonInclude.Include.NON_NULL);
    return om;
  }

  private Module getMapWithNullValuesModule() {
    SimpleModule mapWithNullValueModule = new SimpleModule("MapWithNullValues");
    mapWithNullValueModule.setSerializerModifier(new BeanSerializerModifier() {
      @Override
      public JsonSerializer<?> modifyMapSerializer(SerializationConfig config, MapType valueType,
                                                   BeanDescription beanDesc, JsonSerializer<?> serializer) {
        System.out.println(serializer + " not an instance of " + MapSerializer.class.getName());
        if (serializer instanceof MapSerializer) {
          MapSerializer mapSerializer = (MapSerializer) serializer;
          return mapSerializer.withContentInclusion(null, false);
        } else {
          System.out.println(serializer + " not an instance of " + MapSerializer.class.getName());
          return serializer;
        }
      }
    });
    return mapWithNullValueModule;
  }
}
