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

package app.metatron.discovery.query.druid.filters;

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.query.druid.ExtractionFunction;
import app.metatron.discovery.query.druid.Filter;

@JsonTypeName("extraction")
public class ExtractionFilter implements Filter {
  String dimension;
  String value;
  ExtractionFunction extractionFn;

  public ExtractionFilter() {
  }

  public ExtractionFilter(String dimension, String value, ExtractionFunction extractionFn) {
    this.dimension = dimension;
    this.value = value;
    this.extractionFn = extractionFn;
  }

  public String getDimension() {
    return dimension;
  }

  public void setDimension(String dimension) {
    this.dimension = dimension;
  }

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }

  public ExtractionFunction getExtractionFn() {
    return extractionFn;
  }

  public void setExtractionFn(ExtractionFunction extractionFn) {
    this.extractionFn = extractionFn;
  }

}
