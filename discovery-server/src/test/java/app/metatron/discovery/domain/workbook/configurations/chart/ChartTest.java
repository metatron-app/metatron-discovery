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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import java.util.Map;

import app.metatron.discovery.domain.workbook.configurations.chart.properties.FontSize;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.HAlign;
import app.metatron.discovery.domain.workbook.configurations.chart.properties.VAlign;
import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.domain.workbook.configurations.format.NumberFieldFormat;

public class ChartTest {

  public ChartColor colorByMeasureForSection() {
    ChartColor color = new ChartColorByMeasure(null, "SECTION", Lists.newArrayList(
        new ChartColorRange.ChartColorSectionRange("#FFFFFF", 0, 20),
        new ChartColorRange.ChartColorSectionRange("#FFFFFF", 20, 50)
    ));

    return color;
  }

  public ChartColor colorByMeasureForGradient() {
    ChartColor color = new ChartColorByMeasure(null, "SECTION", Lists.newArrayList(
        new ChartColorRange.ChartColorGradientRange("#FFFFFF", 0, 20, "#gradx_slider_0"),
        new ChartColorRange.ChartColorGradientRange("#FFFFFD", 1, 30, "#gradx_slider_1")
    ));

    return color;
  }

  public ChartColor colorByDimensionForGauge() {

    Map<String, String> colorPairs = Maps.newLinkedHashMap();
    colorPairs.put("content1", "#color1");
    colorPairs.put("content2", "#color2");

    ChartColor color = new ChartColorByDimension("#ColorSchema1",
                                                 "TargetField",
                                                 null,
                                                 colorPairs);

    return color;
  }

  public FieldFormat valueNumberFormat() {
    FieldFormat valueFormat = new NumberFieldFormat(2, true,
                                                    "auto", new NumberFieldFormat.CustomSymbol("원", "after"));

    return valueFormat;
  }

  public String fontLargerSize() {
    return FontSize.LARGE.name();
  }

  public ChartDataLabel dataLabel() {
    ChartDataLabel label = new ChartDataLabel(
        Lists.newArrayList(ChartLabelDisplayType.CATEGORY_NAME.name(), ChartLabelDisplayType.CATEGORY_PERCENT.name()),
        ChartDataLabel.Position.CENTER.name(),
        null,
        false,
        false,
        null,
        null,
        "#color",
        "#backgroundcolor",
        "#outlinecolor",
        ChartDataLabel.TextAlign.CENTER.name(),
        false);

    return label;

  }

  public ChartDataLabel combineDataLabel() {
    ChartDataLabel label = new ChartDataLabel(
        Lists.newArrayList(ChartLabelDisplayType.CATEGORY_NAME.name(), ChartLabelDisplayType.CATEGORY_PERCENT.name()),
        ChartDataLabel.Position.OUTSIDE_RIGHT.name(),
        ChartDataLabel.Position.RIGHT.name(),
        false,
        false,
        null,
        null,
        "#color",
        "#backgroundcolor",
        "#outlinecolor",
        ChartDataLabel.TextAlign.CENTER.name(),
        false);

    return label;

  }

  public ChartDataLabel treemapDataLabel() {
    ChartDataLabel label = new ChartDataLabel(
        Lists.newArrayList(ChartLabelDisplayType.CATEGORY_NAME.name(), ChartLabelDisplayType.CATEGORY_PERCENT.name()),
        null,
        null,
        null,
        null,
        HAlign.LEFT.name(),
        VAlign.BOTTOM.name(),
        "#COLOR",
        null,
        null,
        null,
        null);

    return label;

  }

  public ChartToolTip toolTip() {
    ChartToolTip toolTip = new ChartToolTip(
        Lists.newArrayList(ChartLabelDisplayType.SERIES_NAME.name(), ChartLabelDisplayType.SERIES_PERCENT.name()),
        null,
        false);

    return toolTip;

  }
}
