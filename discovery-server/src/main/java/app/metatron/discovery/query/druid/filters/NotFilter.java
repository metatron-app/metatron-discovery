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

@JsonTypeName("not")
public class NotFilter implements Filter{

  Filter field;

  public NotFilter() {
  }

  public NotFilter(Filter field) {
    this.field = field;
  }

  public Filter getField() {
    return field;
  }

  public void setField( Filter field) {
    this.field = field;
  }

}
