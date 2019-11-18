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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.notebook;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;

import org.junit.Assert;
import org.junit.Test;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.notebook.connector.RBuilder;

public class NotebookServiceTest {

  @Test
  public void RBuilderCreateCellsTest() {

    Notebook notebook = new Notebook();
    notebook.setDsId("ds-01");
    notebook.setDsType(Notebook.DSType.DATASOURCE);
    notebook.setCurrentUrl("http://localhost:8180");

    RBuilder rBuilder = new RBuilder();
    JsonNode result = (JsonNode) rBuilder.createCells(notebook);

    System.out.println(result);

    // Check that cells are defined
    Assert.assertTrue(result.has("cells"));

    // Check the main phase is set
    ArrayNode jsonNode = (ArrayNode) result.get("cells");
    boolean isSetNormalPhase = false;
    for (int i = 0; i < jsonNode.size(); i++) {
      isSetNormalPhase = jsonNode.get(i).get("source").toString()
          .equals("\"dataset <- datasources.get(client.url('localhost',8180), 'ds-01')\"");

      if (isSetNormalPhase) {
        break;
      }
    }
    Assert.assertTrue(isSetNormalPhase);

  }

}
