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

import static com.jayway.restassured.RestAssured.given;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.dataprep.entity.PrDataset;
import app.metatron.discovery.domain.dataprep.entity.PrDataset.DS_TYPE;
import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.facebook.presto.jdbc.internal.jackson.core.JsonProcessingException;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestExecutionListeners;

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

  public static List<String> file_upload_static(String oauth_token, String pathName) {
    pathName = pathName != null ? pathName : "src/test/resources/test_dataprep.csv";

    File file = new File(pathName);

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

    String params = String.format(
        "?name=%s&upload_id=%s&chunk=%d&chunks=%d&storage_type=%s&chunk_size=%d&total_size=%d",
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
    ret.add(0, filenameBeforeUpload);
    ret.add(1, storedUri);

    return ret;
  }


  public List<String> file_upload() {
    return file_upload_static(oauth_token, null);
  }

  public String make_dataset_withoutDf() {
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

    return importedDsId;
  }

  // returns dataflow create response as map
  public static Map<String, Object> make_dataset_static(String oauth_token, String path,
      String dsName, String dsDesc) {
    List<String> ret = file_upload_static(oauth_token, path);
    String filenameBeforeUpload = ret.get(0);
    String storedUri = ret.get(1);

    dsName = dsName != null ? dsName : "file ds1";
    dsDesc = dsDesc != null ? dsDesc : "dataset with file";

    Map<String, Object> dataset_post_body = Maps.newHashMap();
    dataset_post_body.put("dsName", dsName);
    dataset_post_body.put("dsDesc", dsDesc);
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

        /*
         * "response_map":
         *   "dfId" : "d7108a9e-8be2-43cb-806c-c21c28d8b9ba"
         *   "dfDesc" : "posted_df_desc1"
         *   "createdBy" : " size = 4"
         *   "importedDsCount" : "1"
         *   "createdTime" : "2019-06-24T10:38:36.026Z"
         *   "datasets" : [
         *     "dsId" -> "ab621d39-a6e7-4dff-bfc6-ca77c1edc136"
         *     "dsName" -> "DEFAULT_LINEAGE_MAP"
         *     "dsType" -> "IMPORTED"
         *     "storedUri" -> "file:///dataprep/uploads/17253834-3afe-470a-a8e2-9d9e8a616b16.csv"
         */

    Map<String, Object> dataflow_post_response_map = dataflow_post_response.jsonPath().get();
    return dataflow_post_response_map;
  }

  public String make_dataset() {
    Map<String, Object> response = make_dataset_static(oauth_token,
        "src/test/resources/test_dataprep.csv",
        null, null);
    List<PrDataset> datasets = (List<PrDataset>) response.get("datasets");
    for (PrDataset dataset : datasets) {
      if (dataset.getDsType() == DS_TYPE.IMPORTED) {
        return dataset.getDsId();
      }
    }
    assert false : response;
    return null;
  }

  public String make_dataset_with_db() {
    Map<String, Object> connection = Maps.newHashMap();
    connection.put("implementor", "HIVE");
    connection.put("hostname", "localhost");
    connection.put("port", 10000);
    connection.put("type", "JDBC");
    connection.put("name", "Hive DataConnection");
    connection.put("username", "hive");
    connection.put("password", "hive");
    connection.put("published", true);
    connection.put("authenticationType", "MANUAL");
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

    Response getResponse = given()
        .auth()
        .oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .accept(ContentType.JSON)
        .when()
        .content(connection)
        .get("/api/connections/" + dcId)
        .then()
        .statusCode(HttpStatus.SC_OK)
        .log().all()
        .extract()
        .response();

    Map<String, Object> dataset_post_body = Maps.newHashMap();
    dataset_post_body.put("dsName", "db ds");
    dataset_post_body.put("dsDesc", "dataset with db type");
    dataset_post_body.put("dsType", "IMPORTED");
    dataset_post_body.put("importType", "DATABASE");
    dataset_post_body.put("custom", "");
    dataset_post_body.put("dcId", dcId);
    dataset_post_body.put("rsType", "TABLE");
    dataset_post_body.put("dbName", "default");
    dataset_post_body.put("queryStmt", "select * from default.snapshot1");
    dataset_post_body.put("tblName", "snapshot1");

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

    return importedDsId;
  }

  public String make_dataset_with_hive() {
    Map<String, Object> connection = Maps.newHashMap();
    connection.put("implementor", "HIVE");
    connection.put("hostname", "localhost");
    connection.put("port", 9000);
    connection.put("type", "JDBC");
    connection.put("name", "Hive DataConnection");
    connection.put("username", "hive");
    connection.put("password", "hive1234");
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

    Map<String, Object> dataset_post_body = Maps.newHashMap();
    dataset_post_body.put("dsName", "hive ds");
    dataset_post_body.put("dsDesc", "dataset with hive type");
    dataset_post_body.put("dsType", "IMPORTED");
    dataset_post_body.put("importType", "STAGING_DB");
    dataset_post_body.put("custom", "");
    dataset_post_body.put("dcId", dcId);
    dataset_post_body.put("rsType", "TABLE");
    dataset_post_body.put("dbName", "default");
    dataset_post_body.put("queryStmt", "select * from default.snapshot1");
    dataset_post_body.put("tblName", "snapshot1");

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

    return importedDsId;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  //@Sql("/sql/test_dataprep.sql")
  public void preparationdatasets_GET() throws JsonProcessingException {
    String dsId = make_dataset();
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
    String filekey = ret.get(0);
    String filename = ret.get(1);

    LOGGER.debug("file key is " + filekey + " and original file name is " + filename);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void preparationdatasets_POST() throws JsonProcessingException {
    String dsId = make_dataset();
    LOGGER.debug("dataset ID is " + dsId);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void preparationdatasets_with_file_POST() throws JsonProcessingException {
    String dsId = make_dataset();
    LOGGER.debug("dataset ID is " + dsId);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void preparationdatasets_with_db_POST() throws JsonProcessingException {
    // If the connection parameters in make_dataset_with_db() are correct, uncomment and test it.
        /*
        String dsId=make_dataset_with_db();
        LOGGER.debug("dataset ID is "+dsId);
        */
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void preparationdatasets_with_hive_POST() throws JsonProcessingException {
    // If the connection parameters in make_dataset_with_hive() are correct, uncomment and test it.
        /*
        String dsId=make_dataset_with_hive();
        LOGGER.debug("dataset ID is "+dsId);
        */
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void preparationdatasets_DELETE() throws JsonProcessingException {
    String dsId = make_dataset();
    given()
        .auth()
        .oauth2(oauth_token)
        .accept(ContentType.JSON)
        .when()
        .delete("/api/preparationdatasets/" + dsId)
        .then()
        .statusCode(HttpStatus.SC_OK)
        .log().all();

    dsId = make_dataset();
    given()
        .auth()
        .oauth2(oauth_token)
        .accept(ContentType.JSON)
        .when()
        .delete("/api/preparationdatasets/" + dsId)
        .then()
        .statusCode(HttpStatus.SC_OK)
        .log().all();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void preparationdatasets_previewLine_GET() throws JsonProcessingException {

    String dsId = make_dataset();

    Response dataset_post_response = given()
        .auth()
        .oauth2(oauth_token)
        .accept(ContentType.JSON)
        .when()
        .get("/api/preparationdatasets/" + dsId + "?preview=true")
        .then()
        .statusCode(HttpStatus.SC_OK)
        .log().all()
        .extract()
        .response();

    Map<String, Object> previewLines = dataset_post_response.path("gridResponse");
    LOGGER.debug(previewLines.toString());
  }
}
