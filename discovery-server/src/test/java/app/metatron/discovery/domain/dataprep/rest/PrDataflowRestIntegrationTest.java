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
import app.metatron.discovery.domain.dataprep.PrepParamDatasetIdList;
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

import static com.jayway.restassured.RestAssured.given;

/**
 * Created by jhkim on 2017. 6. 27..
 */
@ActiveProfiles("dataprep")
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class PrDataflowRestIntegrationTest extends AbstractRestIntegrationTest {

  private static final Logger LOGGER = LoggerFactory.getLogger(PrDataflowRestIntegrationTest.class);

  @Value("${local.server.port}")
  private int serverPort;

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }
  public List<String> make_dataflow_with_twoDs() {

    Response dataset_post_response = make_dataset();
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
    List<String> ret = new ArrayList<String>();
    ret.add(0,dfId);
    ret.add(1,importedDsId);
    ret.add(2,wrangledDsId);
    return ret;
  }

  public Response make_dataset() {
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

    Map<String, Object> dataset_post_body  = Maps.newHashMap();

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

  public String make_dataflow() {
    Response dataset_post_response = make_dataset();

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

    String dfId = dataflow_post_response.path("dfId");

    return dfId;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  //@Sql("/sql/test_dataprep.sql")
  public void preparationdataflows_GET() throws JsonProcessingException {
    make_dataflow();

    given()
      .auth()
      .oauth2(oauth_token)
      .accept(ContentType.JSON)
      .when()
      .get("/api/preparationdataflows")
      .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  //@Sql("/sql/test_dataprep.sql")
  public void preparationdataflows_dfId_GET() throws JsonProcessingException {
    String dfId = make_dataflow();

    given()
      .auth()
      .oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .when()
      .get("/api/preparationdataflows/"+dfId+"?projection=detail")
      .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  //@Sql("/sql/test_dataprep.sql")
  public void preparationdataflows_POST() throws JsonProcessingException {
    String dfId = make_dataflow();
    LOGGER.debug("dataflow ID is "+dfId);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  //@Sql("/sql/test_dataprep.sql")
  public void preparationdataflows_PATCH() throws JsonProcessingException {

    String dfId = make_dataflow();

    Response response = given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId+"?projection=detail")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all()
            .extract()
            .response();

    String dfName = response.path("dfName");
    String dfDesc = response.path("dfDesc");

    Map<String, Object> body = Maps.newHashMap();
    if(dfName!=null) {
      body.put("dfName", dfName + " patched");
    }
    if(dfDesc!=null) {
      body.put("dfDesc", dfDesc + " patched");
    }

    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .content(body)
            .patch("/api/preparationdataflows/"+dfId)
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  //@Sql("/sql/test_dataprep.sql")
  public void preparationdataflows_add_dataset_POST() throws JsonProcessingException {

    String dfId = make_dataflow();

    Response dataset_post_response = make_dataset();
    String dsId = dataset_post_response.path("dsId");

    // add dataset
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .post("/api/preparationdataflows/"+dfId+"/add/"+dsId)
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

    // after add
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId+"?projection=detail")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  //@Sql("/sql/test_dataprep.sql")
  public void preparationdataflows_add_datasets_POST() throws JsonProcessingException {

    String dfId = make_dataflow();

    // before add
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId+"?projection=detail")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

    PrepParamDatasetIdList param = new PrepParamDatasetIdList();

    Response dataset_post_response = make_dataset();
    param.getDsIds().add(dataset_post_response.path("dsId"));

    Response dataset_post_response2 = make_dataset();
    param.getDsIds().add(dataset_post_response2.path("dsId"));

    // add dataset
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .content(param)
            .post("/api/preparationdataflows/"+dfId+"/add_datasets")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

    // after add
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId+"?projection=detail")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  //@Sql("/sql/test_dataprep.sql")
  public void preparationdataflows_update_datasets_POST() throws JsonProcessingException {

    String dfId = make_dataflow();

    // before add
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId+"?projection=detail")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

    PrepParamDatasetIdList param = new PrepParamDatasetIdList();

    Response dataset_post_response = make_dataset();
    param.getDsIds().add(dataset_post_response.path("dsId"));

    Response dataset_post_response2 = make_dataset();
    String willBeRemovedDsId = dataset_post_response2.path("dsId");
    param.getDsIds().add(willBeRemovedDsId);

    // add dataset
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .content(param)
            .post("/api/preparationdataflows/"+dfId+"/add_datasets")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

    // after add
    Response flow = given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId+"/datasets")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all()
            .extract()
            .response();

    Response dataset_post_response3 = make_dataset();
    String willBeAddedDsId = dataset_post_response3.path("dsId");

    List<String> dsIds = param.getDsIds();
    dsIds.clear();
    dsIds.add( flow.path("_embedded.preparationdatasets[0].dsId") );
    dsIds.add( flow.path("_embedded.preparationdatasets[1].dsId") );
    dsIds.add( willBeAddedDsId );

    // add dataset
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .content(param)
            .put("/api/preparationdataflows/"+dfId+"/update_datasets")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  //@Sql("/sql/test_dataprep.sql")
  public void preparationdataflows_delete_datasets_DELETE() throws JsonProcessingException {

    List<String> ret = make_dataflow_with_twoDs();

    String dfId=ret.get(0);
    String importedDsId=ret.get(1);
    String wrangledDsId=ret.get(2);

    PrepParamDatasetIdList param = new PrepParamDatasetIdList();
    param.getDsIds().add(wrangledDsId);
    param.getDsIds().add(importedDsId);

    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId+"?projection=detail")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();


    // delete dataset
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .content(param)
            .delete("/api/preparationdataflows/"+dfId+"/remove_datasets")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

    // after delete
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId+"?projection=detail")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  //@Sql("/sql/test_dataprep.sql")
  public void preparationdataflows_delete_dataset_DELETE() throws JsonProcessingException {

    List<String> ret = make_dataflow_with_twoDs();

    String dfId=ret.get(0);
    String importedDsId=ret.get(1);
    String wrangledDsId=ret.get(2);

    // before delete
    given()

            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId+"?projection=detail")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .delete("/api/preparationdataflows/"+dfId+"/datasets/"+wrangledDsId)
            .then()
            .statusCode(HttpStatus.SC_NO_CONTENT)
            .log().all();

    // after delete
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId+"?projection=detail")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  //@Sql("/sql/test_dataprep.sql")
  public void preparationdataflows_DELETE() throws JsonProcessingException {

    List<String> ret = make_dataflow_with_twoDs();

    String dfId=ret.get(0);
    String importedDsId=ret.get(1);
    String wrangledDsId=ret.get(2);

    // before delete
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId)
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .delete("/api/preparationdataflows/"+dfId)
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all();

    // after delete
    given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .get("/api/preparationdataflows/"+dfId)
            .then()
            .statusCode(HttpStatus.SC_INTERNAL_SERVER_ERROR)
            .log().all()
            .extract()
            .response();
  }
}
