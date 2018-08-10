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

package app.metatron.discovery.query.druid.virtualcolumns;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import app.metatron.discovery.query.druid.Filter;

/**
 * Created by hsp on 2016. 8. 9..
 */

@JsonTypeName("index")
public class IndexVirtualColumn extends VirtualColumn {

  String keyDimension;
  List<String> valueMetrics;
  String outputName;

  Filter keyFilter;

  public IndexVirtualColumn() {
  }

  public IndexVirtualColumn(String keyDimension, List<String> valueMetrics, String outputName, Filter keyFilter) {
    this.keyDimension = keyDimension;
    this.valueMetrics = valueMetrics;
    this.outputName = outputName;
    this.keyFilter = keyFilter;
  }

  public String getKeyDimension() {
    return keyDimension;
  }

  public void setKeyDimension(String keyDimension) {
    this.keyDimension = keyDimension;
  }

  public List<String> getValueMetrics() {
    return valueMetrics;
  }

  public void setValueMetrics(List<String> valueMetrics) {
    this.valueMetrics = valueMetrics;
  }

  @Override
  public String getOutputName() {
    return outputName;
  }

  @Override
  public void setOutputName(String outputName) {
    this.outputName = outputName;
  }

  public Filter getKeyFilter() {
    return keyFilter;
  }

  public void setKeyFilter(Filter keyFilter) {
    this.keyFilter = keyFilter;
  }
}
