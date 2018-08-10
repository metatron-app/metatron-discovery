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
 * Created by kyungtaak on 2016. 10. 22..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
@Sql({"/sql/add_notebook_connector.sql"})
public class NotebookRestIntegrationTest extends AbstractRestIntegrationTest {

    private SampleDataGenerator sample;
    private String py_notebook_id;
    private String r_notebook_id;
    private String spark_notebook_id;

    @Before
    public void setUp() {
        RestAssured.port = serverPort;
        sample = new SampleDataGenerator(oauth_token);
        // create notebooks
//        py_notebook_id = sample.createNotebook("notebook-test-setUp-py", "PYTHON");
//        r_notebook_id = sample.createNotebook("notebook-test-setUp-r", "R");
        spark_notebook_id = sample.createNotebook("notebook-test-setUp-spark", "SPARK");
    }

    /**
     * 워크스페이스 > 목록 > 노트북 일괄 삭제 (multiple)
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKBOOK"})
    public void deleteNotebooks() {
        String ids = py_notebook_id + "," + r_notebook_id;

        TestUtils.printTestTitle("1. 노트북 일괄 삭제");
        // @formatter:off
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/notebooks/{ids}", ids)
        .then()
            .statusCode(HttpStatus.SC_NO_CONTENT)
            .log().all();
        // @formatter:on

        TestUtils.printTestTitle("2. 노트북 목록 조회");
        // @formatter:off
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "forListView")
        .when()
            .get("/api/notebooks")
        .then()
            .log().all();
        // @formatter:on
    }

    /**
     * (deprecated) 워크스페이스 > 목록 -> WorkspaceRestIntegrationTest.findWorkspaceWithDetailView()
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKBOOK"})
    public void getNoteBooks() {
        // @formatter:off
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection","forListView")
        .when()
            .get("/api/notebooks")
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
        // @formatter:on
    }

    /**
     * 1. 워크스페이스 > 목록 > 노트북 상세 화면
     * 2. 워크스페이스 > 목록 > 노트북 추가 > 노트북 생성하는 화면 > 완료 > 노트북 상세 화면 (직후에 link url을 새탭으로 실행한다.)
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKBOOK"})
    public void getNoteBook() {
        // @formatter:off
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "forDetailView")
        .when()
            .get("/api/notebooks/{id}", r_notebook_id)
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
        // @formatter:on
    }

    /**
     * 노트북 상세조회 > Generate API > API 생성 팝업 > 등록 완료
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKBOOK"})
    public void crudNotebookAPI() {
        String notebookId = spark_notebook_id; // r_notebook_id or py_notebook_id or spark_notebook_id

        String apiName = "notebook-test-crudNotebookAPI";
        String apiDesc = "Under the construction...";
        String apiReturnType = "Void";  // HTML or JSON or Void

        Map<String, String> req = Maps.newHashMap();
        req.put("name", apiName);
        req.put("desc", apiDesc);
        req.put("returnType", apiReturnType);

        // @formatter:off
        TestUtils.printTestTitle("1. 노트북 API 생성");
        Response res =
            given()
                .auth().oauth2(oauth_token)
                .body(req)
                .contentType(ContentType.JSON)
            .when()
                .post("/api/notebooks/rest/{id}", notebookId);
        res.then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();

        TestUtils.printTestTitle("1.1. 노트북 API 상세정보 조회");
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "forAPIView")
        .when()
            .get("/api/notebooks/{id}", notebookId)
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

        TestUtils.printTestTitle("2. 노트북 API 실행");
        String url = from(res.asString()).get("notebookAPI.url");
        String returnType = from(res.asString()).get("notebookAPI.returnType");

        TestUtils.printTestTitle("2.1. 노트북 API 실행 (GET)");
        given()
            .auth().oauth2(oauth_token)
            .accept(returnType.equals("HTML") ? ContentType.HTML : ContentType.JSON)
        .when()
            .get(url)
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

//        TestUtils.printTestTitle("2.2. 노트북 API 실행 (PUT)");
////        ./exec.sh localhost:8180 eb2c0091-034e-4747-a95a-a2b1b880858f '{"language":"r","line":1,"vars":"@base_ymd=yyyy-MM-01;strVal=temp;#numVal=100"}'
//        NotebookContent params = new NotebookContent();
//        params.setLanguage("r");
//        params.setLine(1);
////        params.setVars("@base_ymd=yyyy-MM-01");
//        params.setVars("@base_ymd=yyyy-MM-01;base_ym=201802;#tempValue=10");
//        given()
//            .auth().oauth2(oauth_token)
//            .accept(returnType.equals("HTML") ? ContentType.HTML : ContentType.JSON)
//            .contentType(ContentType.JSON)
//            .body(params)
//        .when()
//            .put(url)
//        .then()
//            .statusCode(HttpStatus.SC_OK)
//            .log().all();

        TestUtils.printTestTitle("3. 노트북 API 수정");
        Map<String, Object> patch = Maps.newHashMap();
        patch.put("name", "modified notebook api name");
        patch.put("desc", "modified notebook api description");
        patch.put("returnType", apiReturnType);

        given()
            .auth().oauth2(oauth_token)
            .body(patch)
            .contentType(ContentType.JSON)
        .when()
            .patch("/api/notebooks/rest/{id}", notebookId)
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

        TestUtils.printTestTitle("3.1. 노트북 API 상세정보 조회");
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "forAPIView")
        .when()
            .get("/api/notebooks/{id}", notebookId)
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

        TestUtils.printTestTitle("3.1. 노트북 상세정보 조회");
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "forDetailView")
        .when()
            .get("/api/notebooks/{id}", notebookId)
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

        TestUtils.printTestTitle("4. 노트북 API 제거");
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/notebooks/rest/{id}", notebookId)
        .then()
            .statusCode(HttpStatus.SC_NO_CONTENT)
            .log().all();

        TestUtils.printTestTitle("4.1. 노트북 상세정보 조회");
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "forDetailView")
        .when()
            .get("/api/notebooks/{id}", notebookId)
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
        // @formatter:on
    }

    /**
     * 노트북 생성, 조회, 삭제
     */
    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKBOOK"})
    public void crudNoteBook() {
        /**
         * 워크스페이스 > 목록 > 노트북 추가 > 노트북 생성하는 화면 > 완료
         */
        String notebookName = "notebook-test-crudNoteBook";
        String notebookDesc = "Under the construction...";
        String kernelType = "SPARK";           // R or PYTHON or SPARK
        String dataSourceType = "NONE";   // DATASOURCE or DASHBOARD or CHART or NONE
        String dataSourceId = "";          // datasourceId or dashboardId or chartId
        String dataSourceName = "";

        String workspaceId = "ws-03";
        String connectorId = "notebook-zeppelin-00"; // notebook-jupyter-00 or notebook-zeppelin-00

        Map<String, Object> req = Maps.newHashMap();
        req.put("name", notebookName);
        req.put("type", "notebook");
        req.put("description", notebookDesc);
        req.put("kernelType", kernelType);
        req.put("dsType", dataSourceType);
        req.put("dsId", dataSourceId);
        req.put("dsName", dataSourceName);

        req.put("workspace", "/api/workspaces/" + workspaceId);
        req.put("connector", "/api/connectors/" + connectorId);

        TestUtils.printTestTitle("1. 노트북 생성");
        Response noteBookRes =
        // @formatter:off
        given()
            .auth().oauth2(oauth_token)
            .body(req)
            .contentType(ContentType.JSON)
        .when()
            .post("/api/notebooks");
        noteBookRes
            .then().log().all();
        // @formatter:on
        String notebookId = from(noteBookRes.asString()).get("id");

        TestUtils.printTestTitle("2. 노트북 조회");
        // @formatter:off
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "forDetailView")
        .when()
            .get("/api/notebooks/{id}", notebookId)
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
        // @formatter:on

        TestUtils.printTestTitle("3. 노트북 수정");

        Map<String, Object> patch = Maps.newHashMap();
        patch.put("name", "modified notebook-name");
        patch.put("type", "notebook");
        patch.put("description", "modified notebook-desc");
        // @formatter:off
        given()
            .auth().oauth2(oauth_token)
            .body(patch)
            .contentType(ContentType.JSON)
        .when()
            .patch("/api/notebooks/{id}", notebookId)
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .param("projection", "forDetailView")
        .when()
            .get("/api/notebooks/{id}", notebookId)
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
        // @formatter:on
        /**
         * 워크스페이스 > 목록 > 삭제
         */
        TestUtils.printTestTitle("4. 노트북 삭제");
        // @formatter:off
        given()
            .auth().oauth2(oauth_token)
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/notebooks/{id}", notebookId)
        .then()
            .statusCode(HttpStatus.SC_NO_CONTENT)
            .log().all();
        // @formatter:on
    }
}
