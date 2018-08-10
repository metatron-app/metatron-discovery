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

package app.metatron.discovery.domain.mdm.catalog;

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
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class CatalogRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void defaultCrudTest() {

    TestUtils.printTestTitle("1. Catalog 생성");

    Catalog catalog = new Catalog();
    catalog.setName("create catalog");

    // @formatter:off
    Response createPostRes =
      given()
        .auth().oauth2(oauth_token)
        .body(catalog)
        .contentType(ContentType.JSON)
        .log().all()
      .when()
        .post("/api/catalogs");

    createPostRes.then()
        .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String catalogId = from(createPostRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "default")
    .when()
      .get("/api/catalogs/{id}", catalogId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. Catalog 수정");

    Map<String, Object> updateCatalog = Maps.newHashMap();
    updateCatalog.put("name", "update catalog");

    // @formatter:off
    Response createCommentRes =
      given()
        .auth().oauth2(oauth_token)
        .body(updateCatalog)
        .contentType(ContentType.JSON)
      .when()
        .patch("/api/catalogs/{id}", catalogId);

    createCommentRes.then()
        .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/catalogs/{id}", catalogId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. Catalog 삭제");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/catalogs/{id}", catalogId)
    .then()
        .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/catalogs/{id}", catalogId)
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void addAndfindCategoryTree() {

    TestUtils.printTestTitle("1. Catalog 생성");

    Catalog catalog1 = new Catalog();
    catalog1.setName("create catalog 1");

    // @formatter:off
    Response createPostRes =
      given()
        .auth().oauth2(oauth_token)
        .body(catalog1)
        .contentType(ContentType.JSON)
        .log().all()
      .when()
        .post("/api/catalogs");

    createPostRes.then()
        .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String catalogId1 = from(createPostRes.asString()).get("id");

    Catalog catalog1_1 = new Catalog();
    catalog1_1.setName("create catalog 1_1");
    catalog1_1.setParentId(catalogId1);

    // @formatter:off
    createPostRes =
      given()
        .auth().oauth2(oauth_token)
        .body(catalog1_1)
        .contentType(ContentType.JSON)
        .log().all()
      .when()
        .post("/api/catalogs");

    createPostRes.then()
        .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String catalogId1_1 = from(createPostRes.asString()).get("id");

    Catalog catalog1_2 = new Catalog();
    catalog1_2.setName("create catalog 1_2");
    catalog1_2.setParentId(catalogId1);

    // @formatter:off
    createPostRes =
      given()
        .auth().oauth2(oauth_token)
        .body(catalog1_2)
        .contentType(ContentType.JSON)
        .log().all()
      .when()
        .post("/api/catalogs");

    createPostRes.then()
        .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String catalogId1_2 = from(createPostRes.asString()).get("id");

    Catalog catalog1_1_1 = new Catalog();
    catalog1_1_1.setName("create catalog 1_1_1");
    catalog1_1_1.setParentId(catalogId1_1);

    // @formatter:off
    createPostRes =
      given()
        .auth().oauth2(oauth_token)
        .body(catalog1_1_1)
        .contentType(ContentType.JSON)
        .log().all()
      .when()
        .post("/api/catalogs");

    createPostRes.then()
        .statusCode(HttpStatus.SC_CREATED)
      .log().all();
    // @formatter:on

    String catalogId1_1_1 = from(createPostRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/catalogs/{id}/tree", catalogId1)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forTreeView")
    .when()
      .get("/api/catalogs/{id}/tree", "ROOT")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void moveCatalog() {

    String moveCatalogId = "catalog2";
    String parentCatalogId = "catalog1_1";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/catalogs/{fromCatalogIds}/move/{toCatalogId}", moveCatalogId, parentCatalogId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/catalogs/{id}/tree", parentCatalogId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void moveCatalogToRoot() {

    String moveCatalogId = "catalog1_1";
    String parentCatalogId = Catalog.ROOT;

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/catalogs/{fromCatalogIds}/move/{toCatalogId}", moveCatalogId, parentCatalogId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/catalogs/{id}/tree", parentCatalogId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void findCatalogs() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("nameContains", "catalog")
      .param("parentId", "catalog1")
      .param("searchDateBy", "created")
      .param("from", "2018-01-01T00:00:00.0Z")
      .param("to", "2020-01-01T00:00:00.0Z")
      .param("projection", "forListView")
      .log().all()
    .when()
      .get("/api/catalogs")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void findMetadataInCatalog() {

    String catalogId = "catalog1_1";
//    String catalogId = CatalogController.EMPTY_CATALOG;

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "default")
      .param("allSubCatalogs", true)
      .log().all()
    .when()
      .get("/api/catalogs/{catalogId}/metadatas", catalogId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

}
