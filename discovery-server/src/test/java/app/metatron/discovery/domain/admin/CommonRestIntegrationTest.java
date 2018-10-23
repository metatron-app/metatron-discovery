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

package app.metatron.discovery.domain.admin;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;

import org.apache.commons.io.FileUtils;
import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.assertj.core.api.Assertions.assertThat;

@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class CommonRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void downloadManual() throws IOException {

    // @formatter:off
    Response fileRes = given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept("application/pdf")
//      .param("lang", "ko")
      .log().all()
    .when()
      .get("/api/common/manual/download");
    fileRes.then()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on

    InputStream is = fileRes.getBody().asInputStream();

    FileUtils.copyInputStreamToFile(is, new File("/tmp/manual.pdf"));
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER"})
  public void uploadTempFile() {
    // given
    final File file = new File(getClass().getClassLoader().getResource("test.csv").getPath());

    // REST when
    Response response =
        given()
            .auth().oauth2(oauth_token)
            .multiPart("file", file)
        .when()
            .post("/api/common/file")
        .then()
            .log().all()
            .statusCode(HttpStatus.SC_OK)
        .extract().response();

    // then
    Map<String, String> map = from(response.asString()).get();
    assertThat(Files.exists(Paths.get(map.get("filePath")))).isTrue();
  }
}
