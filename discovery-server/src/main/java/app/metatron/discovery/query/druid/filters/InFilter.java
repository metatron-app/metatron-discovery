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

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.collections4.CollectionUtils;

import java.util.List;

import app.metatron.discovery.query.druid.Filter;

@JsonTypeName("in")
public class InFilter implements Filter {

  String dimension;
  List<String> values;

  public InFilter() {
  }

  public InFilter(String dimension, List<String> values) {
    this.dimension = dimension;
    this.values = values;
  }

  public InFilter(String dimension, String... values) {
    this.dimension = dimension;
    this.values = Lists.newArrayList(values);
  }

  public void addValue(String... value){
    if(values == null) {
      values = Lists.newArrayList();
    }

    values.addAll(Lists.newArrayList(value));
  }

  @JsonIgnore
  public boolean isEmpty() {
    return CollectionUtils.isEmpty(values);
  }

  public String getDimension() {
    return dimension;
  }

  public void setDimension(String dimension) {
    this.dimension = dimension;
  }

  public List<String> getValues() {
    return values;
  }

  public void addValue( String newValue ){
    values.add( newValue );
  }

  public void setValues(List<String> values) {
    this.values = values;
  }

}
