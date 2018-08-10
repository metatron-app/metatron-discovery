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

package app.metatron.discovery.domain.datasource.data;

import com.google.common.collect.Lists;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.config.ApiResourceConfig;
import app.metatron.discovery.domain.datasource.DataSourceQueryHistory;
import app.metatron.discovery.domain.datasource.DataSourceQueryHistoryPredicate;
import app.metatron.discovery.domain.datasource.DataSourceQueryHistoryProjections;
import app.metatron.discovery.domain.datasource.DataSourceQueryHistoryRepository;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.DataSourceSizeHistoryRepository;
import app.metatron.discovery.util.ProjectionUtils;
import app.metatron.discovery.util.TimeUtils;

/**
 * Created by kyungtaak on 2016. 8. 31..
 */
@RestController
@RequestMapping(value = ApiResourceConfig.API_PREFIX)
public class DataQueryHistoryController {

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  DataSourceQueryHistoryRepository queryHistoryRepository;

  @Autowired
  DataSourceSizeHistoryRepository sizeHistoryRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  ProjectionFactory projectionFactory;

  DataSourceQueryHistoryProjections queryHistoryProjections = new DataSourceQueryHistoryProjections();

  @RequestMapping(value = "/datasources/{id}/query/histories", method = RequestMethod.GET)
  public ResponseEntity<?> findQueryHistories(@PathVariable("id") String dataSourceId,
                                              @RequestParam(value = "queryType", required = false) String queryType,
                                              @RequestParam(value = "succeed", required = false) Boolean succeed,
                                              @RequestParam(value = "from", required = false)
                                                @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
                                              @RequestParam(value = "to", required = false)
                                                @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
                                              @RequestParam(value = "projection", required = false, defaultValue = "default") String projection,
                                              Pageable pageable) {

    if (dataSourceRepository.findOne(dataSourceId) == null) {
      throw new ResourceNotFoundException(dataSourceId);
    }

    DataSourceQueryHistory.QueryType type = SearchParamValidator.enumUpperValue(DataSourceQueryHistory.QueryType.class, queryType, "queryType");

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
                                 new Sort(Sort.Direction.DESC, "createdTime"));
    }

    Page<DataSourceQueryHistory> results = queryHistoryRepository.findAll(
        DataSourceQueryHistoryPredicate.searchList(dataSourceId, type, succeed, from, to), pageable);

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(ProjectionUtils.toPageResource(projectionFactory,
                                                                                               queryHistoryProjections.getProjectionByName(projection),
                                                                                               results)));
  }

  @RequestMapping(value = "/datasources/{id}/query/histories/{historyId}", method = RequestMethod.GET)
  public ResponseEntity<?> findQueryHistories(@PathVariable("id") String dataSourceId,
                                              @PathVariable("historyId") String historyId,
                                              @RequestParam(value = "projection", required = false, defaultValue = "default") String projection) {

    if (dataSourceRepository.findOne(dataSourceId) == null) {
      throw new ResourceNotFoundException(dataSourceId);
    }

    DataSourceQueryHistory history = queryHistoryRepository.findOne(historyId);
    if (history == null) {
      throw new ResourceNotFoundException(historyId);
    }

    return ResponseEntity.ok(ProjectionUtils.toResource(projectionFactory,
                                                        queryHistoryProjections.getProjectionByName(projection),
                                                        history));
  }

  @RequestMapping(value = "/datasources/{id}/query/histories/stats/count", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> findByQueryCountPerHour(@PathVariable("id") String dataSourceId,
                                              @RequestParam(value = "duration", defaultValue = "-P1D") String duration) {
    if (dataSourceRepository.findOne(dataSourceId) == null) {
      return ResponseEntity.notFound().build();
    }

    // http://www.kanzaki.com/docs/ical/duration-t.html
    if(!duration.matches(TimeUtils.PATTERN_DURATION_FORMAT.pattern()) ) {
      throw new IllegalArgumentException("Invalid 'duration' parameter. see icalendar duration expression.");
    }

    List<Object> objects = queryHistoryRepository.findByQueryCountPerHour(dataSourceId,
            TimeUtils.getDateTimeByDuration(DateTime.now(), duration));

    ChartSeriesResponse<DateTime> result = new ChartSeriesResponse<>(1);
    for(Object obj : objects) {
      Object[] row = (Object[]) obj;
      if(row.length == 5) {
        DateTime time = new DateTime(DateTimeZone.UTC)
                .withDate((Integer) row[0], (Integer) row[1], (Integer) row[2])
                .withTime((Integer) row[3], 0, 0, 0);
        result.add(time, ((Long) row[4]) * 1d);
      }
    }

    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/datasources/{id}/query/histories/stats/user", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> findByQueryCountPerUser(@PathVariable("id") String dataSourceId,
                                                   @RequestParam(value = "duration", defaultValue = "-P1D") String duration) {
    if (dataSourceRepository.findOne(dataSourceId) == null) {
      return ResponseEntity.notFound().build();
    }

    // http://www.kanzaki.com/docs/ical/duration-t.html
    if(!duration.matches(TimeUtils.PATTERN_DURATION_FORMAT.pattern()) ) {
      throw new IllegalArgumentException("Invalid 'duration' parameter. see icalendar duration expression.");
    }

    List<Object> objects = queryHistoryRepository.findByQueryCountPerUser(dataSourceId,
            TimeUtils.getDateTimeByDuration(DateTime.now(), duration));

    ChartSeriesResponse<String> result = new ChartSeriesResponse<>(1);
    for(Object obj : objects) {
      Object[] row = (Object[]) obj;
      if(row.length == 2) {
        result.add((String) row[0], ((Long) row[1]) * 1d);
      }
    }

    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/datasources/{id}/query/histories/stats/elapsed", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> findByQueryCountPerElapsedTime(@PathVariable("id") String dataSourceId,
                                                   @RequestParam(value = "duration", defaultValue = "-P1D") String duration) {
    if (dataSourceRepository.findOne(dataSourceId) == null) {
      return ResponseEntity.notFound().build();
    }

    // http://www.kanzaki.com/docs/ical/duration-t.html
    if(!duration.matches(TimeUtils.PATTERN_DURATION_FORMAT.pattern()) ) {
      throw new IllegalArgumentException("Invalid 'duration' parameter. see icalendar duration expression.");
    }

    List<Object> objects = queryHistoryRepository.findByQueryCountPerElapsedTime(dataSourceId,
            TimeUtils.getDateTimeByDuration(DateTime.now(), duration));

    ChartSeriesResponse<String> result = new ChartSeriesResponse<>(1);
    for(Object obj : objects) {
      Object[] row = (Object[]) obj;
      if(row.length == 2) {
        result.add((String) row[0], ((Long) row[1]) * 1d);
      }
    }

    return ResponseEntity.ok(result);
  }

  @RequestMapping(value = "/datasources/{id}/histories/size/stats/hour", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> findByAvgSizePerHour(@PathVariable("id") String dataSourceId,
                                                   @RequestParam(value = "duration", defaultValue = "-P1D") String duration) {
    if (dataSourceRepository.findOne(dataSourceId) == null) {
      return ResponseEntity.notFound().build();
    }

    // http://www.kanzaki.com/docs/ical/duration-t.html
    if(!duration.matches(TimeUtils.PATTERN_DURATION_FORMAT.pattern()) ) {
      throw new IllegalArgumentException("Invalid 'duration' parameter. see icalendar duration expression.");
    }

    List<Object> objects = sizeHistoryRepository.findByAvgSizePerHour(dataSourceId,
            TimeUtils.getDateTimeByDuration(DateTime.now(), duration));

    ChartSeriesResponse<DateTime> result = new ChartSeriesResponse<>(1);
    for(Object obj : objects) {
      Object[] row = (Object[]) obj;
      if(row.length == 5) {
        DateTime time = new DateTime(DateTimeZone.UTC)
                .withDate((Integer) row[0], (Integer) row[1], (Integer) row[2])
                .withTime((Integer) row[3], 0, 0, 0);
        result.add(time, ((Double) row[4]));
      }
    }

    return ResponseEntity.ok(result);
  }

  public class ChartSeriesResponse<T> {
    List<T> x = Lists.newArrayList();
    List<List<Double>> series;

    public ChartSeriesResponse(int seriesCount) {
      series = Lists.newArrayList();

      for(int i = 0; i<seriesCount; i++) {
        series.add(Lists.newArrayList());
      }
    }

    public void add(T x, Double...seriesValues) {
      this.x.add(x);

      if(seriesValues == null || seriesValues.length != this.series.size()) {
        series.forEach((y) -> y.add(Double.NaN));
        return;
      }

      for(int i = 0; i<seriesValues.length; i++) {
        series.get(i).add(seriesValues[i]);
      }

    }

    public List<T> getX() {
      return x;
    }

    public void setX(List<T> x) {
      this.x = x;
    }

    public List<List<Double>> getSeries() {
      return series;
    }

    public void setSeries(List<List<Double>> series) {
      this.series = series;
    }
  }

}
