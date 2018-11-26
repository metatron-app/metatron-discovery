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

package app.metatron.discovery.spec.druid.ingestion.expr;

/**
 * Null to value
 */
public class Nvl implements Function {

  String target;

  Object defaultValue;

  public Nvl(String target, Object defaultValue) {
    this.target = target;
    this.defaultValue = defaultValue;
  }

  @Override
  public String getName() {
    return "nvl";
  }

  @Override
  public String expr() {
    StringBuilder sb = new StringBuilder();
    sb.append(getName()).append("(")
           .append("\"").append(target).append("\", ");

    if(defaultValue instanceof String) {
      sb.append("'").append(defaultValue).append("')");
    } else {
      sb.append(defaultValue).append(")");
    }

    return sb.toString();
  }
}
