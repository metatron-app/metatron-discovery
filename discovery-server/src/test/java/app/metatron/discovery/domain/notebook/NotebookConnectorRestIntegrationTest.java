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

package app.metatron.discovery.domain.notebook;

import com.google.common.collect.Maps;

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

/**
 * Created by hsp on 2017. 7. 26..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
@Sql({"/sql/add_notebook_connector.sql"})
public class NotebookConnectorRestIntegrationTest extends AbstractRestIntegrationTest {

    @Before
    public void setUp() {
        RestAssured.port = serverPort;
    }

    /**
     * 노트북 서버 커널 프로세스 kill
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKBOOK"})
    public void killAllNotebookKernels() {
        // @formatter:off
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/connectors/kernels")
        .then()
            .statusCode(HttpStatus.SC_NO_CONTENT)
            .log().all();
        // @formatter:on
    }

    /**
     * 관리자 > 서버 리스트 화면 > 노트북 서버 생성 > Connection Test
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void checkConnection() {
        String hostname = "jupyter.mcloud.sktelecom.com";
        String port = "80";
        // @formatter:off
        given()
          .auth().oauth2(oauth_token)
          .contentType(ContentType.JSON)
        .when()
          .get("/api/connectors/status/{hostname}/{port}", hostname, port)
        .then()
          .log().all();
        // @formatter:on
    }

    /**
     * 관리자 > 서버 리스트 화면 > 노트북 서버 상세조회 or 수정 화면 > Validation Test
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void checkValidation() {
        TestUtils.printTestTitle("1. 서버 가용성 확인");
        String connectorId = "notebook-jupyter-00";
        // @formatter:off
        given()
                .auth().oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .when()
                .get("/api/connectors/validation/{id}", connectorId)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();
        // @formatter:on
    }

    /**
     * 관리자 > 서버 리스트 화면 > 노트북 서버 일괄 삭제 (multiple)
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void deleteConnectors() {
        String ids = "notebook-zeppelin-00" + "," + "notebook-jupyter-00";

        TestUtils.printTestTitle("1. 노트북 서버 일괄 삭제");
        // @formatter:off
        given()
          .auth().oauth2(oauth_token)
          .contentType(ContentType.JSON)
        .when()
          .delete("/api/connectors/{ids}", ids)
        .then()
          .statusCode(HttpStatus.SC_NO_CONTENT)
          .log().all();
        // @formatter:on

        TestUtils.printTestTitle("2. 노트북 서버 목록 조회");
        // @formatter:off
        given()
          .auth().oauth2(oauth_token)
          .contentType(ContentType.JSON)
          .param("projection", "default")
          .param("page", 0)
          .param("size", 10)
        .when()
          .get("/api/connectors")
        .then()
          .log().all();
        // @formatter:on
    }

    /**
     * 관리자 > 서버 리스트 화면
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void findAllConnectors() {
        // @formatter:off
        given()
          .auth().oauth2(oauth_token)
          .contentType(ContentType.JSON)
          .param("projection", "default")
          .param("page", 0)
          .param("size", 10)
        .when()
          .get("/api/connectors")
        .then()
          .log().all();
        // @formatter:on
    }

    /**
     * 관리자 > 서버 리스트 화면 > 이름 & 타입 검색 (결과조회)
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void findByNameAndType() {
        // @formatter:off
        given()
          .auth().oauth2(oauth_token)
          .contentType(ContentType.JSON)
          .param("projection", "default")
          .param("name", "local")    // jupyter OR zeppelin
          .param("type", "jupyter")
          .param("page", 0)
          .param("size", 10)
        .when()
          .get("/api/connectors/search/nametype")
        .then()
          .log().all();
        // @formatter:on
    }

    /**
     * 관리자 > 서버 리스트 화면 > 이름 검색 (결과조회)
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void findByName() {
        // @formatter:off
        given()
          .auth().oauth2(oauth_token)
          .contentType(ContentType.JSON)
          .param("projection", "default")
          .param("name", "local")    // jupyter OR zeppelin
          .param("page", 0)
          .param("size", 10)
        .when()
          .get("/api/connectors/search/name")
        .then()
          .log().all();
        // @formatter:on
    }

    /**
     * 관리자 > 서버 리스트 화면 > 타입 검색 (결과조회)
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void findByType() {
        // @formatter:off
        given()
          .auth().oauth2(oauth_token)
          .contentType(ContentType.JSON)
          .param("projection", "default")
          .param("type", "jupyter")    // jupyter OR zeppelin
          .param("page", 0)
          .param("size", 10)
        .when()
          .get("/api/connectors/search/type")
        .then()
          .log().all();
        // @formatter:on
    }

    /**
     * 노트북 서버 생성, 조회, 수정, 삭제
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void crudNotebookConnector() {
        // @formatter:off
        TestUtils.printTestTitle("1. 노트북 서버 생성");
        String connectorType = "jupyter";                // jupyter OR zeppelin
        String connectorName = "my_jupyter";
        String connectorDesc = "sample connector";
        String connectorHostname = "jupyter.mcloud.sktelecom.com";
        String connectorPort = "80";
        Map<String, Object> req = Maps.newHashMap();
        req.put("name", connectorName);
        req.put("type", connectorType);
        req.put("description", connectorDesc);
        req.put("hostname", connectorHostname);
        req.put("port", connectorPort);

        Response notebookConnectorRes =
                given()
                        .auth().oauth2(oauth_token)
                        .body(req)
                        .contentType(ContentType.JSON)
                        .when()
                        .post("/api/connectors");
        notebookConnectorRes.then().log().all();
        String connectorId = from(notebookConnectorRes.asString()).get("id");
        System.out.println("************ connectorId = " + connectorId);

        TestUtils.printTestTitle("2. 노트북 서버 조회");
        given()
                .auth().oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .when()
                .get("/api/connectors/{id}", connectorId)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();

        TestUtils.printTestTitle("3. 노트북 서버 수정");
        String connectorDesc2 = "sample connector change";
        Map<String, Object> patch = Maps.newHashMap();
        patch.put("description", connectorDesc2);
        given()
                .auth().oauth2(oauth_token)
                .body(patch)
                .contentType(ContentType.JSON)
                .when()
                .patch("/api/connectors/{id}", connectorId)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();

        TestUtils.printTestTitle("4. 노트북 서버 삭제");
        given()
                .auth().oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .when()
                .delete("/api/connectors/{id}", connectorId)
                .then()
                .statusCode(HttpStatus.SC_NO_CONTENT)
                .log().all();
        // @formatter:on
    }
}
