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

package app.metatron.discovery.domain.mdm.lineage;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;
import java.util.List;
import java.util.Map;
import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class LineageEdgeRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  private String createMetadata(String name, String type, String sourceName,
      String sourceId) {
    Map<String, Object> reqMedataMap = Maps.newHashMap();
    reqMedataMap.put("name", name);

    Map<String, Object> engineSourceMap = Maps.newHashMap();
    engineSourceMap.put("type", type);
    engineSourceMap.put("name", sourceName);
    engineSourceMap.put("sourceId", sourceId);

    reqMedataMap.put("sourceType", type);
    reqMedataMap.put("source", engineSourceMap);

    // @formatter:off
    Response createRes =
        given()
            .auth().oauth2(oauth_token)
            .body(reqMedataMap)
            .contentType(ContentType.JSON)
            .log().all()
            .when()
            .post("/api/metadatas");

    createRes.then()
        .statusCode(HttpStatus.SC_CREATED)
        .log().all();
    // @formatter:on

    return from(createRes.asString()).get("id");
  }

  private Map<String, Object> readMetadata(String id) {
    // @formatter:off
    Response readResponse = given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .param("projection", "forListView")
        .when()
        .get("/api/metadatas/{id}", id);

    readResponse.then()
        .statusCode(HttpStatus.SC_OK)
        .log().all();
    // @formatter:on

    return readResponse.jsonPath().getMap("");
  }

  private void createLineageEdge(String desc, String upstreamId, String downstreamId) {
    Map<String, Object> request = Maps.newHashMap();
    request.put("desc", desc);
    request.put("upstreamId", upstreamId);
    request.put("downstreamId", downstreamId);

    // @formatter:off
    Response createRes =
        given()
            .auth().oauth2(oauth_token)
            .body(request)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .log().all()
            .when()
            .post("/api/metadatas/lineage/edge");

    createRes.then()
        .statusCode(HttpStatus.SC_CREATED)
        .log().all();
    // @formatter:on
  }

  private List<Map<String, String>> listLineageEdge() {
    // @formatter:off
    Response readResponse = given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .when()
        .get("/api/metadatas/lineage/edge");

    readResponse.then()
        .statusCode(HttpStatus.SC_OK)
        .log().all();
    // @formatter:on

    return readResponse.jsonPath().getList("");

  }

  private Map<String, Object> getLineageMap(String metaId) {
    // @formatter:off
    Response readResponse = given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .when()
        .get("/api/metadatas/lineage/map/" + metaId);

    readResponse.then()
        .statusCode(HttpStatus.SC_OK)
        .log().all();
    // @formatter:on

    return readResponse.jsonPath().getMap("");
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void totalLineageTest() {
    TestUtils.printTestTitle("1. Create metadatas");

    // Used "ENGINE" just because of the absence of corresponding entities for JDBC or STAGEDB
    String metaId1 = createMetadata("meta1", "ENGINE", "ds_mdm_01", "ds_mdm_01_id");
    String metaId2 = createMetadata("meta2", "ENGINE", "ds_mdm_02", "ds_mdm_02_id");
    String metaId3 = createMetadata("meta3", "ENGINE", "ds_mdm_03", "ds_mdm_03_id");

    Map<String, Object> map1 = readMetadata(metaId1);
    Map<String, Object> map2 = readMetadata(metaId2);
    Map<String, Object> map3 = readMetadata(metaId3);

    assert metaId1.equals(map1.get("id"));
    assert metaId2.equals(map2.get("id"));
    assert metaId3.equals(map3.get("id"));

    TestUtils.printTestTitle("2. Create lineage edges");

    createLineageEdge("CREATE TABLE AS SELECT * FROM mdm_test_jdbc", metaId1, metaId2);
    createLineageEdge("Druid ingestion with Hive Table", metaId2, metaId3);

    TestUtils.printTestTitle("3. list lineage edges");

    List<Map<String, String>> edges = listLineageEdge();
    System.out.print(edges);

    TestUtils.printTestTitle("4. Get lineage map");

    Map<String, Object> lineageMap = getLineageMap(metaId2);
    System.out.print(lineageMap);
  }
}

