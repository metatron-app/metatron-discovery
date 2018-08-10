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

import org.apache.commons.collections4.CollectionUtils;

import java.util.List;

import app.metatron.discovery.query.druid.Filter;

/**
 * Created by kyungtaak on 2017. 4. 28..
 */
public abstract class AbstractCollectionFilter {

  protected List<Filter> fields;

  public void addField(Filter filter) {
    if(fields == null) {
      fields = Lists.newArrayList();
    }

    fields.add(filter);
  }

  @JsonIgnore
  public boolean isEmpty() {
   return CollectionUtils.isEmpty(fields);
  }

  public List<Filter> getFields() {
    return fields;
  }

  public void setFields(List<Filter> fields) {
    this.fields = fields;
  }
}
