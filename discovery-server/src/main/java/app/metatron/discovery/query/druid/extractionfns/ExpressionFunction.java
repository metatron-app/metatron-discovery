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

package app.metatron.discovery.query.druid.extractionfns;

import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.query.druid.ExtractionFunction;
import app.metatron.discovery.util.PolarisUtils;

/**
 * Created by kyungtaak on 2016. 6. 13..
 */
@JsonTypeName("expression")
public class ExpressionFunction  implements ExtractionFunction {

  String expression;

  public ExpressionFunction() {
  }

  public ExpressionFunction(String expression) {
    this.expression = expression;
  }

  public ExpressionFunction(String format, String fieldName) {
    this.expression = "format('" + format + "',  " + fieldNameByFormat(format, fieldName) + " )";
  }

  public String fieldNameByFormat(String format, String fieldName) {

    if(PolarisUtils.match(PolarisUtils.PATTERN_TEXT_FORMAT, format)) {
      return fieldName;
    } else if(PolarisUtils.match(PolarisUtils.PATTERN_NUMBER_FORMAT, format)) {
      return "cast(" + fieldName + ", 'long')";
    } else {
      throw new QueryTimeExcetpion("Unsupported Format : " + format);
    }

  }

  public String getExpression() {
    return expression;
  }

  public void setExpression(String expression) {
    this.expression = expression;
  }
}
