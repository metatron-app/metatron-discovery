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

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.dataprep.PrepSnapshotRequestPost;
import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import com.facebook.presto.jdbc.internal.jackson.core.JsonProcessingException;
import com.google.common.collect.Maps;
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

    public List<String> file_upload() {
        File file = new File("src/test/resources/test_dataprep.csv");

        // UPLOAD GET
        Response upload_get_response = given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationdatasets/file_upload")
                .then()
                .statusCode(HttpStatus.SC_CREATED)
                .log().all()
                .extract()
                .response();
        String upload_id = upload_get_response.path("upload_id");

        String params = String.format( "?name=%s&upload_id=%s&chunk=%d&chunks=%d&storage_type=%s&chunk_size=%d&total_size=%d",
                file.getName(), upload_id, 0, 1, "LOCAL", file.length(), file.length());
        // UPLOAD POST
        Response upload_response = given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .multiPart("file", file)
                .contentType("multipart/form-data")
                .post("/api/preparationdatasets/file_upload" + params)
                .then()
                .statusCode(HttpStatus.SC_CREATED)
                .log().all()
                .extract()
                .response();

        String filenameBeforeUpload = upload_response.path("filenameBeforeUpload");
        String storedUri = upload_response.path("storedUri");

        List<String> ret = new ArrayList<String>();
        ret.add(0,filenameBeforeUpload);
        ret.add(1,storedUri);

        return ret;
    }

    public Response make_dataset() {
        List<String> ret = file_upload();
        String filenameBeforeUpload = ret.get(0);
        String storedUri = ret.get(1);

        Map<String, Object> dataset_post_body = Maps.newHashMap();
        dataset_post_body.put("dsName", "file ds1");
        dataset_post_body.put("dsDesc", "dataset with file");
        dataset_post_body.put("dsType", "IMPORTED");
        dataset_post_body.put("delimiter", ",");
        dataset_post_body.put("importType", "UPLOAD");
        dataset_post_body.put("fileFormat", "CSV");
        dataset_post_body.put("filenameBeforeUpload", filenameBeforeUpload);
        dataset_post_body.put("storageType", "LOCAL");
        dataset_post_body.put("storedUri", storedUri);

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
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        String importedDsId = dataset_post_response.path("dsId");

        return dataset_post_response;
    }

    public Response make_dataflow(Response dataset_post_response) {
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
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        Map<String, Object> transform_post_body = Maps.newHashMap();
        String dfId = dataflow_post_response.path("dfId");
        transform_post_body.put("dfId", dfId);

        return dataflow_post_response;
    }

    public String make_snapshot(int limitSec) {
        Response dataset_post_response = make_dataset();
        String importedDsId = dataset_post_response.path("dsId");

        Response dataflow_post_response = make_dataflow(dataset_post_response);

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

        Response config_get_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationdatasets/" + wrangledDsId + "/transform/configuration")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        String ssName = config_get_response.path("ss_name");
        String storedUri = config_get_response.path("file_uri.LOCAL");

        Map<String, Object> transform_snapshot_request = Maps.newHashMap();
        transform_snapshot_request.put("ssName", ssName);
        transform_snapshot_request.put("ssType", "URI");
        transform_snapshot_request.put("storedUri", storedUri);
        transform_snapshot_request.put("uriFileFormat", "CSV");
        transform_snapshot_request.put("engine", "EMBEDDED");

        Response transform_snapshot_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(transform_snapshot_request)
                .post("/api/preparationdatasets/" + wrangledDsId + "/transform/snapshot")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        String ssId = transform_snapshot_response.path("ssId");

        // Wait for limit seconds.
        try {
            Thread.sleep(limitSec * 1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        Response snapshot_get_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(transform_snapshot_request)
                .get("/api/preparationsnapshots/" + ssId)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all()
                .extract()
                .response();

        assert snapshot_get_response.path("status").equals("SUCCEEDED") : snapshot_get_response;
        return snapshot_get_response.path("ssId");
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationsnapshots_GET_FILE_type() throws JsonProcessingException {
        String ssId = make_snapshot(5);
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
        String ssId = make_snapshot(5);
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
        String ssId = make_snapshot(5);
        given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationsnapshots/"+ssId)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();

        LOGGER.debug("snapshot ID is " + ssId);
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationsnapshots_DELETE() throws JsonProcessingException {
        String ssId = make_snapshot(5);

        given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .delete("/api/preparationsnapshots/"+ssId)
                .then()
                .statusCode(HttpStatus.SC_NO_CONTENT)
                .log().all();
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationdatasets_POST_makeSnapshot() throws JsonProcessingException {

        String ssId = make_snapshot(5);
        LOGGER.debug("snapshot ID is " + ssId);
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationsnapshot_contents_GET() throws JsonProcessingException {

        String ssId = make_snapshot(5);

        // first call, target means count of rows
        Response snapshot_get_response = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationsnapshots/" + ssId + "/contents?offset=0&target=3")
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

