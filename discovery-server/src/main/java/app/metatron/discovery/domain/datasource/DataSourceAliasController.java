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

package app.metatron.discovery.domain.datasource;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.net.URI;
import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.exception.ResourceNotFoundException;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.DashboardRepository;

/**
 * Created by kyungtaak on 2016. 7. 22..
 */
@RepositoryRestController
public class DataSourceAliasController {

  private static Logger LOGGER = LoggerFactory.getLogger(DataSourceAliasController.class);

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  DashboardRepository dashboardRepository;

  @Autowired
  DataSourceAliasRepository dataSourceAliasRepository;

  public DataSourceAliasController() {
  }

  /**
   * 데이터 소스 Alias 정보 저장
   *
   * @param dataSourceAlias
   * @return
   */
  @RequestMapping(value = "/datasources/aliases", method = RequestMethod.POST)
  public ResponseEntity<?> createDataSourceAlias(@RequestBody DataSourceAlias dataSourceAlias) {

    // 데이터 소스가 존재하는지 체크
    DataSource dataSource = dataSourceRepository.findOne(dataSourceAlias.getDataSourceId());
    if (dataSource == null) {
      throw new ResourceNotFoundException(dataSourceAlias.getDataSourceId());
    }

    // 필드명이 존재하는지 체크
    if(!dataSource.existFieldName(dataSourceAlias.getFieldName())) {
      throw new ResourceNotFoundException(dataSourceAlias.getFieldName());
    }

    // 대시보드가 존재하는지 체크
    DashBoard dashBoard = dashboardRepository.findOne(dataSourceAlias.getDashBoardId());
    if (dashBoard == null) {
      throw new ResourceNotFoundException(dataSourceAlias.getDashBoardId());
    }

    // Alias 항목을 Name 또는 Value 를 지정하지 않은지 체크
    if(StringUtils.isEmpty(dataSourceAlias.getNameAlias()) && StringUtils.isEmpty(dataSourceAlias.getValueAlias())) {
      throw new IllegalArgumentException("Alias value required.");
    }

    return ResponseEntity.created(URI.create(""))
                         .body(dataSourceAliasRepository.save(dataSourceAlias));
  }

  /**
   * 데이터 소스내 필드 Alias 값 수정
   *
   * @param aliasId
   * @param paramMap
   * @return
   */
  @RequestMapping(path = "/datasources/aliases/{aliasId}", method = { RequestMethod.PATCH })
  public @ResponseBody
  ResponseEntity<?> appendDataSource(@PathVariable("aliasId") Long aliasId,
                                     @RequestBody Map<String, Object> paramMap) {

    DataSourceAlias alias = dataSourceAliasRepository.findOne(aliasId);
    if (alias == null) {
      throw new ResourceNotFoundException(String.valueOf(aliasId));
    }

    if(paramMap.containsKey("nameAlias")) {
      alias.setNameAlias((String) paramMap.get("nameAlias"));
    }

    if(paramMap.containsKey("valueAlias")) {
      Object object = paramMap.get("valueAlias");
      if(object != null && object instanceof Map) {
        alias.setValueAlias(GlobalObjectMapper.writeValueAsString(object));
      }
    }

    return ResponseEntity.ok(dataSourceAliasRepository.save(alias));

  }

  /**
   * Alias 정보를 삭제 합니다.
   *
   * @param aliasId
   * @return
   */
  @RequestMapping(value = "/datasources/aliases/{aliasId}", method = RequestMethod.DELETE)
  public ResponseEntity<?> findDataSources(@PathVariable("aliasId") Long aliasId) {

    DataSourceAlias alias = dataSourceAliasRepository.findOne(aliasId);
    if (alias == null) {
      throw new ResourceNotFoundException(String.valueOf(aliasId));
    }

    dataSourceAliasRepository.delete(alias);

    return ResponseEntity.noContent().build();
  }

  /**
   * alias 상세정보를 가져옵니다.
   *
   * @param aliasId
   * @param resourceAssembler
   * @return
   */
  @Transactional(readOnly = true)
  @RequestMapping(value = "/datasources/aliases/{aliasId}", method = RequestMethod.GET)
  public ResponseEntity<?> findDataSources(@PathVariable("aliasId") Long aliasId,
                                           PersistentEntityResourceAssembler resourceAssembler) {

    DataSourceAlias alias = dataSourceAliasRepository.findOne(aliasId);
    if (alias == null) {
      throw new ResourceNotFoundException(String.valueOf(aliasId));
    }

    return ResponseEntity.ok(resourceAssembler.toResource(alias));
  }
}
