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

package app.metatron.discovery.domain.scheduling;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;

/**
 * Created by kyungtaak on 2016. 8. 15..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class SchedulingControllerRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void findAll() throws Exception {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/jobs")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void findByKey() throws Exception {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .param("group", "check")
      .contentType(ContentType.JSON)
    .when()
      .get("/api/jobs/search/key")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all();
    // @formatter:on
  }

}
