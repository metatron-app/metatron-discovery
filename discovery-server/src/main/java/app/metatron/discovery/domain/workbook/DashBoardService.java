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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.transaction.Transactional;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.DataSourceService;
import app.metatron.discovery.domain.datasource.DataSourceTemporary;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.images.Image;
import app.metatron.discovery.domain.images.ImageService;
import app.metatron.discovery.domain.workbook.configurations.BoardConfiguration;
import app.metatron.discovery.domain.workbook.configurations.WidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.board.WidgetRelation;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MultiDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.SingleDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.widget.FilterWidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.widget.PageWidgetConfiguration;
import app.metatron.discovery.domain.workbook.widget.Widget;
import app.metatron.discovery.domain.workbook.widget.WidgetService;

@Component
public class DashBoardService {

  @Autowired
  ImageService imageService;

  @Autowired
  WidgetService widgetService;

  @Autowired
  DashboardRepository dashBoardRepository;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  DataSourceService dataSourceService;

  @Transactional
  public DashBoard copy(DashBoard dashBoard, WorkBook parent, boolean addPrefix) {

    DashBoard copiedDashBoard = dashBoard.copyOf(parent, addPrefix);

    dashBoardRepository.saveAndFlush(copiedDashBoard);

    // 이미지 처리
    if(StringUtils.isNotEmpty(copiedDashBoard.getImageUrl())) {
      Image image = imageService.copyByUrl(copiedDashBoard.getId(), copiedDashBoard.getImageUrl());
      if(image == null) {
        copiedDashBoard.setImageUrl(null);
      } else {
        copiedDashBoard.setImageUrl(image.getImageUrl());
      }
    }

    // DataSource 엔티티 관계 재설정
    if(CollectionUtils.isNotEmpty(dashBoard.getDataSources())) {
      dashBoard.getDataSources().forEach(dataSource -> dataSource.addDashBoard(copiedDashBoard));
    }

    Map<String, String> widgetIdMap = Maps.newHashMap();
    if(CollectionUtils.isNotEmpty(dashBoard.getWidgets())) {
      for (Widget widget : dashBoard.getWidgets()) {
        Widget copiedWidget = widgetService.copy(widget,copiedDashBoard, false);
        widgetIdMap.put(widget.getId(), copiedWidget.getId());
      }
    }

    if(dashBoard.getConfiguration() != null) {
      try {
        BoardConfiguration conf = GlobalObjectMapper.getDefaultMapper()
                                                    .readValue(dashBoard.getConfiguration(),
                                                               BoardConfiguration.class);

        if(CollectionUtils.isNotEmpty(conf.getWidgets())) {
          for (BoardConfiguration.LayoutWidget layoutWidget : conf.getWidgets()) {
            if (widgetIdMap.containsKey(layoutWidget.getRef())) {
              layoutWidget.setRef(widgetIdMap.get(layoutWidget.getRef()));
            }
          }
        }

        if(CollectionUtils.isNotEmpty(conf.getRelations())) {
          for (WidgetRelation pageRelation : conf.getRelations()) {
            pageRelation.replaceId(widgetIdMap);
          }
        }

        copiedDashBoard.setConfiguration(GlobalObjectMapper.writeValueAsString(conf));

      } catch (Exception e) {
        throw new RuntimeException("Fail to deserialize object :" + e.getMessage());
      }
    }

    // Seq 설정
    copiedDashBoard.setSeq(dashBoardRepository.countByWorkBook(dashBoard.getWorkBook()) - 1);

    return dashBoardRepository.save(copiedDashBoard);
  }

  public Set<DataSource> backingDataSource(Set<DataSource> dataSources, WorkBook workbook) {
    Set<DataSource> result = Sets.newHashSet();
    for (DataSource dataSource : dataSources) {
      if (BooleanUtils.isTrue(dataSource.getPublished()) || dataSource.getWorkspaces().contains(workbook.getWorkspace())) {
        dataSource.setValid(true);
      } else {
        dataSource.setValid(false);
      }
      result.add(dataSource);
    }

    return result;
  }

  public Set<DataSource> backingDataSource(WorkBook workbook) {
    List<DataSource> dataSources = dashBoardRepository.findAllDataSourceInDashboard(workbook.getId());
    return backingDataSource(new HashSet<>(dataSources), workbook);
  }

