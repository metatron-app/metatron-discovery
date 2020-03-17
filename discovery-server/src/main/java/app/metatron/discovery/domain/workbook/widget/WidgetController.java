/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

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

import org.apache.commons.collections4.CollectionUtils;
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

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.oauth.CookieManager;
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
import app.metatron.discovery.domain.workbook.configurations.datasource.MultiDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.widget.PageWidgetConfiguration;
import app.metatron.discovery.util.AuthUtils;
import app.metatron.discovery.util.HttpUtils;

import static app.metatron.discovery.config.ApiResourceConfig.REDIRECT_PATH_URL;
import static java.util.stream.Collectors.toList;

/**d
 * Resource of Widgets
 */
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
  WidgetProperties widgetProperties;

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

  @RequestMapping(path = "/widgets/properties/mapview", method = RequestMethod.GET)
  public @ResponseBody ResponseEntity<?> getBaseMapsInMapView() {

    WidgetProperties.MapView mapView = widgetProperties.getMapView();

    return ResponseEntity.ok(mapView);
  }

  @RequestMapping(path = "/widgets/{widgetId}/data", method = RequestMethod.POST)
  public @ResponseBody ResponseEntity<?> getDataFromWidget(@PathVariable("widgetId") String widgetId,
                                                           @RequestParam(value = "original", required = false) boolean isOriginal,
                                                           @RequestParam(value = "preview", required = false) boolean preview,
                                                           @RequestParam(value = "limit", required = false) Integer limit,
                                                           @RequestBody(required = false) List<Filter> filters) {
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

    BoardConfiguration boardConfiguration = GlobalObjectMapper.readValue(widget.getDashBoard().getConfiguration(), BoardConfiguration.class);
    if(CollectionUtils.isNotEmpty(filters)) {
      boardConfiguration.setFilters(filters);
    }

    Object result = engineQueryService.search(getQueryRequestFromConfig(
        boardConfiguration,
        GlobalObjectMapper.readValue(widget.getConfiguration(), PageWidgetConfiguration.class),
        aliases,
        isOriginal,
        preview,
        limit,
        null
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
    pathBuilder.append("/embedded/page/").append(widgetId);

    return pathBuilder.toString();
  }

  /**
   * Download from widget configuration.
   *
   * @param resquest
   * @param response
   * @param isOriginal
   * @param limit
   * @param maxRowsPerSheet
   * @param configuration
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

    if(maxRowsPerSheet > 1000000) {
      throw new BadRequestException("Not allowed row count. max 1,000,000");
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
   * Download from saved widget configuration.
   *
   * @param request
   * @param response
   * @param widgetId
   * @param isOriginal
   * @param limit
   * @param maxRowsPerSheet
   * @throws IOException
   */
  @RequestMapping(path ="/widgets/{widgetId}/download", method = RequestMethod.POST, produces = { "application/vnd.ms-excel", "application/csv" })
  public void downloadDataFromWidget(HttpServletRequest request,
                                     HttpServletResponse response,
                                     @PathVariable("widgetId") String widgetId,
                                     @RequestParam(value = "original", required = false) boolean isOriginal,
                                     @RequestParam(value = "limit", required = false) Integer limit,
                                     @RequestParam(value = "maxRowsPerSheet", defaultValue = "1000000") Integer maxRowsPerSheet,
                                     @RequestBody(required = false) List<Filter> filters) throws IOException {

    if(maxRowsPerSheet > 1000000) {
      throw new BadRequestException("Not allowed row count. max 1,000,000");
    }

    Widget widget = widgetRepository.findOne(widgetId);
    if (widget == null) {
      throw new ResourceNotFoundException(widgetId);
    }

    if(!(widget instanceof PageWidget)) {
      throw new BadRequestException("Page widget required.");
    }

    // find alias information by alias Identifier
    Map<String, DataSourceAlias> aliases = aliasRepository.findByDashBoardId(widget.getDashBoard().getId())
                                                          .stream()
                                                          .filter(dataSourceAlias -> StringUtils.isNotEmpty(dataSourceAlias.getValueAlias()))
                                                          .collect(Collectors.toMap(DataSourceAlias::getFieldName, dataSourceAlias -> dataSourceAlias));

    BoardConfiguration boardConfiguration = GlobalObjectMapper.readValue(widget.getDashBoard().getConfiguration(), BoardConfiguration.class);
    if(CollectionUtils.isNotEmpty(filters)) {
      boardConfiguration.setFilters(filters);
    }

    SearchQueryRequest searchQuery = getQueryRequestFromConfig(
        boardConfiguration,
        GlobalObjectMapper.readValue(widget.getConfiguration(), PageWidgetConfiguration.class),
        aliases,
        isOriginal,
        false,
        limit,
        null
    );

    String accept = request.getHeader("accept");

    downloadData(isOriginal ? "original_data" : "chart_data", accept, searchQuery, maxRowsPerSheet, response);

  }

  /**
   * Processing download file
   *
   * @param name name of file
   * @param accept requested accept header contents
   * @param searchQuery search query model
   * @param maxRow Maximum rows to fetch from query
   * @param response
   * @throws IOException
   */
  private void downloadData(String name, String accept, SearchQueryRequest searchQuery, Integer maxRow, HttpServletResponse response) throws IOException {

    String downloadFileName;
    boolean isCSV = false;

    if("application/vnd.ms-excel".equals(accept)) {
      searchQuery.setResultForward(new ExcelResultForward(maxRow));
      downloadFileName = name + ".xlsx";
    } else {
      searchQuery.setResultForward(new CsvResultForward(true));
      downloadFileName = name + ".csv";
      isCSV = true;
    }
    searchQuery.setResultFormat(new FileResultFormat("/tmp"));

    Object result = engineQueryService.search(searchQuery);

    File downloadFile = new File((String) result);

    if (isCSV){
      HttpUtils.downloadCSVFile(response, downloadFile.getName(), downloadFile.getPath(), accept);
    }else{

      response.setContentType(accept);
      response.setHeader("Content-Disposition", String.format("inline; filename=\"%s\"", downloadFileName));
//    response.setHeader("Content-Disposition", "attachment; filename=" + new String(downloadFileName.getBytes("euc-kr"), "latin1") + ";");

      response.setContentLength((int)downloadFile.length());

      InputStream inputStream = new BufferedInputStream(new FileInputStream(downloadFile));

      FileCopyUtils.copy(inputStream, response.getOutputStream());
    }
  }


  /**
   * Make query request model
   *
   * @param boardConfiguration
   * @param pageConfiguration
   * @param aliasMap
   * @param isOriginal get original data from select query, if true
   * @param preview get fetched data schema from select query, if true
   * @param limit row limitation
   * @param resultFormat
   * @return
   */
  private SearchQueryRequest getQueryRequestFromConfig(BoardConfiguration boardConfiguration,
                                                       PageWidgetConfiguration pageConfiguration,
                                                       Map<String, DataSourceAlias> aliasMap,
                                                       boolean isOriginal,
                                                       boolean preview,
                                                       Integer limit,
                                                       SearchResultFormat resultFormat) {

    Preconditions.checkNotNull(pageConfiguration, "Page configuration required");

    // Limit 1,000,000 rows
    if(limit == null) {
      limit = 1000;
    } else if(limit > 1000000) {
      limit = 1000000;
    }

    Pivot pivot = pageConfiguration.getPivot();
    if(pivot == null || pivot.isEmpty()) {
      throw new BadRequestException("Pivot field required.");
    }

    DataSource dataSource = null;
    List<Filter> filters = Lists.newArrayList();
    List<UserDefinedField> userDefinedFields = Lists.newArrayList();

    dataSource = pageConfiguration.getDataSource();
    if(boardConfiguration != null) {
      if(dataSource == null
          && boardConfiguration.getDataSource() != null
          && !(boardConfiguration.getDataSource() instanceof MultiDataSource)) {
        dataSource = boardConfiguration.getDataSource();
      }

      String dataSourceName = dataSource.getName();

      if(boardConfiguration.getFilters() != null) {
        List<Filter> selectedFilter = boardConfiguration.getFilters()
                                                        .stream()
                                                        .filter(filter -> filter.getDataSource() == null
                                                            || dataSourceName.equals(filter.getDataSource()))
                                                        .collect(toList());
        filters.addAll(selectedFilter);
      }

      if(boardConfiguration.getUserDefinedFields() != null) {
        List<UserDefinedField> selectedField = boardConfiguration.getUserDefinedFields()
                                                                 .stream()
                                                                 .filter(userDefinedField -> userDefinedField.getDataSource() == null
                                                                     || dataSourceName.equals(userDefinedField.getDataSource()))
                                                                 .collect(toList());
        userDefinedFields.addAll(selectedField);
      }
    }

    // Add Page Configuration
    if(pageConfiguration.getFilters() != null) filters.addAll(pageConfiguration.getFilters());
    //if(pageConfiguration.getFields() != null) userDefinedFields.addAll(pageConfiguration.getFields());

    // Set field alias
    for(app.metatron.discovery.domain.workbook.configurations.field.Field field : pivot.getAllFields()) {
      if(!(field instanceof DimensionField)) continue;
      if(MapUtils.isEmpty(aliasMap) || !aliasMap.containsKey(field.getName())) continue;

      field.setValuePair(aliasMap.get(field.getName()).getValueAliasMap());
    }

    // Set value alias in filter
    for(Filter filter : filters) {
      if(!(filter instanceof InclusionFilter)) continue;
      if(MapUtils.isEmpty(aliasMap) || !aliasMap.containsKey(filter.getField())) continue;

      InclusionFilter inclusionFilter = (InclusionFilter) filter;
      inclusionFilter.setValuePair(aliasMap.get(filter.getField()).getValueAliasMap());
    }

    // Create search query request
    SearchQueryRequest queryRequest = new SearchQueryRequest();
    queryRequest.setDataSource(dataSource);
    queryRequest.setUserFields(userDefinedFields);
    queryRequest.setFilters(filters);
    queryRequest.setProjections(pageConfiguration.getPivot(), isOriginal);
    queryRequest.setResultFormat(resultFormat);
    queryRequest.setMetaQuery(preview);
    queryRequest.setLimits(new Limit(limit));

    dataSourceValidator.validateQuery(queryRequest.getDataSource());

    return queryRequest;
  }

}
