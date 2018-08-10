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

package app.metatron.discovery.domain.workbench;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.querydsl.core.types.Predicate;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.util.TimeUtils;

@RepositoryRestController
public class QueryHistoryController {

  private static Logger LOGGER = LoggerFactory.getLogger(QueryHistoryController.class);

  @Autowired
  QueryHistoryRepository queryHistoryRepository;

  @Autowired
  QueryEditorRepository queryEditorRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @RequestMapping(path = "/queryhistories/list", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> queryHistoryList(
          @RequestParam("queryEditorId") String queryEditorId,
          @RequestParam(required = false) String queryPattern,
          Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {
    LOGGER.debug("queryEditorId : {}", queryEditorId);
    LOGGER.debug("queryPattern : {}", queryPattern);
    LOGGER.debug("pageable : {}", pageable);

    // Get Predicate
    Predicate searchPredicated = QueryHistoryPredicate.searchListNotDeleted(queryEditorId, queryPattern);

    // 기본 정렬 조건 셋팅
    if(pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
              new Sort(Sort.Direction.ASC, "createdTime", "name"));
    }
    Page<QueryHistory> queryHistories = queryHistoryRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(queryHistories, resourceAssembler));
  }

  @RequestMapping(path = "/queryhistories/deleteAll", method = RequestMethod.DELETE)
  @ResponseBody
  public ResponseEntity<?> queryHistoryDeleteAll(@RequestParam("queryEditorId") String queryEditorId,
                                                 @RequestParam(required = false) String searchKeyword) {

    // Get Predicate
    Predicate searchPredicated = QueryHistoryPredicate.searchListNotDeleted(queryEditorId, searchKeyword);
    List<QueryHistory> queryHistories = (List) queryHistoryRepository.findAll(searchPredicated);

    if(queryHistories != null){
    queryHistories.stream().forEach(e -> e.setDeleted(true));
      queryHistoryRepository.save(queryHistories);
      queryHistoryRepository.flush();
    }

    return ResponseEntity.noContent().build();
  }

