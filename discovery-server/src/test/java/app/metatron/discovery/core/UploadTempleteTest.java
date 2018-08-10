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

package app.metatron.discovery.core;

import com.jayway.restassured.RestAssured;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;

import java.io.File;

import static com.jayway.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;

/**
 * Created by kyungtaak on 2016. 5. 8..
 */

public class UploadTempleteTest {

  @Before
  public void setUp() {
    RestAssured.port = 8180;
  }

  @Test
  public void uploadAndSaveBinary() throws Exception {

    String binName = "model-manager-test binary";

    // 파일이 위치한 절대 혹은 상대 경로를 입력해주세요.
    File file = new File("./src/main/resources/modelmanager-test1-1.0-SNAPSHOT.jar");

    // @formatter:off
    given()
      .multiPart("file", file)
      .formParam("name", binName)
    .when()
      // 호스트 명은 변경해주세요
      .post("http://localhost:8180/api/binaries/upload")
    .then()
      .statusCode(HttpStatus.SC_OK)
      .body("name", is(binName))
    .log().all();
    // @formatter:on
  }
}
