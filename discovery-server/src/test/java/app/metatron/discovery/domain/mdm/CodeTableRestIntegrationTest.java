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

package app.metatron.discovery.domain.mdm;

import com.google.common.collect.Lists;

import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.hamcrest.Matchers.is;

@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class CodeTableRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void defaultCrudTest() {

    TestUtils.printTestTitle("1. Code Table 생성");

    Map<String, Object> reqCodeTable = Maps.newHashMap();
    reqCodeTable.put("name", "Created Code Table");
    reqCodeTable.put("description", "Code Table Description");

    List<CodeValuePair> codeValuePairs = Lists.newArrayList(
        new CodeValuePair("code1", "value1", "desc1"),
        new CodeValuePair("code2", "value2", "desc2"),
        new CodeValuePair("code3", "value3", "desc3")
    );
    reqCodeTable.put("codes", codeValuePairs);

    // @formatter:off
    Response createPostRes =
      given()
        .auth().oauth2(oauth_token)
        .body(reqCodeTable)
        .contentType(ContentType.JSON)
        .log().all()
      .when()
        .post("/api/codetables");

    createPostRes.then()
        .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String tableId = from(createPostRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/codetables/{id}", tableId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. Code Table 수정");

    Map<String, Object> updateCodeTable = Maps.newHashMap();
    updateCodeTable.put("name", "Update Code Table");

    // @formatter:off
    Response createCommentRes =
      given()
        .auth().oauth2(oauth_token)
        .body(updateCodeTable)
        .contentType(ContentType.JSON)
      .when()
        .patch("/api/codetables/{id}", tableId);

    createCommentRes.then()
        .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/codetables/{id}", tableId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. Code Table 삭제");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/codetables/{id}", tableId)
    .then()
        .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/codetables/{id}", tableId)
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void findCodeTableList() {
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("nameContains", "Code")
      .param("searchDateBy", "created")
      .param("from", "2018-01-01T00:00:00.0Z")
      .param("to", "2020-01-01T00:00:00.0Z")
      .param("sort", "name,asc")
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/codetables")
    .then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.dataSources", hasSize(2))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void findColumnDictionarisInCodeTable() {

    String codeTableId = "test_code_table1";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
//      .param("nameContains", "Code")
//      .param("searchDateBy", "created")
//      .param("from", "2018-01-01T00:00:00.0Z")
//      .param("to", "2020-01-01T00:00:00.0Z")
//      .param("sort", "name,asc")
      .log().all()
    .when()
      .get("/api/codetables/{tableId}/dictionaries", codeTableId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.dataSources", hasSize(2))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void patchCodeValueInCodeTable() {

    String patchCodeTableId = "test_code_table1";

    // Code 추가
    Map<String, Object> addCodeValue = Maps.newHashMap();
    addCodeValue.put("code", "add code");
    addCodeValue.put("value", "add value");
    addCodeValue.put("op", "add");

    // Code 추가
    Map<String, Object> updateCodeValue = Maps.newHashMap();
    updateCodeValue.put("id", 100000011);
    updateCodeValue.put("code", "update code");
    updateCodeValue.put("value", "update value");
    updateCodeValue.put("op", "replace");

    Map<String, Object> deleteCodeValue = Maps.newHashMap();
    deleteCodeValue.put("id", 100000012);
    deleteCodeValue.put("op", "remove");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(Lists.newArrayList(addCodeValue, updateCodeValue, deleteCodeValue))
      .log().all()
    .when()
      .patch("/api/codetables/{tableId}/codes", patchCodeTableId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/codetables/{tableId}", patchCodeTableId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void checkDuplicatedName() {

    String nonDuplicatedName = "Test Code Table 0";
    String duplicatedName = "Test Code Table 1";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/codetables/name/{id}/duplicated", nonDuplicatedName)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("duplicated", is(false))
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/codetables/name/{id}/duplicated", duplicatedName)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("duplicated", is(true))
      .log().all();
    // @formatter:on
  }
}
