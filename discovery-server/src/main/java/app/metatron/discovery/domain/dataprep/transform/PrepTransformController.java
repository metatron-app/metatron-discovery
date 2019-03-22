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

import app.metatron.discovery.domain.dataprep.PrepSnapshotRequestPost;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.domain.dataprep.rule.ExprFunction;
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

  @RequestMapping(value = "/preparationdatasets/{dsId}/transform", method = RequestMethod.POST, produces = "application/json")
  public @ResponseBody ResponseEntity<?> create(
    @PathVariable("dsId") String importedDsId,
    @RequestBody PrepTransformRequest request) throws IOException {

    PrepTransformResponse response;
    LOGGER.trace("create(): start");

    try {
      response = transformService.create(importedDsId, request.getDfId(), null);
    } catch (Exception e) {
      LOGGER.error("create(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    LOGGER.trace("create(): end");
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/{oldDsId}/swap/{newDsId}", method = RequestMethod.POST, produces = "application/json")
  public @ResponseBody ResponseEntity<?> swap(
          @PathVariable("oldDsId") String oldDsId,
          @PathVariable("newDsId") String newDsId) throws Throwable {
    try {
      List<String> affectedDsIds = transformService.swap(oldDsId, newDsId);
      transformService.after_swap(affectedDsIds);
    } catch (Exception e) {
      LOGGER.error("swap(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    return ResponseEntity.ok(new PrepTransformResponse());
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

  private DataFrame getSubGrid(DataFrame gridResponse, int offset, int count) {
    assert count >= 0;

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

    // returns without subList()
    if (offset == 0 && count >= gridResponse.rows.size()) {
      subGrid.rows = gridResponse.rows;
    } else {
      int toIndex = offset + count;
      if(gridResponse.rows.size()<toIndex) {
        toIndex = gridResponse.rows.size();
      }

      subGrid.rows = gridResponse.rows.subList(offset, toIndex);
    }

    return subGrid;
  }

  /* column 기준 데이터라서 컨트롤러에서 서치하면 성능에 골치아픔. 우선 통짜로 구현함 */
  @RequestMapping(value = "/preparationdatasets/{dsId}/transform", method = RequestMethod.GET, produces = "application/json")
  public @ResponseBody ResponseEntity<?> fetch(
          @PathVariable("dsId") String wrangledDsId,
          @RequestParam(value = "ruleIdx") Integer stageIdx,
          @RequestParam(value = "offset") int offset,
          @RequestParam(value = "count") int count
  ) throws IOException {
    PrepTransformResponse response;
    LOGGER.trace("fetch(): start");

    try {
      // stageIdx should be 0 or positive or null.
      assert stageIdx == null || stageIdx >= 0 : stageIdx;

      response = transformService.fetch(wrangledDsId, stageIdx);
      Integer totalRowCnt = response.getGridResponse().rows!=null?response.getGridResponse().rows.size():0;
      response.setGridResponse(getSubGrid(response.getGridResponse(), offset, count));
      response.setTotalRowCnt( totalRowCnt );
    } catch (Exception e) {
      LOGGER.error("fetch(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    LOGGER.trace("fetch(): end");
    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/{dsId}/transform", method = RequestMethod.PUT, produces = "application/json")
  public @ResponseBody ResponseEntity<?> transform(
    @PathVariable("dsId") String wrangledDsId,
    @RequestBody PrepTransformRequest request) throws IOException {

    PrepTransformResponse response;
    LOGGER.trace("transform(): start");

    assert request.getCount() != null;

    try {
      // stageIdx should be 0 or positive or null.
      Integer stageIdx = request.getRuleIdx();
      assert stageIdx == null || stageIdx >= 0 : stageIdx;

      response = transformService.transform(wrangledDsId, request.getOp(), stageIdx, request.getRuleString(), request.getUiRuleString(), false);
    } catch (Exception e) {
      LOGGER.error("transform(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    LOGGER.trace("transform(): end");


    Integer totalRowCnt = response.getGridResponse().rows!=null?response.getGridResponse().rows.size():0;
    response.setGridResponse(getSubGrid(response.getGridResponse(), 0, request.getCount()));
    response.setTotalRowCnt( totalRowCnt );

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
      } else if( ruleCommand.equalsIgnoreCase("window")
              ) {
        PrepRuleVisitorParser prepRuleVisitorParser = new PrepRuleVisitorParser();
        suggests = prepRuleVisitorParser.suggest_window_rules(rulePart);
      }

      for(SuggestToken suggest : suggests) {
        if( suggest.getTokenString().equals("'@_FUNCTION_EXPRESSION_@'") ) {
          suggests.remove(suggest);
          suggests.add(1,suggest);
          break;
        }
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
          @PathVariable("ssId") String ssId) {
    Map<String,Object> response;

    try {
      response = Maps.newHashMap();

      String result = transformService.cancelSnapshot(ssId);
      response.put("result", result);
    } catch (Exception e) {
      LOGGER.error("cancelCreate(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }

    return ResponseEntity.ok(response);
  }

  @RequestMapping(value = "/preparationdatasets/function_list", method = RequestMethod.GET, produces = "application/json")
  public @ResponseBody ResponseEntity<?> getFunctionList() throws IOException {

    Map<String,Object> response = Maps.newHashMap();

    try {
      List<ExprFunction> functionList = this.transformService.getFunctionList();
      response.put("function_list",functionList);
    } catch (Exception e) {
      LOGGER.error("getCacheInfo(): caught an exception: ", e);
      throw PrepException.create(PrepErrorCodes.PREP_TRANSFORM_ERROR_CODE, e);
    }
    return ResponseEntity.ok(response);
  }
}
