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

  @Test
  public void de_serializeTextWidgetConfiguration1() throws IOException {
    String json = "{\"chart\":{\"type\":\"map\",\"layerNum\":2,\"showMapLayer\":true,\"map\":\"OSM\",\"style\":\"Light\",\"licenseNotation\":\"© OpenStreetMap contributors\",\"showDistrictLayer\":true,\"districtUnit\":\"state\",\"layers\":[{\"type\":\"symbol\",\"name\":\"Layer1\",\"symbol\":\"CIRCLE\",\"color\":{\"by\":\"NONE\",\"column\":null,\"schema\":\"#6344ad\",\"transparency\":10,\"minValue\":1,\"maxValue\":493,\"settingUseFl\":false,\"symbolSchema\":\"#6344ad\",\"aggregationType\":null},\"size\":{\"by\":\"NONE\",\"column\":\"NONE\",\"max\":10},\"outline\":null,\"clustering\":true,\"coverage\":50,\"thickness\":{\"by\":\"NONE\",\"column\":\"NONE\",\"maxValue\":2},\"lineStyle\":\"SOLID\"},{\"type\":\"polygon\",\"name\":\"Layer2\",\"symbol\":\"CIRCLE\",\"color\":{\"by\":\"NONE\",\"column\":null,\"schema\":\"#6344ad\",\"transparency\":10,\"settingUseFl\":false,\"polygonSchema\":\"#6344ad\",\"aggregationType\":null},\"size\":{\"by\":\"NONE\",\"column\":\"NONE\",\"max\":10},\"outline\":null,\"clustering\":true,\"coverage\":50,\"thickness\":{\"by\":\"NONE\",\"column\":\"NONE\",\"maxValue\":2},\"lineStyle\":\"SOLID\"},{\"type\":\"polygon\",\"name\":\"SpatialAnalysisLayer\",\"symbol\":\"CIRCLE\",\"color\":{\"by\":\"MEASURE\",\"column\":\"count\",\"schema\":\"VC1\",\"transparency\":10,\"symbolSchema\":\"VC1\",\"minValue\":1,\"maxValue\":2001,\"ranges\":[{\"type\":\"section\",\"fixMin\":2001,\"fixMax\":null,\"gt\":2001,\"lte\":null,\"color\":\"#9a0b2c\",\"symbol\":\"circle\"},{\"type\":\"section\",\"fixMin\":1601,\"fixMax\":2001,\"gt\":1601,\"lte\":2001,\"color\":\"#d73631\",\"symbol\":\"circle\"},{\"type\":\"section\",\"fixMin\":1201,\"fixMax\":1601,\"gt\":1201,\"lte\":1601,\"color\":\"#f23a2c\",\"symbol\":\"circle\"},{\"type\":\"section\",\"fixMin\":801,\"fixMax\":1201,\"gt\":801,\"lte\":1201,\"color\":\"#fb7661\",\"symbol\":\"circle\"},{\"type\":\"section\",\"fixMin\":null,\"fixMax\":801,\"gt\":null,\"lte\":801,\"color\":\"#ffcaba\",\"symbol\":\"circle\"}]},\"size\":{\"by\":\"MEASURE\",\"column\":\"count\",\"max\":10},\"outline\":null,\"clustering\":true,\"coverage\":50,\"thickness\":{\"by\":\"NONE\",\"column\":\"NONE\",\"maxValue\":2},\"lineStyle\":\"SOLID\"}],\"valueFormat\":{\"isAll\":true,\"each\":null,\"type\":\"number\",\"sign\":\"KRW\",\"decimal\":2,\"useThousandsSep\":true},\"legend\":{\"pos\":\"RIGHT_BOTTOM\",\"showName\":false,\"auto\":true},\"toolTip\":{\"displayColumns\":[],\"displayTypes\":[\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"\",\"LAYER_NAME\",\"LOCATION_INFO\",\"DATA_VALUE\"]},\"limitCheck\":true,\"limit\":1000,\"chartZooms\":[{\"startValue\":-96.34700287050951,\"endValue\":37.12677262021312,\"count\":4.49}],\"zoomSize\":4,\"upperCorner\":\"-56.95268459338447 55.68184072055874\",\"lowerCorner\":\"-135.74132114763455 18.57170451986748\",\"analysis\":{\"use\":true,\"type\":\"geo\",\"layerNum\":0,\"selectedLayerNum\":0,\"mainLayer\":\"Layer1\",\"compareLayer\":\"Layer2\",\"operation\":{\"type\":\"within\",\"aggregation\":{\"column\":\"count\"},\"buffer\":0,\"choropleth\":true}},\"version\":2},\"filters\":[],\"type\":\"page\",\"limit\":{\"limit\":1000,\"sort\":[]},\"dataSource\":{\"joins\":[],\"temporary\":false,\"type\":\"multi\",\"dataSources\":[{\"joins\":[],\"temporary\":false,\"id\":\"d51aaf1e-ed19-4054-9ea2-885ec9c4b9f7\",\"name\":\"test_csv_sales\",\"uiDescription\":\"\",\"engineName\":\"test_csv_sales\",\"connType\":\"ENGINE\",\"type\":\"default\"},{\"joins\":[],\"temporary\":false,\"id\":\"12cfd783-9a9a-4fe1-811c-b084d06d9a6b\",\"name\":\"poly_wjrgw\",\"uiDescription\":\"\",\"engineName\":\"poly_wjrgw\",\"connType\":\"ENGINE\",\"type\":\"default\"}],\"associations\":[]},\"pivot\":{\"columns\":[],\"rows\":[],\"aggregations\":[]},\"shelf\":{\"type\":\"geo\",\"layers\":[{\"name\":\"\",\"ref\":\"test_csv_sales\",\"fields\":[{\"type\":\"dimension\",\"name\":\"loc\",\"subType\":\"STRUCT\",\"subRole\":\"DIMENSION\",\"field\":{\"id\":11039100,\"name\":\"loc\",\"logicalName\":\"loc\",\"type\":\"STRUCT\",\"logicalType\":\"GEO_POINT\",\"role\":\"DIMENSION\",\"aggrType\":\"NONE\",\"seq\":0,\"derived\":true,\"derivationRule\":{\"type\":\"geo_point\",\"latField\":\"latitude\",\"lonField\":\"longitude\"},\"granularity\":\"SECOND\",\"segGranularity\":\"MONTH\",\"dataSource\":\"test_csv_sales\",\"dsId\":\"d51aaf1e-ed19-4054-9ea2-885ec9c4b9f7\",\"boardId\":\"e4237e9f-f389-4e0c-8d4d-1d6cbaa593f7\",\"uiMetaData\":{\"popularity\":0,\"physicalName\":\"loc\",\"role\":\"DIMENSION\",\"physicalType\":\"STRUCT\",\"name\":\"loc\",\"id\":\"9057\",\"type\":\"GEO_POINT\"},\"useFilter\":false,\"pivot\":[]},\"granularity\":\"SECOND\",\"segGranularity\":\"MONTH\",\"currentPivot\":\"MAP_LAYER0\"}]},{\"name\":\"\",\"ref\":\"poly_wjrgw\",\"fields\":[{\"type\":\"dimension\",\"name\":\"geom\",\"subType\":\"STRING\",\"subRole\":\"DIMENSION\",\"field\":{\"id\":11039052,\"name\":\"geom\",\"logicalName\":\"geom\",\"type\":\"STRING\",\"logicalType\":\"GEO_POLYGON\",\"role\":\"DIMENSION\",\"aggrType\":\"NONE\",\"seq\":1,\"granularity\":\"MONTH\",\"segGranularity\":\"MONTH\",\"dataSource\":\"poly_wjrgw\",\"dsId\":\"12cfd783-9a9a-4fe1-811c-b084d06d9a6b\",\"boardId\":\"e4237e9f-f389-4e0c-8d4d-1d6cbaa593f7\",\"uiMetaData\":{\"popularity\":0,\"physicalName\":\"geom\",\"role\":\"DIMENSION\",\"physicalType\":\"STRING\",\"name\":\"geom\",\"id\":\"9009\",\"type\":\"GEO_POLYGON\"},\"pivot\":[],\"useFilter\":false},\"granularity\":\"MONTH\",\"segGranularity\":\"MONTH\",\"currentPivot\":\"MAP_LAYER1\"}]},{\"name\":\"SpatialAnalysisLayer\",\"ref\":\"\",\"fields\":[{\"type\":\"dimension\",\"name\":\"loc\",\"subType\":\"STRUCT\",\"subRole\":\"DIMENSION\",\"field\":{\"id\":11039100,\"name\":\"loc\",\"logicalName\":\"loc\",\"type\":\"STRUCT\",\"logicalType\":\"GEO_POINT\",\"role\":\"DIMENSION\",\"aggrType\":\"NONE\",\"seq\":0,\"derived\":true,\"derivationRule\":{\"type\":\"geo_point\",\"latField\":\"latitude\",\"lonField\":\"longitude\"},\"granularity\":\"SECOND\",\"segGranularity\":\"MONTH\",\"dataSource\":\"test_csv_sales\",\"dsId\":\"d51aaf1e-ed19-4054-9ea2-885ec9c4b9f7\",\"boardId\":\"e4237e9f-f389-4e0c-8d4d-1d6cbaa593f7\",\"uiMetaData\":{\"popularity\":0,\"physicalName\":\"loc\",\"role\":\"DIMENSION\",\"physicalType\":\"STRUCT\",\"name\":\"loc\",\"id\":\"9057\",\"type\":\"GEO_POINT\"},\"useFilter\":false,\"pivot\":[]},\"granularity\":\"SECOND\",\"segGranularity\":\"MONTH\",\"currentPivot\":\"MAP_LAYER0\"},{\"alias\":\"count\",\"type\":\"measure\",\"subRole\":\"measure\",\"name\":\"count\",\"isCustomField\":true}]}]},\"fields\":[]}";
    WidgetConfiguration desrializeConf = GlobalObjectMapper.getDefaultMapper().readValue(json, WidgetConfiguration.class);

    System.out.println(desrializeConf);
  }
}
