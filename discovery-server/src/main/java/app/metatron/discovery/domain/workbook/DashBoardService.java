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

import com.google.common.collect.Maps;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

import javax.transaction.Transactional;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.images.Image;
import app.metatron.discovery.domain.images.ImageService;
import app.metatron.discovery.domain.workbook.configurations.BoardConfiguration;
import app.metatron.discovery.domain.workbook.configurations.board.WidgetRelation;
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
}
