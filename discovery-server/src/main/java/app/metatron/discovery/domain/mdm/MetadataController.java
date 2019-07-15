/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.mdm;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.format.support.DefaultFormattingConversionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.net.URI;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.data.projection.DataGrid;
import app.metatron.discovery.common.entity.DomainType;
import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.datasource.DataSourceService;
import app.metatron.discovery.domain.tag.Tag;
import app.metatron.discovery.domain.tag.TagProjections;
import app.metatron.discovery.domain.tag.TagService;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.util.HttpUtils;
import app.metatron.discovery.util.ProjectionUtils;

@RepositoryRestController
public class MetadataController {

  private static Logger LOGGER = LoggerFactory.getLogger(MetadataController.class);

  @Autowired
  MetadataService metadataService;

  @Autowired
  DataSourceService dataSourceService;

  @Autowired
  TagService tagService;

  @Autowired
  MetadataRepository metadataRepository;

  @Autowired
  MetadataPopularityRepository metadataPopularityRepository;

  @Autowired
  UserRepository userRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  ProjectionFactory projectionFactory;

  @Autowired
  DefaultFormattingConversionService defaultConversionService;

  MetadataColumnProjections metadataColumnProjections = new MetadataColumnProjections();

  MetadataProjections metadataProjections = new MetadataProjections();
  TagProjections tagProjections = new TagProjections();

  public MetadataController() {
  }

  /**
   * save bulk Metadata
   */
  @RequestMapping(value = "/metadatas/batch", method = RequestMethod.POST)
  public ResponseEntity<?> findMetadatas(@RequestBody List<Metadata> requestBody){
    List<Metadata> savedMetadatas = metadataService.createAndReturn(requestBody);
    return ResponseEntity.created(URI.create("")).body(savedMetadatas);
  }

  /**
   * Metadata 목록을 조회합니다.
   */
  @RequestMapping(value = "/metadatas", method = RequestMethod.GET)
  public ResponseEntity <?> findMetadatas(
      @RequestParam(value = "keyword", required = false) String keyword,
      @RequestParam(value = "sourceType", required = false) String sourceType,
      @RequestParam(value = "catalogId", required = false) String catalogId,
      @RequestParam(value = "tag", required = false) String tag,
      @RequestParam(value = "nameContains", required = false) String nameContains,
      @RequestParam(value = "descContains", required = false) String descContains,
      @RequestParam(value = "creatorContains", required = false) String creatorContains,
      @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
      @RequestParam(value = "from", required = false)
      @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime from,
      @RequestParam(value = "to", required = false)
      @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) DateTime to,
      Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {


    // Validate source type.
    Metadata.SourceType searchSourceType = null;
    if (StringUtils.isNotEmpty(sourceType)) {
      searchSourceType = SearchParamValidator.enumUpperValue(Metadata.SourceType.class, sourceType, "sourceType");
    }

    // 기본 정렬 조건 셋팅
    if (pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(),
          new Sort(Sort.Direction.ASC, "name"));
    }

    List<User> targetUser = null;
    List<String> targetUserId = null;
    if(StringUtils.isNotEmpty(keyword)){
      targetUser = userRepository.findByFullNameContainingIgnoreCaseOrIdContainingIgnoreCase(keyword, keyword);
      targetUserId = targetUser.stream().map(user -> user.getUsername()).collect(Collectors.toList());
    } else if(StringUtils.isNotEmpty(creatorContains)){
      targetUser = userRepository.findByFullNameContainingIgnoreCaseOrIdContainingIgnoreCase(creatorContains, creatorContains);
      targetUserId = targetUser.stream().map(user -> user.getUsername()).collect(Collectors.toList());
    }

