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

package app.metatron.discovery.domain.workbook;

import com.google.common.collect.Sets;

import com.querydsl.core.BooleanBuilder;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.common.oauth.CookieManager;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.data.DataSourceValidator;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.datasource.data.result.ObjectResultFormat;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.workbook.configurations.BoardConfiguration;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MultiDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.widget.QWidget;
import app.metatron.discovery.domain.workbook.widget.Widget;
import app.metatron.discovery.domain.workbook.widget.WidgetRepository;
import app.metatron.discovery.domain.workbook.widget.WidgetService;
import app.metatron.discovery.util.AuthUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static app.metatron.discovery.config.ApiResourceConfig.REDIRECT_PATH_URL;

@RepositoryRestController
public class DashBoardController {

  private static Logger LOGGER = LoggerFactory.getLogger(DashBoardController.class);

  @Autowired
  DashboardRepository dashboardRepository;

  @Autowired
  WidgetRepository widgetRepository;

  @Autowired
  DashBoardService dashBoardService;

  @Autowired
  EngineQueryService engineQueryService;

  @Autowired
  DataSourceValidator dataSourceValidator;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  WidgetService widgetService;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @RequestMapping(path = "/dashboards/{dashboardId}/widgets", method = RequestMethod.GET)
  public @ResponseBody ResponseEntity<?> findByWidgetInDashboard(@PathVariable("dashboardId") String dashboardId,
                                                       @RequestParam(value = "widgetType", required = false) String widgetType,
                                                       Pageable pageable,
                                                       PersistentEntityResourceAssembler resourceAssembler) {

    if(StringUtils.isNotEmpty(widgetType) && !Widget.SEARCHABLE_WIDGETS.contains(widgetType.toLowerCase())) {
      throw new IllegalArgumentException("Invalid widget type. choose " + Widget.SEARCHABLE_WIDGETS);
    }

    DashBoard dashBoard = dashboardRepository.findOne(dashboardId);
    if(dashBoard == null) {
      throw new ResourceNotFoundException("Dashboard(" + dashboardId + ") not found");
    }

    QWidget qWidget = QWidget.widget;
    BooleanBuilder builder = new BooleanBuilder();
    builder.and(qWidget.dashBoard.id.eq(dashboardId));

    if(StringUtils.isNotEmpty(widgetType)) {
      builder.and(qWidget.type.eq(widgetType));
    }

    Page<Widget> widgets = widgetRepository.findAll(builder, pageable);

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(widgets, resourceAssembler));
  }

  @RequestMapping(path = "/dashboards/{dashboardId}/copy", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> copyDashboard(@PathVariable("dashboardId") String dashboardId,
                                                       PersistentEntityResourceAssembler resourceAssembler) {

    DashBoard dashBoard = dashboardRepository.findOne(dashboardId);
    if(dashBoard == null) {
      throw new ResourceNotFoundException("Dashboard(" + dashboardId + ") not found");
    }

    DashBoard copiedDashboard = dashBoardService.copy(dashBoard, dashBoard.getWorkBook(), true);

    return ResponseEntity.ok(resourceAssembler.toResource(copiedDashboard));
  }


  /**
   * 대시보드 내 매핑된 데이터 질의 수행, NoteBook 모듈내에서 수행
   *
   * @param id
   * @param request
   * @return
   */
  @RequestMapping(path = "/dashboards/{id}/data", method = RequestMethod.POST)
  public @ResponseBody
  ResponseEntity<?> getDataFromDatasource(@PathVariable("id") String id,
                                          @RequestParam(value = "limit", required = false) Integer limit,
                                          @RequestBody(required = false) SearchQueryRequest request) {

    DashBoard dashBoard = dashboardRepository.findOne(id);
    if (dashBoard == null) {
      throw new ResourceNotFoundException(id);
    }

    if(request == null) {
      request = new SearchQueryRequest();
    }

    BoardConfiguration configuration = dashBoard.getConfigurationObject();
    if(configuration == null || configuration.getDataSource() == null) {
      throw new MetatronException("Configuration empty.");
    }

    // 멀티데이터 소스의 경우 첫번째 데이터 소스를 처리
    DataSource targetDataSource = null;
    if(configuration.getDataSource() instanceof MultiDataSource) {
      targetDataSource = ((MultiDataSource) configuration.getDataSource()).getDataSources().get(0);
    } else {
      targetDataSource = configuration.getDataSource();
    }

    request.setDataSource(targetDataSource);
    request.setUserFields(configuration.getUserDefinedFields());

    if(request.getResultFormat() == null) {
      ObjectResultFormat resultFormat = new ObjectResultFormat();
      resultFormat.setRequest(request);
      request.setResultFormat(resultFormat);
    }

    if(CollectionUtils.isEmpty(request.getProjections())) {
      request.setProjections(new ArrayList<>());
    }

    // 데이터 Limit 처리 최대 백만건까지 확인 가능함
    if(request.getLimits() == null) {
      if(limit == null) {
        limit = 1000;
      } else if(limit > 1000000) {
        limit = 1000000;
      }
      request.setLimits(new Limit(limit));
    }

    dataSourceValidator.validateQuery(request.getDataSource());

    return ResponseEntity.ok(engineQueryService.search(request));
  }

  /**
   * 대시보드 Embed 용 화면 전달
   *
   * @param id
   * @return
   */
  @RequestMapping(path = "/dashboards/{id}/embed", method = RequestMethod.GET, produces = { MediaType.TEXT_HTML_VALUE })
  public String getEmbedDashBoardView(@PathVariable("id") String id,
                                      HttpServletRequest request,
                                      HttpServletResponse response) {

    DashBoard dashBoard = dashboardRepository.findOne(id);
    if (dashBoard == null) {
      throw new ResourceNotFoundException(id);
    }

    if(CookieManager.getAccessToken(request) == null) {

      String authorization = request.getHeader("Authorization");
      String[] splitedAuth = StringUtils.split(authorization, " ");

      CookieManager.addCookie(CookieManager.ACCESS_TOKEN, splitedAuth[1], response);
      CookieManager.addCookie(CookieManager.TOKEN_TYPE, splitedAuth[0], response);
      CookieManager.addCookie(CookieManager.REFRESH_TOKEN, "", response);
      CookieManager.addCookie(CookieManager.LOGIN_ID, AuthUtils.getAuthUserName(), response);

    }

    StringBuilder pathBuilder = new StringBuilder();
    pathBuilder.append(REDIRECT_PATH_URL);
    pathBuilder.append("/dashboard/").append(id);

    return pathBuilder.toString();
  }

  @RequestMapping(path = "/dashboards/{dashboardId}/dataSource/validate", method = RequestMethod.POST)
  ResponseEntity<?> validateForChangingDatasource(@PathVariable("dashboardId") String dashboardId,
                                                  @RequestParam("fromDataSourceId") String fromDataSourceId,
                                                  @RequestParam("toDataSourceId") String toDataSourceId) {
    DashBoard dashBoard = dashboardRepository.findOne(dashboardId);
    if (dashBoard == null) {
      throw new ResourceNotFoundException(dashboardId);
    }

    app.metatron.discovery.domain.datasource.DataSource fromDataSource
        = dataSourceRepository.findOne(fromDataSourceId);
    if (fromDataSource == null) {
      throw new ResourceNotFoundException(fromDataSourceId);
    }

    app.metatron.discovery.domain.datasource.DataSource toDataSource
        = dataSourceRepository.findOne(toDataSourceId);
    if (toDataSource == null) {
      throw new ResourceNotFoundException(toDataSourceId);
    }

    if (!dashBoard.getDataSources().contains(fromDataSource)) {
      LOGGER.error("Datasource({}) is not registered", fromDataSourceId);
      throw new BadRequestException("Datasource is not registered");
    }

    if (dashBoard.getDataSources().contains(toDataSource)) {
      LOGGER.error("Datasource({}) already registered", toDataSourceId);
      throw new BadRequestException("Datasource already registered");
    }

    return ResponseEntity.ok(dashBoardService.validateForChangingDatasource(dashBoard, fromDataSource, toDataSource));
  }

  @RequestMapping(path = "/dashboards/{dashboardId}/dataSource/change", method = RequestMethod.POST)
  ResponseEntity<?> changeDatasource(@PathVariable("dashboardId") String dashboardId,
                                     @RequestParam("fromDataSourceId") String fromDataSourceId,
                                     @RequestParam("toDataSourceId") String toDataSourceId) {
    LOGGER.info("DashboardId({}), fromDataSourceId({}), toDataSourceId({})", dashboardId, fromDataSourceId, toDataSourceId);

    DashBoard dashBoard = dashboardRepository.findOne(dashboardId);
    if (dashBoard == null) {
      throw new ResourceNotFoundException(dashboardId);
    }
    app.metatron.discovery.domain.datasource.DataSource fromDataSource
        = dataSourceRepository.findOne(fromDataSourceId);
    if (fromDataSource == null) {
      throw new ResourceNotFoundException(fromDataSourceId);
    }

    app.metatron.discovery.domain.datasource.DataSource toDataSource
        = dataSourceRepository.findOne(toDataSourceId);
    if (toDataSource == null) {
      throw new ResourceNotFoundException(toDataSourceId);
    }

    if (!dashBoard.getDataSources().contains(fromDataSource)) {
      LOGGER.error("Datasource({}) is not registered", fromDataSourceId);
      throw new BadRequestException("Datasource is not registered");
    }

    if (dashBoard.getDataSources().contains(toDataSource)) {
      LOGGER.error("Datasource({}) already registered", toDataSourceId);
      throw new BadRequestException("Datasource already registered");
    }

    LOGGER.info("Dashboard({})' before datasource : {}", dashBoard.getId(), dashBoard.getDataSources().toString());
    Set<app.metatron.discovery.domain.datasource.DataSource> dashboardDataSources = Sets.newHashSet();
    dashBoard.getDataSources().forEach(dataSource -> {
      if (dataSource.getEngineName().equals(fromDataSource.getEngineName())) {
        dashboardDataSources.add(toDataSource);
      } else {
        dashboardDataSources.add(dataSource);
      }
    });
    dashBoard.setDataSources(dashboardDataSources);
    LOGGER.info("Dashboard({})' after datasource : {}", dashBoard.getId(), dashBoard.getDataSources().toString());

    BoardConfiguration boardConfiguration = dashBoard.getConfigurationObject();
    DataSource boardDataSource = boardConfiguration.getDataSource();

    LOGGER.info("Dashboard({})' before configuration : {}", dashBoard.getId(), dashBoard.getConfiguration());
    boardConfiguration.setDataSource(
        dashBoardService.changeDataSource(fromDataSource, toDataSource, boardDataSource));

    List<Filter> dashboardFilterList = boardConfiguration.getFilters();
    if (dashboardFilterList != null) {
      for (Filter filter : dashboardFilterList) {
        if (filter.getDataSource().equals(fromDataSource.getEngineName())) {
          filter.setDataSource(toDataSource.getEngineName());
        }
      }
    }
    boardConfiguration.setFilters(dashboardFilterList);

    List<UserDefinedField> userDefinedFieldList = boardConfiguration.getUserDefinedFields();
    if (userDefinedFieldList != null) {
      for(UserDefinedField userDefinedField : userDefinedFieldList) {
        if (userDefinedField.getDataSource().equals(fromDataSource.getEngineName())) {
          userDefinedField.setDataSource(toDataSource.getEngineName());
        }
      }
    }
    boardConfiguration.setUserDefinedFields(userDefinedFieldList);

    String newBoardConfiguration = GlobalObjectMapper.writeValueAsString(boardConfiguration);
    LOGGER.info("Dashboard({})' after configuration : {}", dashBoard.getId(), newBoardConfiguration);
    dashBoard.setConfiguration(newBoardConfiguration);


    List<String> widgetIds =  dashBoard.getWidgets().stream().map(widget -> widget.getId()).collect(Collectors.toList());
    for(String widgetId: widgetIds) {
      widgetService.changeDataSource(widgetId, fromDataSource, toDataSource);
    }

    dashboardRepository.saveAndFlush(dashBoard);

    return ResponseEntity.noContent().build();
  }

}
