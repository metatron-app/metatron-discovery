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

package app.metatron.discovery.query.druid.extractionfns;

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.query.druid.ExtractionFunction;
import app.metatron.discovery.query.druid.lookup.LookupExtractor;

@JsonTypeName("lookup")
public class LookupFunction implements ExtractionFunction {

  LookupExtractor lookup;

  boolean retainMissingValue;

  String replaceMissingValueWith;

  boolean injective;

  boolean optimize;

  public LookupFunction() {
  }

  public LookupFunction(LookupExtractor lookup) {
    this.retainMissingValue = true;
    this.injective = false;
    this.optimize = true;
    this.lookup = lookup;
  }

  public LookupExtractor getLookup() {
    return lookup;
  }

  public void setLookup(LookupExtractor lookup) {
    this.lookup = lookup;
  }

  public boolean isRetainMissingValue() {
    return retainMissingValue;
  }

  public void setRetainMissingValue(boolean retainMissingValue) {
    this.retainMissingValue = retainMissingValue;
  }

  public String getReplaceMissingValueWith() {
    return replaceMissingValueWith;
  }

  public void setReplaceMissingValueWith(String replaceMissingValueWith) {
    this.replaceMissingValueWith = replaceMissingValueWith;
  }

  public boolean isInjective() {
    return injective;
  }

  public void setInjective(boolean injective) {
    this.injective = injective;
  }

  public boolean isOptimize() {
    return optimize;
  }

  public void setOptimize(boolean optimize) {
    this.optimize = optimize;
  }
}
