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

import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.TestUtils;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.hamcrest.Matchers.is;

@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class ColumnDictionaryRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void defaultCrudTest() {

    TestUtils.printTestTitle("1. Dictionary 생성");

    ColumnDictionary columnDictionary = new ColumnDictionary();
    columnDictionary.setName("test dictionary");
    columnDictionary.setLogicalName("test logical name");
    columnDictionary.setDataType(DataType.STRING);
    columnDictionary.setLogicalType(LogicalType.EMAIL);

    // @formatter:off
    Response createPostRes =
      given()
        .auth().oauth2(oauth_token)
        .body(columnDictionary)
        .contentType(ContentType.JSON)
        .log().all()
      .when()
        .post("/api/dictionaries");

    createPostRes.then()
        .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String dictionaryId = from(createPostRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "default")
    .when()
      .get("/api/dictionaries/{id}", dictionaryId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. Dictionary 수정");

    Map<String, Object> reqDictionary = Maps.newHashMap();
    reqDictionary.put("name", "update Dictionary");

    // @formatter:off
    Response createCommentRes =
      given()
        .auth().oauth2(oauth_token)
        .body(reqDictionary)
        .contentType(ContentType.JSON)
      .when()
        .patch("/api/dictionaries/{id}", dictionaryId);

    createCommentRes.then()
        .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/dictionaries/{id}", dictionaryId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. Dictionary 삭제");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/dictionaries/{id}", dictionaryId)
    .then()
        .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/dictionaries/{id}", dictionaryId)
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void findColumnDictionaris() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("nameContains", "Test")
      .param("logicalNameContains", "dic")
      .param("searchDateBy", "created")
      .param("from", "2018-01-01T00:00:00.0Z")
      .param("to", "2020-01-01T00:00:00.0Z")
      .param("sort", "logicalName,desc")
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/dictionaries")
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void findCodeTableInColumnDictionaris() {

    String dictionaryId = "test_dictionary1";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forCodeView")
      .log().all()
    .when()
      .get("/api/dictionaries/{id}/codetable", dictionaryId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void findLinkedMetadataColumn() {

    String dictionaryId = "test_dictionary1";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDictionaryListView")
      .log().all()
    .when()
      .get("/api/dictionaries/{id}/columns", dictionaryId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void LinkCodeTableWithColumnDictionary() {

    String dictionaryId = "test_dictionary4";
    String linkCodeTable = "test_code_table3";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType("text/uri-list")
      .body("/api/codetables/" + linkCodeTable)
      .log().all()
    .when()
      .put("/api/dictionaries/{id}/codetable", dictionaryId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/codetables/{tableId}/dictionaries", linkCodeTable)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void checkDuplicatedName() {

    String nonDuplicatedName = "Test Dictionary 0";
    String duplicatedName = "Test Dictionary 1";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/dictionaries/name/{id}/duplicated", nonDuplicatedName)
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
      .get("/api/dictionaries/name/{id}/duplicated", duplicatedName)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("duplicated", is(true))
      .log().all();
    // @formatter:on
  }
}
