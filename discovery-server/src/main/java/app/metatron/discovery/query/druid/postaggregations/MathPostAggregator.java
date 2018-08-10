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

package app.metatron.discovery.query.druid.postaggregations;

import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.validation.constraints.NotNull;

import app.metatron.discovery.query.druid.PostAggregation;

/**
 * Created by hsp on 2016. 5. 3..
 */
@JsonTypeName("math")
public class MathPostAggregator implements PostAggregation {

  @NotNull
  String name;

  @NotNull
  String expression;

  String ordering;


  public MathPostAggregator(@NotNull String name, @NotNull String expression, String ordering) {
    this.name = name;
    this.expression = expression;
    this.ordering = ordering;
  }

  @Override
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getExpression() {
    return expression;
  }

  public void setExpression(String expression) {
    this.expression = expression;
  }

  public String getOrdering() {
    return ordering;
  }

  public void setOrdering(String ordering) {
    this.ordering = ordering;
  }

  @Override
  public String toString() {
    return "MathPostAggregator{" +
            "name='" + name + '\'' +
            ", expression='" + expression + '\'' +
            ", ordering='" + ordering + '\'' +
            '}';
  }
}
