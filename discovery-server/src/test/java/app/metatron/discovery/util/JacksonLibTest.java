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

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;

import org.junit.Test;

import java.io.File;
import java.io.IOException;

/**
 * Created by kyungtaak on 2016. 8. 22..
 */
public class JacksonLibTest {

  @Test
  public void steaming() throws IOException {

    JsonFactory jfactory = new JsonFactory();

    /*** read from file ***/
    JsonParser jParser = jfactory.createParser(new File("src/test/resources/document_2.json"));

    // loop until token equal to "}"
    while (jParser.nextToken() != JsonToken.END_OBJECT) {

      String fieldname = jParser.getCurrentName();
      if ("name".equals(fieldname)) {

        // current token is "name",
        // move to next, which is "name"'s value
        jParser.nextToken();
        System.out.println(jParser.getText()); // display mkyong

      }

      if ("age".equals(fieldname)) {

        // current token is "age",
        // move to next, which is "name"'s value
        jParser.nextToken();
        System.out.println(jParser.getIntValue()); // display 29

      }

      if ("messages".equals(fieldname)) {

        jParser.nextToken(); // current token is "[", move next

        // messages is array, loop until token equal to "]"
        while (jParser.nextToken() != JsonToken.END_ARRAY) {

          // display msg1, msg2, msg3
          System.out.println(jParser.getText());

        }

      }

    }
    jParser.close();
  }
}
