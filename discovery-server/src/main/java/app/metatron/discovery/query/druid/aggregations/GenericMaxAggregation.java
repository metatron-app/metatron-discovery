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

package app.metatron.discovery.query.druid.aggregations;

import app.metatron.discovery.domain.datasource.Field;
import com.fasterxml.jackson.annotation.JsonTypeName;

import app.metatron.discovery.query.druid.Aggregation;
import org.mortbay.util.StringUtil;

import java.util.List;

/**
 * Created by hsp on 2016. 8. 9..
 */
@JsonTypeName("max")
public class GenericMaxAggregation implements Aggregation, TimestampEnableAggregator {

  String name;
  String fieldName;
  String fieldExpression;
  String inputType;

  public GenericMaxAggregation(String name, String fieldName, String inputType) {
    this.name = name;
    this.fieldName = fieldName;
    this.inputType = inputType;
  }

  public GenericMaxAggregation(String name, String fieldName, String fieldExpression, String inputType) {
    this.name = name;
    this.fieldName = fieldName;
    this.fieldExpression = fieldExpression;
    this.inputType = inputType;
  }

  @Override
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getFieldName() {
    return fieldName;
  }

  public void setFieldName(String fieldName) {
    this.fieldName = fieldName;
  }

  public String getInputType() {
    return inputType;
  }

  public void setInputType(String inputType) {
    this.inputType = inputType;
  }

  public String getFieldExpression() {
    return fieldExpression;
  }

  public void setFieldExpression(String fieldExpression) {
    this.fieldExpression = fieldExpression;
  }

  @Override
  public String toString() {
    return "GenericMaxAggregation{" +
            "name='" + name + '\'' +
            ", fieldName='" + fieldName + '\'' +
            ", inputType='" + inputType + '\'' +
            '}';
  }

  @Override
  public void changeTimestampFieldName(List<Field> timestampFields) {
    timestampFields.forEach(timestampField -> this.setFieldExpression(this.getFieldExpression().replaceAll("(?i)" + timestampField.getName().toLowerCase(), "__time")));
  }
}
