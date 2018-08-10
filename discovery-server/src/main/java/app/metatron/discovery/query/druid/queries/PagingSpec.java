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

package app.metatron.discovery.query.druid.queries;


import java.util.Map;

public class PagingSpec {

  Map<String, String> pagingIdentifiers;
  int threshold;

  public PagingSpec() {
  }

  public PagingSpec(int threshold) {
    this.threshold = threshold;
  }

  public Map<String, String> getPagingIdentifiers() {
    return pagingIdentifiers;
  }

  public void setPagingIdentifiers(Map<String, String> pagingIdentifiers) {
    this.pagingIdentifiers = pagingIdentifiers;
  }

  public int getThreshold() {
    return threshold;
  }

  public void setThreshold(int threshold) {
    this.threshold = threshold;
  }
}
