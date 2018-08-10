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

import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;

import java.util.Map;

import app.metatron.discovery.TestUtils;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

/**
 * Created by james on 2017. 7. 31..
 */
public class SampleDataGenerator {

    private String oauth_token;

    public SampleDataGenerator(String oauth_token) {
        this.oauth_token = oauth_token;
    }

    /**
     *
     * @param notebookName
     * @param kernelType
     * @return
     */
    public String createNotebook(String notebookName, String kernelType) {
        TestUtils.printTestTitle("#. 노트북 생성");

        Map<String, Object> req = Maps.newHashMap();
        req.put("name", notebookName);
        req.put("type", "notebook");
        req.put("description", "Under the construction...");
        req.put("kernelType", kernelType);
        if(kernelType.equals("SPARK")) {
            req.put("dsType", "CHART");
            req.put("dsId", "ds-37");
            req.put("dsName", "ds-37-name");
//            req.put("dsType", "NONE");
//            req.put("dsId", "");
//            req.put("dsName", "");
            req.put("connector", "/api/connectors/" + "notebook-zeppelin-00");
        } else {
            req.put("dsType", "CHART");
            req.put("dsId", "ds-37");
            req.put("dsName", "ds-37-name");
//            req.put("dsType", "NONE");
//            req.put("dsId", "");
//            req.put("dsName", "");
            req.put("connector", "/api/connectors/" + "notebook-jupyter-00");
        }
        req.put("workspace", "/api/workspaces/" + "ws-03");
        // @formatter:off
        Response workBookRes =
            given()
                .auth().oauth2(oauth_token)
                .body(req)
                .contentType(ContentType.JSON)
            .when()
                .post("/api/notebooks");
        workBookRes
            .then().log().all();
        // @formatter:on
        return from(workBookRes.asString()).get("id");
    }

    /**
     *
     * @param modelName
     * @param subscribeType
     * @param notebookId
     * @return
     */
    public String createNotebookModel(String modelName, String subscribeType, String notebookId) {
        TestUtils.printTestTitle("#. 노트북 모델 생성");

        Map<String, Object> post = Maps.newHashMap();
        post.put("name", modelName);
        post.put("description", "test pub-sub notebook model");
        post.put("subscribeType", subscribeType);
        post.put("workspace", "/api/workspaces/" + "ws-03");
        post.put("notebook", "/api/notebooks/" + notebookId);
        // @formatter:off
        Response modelRes =
            given()
                .auth().oauth2(oauth_token)
                .body(post)
                .contentType(ContentType.JSON)
            .when()
                .post("/api/nbmodels");
        modelRes
            .then().log().all();
        // @formatter:on
        return from(modelRes.asString()).get("id");
    }

    /**
     *
     * @param modelId
     * @param statusType
     */
    public void updateNotebookModel(String modelId, String statusType) {
        TestUtils.printTestTitle("#. 노트북 수정");

        Map<String, Object> patch = Maps.newHashMap();
        patch.put("statusType", statusType);
        // @formatter:off
        given()
            .auth().oauth2(oauth_token)
            .body(patch)
            .contentType(ContentType.JSON)
        .when()
            .patch("/api/nbmodels/{id}", modelId)
        .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
        // @formatter:on
    }

}
