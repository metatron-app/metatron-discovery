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

package app.metatron.discovery.domain.audit;

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
@Sql({"/sql/test_audit.sql"})
public class AuditRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listAudit() {

    String from = "2017-08-01T00:00:00.000Z";
    String to = "2017-11-22T23:00:00.000Z";

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "list")
            .param("searchKeyword", "job")
            .param("status", "SUCCESS")
            .param("type", "JOB")
            .param("sort", "startTime,ASC")
            .param("page", 0)
            .param("size", 20)
            .param("from", from)
            .param("to", to)
            .log().all()
            .when()
            .get("/api/audits")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

    List<HashMap> audits = from(resp.asString()).getList("_embedded.audits", HashMap.class);
    for(HashMap dataLineage : audits){
      System.out.println(dataLineage);
    }
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void detailQueryAudit() {

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "detail")
            .log().all()
            .when()
            .get("/api/audits/{auditId}", "audit-01")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void detailJobAudit() {

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "detail")
            .log().all()
            .when()
            .get("/api/audits/{auditId}", "audit-02")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void statsCountStatusByDate(){
    String from = "2017-08-01T00:00:00.000Z";
    String to = "2017-11-22T23:00:00.000Z";

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("from", from)
            .param("to", to)
            .log().all()
            .when()
            .get("/api/audits/stats/query/count/date")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void statsCountByUser(){
    String from = "2017-08-01T00:00:00.000Z";
    String to = "2017-11-22T23:00:00.000Z";

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("from", from)
            .param("to", to)
            .log().all()
            .when()
            .get("/api/audits/stats/query/count/user")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listLongQueryTop5(){

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("size", 5)
            .param("sort", "elapsedTime,desc")
            .log().all()
            .when()
            .get("/api/audits")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listSuccessQueryCountTop5(){

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("page", 0)
            .param("size", 5)
            .param("auditStatus", "SUCCESS")
            .log().all()
            .when()
            .get("/api/audits/stats/query/count/status")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listFailQueryCountTop5(){

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("size", 5)
            .param("auditStatus", "FAIL")
            .log().all()
            .when()
            .get("/api/audits/stats/query/count/status")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listNumRowsTop5(){

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("size", 5)
            .param("sort", "numRows,desc")
            .log().all()
            .when()
            .get("/api/audits")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listMemorySecondsTop5(){

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("size", 5)
            .param("page", 0)
            .param("sort", "memorySeconds,desc")
            .log().all()
            .when()
            .get("/api/audits")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }


  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void listVCoreSecondsTop5(){

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("size", 5)
            .param("page", 0)
            .param("sort", "vcoreSeconds,desc")
            .log().all()
            .when()
            .get("/api/audits")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void sumResourceByQueueTop5(){

    // @formatter:off
    Response resp = given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("size", 5)
            .param("page", 0)
            .param("sort", "queue,asc")
            .param("type", "QUERY")
            .param("status", "SUCCESS")
            .log().all()
            .when()
            .get("/api/audits/stats/queue/sum/resource")
            .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
            .extract().response();
    // @formatter:on

  }
}
