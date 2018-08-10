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

package app.metatron.discovery.domain.workbook.widget;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.WebUtils;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.domain.datasource.DataSourceAlias;
import app.metatron.discovery.domain.datasource.DataSourceAliasRepository;
import app.metatron.discovery.domain.datasource.data.DataSourceValidator;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.datasource.data.forward.CsvResultForward;
import app.metatron.discovery.domain.datasource.data.forward.ExcelResultForward;
import app.metatron.discovery.domain.datasource.data.result.FileResultFormat;
import app.metatron.discovery.domain.datasource.data.result.SearchResultFormat;
import app.metatron.discovery.domain.engine.EngineQueryService;
import app.metatron.discovery.domain.notebook.NotebookModelRepository;
import app.metatron.discovery.domain.workbook.configurations.BoardConfiguration;
import app.metatron.discovery.domain.workbook.configurations.Limit;
import app.metatron.discovery.domain.workbook.configurations.Pivot;
import app.metatron.discovery.domain.workbook.configurations.WidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.widget.PageWidgetConfiguration;
import app.metatron.discovery.util.AuthUtils;

import static app.metatron.discovery.config.ApiResourceConfig.REDIRECT_PATH_URL;

@RepositoryRestController
public class WidgetController {

  @Autowired
  WidgetRepository widgetRepository;

  @Autowired
  NotebookModelRepository modelRepository;

  @Autowired
  DataSourceAliasRepository aliasRepository;

  @Autowired
  DataSourceValidator dataSourceValidator;

  @Autowired
  WidgetService widgetService;

