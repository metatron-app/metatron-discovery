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

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.format.FieldFormat;
import app.metatron.discovery.util.EnumUtils;

@JsonTypeName("map")
public class MapChart extends Chart {

  Boolean showMapLayer;

  String baseMapType;

  String baseMapUrl;

  String licenseNotation;

  Boolean showDistrictLayer;

  String districtUnit;

  List<MapChartLayer> layers;

  public MapChart() {
    // Empty Constructor
  }

  public MapChart(@JsonProperty("valueFormat") FieldFormat valueFormat,
                  @JsonProperty("legend") ChartLegend legend,
                  @JsonProperty("toolTip") ChartToolTip toolTip,
                  @JsonProperty("limit") Integer limit,
                  @JsonProperty("showMapLayer") Boolean showMapLayer,
                  @JsonProperty("baseMapType") String baseMapType,
                  @JsonProperty("baseMapUrl") String baseMapUrl,
                  @JsonProperty("licenseNotation") String licenseNotation,
                  @JsonProperty("showDistrictLayer") Boolean showDistrictLayer,
                  @JsonProperty("districtUnit") String districtUnit,
                  @JsonProperty("layers") List<MapChartLayer> layers) {
    super(null, valueFormat, legend, null, null, null, toolTip, limit);
    this.showMapLayer = showMapLayer;
    this.baseMapType = EnumUtils.getCaseEnum(BaseMap.class, baseMapType, BaseMap.OSM_LIGHT).name();
    if(BaseMap.USER_DEFINED.name().equals(baseMapType)) {
      this.baseMapUrl = Preconditions.checkNotNull(baseMapUrl, "baseMapUrl required if baseMapType is 'USER_DEFINED'");
    }
    this.licenseNotation = licenseNotation;
    this.showDistrictLayer = showDistrictLayer;
    this.districtUnit = districtUnit;
    this.layers = layers;
  }

  public Boolean getShowMapLayer() {
    return showMapLayer;
  }

  public void setShowMapLayer(Boolean showMapLayer) {
    this.showMapLayer = showMapLayer;
  }

  public String getBaseMapType() {
    return baseMapType;
  }

  public void setBaseMapType(String baseMapType) {
    this.baseMapType = baseMapType;
  }

  public String getBaseMapUrl() {
    return baseMapUrl;
  }

  public void setBaseMapUrl(String baseMapUrl) {
    this.baseMapUrl = baseMapUrl;
  }

  public String getLicenseNotation() {
    return licenseNotation;
  }

  public void setLicenseNotation(String licenseNotation) {
    this.licenseNotation = licenseNotation;
  }

  public Boolean getShowDistrictLayer() {
    return showDistrictLayer;
  }

  public void setShowDistrictLayer(Boolean showDistrictLayer) {
    this.showDistrictLayer = showDistrictLayer;
  }

  public String getDistrictUnit() {
    return districtUnit;
  }

  public void setDistrictUnit(String districtUnit) {
    this.districtUnit = districtUnit;
  }

  public List<MapChartLayer> getLayers() {
    return layers;
  }

  public void setLayers(List<MapChartLayer> layers) {
    this.layers = layers;
  }

  @Override
  public String toString() {
    return "MapChart{" +
        "showMapLayer=" + showMapLayer +
        ", baseMapType=" + baseMapType +
        ", licenseNotation='" + licenseNotation + '\'' +
        ", showDistrictLayer=" + showDistrictLayer +
        ", districtUnit='" + districtUnit + '\'' +
        ", layers=" + layers +
        "} " + super.toString();
  }

  public enum BaseMap {
    OSM_LIGHT, OSM_DARK, OSM_COLORED, USER_DEFINED
  }

}
