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

package app.metatron.discovery.domain.dataprep.transform;

import java.io.Serializable;
import java.util.List;

public class PrepHistogramRequest implements Serializable {

  private int ruleIdx;

  private List<Integer> colnos;
  private List<Integer> colWidths;

  public int getRuleIdx() {
    return ruleIdx;
  }

  public List<Integer> getColnos() {
    return colnos;
  }

  public List<Integer> getColWidths() {
    return colWidths;
  }
}