  @Autowired
  EngineQueryService engineQueryService;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @RequestMapping(path = "/widgets/{widgetId}/copy", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> copyWidget(@PathVariable("widgetId") String widgetId,
                                  PersistentEntityResourceAssembler resourceAssembler) {

    Widget widget = widgetRepository.findOne(widgetId);
    if (widget == null) {
      throw new ResourceNotFoundException("Widget(" + widgetId + ") not found");
    }

    Widget copiedWidget = widgetService.copy(widget, widget.getDashBoard(), true);

    return ResponseEntity.ok(resourceAssembler.toResource(copiedWidget));
  }

  @RequestMapping(path = "/widgets/config/data", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> getDataFromWidgetConfig(@RequestParam(value = "original", required = false) boolean isOriginal,
                                                                 @RequestParam(value = "preview", required = false) boolean preview,
                                                                 @RequestParam(value = "limit", required = false) Integer limit,
                                                                 @RequestBody WidgetConfiguration configuration) {

    if(!(configuration instanceof PageWidgetConfiguration)) {
      throw new BadRequestException("Page widget configuration required.");
    }

    Object result = engineQueryService.search(getQueryRequestFromConfig(
        null,
        (PageWidgetConfiguration) configuration,
        null,
        isOriginal,
        preview,
        limit,
        null
    ));

    return ResponseEntity.ok(result);
  }

  @RequestMapping(path = "/widgets/{widgetId}/data", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> getDataFromWidget(@PathVariable("widgetId") String widgetId,
                                                           @RequestParam(value = "original", required = false) boolean isOriginal,
                                                           @RequestParam(value = "preview", required = false) boolean preview,
                                                           @RequestParam(value = "limit", required = false) Integer limit,
                                                           @RequestBody(required = false) SearchResultFormat resultFormat) {

    Widget widget = widgetRepository.findOne(widgetId);
    if (widget == null) {
      throw new ResourceNotFoundException(widgetId);
    }

    if(!(widget instanceof PageWidget)) {
      throw new BadRequestException("Page widget required.");
    }

    Map<String, DataSourceAlias> aliases = aliasRepository.findByDashBoardId(widget.getDashBoard().getId())
                                                          .stream()
                                                          .filter(dataSourceAlias -> StringUtils.isNotEmpty(dataSourceAlias.getValueAlias()))
                                                          .collect(Collectors.toMap(DataSourceAlias::getFieldName, dataSourceAlias -> dataSourceAlias));

    Object result = engineQueryService.search(getQueryRequestFromConfig(
        GlobalObjectMapper.readValue(widget.getDashBoard().getConfiguration(), BoardConfiguration.class),
        GlobalObjectMapper.readValue(widget.getConfiguration(), PageWidgetConfiguration.class),
        aliases,
        isOriginal,
        preview,
        limit,
        resultFormat
    ));

    return ResponseEntity.ok(result);
  }

  @RequestMapping(path = "/widgets/{widgetId}/embed", method = RequestMethod.GET, produces = { MediaType.TEXT_HTML_VALUE })
  public String getDataFromWidget(@PathVariable("widgetId") String widgetId,
                                                           HttpServletRequest request,
                                                           HttpServletResponse response) {

    Widget widget = widgetRepository.findOne(widgetId);
    if (widget == null) {
      throw new ResourceNotFoundException(widgetId);
    }

    if(WebUtils.getCookie(request, "LOGIN_TOKEN") == null) {

      String authorization = request.getHeader("Authorization");
      String[] splitedAuth = StringUtils.split(authorization, " ");

      Cookie cookie = new Cookie("LOGIN_TOKEN", splitedAuth[1]);
      cookie.setPath("/");
      cookie.setMaxAge(60*60*24) ;
      response.addCookie(cookie);

      cookie = new Cookie("LOGIN_TOKEN_TYPE", splitedAuth[0]);
      cookie.setPath("/");
      cookie.setMaxAge(60*60*24) ;
      response.addCookie(cookie);

      cookie = new Cookie("REFRESH_LOGIN_TOKEN", "");
      cookie.setPath("/");
      cookie.setMaxAge(60*60*24);
      response.addCookie(cookie);

      cookie = new Cookie("LOGIN_USER_ID", AuthUtils.getAuthUserName());
      cookie.setPath("/");
      cookie.setMaxAge(60*60*24) ;
      response.addCookie(cookie);
    }

    StringBuilder pathBuilder = new StringBuilder();
    pathBuilder.append(REDIRECT_PATH_URL);
    pathBuilder.append("/embedded/page/").append(widgetId);

    return pathBuilder.toString();
  }

  /**
   * 동적인 화면 구성에 맞춰 데이터를 Download 목적으로 구성
   *
   * @param response
   * @throws IOException
   */
  @RequestMapping(path ="/widgets/config/download", method = RequestMethod.POST, produces = { "application/vnd.ms-excel", "application/csv" })
  public void downloadDataFromConfig(HttpServletRequest resquest,
                                     HttpServletResponse response,
                                     @RequestParam(value = "original", required = false) boolean isOriginal,
                                     @RequestParam(value = "limit", required = false) Integer limit,
                                     @RequestParam(value = "maxRowsPerSheet", defaultValue = "1000000") Integer maxRowsPerSheet,
                                     @RequestBody WidgetConfiguration configuration) throws IOException {

    if(!(configuration instanceof PageWidgetConfiguration)) {
      throw new BadRequestException("Page widget configuration required.");
    }

    if(maxRowsPerSheet > 10000000) {
      throw new BadRequestException("Not allowed row count. max 10,000,000");
    }

    SearchQueryRequest searchQuery = getQueryRequestFromConfig(null,
                                                               (PageWidgetConfiguration) configuration,
                                                               null,
                                                               isOriginal,
                                                               false,
                                                               limit,
                                                               null);

    // 최대값을 임시로 천만 건으로 조정
    searchQuery.setLimits(new Limit(10000000));

    String accept = resquest.getHeader("accept");

    downloadData(isOriginal ? "original_data" : "chart_data", accept, searchQuery, maxRowsPerSheet, response);

  }

  /**
   * 동적인 화면 구성에 맞춰 데이터를 Download 목적으로 구성
   *
   * @param response
   * @throws IOException
   */
  @RequestMapping(path ="/widgets/{widgetId}/download", method = RequestMethod.POST, produces = { "application/vnd.ms-excel", "application/csv" })
  public void downloadDataFromWidget(HttpServletRequest request,
                                     HttpServletResponse response,
                                     @PathVariable("widgetId") String widgetId,
                                     @RequestParam(value = "original", required = false) boolean isOriginal,
                                     @RequestParam(value = "limit", required = false) Integer limit,
                                     @RequestParam(value = "maxRowsPerSheet", defaultValue = "1000000") Integer maxRowsPerSheet) throws IOException {

    if(maxRowsPerSheet > 10000000) {
      throw new BadRequestException("Not allowed row count. max 10,000,000");
    }

    Widget widget = widgetRepository.findOne(widgetId);
    if (widget == null) {
      throw new ResourceNotFoundException(widgetId);
    }

    if(!(widget instanceof PageWidget)) {
      throw new BadRequestException("Page widget required.");
    }

    Map<String, DataSourceAlias> aliases = aliasRepository.findByDashBoardId(widget.getDashBoard().getId())
                                                          .stream()
                                                          .filter(dataSourceAlias -> StringUtils.isNotEmpty(dataSourceAlias.getValueAlias()))
                                                          .collect(Collectors.toMap(DataSourceAlias::getFieldName, dataSourceAlias -> dataSourceAlias));

    SearchQueryRequest searchQuery = getQueryRequestFromConfig(
        GlobalObjectMapper.readValue(widget.getDashBoard().getConfiguration(), BoardConfiguration.class),
        GlobalObjectMapper.readValue(widget.getConfiguration(), PageWidgetConfiguration.class),
        aliases,
        isOriginal,
        false,
        limit,
        null
    );

    // 최대값을 임시로 천만 건으로 조정
    searchQuery.setLimits(new Limit(10000000));

    String accept = request.getHeader("accept");

    downloadData(isOriginal ? "original_data" : "chart_data", accept, searchQuery, maxRowsPerSheet, response);

  }

  private void downloadData(String name, String accept, SearchQueryRequest searchQuery, Integer maxRow, HttpServletResponse response) throws IOException {

    String downloadFileName;
    if("application/vnd.ms-excel".equals(accept)) {
      searchQuery.setResultForward(new ExcelResultForward(maxRow));
      downloadFileName = name + ".xlsx";
    } else {
      searchQuery.setResultForward(new CsvResultForward(true));
      downloadFileName = name + ".csv";
    }
    searchQuery.setResultFormat(new FileResultFormat("/tmp"));

    Object result = engineQueryService.search(searchQuery);

    File downloadFile = new File((String) result);

    response.setContentType(accept);
    response.setHeader("Content-Disposition", String.format("inline; filename=\"%s\"", downloadFileName));
//    response.setHeader("Content-Disposition", "attachment; filename=" + new String(downloadFileName.getBytes("euc-kr"), "latin1") + ";");

    response.setContentLength((int)downloadFile.length());

    InputStream inputStream = new BufferedInputStream(new FileInputStream(downloadFile));

    FileCopyUtils.copy(inputStream, response.getOutputStream());
  }


  private SearchQueryRequest getQueryRequestFromConfig(BoardConfiguration boardConfiguration,
                                                       PageWidgetConfiguration pageConfiguration,
                                                       Map<String, DataSourceAlias> aliasMap,
                                                       boolean isOriginal,
                                                       boolean preview,
                                                       Integer limit,
                                                       SearchResultFormat resultFormat) {

    Preconditions.checkNotNull(pageConfiguration, "Page configuration required");

    // 최대 백만건까지 확인 가능함
    if(limit == null) {
      limit = 1000;
    } else if(limit > 1000000) {
      limit = 1000000;
    }

    DataSource dataSource = null;
    List<Filter> filters = Lists.newArrayList();
    List<UserDefinedField> userDefinedFields = Lists.newArrayList();

    // DashBoard 설정 우선 적용
    if(boardConfiguration != null) {
      dataSource = boardConfiguration.getDataSource() == null ? pageConfiguration.getDataSource() : boardConfiguration.getDataSource();
      if(boardConfiguration.getFilters() != null) filters.addAll(boardConfiguration.getFilters());
      if(boardConfiguration.getUserDefinedFields() != null) userDefinedFields.addAll(boardConfiguration.getUserDefinedFields());
    } else {
      dataSource = pageConfiguration.getDataSource();
    }

    // Page 설정 적용
    if(pageConfiguration.getFilters() != null) filters.addAll(pageConfiguration.getFilters());
    if(pageConfiguration.getFields() != null) userDefinedFields.addAll(pageConfiguration.getFields());

    Pivot pivot = pageConfiguration.getPivot();
    if(pivot == null || pivot.isEmpty()) {
      throw new BadRequestException("Pivot field required.");
    }

    // 필드내 값 별칭이 존재할 경우 셋팅
    for(app.metatron.discovery.domain.workbook.configurations.field.Field field : pivot.getAllFields()) {
      if(!(field instanceof DimensionField)) continue;
      if(MapUtils.isEmpty(aliasMap) || !aliasMap.containsKey(field.getName())) continue;

      field.setValuePair(aliasMap.get(field.getName()).getValueAliasMap());
    }

    // 필터내 셋팅
    for(Filter filter : filters) {
      if(!(filter instanceof InclusionFilter)) continue;
      if(MapUtils.isEmpty(aliasMap) || !aliasMap.containsKey(filter.getField())) continue;

      InclusionFilter inclusionFilter = (InclusionFilter) filter;
      inclusionFilter.setValuePair(aliasMap.get(filter.getField()).getValueAliasMap());
    }

    // Search Query 작성
    SearchQueryRequest queryRequest = new SearchQueryRequest();
    queryRequest.setDataSource(dataSource);
    queryRequest.setFilters(filters);
    queryRequest.setProjections(pageConfiguration.getPivot(), isOriginal);
    queryRequest.setResultFormat(resultFormat);
    queryRequest.setMetaQuery(preview);
    queryRequest.setLimits(new Limit(limit));

    dataSourceValidator.validateQuery(queryRequest.getDataSource());

    return queryRequest;
  }


}
