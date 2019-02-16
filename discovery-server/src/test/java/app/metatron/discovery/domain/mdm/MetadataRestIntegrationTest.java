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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.support.DefaultFormattingConversionService;
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
public class MetadataRestIntegrationTest extends AbstractRestIntegrationTest {

  @Autowired
  DefaultFormattingConversionService defaultConversionService;

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void defaultCrudTest() {

    TestUtils.printTestTitle("1. metadata 생성");

    Map<String, Object> reqMedataMap = Maps.newHashMap();
    reqMedataMap.put("name", "Created metadata");
    reqMedataMap.put("description", "Medata Description");

    Map<String, Object> engineSourceMap = Maps.newHashMap();
    engineSourceMap.put("type","ENGINE");
    engineSourceMap.put("name","test_engine_datasource");
    engineSourceMap.put("sourceId", "ds-37");

    reqMedataMap.put("sourceType", "ENGINE");
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

    String tableId = from(createRes.asString()).get("id");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forListView")
    .when()
      .get("/api/metadatas/{id}", tableId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. Metadata 수정");

    Map<String, Object> updateCodeTable = Maps.newHashMap();
    updateCodeTable.put("name", "Updated metadata");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(updateCodeTable)
      .contentType(ContentType.JSON)
    .when()
      .patch("/api/metadatas/{id}", tableId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/metadatas/{id}", tableId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. Metadata 삭제");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/metadatas/{id}", tableId)
    .then()
        .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/metadatas/{id}", tableId)
    .then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm_popularity.sql"})
  public void findNullMetadataList(){
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("page", "0")
      .param("size", "15")
      .param("sort", "createdTime,desc")
      .param("projection", "forListView")
      .log().all()
    .when()
      .get("/api/metadatas")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void findMetadataList() {
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("catalogId", "catalog1_1")
      .param("sourceType", "ENGINE")
      .param("nameContains", "metadata")
      .param("tag", "meta_tag1")
      .param("searchDateBy", "created")
      .param("from", "2018-01-01T00:00:00.0Z")
      .param("to", "2020-01-01T00:00:00.0Z")
      .param("sort", "name,asc")
      .param("projection", "forDetailView")
      .log().all()
    .when()
      .get("/api/metadatas")
    .then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.dataSources", hasSize(2))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void checkDuplicatedName() {

    String nonDuplicatedName = "Test metadata 0";
    String duplicatedName = "Test metadata 1";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/metadatas/name/{id}/duplicated", nonDuplicatedName)
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
      .get("/api/metadatas/name/{id}/duplicated", duplicatedName)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("duplicated", is(true))
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void manageTags() {

    String metadataId = "test_meta1";

    List<String> attachTags = Lists.newArrayList("tag1", "tag2", "tag3");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(attachTags)
      .log().all()
    .when()
      .post("/api/metadatas/{id}/tags/attach", metadataId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    List<String> detachTags = Lists.newArrayList("tag3");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(detachTags)
      .log().all()
    .when()
      .post("/api/metadatas/{id}/tags/detach", metadataId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    List<String> updateTags = Lists.newArrayList("tag1", "tag4");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .body(updateTags)
      .log().all()
    .when()
      .post("/api/metadatas/{id}/tags/update", metadataId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forListView")
      .log().all()
    .when()
      .get("/api/metadatas/{id}", metadataId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .log().all()
    .when()
      .get("/api/metadatas/tags")
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void findColumnsInMetadata() {

    String metadataId = "test_meta1";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("projection", "forListView")
      .log().all()
    .when()
      .get("/api/metadatas/{id}/columns", metadataId)
    .then()
//      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.dataSources", hasSize(2))
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void patchColumnInMetadata() {

    String patchMetadataId = "test_meta1";

    // Column 추가
    Map<String, Object> addColumnValue = Maps.newHashMap();
    addColumnValue.put("physicalType", "INTEGER");
    addColumnValue.put("physicalName", "pcolumn04");
    addColumnValue.put("type", "INTEGER");
    addColumnValue.put("name", "add_column04");
    addColumnValue.put("dictionary", "/api/dictionaries/test_dictionary2");
    addColumnValue.put("op", "add");

    // Column 수정
    Map<String, Object> updateColumnValue = Maps.newHashMap();
    updateColumnValue.put("id", 100012);
    updateColumnValue.put("name", "update_column_codetable");
    updateColumnValue.put("type", "IP_V4");
    updateColumnValue.put("codeTable", "/api/codetables/test_code_table1");
//    updateColumnValue.put("codeTable", null);
    updateColumnValue.put("op", "replace");

    // Column 삭제
    Map<String, Object> deleteColumnValue = Maps.newHashMap();
    deleteColumnValue.put("id", 100011);
    deleteColumnValue.put("op", "remove");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(Lists.newArrayList(addColumnValue, updateColumnValue, deleteColumnValue))
      .log().all()
    .when()
      .patch("/api/metadatas/{metadataId}/columns", patchMetadataId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forListView")
    .when()
      .get("/api/metadatas/{metadataId}/columns", patchMetadataId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_datasource_field.sql"})
  public void patchMetadataWithDataSource() {

    String patchMetadataId = "test_meta1";
    String checkDataSourceId = "test_ds_id";

    // Column 수정
    Map<String, Object> updateMetadata = Maps.newHashMap();
    updateMetadata.put("name", "metadata -> datasource name");
    updateMetadata.put("description", "metadata -> desciption");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(updateMetadata)
      .log().all()
    .when()
      .patch("/api/metadatas/{metadataId}", patchMetadataId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/datasources/{datasourceId}", checkDataSourceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_datasource_field.sql"})
  public void patchColumnInMetadataWithDataSource() {

    String patchMetadataId = "test_meta1";
    String checkDataSourceId = "test_ds_id";

    // Column 수정
    Map<String, Object> updateColumnValue = Maps.newHashMap();
    updateColumnValue.put("op", "replace");
    updateColumnValue.put("id", 10003);
    updateColumnValue.put("name", "sd->updated from metadata");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(Lists.newArrayList(updateColumnValue))
      .log().all()
    .when()
      .patch("/api/metadatas/{metadataId}/columns", patchMetadataId)
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
      .get("/api/datasources/{datasourceId}", checkDataSourceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void linkMetadataWithCatalog() {

    String metadataId = "test_meta1";

    TestUtils.printTestTitle("1. 메타데이터내 Catalog 전체 수정(Replace)");

    String catalogLinks = "/api/catalogs/catalog1\n/api/catalogs/catalog2";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(catalogLinks)
      .contentType("text/uri-list")
      .log().all()
    .when()
      .put("/api/metadatas/{id}/catalogs", metadataId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("2. 메타데이터내 Catalog 추가(Append)");

    String appendCatalogLinks = "/api/catalogs/catalog1_1";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .body(appendCatalogLinks)
      .contentType("text/uri-list")
      .log().all()
    .when()
      .patch("/api/metadatas/{id}/catalogs", metadataId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("3. 메타데이터내 카탈로그 연결 삭제");

    String deleteCatalogId = "catalog1";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .log().all()
    .when()
      .delete("/api/metadatas/{metadata Id}/catalogs/{catalog Id}", metadataId, deleteCatalogId)
    .then()
      .statusCode(HttpStatus.SC_NO_CONTENT)
    .log().all();
    // @formatter:on

    TestUtils.printTestTitle("4. 메타데이터내 카탈로그 연결 확인");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/metadatas/{id}", metadataId)
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  @Sql({"/sql/test_mdm.sql"})
  public void getMetadataBySource() {

    String engineSourceId = "source_id_1";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forItemView")
      .log().all()
    .when()
      .get("/api/metadatas/metasources/{id}", engineSourceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on

    String jdbcSourceId = "source_id_3";

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("schema", "test_schema1")
      .param("table", "test_table1,test_table2")
      .param("projection", "forItemListView")
      .log().all()
    .when()
      .get("/api/metadatas/metasources/{id}", jdbcSourceId)
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

}
