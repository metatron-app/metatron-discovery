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

package app.metatron.discovery.domain.datasource.data;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;

/**
 * Created by kyungtaak on 2016. 9. 1..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class DataQueryHistoryRestInegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @Sql({"/sql/query_history.sql"})
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void findQueryHistories() throws Exception {
    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
//      .param("queryType", "SEARCH")
      .param("succeed", "false")
      .param("page", "0")
      .param("size", "5")
      .param("sort", "elapsedTime,desc")
      .log().body()
    .when()
      .get("/api/datasources/{id}/query/histories", "ds-37")
    .then()
//      .statusCode(HttpStatus.SC_OK)
      .log().body();
    // @formatter:on
  }

  @Test
  @Sql({"/scripts/default.sql","/sql/query_history.sql"})
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void findQueryHistoriesSearch() throws Exception {
    // @formatter:off
    given()
      .auth().oauth2("token")
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("succeed", "true")
      .param("queryType", "SEARCH")
      .param("startTime", "2016-09-01T03:00:00.0Z")
      .param("endTime", "2016-09-01T06:00:00.0Z")
      .param("queryType", "SEARCH")
      .param("page", "0")
      .param("size", "10")
    .when()
      .get("/api/datasources/{id}/query/histories/search", "ds-37")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().body();
    // @formatter:on
  }

  @Test
  @Sql({"/scripts/default.sql","/sql/query_history.sql"})
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void findByQueryCountPerHour() throws Exception {

    // @formatter:off
    given()
      .auth().oauth2("token")
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("duration", "-P1D")
    .when()
      .get("/api/datasources/{id}/query/histories/stats/count", "ds-37")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().body();
    // @formatter:on
  }

  @Test
  @Sql({"/scripts/default.sql","/sql/query_history.sql"})
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void findByQueryCountPerUser() throws Exception {

    // @formatter:off
    given()
      .auth().oauth2("token")
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("duration", "-P1D")
    .when()
      .get("/api/datasources/{id}/query/histories/stats/user", "ds-37")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().body();
    // @formatter:on
  }

  @Test
  @Sql({"/scripts/default.sql","/sql/query_history.sql"})
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void findByQueryCountPerElapsed() throws Exception {

    // @formatter:off
    given()
      .auth().oauth2("token")
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("duration", "-P1D")
    .when()
      .get("/api/datasources/{id}/query/histories/stats/elapsed", "ds-37")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().body();
    // @formatter:on
  }

  @Test
  @Sql({"/scripts/default.sql","/sql/query_history.sql"})
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void findByAvgSizePerHour() throws Exception {

    // @formatter:off
    given()
      .auth().oauth2("token")
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .param("duration", "-P1D")
    .when()
      .get("/api/datasources/{id}/histories/size/stats/hour", "ds-37")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .log().body();
    // @formatter:on
  }

}