  @RequestMapping(path = "/queryhistories", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> searchQueryHistories(
          @RequestParam(value = "queryEditorId", required = false) String queryEditorId,
          @RequestParam(value = "dataConnectionId", required = false) String dataConnectionId,
          @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
          @RequestParam(value = "queryResultStatus", required = false) String queryResultStatus,
          @RequestParam(value = "from", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
          @RequestParam(value = "to", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
          Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    LOGGER.debug("queryEditorId : {}", queryEditorId);
    LOGGER.debug("dataConnectionId : {}", dataConnectionId);
    LOGGER.debug("searchKeyword : {}", searchKeyword);
    LOGGER.debug("queryResultStatus : {}", queryResultStatus);
    LOGGER.debug("from : {}", from);
    LOGGER.debug("to : {}", to);
    LOGGER.debug("pageable : {}", pageable);

    QueryResult.QueryResultStatus queryResultStatusEnum = SearchParamValidator
            .enumUpperValue(QueryResult.QueryResultStatus.class, queryResultStatus, "queryResultStatus");

    SearchParamValidator.range("CREATED", from, to);

    // Get Predicate
    Predicate searchPredicated = QueryHistoryPredicate.searchList(queryEditorId, dataConnectionId, searchKeyword,
            from, to, queryResultStatusEnum);

    // 기본 정렬 조건 셋팅
    if(pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
              new Sort(Sort.Direction.DESC, "createdTime"));
    }

    Page<QueryHistory> queryHistories = queryHistoryRepository.findAll(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(queryHistories, resourceAssembler));
  }

  @RequestMapping(path = "/queryhistories/stats/count/date", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> searchQueryHistoryCountByStatusDate(@RequestParam(value = "duration", defaultValue = "-P1D") String duration) {

    LOGGER.debug("duration : {}", duration);

    // http://www.kanzaki.com/docs/ical/duration-t.html
    if(!duration.matches(TimeUtils.PATTERN_DURATION_FORMAT.pattern()) ) {
      throw new IllegalArgumentException("Invalid 'duration' parameter. see icalendar duration expression.");
    }

    List<Object[]> objects = queryHistoryRepository.countStatusByDate(TimeUtils.getDateTimeByDuration(DateTime.now(), duration));

    List<String> seriesNames = new ArrayList<>();
    seriesNames.add("SUCCESS");
    seriesNames.add("FAIL");
    LineChartSeriesResponse<DateTime> result = new LineChartSeriesResponse<>(seriesNames);
    for(Object[] row : objects) {
      if(row.length == 5) {
        DateTime time = new DateTime(DateTimeZone.UTC)
                .withDate((Integer) row[0], (Integer) row[1], (Integer) row[2])
                .withTime(0, 0, 0, 0);
        result.add(time, ((Long) row[3]),((Long) row[4]));
      }
    }

    return ResponseEntity.ok(result);
  }

  @RequestMapping(path = "/queryhistories/stats/count/user", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> searchQueryHistoryCountByUser(@RequestParam(value = "duration", defaultValue = "-P1D") String duration) {

    LOGGER.debug("duration : {}", duration);

    // http://www.kanzaki.com/docs/ical/duration-t.html
    if(!duration.matches(TimeUtils.PATTERN_DURATION_FORMAT.pattern()) ) {
      throw new IllegalArgumentException("Invalid 'duration' parameter. see icalendar duration expression.");
    }

    List<Object[]> objects = queryHistoryRepository.countHistoryByUser(TimeUtils.getDateTimeByDuration(DateTime.now(), duration));

    HashMap<String, Long> result = new HashMap<>();
    for(Object[] row : objects) {
      if(row.length == 2) {
        String userName = (String) row[0];
        result.put(userName, ((Long) row[1]));
      }
    }

    return ResponseEntity.ok(result);
  }

  @RequestMapping(path = "/queryhistories/stats/count/elapsed", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> searchQueryHistoryCountByElapsed(@RequestParam(value = "duration", defaultValue = "-P1D") String duration) {

    LOGGER.debug("duration : {}", duration);

    // http://www.kanzaki.com/docs/ical/duration-t.html
    if(!duration.matches(TimeUtils.PATTERN_DURATION_FORMAT.pattern()) ) {
      throw new IllegalArgumentException("Invalid 'duration' parameter. see icalendar duration expression.");
    }

    List<Object[]> objects = queryHistoryRepository.countHistoryByElaspedTime(TimeUtils.getDateTimeByDuration(DateTime.now(), duration));

    HashMap<String, Long> result = new HashMap<>();
    for(Object[] row : objects) {
      if(row.length == 3) {
        //< 1 Min
        if((Long) row[0] > 0){
          result.put("Segment1", ((Long) row[0]));
        }

        //< 5 Min
        if((Long) row[1] > 0){
          result.put("Segment2", ((Long) row[1]));
        }

        //5 Min >
        if((Long) row[2] > 0){
          result.put("Segment3", ((Long) row[2]));
        }
      }
    }

    return ResponseEntity.ok(result);
  }

  @RequestMapping(path = "/queryhistories/stats/count/query", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> searchQueryHistoryCountByQuery(@RequestParam(value = "size", defaultValue = "5") int size,
                                                          @RequestParam(value = "queryResultStatus") String queryResultStatus) {

    LOGGER.debug("size : {}", size);
    LOGGER.debug("queryResultStatus : {}", queryResultStatus);

    QueryResult.QueryResultStatus queryResultStatusEnum = SearchParamValidator
            .enumUpperValue(QueryResult.QueryResultStatus.class, queryResultStatus, "queryResultStatus");

    PageRequest pageable = new PageRequest(0, size, new Sort(Sort.Direction.DESC, "cnt"));
    Page<Object[]> objects = queryHistoryRepository.countHistoryByQuery(queryResultStatusEnum, pageable);

    List<HashMap> result = new ArrayList<>();
    for(Object[] row : objects.getContent()) {
      if(row.length == 2) {
        HashMap<String, Object> resultMap = new HashMap<>();
        resultMap.put("query", row[0]);
        resultMap.put("count", row[1]);
        result.add(resultMap);
      }
    }
    return ResponseEntity.ok(result);
  }

  public class LineChartSeriesResponse<T> {
    List<T> x = Lists.newArrayList();
    Map<String, List<Long>> series;

    @JsonIgnore
    List<String> seriesNames;

    public LineChartSeriesResponse(List<String> seriesNames) {
      this.seriesNames = seriesNames;
      this.series = new HashMap<>();

      for(int i = 0; i<seriesNames.size(); i++) {
        List<Long> seriesValueList = Lists.newArrayList();
        series.put(seriesNames.get(i), seriesValueList);
      }
    }

    public void add(T x, Long...seriesValues) {
      this.x.add(x);

      if(seriesValues == null || seriesValues.length != this.series.size()) {
        series.entrySet().forEach((y) -> y.getValue().add(null));
        return;
      }

      for(int i = 0; i<seriesValues.length; i++) {
        String seriesName = this.seriesNames.get(i);
        series.get(seriesName).add(seriesValues[i]);
      }

    }

    public List<T> getX() {
      return x;
    }

    public void setX(List<T> x) {
      this.x = x;
    }

    public Map<String, List<Long>> getSeries() {
      return series;
    }

    public void setSeries(Map<String, List<Long>> series) {
      this.series = series;
    }

    public List<String> getSeriesNames() {
      return seriesNames;
    }

    public void setSeriesNames(List<String> seriesNames) {
      this.seriesNames = seriesNames;
    }
  }
}
