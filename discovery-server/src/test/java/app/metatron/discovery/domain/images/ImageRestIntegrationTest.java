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

package app.metatron.discovery.domain.images;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.path.json.JsonPath;
import com.jayway.restassured.response.Response;
import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.jdbc.Sql;

import java.io.File;
import java.net.URI;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;

/**
 * Created by kyungtaak on 2016. 7. 24..
 */
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class ImageRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void uploadImage() throws Exception {

    String itemId = "polaris@sk.com";
    String domain = "user";
    File file = new File("./src/test/resources/images/Ronda-Rousey.png");

    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .multiPart("file", file)
      .formParam("itemId", itemId)
      .formParam("domain", domain)
      .formParam("thumbnailSize", 200)
    .when()
      .post("/api/images/upload");

    String url = res.getHeader("Location");

    URI uri = URI.create(url);

    res.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

    // @formatter:off
    Response imageResult =
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
    .when()
      .get(url);

    imageResult.then()
      .statusCode(HttpStatus.SC_OK)
      .body("itemId", is(itemId))
    .log().all();
    // @formatter:on

    // 업로드한 이미지의 썸네일을 테스트 하려면 Image Entity에 thumbnail 값에 @JsonIgnore 를 제거해주시고
    // 아래 코드 주석을 해제한후 확인 가능합니다.
//    String byteStr = from(imageResult.asString()).get("thumbnail");
//
//    BufferedImage imag= ImageIO.read(new ByteArrayInputStream(Base64.decode(byteStr)));
//    ImageIO.write(imag, "jpg", new File("thumbnail.jpg"));
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  public void searchImageByUrl() throws Exception {

    String itemId = "polaris@sk.com";
    String domain = "user";
    File file = new File("./src/test/resources/images/Ronda-Rousey.png");

    // @formatter:off
    Response res =
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .multiPart("file", file)
      .formParam("itemId", itemId)
      .formParam("domain", domain)
    .when()
      .post("/api/images/upload");

    res.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on

    JsonPath jsonPath = from(res.asString());
    String imgUrl = jsonPath.get("imageUrl");
    String id = jsonPath.get("id");

    // @formatter:off
    Response imageResult =
    given()
      .auth().oauth2(oauth_token)
      .accept("image/*")
      .param("url", imgUrl + "/thumbnail")
    .when()
      .get("/api/images/load/url");

    imageResult.then()
      .statusCode(HttpStatus.SC_NOT_FOUND)
    .log().all();
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept("image/*")
      .param("id", id)
//      .param("thumbnail", true)
    .when()
      .get("/api/images/load/id")
    .then()
      .statusCode(HttpStatus.SC_OK)
    .log().all();
    // @formatter:on

  }

  @Test
//  @Ignore
  public void upload() throws Exception {

    String itemId = "test@sk.com";
    String domain = "user";
    File file = new File("./src/test/resources/images/Ronda-Rousey.png");

    // @formatter:off
    Response res =
    given()
      .accept(ContentType.JSON)
      .multiPart("file", file)
      .formParam("itemId", itemId)
      .formParam("domain", domain)
    .when()
      .post("http://localhost:8180/api/images/upload");

    res.then()
      .statusCode(HttpStatus.SC_CREATED)
    .log().all();
    // @formatter:on
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_image.sql")
  public void getImageByUrl() {
    given()
        .auth().oauth2(oauth_token)
        .accept("image/webp,image/apng,image/*,*/*")
        .param("url", "metatron://images/page/test-item")
    .when()
        .get("/api/images/load/url")
    .then()
        .statusCode(HttpStatus.SC_OK)
        .contentType("image/jpeg")
        .header("Content-Length", Integer::parseInt, equalTo(42947));
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_image.sql")
  public void getImageByUrl_for_thumbnail() {
    given()
        .auth().oauth2(oauth_token)
        .accept("image/webp,image/apng,image/*,*/*")
        .param("url", "metatron://images/page/test-item/thumbnail")
    .when()
        .get("/api/images/load/url")
    .then()
        .statusCode(HttpStatus.SC_OK)
        .contentType("image/jpeg")
        .header("Content-Length", Integer::parseInt, equalTo(15818));
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_image.sql")
  public void getImageByUrl_when_request_header_accept_Media_Type_All_only() {
    given()
        .auth().oauth2(oauth_token)
        .accept("*/*")
        .param("url", "metatron://images/page/test-item")
    .when()
        .get("/api/images/load/url")
    .then()
        .statusCode(HttpStatus.SC_OK)
        .contentType("image/jpeg")
        .header("Content-Length", Integer::parseInt, equalTo(42947));
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"ROLE_SYSTEM_USER", "ROLE_PERM_SYSTEM_WRITE_DATASOURCE"})
  @Sql("/sql/test_image.sql")
  public void getImageByUrl_for_thumbnail_when_request_header_accept_Media_Type_All_only() {
    given()
        .auth().oauth2(oauth_token)
        .accept("*/*")
        .param("url", "metatron://images/page/test-item/thumbnail")
    .when()
        .get("/api/images/load/url")
    .then()
        .statusCode(HttpStatus.SC_OK)
        .contentType("image/jpeg")
        .header("Content-Length", Integer::parseInt, equalTo(15818));
  }
}