  public boolean validateForChangingDatasource(DashBoard dashBoard, DataSource fromDataSource, DataSource toDataSource) {
    int validateCnt = 0;
    int totalValidCnt = 0;

    // Filter
    List<Filter> dashboardFilterList = dashBoard.getConfigurationObject().getFilters();
    if (dashboardFilterList != null) {
      for (Filter filter : dashboardFilterList) {
        if (filter.getDataSource().equals(fromDataSource.getEngineName())) {
          totalValidCnt ++;
          for (Field datasourceField : toDataSource.getFields()) {
            if (datasourceField.getName().equals(filter.getField())) {
              validateCnt++;
              break;
            }
          }
        }
      }
      if (validateCnt != totalValidCnt) {
        throw new BadRequestException("The field included in the global filter does not exist in the field in the new datasource.");
      }
    }

    // Association
    validateCnt = 0;
    totalValidCnt = 0;
    if (dashBoard.getConfigurationObject().getDataSource() instanceof MultiDataSource) {
      for (MultiDataSource.Association association : ((MultiDataSource) dashBoard.getConfigurationObject().getDataSource()).getAssociations()) {
        if (association.getSource().equals(fromDataSource.getEngineName())) {
          totalValidCnt++;
          for (String key : association.getColumnPair().keySet()) {
            for (Field field : toDataSource.getFields()) {
              if (field.getName().equals(key)) {
                validateCnt++;
                break;
              }
            }
          }
        }
        if (association.getTarget().equals(fromDataSource.getEngineName())) {
          totalValidCnt++;
          for (String key : association.getColumnPair().keySet()) {
            for (Field field : toDataSource.getFields()) {
              if (field.getName().equals(association.getColumnPair().get(key))) {
                validateCnt++;
                break;
              }
            }
          }
        }
      }
    }

    if (validateCnt != totalValidCnt) {
      throw new BadRequestException("The field included in the association does not exist in the field of the new data source.");
    }

    // WidgetField
    for (Widget widget: dashBoard.getWidgets()) {
      int userDefinedFieldCnt = 0;
      validateCnt = 0;
      WidgetConfiguration widgetConfiguration = GlobalObjectMapper.readValue(widget.getConfiguration(), WidgetConfiguration.class);
      if ((widgetConfiguration instanceof PageWidgetConfiguration)) {
        String engineName = ((PageWidgetConfiguration) widgetConfiguration).getDataSource().getEngineName() != null ?
            ((PageWidgetConfiguration) widgetConfiguration).getDataSource().getEngineName() : ((PageWidgetConfiguration) widgetConfiguration).getDataSource().getName();
        if (engineName.equals(fromDataSource.getEngineName())) {
          List<app.metatron.discovery.domain.workbook.configurations.field.Field> widgetFields = ((PageWidgetConfiguration) widgetConfiguration).getPivot().getAllFields();
          for (app.metatron.discovery.domain.workbook.configurations.field.Field field : widgetFields) {
            if ("user_defined".equals(field.getRef())) {
              userDefinedFieldCnt++;
            } else {
              for (Field datasourceField : toDataSource.getFields()) {
                if (datasourceField.getName().equals(field.getName())) {
                  if ((field instanceof MeasureField && datasourceField.getRole().equals(Field.FieldRole.MEASURE))
                      || (field instanceof DimensionField && datasourceField.getRole().equals(Field.FieldRole.DIMENSION))
                      || (field instanceof TimestampField && datasourceField.getRole().equals(Field.FieldRole.TIMESTAMP)))
                    validateCnt++;
                  break;
                }
              }
            }
          }
          if (validateCnt != widgetFields.size() - userDefinedFieldCnt) {
            throw new BadRequestException("The field contained in the widget does not exist in the new datasource.");
          }

          // widget filter
          int validateFilterCnt = 0;
          int totalValidFilterCnt = 0;
          List<Filter> widgetFilterList = ((PageWidgetConfiguration) widgetConfiguration).getFilters();
          for (Filter filter : widgetFilterList) {
            if (filter.getDataSource().equals(fromDataSource.getEngineName())) {
              totalValidFilterCnt ++;
              for (Field datasourceField : toDataSource.getFields()) {
                if (datasourceField.getName().equals(filter.getField())) {
                  validateFilterCnt++;
                  break;
                }
              }
            }
          }
          if (validateFilterCnt != totalValidFilterCnt) {
            throw new BadRequestException("The field included in the local filter does not exist in the field in the new datasource.");
          }
        }

      } else if ((widgetConfiguration instanceof FilterWidgetConfiguration)) {
        if (fromDataSource.getEngineName().equals(((FilterWidgetConfiguration) widgetConfiguration).getFilter().getDataSource())) {
          for (Field datasourceField : toDataSource.getFields()) {
            if (datasourceField.getName().equals(((FilterWidgetConfiguration) widgetConfiguration).getFilter().getField())) {
              validateCnt++;
              break;
            }
          }
          if (validateCnt < 1) {
            throw new BadRequestException("The field contained in the widget does not exist in the new datasource.");
          }
        }
      }
    }

    return true;
  }

