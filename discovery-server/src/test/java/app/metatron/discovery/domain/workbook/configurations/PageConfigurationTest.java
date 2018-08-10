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

import com.fasterxml.jackson.core.JsonProcessingException;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import java.util.List;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.configurations.analysis.Style;
import app.metatron.discovery.domain.workbook.configurations.analysis.TrendAnalysis;
import app.metatron.discovery.domain.workbook.configurations.chart.BarChart;
import app.metatron.discovery.domain.workbook.configurations.chart.ChartColor;
import app.metatron.discovery.domain.workbook.configurations.chart.ChartColorByDimension;
import app.metatron.discovery.domain.workbook.configurations.field.DimensionField;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.domain.workbook.configurations.format.NumberFieldFormat;
import app.metatron.discovery.domain.workbook.configurations.widget.PageWidgetConfiguration;

/**
 * Created by kyungtaak on 2016. 3. 24..
 */
public class PageConfigurationTest {

  @Before
  public void setUp() {
  }

  @Test
  public void sheetSerialize() throws JsonProcessingException {
    PageWidgetConfiguration pageConfiguration = new PageWidgetConfiguration();

    Pivot pivot = new Pivot();
    pivot.setColumns(Lists.newArrayList(new DimensionField("dimension1"),
            new MeasureField("measure1"),
            new TimestampField("timestamp")));

    pivot.setRows(Lists.newArrayList(new DimensionField("dimension2"),
            new MeasureField("measure2")));

    pageConfiguration.setPivot(pivot);

    List<UserDefinedField> customFields = Lists.newArrayList(
        new ExpressionField("Calculated Field", "SUM(dimension7)+SUM(dimension8)")
    );

    pageConfiguration.setFields(customFields);

    ChartColor color = new ChartColorByDimension("12colors", "field1", null, null);

//    ChartLabelRowMode rowMode = new ChartLabelRowMode();
//    rowMode.setMark(VERTICAL);
//    rowMode.setShowName(true);
//    rowMode.setName("TEST_ROW");
//    rowMode.setAxisOption(new ChartNumericAxis(true, 0, 10, 1));
//
//    ChartLabel label = new ChartLabel(true, false
//        , new ChartLabelColMode(HORIZONTAL)
//        , rowMode);
//
//    ChartLegend legend = new ChartLegend(true, LEFT, 5);
//
//    BarChartSeries series = new BarChartSeries(BarChartSeries.MarkType.STACKED, BarChartSeries.Align.HORIZONTAL, BarChartSeries.UnitType.NONE);

    BarChart chart = null;

    pageConfiguration.setChart(chart);

//    PredictionAnalysis predictionAnalysis = new PredictionAnalysis();
//    predictionAnalysis.setSeriesTypes(Lists.newArrayList(PredictionAnalysis.SeriesType.CONFIDENCE, PredictionAnalysis.SeriesType.FORECAST));
//
//    PredictionAnalysis.Forecast forecast = new PredictionAnalysis.Forecast();
//    forecast.setParameters(Lists.newArrayList(new PredictionAnalysis.HyperParameter("SUM(Sales)")));
//    forecast.setStyle(new Style("#12345567", Style.LineStyle.SOLID, 2.5));
//    predictionAnalysis.setForecast(forecast);
//
//    PredictionAnalysis.Confidence confidence = new PredictionAnalysis.Confidence();
//    confidence.setConfidenceInterval(95.4);
//    confidence.setStyle(new Style("#7654321", 85));
//    predictionAnalysis.setConfidence(confidence);
//
//    predictionAnalysis.setInterval(20);
//    predictionAnalysis.setGranularity(DataSource.GranularityType.DAY);
//
//    pageConfiguration.setAnalysis(predictionAnalysis);

    TrendAnalysis trendAnalysis = new TrendAnalysis(
        Lists.newArrayList(
            new TrendAnalysis.TrendBySeries(true, "SUM(Sales)", TrendAnalysis.Formula.EXPONENTIAL, new Style("#7654321", Style.LineStyle.SOLID, 2.5)),
            new TrendAnalysis.TrendBySeries(false, "SUM(Profit)", TrendAnalysis.Formula.CUBIC, new Style("#7654321", Style.LineStyle.DASHED, 2))
        ));
    pageConfiguration.setAnalysis(trendAnalysis);

//    ClusterAnalysis clusterAnalysis = new ClusterAnalysis(2, new Style("#7654321"), new Style("#7654322"));
//    pageConfiguration.setAnalysis(clusterAnalysis);

    NumberFieldFormat numberFormat = new NumberFieldFormat(2, false, null, null);
    pageConfiguration.setFormat(numberFormat);

    System.out.println(GlobalObjectMapper.writeValueAsString(pageConfiguration));
  }

