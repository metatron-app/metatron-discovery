/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.user.org;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import com.facebook.presto.jdbc.internal.guava.collect.Lists;
import com.facebook.presto.jdbc.internal.guava.collect.Maps;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.response.Response;
import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.TestExecutionListeners;

import java.util.Map;

import static com.jayway.restassured.RestAssured.given;
import static com.jayway.restassured.path.json.JsonPath.from;

@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class OrganizationRestIntegrationTest extends AbstractRestIntegrationTest {

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  /**
   *
   */
  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void createAndDeleteOrg() {

    Organization organization = new Organization("test org", "test org desc", "ORG001");

    // @formatter:off
    Response createdRes =
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(organization)
    .when()
      .post("/api/organizations");

    createdRes.then()
      .log().all()
      .statusCode(HttpStatus.SC_CREATED);
    // @formatter:on

    String orgCode = from(createdRes.asString()).get("code");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/organizations/{code}", orgCode)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/organizations/{code}", orgCode)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_NO_CONTENT);
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .param("projection", "forDetailView")
    .when()
      .get("/api/organizations/{code}", orgCode)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_NOT_FOUND);
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void addAndDeleteOrgMember() {

    Organization organization = new Organization("test org", "test org desc", "ORG001");

    // @formatter:off
    Response createdRes =
      given()
        .auth().oauth2(oauth_token)
        .contentType(ContentType.JSON)
        .body(organization)
      .when()
        .post("/api/organizations");

    createdRes.then()
        .log().all()
        .statusCode(HttpStatus.SC_CREATED);
    // @formatter:on

    String orgId = from(createdRes.asString()).get("code");

    // add two members
    Map<String, Object> memberAdd1Req1 = Maps.newHashMap();
    memberAdd1Req1.put("memberId", "metatron");
    memberAdd1Req1.put("type", "user");
    memberAdd1Req1.put("op", "add");

    Map<String, Object> memberAdd2Req1 = Maps.newHashMap();
    memberAdd2Req1.put("memberId", "ID_GROUP_GENERAL_USER");
    memberAdd2Req1.put("type", "group");
    memberAdd2Req1.put("op", "add");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(Lists.newArrayList(memberAdd1Req1, memberAdd2Req1))
      .log().all()
    .when()
      .patch("/api/organizations/{id}/members", orgId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_NO_CONTENT);
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/organizations/{id}/members", orgId)
    .then()
      .log().all()
      //.body("_embedded.members", hasSize(1))
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on

    // delete one member
    Map<String, Object> memberRemoveReq2 = Maps.newHashMap();
    memberRemoveReq2.put("memberId", "metatron");
    memberRemoveReq2.put("type", "user");
    memberRemoveReq2.put("op", "remove");

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .body(Lists.newArrayList(memberRemoveReq2))
    .when()
      .put("/api/organizations/{id}/members", orgId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_NO_CONTENT);
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/organizations/{id}/members", orgId)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on

  }

  @Test
  @OAuthRequest(username = "admin", value = {"PERM_SYSTEM_MANAGE_USER"})
  public void initializeDefaultOrganization() {

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .contentType(ContentType.JSON)
    .when()
      .post("/api/organizations/init")
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_NO_CONTENT);
    // @formatter:on

    // @formatter:off
    given()
      .auth().oauth2(oauth_token)
      .accept(ContentType.JSON)
      .contentType(ContentType.JSON)
    .when()
      .get("/api/organizations/{id}/members", Organization.DEFAULT_ORGANIZATION_CODE)
    .then()
      .log().all()
      .statusCode(HttpStatus.SC_OK);
    // @formatter:on
  }


}