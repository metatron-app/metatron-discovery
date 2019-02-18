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

package app.metatron.discovery.domain.workbook.configurations;

import com.google.common.collect.Maps;

import org.assertj.core.util.Lists;
import org.junit.Test;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.configurations.board.BoardGlobalOptions;
import app.metatron.discovery.domain.workbook.configurations.board.WidgetRelation;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.JoinMapping;
import app.metatron.discovery.domain.workbook.configurations.datasource.MappingDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MultiDataSource;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeAllFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeListFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeRangeFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.TimeRelativeFilter;

public class BoardConfigurationTest {

  @Test
  public void de_serialize() throws IOException {

    BoardGlobalOptions boardGlobalOptions = new BoardGlobalOptions(
        new BoardGlobalOptions.LayoutOptions("FIT_TO_SCREEN", null, 5),
        new BoardGlobalOptions.WidgetOptions("on", "on", "by_widget"),
        new BoardGlobalOptions.SyncOptions(true, 5)
    );

    DataSource dataSource = new DefaultDataSource("default");

    MappingDataSource mappingDataSource = new MappingDataSource();
    dataSource.setName("mapping");
    Map<String, String> keyPair1 = Maps.newHashMap();
    keyPair1.put("Category", "cat");
    Map<String, String> keyPair2 = Maps.newHashMap();
    keyPair2.put("Region", "region");
    Map<String, String> keyPair3 = Maps.newHashMap();
    keyPair3.put("abbr", "cat");

    JoinMapping childJoinMapping = new JoinMapping("sales_join_category_abbr", null, "INNER", keyPair3, null);
    JoinMapping joinMapping1 = new JoinMapping("sales_join_category", "join1", "INNER", keyPair1, childJoinMapping);
    JoinMapping joinMapping2 = new JoinMapping("sales_join_region", null, "LEFT_OUTER", keyPair2, null);

    mappingDataSource.setJoins(com.google.common.collect.Lists.newArrayList(
        joinMapping1, joinMapping2
    ));

    Map<String, String> columnPair = Maps.newHashMap();
    columnPair.put("sourceColumn1", "targetColumn1");
    columnPair.put("sourceColumn2", "targetColumn2");
    MultiDataSource.Association association = new MultiDataSource.Association(
        "default", "mapping", columnPair
    );

    DataSource multiDataSource = new MultiDataSource(
        Lists.newArrayList(dataSource, mappingDataSource),
        Lists.newArrayList(association)
    );

    List<BoardConfiguration.LayoutWidget> layoutWidgets = Lists.newArrayList(
        new BoardConfiguration.LayoutWidget("widget_id_p1", "page", "ref_p1", null),
        new BoardConfiguration.LayoutWidget("widget_id_p2", "page", "ref_p2", null),
        new BoardConfiguration.LayoutWidget("widget_id_p3", "page", "ref_p3", null),
        new BoardConfiguration.LayoutWidget("widget_id_f1", "filter", "ref_f1", null)
    );

    List<WidgetRelation> widgetRelations = Lists.newArrayList(
        new WidgetRelation("widget_id_p1", new WidgetRelation("widget_id_p2")),
        new WidgetRelation("widget_id_p3")
    );

    List<Filter> filters = Lists.newArrayList(
        new TimeAllFilter("time1", null),
        new TimeListFilter("time2", null, "DAY", null, false, null, null,
                           Lists.newArrayList("2018-05-18", "2018-05-19"),
                           Lists.newArrayList("2018-05-18", "2018-05-19", "2018-05-20")),
        new TimeRangeFilter("time3", null, "DAY",
                            Lists.newArrayList("EARLIEST_DATETIME/2018-05-18",
                                               "2018-05-19/2018-05-20",
                                               "2018-05-22/LATEST_DATETIME"), null, null),
        new TimeRelativeFilter("time4", "ref1", "DAY", null, "PREVIOUS", 2, "Asia/Seoul", null)
    );

    InclusionFilter inFilter = new InclusionFilter();
    inFilter.setDataSource("datasource1");
    inFilter.setField("field1");
    inFilter.setValueList(Lists.newArrayList("value"));

    filters.add(inFilter);

    BoardConfiguration boardConfiguration = new BoardConfiguration(multiDataSource, boardGlobalOptions, layoutWidgets,
                                                                   null, widgetRelations, null, filters);

    String boardSpecStr = GlobalObjectMapper.writeValueAsString(boardConfiguration);
    System.out.println(boardSpecStr);

    BoardConfiguration deserializedConfObj = GlobalObjectMapper.getDefaultMapper().readValue(boardSpecStr, BoardConfiguration.class);

    System.out.println(deserializedConfObj);
  }

}
