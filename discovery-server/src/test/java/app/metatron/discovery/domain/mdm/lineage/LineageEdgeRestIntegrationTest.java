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
import app.metatron.discovery.domain.dataprep.entity.PrDataset.DS_TYPE;
import app.metatron.discovery.domain.dataprep.rest.PrDatasetRestIntegrationTest;
import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;
import java.util.HashMap;
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
        .get("/api/metadatas/" + id);

    readResponse.then()
        .statusCode(HttpStatus.SC_OK)
        .log().all();
    // @formatter:on

    return readResponse.jsonPath().getMap("");
  }

  private void createLineageEdge(String upstreamMetaId, String downstreamMetaId, String description) {
    Map<String, Object> request = Maps.newHashMap();
    request.put("upstreamMetaId", upstreamMetaId);
    request.put("downstreamMetaId", downstreamMetaId);
    request.put("description", description);

    // @formatter:off
    Response createRes =
        given()
            .auth().oauth2(oauth_token)
            .body(request)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .log().all()
            .when()
            .post("/api/metadatas/lineages/edges");

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
        .get("/api/metadatas/lineages/edges");

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
        .get("/api/metadatas/lineages/map/" + metaId);

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

    createLineageEdge(metaId1, metaId2, "CREATE TABLE AS SELECT * FROM mdm_test_jdbc");
    createLineageEdge(metaId2, metaId3, "Druid ingestion with Hive Table");

    TestUtils.printTestTitle("3. list lineage edges");

    List<Map<String, String>> edges = listLineageEdge();
    System.out.print(edges);

    TestUtils.printTestTitle("4. Get lineage map");

    Map<String, Object> lineageMap = getLineageMap(metaId2);
    System.out.print(lineageMap);

    TestUtils.printTestTitle("5. Test a circuit");

    createLineageEdge(metaId3, metaId1, "Preparation snapshot upstream Druid JDBC to a Hive table");

    TestUtils.printTestTitle("6. Add more and test complex lineage");

    String metaId4 = createMetadata("meta4", "ENGINE", "ds_mdm_04", "ds_mdm_04_id");
    String metaId5 = createMetadata("meta5", "ENGINE", "ds_mdm_05", "ds_mdm_05_id");
    String metaId6 = createMetadata("meta6", "ENGINE", "ds_mdm_06", "ds_mdm_06_id");
    String metaId7 = createMetadata("meta7", "ENGINE", "ds_mdm_07", "ds_mdm_07_id");
    String metaId8 = createMetadata("meta8", "ENGINE", "ds_mdm_08", "ds_mdm_08_id");
    String metaId9 = createMetadata("meta9", "ENGINE", "ds_mdm_09", "ds_mdm_09_id");

    TestUtils.printTestTitle("7. Test load lineage map");

    String wrangledDsId = prepareLineageMapDs();
    loadLineageMap();   // It has to work in both cases that wrangledDsId is given or not.
    lineageMap = getLineageMap(metaId6);
    System.out.print(lineageMap);
  }

  /*
   * meta4 --(prep import)--> meta5 --(prep wrangle)----> meta6 --(prep snapshot)--> meta7 --(ingestion)--> meta8
   * meta9 --------------(prep join)------------------/
   *
   * returns wrangledDsId
   */
  private String prepareLineageMapDs() {
    Map<String, Object> response = PrDatasetRestIntegrationTest.make_dataset_static(oauth_token,
        "src/test/resources/csv/test_lineage.csv",
        "DEFAULT_LINEAGE_MAP", "Hard-coded: LineageEdgeRestIntegrationTest.java");
    List<Object> datasets = (List<Object>) response.get("datasets");
    for (Object dataset : datasets) {
      HashMap<String, Object> map = (HashMap) dataset;
      String dsType = (String) map.get("dsType");
      if (dsType.equals(DS_TYPE.WRANGLED.name())) {
        return (String) map.get("dsId");
      }
    }
    assert false : response;
    return null;
  }

  private void loadLineageMap() {
    // @formatter:off
    Response loadLineageMapRes =
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .body(new HashMap())
            .log().all()
            .when()
            .post("/metadatas/lineages/map");

    loadLineageMapRes.then()
        .statusCode(HttpStatus.SC_CREATED)
        .log().all();
    // @formatter:on
  }
}

