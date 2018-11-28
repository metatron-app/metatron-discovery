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

package app.metatron.discovery.domain.dataprep.rest;

import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import app.metatron.discovery.domain.dataprep.transform.PrepSnapshotResponse;
import com.google.common.collect.Maps;

import com.facebook.presto.jdbc.internal.jackson.core.JsonProcessingException;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestExecutionListeners;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.dataprep.PrepSnapshotRequestPost;

import static com.jayway.restassured.RestAssured.given;

/**
 * Created by kaypark on 2017. 7. 4..
 */
@ActiveProfiles("dataprep")
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class PrSnapshotRestIntegrationTest extends AbstractRestIntegrationTest {

    private static final Logger LOGGER = LoggerFactory.getLogger(PrDataflowRestIntegrationTest.class);

    @Value("${local.server.port}")
    private int serverPort;

    @Before
    public void setUp() {
        RestAssured.port = serverPort;
    }

    public String make_snapshot(PrSnapshot.SS_TYPE ssType, PrSnapshot.STORAGE_TYPE storage_type) {
        File file = new File("src/test/resources/test_dataprep.csv");

        // UPLOAD
        Response upload_response = given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .multiPart("file", file)
                .contentType("multipart/form-data")
                .post("/api/preparationdatasets/upload")
                .then()
                .statusCode(HttpStatus.SC_CREATED)
                .log().all()
                .extract()
                .response();

        String filekey = upload_response.path("filekey");
        String filename = upload_response.path("filename");

        Map<String, Object> dataset_post_body  = Maps.newHashMap();
        dataset_post_body.put("dsName", "file ds1");
        dataset_post_body.put("dsDesc", "dataset with file");
        dataset_post_body.put("dsType", "IMPORTED");
        dataset_post_body.put("importType", "FILE");
        dataset_post_body.put("fileType", "LOCAL");
        dataset_post_body.put("filekey", filekey);
        dataset_post_body.put("filename", filename);
        dataset_post_body.put("custom", "{\"fileType\":\"dsv\",\"delimiter\":\",\"}");
        dataset_post_body.put("dcId", "file dc");

        // CREATE DATASET
        Response dataset_post_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(dataset_post_body)
                .post("/api/preparationdatasets")
                .then()
                .statusCode(HttpStatus.SC_CREATED)
                .log().all()
                .extract()
                .response();

        String importedDsId = dataset_post_response.path("dsId");

        Map<String, Object> dataflow_post_body = Maps.newHashMap();
        dataflow_post_body.put("dfName", "posted_df1");
        dataflow_post_body.put("dfDesc", "posted_df_desc1");

        List<String> datasets = new ArrayList<>();
        datasets.add(dataset_post_response.path("_links.self.href"));
        dataflow_post_body.put("datasets", datasets);

        // CREATE DATAFLOW
        Response dataflow_post_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(dataflow_post_body)
                .post("/api/preparationdataflows")
                .then()
                .statusCode(HttpStatus.SC_CREATED)
                .log().all()
                .extract()
                .response();

        Map<String, Object> transform_post_body = Maps.newHashMap();
        String dfId = dataflow_post_response.path("dfId");
        transform_post_body.put("dfId", dfId);

        // CREATE WRANGLED DATASET
        Response transform_post_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(transform_post_body)
                .post("/api/preparationdatasets/" + importedDsId + "/transform")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        String wrangledDsId = transform_post_response.path("wrangledDsId");

        PrepSnapshotRequestPost data = new PrepSnapshotRequestPost();
        data.setEngine(PrSnapshot.ENGINE.EMBEDDED);
        data.setSsType(ssType);
        data.setFormat(PrSnapshot.HIVE_FILE_FORMAT.CSV);
//        data.setCompression(PrSnapshot.COMPRESSION.ZLIB);

        List<String> partKeys = new ArrayList<>();
        partKeys.add("month");
        data.setPartKeys((ArrayList<String>) partKeys);

        Response snapshot_post_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(data)
                .post("/api/preparationdatasets/" + wrangledDsId + "/transform/snapshot")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        String ssId = snapshot_post_response.path("ssId");

        // snapshot을 생성하는 과정이 비동기이기 때문에, 기다리지 않고 테스트를 종료하면, 제대로 snapshot 생성 과정이 중단된다.
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        return ssId;
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationsnapshots_GET_FILE_type() throws JsonProcessingException {
        String ssId = make_snapshot(PrSnapshot.SS_TYPE.URI, PrSnapshot.STORAGE_TYPE.LOCAL);
        given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationsnapshots?projection=listing")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationsnapshots_GET_HDFS_type() throws JsonProcessingException {
        String ssId = make_snapshot(PrSnapshot.SS_TYPE.URI, PrSnapshot.STORAGE_TYPE.HDFS);
        given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationsnapshots?projection=listing")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationsnapshots_Id_GET() throws JsonProcessingException {
        String ssId = make_snapshot(PrSnapshot.SS_TYPE.URI, PrSnapshot.STORAGE_TYPE.LOCAL);
        given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationsnapshots/"+ssId)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationsnapshots_DELETE() throws JsonProcessingException {
        String ssId = make_snapshot(PrSnapshot.SS_TYPE.URI, PrSnapshot.STORAGE_TYPE.LOCAL);

        given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationsnapshots/"+ssId)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationdatasets_POST_makeSnapshot() throws JsonProcessingException {

        String ssId = make_snapshot(PrSnapshot.SS_TYPE.URI, PrSnapshot.STORAGE_TYPE.LOCAL);
        LOGGER.debug("snapshot ID is " + ssId);
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationsnapshot_contents_GET() throws JsonProcessingException {

        File file = new File("src/test/resources/test_dataprep.csv");

        // UPLOAD
        Response upload_response = given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .multiPart("file", file)
                .contentType("multipart/form-data")
                .post("/api/preparationdatasets/upload")
                .then()
                .statusCode(HttpStatus.SC_CREATED)
                .log().all()
                .extract()
                .response();

        String filekey = upload_response.path("filekey");
        String filename = upload_response.path("filename");

        Map<String, Object> dataset_post_body  = Maps.newHashMap();
        dataset_post_body.put("dsName", "file ds1");
        dataset_post_body.put("dsDesc", "dataset with file");
        dataset_post_body.put("dsType", "IMPORTED");
        dataset_post_body.put("importType", "FILE");
        dataset_post_body.put("fileType", "LOCAL");
        dataset_post_body.put("filekey", filekey);
        dataset_post_body.put("filename", filename);
        dataset_post_body.put("custom", "{\"fileType\":\"dsv\",\"delimiter\":\",\"}");
        dataset_post_body.put("dcId", "file dc");

        // CREATE DATASET
        Response dataset_post_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(dataset_post_body)
                .post("/api/preparationdatasets")
                .then()
                .statusCode(HttpStatus.SC_CREATED)
                .log().all()
                .extract()
                .response();

        String importedDsId = dataset_post_response.path("dsId");

        Map<String, Object> dataflow_post_body = Maps.newHashMap();
        dataflow_post_body.put("dfName", "posted_df1");
        dataflow_post_body.put("dfDesc", "posted_df_desc1");

        List<String> datasets = new ArrayList<>();
        datasets.add(dataset_post_response.path("_links.self.href"));
        dataflow_post_body.put("datasets", datasets);

        // CREATE DATAFLOW
        Response dataflow_post_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(dataflow_post_body)
                .post("/api/preparationdataflows")
                .then()
                .statusCode(HttpStatus.SC_CREATED)
                .log().all()
                .extract()
                .response();

        Map<String, Object> transform_post_body = Maps.newHashMap();
        String dfId = dataflow_post_response.path("dfId");
        transform_post_body.put("dfId", dfId);

        // CREATE WRANGLED DATASET
        Response transform_post_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(transform_post_body)
                .post("/api/preparationdatasets/" + importedDsId + "/transform")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        String wrangledDsId = transform_post_response.path("wrangledDsId");

        // LOAD WRANGLED DATASET
        Response transform_get_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationdatasets/" + wrangledDsId + "/transform")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        Map<String, Object> transform_put_body = Maps.newHashMap();
        transform_put_body.put("op", "APPEND");
        transform_put_body.put("ruleString", "rename col: column1 to: 'user_id'");

        // APPEND #1 - RENAME
        Response transform_put_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(transform_put_body)
                .put("/api/preparationdatasets/" + wrangledDsId + "/transform")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        List<Map<String, Object>> ruleStringInfos = transform_put_response.path("ruleStringInfos");
        String jsonRuleString = (String)ruleStringInfos.get(0).get("jsonRuleString");

        transform_put_body.put("op", "APPEND");
        transform_put_body.put("ruleString", "rename col: column2 to: 'birth_day'");

        // APPEND #2 - RENAME
        Response transform_put_response2 = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(transform_put_body)
                .put("/api/preparationdatasets/" + wrangledDsId + "/transform")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        List<Map<String, Object>> ruleStringInfos2 = transform_put_response2.path("ruleStringInfos");

        transform_put_body.put("op", "APPEND");
        transform_put_body.put("ruleString", "split col: birth_day on: '-' limit: 2 quote: '\"' ignoreCase: false");

        // APPEND #3 - SPLIT
        Response transform_put_response3 = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(transform_put_body)
                .put("/api/preparationdatasets/" + wrangledDsId + "/transform")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        List<Map<String, Object>> ruleStringInfos3 = transform_put_response3.path("ruleStringInfos");

        Map<String, Object> snapshot_post_body = Maps.newHashMap();
        snapshot_post_body.put("format", "CSV");
        snapshot_post_body.put("compression", "NONE");
//    snapshot_post_body.put("partKey", "SOME_COLUMN_NAME");  // necessary in hive
        snapshot_post_body.put("profile", true);

        // GENERATE SNAPSHOT
        Response snapshot_post_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(snapshot_post_body)
                .post("/api/preparationdatasets/" + wrangledDsId)
                .then()
                .statusCode(HttpStatus.SC_CREATED)
                .log().all()
                .extract()
                .response();

        String ssId = snapshot_post_response.path("ssId");

        // first call, target means count of rows
        Response snapshot_get_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationsnapshots/" + ssId + "/contents?target=3")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        Integer offset = snapshot_get_response.path("offset");

        // next call
        snapshot_get_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationsnapshots/" + ssId + "/contents?offset="+offset.toString()+"&target=3")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();
    }
}

