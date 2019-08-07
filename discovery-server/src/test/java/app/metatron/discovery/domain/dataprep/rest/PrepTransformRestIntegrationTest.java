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
import java.util.Arrays;
import java.util.List;
import java.util.Map;

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

  private final String KEY_RULE_CUR_IDX           = "ruleCurIdx";
  private final String KEY_TRANSFORM_RULES        = "transformRules";
  private final String KEY_RULE_CUR_STRING_INFOS  = "ruleStringInfos";
  private final String KEY_RULE_STRING            = "ruleString";
  private final String KEY_VALID                  = "valid";
  private final String KEY_OP                     = "op";
  private final String KEY_EXCEPTION_CLASS_NAME   = "exceptionClassName";
  private final String KEY_ERROR_MSG              = "errorMsg";
  private final String KEY_FILENAME_BEFORE_UPLOAD = "filenameBeforeUpload";
  private final String KEY_STOURED_URI            = "storedUri";
  /*
  private final String KEY_FILEKEY                = "filekey";
  private final String KEY_FILENAME               = "filename";
  */
  private final String KEY_DS_ID                  = "dsId";
  private final String KEY__LINKS_SELF_HREF       = "_links.self.href";
  private final String KEY_DF_ID                  = "dfId";
  private final String KEY_WRANGLED_DS_ID         = "wrangledDsId";
  private final String KEY_SHEETS                 = "sheets";
  private final String KEY_SS_ID                  = "ssId";
  private final String KEY_DS_NAME                = "dsName";
  private final String KEY_TARGET_LINES           = "targetLines";

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_basic() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Map<String, Object> tmpMap;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform POST, GET, PUT

    List<Object> ret = prepareDSV("src/test/resources/test_dataprep.csv", "simple dataset", "transform test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);

    final String rule0 = "rename col: column1 to: 'user_id'";
    final String rule1 = "rename col: column2 to: 'birth_day'";
    //final String rule2 = "split col: birth_day on: '-' limit: 2 quote: '\"' ignoreCase: false";
    final String rule2 = "rename col: user_id to: 'user__id'";

    Response transform_response;

    ruleCurIdx = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule0).path(KEY_RULE_CUR_IDX);
    ruleCurIdx = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule1).path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule2);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_excel() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform POST, GET, PUT

    List<Object> ret = prepareEXCEL("src/test/resources/excelTest.xlsx", "excel dataset", "excel test flow");
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);

    final String rule0 = "rename col: test1 to: 'test_col1'";

    response = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule0);
    assertRuleList(response, ruleCurIdx, rule0);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_json() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform POST, GET, PUT

    List<Object> ret = prepareJSON("src/test/resources/jsonTest.json", "json dataset", "json test flow");
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);

    final String rule0 = "rename col: name to: '차종'";

    response = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule0);
    assertRuleList(response, ruleCurIdx, rule0);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_snapshot_basic() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform POST, GET, PUT

    List<Object> ret = prepareDSV("src/test/resources/test_dataprep.csv", "simple dataset", "snapshot test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);

    final String rule0 = "rename col: column1 to: 'user_id'";
    final String rule1 = "rename col: column2 to: 'birth_day'";
    //final String rule2 = "split col: birth_day on: '-' limit: 2 quote: '\"' ignoreCase: false";
    final String rule2 = "rename col: user_id to: 'user__id'";

    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule0);
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule1);
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule2);

    response = generateFileSnapshot(wrangledDsId, "CSV", "NONE", true);
    String ssId = response.path(KEY_SS_ID);
    assert ssId != null;

    response = getSnapshotDetail(ssId);
    assert response.path(KEY_DS_NAME).equals("simple dataset") : response.path(KEY_DS_NAME);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_snapshot_while_jump() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;
    Integer offsetIdx;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform POST, GET, PUT

    List<Object> ret = prepareDSV("src/test/resources/test_dataprep.csv", "simple dataset", "snapshot test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);
    offsetIdx = ruleCurIdx + 1;

    final String rule0 = "rename col: column1 to: 'user_id'";
    final String rule1 = "rename col: column2 to: 'birth_day'";
    final String rule2 = "rename col: birth_day to: 'birth'";
    //final String rule2 = "split col: birth_day on: '-' limit: 2 quote: '\"' ignoreCase: false";

    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule0);
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule1);
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule2);
    transform(wrangledDsId, "JUMP", offsetIdx+1, null);

    response = generateFileSnapshot(wrangledDsId, "CSV", "NONE", true);
    String ssId = response.path(KEY_SS_ID);
    assert ssId != null;

    response = getSnapshotDetail(ssId);
    assert response.path(KEY_DS_NAME).equals("simple dataset") : response.path(KEY_DS_NAME);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_cleansing() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    List<Object> ret = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "cleansing test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";

    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule0);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule1);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_long_rule_list() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    List<Object> ret = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";
    final String rule3 = "rename col: column2 to: 'contract_date'";
    final String rule4 = "rename col: column3 to: 'user_id'";
    final String rule5 = "rename col: column4 to: 'product_code'";
    final String rule6 = "rename col: column5 to: 'store_code'";
    final String rule7 = "rename col: column6 to: 'birth_date'";

    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule0);
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule1);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule2);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule3);
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule4);
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule5);
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule6);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule7);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2, rule3, rule4, rule5, rule6, rule7);

    response = transform(wrangledDsId, "UNDO", -1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2, rule3, rule4, rule5, rule6);

    response = transform(wrangledDsId, "REDO", -1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2, rule3, rule4, rule5, rule6, rule7);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_undo_redo_too_much() throws JsonProcessingException {
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    List<Object> ret = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "undo/redo too much test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";

    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule0);
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule1);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule2);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    transform(wrangledDsId, "UNDO", -1, null);
    transform(wrangledDsId, "UNDO", -1, null);
    response = transform(wrangledDsId, "UNDO", -1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx);

    // UNDO too much -> no-effect expected
    response = transform(wrangledDsId, "UNDO", -1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    ruleStringInfos = response.path(KEY_RULE_CUR_STRING_INFOS);
    assertRuleList(response, ruleCurIdx);

    transform(wrangledDsId, "REDO", -1, null);
    transform(wrangledDsId, "REDO", -1, null);
    transform(wrangledDsId, "REDO", -1, null);
    response = transform(wrangledDsId, "REDO", -1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // now, too much REDO causes 500 error
    /*
    // REDO too much -> no-effect expected
    response = transform(wrangledDsId, "REDO", -1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);
    */

    transform(wrangledDsId, "UNDO", -1, null);
    transform(wrangledDsId, "UNDO", -1, null);
    transform(wrangledDsId, "REDO", -1, null);
    response = transform(wrangledDsId, "REDO", -1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    transform(wrangledDsId, "UNDO", -1, null);
    transform(wrangledDsId, "UNDO", -1, null);
    transform(wrangledDsId, "REDO", -1, null);
    response = transform(wrangledDsId, "REDO", -1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_diverse_rules() throws JsonProcessingException {
    // 규칙이 바뀌었음.
    // 모든 필드가 STRING에서 시작했으나, autotyping이 적용되어 타입을 갖고 시작함
    // split, nest 등 적용하는 순서가 달라짐
    /*
    String wrangledDsId;
    int ruleCurIdx;
    List<Map<String, Object>> ruleStringInfos;
    Response response;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    List<Object> ret = prepareDSV("src/test/resources/sample.csv", "cat info dataset", "diverse rule test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);

    Map<String, Object> transform_put_body = Maps.newHashMap();
    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column1 to: 'itemNo'");

    // APPEND #1 - RENAME
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column2 to: 'name'");

    // APPEND #2 - RENAME
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column3 to: 'speed'");

    // APPEND #3 - RENAME
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column4 to: 'weight'");

    // APPEND #4 - RENAME
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column5 to: 'contract_date'");

    // APPEND #5 - RENAME
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: column6 to: 'birth_date'");

    // APPEND #6 - RENAME
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "split col: birth_date on: '-' limit: 2 quote: '\"' ignoreCase: false");

    // APPEND #7 - SPLIT
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "merge col: split_birth_date1~split_birth_date3 with: '-' as: 'birth_day'");

    // APPEND #7 - MERGE
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "drop col: split_birth_date1~split_birth_date3");

    // APPEND #8 - DROP
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "countpattern col: name on: 'e' ignoreCase: true");

    // APPEND #9 - COUNTPATTERN
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "nest col: itemNo~speed into: array as: 'newArrs'");

    // APPEND #10 - NEST
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "unnest col: newArrs into: array idx: '1'");

    // APPEND #11 - UNNEST
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "sort order: weight, speed");

    // APPEND #12 - SORT
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "move col: unnset_0 before: countpattern_name");

    // APPEND #13 - MOVE
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "pivot col: itemNo,speed value: 'sum(countpattern_name)','count()' group: unnset_0, weight");

    // APPEND #14 - PIVOT
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "unpivot col: pivot_unnset_0, pivot_weight groupEvery: 1");

    // APPEND #15 - UNPIVOT
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "rename col: value1 to: 'tmpCol'");

    // APPEND #16 - RENAME
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);

    transform_put_body.put(KEY_OP, "APPEND");
    transform_put_body.put(KEY_RULE_STRING, "derive value: if(tmpCol == 'Ferrari', pivot_1_259_count_pivot_tmp_col, key1) as: 'newCol'");

    // APPEND #17 - DERIVE
    transformResponse(transform_put_body, wrangledDsId,ruleCurIdx++);
    */
    // TODO: assert url
  }

  private void transformResponse(Map<String, Object> transform_put_body, String wrangledDsId, Integer ruleIdx) {
    transform_put_body.put("count", 100);
    if(0<=ruleIdx) {
      transform_put_body.put("ruleIdx", ruleIdx);
    }
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
    // now, if grammar is wrong, server returns 500 error with a message.
    /*
    Response response;
    String wrangledDsId;
    Integer ruleCurIdx;

    List<Object> ret = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "cleansing test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);

    response = transform_fail_check(wrangledDsId, "APPEND", ruleCurIdx++, "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)");

    String exceptionClassName = response.path(KEY_EXCEPTION_CLASS_NAME);
    String errorMsg = response.path(KEY_ERROR_MSG);

    assert (exceptionClassName.equals("class app.metatron.discovery.domain.metis.InvalidInvokeException"));
    assert (errorMsg.equals("The set grammar is wrong. Cannot resolve column name \"COUNTRY\" among (column1, column2, column3, column4, column5, column6, column7);"));
    */
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_delete() throws JsonProcessingException {
    String wrangledDsId;
    Response response;
    Integer ruleCurIdx;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    List<Object> ret = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";
    final String rule0_ = "rename col: column7 to: 'NATION'";
    final String rule1_ = "set col: NATION value: if (NATION =='US', 'USA', NATION )";
    final String rule2_ = "set col: NATION value: if (NATION=='states', 'USA', NATION)";

    // APPEND 3 times
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule0);
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule1);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule2);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // DELETE 3 times
    response = transform(wrangledDsId, "DELETE", ruleCurIdx, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "DELETE", ruleCurIdx, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "DELETE", ruleCurIdx, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx);

    // re-APPEND 3 times //
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule0_);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule1_);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule2_);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0_, rule1_, rule2_);

    // DELETE
    response = transform(wrangledDsId, "DELETE", ruleCurIdx, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0_, rule1_);

    // UNDO
    response = transform(wrangledDsId, "UNDO", -1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0_, rule1_, rule2_);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_jump() throws JsonProcessingException {
    String wrangledDsId;
    Response response;
    Integer ruleCurIdx;
    Integer offsetIdx;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    List<Object> ret = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);
    offsetIdx = ruleCurIdx+1;

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";
    final String rule0_ = "rename col: column7 to: 'NATION'";
    final String rule1_ = "set col: NATION value: if (NATION =='US', 'USA', NATION )";
    final String rule2_ = "set col: NATION value: if (NATION=='states', 'USA', NATION)";

    // APPEND 3 times
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule0);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule1);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule2);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", offsetIdx+0, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // JUMP BACK
    response = transform(wrangledDsId, "JUMP", offsetIdx+2, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", offsetIdx+0, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", offsetIdx+1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // JUMP to the end of list
    response = transform(wrangledDsId, "JUMP", offsetIdx+2, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // DELETE 3 times
    response = transform(wrangledDsId, "DELETE", ruleCurIdx, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "DELETE", ruleCurIdx, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "DELETE", ruleCurIdx, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx);

    // re-APPEND 3 times //
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule0_);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule1_);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule2_);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleListOffset(response, ruleCurIdx, ruleCurIdx-2, rule0_, rule1_, rule2_);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_transform_update() throws JsonProcessingException {
    String wrangledDsId;
    Response response;
    Integer ruleCurIdx;
    Integer offsetIdx;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    List<Object> ret = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);
    offsetIdx = ruleCurIdx+1;

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";
    final String rule1_ = "set col: COUNTRY value: if (COUNTRY=='USA', 'US', COUNTRY)";
    final String rule2_ = "set col: COUNTRY value: if (COUNTRY=='states', 'US', COUNTRY)";

    // APPEND 3 times
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule0);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule1);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule2);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", offsetIdx+0, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // JUMP BACK
    response = transform(wrangledDsId, "JUMP", offsetIdx+2, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", offsetIdx+0, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", offsetIdx+1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // JUMP to the end of list
    response = transform(wrangledDsId, "JUMP", offsetIdx+2, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // DELETE
    response = transform(wrangledDsId, "DELETE", ruleCurIdx, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1);

    // UPDATE
    response = transform(wrangledDsId, "UPDATE", offsetIdx+1, rule1_);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1_);

    // APPEND
    response = transform(wrangledDsId, "APPEND", ruleCurIdx, rule2_);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1_, rule2_);
  }

