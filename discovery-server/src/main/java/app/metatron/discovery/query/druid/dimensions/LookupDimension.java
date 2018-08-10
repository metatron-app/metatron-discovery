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

package app.metatron.discovery.query.druid.dimensions;

import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.query.druid.Dimension;
import app.metatron.discovery.query.druid.lookup.LookupExtractor;

/**
 * Created by kyungtaak on 2017. 4. 21..
 */
public class LookupDimension implements Dimension {

  private String dimension;

  private String outputName;

  /**
   * Lookup 할 항목을 남길지 없앨지 여부
   */
  private Boolean retainMissingValue;

  /**
   * retainMissingValue 가 true 인 경우만 활용
   */
  private String replaceMissingValueWith;

  private Boolean injectvie;

  /**
   * Lookup 데이터 처리 방식
   */
  private LookupExtractor lookup;

  public LookupDimension() {
  }

  public LookupDimension(String dimension, String outputName, LookupExtractor lookup) {
    this.dimension = dimension;
    this.outputName = outputName;
    this.lookup = lookup;
    this.retainMissingValue = true;
  }

  @Override
  public String getDimension() {
    return dimension;
  }

  public void setDimension(String dimension) {
    this.dimension = dimension;
  }

  @Override
  public String getOutputName() {
    return outputName;
  }

  public void setOutputName(String outputName) {
    this.outputName = outputName;
  }

  public Boolean getRetainMissingValue() {
    return retainMissingValue;
  }

  public void setRetainMissingValue(Boolean retainMissingValue) {
    this.retainMissingValue = retainMissingValue;
  }

  public String getReplaceMissingValueWith() {
    return replaceMissingValueWith;
  }

  public void setReplaceMissingValueWith(String replaceMissingValueWith) {
    this.replaceMissingValueWith = replaceMissingValueWith;
  }

  public Boolean getInjectvie() {
    return injectvie;
  }

  public void setInjectvie(Boolean injectvie) {
    this.injectvie = injectvie;
  }

  public LookupExtractor getLookup() {
    return lookup;
  }

  public void setLookup(LookupExtractor lookup) {
    this.lookup = lookup;
  }

  @Override
  public LogicalType getLogicalType() {
    return null;
  }
}
