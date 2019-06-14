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
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@Sql({"/sql/test_mdm.sql"})
public class MetadataDepRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  private String createMetadataEntity(String name, String type, String sourceName,
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

  private Map<String, Object> readMetadataEntity(String id) {
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

  private void createMetadataDepEntity(String desc, String upstreamId, String downstreamId) {
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
            .post("/api/metadatas/deps");

    createRes.then()
        .statusCode(HttpStatus.SC_CREATED)
        .log().all();
    // @formatter:on
  }

  private List<Map<String, String>> listMetadataDependencies() {
    // @formatter:off
    Response readResponse = given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .when()
        .get("/api/metadatas/deps");

    readResponse.then()
        .statusCode(HttpStatus.SC_OK)
        .log().all();
    // @formatter:on

    return readResponse.jsonPath().getList("");

  }

  private Map<String, Object> getMetadataDependencyMap(String metaId) {
    // @formatter:off
    Response readResponse = given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .when()
        .get("/api/metadatas/deps/map/" + metaId);

    readResponse.then()
        .statusCode(HttpStatus.SC_OK)
        .log().all();
    // @formatter:on

    return readResponse.jsonPath().getMap("");
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void defaultCrudTest() {
    TestUtils.printTestTitle("1. Create metadata entities");

//    ('ds_mdm_01_id', 'ds_mdm_01', 'ds_mdm_01', 'polaris', 'Dummy datasource #1', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
//    ('ds_mdm_02_id', 'ds_mdm_02', 'ds_mdm_02', 'polaris', 'Dummy datasource #2', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris'),
//    ('ds_mdm_03_id', 'ds_mdm_03', 'ds_mdm_03', 'polaris', 'Dummy datasource #3', 'MASTER', 'IMPORT', 'ENGINE', 'DAY', 'ENABLED', true, 1.0, NOW(), 'polaris',  NOW(), 'polaris');

    // Used "ENGINE" just because of the absence of corresponding entities for JDBC or STAGEDB
    String id1 = createMetadataEntity("meta1", "ENGINE", "ds_mdm_01", "ds_mdm_01_id");
    String id2 = createMetadataEntity("meta2", "ENGINE", "ds_mdm_02", "ds_mdm_02_id");
    String id3 = createMetadataEntity("meta3", "ENGINE", "ds_mdm_03", "ds_mdm_03_id");

    Map<String, Object> map1 = readMetadataEntity(id1);
    Map<String, Object> map2 = readMetadataEntity(id2);
    Map<String, Object> map3 = readMetadataEntity(id3);

    assert id1.equals(map1.get("id"));
    assert id2.equals(map2.get("id"));
    assert id3.equals(map3.get("id"));

    TestUtils.printTestTitle("2. Create metadata dependency entities");

    createMetadataDepEntity("CREATE TABLE AS SELECT * FROM mdm_test_jdbc", id1, id2);
    createMetadataDepEntity("Druid ingestion with Hive Table", id2, id3);

    TestUtils.printTestTitle("3. list metadata dependencies");

    List<Map<String, String>> deps = listMetadataDependencies();

    System.out.print(deps);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void dependencyMapTest() {
    TestUtils.printTestTitle("1. Create metadata entities");

    // Used "ENGINE" just because of the absence of corresponding entities for JDBC or STAGEDB
    String id1 = createMetadataEntity("meta1", "ENGINE", "ds_mdm_01", "ds_mdm_01_id");
    String id2 = createMetadataEntity("meta2", "ENGINE", "ds_mdm_02", "ds_mdm_02_id");
    String id3 = createMetadataEntity("meta3", "ENGINE", "ds_mdm_03", "ds_mdm_03_id");

    TestUtils.printTestTitle("2. Create metadata dependency entities");

    createMetadataDepEntity("CREATE TABLE AS SELECT * FROM mdm_test_jdbc", id1, id2);
    createMetadataDepEntity("Druid ingestion with Hive Table", id2, id3);

    TestUtils.printTestTitle("3. Get metadata dependency map");

    Map<String, Object> depMap = getMetadataDependencyMap(id2);

    System.out.print(depMap);
  }
}

