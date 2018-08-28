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

package app.metatron.discovery.domain.dataprep.transform;

import app.metatron.discovery.domain.dataprep.PrepDataset;
import app.metatron.discovery.domain.dataprep.PrepSnapshotRequestPost;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.prep.parser.preparation.PrepRuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.Keep;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;
import app.metatron.discovery.prep.parser.preparation.spec.SuggestToken;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RepositoryRestController
public class PrepTransformController {
  private static Logger LOGGER = LoggerFactory.getLogger(PrepTransformController.class);

  @Autowired(required = false)
  PrepTransformService transformService;

  @Value("${polaris.dataprep.sampleRows:10000}")
  private int limitConf;

  @RequestMapping(value = "/preparationdatasets/{dsId}/transform", method = RequestMethod.POST, produces = "application/json")
  public @ResponseBody ResponseEntity<?> create(
    @PathVariable("dsId") String importedDsId,
    @RequestBody PrepTransformRequest request) throws IOException {

    PrepTransformResponse response;
    List<String> setTypeRules;
    LOGGER.trace("create(): start");

    try {
      response = transformService.create(importedDsId, request.getDfId());
    } catch (Exception e) {
      LOGGER.error("create(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    LOGGER.trace("create(): end");
    return ResponseEntity.ok(response);
  }

  // 대상 wrangled dataset과 똑같은 dataset을 생성 (rule도 모두 적용)
  @RequestMapping(value = "/preparationdatasets/{dsId}/clone", method = RequestMethod.POST, produces = "application/json")
  public @ResponseBody ResponseEntity<?> clone(
          @PathVariable("dsId") String wrangledDsId) throws IOException {

    PrepTransformResponse response;

    try {
      response = transformService.clone(wrangledDsId);
    } catch (Exception e) {
      LOGGER.error("clone(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    return ResponseEntity.ok(response);
  }

  /* column 기준 데이터라서 컨트롤러에서 서치하면 성능에 골치아픔. 우선 통짜로 구현함 */
  @RequestMapping(value = "/preparationdatasets/{dsId}/transform", method = RequestMethod.GET, produces = "application/json")
  public @ResponseBody ResponseEntity<?> load(
          @PathVariable("dsId") String wrangledDsId,
          @RequestParam(value = "ruleIdx", required = false, defaultValue = "-2") String rule_index,
          @RequestParam(value = "pageNum", required = false, defaultValue = "0") String page_num,
          @RequestParam(value = "count", required = false, defaultValue = "-1") String count
  ) throws IOException {
    PrepTransformResponse response;
    LOGGER.trace("load(): start");

    try {
      Integer ruleIdx = Integer.valueOf(rule_index);
      Integer fromIndex = 0;
      Integer toIndex = -1;
      Integer requestCount = Integer.valueOf(count);
      if(0<=requestCount) {
        fromIndex = Integer.valueOf(page_num) * requestCount;
        toIndex = fromIndex + requestCount;
      }

      if(ruleIdx<-1) {
        response = transformService.load(wrangledDsId);
      } else {
        response = transformService.transform(wrangledDsId, PrepDataset.OP_TYPE.JUMP, ruleIdx, null);
      }
      DataFrame gridResponse = response.getGridResponse();
      Integer totalRowCnt = response.getTotalRowCnt();

      DataFrame subGrid = new DataFrame();
      subGrid.colCnt = gridResponse.colCnt;
      subGrid.colNames = gridResponse.colNames;
      subGrid.colDescs = gridResponse.colDescs;
      subGrid.colHists = gridResponse.colHists;
      subGrid.mapColno = gridResponse.mapColno;
      subGrid.newColNames           = gridResponse.newColNames          ;
      subGrid.interestedColNames    = gridResponse.interestedColNames   ;
      subGrid.dsName = gridResponse.dsName;
      subGrid.slaveDsNameMap = gridResponse.slaveDsNameMap;
      subGrid.ruleString = gridResponse.ruleString;
      int size = gridResponse.rows.size();
      if(size<toIndex) { toIndex = size; }
      if(fromIndex<toIndex && 0<toIndex) {
        subGrid.rows = gridResponse.rows.subList(fromIndex, toIndex);
      } else {
        subGrid.rows = gridResponse.rows;
      }
      response.setGridResponse(subGrid);
      response.setTotalRowCnt(totalRowCnt); // 전체 count 넣어야함
    } catch (Exception e) {
      LOGGER.error("load(): caught an exception: ", e);
      if (System.getProperty("dataprep").equals("disabled")) {
        throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE, PrepMessageKey.MSG_DP_ALERT_INVALID_CONFIG_CODE);
      }
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    LOGGER.trace("load(): end");
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/{dsId}/transform", method = RequestMethod.PUT, produces = "application/json")
  public @ResponseBody ResponseEntity<?> transform(
    @PathVariable("dsId") String wrangledDsId,
    @RequestBody PrepTransformRequest request) throws IOException {

    PrepTransformResponse response;
    LOGGER.trace("transform(): start");

    try {
      response = transformService.transform(wrangledDsId, request.getOp(), request.getRuleIdx(), request.getRuleString());
    } catch (Exception e) {
      LOGGER.error("transform(): caught an exception: ", e);
      if (System.getProperty("dataprep").equals("disabled")) {
        throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE, PrepMessageKey.MSG_DP_ALERT_INVALID_CONFIG_CODE);
      }
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    LOGGER.trace("transform(): end");
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/{dsId}/transform/histogram", method = RequestMethod.POST, produces = "application/json")
  public @ResponseBody ResponseEntity<?> transform_histogram(
          @PathVariable("dsId") String wrangledDsId,
          @RequestBody PrepHistogramRequest request) throws IOException {

    PrepHistogramResponse response;
    LOGGER.trace("transform_histogram(): start");

    try {
      response = transformService.transform_histogram(wrangledDsId, request.getRuleIdx(), request.getColnos(), request.getColWidths());
    } catch (Exception e) {
      LOGGER.error("transform_histogram(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    LOGGER.trace("transform_histogram(): end");
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/{dsId}/transform/timestampFormat", method = RequestMethod.POST, produces = "application/json")
  public @ResponseBody ResponseEntity<?> transform_timestampFormat(
          @PathVariable("dsId") String wrangledDsId,
          @RequestBody Map<String, Object> params) throws IOException {

    Map<String, Object> response;
    List<String> colNames = (List<String>)params.get("colNames");
    LOGGER.trace("transform_timestampFormat(): start");

    try {
      response = transformService.transform_timestampFormat(wrangledDsId, colNames);
    } catch (Exception e) {
      LOGGER.error("transform_timestampFormat(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    LOGGER.trace("transform_timestampFormat(): end");
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/{dsId}/transform/snapshot", method = RequestMethod.POST, produces = "application/json")
  public @ResponseBody ResponseEntity<?> transform_snapshot(
          @PathVariable("dsId") String wrangledDsId,
          @RequestBody PrepSnapshotRequestPost request,
          @RequestHeader(value="Authorization") String authorization) throws Throwable {

    PrepSnapshotResponse response;
    LOGGER.trace("transform_snapshot(): start");

    try {
      response = transformService.transform_snapshot(wrangledDsId, request, authorization);
    } catch (Exception e) {
      LOGGER.error("transform_snapshot(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    LOGGER.trace("transform_snapshot(): end");
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/{dsId}/transform/configuration", method = RequestMethod.GET, produces = "application/json")
  public @ResponseBody ResponseEntity<?> transform_configuration(
          @PathVariable("dsId") String wrangledDsId ) {

    Map<String, Object> response;
    LOGGER.trace("transform_configuration(): start");

    try {
      response = transformService.getConfiguration(wrangledDsId);
    } catch (Exception e) {
      LOGGER.error("transform_snapshot(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    LOGGER.trace("transform_configuration(): end");
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/cacheInfo", method = RequestMethod.GET, produces = "application/json")
  public @ResponseBody ResponseEntity<?> getCacheInfo() throws IOException {

    PrepTransformResponse response;

    try {
      response = transformService.getCacheInfo();
    } catch (Exception e) {
      LOGGER.error("getCacheInfo(): caught an exception: ", e);
      if (System.getProperty("dataprep").equals("disabled")) {
        throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE, PrepMessageKey.MSG_DP_ALERT_INVALID_CONFIG_CODE);
      }
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/autocomplete", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> autocomplete(
          @RequestBody Map<String,Object> params) throws Throwable {
    Map<String,Object> response;

    try {
      response = Maps.newHashMap();
      List<SuggestToken> suggests = Lists.newArrayList();

      String ruleString = (String)params.get("ruleString");
      String ruleCommand = (String)params.get("ruleCommand");
      String rulePart = (String)params.get("rulePart");

      if( null==ruleCommand || null==rulePart ) {
        PrepRuleVisitorParser prepRuleVisitorParser = new PrepRuleVisitorParser();
        suggests = prepRuleVisitorParser.suggest(ruleString);
      } else if( ruleCommand.equalsIgnoreCase("keep")
              || ruleCommand.equalsIgnoreCase("set")
              || ruleCommand.equalsIgnoreCase("derive")
              || ruleCommand.equalsIgnoreCase("delete")
          ) {
        PrepRuleVisitorParser prepRuleVisitorParser = new PrepRuleVisitorParser();
        suggests = prepRuleVisitorParser.suggest_all_rules(rulePart);
      } else if( ruleCommand.equalsIgnoreCase("pivot")
              || ruleCommand.equalsIgnoreCase("aggregate")
          ) {
        PrepRuleVisitorParser prepRuleVisitorParser = new PrepRuleVisitorParser();
        suggests = prepRuleVisitorParser.suggest_aggr_rules(rulePart);
      }

      response.put("suggest", suggests);
    } catch (Exception e) {
      LOGGER.error("autocomplete(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/parse_rule", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> parse_rule(
          @RequestBody String ruleString) throws Throwable {
    Map<String,Object> response;

    try {
      response = Maps.newHashMap();

      Rule rule = new RuleVisitorParser().parse(ruleString);

      /*
      ObjectMapper mapper = new ObjectMapper();
      String json = null;
      try {
        json = mapper.writeValueAsString(rule);
      } catch (JsonProcessingException e) {
        e.printStackTrace();
      }
      */

      response.put("rule", rule);
    } catch (Exception e) {
      LOGGER.error("autocomplete(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED);
    }
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/validate_expr", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> validate_expr(
          @RequestBody String exprString) throws Throwable {
    Map<String,Object> response;

    try {
      response = Maps.newHashMap();

      String ruleString = "keep row: " + exprString;
      Rule rule = new RuleVisitorParser().parse(ruleString);
      Keep keepRule = (Keep)rule;
      Expression expr = keepRule.getRow();
      if(null!=expr) {
        response.put("expr", expr);
      } else {
        throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED);
      }
    } catch (PrepException e) {
      throw e;
    } catch (Exception e) {
      LOGGER.error("autocomplete(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, PrepMessageKey.MSG_DP_ALERT_TEDDY_PARSE_FAILED);
    }
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value="/preparationsnapshots/{ssId}/cancel",method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> cancelSnapshot(
          @PathVariable("ssId") String ssId,
          @RequestHeader(value="Authorization") String authorization) {
    Map<String,Object> response;

    try {
      response = Maps.newHashMap();

      transformService.cancelSnapshot(ssId);
    } catch (Exception e) {
      LOGGER.error("cancelCreate(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    return ResponseEntity.ok(response);
  }
}
