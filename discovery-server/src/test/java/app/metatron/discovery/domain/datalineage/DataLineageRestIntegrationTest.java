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

package app.metatron.discovery.domain.datalineage;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import java.util.HashMap;
import java.util.List;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

/**
 * Created by kyungtaak on 2016. 11. 29..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
@Sql({"/sql/test_datalineage.sql"})
public class DataLineageRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listTable() {

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("keyword", "cate")
            .param("scope", "TABLE")
//            .body(reqMap)
            .log().all()
            .when()
            .get("/api/datalineages")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

    List<HashMap> tableList = from(resp.asString()).getList("tableList", HashMap.class);
    for(HashMap tableMap : tableList){
      System.out.println(tableMap);
    }
    List<HashMap> sqlList = from(resp.asString()).getList("sqlList", HashMap.class);
    for(HashMap sqlMap : sqlList){
      System.out.println(sqlMap);
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listColumn() {

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("keyword", "region")
            .param("scope", "COLUMN")
//            .body(reqMap)
            .log().all()
            .when()
            .get("/api/datalineages")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

    List<HashMap> tableList = from(resp.asString()).getList("tableList", HashMap.class);
    for(HashMap tableMap : tableList){
      System.out.println(tableMap);
    }
    List<HashMap> sqlList = from(resp.asString()).getList("sqlList", HashMap.class);
    for(HashMap sqlMap : sqlList){
      System.out.println(sqlMap);
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listSQL() {

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("keyword", "create table sales_joined2")
            .param("scope", "SQL")
//            .body(reqMap)
            .log().all()
            .when()
            .get("/api/datalineages")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

    List<HashMap> tableList = from(resp.asString()).getList("tableList", HashMap.class);
    for(HashMap tableMap : tableList){
      System.out.println(tableMap);
    }
    List<HashMap> sqlList = from(resp.asString()).getList("sqlList", HashMap.class);
    for(HashMap sqlMap : sqlList){
      System.out.println(sqlMap);
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listWORKFLOW() {

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("keyword", "create table sales_joined2")
            .param("scope", "WORKFLOW")
//            .body(reqMap)
            .log().all()
            .when()
            .get("/api/datalineages")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

    List<HashMap> tableList = from(resp.asString()).getList("tableList", HashMap.class);
    for(HashMap tableMap : tableList){
      System.out.println(tableMap);
    }
    List<HashMap> sqlList = from(resp.asString()).getList("sqlList", HashMap.class);
    for(HashMap sqlMap : sqlList){
      System.out.println(sqlMap);
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void bothFromTableEntity(){
    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("direction", "both")
            .log().all()
            .when()
            .get("/api/datalineages/databases/{database}/tables/{table}", "default", "sales_joined")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void backFromTableEntity(){
    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("direction", "backward")
            .log().all()
            .when()
            .get("/api/datalineages/databases/{database}/tables/{table}", "default", "sales_joined")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void forwardFromTableEntity(){
    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("direction", "forward")
            .log().all()
            .when()
            .get("/api/datalineages/databases/{database}/tables/{table}", "default", "sales_joined")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void bothFromSqlEntity(){
    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("direction", "both")
            .log().all()
            .when()
            .get("/api/datalineages/sql/{dataLineageId}", 1)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void forwardFromSqlEntity(){
    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("direction", "forward")
            .log().all()
            .when()
            .get("/api/datalineages/sql/{dataLineageId}", 1)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void backwardFromSqlEntity(){
    String from = "2017-10-01T00:00:00.000Z";
    String to = "2017-10-31T00:00:00.000Z";
    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("from", from)
            .param("to", to)
            .param("direction", "backward")
            .log().all()
            .when()
            .get("/api/datalineages/sql/{dataLineageId}", 1)
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void getTableInformation(){
    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .log().all()
            .when()
            .get("/api/datalineages/databases/{database}/tables/{table}/information", "default", "sales_joined")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void getLinkedLineageAll(){
    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("depth", 9)
            .log().all()
            .when()
            .get("/api/datalineages/databases/{database}/tables/{table}/link", "default", "sales_joined")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on
  }
}
