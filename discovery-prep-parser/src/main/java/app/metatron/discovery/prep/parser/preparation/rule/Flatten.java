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

package app.metatron.discovery.prep.parser.preparation.rule;

public class Flatten implements Rule, Rule.Factory {
  /**
   * Only an array type
   */
  String col;

  public Flatten() {
  }

  public Flatten(String col) {
    this.col = col;
  }

  public String getCol() {
    return col;
  }

  public void setCol(String col) {
    this.col = col;
  }

  @Override
  public String getName() {
    return "flatten";
  }


  @Override
  public Rule get() {
    return new Flatten();
  }

  @Override
  public String toString() {
    return "Flatten{" +
        "col='" + col + '\'' +
        '}';
  }
}
