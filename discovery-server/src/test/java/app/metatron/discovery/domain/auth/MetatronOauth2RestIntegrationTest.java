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

package app.metatron.discovery.domain.auth;

import com.jayway.restassured.RestAssured;
import com.jayway.restassured.response.Response;

import org.junit.Before;
import org.junit.Test;

import app.metatron.discovery.AbstractRestIntegrationTest;

import static com.jayway.restassured.RestAssured.given;

public class MetatronOauth2RestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  @Test
  public void grantsAccessToken() {
    Response response =
      given()
            //                   headerer(new Header("Authorization", "Basic " + this.clientBasicAuthCredentials)).
         .queryParam("username", "admin")
         .queryParam("password", "admin1")
         .queryParam("client_id", "polaris_trusted")
         .queryParam("client_secret", "secret")
         .queryParam("grant_type", "password")
         .queryParam("scope", "read write")
       .when()
         .post("/oauth/token");

    response.then().log().all();

//    Assert.assertEquals("bearer", response.getBody().jsonPath().getString("token_type"));
//    Assert.assertEquals("foobar_scope", response.getBody().jsonPath().getString("scope"));
//    Assert.assertEquals("eyJhbGciOiJIUzI1NiJ9",
//                        response.getBody().jsonPath().getString("access_token").split("[.]")[0]);
  }
}
