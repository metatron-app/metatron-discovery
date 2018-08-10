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

package app.metatron.discovery.spec.druid.ingestion;

import com.google.common.collect.Lists;

import java.util.List;

/**
 * 필드를 대상으로 Expression을 통해 대치(Replace) 나 신규 필드를 생성
 */
public class Evaluation {

  /**
   * 결과값을 넣을 Field 명, 기존 필드 활용 가능
   */
  String outputName;

  /**
   * 표현식 (순차적 표현을 위한 '_' 기호도 제공)
   * ex. [ "cast(L_QUANTITY, 'long') * cast(L_EXTENDEDPRICE, 'double')", "_ * (1-cast(L_DISCOUNTi, 'double'))" ]
   *
   */
  List<String> expressions;

  public Evaluation() {
  }

  public static Evaluation nullToDefaultValueEvaluation(String outputName, Object defaultValue) {
    Evaluation evaluation = new Evaluation();
    evaluation.setOutputName(outputName);

    StringBuilder exprBuilder = new StringBuilder();
    exprBuilder.append("nvl(").append(outputName).append(",");

    if(defaultValue instanceof String) {
      exprBuilder.append("'").append(defaultValue).append("')");
    } else {
      exprBuilder.append(defaultValue).append(")");
    }

    evaluation.setExpressions(Lists.newArrayList(exprBuilder.toString()));

    return evaluation;
  }

  public String getOutputName() {
    return outputName;
  }

  public void setOutputName(String outputName) {
    this.outputName = outputName;
  }

  public List<String> getExpressions() {
    return expressions;
  }

  public void setExpressions(List<String> expressions) {
    this.expressions = expressions;
  }
}