  @Test
  public void sheetDeserialize() throws IOException {

    String pageConfSpec = "{\n" +
        "  \"type\" : \"sheet\",\n" +
        "  \"pivot\" : {\n" +
        "    \"columns\" : [ {\n" +
        "      \"type\" : \"dimension\",\n" +
        "      \"fieldName\" : \"dimension1\",\n" +
        "      \"name\" : \"dimension1\",\n" +
        "      \"alias\" : \"dimension1\"" +
        "    }, {\n" +
        "      \"type\" : \"measure\",\n" +
        "      \"fieldName\" : \"measure1\",\n" +
        "      \"name\" : \"measure1\",\n" +
        "      \"alias\" : \"measure1\",\n" +
        "      \"aggregationType\" : \"NONE\"" +
        "    }, {\n" +
        "      \"type\" : \"timestamp\",\n" +
        "      \"fieldName\" : \"timestamp\",\n" +
        "      \"name\" : \"timestamp\",\n" +
        "      \"alias\" : \"timestamp\"" +
        "    } ],\n" +
        "    \"rows\" : [ {\n" +
        "      \"type\" : \"dimension\",\n" +
        "      \"fieldName\" : \"dimension2\",\n" +
        "      \"name\" : \"dimension2\",\n" +
        "      \"alias\" : \"dimension2\"\n" +
        "    }, {\n" +
        "      \"type\" : \"measure\",\n" +
        "      \"fieldName\" : \"measure2\",\n" +
        "      \"name\" : \"measure2\",\n" +
        "      \"alias\" : \"measure2\",\n" +
        "      \"aggregationType\" : \"NONE\"\n" +
        "    } ]\n" +
        "  },\n" +
        "  \"fields\" : [ {\n" +
        "    \"type\" : \"group\",\n" +
        "    \"fieldName\" : \"DimensionGroup\",\n" +
        "    \"name\" : \"DimensionGroup\",\n" +
        "    \"fields\" : [ {\n" +
        "      \"type\" : \"dimension\",\n" +
        "      \"fieldName\" : \"dimension5\",\n" +
        "      \"name\" : \"dimension5\",\n" +
        "      \"alias\" : \"dimension5\"\n" +
        "    }, {\n" +
        "      \"type\" : \"dimension\",\n" +
        "      \"fieldName\" : \"dimension6\",\n" +
        "      \"name\" : \"dimension6\",\n" +
        "      \"alias\" : \"dimension6\"\n" +
        "    } ],\n" +
        "    \"alias\" : \"DimensionGroup\"\n" +
        "  }, {\n" +
        "    \"type\" : \"calculated\",\n" +
        "    \"fieldName\" : \"Calculated Field\",\n" +
        "    \"name\" : \"Calculated Field\",\n" +
        "    \"alias\" : \"Calculated Field\",\n" +
        "    \"expr\" : \"SUM(dimension7)+SUM(dimension8)\",\n" +
        "    \"aggregated\" : false\n" +
        "  } ],\n" +
        "  \"chart\" : {\n" +
        "    \"type\" : \"bar\",\n" +
        "    \"color\" : {\n" +
        "      \"type\" : \"dimension\",\n" +
        "      \"schema\" : \"12colors\",\n" +
        "      \"targetField\" : \"\",\n" +
        "      \"auto\" : true\n" +
        "    },\n" +
        "    \"size\" : {\n" +
        "      \"size\" : 12,\n" +
        "      \"auto\" : true\n" +
        "    },\n" +
        "    \"chartDrawingFlag\" : false,\n" +
        "    \"label\" : {\n" +
        "      \"scaled\" : true,\n" +
        "      \"showValue\" : false,\n" +
        "      \"axis\" : [ {\n" +
        "        \"mode\" : \"column\",\n" +
        "        \"showName\" : false,\n" +
        "        \"showMark\" : false,\n" +
        "        \"mark\" : \"HORIZONTAL\"\n" +
        "      }, {\n" +
        "        \"mode\" : \"row\",\n" +
        "        \"showName\" : false,\n" +
        "        \"showMark\" : false,\n" +
        "        \"mark\" : \"VERTICAL\"\n" +
        "      } ]\n" +
        "    },\n" +
        "    \"legend\" : {\n" +
        "      \"pos\" : \"LEFT\",\n" +
        "      \"count\" : 5,\n" +
        "      \"auto\" : true\n" +
        "    },\n" +
        "    \"series\" : {\n" +
        "      \"mark\" : \"STACKED\",\n" +
        "      \"align\" : \"HORIZONTAL\",\n" +
        "      \"unit\" : \"NONE\"\n" +
        "    },\n" +
        "    \"baseLine\" : false\n" +
        "  },\n" +
        "  \"analysis\" : {\n" +
        "    \"type\" : \"trend\",\n" +
        "    \"formula\" : \"CUBIC\",\n" +
        "    \"style\" : {\n" +
        "      \"color\" : \"#7654321\",\n" +
        "      \"transparency\" : 85\n" +
        "    }\n" +
        "  }\n" +
        "}";

    PageWidgetConfiguration config = GlobalObjectMapper.getDefaultMapper().readValue(pageConfSpec, PageWidgetConfiguration.class);

    System.out.println("ToString Result - \n" + ToStringBuilder.reflectionToString(config, ToStringStyle.MULTI_LINE_STYLE));
  }

}
