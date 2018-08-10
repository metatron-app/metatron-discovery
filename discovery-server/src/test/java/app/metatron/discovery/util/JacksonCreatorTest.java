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

package app.metatron.discovery.util;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

/**
 * Created by kyungtaak on 2016. 8. 27..
 */
public class JacksonCreatorTest {

  public static void main(String[] args)  throws Exception {

    ObjectMapper objectMapper = new  ObjectMapper();
    ObjectNode node = (ObjectNode)  objectMapper.readTree("{\"string\":\"hello  world\"}");

    long start1 = System.nanoTime();
    for (int i = 0; i < 10000; i++) {
      Wrapper wrapper = new  Wrapper(node);
      wrapper.getString();
    }
    long time1 = System.nanoTime() -  start1;

    long start2 = System.nanoTime();
    for (int i = 0; i < 10000; i++) {
      Wrapper wrapper = new  Wrapper(node);
      wrapper.getMyString();
    }
    long time2 = System.nanoTime() -  start2;

    System.out.println("Overhead:  " + time2 / (double) time1);
  }

  public static class Wrapper {

    private /*static*/ final ObjectMapper  objectMapper = new ObjectMapper();

    private final ObjectNode node;

    private Wrapper(ObjectNode node) {
      this.node = node;
    }

    public String getString() throws JsonProcessingException {
      return  objectMapper.treeToValue(node.get("string"), String.class);
    }

    public MyString getMyString() throws  JsonProcessingException {
      return  objectMapper.treeToValue(node.get("string"), MyString.class);
    }
  }

  public static class MyString {

    private final String string;

    @JsonCreator
    public MyString(String string) {
      this.string = string;
    }
  }
}
