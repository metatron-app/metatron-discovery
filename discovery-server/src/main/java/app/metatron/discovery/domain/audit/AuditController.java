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

package app.metatron.discovery.domain.audit;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.querydsl.core.types.Predicate;
import com.univocity.parsers.csv.CsvWriterSettings;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.entity.ContentType;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.util.BeanUtils;
import app.metatron.discovery.util.CsvProcessor;
import app.metatron.discovery.util.HttpUtils;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

@RepositoryRestController
public class AuditController {

  private static Logger LOGGER = LoggerFactory.getLogger(AuditController.class);

  @Autowired
  AuditRepository auditRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  ProjectionFactory projectionFactory;

  @RequestMapping(path = "/audits", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> auditList(
          @RequestParam(value = "searchKeyword", required = false) String searchKeyword,
          @RequestParam(value = "status", required = false) String status,
          @RequestParam(value = "type", required = false) String type,
          @RequestParam(value = "user", required = false) String user,
          @RequestParam(value = "elapsedTime", required = false) Long elapsedTime,
          @RequestParam(value = "from", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
          @RequestParam(value = "to", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
          Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {

    LOGGER.debug("searchKeyword : {}", searchKeyword);
    LOGGER.debug("status : {}", status);
    LOGGER.debug("type : {}", type);
    LOGGER.debug("user : {}", user);
    LOGGER.debug("elapsedTime : {}", elapsedTime);
    LOGGER.debug("from : {}", from);
    LOGGER.debug("to : {}", to);
    LOGGER.debug("pageable : {}", pageable);

    // Validate Status
    Audit.AuditStatus searchStatus = SearchParamValidator.enumUpperValue(Audit.AuditStatus.class, status, "status");
    Audit.AuditType searchAuditType = SearchParamValidator.enumUpperValue(Audit.AuditType.class, type, "type");

    SearchParamValidator.range(null, from, to);

    // Get Predicate
    Predicate searchPredicated = AuditPredicate.searchList(searchKeyword, searchStatus, searchAuditType, from, to, user, elapsedTime);

    // 기본 정렬 조건 셋팅
    if(pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
              new Sort(Sort.Direction.ASC, "startTime"));
    }

    Page<Audit> audits = auditRepository.findAll(searchPredicated, pageable);
    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(audits, resourceAssembler));
  }

  @RequestMapping(path = "/audits/queryIds/{queryId}", method = {RequestMethod.PATCH, RequestMethod.POST})
  @ResponseBody
  public ResponseEntity<?> auditUpdateByQueryId(@PathVariable String queryId, @RequestBody Audit requestBody) {

    LOGGER.debug("queryId : {}", queryId);
    LOGGER.debug("requestBody : {}", requestBody);

    List<Audit> targetAudits = auditRepository.findByQueryId(queryId);
    if(targetAudits == null || targetAudits.size() == 0) {
      throw new ResourceNotFoundException(queryId);
    }

    Audit targetAudit = targetAudits.get(0);
    BeanUtils.copyPropertiesNullAware(targetAudit, requestBody);

    //elapsedTime이 없을 경우 계산
    if(targetAudit.getElapsedTime() == null && targetAudit.getStartTime() != null && targetAudit.getFinishTime() != null){
      Long startMilis = targetAudit.getStartTime().toDate().getTime();
      Long finishMilis = targetAudit.getFinishTime().toDate().getTime();
      Long elapsedTime = finishMilis - startMilis;
      if(elapsedTime > 0)
        targetAudit.setElapsedTime(elapsedTime);
    }

    //Resource 증분 계산
    //1. 기본값은 vocreSeconds, memorySeconds.
    targetAudit.setIncrementVcoreSeconds(targetAudit.getVcoreSeconds());
    targetAudit.setIncrementMemorySeconds(targetAudit.getMemorySeconds());

    //2. 동일한 ApplicationId로 이전 데이터 여부 조회함.
    if(StringUtils.isNotEmpty(requestBody.getApplicationId())
            && requestBody.getVcoreSeconds() != null
            && requestBody.getVcoreSeconds() > 0L){
      Audit lastAudit = auditRepository.findTop1ByApplicationIdAndVcoreSecondsLessThanOrderByVcoreSecondsDesc(
              targetAudit.getApplicationId(), requestBody.getVcoreSeconds());

      if(lastAudit != null){
        Long lastVcoreSeconds = lastAudit.getVcoreSeconds();
        Long lastMemorySeconds = lastAudit.getMemorySeconds();

        if(lastVcoreSeconds != null && lastVcoreSeconds > 0){
          Long incrementVcoreSeconds = requestBody.getVcoreSeconds() - lastVcoreSeconds;
          targetAudit.setIncrementVcoreSeconds(incrementVcoreSeconds);
        }

        if(lastMemorySeconds != null && lastMemorySeconds > 0){
          Long incrementMemorySeconds = requestBody.getMemorySeconds() - lastMemorySeconds;
          targetAudit.setIncrementMemorySeconds(incrementMemorySeconds);
        }
      }
    }

    auditRepository.saveAndFlush(targetAudit);
    return ResponseEntity.noContent().build();
  }


  @RequestMapping(path = "/audits/stats/query/count/date", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> countByStatusDate(
          @RequestParam(value = "type", required = false) Audit.AuditType auditType,
          @RequestParam(value = "user", required = false) String user,
          @RequestParam(value = "from", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
          @RequestParam(value = "to", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to) {

    LOGGER.debug("type : {}", auditType);
    LOGGER.debug("user : {}", user);
    LOGGER.debug("from : {}", from);
    LOGGER.debug("to : {}", to);

    SearchParamValidator.range(null, from, to);

    // Get Predicate
    Predicate searchPredicated = AuditPredicate.searchList(null, null, auditType, from, to, user, null);

    List<AuditStatsDto> auditStatsDtoList = auditRepository.countStatusByDate(searchPredicated);

    Map<String, Map> mapByDate = new LinkedHashMap<>();
    for(AuditStatsDto auditStatsDto : auditStatsDtoList){
      Map<Audit.AuditStatus, Long> countMap = mapByDate.get(auditStatsDto.getKeyword());
      if(countMap == null){
        countMap = new HashMap<>();
        mapByDate.put(auditStatsDto.getKeyword(), countMap);
      }
      countMap.put(auditStatsDto.getAuditStatus(), auditStatsDto.getCount());
    }

    List<String> seriesNames = new ArrayList<>();
    seriesNames.add("SUCCESS");
    seriesNames.add("FAIL");
    LineChartSeriesResponse<DateTime> result = new LineChartSeriesResponse<>(seriesNames);

    mapByDate.entrySet().forEach(map -> {
      String yearAndDayOfYear = map.getKey();
      DateTime dateTime
          = new DateTime(Integer.parseInt(yearAndDayOfYear.substring(0, 4)), 1, 1, 0, 0, DateTimeZone.UTC)
                        .plusDays(Integer.parseInt(yearAndDayOfYear.substring(4)) - 1);

      Map<Audit.AuditStatus, Long> cntMap = map.getValue();
      result.add(dateTime, cntMap.get(Audit.AuditStatus.SUCCESS), cntMap.get(Audit.AuditStatus.FAIL));
    });


    return ResponseEntity.ok(result);
  }

  @RequestMapping(path = "/audits/stats/query/count/user", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> countByUser(
          @RequestParam(value = "type", required = false) Audit.AuditType auditType,
          @RequestParam(value = "from", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
          @RequestParam(value = "to", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to) {

    LOGGER.debug("type : {}", auditType);
    LOGGER.debug("from : {}", from);
    LOGGER.debug("to : {}", to);

    SearchParamValidator.range(null, from, to);

    Predicate searchPredicated = AuditPredicate.searchList(null, null, auditType, from, to, null, null);

    List<AuditStatsDto> auditStatsDtoList = auditRepository.countByUser(searchPredicated);

    HashMap<String, Long> result = new LinkedHashMap<>();
    for(AuditStatsDto auditStatsDto : auditStatsDtoList){
      if(auditStatsDto.getKeyword() == null){
        continue;
      }
      result.put(auditStatsDto.getKeyword(), auditStatsDto.getCount());
    }
    return ResponseEntity.ok(result);
  }

  @RequestMapping(path = "/audits/stats/query/count/status", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> countByStatus(
          @RequestParam(value = "type", required = false) Audit.AuditType auditType,
          @RequestParam(value = "user", required = false) String user,
          @RequestParam(value = "from", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
          @RequestParam(value = "to", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
          @RequestParam(value = "auditStatus") String auditStatus,
          Pageable pageable) {

    LOGGER.debug("auditStatus : {}", auditStatus);
    LOGGER.debug("type : {}", auditType);
    LOGGER.debug("user : {}", user);
    LOGGER.debug("from : {}", from);
    LOGGER.debug("to : {}", to);
    LOGGER.debug("pageable : {}", pageable);

    SearchParamValidator.range(null, from, to);

    Audit.AuditStatus queryResultStatusEnum =
            SearchParamValidator.enumUpperValue(Audit.AuditStatus.class, auditStatus, "auditStatus");

    // Get Predicate
    Predicate searchPredicated = AuditPredicate.searchList(null, queryResultStatusEnum, auditType, from, to, user, null);

    if(pageable == null){
      pageable = new PageRequest(0, 10);
    }

    Page<AuditStatsDto> audits = auditRepository.countByStatus(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(audits));
  }

  @RequestMapping(path = "/audits/stats/queue/sum/resource", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> sumResourceByQueue(
          @RequestParam(value = "type", required = false) Audit.AuditType auditType,
          @RequestParam(value = "user", required = false) String user,
          @RequestParam(value = "from", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
          @RequestParam(value = "to", required = false)
          @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
          Pageable pageable) {

    LOGGER.debug("type : {}", auditType);
    LOGGER.debug("user : {}", user);
    LOGGER.debug("from : {}", from);
    LOGGER.debug("to : {}", to);
    LOGGER.debug("pageable : {}", pageable);

    SearchParamValidator.range(null, from, to);

    // Get Predicate
    Predicate searchPredicated = AuditPredicate.searchList(null, null, auditType, from, to, user, null);

    if(pageable == null){
      pageable = new PageRequest(0, 10);
    }

    Page<AuditStatsDto> audits = auditRepository.sumResourceByQueue(searchPredicated, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(audits));
  }

  @RequestMapping(path = "/audits/download", method = POST, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
  public void downloadResultForm(@RequestParam Map<String, Object> requestParam, HttpServletResponse response) throws IOException {
    download(requestParam, response);
  }

  @RequestMapping(path = "/audits/download", method = POST, consumes = MediaType.APPLICATION_JSON_VALUE)
  public void downloadResultJson(@RequestBody Map<String, Object> requestBody, HttpServletResponse response) throws IOException {
    download(requestBody, response);
  }

  private void download(Map<String, Object> requestBody, HttpServletResponse response) throws IOException{
    String fileName = (String) requestBody.get("fileName");
    String searchKeyword = (String) requestBody.get("searchKeyword");
    String status = (String) requestBody.get("status");
    String type = (String) requestBody.get("type");
    String user = (String) requestBody.get("user");
    Long elapsedTime = requestBody.get("elapsedTime") == null ? null : Long.valueOf((String) requestBody.get("elapsedTime"));
    DateTime from = requestBody.get("from") == null ? null : new DateTime(requestBody.get("from"));
    DateTime to = requestBody.get("to") == null ? null : new DateTime(requestBody.get("to"));

    LOGGER.debug("searchKeyword : {}", searchKeyword);
    LOGGER.debug("status : {}", status);
    LOGGER.debug("type : {}", type);
    LOGGER.debug("user : {}", user);
    LOGGER.debug("elapsedTime : {}", elapsedTime);
    LOGGER.debug("from : {}", from);
    LOGGER.debug("to : {}", to);

    // Validate Status
    Audit.AuditStatus searchStatus = SearchParamValidator.enumUpperValue(Audit.AuditStatus.class, status, "status");
    Audit.AuditType searchAuditType = SearchParamValidator.enumUpperValue(Audit.AuditType.class, type, "type");

    SearchParamValidator.range(null, from, to);

    // Get Predicate
    Predicate searchPredicated = AuditPredicate.searchList(searchKeyword, searchStatus, searchAuditType, from, to, user, elapsedTime);

    // 기본 정렬 조건 셋팅

    List<Audit> audits = (List) auditRepository.findAll(searchPredicated, new Sort(Sort.Direction.DESC, "startTime"));

    if(audits.size() == 0){
      throw new ResourceNotFoundException("Audits");
    }

    if(StringUtils.isEmpty(fileName)){
      fileName = "noname";
    }

    String filePath = "/tmp" + File.separator + fileName + ".csv";

    CsvProcessor.writeBeans(filePath, new CsvWriterSettings(), audits, Audit.class);
    HttpUtils.downloadCSVFile(response, fileName + ".csv", filePath, ContentType.create("text/csv", Charset.defaultCharset()));
  }

  public class LineChartSeriesResponse<T> {
    List<T> x = Lists.newArrayList();
    Map<String, List<Long>> series;

    @JsonIgnore
    List<String> seriesNames;

    public LineChartSeriesResponse(List<String> seriesNames) {
      this.seriesNames = seriesNames;
      this.series = new HashMap<>();

      for (int i = 0; i < seriesNames.size(); i++) {
        List<Long> seriesValueList = Lists.newArrayList();
        series.put(seriesNames.get(i), seriesValueList);
      }
    }

    public void add(T x, Long... seriesValues) {
      this.x.add(x);

      if (seriesValues == null || seriesValues.length != this.series.size()) {
        series.entrySet().forEach((y) -> y.getValue().add(null));
        return;
      }

      for (int i = 0; i < seriesValues.length; i++) {
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
