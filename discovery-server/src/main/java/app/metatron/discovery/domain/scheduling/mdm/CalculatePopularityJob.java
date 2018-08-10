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

package app.metatron.discovery.domain.scheduling.mdm;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.data.DataSourceValidator;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.mdm.MetadataColumn;
import app.metatron.discovery.domain.mdm.MetadataPopularity;
import app.metatron.discovery.domain.mdm.MetadataPopularityRepository;
import app.metatron.discovery.domain.mdm.MetadataRepository;
import app.metatron.discovery.domain.workbench.WorkbenchRepository;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.DashboardRepository;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.widget.FilterWidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.widget.PageWidgetConfiguration;
import app.metatron.discovery.domain.workbook.widget.FilterWidget;
import app.metatron.discovery.domain.workbook.widget.PageWidget;
import app.metatron.discovery.domain.workbook.widget.TextWidget;
import app.metatron.discovery.domain.workbook.widget.Widget;

@Component
@Transactional(readOnly = true, isolation = Isolation.READ_UNCOMMITTED)
@DisallowConcurrentExecution
public class CalculatePopularityJob extends QuartzJobBean {

  private static Logger LOGGER = LoggerFactory.getLogger(CalculatePopularityJob.class);

  @Autowired
  DataSourceValidator dataSourceValidator;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  MetadataRepository metadataRepository;

  @Autowired
  MetadataPopularityRepository popularityRepository;

  @Autowired
  DashboardRepository dashboardRepository;

  @Autowired
  WorkbenchRepository workbenchRepository;

