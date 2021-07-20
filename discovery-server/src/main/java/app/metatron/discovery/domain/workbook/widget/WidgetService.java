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

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;

import javax.transaction.Transactional;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.DataSourceService;
import app.metatron.discovery.domain.datasource.DataSourceTemporary;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MultiDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.SingleDataSource;
import app.metatron.discovery.domain.workbook.configurations.widget.FilterWidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.widget.PageWidgetConfiguration;

@Component
public class WidgetService {

  private static Logger LOGGER = LoggerFactory.getLogger(WidgetService.class);

  @Autowired
  WidgetRepository widgetRepository;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  DataSourceService dataSourceService;

  @Transactional
  public Widget copy(Widget widget, DashBoard parent, boolean addPrefix) {
    return widgetRepository.saveAndFlush(widget.copyOf(parent, addPrefix));
  }

  public Widget changeDataSource(String widgetId,
                                 app.metatron.discovery.domain.datasource.DataSource fromDataSource,
                                 app.metatron.discovery.domain.datasource.DataSource toDataSource) {

    Widget widget = widgetRepository.findOne(widgetId);
    LOGGER.info("{}'s before configuration : {}", widget.getId(), widget.getConfiguration());

    HashMap widgetConfiguration = (HashMap) GlobalObjectMapper.readValue(widget.getConfiguration());
    if ("page".equals(widgetConfiguration.get("type"))) {
      if (((PageWidgetConfiguration)widget.convertConfiguration()).getFields() != null) {
        List fieldList = Lists.newArrayList();
        ((PageWidgetConfiguration)widget.convertConfiguration()).getFields().forEach(userDefinedField -> {
          if (userDefinedField.getDataSource().equals(fromDataSource.getEngineName())) {
            userDefinedField.setDataSource(toDataSource.getEngineName());
          }
          HashMap field = (HashMap) GlobalObjectMapper.readValue(GlobalObjectMapper.writeValueAsString(userDefinedField));
          field.put("type", "user_expr");
          fieldList.add(field);
        });
        widgetConfiguration.put("fields", fieldList);
      }
      DataSource widgetDataSource = ((PageWidgetConfiguration)widget.convertConfiguration()).getDataSource();
      widgetConfiguration.put("dataSource", GlobalObjectMapper.readValue(
          GlobalObjectMapper.writeValueAsString(
              changeDataSource(fromDataSource, toDataSource, widgetDataSource))));
      Lists.newArrayList("columns", "rows", "aggregations").forEach(type -> {
        List pivots = ((List)((HashMap)widgetConfiguration.get("pivot")).get(type));
        pivots.forEach(pivot -> {
          if (((HashMap)pivot).get("field") != null) {
            HashMap field = (HashMap)((HashMap)pivot).get("field");
            if (fromDataSource.getId().equals(field.get("dsId"))) {
              toDataSource.getFields().forEach(dataSourceField -> {
                if (dataSourceField.getName().equals(field.get("name"))) {
                  field.put("id", dataSourceField.getId());
                  field.put("dsId", toDataSource.getId());
                  field.put("dataSource", toDataSource.getEngineName());
                  field.put("granularity", toDataSource.getGranularity());
                  field.put("segGranularity", toDataSource.getSegGranularity());
                }
                ((HashMap) pivot).put("field", field);
              });
            }
          }
        });
      });

    } else if ("filter".equals(widgetConfiguration.get("type"))) {
      if (((FilterWidgetConfiguration)widget.convertConfiguration()).getFilter().getDataSource().equals(fromDataSource.getEngineName())) {
        ((HashMap)widgetConfiguration.get("filter")).put("dataSource", toDataSource.getEngineName());
      }
    }

    widget.setConfiguration(GlobalObjectMapper.writeValueAsString(widgetConfiguration));
    LOGGER.info("{}'s after configuration : {}", widget.getId(), widget.getConfiguration());
    return widgetRepository.saveAndFlush(widget);
  }

  private DataSource changeDataSource(app.metatron.discovery.domain.datasource.DataSource fromDataSource,
                                      app.metatron.discovery.domain.datasource.DataSource toDataSource,
                                      DataSource dataSource) {
    if (dataSource instanceof MultiDataSource) {
      List<DataSource> dataSourceList = Lists.newArrayList();
      ((MultiDataSource) dataSource).getDataSources().forEach((d -> {
        if (fromDataSource.getName().equals(d.getName()) || fromDataSource.getEngineName().equals(d.getName())
            || (d.getTemporary() && d.getId().equals(fromDataSource.getId()))) {
          d.setConnType(toDataSource.getConnType());
          d.setId(toDataSource.getId());
          if (app.metatron.discovery.domain.datasource.DataSource.ConnectionType.LINK.equals(toDataSource.getConnType())) {
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
      }));
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
        if (app.metatron.discovery.domain.datasource.DataSource.ConnectionType.LINK.equals(toDataSource.getConnType())) {
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