    Page <Metadata> metadatas = metadataRepository.searchMetadatas(keyword, searchSourceType, catalogId, tag,
                                                                   nameContains, descContains, targetUserId,
                                                                   searchDateBy, from, to, pageable);

    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(metadatas, resourceAssembler));
  }


  @RequestMapping(value = "/metadatas/metasources/{sourceId}", method = RequestMethod.POST)
  public ResponseEntity <?> findMetadataByOriginSource(@PathVariable("sourceId") String sourceId,
                             @RequestBody(required = false) Map <String, Object> requestParam,
                             @RequestParam(value = "projection", required = false, defaultValue = "default") String projection) {

    String schema = null;
    List <String> tableList = null;
    if (requestParam != null) {
      schema = (String) requestParam.get("schema");
      tableList = (List) requestParam.get("table");
    }

    List results = metadataRepository.findBySource(sourceId, schema, tableList);

    return ResponseEntity.ok(ProjectionUtils.toListResource(projectionFactory,
        metadataProjections.getProjectionByName(projection),
        results));

  }

  @RequestMapping(value = "/metadatas/tags", method = RequestMethod.GET)
  public ResponseEntity <?> findTagsInMetadata(@RequestParam(value = "nameContains", required = false) String nameContains,
                                               @RequestParam(value = "projection", required = false, defaultValue = "default") String projection,
                                               Pageable pageable) {

    Class projectionCls = tagProjections.getProjectionByName(projection);
    List tags;

    if(pageable.getSort() == null || !pageable.getSort().iterator().hasNext()) {
      Sort newSort = new Sort(Sort.Direction.ASC, "name");
      pageable = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(), newSort);
    }

    if(projectionCls == TagProjections.TreeProjection.class){
      tags = tagService.getTagsWithCount(Tag.Scope.DOMAIN, DomainType.METADATA, nameContains, pageable.getSort());
    } else {
      tags = tagService.findByTagsWithDomain(Tag.Scope.DOMAIN, DomainType.METADATA, nameContains, pageable.getSort());
    }

    return ResponseEntity.ok(
        ProjectionUtils.toListResource(projectionFactory, projectionCls, tags)
    );
  }

  @RequestMapping(value = "/metadatas/{metadataId}/tags/{action:attach|detach|update}", method = RequestMethod.POST)
  public ResponseEntity <?> manageTag(@PathVariable("metadataId") String metadataId,
                    @PathVariable("action") String action,
                    @RequestBody List <String> tagNames) {
    switch (action) {
      case "attach":
        tagService.attachTagsToDomainItem(Tag.Scope.DOMAIN, DomainType.METADATA, metadataId, tagNames);
        break;
      case "detach":
        tagService.detachTagsFromDomainItem(Tag.Scope.DOMAIN, DomainType.METADATA, metadataId, tagNames);
        break;
      case "update":
        tagService.updateTagsInDomainItem(Tag.Scope.DOMAIN, DomainType.METADATA, metadataId, tagNames);
        break;
    }

    return ResponseEntity.noContent().build();
  }


  @RequestMapping(path = "/metadatas/name/{value}/duplicated", method = RequestMethod.GET)
  public ResponseEntity <?> checkDuplicatedValue(@PathVariable("value") String value) {

    Map <String, Boolean> duplicated = Maps.newHashMap();
    if (metadataRepository.exists(MetadataPredicate.searchDuplicatedName(value))) {
      duplicated.put("duplicated", true);
    } else {
      duplicated.put("duplicated", false);
    }

    return ResponseEntity.ok(duplicated);
  }

  @RequestMapping(path = "/metadatas/name/duplicated", method = RequestMethod.POST)
  public ResponseEntity<?> checkDuplicatedValues(@RequestBody List<String> values) {

    List<String> metadataNameList = Lists.newArrayList();
    if(values != null && values.size() > 0){
      List<Metadata> existedMetadata
          = Lists.newArrayList(metadataRepository.findAll(MetadataPredicate.searchDuplicatedNames(values)));

      metadataNameList
          = existedMetadata.stream().map(metadata -> metadata.getName()).collect(Collectors.toList());
    }

    return ResponseEntity.ok(metadataNameList);
  }

  /**
   * Metadata 내 컬럼 정보를 가져옵니다.
   */
  @RequestMapping(path = "/metadatas/{metadataId}/columns", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity <?> getColumnssInMetadata(@PathVariable("metadataId") String metadataId,
                       @RequestParam(value = "projection", required = false, defaultValue = "default") String projection) {

    Metadata metadata = metadataRepository.findOne(metadataId);
    if (metadata == null) {
      throw new ResourceNotFoundException(metadataId);
    }

    List results = metadata.getColumns();

    return ResponseEntity.ok(ProjectionUtils.toListResource(projectionFactory,
        metadataColumnProjections.getProjectionByName(projection),
        results));

  }

  /**
   * Metadata 내 컬럼 정보를 수정합니다.
   */
  @RequestMapping(path = "/metadatas/{metadataId}/columns", method = {RequestMethod.PATCH, RequestMethod.PUT})
  public @ResponseBody
  ResponseEntity <?> patchColumnsInMetadata(@PathVariable("metadataId") String metadataId,
                        @RequestBody List <CollectionPatch> patches) {

    Metadata metadata = metadataRepository.findOne(metadataId);
    if (metadata == null) {
      throw new ResourceNotFoundException(metadataId);
    }

    Map <Long, MetadataColumn> columnMap = metadata.getColumnMap();
    for (CollectionPatch patch : patches) {
      Long columnId = patch.getLongValue("id");
      switch (patch.getOp()) {
        case ADD:
          metadata.addColumn(new MetadataColumn(patch, defaultConversionService));
          LOGGER.debug("Add code in code table({})", metadataId);
          break;
        case REPLACE:
          if (columnMap.containsKey(columnId)) {
            MetadataColumn column = columnMap.get(columnId);
            column.updateColumn(patch, defaultConversionService);
            LOGGER.debug("Updated code in code table({}) : {}", metadataId, columnId);
          }
          break;
        case REMOVE:
          if (columnMap.containsKey(columnId)) {
            metadata.removeColumn(columnMap.get(columnId));
            LOGGER.debug("Deleted code in code table({}) : {}", metadataId, columnId);
          }
          break;
        default:
          break;
      }
    }

    // save metadata and sync. with datasource
    metadataRepository.save(metadata);
    dataSourceService.updateFromMetadata(metadata, true);

    return ResponseEntity.noContent().build();
  }

  /**
   * Metadata count by sourceType
   */
  @RequestMapping(path = "/metadatas/statistics/count/sourcetype", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity<?> getCountBySourceType() {

    List<MetadataStatsDto> metadataStatsDtoList = metadataRepository.countBySourceType();
    HashMap<String, Long> result = new LinkedHashMap<>();
    for(MetadataStatsDto metadataStatsDto : metadataStatsDtoList){
      if(metadataStatsDto.getKeyword() == null){
        continue;
      }
      result.put(metadataStatsDto.getKeyword(), metadataStatsDto.getValue());
    }
    return ResponseEntity.ok(result);
  }

  @RequestMapping(path = "/metadatas/popularity", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getMetadatasByPopularity(Pageable pageable) {

    //fix order by popularity DESC
    PageRequest pageRequest
        = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(), Sort.Direction.DESC, "popularity");

    Page<MetadataPopularity> metadataPopularityList
        = metadataPopularityRepository.findByType(MetadataPopularity.PopularityType.METADATA, pageRequest);

    //find metadataid by populraity
    List<String> metadataId = metadataPopularityList.getContent()
                                                    .stream()
                                                    .map(p -> p.getMetadataId())
                                                    .collect(Collectors.toList());

    List metadatas = metadataRepository.findAll(metadataId);

    //order by populraity
    metadatas.sort((a, b) -> {
      int aIndex = metadataId.indexOf(((Metadata) a).getId());
      int bIndex = metadataId.indexOf(((Metadata) b).getId());
      if(aIndex == bIndex){
        return 0;
      } else if(aIndex > bIndex){
        return 1;
      } else {
        return -1;
      }
    });

    Page<Metadata> metadataPage = new PageImpl<Metadata>(metadatas, pageable, metadataPopularityList.getTotalElements());
    Page<Metadata> metadataResourced = ProjectionUtils.toPageResource(projectionFactory,
                                                                      metadataProjections.getProjectionByName("forListView"),
                                                                      metadataPage);
    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(metadataResourced));
  }

  @RequestMapping(path = "/metadatas/favorite/my", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getMyFavoriteMetadatas(Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {
    Page<Metadata> metadatas = metadataRepository.findAll(pageable);
    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(metadatas, resourceAssembler));
  }

  @RequestMapping(path = "/metadatas/favorite/creator", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getFavoriteMetadataByCreator(Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {
    Page<Metadata> metadatas = metadataRepository.findAll(pageable);
    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(metadatas, resourceAssembler));
  }


  @RequestMapping(path = "/metadatas/recommended", method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<?> getRecommendedMetadatas(Pageable pageable, PersistentEntityResourceAssembler resourceAssembler) {
    Page<Metadata> metadatas = metadataRepository.findAll(pageable);
    return ResponseEntity.ok(this.pagedResourcesAssembler.toResource(metadatas, resourceAssembler));
  }

  @RequestMapping(path = "/metadatas/{metadataId}/data", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity <?> getDataByMetadata(@PathVariable("metadataId") String metadataId,
                     @RequestParam(value = "limit", required = false) int limit) {

    Map <String, Object> responseMap = new HashMap <String, Object>();

    Metadata metadata = metadataRepository.findOne(metadataId);
    if (metadata == null) {
      throw new ResourceNotFoundException(metadataId);
    }

    DataGrid result = metadataService.getDataGrid(metadata, limit);
    responseMap.put("size", result.getRows() == null ? 0 : result.getRows().size());
    responseMap.put("data", result);

    return ResponseEntity.ok(responseMap);
  }

  @RequestMapping(path = "/metadatas/{metadataId}/data/download", method = RequestMethod.GET)
  public @ResponseBody
  ResponseEntity <?> getDownloadDataByMetadata(@PathVariable("metadataId") String metadataId,
                         @RequestParam(value = "limit", required = false) int limit,
                         @RequestParam(value = "fileName", required = false) String fileName,
                         HttpServletResponse response) {

    Metadata metadata = metadataRepository.findOne(metadataId);
    if (metadata == null) {
      throw new ResourceNotFoundException(metadataId);
    }

    if (StringUtils.isEmpty(fileName)) {
      fileName = "noname";
    }

    String csvFileName = metadataService.getDownloadFilePath(fileName);

    metadataService.getDownloadData(metadata, csvFileName, limit);
    try {
      HttpUtils.downloadCSVFile(response, fileName, csvFileName, "text/csv; charset=utf-8");
    } catch (Exception e) {
      LOGGER.error("getDownloadDataByMetadata(): HttpUtils.downloadCSVFile Exception: " + e.getMessage());
    }

    return null;
  }
}
