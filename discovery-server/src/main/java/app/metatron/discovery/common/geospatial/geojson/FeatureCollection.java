/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.common.geospatial.geojson;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

public class FeatureCollection implements GeoJson {

  Crs crs;

  List<Feature> features = Lists.newArrayList();

  Map<String, MinMaxRange> valueRange = Maps.newLinkedHashMap();

  public FeatureCollection() {
  }

  public FeatureCollection(List<Feature> features) {
    this.crs = Crs.DEFAULT;
    this.features = features;
  }

  public void addFeature(Feature feature) {
    features.add(feature);
  }

  public void addMinMaxValues(String field, MinMaxRange minMaxRange) {
    valueRange.put(field, minMaxRange);
  }

  public Crs getCrs() {
    if (crs == null) {
      return Crs.DEFAULT;
    }
    return crs;
  }

  public List<Feature> getFeatures() {
    return features;
  }

  public Map<String, MinMaxRange> getValueRange() {
    return valueRange;
  }

  public static class MinMaxRange implements Serializable {

    Double minValue;

    Double maxValue;

    public MinMaxRange() {
    }

    public MinMaxRange(Double minValue, Double maxValue) {
      this.minValue = minValue;
      this.maxValue = maxValue;
    }

    public Double getMinValue() {
      return minValue;
    }

    public Double getMaxValue() {
      return maxValue;
    }
  }
}
