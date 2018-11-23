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

package app.metatron.discovery.domain.workbook.configurations.chart;

import org.assertj.core.util.Lists;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.FontSize;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.HAlign;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.VAlign;
import app.metatron.discovery.domain.workbook.configurations.format.CurrencyFormat;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;

/**
 * Text Table spec. Test
 */
public class GridChartTest {

  @Before
  public void setUp() {
  }

  @Test
  public void de_serialize() throws IOException {

    ChartColor color = new ChartColorByMeasure("schema1");

    FieldFormat valueFormat = new CurrencyFormat(5, true, "$");

    GridChart.ValueStyle headerStyle =
        new GridChart.ValueStyle(true, HAlign.CENTER.name(), VAlign.CENTER.name(),
                                 FontSize.NORMAL.name(), "#COLOR", Lists.newArrayList(GridChart.FontStyle.BOLD.name()), "#COLOR");

    GridChart.ValueStyle contentStyle =
        new GridChart.ValueStyle(true, HAlign.LEFT.name(), VAlign.CENTER.name(),
                                 FontSize.NORMAL.name(), "#COLOR", Lists.newArrayList(GridChart.FontStyle.BOLD.name()), "#COLOR");

    GridChart.TotalValueStyle totalValueStyle =
        new GridChart.TotalValueStyle("총합", "SUM", HAlign.LEFT.name(), VAlign.CENTER.name(),
                                      FontSize.NORMAL.name(), "#COLOR", Lists.newArrayList(GridChart.FontStyle.BOLD.name()), "#COLOR");

    GridChart.Annotation annotation = new GridChart.Annotation("단위: 000원", GridChart.AnnotationPosition.BOTTOM_LEFT.name());

    GridChart chart = new GridChart(color, valueFormat,
                                    500,
                                    GridChart.DataType.PIVOT.name(), GridChart.MeasureLayout.VERTICAL.name(),
                                    headerStyle, contentStyle, totalValueStyle, annotation);

    System.out.println(chart.toString());

    String chartStr = GlobalObjectMapper.getDefaultMapper().writeValueAsString(chart);

    System.out.println(chartStr);

    Chart deSerialized = GlobalObjectMapper.getDefaultMapper().readValue(chartStr, Chart.class);

    System.out.println("Result : " + deSerialized.toString());

  }

}