  public app.metatron.discovery.domain.workbook.configurations.datasource.
      DataSource changeDataSource(DataSource fromDataSource,
                                  DataSource toDataSource,
                                  app.metatron.discovery.domain.workbook.configurations.datasource.DataSource dataSource) {
    if (dataSource instanceof MultiDataSource) {
      List<app.metatron.discovery.domain.workbook.configurations.datasource.DataSource> dataSourceList = Lists.newArrayList();
      ((MultiDataSource) dataSource).getDataSources().forEach(d -> {
        if (fromDataSource.getName().equals(d.getName()) || fromDataSource.getEngineName().equals(d.getName())
          || (d.getTemporary() && d.getId().equals(fromDataSource.getId()))) {
          d.setConnType(toDataSource.getConnType());
          d.setId(toDataSource.getId());
          if (DataSource.ConnectionType.LINK.equals(toDataSource.getConnType())) {
            List<DataSourceTemporary> dataSourceTemporaryList = dataSourceService.getMatchedTemporaries(toDataSource.getId(), null);
            if (CollectionUtils.isNotEmpty(dataSourceTemporaryList)) {
              DataSourceTemporary dataSourceTemporary = dataSourceTemporaryList.get(0);
              d.setTemporary(true);
              d.setTemporaryId(dataSourceTemporary.getId());
              d.setName(dataSourceTemporary.getName());
              d.setMetaDataSource(dataSourceRepository.findByIdIncludeConnection(dataSourceTemporary.getDataSourceId()));
            }
          } else {
            d.setName(toDataSource.getEngineName());
            d.setTemporary(false);
            d.setMetaDataSource(dataSourceRepository.findByEngineName(toDataSource.getEngineName()));
            d.setTemporaryId(null);
          }
          d.setUiDescription(toDataSource.getDescription());
        }
        dataSourceList.add(d);
      });
      ((MultiDataSource) dataSource).setDataSources(dataSourceList);

      ((MultiDataSource) dataSource).getAssociations().forEach(a -> {
        if (fromDataSource.getEngineName().equals(a.getSource())) {
          a.setSource(toDataSource.getEngineName());
        } else if (fromDataSource.getEngineName().equals(a.getTarget())) {
          a.setTarget(toDataSource.getEngineName());
        }
      });
    } else if (dataSource instanceof DefaultDataSource || dataSource instanceof SingleDataSource) {
      if (fromDataSource.getName().equals(dataSource.getName()) || fromDataSource.getEngineName().equals(dataSource.getName())
          || (dataSource.getTemporary() && dataSource.getId().equals(fromDataSource.getId()))) {
        dataSource.setConnType(toDataSource.getConnType());
        dataSource.setId(toDataSource.getId());
        if (DataSource.ConnectionType.LINK.equals(toDataSource.getConnType())) {
          List<DataSourceTemporary> dataSourceTemporaryList = dataSourceService.getMatchedTemporaries(toDataSource.getId(), null);
          if (CollectionUtils.isNotEmpty(dataSourceTemporaryList)) {
            DataSourceTemporary dataSourceTemporary = dataSourceTemporaryList.get(0);
            dataSource.setTemporary(true);
            dataSource.setTemporaryId(dataSourceTemporary.getId());
            dataSource.setName(dataSourceTemporary.getName());
            dataSource.setMetaDataSource(dataSourceRepository.findByIdIncludeConnection(dataSourceTemporary.getDataSourceId()));
          }
        } else {
          dataSource.setName(toDataSource.getEngineName());
          dataSource.setTemporary(false);
          dataSource.setMetaDataSource(dataSourceRepository.findByEngineName(toDataSource.getEngineName()));
          dataSource.setTemporaryId(null);
        }
        dataSource.setUiDescription(toDataSource.getDescription());
      }
    }
    return dataSource;
  }

}
