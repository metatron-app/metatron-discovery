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

package app.metatron.discovery.domain.workspace;

import com.google.common.collect.Maps;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.restassured.RestAssured;
import com.jayway.restassured.builder.RequestSpecBuilder;
import com.jayway.restassured.http.ContentType;
import com.jayway.restassured.specification.RequestSpecification;

import org.apache.http.HttpStatus;
import org.junit.Before;
import org.junit.FixMethodOrder;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.restdocs.JUnitRestDocumentation;

import java.util.Map;

import app.metatron.discovery.AbstractRestIntegrationTest;

import static com.jayway.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.springframework.restdocs.hypermedia.HypermediaDocumentation.halLinks;
import static org.springframework.restdocs.hypermedia.HypermediaDocumentation.linkWithRel;
import static org.springframework.restdocs.hypermedia.HypermediaDocumentation.links;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.pathParameters;
import static org.springframework.restdocs.request.RequestDocumentation.requestParameters;
import static org.springframework.restdocs.restassured.RestAssuredRestDocumentation.document;
import static org.springframework.restdocs.restassured.RestAssuredRestDocumentation.documentationConfiguration;

/**
 * Created by kyungtaak on 2016. 4. 6..
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class WorkspaceRestDocumentation extends AbstractRestIntegrationTest {

  @Value("${local.server.port}")
  private int serverPort;

  @Rule
  public final JUnitRestDocumentation restDocumentation = new JUnitRestDocumentation("target/generated-snippets");

  @Autowired
  private WorkspaceRepository workspaceRepository;

  @Autowired
  private ObjectMapper objectMapper;


  private RequestSpecification documentationSpec;


  @Before
  public void setUp() {
    RestAssured.port = serverPort;

    this.documentationSpec = new RequestSpecBuilder()
            .addFilter(documentationConfiguration(this.restDocumentation))
            .build();
  }

  @Test
  public void a_workspaceList() throws Exception {

    // @formatter:off
    given(this.documentationSpec)
      .contentType(ContentType.JSON)
      .filter(document("workspace-list",
              links( halLinks(),
                linkWithRel("self").description("This <<resources-workspace,workspace>>"),
                linkWithRel("profile").description("The ALPS profile for the service"),
                linkWithRel("search").description("Link to the workbook search resource")
              ),
              responseFields(
                fieldWithPath("_embedded.workspaces").description("An array of <<resources-workspace, Workspace resources>>"),
                fieldWithPath("_links").description("<<resources-workspace-links,Links>> to other resources"),
                fieldWithPath("page").description("The page infomation")
              ))
            )
    .when()
      .get("/api/workspaces")
    .then()
      .assertThat().statusCode(is(200));
    // @formatter:on
  }

  @Test
  public void b_workspaceSearchPrivate() throws Exception {

    // user.sql 내 데이터 기반 구성
    // Worksapce Id -> "2"
    String userId = "polaris";

    // @formatter:off
    given(this.documentationSpec)
      .filter(document("workspace-search-private",
        requestParameters(
          parameterWithName("userId").description("The workspaces's owner ID")),
        responseFields(
          fieldWithPath("id").description("The workspaces's description"),
          fieldWithPath("name").description("The workspaces's name"),
          fieldWithPath("description").description("The workspaces's description"),
          fieldWithPath("ownerId").description("The workspaces's description"),
          fieldWithPath("publicType").description("The workspace's public type(PRIVATE/SHARED)"),
          fieldWithPath("sharedTagets").description("The workspaces's description"),
          fieldWithPath("createdBy").description("The workspaces's description"),
          fieldWithPath("createdTime").description("The workspaces's description"),
          fieldWithPath("modifiedBy").description("The workspaces's description"),
          fieldWithPath("modifiedTime").description("The workspaces's description"),
          fieldWithPath("_embedded").description("The workspaces's description"),
          fieldWithPath("_links").description("The workspaces's description")
        )
      ))
      .contentType(ContentType.JSON)
      .param("userId", userId)
    .when()
      .get("/api/workspaces/search/private")
    .then()
      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.workspaces", hasSize(2));
    .log().all();
    // @formatter:on
  }

  @Test
  public void c_workspaceSearchShared() throws Exception {

    // user.sql 내 데이터 기반 구성
    // Worksapce Id -> "2"
    String userId = "polaris";

    // @formatter:off
    given(this.documentationSpec)
      .filter(document("workspace-search-shared",
        requestParameters(
          parameterWithName("userId").description("The workspaces's owner ID")),
        responseFields(
          fieldWithPath("_embedded.workspaces[]").description("Result of searching shared workspaces"),
          fieldWithPath("_links").description("Self Links"),
          fieldWithPath("page").description("Page infomation.")
        )
      ))
      .contentType(ContentType.JSON)
      .param("userId", userId)
    .when()
      .get("/api/workspaces/search/shared")
    .then()
      .statusCode(HttpStatus.SC_OK)
//      .body("_embedded.workspaces", hasSize(2));
    .log().all();
    // @formatter:on
  }


  @Test
  public void d_workspaceCreate() throws Exception {

    Workspace testWorkspace1 = new WorkspaceBuilder()
            .name("My Workspace")
            .description("My workspace is Best!")
            .build();

    // @formatter:off
    given(this.documentationSpec)
      .filter(document("workspace-create",
//        requestParameters(
//          parameterWithName("name").description("The workspaces's name"),
//          parameterWithName("description").description("The workspaces's description")),
        responseFields(
          fieldWithPath("id").description("The workspaces's description"),
          fieldWithPath("name").description("The workspaces's name"),
          fieldWithPath("description").description("The workspaces's description"),
          fieldWithPath("ownerId").description("The workspaces's description"),
          fieldWithPath("publicType").description("The workspace's public type(PRIVATE/SHARED)"),
          fieldWithPath("sharedTagets").description("The workspaces's description"),
          fieldWithPath("createdBy").description("The workspaces's description"),
          fieldWithPath("createdTime").description("The workspaces's description"),
          fieldWithPath("modifiedBy").description("The workspaces's description"),
          fieldWithPath("modifiedTime").description("The workspaces's description"),
          fieldWithPath("_links").description("The workspaces's description")
        )
      ))
      .body(this.objectMapper.writeValueAsString(testWorkspace1))
      .contentType(ContentType.JSON)

    .when()
      .post("/api/workspaces")
    .then()
      .assertThat().statusCode(is(201));
    // @formatter:on
  }

  @Test
  public void e_workspaceGetOne() throws Exception {

    // @formatter:off
    given(this.documentationSpec)
      .contentType(ContentType.JSON)
      .filter(document("workspace-retrieve",
              pathParameters(
                parameterWithName("id").description("The workspace's id")),
              links( halLinks(),
                linkWithRel("self").description("This <<resources-workspace,workspace>>"),
                linkWithRel("workspace").description("Link to the workbook resource"),
                linkWithRel("workBooks").description("Link to the workbook resource"),
                linkWithRel("dataSources").description("Link to the datasource resource")),
              responseFields(
                fieldWithPath("id").description("The workspaces's description"),
                fieldWithPath("name").description("The workspaces's name"),
                fieldWithPath("description").description("The workspaces's description"),
                fieldWithPath("ownerId").description("The workspaces's description"),
                fieldWithPath("publicType").description("The workspace's public type(PRIVATE/SHARED)"),
                fieldWithPath("sharedTagets").description("The workspaces's description"),
                fieldWithPath("createdBy").description("The workspaces's description"),
                fieldWithPath("createdTime").description("The workspaces's description"),
                fieldWithPath("modifiedBy").description("The workspaces's description"),
                fieldWithPath("modifiedTime").description("The workspaces's description"),
                fieldWithPath("_embedded").description("The workspaces's description"),
                fieldWithPath("_links").description("The workspaces's description"))
            ))
    .when()
      .get("/api/workspaces/{id}", "2")
    .then()
      .assertThat().statusCode(is(200));
    // @formatter:on
  }

  @Test
  public void f_workspaceUpdate() throws Exception {

    Map<String, Object> reqBody = Maps.newHashMap();
    reqBody.put("name", "patched Name");
    reqBody.put("description", "patched Description");

    // @formatter:off
    given(this.documentationSpec)
      .filter(document("workspace-update",
//        requestParameters(a_
//          parameterWithName("name").description("The workspaces's name"),
//          parameterWithName("description").description("The workspaces's description")),
        responseFields(
          fieldWithPath("id").description("The workspaces's description"),
          fieldWithPath("name").description("The workspaces's name"),
          fieldWithPath("description").description("The workspaces's description"),
          fieldWithPath("ownerId").description("The workspaces's description"),
          fieldWithPath("publicType").description("The workspace's public type(PRIVATE/SHARED)"),
          fieldWithPath("sharedTagets").description("The workspaces's description"),
          fieldWithPath("createdBy").description("The workspaces's description"),
          fieldWithPath("createdTime").description("The workspaces's description"),
          fieldWithPath("modifiedBy").description("The workspaces's description"),
          fieldWithPath("modifiedTime").description("The workspaces's description"),
          fieldWithPath("_embedded").description("The workspaces's description"),
          fieldWithPath("_links").description("The workspaces's description")
        )
      ))
      .body(this.objectMapper.writeValueAsString(reqBody))
      .contentType(ContentType.JSON)

    .when()
      .patch("/api/workspaces/{id}", "2")
    .then()
      .assertThat().statusCode(is(200));
    // @formatter:on
  }

  @Test
  public void g_workspaceDelete() throws Exception {

    // @formatter:off
    given(this.documentationSpec)
      .filter(document("workspace-delete"))
      .contentType(ContentType.JSON)
    .when()
      .delete("/api/workspaces/{id}", "2")
    .then()
      .assertThat().statusCode(is(204));
    // @formatter:on
  }


}
