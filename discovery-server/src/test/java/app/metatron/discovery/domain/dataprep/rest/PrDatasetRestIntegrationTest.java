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

import com.facebook.presto.jdbc.internal.guava.collect.Maps;
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

import static com.jayway.restassured.RestAssured.given;

/**
 * Created by kaypark on 2017. 6. 29..
 */
@ActiveProfiles("dataprep")
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class PrDatasetRestIntegrationTest extends AbstractRestIntegrationTest {

    private static final Logger LOGGER = LoggerFactory.getLogger(PrDatasetRestIntegrationTest.class);

    @Value("${local.server.port}")
    private int serverPort;

    @Before
    public void setUp() {
        RestAssured.port = serverPort;
    }

    public List<String> file_upload() {
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

        List<String> ret = new ArrayList<String>();
        ret.add(0,filekey);
        ret.add(1,filename);

        return ret;
    }

    public String make_dataset_withoutDf() {
        List<String> ret = file_upload();
        String filekey=ret.get(0);
        String filename=ret.get(1);

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

        return importedDsId;
    }

    public String make_dataset() {
        List<String> ret = file_upload();
        String filekey=ret.get(0);
        String filename=ret.get(1);

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

        return importedDsId;
    }

    public String make_dataset_with_db() {
        Map<String, Object> connection  = Maps.newHashMap();
        connection.put("implementor","HIVE");
        connection.put("hostname","localhost");
        connection.put("port",9000);
        connection.put("type","JDBC");
        connection.put("name","Hive DataConnection");
        connection.put("username","hive");
        connection.put("password","hive1234");
        Response createResponse = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(connection)
                .post("/api/connections")
                .then()
                .statusCode(HttpStatus.SC_CREATED)
                .log().all()
                .extract()
                .response();

        String dcId = createResponse.path("id");

        Map<String, Object> dataset_post_body  = Maps.newHashMap();
        dataset_post_body.put("dsName", "db ds");
        dataset_post_body.put("dsDesc", "dataset with db type");
        dataset_post_body.put("dsType", "IMPORTED");
        dataset_post_body.put("importType", "DB");
        dataset_post_body.put("rsType", "TABLE");
        dataset_post_body.put("custom", "");
        dataset_post_body.put("dcId", dcId);

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

        return importedDsId;
    }

    public String make_dataset_with_hive() {
        Map<String, Object> connection  = Maps.newHashMap();
        connection.put("implementor","HIVE");
        connection.put("hostname","localhost");
        connection.put("port",9000);
        connection.put("type","JDBC");
        connection.put("name","Hive DataConnection");
        connection.put("username","hive");
        connection.put("password","hive1234");
        Response createResponse = given()
                .auth()
                .oauth2(oauth_token)
                .contentType(ContentType.JSON)
                .accept(ContentType.JSON)
                .when()
                .content(connection)
                .post("/api/connections")
                .then()
                .statusCode(HttpStatus.SC_CREATED)
                .log().all()
                .extract()
                .response();

        String dcId = createResponse.path("id");

        Map<String, Object> dataset_post_body  = Maps.newHashMap();
        dataset_post_body.put("dsName", "hive ds");
        dataset_post_body.put("dsDesc", "dataset with hive type");
        dataset_post_body.put("dsType", "IMPORTED");
        dataset_post_body.put("importType", "HIVE");
        dataset_post_body.put("rsType", "TABLE");
        dataset_post_body.put("tableName", "test");
        dataset_post_body.put("custom", "");
        dataset_post_body.put("dcId", dcId);

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

        return importedDsId;
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    //@Sql("/sql/test_dataprep.sql")
    public void preparationdatasets_GET() throws JsonProcessingException {
        String dsId=make_dataset();
        given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationdatasets?projection=listing")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationdatasets_fileupload_POST() throws JsonProcessingException {
        List<String> ret = file_upload();
        String filekey=ret.get(0);
        String filename=ret.get(1);

        LOGGER.debug("file key is "+filekey+ " and original file name is "+ filename);
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationdatasets_POST() throws JsonProcessingException {
        String dsId=make_dataset();
        LOGGER.debug("dataset ID is "+dsId);
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationdatasets_with_file_POST() throws JsonProcessingException {
        String dsId=make_dataset();
        LOGGER.debug("dataset ID is "+dsId);
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationdatasets_with_db_POST() throws JsonProcessingException {
        String dsId=make_dataset_with_db();
        LOGGER.debug("dataset ID is "+dsId);
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationdatasets_with_hive_POST() throws JsonProcessingException {
        String dsId=make_dataset_with_hive();
        LOGGER.debug("dataset ID is "+dsId);
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationdatasets_DELETE() throws JsonProcessingException {
        String dsId=make_dataset();
        given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .delete("/api/preparationdatasets/"+dsId)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();

        dsId=make_dataset();
        given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .delete("/api/preparationdatasets/"+dsId)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();
    }

    @Test
    @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
    public void preparationdatasets_previewLine_GET() throws JsonProcessingException {

        String dsId= make_dataset();


        given()
                .auth()
                .oauth2(oauth_token)
                .accept(ContentType.JSON)
                .when()
                .get("/api/preparationdatasets/"+dsId+"/previewLines")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .log().all();
    }
}
