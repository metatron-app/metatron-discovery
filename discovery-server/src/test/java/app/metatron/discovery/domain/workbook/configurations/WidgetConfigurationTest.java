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

import com.google.common.collect.Lists;

import org.junit.Assert;
import org.junit.Test;

import java.io.IOException;
import java.util.List;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.configurations.chart.ChartLegend;
import app.metatron.discovery.domain.workbook.configurations.chart.ChartToolTip;
import app.metatron.discovery.domain.workbook.configurations.chart.MapChart;
import app.metatron.discovery.domain.workbook.configurations.chart.MapChartLayer;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.MultiDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.format.CurrencyFormat;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.NumberFieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.PercentFormat;
import app.metatron.discovery.domain.workbook.configurations.widget.FilterWidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.widget.PageWidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.widget.TextWidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.GeoShelf;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.LayerView;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.MapViewLayer;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.Shelf;

public class WidgetConfigurationTest {

  @Test
  public void de_serializeTextWidgetConfiguration() {

    TextWidgetConfiguration configuration = new TextWidgetConfiguration();

    String textWidgetConfJson = GlobalObjectMapper.writeValueAsString(configuration);

    System.out.println(textWidgetConfJson);

    WidgetConfiguration desrializeConf = GlobalObjectMapper.readValue(textWidgetConfJson, WidgetConfiguration.class);

    System.out.println(desrializeConf.toString());
    Assert.assertTrue(desrializeConf instanceof TextWidgetConfiguration);
  }

  @Test
  public void de_serializeFilterWidgetConfiguration() {

    Filter filter = new InclusionFilter("f1", Lists.newArrayList("v1", "v2", "v3"));
    FilterWidgetConfiguration configuration = new FilterWidgetConfiguration();
    configuration.setFilter(filter);

    String filterWidgetConfJson = GlobalObjectMapper.writeValueAsString(configuration);

    System.out.println(filterWidgetConfJson);

    WidgetConfiguration desrializeConf = GlobalObjectMapper.readValue(filterWidgetConfJson, WidgetConfiguration.class);

    System.out.println(desrializeConf.toString());
    Assert.assertTrue(desrializeConf instanceof FilterWidgetConfiguration);
  }

  @Test
  public void de_serializePageWidgetConfiguration() {

    Filter filter = new InclusionFilter("f1", Lists.newArrayList("v1", "v2", "v3"));
    PageWidgetConfiguration configuration = new PageWidgetConfiguration();
    configuration.setFilters(Lists.newArrayList(filter));

    NumberFieldFormat numberFormat = new NumberFieldFormat(2, false, null, null);
    PercentFormat percentFormat = new PercentFormat(2, true);
    CurrencyFormat currencyFormat = new CurrencyFormat(2, true, "$");
    configuration.setFormat(currencyFormat);

    String pageWidgetConfJson = GlobalObjectMapper.writeValueAsString(configuration);

    System.out.println(pageWidgetConfJson);

    WidgetConfiguration desrializeConf = GlobalObjectMapper.readValue(pageWidgetConfJson, WidgetConfiguration.class);

    System.out.println(desrializeConf.toString());
    Assert.assertTrue(desrializeConf instanceof PageWidgetConfiguration);
  }

  @Test
  public void de_serializeMapPageWidgetConfiguration() throws IOException {

    MultiDataSource dataSource = new MultiDataSource(Lists.newArrayList(new DefaultDataSource("datasource_name1"),
                                                                        new DefaultDataSource("datasource_name2")), null);

    List<Filter> filters = Lists.newArrayList(
        new InclusionFilter("f1", Lists.newArrayList("v1", "v2", "v3"))
    );

    MapViewLayer layer1 = new MapViewLayer("layer1", "datasource_name1", Lists.newArrayList(new DimensionField("Geo1"), new DimensionField("region")), new LayerView.OriginalLayerView());
    MapViewLayer layer2 = new MapViewLayer("layer2", "datasource_name2", Lists.newArrayList(new DimensionField("Geo1"), new DimensionField("Geo2"), new MeasureField("measure")), new LayerView.HashLayerView("h3", 5));

    Shelf geoShelf = new GeoShelf(
        Lists.newArrayList(layer1, layer2)
    );

    // Layers
    List<MapChartLayer> layers = org.assertj.core.util.Lists.newArrayList();
    layers.add(new MapChartLayer.SymbolLayer("symbol_layer", "circle",
                                             new MapChartLayer.Color("dimension", "column1", "color_code1", null, null, 20),
                                             new MapChartLayer.Size("measure", "column1"),
                                             new MapChartLayer.Outline("color_code2", "thin"),
                                             true, 50)
    );

    layers.add(new MapChartLayer.LineLayer("line_layer", "straight",
                                           new MapChartLayer.Color("none", null, null, "color_code1", "color_code2", 0),
                                           "source_column",
                                           "target_column",
                                           new MapChartLayer.Thickness("measure", "column3", 10), "solid")
    );

    FieldFormat valueFormat = new NumberFieldFormat(2, true,
                                                    "auto", new NumberFieldFormat.CustomSymbol("원", "after"));
    ChartLegend mapChartLegend = new ChartLegend(null, null, "RIGHT_BOTTOM");
    ChartToolTip chartToolTip = new ChartToolTip(
        Lists.newArrayList("layer_name", "location_info", "data_value"),
        Lists.newArrayList("column1", "column2"),
        null
    );

    MapChart chart = new MapChart(valueFormat, mapChartLegend, chartToolTip,
                                  500,
                                  true, "OSM_LIGHT", null, "Ok! license",
                                  true, "state", layers);


    WidgetConfiguration configuration = new PageWidgetConfiguration(
        dataSource, filters, null, geoShelf, null, chart, null, null, null
    );

    String pageWidgetConfJson = GlobalObjectMapper.getDefaultMapper().writeValueAsString(configuration);

    System.out.println(pageWidgetConfJson);

    WidgetConfiguration desrializeConf = GlobalObjectMapper.getDefaultMapper().readValue(pageWidgetConfJson, WidgetConfiguration.class);

    System.out.println(desrializeConf.toString());

    Assert.assertTrue(desrializeConf instanceof PageWidgetConfiguration);
  }
}
