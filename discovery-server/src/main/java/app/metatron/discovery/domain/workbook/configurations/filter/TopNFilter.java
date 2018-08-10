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

package app.metatron.discovery.domain.workbook.configurations.filter;


import com.fasterxml.jackson.annotation.JsonTypeName;

@JsonTypeName("topn")
public class TopNFilter extends Filter {

  int topn;

  public TopNFilter(String field, int topn) {
    super(field);
    this.topn = topn;
  }

  @Override
  public boolean compare(Filter filter) {
    return false;
  }

  public int getTopn() {
    return topn;
  }

  public void setTopn(int topn) {
    this.topn = topn;
  }
}
