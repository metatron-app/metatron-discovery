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

package app.metatron.discovery.domain;

import org.junit.Assert;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import java.io.IOException;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.DashBoard;

public class CollectionPatchTest {

  @Rule
  public ExpectedException exceptions = ExpectedException.none();

  @Test
  public void setOp_nomarl_case() {

    CollectionPatch addPatch = new CollectionPatch();
    addPatch.setOp("add");
    Assert.assertEquals(CollectionPatch.CollectionAction.ADD, addPatch.getOp());

    CollectionPatch replacePatch = new CollectionPatch();
    replacePatch.setOp("replace");
    Assert.assertEquals(CollectionPatch.CollectionAction.REPLACE, replacePatch.getOp());

    CollectionPatch removePatch = new CollectionPatch();
    removePatch.setOp("remove");
    Assert.assertEquals(CollectionPatch.CollectionAction.REMOVE, removePatch.getOp());

  }

  @Test
  public void setOp_invalid_case() {

    exceptions.expect(IllegalArgumentException.class);
    exceptions.expectMessage("Invalid operation type. choose 'add', 'replace' or 'remove'");

    CollectionPatch addPatch = new CollectionPatch();
    addPatch.setOp("test");

  }

  @Test
  public void deserialize() throws IOException {
    String jsonStr = "{\n" +
        "  \"op\": \"add\",\n" +
        "  \"key1\": \"value1\",\n" +
        "  \"key2\": \"value2\"\n" +
        "}";

    CollectionPatch addPatch = GlobalObjectMapper.getDefaultMapper().readValue(jsonStr, CollectionPatch.class);
    Assert.assertEquals(CollectionPatch.CollectionAction.ADD, addPatch.getOp());
    Assert.assertEquals(2, addPatch.getProperties().size());
    Assert.assertEquals(true, addPatch.getProperties().containsKey("key1"));
    Assert.assertEquals("value1", addPatch.getProperties().get("key1"));
  }


  @Test
  public void patchEntity() {
    CollectionPatch collectionPatch = new CollectionPatch();
    DashBoard dashBoard = new DashBoard();

    String dashBoardName = "test";
    Boolean hiding = true;
    Integer seq = 1;

    collectionPatch.add("name", dashBoardName);
    collectionPatch.add("hiding", hiding);
    collectionPatch.add("seq", seq);

    collectionPatch.patchEntity(dashBoard, "name", "hiding", "seq");

    Assert.assertEquals(dashBoardName, dashBoard.getName());
    Assert.assertEquals(hiding, dashBoard.getHiding());
    Assert.assertEquals(seq, dashBoard.getSeq());

  }
}