  @Override
  public void executeInternal(JobExecutionContext jobExecutionContext) throws JobExecutionException {
    LOGGER.info("## Start calculating popularity");

    popularityRepository.delelteAllPopularity();
    LOGGER.debug("Deleted all popularity data.");

    int pageNum = 0;
    int size = 50;

    PageRequest pageRequest = null;
    Page<DashBoard> dashBoardPages = null;
    do {
      pageRequest = new PageRequest(pageNum, size);
      dashBoardPages = dashboardRepository.findDashBoardsWithDataSourceAndWidgets(pageRequest);

      List<DashBoard> dashBoards = dashBoardPages.getContent();

      for (DashBoard dashBoard : dashBoards) {

        // 대시보드에 연결된 데이터 소스를 기반으로 메타데이터 Popularity 스코어 지정
        Set<DataSource> dataSources = dashBoard.getDataSources();

        List<String> sourceIds = dataSources.stream().map(dataSource -> dataSource.getId())
                                            .collect(Collectors.toList());

        List<Metadata> metadatas = metadataRepository.findBySource(sourceIds);
        if(CollectionUtils.isEmpty(metadatas)) {
          LOGGER.debug("There is no metadata information in the datasources linked with the dashboard.");
          continue;
        }

        Map<String, Metadata> metadataMap = Maps.newHashMap();
        for (Metadata metadata : metadatas) {
          metadataMap.put(metadata.getSource().getSourceId(), metadata);
        }

        try {
          // 대시보드에 연결된 데이터 소스를 기반으로 메타데이터 Popularity 스코어 지정
          savePopularityByMetadata(metadataMap);

          // 대시보드에 등록된 위젯정보를 기반으로 메타데이터 컬럼 Popularity 스코어 지정
          savePopularityByWidget(metadataMap, dashBoard.getWidgets());
        } catch (Exception e) {
          LOGGER.warn("Fail to process score for dashboard({}) popularity : {}", dashBoard.getId(), e.getMessage());
          continue;
        }
      }

      pageNum++;

    } while (dashBoardPages.hasNext());

    // METADATA Popularity
    Double metadataMaxScore = popularityRepository.findByMaxScore(MetadataPopularity.PopularityType.METADATA).orElse(1L).doubleValue();
    Double metacolumnMaxScore = popularityRepository.findByMaxScore(MetadataPopularity.PopularityType.METACOLUMN).orElse(1L).doubleValue();
    Page<MetadataPopularity> popularityPages;
    pageNum = 0;
    do {
      pageRequest = new PageRequest(pageNum, size);
      popularityPages = popularityRepository.findAll(pageRequest);

      calculateAndSavePopularity(popularityPages.getContent(), metadataMaxScore, metacolumnMaxScore);

      pageNum++;

    } while (dashBoardPages.hasNext());


    LOGGER.info("## End calculating popularity");
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void calculateAndSavePopularity(List<MetadataPopularity> originPopularities, Double metadataMaxScore, Double metacolumnMaxScore) {

    List<MetadataPopularity> metadataPopularities = Lists.newArrayList();
    for (MetadataPopularity metadataPopularity : originPopularities) {
      metadataPopularity.calculatePopularity(
          metadataPopularity.getType() == MetadataPopularity.PopularityType.METADATA ?
              metadataMaxScore : metacolumnMaxScore
      );
      metadataPopularities.add(metadataPopularity);
    }

    popularityRepository.save(metadataPopularities);
  }

  /**
   *
   * @param metadataMap
   */
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void savePopularityByMetadata(Map<String, Metadata> metadataMap) throws Exception {

    // 메타데이터 정보를 바탕으로 Popularity 스코어 저장
    Map<String, MetadataPopularity> popularityMap = Maps.newHashMap();
    for (String sourceId : metadataMap.keySet()) {
      Metadata metadata = metadataMap.get(sourceId);

      String key = metadata.getId();
      if(popularityMap.containsKey(key)) {
        popularityMap.get(key).addScore();
      } else {
        MetadataPopularity popularity = popularityRepository.findByTypeAndMetadataIdAndSourceId(
            MetadataPopularity.PopularityType.METADATA, metadata.getId(), sourceId);
        if (popularity == null) {
          popularity = new MetadataPopularity(metadata);
        } else {
          popularity.addScore();
        }

        popularityMap.put(key, popularity);
      }
    }

    popularityRepository.save(popularityMap.values());
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void savePopularityByWidget(Map<String, Metadata> metadataMap, Collection<Widget> widgets) throws Exception {

    Map<String, MetadataPopularity> metadataPopularityMap = Maps.newHashMap();
    for (Widget widget : widgets) {
      if(widget instanceof TextWidget) {
        continue;
      }

      if(widget instanceof FilterWidget) {
        FilterWidgetConfiguration configuration = (FilterWidgetConfiguration) widget.convertConfiguration();
        if(configuration.getDataSource() == null) {  // 필터위젯의 경우 없는 경우가 있음
          continue;
        }
        dataSourceValidator.validateQuery(configuration.getDataSource());

        DataSource dataSource = getDataSourceByRef(configuration.getDataSource(), configuration.getFilter().getRef());
        if(dataSource == null) {
          continue;
        }

        setPopularityByMetadataColumn(metadataPopularityMap, metadataMap, dataSource, configuration.getFilter().getField());

      } else if(widget instanceof PageWidget) {
        // Filter 에 포함된 필드도 계산이 되어야 하는지 확인 필요
        PageWidgetConfiguration configuration = (PageWidgetConfiguration) widget.convertConfiguration();
        dataSourceValidator.validateQuery(configuration.getDataSource());

        for (app.metatron.discovery.domain.workbook.configurations.field.Field field : configuration.getPivot().getAllFields()) {
          DataSource dataSource = getDataSourceByRef(configuration.getDataSource(), field.getRef());
          if(dataSource == null) {
            continue;
          }

          setPopularityByMetadataColumn(metadataPopularityMap, metadataMap, dataSource, field.getName());
        }
      }
    }

    popularityRepository.save(metadataPopularityMap.values());
  }

  private DataSource getDataSourceByRef(app.metatron.discovery.domain.workbook.configurations.datasource.DataSource dataSource, String ref) {
    if(dataSource instanceof DefaultDataSource || StringUtils.isEmpty(ref)) {
      return dataSource.getMetaDataSource();
    } else if (dataSource instanceof MappingDataSource){
      return ((MappingDataSource) dataSource).findMetaDataSourceByRef(ref);
    }

    return null;
  }

  public void setPopularityByMetadataColumn(Map<String, MetadataPopularity> metadataPopularityMap, Map<String, Metadata> metadataMap, DataSource dataSource, String fieldName) {
    Field field = dataSource.getFieldByName(fieldName);
    Metadata metadata = metadataMap.get(dataSource.getId());
    MetadataColumn metadataColumn = metadata.getColumnMapByPhysicalName().get(field.getName());

    String key = metadata.getId() + "_" + dataSource.getId() + "_" + metadataColumn.getId();

    if(metadataPopularityMap.containsKey(key)) {
      metadataPopularityMap.get(key).addScore();
    } else {
      MetadataPopularity popularity = popularityRepository.findByTypeAndMetadataIdAndSourceIdAndMetaColumnId(
          MetadataPopularity.PopularityType.METACOLUMN, metadata.getId(), dataSource.getId(), metadataColumn.getId());

      if(popularity == null) {
        popularity = new MetadataPopularity(metadata, metadataColumn, field);
        metadataPopularityMap.put(key, popularity);
      } else {
        popularity.addScore();
        metadataPopularityMap.put(key, popularity);
      }
    }
  }

}
