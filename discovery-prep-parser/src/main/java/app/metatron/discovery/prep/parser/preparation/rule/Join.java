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

import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;

public class Join implements Rule, Rule.Factory {

  Expression dataset2;
  Expression leftSelectCol;
  Expression rightSelectCol;
  Expression condition;
  String joinType;

  public Join() {
  }

  public Join(Expression dataset2, Expression leftSelectCol, Expression rightSelectCol, Expression condition, String joinType) {
    this.dataset2 = dataset2;
    this.leftSelectCol = leftSelectCol;
    this.rightSelectCol = rightSelectCol;
    this.condition = condition;
    this.joinType = joinType;
  }

  public Expression getDataset2() {
    return dataset2;
  }

  public void setDataset2(Expression dataset2) {
    this.dataset2 = dataset2;
  }

  public Expression getLeftSelectCol() {
    return leftSelectCol;
  }

  public void setLeftSelectCol(Expression leftSelectCol) {
    this.leftSelectCol = leftSelectCol;
  }

  public Expression getRightSelectCol() {
    return rightSelectCol;
  }

  public void setRightSelectCol(Expression rightSelectCol) {
    this.rightSelectCol = rightSelectCol;
  }

  public Expression getCondition() {
    return condition;
  }

  public void setCondition(Expression condition) {
    this.condition = condition;
  }

  public String getJoinType() {
    return joinType;
  }

  public void setJoinType(String joinType) {
    this.joinType = joinType;
  }

  @Override
  public String getName() {
    return "join";
  }

  @Override
  public Rule get() {
    return new Join();
  }

  @Override
  public String toString() {
    return "Join{" +
        "dataset2=" + dataset2 +
        ", leftSelectCol=" + leftSelectCol +
        ", condition=" + condition +
        ", rightSelectCol=" + rightSelectCol +
        ", joinType='" + joinType + '\'' +
        '}';
  }
}
