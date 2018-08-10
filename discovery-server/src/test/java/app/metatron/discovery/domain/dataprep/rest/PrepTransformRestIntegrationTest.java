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

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;

import static com.jayway.restassured.RestAssured.given;

@ActiveProfiles("dataprep")
@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class PrepTransformRestIntegrationTest extends AbstractRestIntegrationTest {

  private static final Logger LOGGER = LoggerFactory.getLogger(PrepTransformRestIntegrationTest.class);

  @Value("${local.server.port}")
  private int serverPort;

  @Before
  public void setUp() {
    RestAssured.port = serverPort;
  }

  private final String KEY_RULE_CUR_IDX          = "ruleCurIdx";
  private final String KEY_RULE_CUR_STRING_INFOS = "ruleStringInfos";
  private final String KEY_RULE_STRING           = "ruleString";
  private final String KEY_VALID                 = "valid";
  private final String KEY_OP                    = "op";
  private final String KEY_EXCEPTION_CLASS_NAME  = "exceptionClassName";
  private final String KEY_ERROR_MSG             = "errorMsg";
  private final String KEY_FILEKEY               = "filekey";
  private final String KEY_FILENAME              = "filename";
  private final String KEY_DS_ID                 = "dsId";
  private final String KEY__LINKS_SELF_HREF      = "_links.self.href";
  private final String KEY_DF_ID                 = "dfId";
  private final String KEY_WRANGLED_DS_ID        = "wrangledDsId";
  private final String KEY_SHEETS                = "sheets";
  private final String KEY_SS_ID                 = "ssId";
  private final String KEY_DS_NAME               = "dsName";
  private final String KEY_TARGET_LINES          = "targetLines";

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_basic() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Map<String, Object> tmpMap;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform POST, GET, PUT

    wrangledDsId = prepareDSV("src/test/resources/test_dataprep.csv", "simple dataset", "transform test flow", null);

    final String rule0 = "rename col: column1 to: 'user_id'";
    final String rule1 = "rename col: column2 to: 'birth_day'";
    final String rule2 = "split col: birth_day on: '-' limit: 2 quote: '\"' ignoreCase: false";

    transform(wrangledDsId, "APPEND", -1, rule0);
    transform(wrangledDsId, "APPEND", -1, rule1);
    response = transform(wrangledDsId, "APPEND", -1, rule2);
    assertRuleList(response, 2, rule0, rule1, rule2);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_excel() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform POST, GET, PUT

    wrangledDsId = prepareEXCEL("src/test/resources/excelTest.xlsx", "excel dataset", "excel test flow");

    final String rule0 = "rename col: test1 to: 'test_col1'";

    response = transform(wrangledDsId, "APPEND", -1, rule0);
    assertRuleList(response, 0, rule0);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_json() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform POST, GET, PUT

    wrangledDsId = prepareJSON("src/test/resources/jsonTest.json", "json dataset", "json test flow");

    final String rule0 = "rename col: name to: '차종'";

    response = transform(wrangledDsId, "APPEND", -1, rule0);
    assertRuleList(response, 0, rule0);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_snapshot_basic() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform POST, GET, PUT

    wrangledDsId = prepareDSV("src/test/resources/test_dataprep.csv", "simple dataset", "snapshot test flow", null);

    final String rule0 = "rename col: column1 to: 'user_id'";
    final String rule1 = "rename col: column2 to: 'birth_day'";
    final String rule2 = "split col: birth_day on: '-' limit: 2 quote: '\"' ignoreCase: false";

    transform(wrangledDsId, "APPEND", -1, rule0);
    transform(wrangledDsId, "APPEND", -1, rule1);
    transform(wrangledDsId, "APPEND", -1, rule2);

    response = generateFileSnapshot(wrangledDsId, "CSV", "NONE", true);
    String ssId = response.path(KEY_SS_ID);
    assert ssId != null;

    response = getSnapshotDetail(ssId);
    assert response.path(KEY_DS_NAME).equals("simple dataset [W]") : response.path(KEY_DS_NAME);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_snapshot_while_jump() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform POST, GET, PUT

    wrangledDsId = prepareDSV("src/test/resources/test_dataprep.csv", "simple dataset", "snapshot test flow", null);

    final String rule0 = "rename col: column1 to: 'user_id'";
    final String rule1 = "rename col: column2 to: 'birth_day'";
    final String rule2 = "split col: birth_day on: '-' limit: 2 quote: '\"' ignoreCase: false";

    transform(wrangledDsId, "APPEND", -1, rule0);
    transform(wrangledDsId, "APPEND", -1, rule1);
    transform(wrangledDsId, "APPEND", -1, rule2);
    transform(wrangledDsId, "JUMP", 1, null);

    response = generateFileSnapshot(wrangledDsId, "CSV", "NONE", true);
    String ssId = response.path(KEY_SS_ID);
    assert ssId != null;

    response = getSnapshotDetail(ssId);
    assert response.path(KEY_DS_NAME).equals("simple dataset [W]") : response.path(KEY_DS_NAME);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_cleansing() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    wrangledDsId = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "cleansing test flow", null);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";

    transform(wrangledDsId, "APPEND", -1, rule0);
    response = transform(wrangledDsId, "APPEND", -1, rule1);
    assertRuleList(response, 1, rule0, rule1);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_long_rule_list() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    wrangledDsId = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";
    final String rule3 = "rename col: column2 to: 'contract_date'";
    final String rule4 = "rename col: column3 to: 'user_id'";
    final String rule5 = "rename col: column4 to: 'product_code'";
    final String rule6 = "rename col: column5 to: 'store_code'";
    final String rule7 = "rename col: column6 to: 'birth_date'";

    transform(wrangledDsId, "APPEND", -1, rule0);
    transform(wrangledDsId, "APPEND", -1, rule1);
    response = transform(wrangledDsId, "APPEND", -1, rule2);
    assertRuleList(response, 2, rule0, rule1, rule2);

    transform(wrangledDsId, "APPEND", -1, rule3);
    transform(wrangledDsId, "APPEND", -1, rule4);
    transform(wrangledDsId, "APPEND", -1, rule5);
    transform(wrangledDsId, "APPEND", -1, rule6);
    response = transform(wrangledDsId, "APPEND", -1, rule7);
    assertRuleList(response, 7, rule0, rule1, rule2, rule3, rule4, rule5, rule6, rule7);

    response = transform(wrangledDsId, "UNDO", -1, null);
    assertRuleList(response, 6, rule0, rule1, rule2, rule3, rule4, rule5, rule6);

    response = transform(wrangledDsId, "REDO", -1, null);
    assertRuleList(response, 7, rule0, rule1, rule2, rule3, rule4, rule5, rule6, rule7);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_undo_redo_too_much() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    wrangledDsId = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "undo/redo too much test flow", null);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";

    transform(wrangledDsId, "APPEND", -1, rule0);
    transform(wrangledDsId, "APPEND", -1, rule1);
    response = transform(wrangledDsId, "APPEND", -1, rule2);
    assertRuleList(response, 2, rule0, rule1, rule2);

    transform(wrangledDsId, "UNDO", -1, null);
    transform(wrangledDsId, "UNDO", -1, null);
    response = transform(wrangledDsId, "UNDO", -1, null);
    assertRuleList(response, -1);

    // UNDO too much -> no-effect expected
    response = transform(wrangledDsId, "UNDO", -1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    ruleStringInfos = response.path(KEY_RULE_CUR_STRING_INFOS);
    assertRuleList(response, -1);

    transform(wrangledDsId, "REDO", -1, null);
    transform(wrangledDsId, "REDO", -1, null);
    transform(wrangledDsId, "REDO", -1, null);
    response = transform(wrangledDsId, "REDO", -1, null);
    assertRuleList(response, 2, rule0, rule1, rule2);

    // REDO too much -> no-effect expected
    response = transform(wrangledDsId, "REDO", -1, null);
    assertRuleList(response, 2, rule0, rule1, rule2);

    transform(wrangledDsId, "UNDO", -1, null);
    transform(wrangledDsId, "UNDO", -1, null);
    transform(wrangledDsId, "REDO", -1, null);
    response = transform(wrangledDsId, "REDO", -1, null);
    assertRuleList(response, 2, rule0, rule1, rule2);

    transform(wrangledDsId, "UNDO", -1, null);
    transform(wrangledDsId, "UNDO", -1, null);
    transform(wrangledDsId, "REDO", -1, null);
    response = transform(wrangledDsId, "REDO", -1, null);
    assertRuleList(response, 2, rule0, rule1, rule2);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_diverse_rules() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    wrangledDsId = prepareDSV("src/test/resources/sample.csv", "cat info dataset", "diverse rule test flow", null);

    Map<String, Object> transform_put_body = Maps.newHashMap();
    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column1 to: 'itemNo'");

    // APPEND #1 - RENAME
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column2 to: 'name'");

    // APPEND #2 - RENAME
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column3 to: 'speed'");

    // APPEND #3 - RENAME
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column4 to: 'weight'");

    // APPEND #4 - RENAME
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column5 to: 'contract_date'");

    // APPEND #5 - RENAME
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column6 to: 'birth_date'");

    // APPEND #6 - RENAME
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "split col: birth_date on: '-' limit: 2 quote: '\"' ignoreCase: false");

    // APPEND #7 - SPLIT
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "merge col: split_birth_date1~split_birth_date3 with: '-' as: 'birth_day'");

    // APPEND #7 - MERGE
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "drop col: split_birth_date1~split_birth_date3");

    // APPEND #8 - DROP
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "countpattern col: name on: 'e' ignoreCase: true");

    // APPEND #9 - COUNTPATTERN
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "nest col: itemNo~speed into: array as: 'newArrs'");

    // APPEND #10 - NEST
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "unnest col: newArrs into: array idx: '1'");

    // APPEND #11 - UNNEST
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "sort order: weight, speed");

    // APPEND #12 - SORT
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "move col: unnset_0 before: countpattern_name");

    // APPEND #13 - MOVE
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "pivot col: itemNo,speed value: 'sum(countpattern_name)','count()' group: unnset_0, weight");

    // APPEND #14 - PIVOT
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "unpivot col: pivot_unnset_0, pivot_weight groupEvery: 1");

    // APPEND #15 - UNPIVOT
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: value1 to: 'tmpCol'");

    // APPEND #16 - RENAME
    transformResponse(transform_put_body, wrangledDsId);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "derive value: if(tmpCol == 'Ferrari', pivot_1_259_count_pivot_tmp_col, key1) as: 'newCol'");

    // APPEND #17 - DERIVE
    transformResponse(transform_put_body, wrangledDsId);
    // TODO: assert url
  }

  private void transformResponse(Map<String, Object> transform_put_body, String wrangledDsId) {
    Response transform_put_response8 = given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .content(transform_put_body)
            .put("/api/preparationdatasets/" + wrangledDsId + "/transform")
            .then()
            .statusCode(HttpStatus.SC_OK)
            //.log().all()
            .extract()
            .response();
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_error_handling() throws JsonProcessingException {
    Response response;
    String wrangledDsId;

    wrangledDsId = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "cleansing test flow", null);

    response = transform_fail_check(wrangledDsId, "APPEND", -1, "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)");

    String exceptionClassName = response.path(KEY_EXCEPTION_CLASS_NAME);
    String errorMsg = response.path(KEY_ERROR_MSG);

    assert (exceptionClassName.equals("class app.metatron.discovery.domain.metis.InvalidInvokeException"));
    assert (errorMsg.equals("The set grammar is wrong. Cannot resolve column name \"COUNTRY\" among (column1, column2, column3, column4, column5, column6, column7);"));
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_delete() throws JsonProcessingException {
    String wrangledDsId;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    wrangledDsId = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";
    final String rule0_ = "rename col: column7 to: 'NATION'";
    final String rule1_ = "set col: NATION value: if (NATION =='US', 'USA', NATION )";
    final String rule2_ = "set col: NATION value: if (NATION=='states', 'USA', NATION)";

    // APPEND 3 times
    transform(wrangledDsId, "APPEND", -1, rule0);
    transform(wrangledDsId, "APPEND", -1, rule1);
    response = transform(wrangledDsId, "APPEND", -1, rule2);
    assertRuleList(response, 2, rule0, rule1, rule2);

    // DELETE 3 times
    transform(wrangledDsId, "DELETE", -1, null);
    transform(wrangledDsId, "DELETE", -1, null);
    response = transform(wrangledDsId, "DELETE", -1, null);
    assertRuleList(response, -1);

    // re-APPEND 3 times //
    transform(wrangledDsId, "APPEND", -1, rule0_);
    transform(wrangledDsId, "APPEND", -1, rule1_);
    response = transform(wrangledDsId, "APPEND", -1, rule2_);
    assertRuleList(response, 2, rule0_, rule1_, rule2_);

    // DELETE
    response = transform(wrangledDsId, "DELETE", -1, null);
    assertRuleList(response, 1, rule0_, rule1_);

    // UNDO
    response = transform(wrangledDsId, "UNDO", -1, null);
    assertRuleList(response, 2, rule0_, rule1_, rule2_);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_jump() throws JsonProcessingException {
    String wrangledDsId;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    wrangledDsId = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";
    final String rule0_ = "rename col: column7 to: 'NATION'";
    final String rule1_ = "set col: NATION value: if (NATION =='US', 'USA', NATION )";
    final String rule2_ = "set col: NATION value: if (NATION=='states', 'USA', NATION)";

    // APPEND 3 times
    transform(wrangledDsId, "APPEND", -1, rule0);
    transform(wrangledDsId, "APPEND", -1, rule1);
    response = transform(wrangledDsId, "APPEND", -1, rule2);
    assertRuleList(response, 2, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", 0, null);
    assertRuleList(response, 0, rule0, rule1, rule2);

    // JUMP BACK
    response = transform(wrangledDsId, "JUMP", 2, null);
    assertRuleList(response, 2, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", 0, null);
    assertRuleList(response, 0, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", 1, null);
    assertRuleList(response, 1, rule0, rule1, rule2);

    // JUMP to the end of list
    response = transform(wrangledDsId, "JUMP", 2, null);
    assertRuleList(response, 2, rule0, rule1, rule2);

    // DELETE 3 times
    transform(wrangledDsId, "DELETE", -1, null);
    transform(wrangledDsId, "DELETE", -1, null);
    response = transform(wrangledDsId, "DELETE", -1, null);
    assertRuleList(response, -1);

    // re-APPEND 3 times //
    transform(wrangledDsId, "APPEND", -1, rule0_);
    transform(wrangledDsId, "APPEND", -1, rule1_);
    response = transform(wrangledDsId, "APPEND", -1, rule2_);
    assertRuleList(response, 2, rule0_, rule1_, rule2_);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_update() throws JsonProcessingException {
    String wrangledDsId;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    wrangledDsId = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";
    final String rule1_ = "set col: COUNTRY value: if (COUNTRY=='USA', 'US', COUNTRY)";
    final String rule2_ = "set col: COUNTRY value: if (COUNTRY=='states', 'US', COUNTRY)";

    // APPEND 3 times
    transform(wrangledDsId, "APPEND", -1, rule0);
    transform(wrangledDsId, "APPEND", -1, rule1);
    response = transform(wrangledDsId, "APPEND", -1, rule2);
    assertRuleList(response, 2, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", 0, null);
    assertRuleList(response, 0, rule0, rule1, rule2);

    // JUMP BACK
    response = transform(wrangledDsId, "JUMP", 2, null);
    assertRuleList(response, 2, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", 0, null);
    assertRuleList(response, 0, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", 1, null);
    assertRuleList(response, 1, rule0, rule1, rule2);

    // JUMP to the end of list
    response = transform(wrangledDsId, "JUMP", 2, null);
    assertRuleList(response, 2, rule0, rule1, rule2);

    // DELETE
    response = transform(wrangledDsId, "DELETE", -1, null);
    assertRuleList(response, 1, rule0, rule1);

    // UPDATE
    response = transform(wrangledDsId, "UPDATE", 1, rule1_);
    assertRuleList(response, 1, rule0, rule1_);

    // APPEND
    response = transform(wrangledDsId, "APPEND", -1, rule2_);
    assertRuleList(response, 2, rule0, rule1_, rule2_);
  }

//  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_reload_basic() throws JsonProcessingException {
    String wrangledDsId;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    wrangledDsId = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";

    // APPEND twice
    transform(wrangledDsId, "APPEND", -1, rule0);
    response = transform(wrangledDsId, "APPEND", -1, rule1);
    assertRuleList(response, 1, rule0, rule1);

    // UPDATE
    response = transform(wrangledDsId, "UPDATE", -1, rule2);
    assertRuleList(response, 1, rule0, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", 0, null);
    assertRuleList(response, 0, rule0, rule2);

    // JUMP BACK
    response = transform(wrangledDsId, "JUMP", 1, null);
    assertRuleList(response, 1, rule0, rule2);

    // DELETE
    response = transform(wrangledDsId, "DELETE", -1, null);
    assertRuleList(response, 0, rule0);

    // UNDO
//    response = transform(wrangledDsId, "UNDO", -1, null);
//    assertRuleList(response, 1, rule0, rule2);

    // LOAD //
//    response = load(wrangledDsId);
//    assertRuleList(response, 1, rule0, rule2);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_reload_long_rule_list() throws JsonProcessingException {
    String wrangledDsId;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    wrangledDsId = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";

    // APPEND 3 times
    transform(wrangledDsId, "APPEND", -1, rule0);
    transform(wrangledDsId, "APPEND", -1, rule1);
    response = transform(wrangledDsId, "APPEND", -1, rule2);
    assertRuleList(response, 2, rule0, rule1, rule2);

    List<Integer> colnos = new ArrayList<>();
    List<Integer> colWidths = new ArrayList<>();
    Map<String, Object> hashMap = response.path("gridResponse");
    DataFrame gridResponse = GlobalObjectMapper.getDefaultMapper().convertValue(hashMap, DataFrame.class);
    int colcnt = gridResponse.getColCnt();
    for (int colno = 0; colno < colcnt; colno++) {
      colnos.add(colno);
      colWidths.add(gridResponse.colHists.get(colno).colWidth);
    }
    response = transform_histogram(wrangledDsId, 2, colnos, colWidths);

    // JUMP -> transaction 관점에서 dataset에 아무 영향도 미치지 않음. 딱 하나 ruleCurIdx만 바꾼다.
    response = transform(wrangledDsId, "JUMP", 0, null);
    assertRuleList(response, 0, rule0, rule1, rule2);

    // JUMP BACK -> transaction 관점에서 dataset에 아무 영향도 미치지 않음. 딱 하나 ruleCurIdx만 바꾼다.
    response = transform(wrangledDsId, "JUMP", 2, null);
    assertRuleList(response, 2, rule0, rule1, rule2);

    // DELETE
    response = transform(wrangledDsId, "DELETE", -1, null);
    assertRuleList(response, 1, rule0, rule1);

    // UNDO (against DELETE)
    response = transform(wrangledDsId, "UNDO", -1, null);
    assertRuleList(response, 2, rule0, rule1, rule2);

    //////////
    // LOAD //
    //////////
    response = load(wrangledDsId);
    assertRuleList(response, 2, rule0, rule1, rule2);

//    ObjectMapper mapper = new ObjectMapper();
//    Map<String, Object> jsonMap;
//    try {
//      jsonMap = mapper.readValue(response.getBody().toString(), HashMap.class);
//    } catch (IOException e) {
//      e.printStackTrace();
//    }

    // RELOAD후 undo/redo 모두 불가!

    // REDO --> Reload시 UNDO는 복원하지 않음. 따라서 REDO는 불가.
    assert response.path("undoable").equals("false") : response.path("undoable");
    assert response.path("redoable").equals("false") : response.path("redoable");

    // UNDO (against JUMP BACK)
//    response = transform(wrangledDsId, "UNDO", -1, null);
//    assertRuleList(response, 0, rule0, rule1, rule2);
//
//    // UNDO (against JUMP)
//    response = transform(wrangledDsId, "UNDO", -1, null);
//    assertRuleList(response, 2, rule0, rule1, rule2);
//
//    // UNDO (against APPEND)
//    transform(wrangledDsId, "UNDO", -1, null);
//    transform(wrangledDsId, "UNDO", -1, null);
//    response = transform(wrangledDsId, "UNDO", -1, null);
//    assertRuleList(response, -1);
  }

  private String prepareDSV(String filePath, String dsName, String dfName, Integer targetCount) {
    Response response;

    response = upload(filePath);
    String filekey = response.path(KEY_FILEKEY);
    String filename = response.path(KEY_FILENAME);

    response = createFileImportedDataset(dsName, filekey, filename, "DSV", null);
    String importedDsId = response.path(KEY_DS_ID);
    String dataset_href = response.path(KEY__LINKS_SELF_HREF);

    response = createDataFlow(dfName, dataset_href);
    String dfId = response.path(KEY_DF_ID);

    response = createWrangledDataset(dfId, importedDsId, targetCount);
    String wrangledDsId = response.path(KEY_WRANGLED_DS_ID);

    loadWangledDataset(wrangledDsId);

    return wrangledDsId;
  }

  private String prepareEXCEL(String filePath, String dsName, String dfName) {
    Response response;

    response = upload(filePath);
    String filekey = response.path(KEY_FILEKEY);
    String filename = response.path(KEY_FILENAME);
    List<String> sheets = response.path(KEY_SHEETS);

    response = createFileImportedDataset(dsName, filekey, filename, "EXCEL", sheets.get(0));
    String importedDsId = response.path(KEY_DS_ID);
    String dataset_href = response.path(KEY__LINKS_SELF_HREF);

    response = createDataFlow(dfName, dataset_href);
    String dfId = response.path(KEY_DF_ID);

    response = createWrangledDataset(dfId, importedDsId, null);
    String wrangledDsId = response.path(KEY_WRANGLED_DS_ID);

    loadWangledDataset(wrangledDsId);

    return wrangledDsId;
  }
  private String prepareJSON(String filePath, String dsName, String dfName) {
    Response response;

    response = upload(filePath);
    String filekey = response.path(KEY_FILEKEY);
    String filename = response.path(KEY_FILENAME);
    List<String> sheets = response.path(KEY_SHEETS);

    response = createFileImportedDataset(dsName, filekey, filename, "JSON", null);
    String importedDsId = response.path(KEY_DS_ID);
    String dataset_href = response.path(KEY__LINKS_SELF_HREF);

    response = createDataFlow(dfName, dataset_href);
    String dfId = response.path(KEY_DF_ID);

    response = createWrangledDataset(dfId, importedDsId, null);
    String wrangledDsId = response.path(KEY_WRANGLED_DS_ID);

    loadWangledDataset(wrangledDsId);

    return wrangledDsId;
  }

  private Response upload(String filePath) {
    File file = new File(filePath);

    Response upload_response = given()
      .auth()
      .oauth2(oauth_token)
      .accept(ContentType.JSON)
      .when()
      .multiPart("file", file)
      .contentType("multipart/form-data")
      .post("/api/preparationdatasets/upload")
      .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all()
      .extract()
      .response();

    assert upload_response.path("errorMsg") == null : upload_response;
    return upload_response;
  }

  private Response createFileImportedDataset(String dsName, String filekey, String filename,
                                             String fileFormat, String sheetName) {
    Map<String, Object> dataset_post_body = Maps.newHashMap();

    dataset_post_body.put("dsName", dsName);
    dataset_post_body.put("dsDesc", dsName + " description");

    dataset_post_body.put("dsType", "IMPORTED");
    dataset_post_body.put("importType", "FILE");
    dataset_post_body.put("fileType", "LOCAL");
    dataset_post_body.put(KEY_FILEKEY, filekey);
    dataset_post_body.put(KEY_FILENAME, filename);
    dataset_post_body.put("dcId", "file dc");

    if (fileFormat.equalsIgnoreCase("DSV") || fileFormat.equalsIgnoreCase("CSV")) {
      dataset_post_body.put("custom", "{\"fileType\":\"DSV\",\"delimiter\":\",\"}");
    } else if (fileFormat.equalsIgnoreCase("EXCEL")) {
      dataset_post_body.put("custom", "{\"fileType\":\"EXCEL\",\"sheet\":\"" + sheetName + "\"}");
    } else {
      dataset_post_body.put("custom", "{\"fileType\":\"JSON\"}");
    }

    Response dataset_post_response = given()
      .auth()
      .oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .when()
      .content(dataset_post_body)
      .post("/api/preparationdatasets")
      .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all()
      .extract()
      .response();

    String importedDsId = dataset_post_response.path(KEY_DS_ID);
    String dataset_href = dataset_post_response.path("_links.self.href");

    Map<String, Object> ret = Maps.newHashMap();
    ret.put("importedDsId", importedDsId);
    ret.put("dataset_href", dataset_href);

    assert dataset_post_response.path("errorMsg") == null : dataset_post_response;
    return dataset_post_response;
  }

  private Response createDataFlow(String dfName, String dataset_href) {
    Map<String, Object> dataflow_post_body = Maps.newHashMap();

    dataflow_post_body.put("dfName", "cleansing_test");
    dataflow_post_body.put("dfDesc", "dataflow for cleansing test");

    List<String> datasets = new ArrayList<>();
    datasets.add(dataset_href);
    dataflow_post_body.put("datasets", datasets);

    Response dataflow_post_response = given()
      .auth()
      .oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .when()
      .content(dataflow_post_body)
      .post("/api/preparationdataflows")
      .then()
      .statusCode(HttpStatus.SC_CREATED)
      .log().all()
      .extract()
      .response();

    assert dataflow_post_response.path("errorMsg") == null : dataflow_post_response;
    return dataflow_post_response;
  }

  private Response createWrangledDataset(String dfId, String importedDsId, Integer targetCount) {
    Map<String, Object> transform_post_body = Maps.newHashMap();
    transform_post_body.put(KEY_DF_ID, dfId);
    if (targetCount != null)
      transform_post_body.put(KEY_TARGET_LINES, targetCount);

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

    assert transform_post_response.path("errorMsg") == null : transform_post_response;
    return transform_post_response;
  }

  private Response loadWangledDataset(String wrangledDsId) {
    Response transform_get_response = given()
      .auth()
      .oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .when()
      .get("/api/preparationdatasets/" + wrangledDsId + "/transform")
      .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all()
      .extract()
      .response();

    assert transform_get_response.path("errorMsg") == null : transform_get_response;
    return transform_get_response;
  }

  private Response transform(String wrangledDsId, String op, int ruleIdx, String ruleString) {
    Map<String, Object> transform_request = Maps.newHashMap();
    transform_request.put(KEY_OP, op);
    transform_request.put("ruleIdx", ruleIdx);
    transform_request.put(KEY_RULE_STRING, ruleString);

    Response transform_response = given()
            .auth()
            .oauth2(oauth_token)
            .contentType(ContentType.JSON)
            .accept(ContentType.JSON)
            .when()
            .content(transform_request)
            .put("/api/preparationdatasets/" + wrangledDsId + "/transform")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .log().all()
            .extract()
            .response();

    assert transform_response.path("errorMsg") == null : transform_response;
    return transform_response;
  }

  private Response transform_histogram(String wrangledDsId, int ruleIdx, List<Integer> colnos, List<Integer> colWidths) {
    Map<String, Object> transform_request = Maps.newHashMap();
    transform_request.put("ruleIdx", ruleIdx);
    transform_request.put("colnos", colnos);
    transform_request.put("colWidths", colWidths);

    Response transform_response = given()
      .auth()
      .oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .when()
      .content(transform_request)
      .post("/api/preparationdatasets/" + wrangledDsId + "/transform/histogram")
      .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all()
      .extract()
      .response();

    assert transform_response.path("errorMsg") == null : transform_response;
    return transform_response;
  }

  private Response transform_fail_check(String wrangledDsId, String op, int ruleIdx, String ruleString) {
    Map<String, Object> transform_request = Maps.newHashMap();
    transform_request.put(KEY_OP, op);
    transform_request.put("ruleIdx", ruleIdx);
    transform_request.put(KEY_RULE_STRING, ruleString);

    Response transform_response = given()
      .auth()
      .oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .when()
      .content(transform_request)
      .put("/api/preparationdatasets/" + wrangledDsId + "/transform")
      .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all()
      .extract()
      .response();

    assert transform_response.path("errorMsg") != null : transform_response;
    return transform_response;
  }

  private Response load(String wrangledDsId) {
    Map<String, Object> load_request = Maps.newHashMap();
    load_request.put("reload", "true");

    Response load_response = given()
      .auth()
      .oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .when()
      .content(load_request)
      .get("/api/preparationdatasets/" + wrangledDsId + "/transform")
      .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all()
      .extract()
      .response();

    assert load_response.path("errorMsg") == null : load_response;
    return load_response;
  }

  private Response generateFileSnapshot(String wrangledDsId, String format, String compression, boolean profile) {
    Map<String, Object> transform_snapshot_request = Maps.newHashMap();
    transform_snapshot_request.put("ssType", "FILE");
    transform_snapshot_request.put("format", format);
    transform_snapshot_request.put("compression", compression);
    transform_snapshot_request.put("profile", profile);

    Response transform_snapshot_response = given()
      .auth()
      .oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .when()
      .content(transform_snapshot_request)
      .post("/api/preparationdatasets/" + wrangledDsId + "/transform/snapshot")
      .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all()
      .extract()
      .response();

    assert transform_snapshot_response.path("errorMsg") == null : transform_snapshot_response;

    List<String> fullDsIds = transform_snapshot_response.path("fullDsIds");
    for (String dsId : fullDsIds) {
      given()
        .auth()
        .oauth2(oauth_token)
        .when()
        .delete("/api/preparationdatasets/" + dsId)
        .then()
        .statusCode(HttpStatus.SC_OK)
        .log().all()
        .extract()
        .response();
    }

    return transform_snapshot_response;
  }

  private Response getSnapshotDetail(String ssId) {
    Response snapshot_get_response = given()
      .auth()
      .oauth2(oauth_token)
      .contentType(ContentType.JSON)
      .accept(ContentType.JSON)
      .when()
      .get("/api/preparationsnapshots/" + ssId)
      .then()
      .statusCode(HttpStatus.SC_OK)
      .log().all()
      .extract()
      .response();

    assert snapshot_get_response.path("errorMsg") == null : snapshot_get_response;
    return snapshot_get_response;
  }

  private void assertRuleList(Response response, int ruleCurIdx, String... rules) {
    assert (int)response.path(KEY_RULE_CUR_IDX) == ruleCurIdx :
      String.format("Responded ruleCurIdx is [%d] : should be [%d]", response.path(KEY_RULE_CUR_IDX), ruleCurIdx);

    List<Map<String, Object>> ruleStringInfos = response.path(KEY_RULE_CUR_STRING_INFOS);
    assert ruleStringInfos.size() == rules.length :
      String.format("ruleStringInfos.size() is [%d] : should be [%d]", ruleStringInfos.size(), rules.length);

    for (int i = 0; i < rules.length; i++) {
      assert ruleStringInfos.get(i).get(KEY_RULE_STRING).equals(rules[i]) :
        String.format("ruleString[%d] is [%s] : should be [%s]", i, ruleStringInfos.get(i).get(KEY_RULE_STRING), rules[i]);
    }
  }
}
