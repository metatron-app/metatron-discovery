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

package app.metatron.discovery.query.druid.searches;

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.query.druid.SearchQuerySpec;

@JsonTypeName("all")
public class AllSearchQuerySpec implements SearchQuerySpec {

  public AllSearchQuerySpec() {
  }

}