//  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_reload_basic() throws JsonProcessingException {
    String wrangledDsId;
    Response response;
    Integer ruleCurIdx;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    List<Object> ret = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";

    // APPEND twice
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule0);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule1);
    assertRuleList(response, 1, rule0, rule1);

    // UPDATE
    response = transform(wrangledDsId, "UPDATE", ruleCurIdx++, rule2);
    assertRuleList(response, 1, rule0, rule2);

    // JUMP
    response = transform(wrangledDsId, "JUMP", 0, null);
    assertRuleList(response, 0, rule0, rule2);

    // JUMP BACK
    response = transform(wrangledDsId, "JUMP", 1, null);
    assertRuleList(response, 1, rule0, rule2);

    // DELETE
    response = transform(wrangledDsId, "DELETE", ruleCurIdx++, null);
    assertRuleList(response, 0, rule0);

    // UNDO
//    response = transform(wrangledDsId, "UNDO", ruleCurIdx++, null);
//    assertRuleList(response, 1, rule0, rule2);

    // LOAD //
//    response = load:(wrangledDsId);
//    assertRuleList(response, 1, rule0, rule2);
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"SYSTEM_USER", "PERM_SYSTEM_WRITE_WORKSPACE"})
  public void test_reload_long_rule_list() throws JsonProcessingException {
    String wrangledDsId;
    Response response;
    Integer ruleCurIdx;
    Integer offsetIdx;

    // 메인 테스트 타겟 endpoint: /api/preparationdatasets/{dsId}/transform PUT

    List<Object> ret = prepareDSV("src/test/resources/test_cleansing.csv", "dirty dataset", "long rule list test flow", null);
    wrangledDsId = (String)ret.get(0);
    ruleCurIdx = (Integer)ret.get(1);
    offsetIdx = ruleCurIdx+1;

    final String rule0 = "rename col: column7 to: 'COUNTRY'";
    final String rule1 = "set col: COUNTRY value: if (COUNTRY=='US', 'USA', COUNTRY)";
    final String rule2 = "set col: COUNTRY value: if (COUNTRY=='states', 'USA', COUNTRY)";

    // APPEND 3 times
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule0);
    transform(wrangledDsId, "APPEND", ruleCurIdx++, rule1);
    response = transform(wrangledDsId, "APPEND", ruleCurIdx++, rule2);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // histogram protocol has been changed
    /*
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
    */

    // JUMP -> transaction 관점에서 dataset에 아무 영향도 미치지 않음. 딱 하나 ruleCurIdx만 바꾼다.
    response = transform(wrangledDsId, "JUMP", offsetIdx+0, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // JUMP BACK -> transaction 관점에서 dataset에 아무 영향도 미치지 않음. 딱 하나 ruleCurIdx만 바꾼다.
    response = transform(wrangledDsId, "JUMP", offsetIdx+2, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    // DELETE
    response = transform(wrangledDsId, "DELETE", ruleCurIdx, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1);

    // UNDO (against DELETE)
    response = transform(wrangledDsId, "UNDO", -1, null);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

    //////////
    // LOAD //
    //////////
    response = loadWangledDataset(wrangledDsId);
    ruleCurIdx = response.path(KEY_RULE_CUR_IDX);
    assertRuleList(response, ruleCurIdx, rule0, rule1, rule2);

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

  private List<Object> prepareDSV(String filePath, String dsName, String dfName, Integer targetCount) {
    Response response;

    response = upload(filePath);

    String filenameBeforeUpload = response.path("filenameBeforeUpload");
    String storedUri = response.path("storedUri");

    response = createFileImportedDataset(dsName, filenameBeforeUpload, storedUri, "CSV", null);
    String importedDsId = response.path(KEY_DS_ID);
    String dataset_href = response.path(KEY__LINKS_SELF_HREF);

    response = createDataFlow(dfName, dataset_href);
    String dfId = response.path(KEY_DF_ID);

    response = createWrangledDataset(dfId, importedDsId, targetCount);
    String wrangledDsId = response.path(KEY_WRANGLED_DS_ID);

    Response transform_get_response = loadWangledDataset(wrangledDsId);
    Integer ruleCurIdx = transform_get_response.path(KEY_RULE_CUR_IDX);

    return Arrays.asList(wrangledDsId,ruleCurIdx);
  }

  private List<Object> prepareEXCEL(String filePath, String dsName, String dfName) {
    Response response;

    response = upload(filePath);

    String filenameBeforeUpload = response.path("filenameBeforeUpload");
    String storedUri = response.path("storedUri");

    response = createFileImportedDataset(dsName, filenameBeforeUpload, storedUri, "EXCEL", null);
    String importedDsId = response.path(KEY_DS_ID);
    String dataset_href = response.path(KEY__LINKS_SELF_HREF);

    response = createDataFlow(dfName, dataset_href);
    String dfId = response.path(KEY_DF_ID);

    response = createWrangledDataset(dfId, importedDsId, null);
    String wrangledDsId = response.path(KEY_WRANGLED_DS_ID);

    Response transform_get_response = loadWangledDataset(wrangledDsId);
    Integer ruleCurIdx = transform_get_response.path(KEY_RULE_CUR_IDX);

    return Arrays.asList(wrangledDsId,ruleCurIdx);
  }
  private List<Object> prepareJSON(String filePath, String dsName, String dfName) {
    Response response;

    response = upload(filePath);

    String filenameBeforeUpload = response.path("filenameBeforeUpload");
    String storedUri = response.path("storedUri");
    List<String> sheets = response.path(KEY_SHEETS);

    response = createFileImportedDataset(dsName, filenameBeforeUpload, storedUri, "JSON", null);
    String importedDsId = response.path(KEY_DS_ID);
    String dataset_href = response.path(KEY__LINKS_SELF_HREF);

    response = createDataFlow(dfName, dataset_href);
    String dfId = response.path(KEY_DF_ID);

    response = createWrangledDataset(dfId, importedDsId, null);
    String wrangledDsId = response.path(KEY_WRANGLED_DS_ID);

    Response transform_get_response = loadWangledDataset(wrangledDsId);
    Integer ruleCurIdx = transform_get_response.path(KEY_RULE_CUR_IDX);

    return Arrays.asList(wrangledDsId,ruleCurIdx);
  }

  private Response upload(String filePath) {
    File file = new File(filePath);

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

    assert upload_response.path("success").equals(true) : upload_response;
    return upload_response;
  }

  private Response createFileImportedDataset(String dsName, String filenameBeforeUpload, String storedUri,
                                             String fileFormat, String sheetName) {
    Map<String, Object> dataset_post_body = Maps.newHashMap();

    dataset_post_body.put("dsName", dsName);
    dataset_post_body.put("dsDesc", dsName + " description");

    dataset_post_body.put("dsType", "IMPORTED");
    dataset_post_body.put("importType", "UPLOAD");
    dataset_post_body.put("fileType", "LOCAL");
    dataset_post_body.put("delimiter", ",");
    dataset_post_body.put("fileFormat", fileFormat);
    dataset_post_body.put(KEY_FILENAME_BEFORE_UPLOAD, filenameBeforeUpload);
    dataset_post_body.put(KEY_STOURED_URI, storedUri);
    dataset_post_body.put("storageType", "LOCAL");
    if(fileFormat.equals("EXCEL")) {
      Response grid_get_response = given()
              .auth()
              .oauth2(oauth_token)
              .contentType(ContentType.JSON)
              .accept(ContentType.JSON)
              .when()
              .content(dataset_post_body)
              .get("/api/preparationdatasets/file_grid?storedUri="+storedUri)
              .then()
              .statusCode(HttpStatus.SC_OK)
              .log().all()
              .extract()
              .response();
      List<String> sheetNames = grid_get_response.path(KEY_SHEETS);
      sheetName = sheetNames.get(0);
      dataset_post_body.put("sheetName", sheetName);
    }

    /*
    if (fileFormat.equalsIgnoreCase("DSV") || fileFormat.equalsIgnoreCase("CSV")) {
      dataset_post_body.put("custom", "{\"fileType\":\"DSV\",\"delimiter\":\",\"}");
    } else if (fileFormat.equalsIgnoreCase("EXCEL")) {
      dataset_post_body.put("custom", "{\"fileType\":\"EXCEL\",\"sheet\":\"" + sheetName + "\"}");
    } else {
      dataset_post_body.put("custom", "{\"fileType\":\"JSON\"}");
    }
    */

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
      .statusCode(HttpStatus.SC_OK)
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
      .get("/api/preparationdatasets/" + wrangledDsId + "/transform?ruleIdx=&offset=0&count=100")
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

    transform_request.put("count", 100);
    transform_request.put(KEY_OP, op);
    if(0<=ruleIdx) {
      transform_request.put("ruleIdx", ruleIdx);
    }
    if(ruleString!=null) {
      transform_request.put(KEY_RULE_STRING, ruleString);
    }

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
    transform_request.put("count", 100);
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
    transform_snapshot_request.put("ssName", "test snapshot");
    transform_snapshot_request.put("ssType", "URI");
    transform_snapshot_request.put("storageType", "LOCAL");
    transform_snapshot_request.put("uriFileFormat", "CSV");
    transform_snapshot_request.put("hiveFileCompression", "NONE");
    transform_snapshot_request.put("engine", "EMBEDDED");
    transform_snapshot_request.put("isCancel", false);

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
    List<Map<String, Object>> transformRules = response.path(KEY_TRANSFORM_RULES);
    int offset = transformRules.size() - rules.length;

    assertRuleListOffset(response, ruleCurIdx, offset, rules);
  }

  private void assertRuleListOffset(Response response, int ruleCurIdx, int offset, String... rules) {
    assert (int)response.path(KEY_RULE_CUR_IDX) == ruleCurIdx :
            String.format("Responded ruleCurIdx is [%d] : should be [%d]", response.path(KEY_RULE_CUR_IDX), ruleCurIdx);

    List<Map<String, Object>> transformRules = response.path(KEY_TRANSFORM_RULES);
    assert transformRules.size() >= rules.length :
            String.format("transformRules.size() is [%d] : should be [%d]", transformRules.size(), rules.length);

    for (int i = 0; i < rules.length; i++) {
      assert transformRules.get(i+offset).get(KEY_RULE_STRING).equals(rules[i]) :
              String.format("ruleString[%d] is [%s] : should be [%s]", i, transformRules.get(i+offset).get(KEY_RULE_STRING), rules[i]);
    }
  }
}
