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

import app.metatron.discovery.query.druid.Filter;


/**
 * Created by hsp on 2016. 3. 9..
 */

@JsonTypeName("bound")
public class BoundFilter implements Filter {

  String dimension;
  String lower;
  Boolean lowerStrict;
  String upper;
  Boolean upperStrict;
  Boolean alphaNumeric;

  public BoundFilter(String dimension, String lower, Boolean lowerStrict, String upper, Boolean upperStrict, Boolean alphaNumeric) {
    this.dimension = dimension;
    this.lower = lower;
    this.lowerStrict = lowerStrict;
    this.upper = upper;
    this.upperStrict = upperStrict;
    this.alphaNumeric = alphaNumeric;
  }

  public String getDimension() {
    return dimension;
  }

  public void setDimension(String dimension) {
    this.dimension = dimension;
  }

  public String getLower() {
    return lower;
  }

  public void setLower(String lower) {
    this.lower = lower;
  }

  public Boolean getLowerStrict() {
    return lowerStrict;
  }

  public void setLowerStrict(Boolean lowerStrict) {
    this.lowerStrict = lowerStrict;
  }

  public String getUpper() {
    return upper;
  }

  public void setUpper(String upper) {
    this.upper = upper;
  }

  public Boolean getUpperStrict() {
    return upperStrict;
  }

  public void setUpperStrict(Boolean upperStrict) {
    this.upperStrict = upperStrict;
  }

  public Boolean getAlphaNumeric() {
    return alphaNumeric;
  }

  public void setAlphaNumeric(Boolean alphaNumeric) {
    this.alphaNumeric = alphaNumeric;
  }
}
