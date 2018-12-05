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

import com.fasterxml.jackson.core.JsonProcessingException;

import org.assertj.core.util.Lists;
import org.junit.Before;
import org.junit.Test;

import java.util.List;

import app.metatron.discovery.common.GlobalObjectMapper;

/**
 * Map View spec. Test
 */
public class MapChartTest extends ChartTest {

  @Before
  public void setUp() {
  }

  @Test
  public void de_serialize() throws JsonProcessingException {

    // Layers
    List<MapChartLayer> layers = Lists.newArrayList();
    layers.add(new MapChartLayer.SymbolLayer("symbol_layer", "circle",
                                             new MapChartLayer.Color("dimension", "column1", "color_code1", null, null, 20),
                                             new MapChartLayer.Size("measure", "column1"),
                                             new MapChartLayer.Outline("color_code2", "thin"),
                                             true, 20)
    );

    layers.add(new MapChartLayer.LineLayer("line_layer", "straight",
                                           new MapChartLayer.Color("none", null, null, "color_code1", "color_code2", 0),
                                           "source_column",
                                           "target_column",
                                           new MapChartLayer.Thickness("measure", "column3", 10), "dotted")
    );

    layers.add(new MapChartLayer.PolygonLayer("polygon_layer",
                                              new MapChartLayer.Color("measure", "column1", "color_schema1", null, null, 0),
                                              new MapChartLayer.Outline("color_code1", "normal"))
    );

    layers.add(new MapChartLayer.HeatMapLayer("heatmap_layer",
                                              new MapChartLayer.Color("none", null, "color_schema1", null, null, 0),
                                              10, 20)
    );

    layers.add(new MapChartLayer.TileLayer("tile_layer",
                                           new MapChartLayer.Color("measure", "column1", "color_schema1", null, null, 20),
                                           "hexagon",
                                           80, 60)
    );

    ChartLegend mapChartLegend = new ChartLegend(null, null, "RIGHT_BOTTOM");
    ChartToolTip chartToolTip = new ChartToolTip(
        Lists.newArrayList("layer_name", "location_info", "data_value"),
        Lists.newArrayList("column1", "column2"),
        null
    );

    MapChart chart = new MapChart(valueNumberFormat(), mapChartLegend, chartToolTip,
                                  500,
                                  true, "OSM_DARK", null, "Ok! license",
                                  true, "state", layers);

    System.out.println(chart.toString());

    String chartStr = GlobalObjectMapper.getDefaultMapper().writeValueAsString(chart);

    System.out.println(chartStr);

    Chart deSerialized = GlobalObjectMapper.readValue(chartStr, Chart.class);

    System.out.println("Result : " + deSerialized.toString());

  }


}
