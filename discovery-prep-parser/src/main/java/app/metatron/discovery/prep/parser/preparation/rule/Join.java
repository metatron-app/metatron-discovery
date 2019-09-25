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

import static app.metatron.discovery.prep.parser.preparation.rule.Join.JOIN_TYPE.INNER;
import static app.metatron.discovery.prep.parser.preparation.rule.Join.JOIN_TYPE.INVALID;
import static app.metatron.discovery.prep.parser.preparation.rule.Join.JOIN_TYPE.LEFT;
import static app.metatron.discovery.prep.parser.preparation.rule.Join.JOIN_TYPE.OUTER;
import static app.metatron.discovery.prep.parser.preparation.rule.Join.JOIN_TYPE.RIGHT;

import app.metatron.discovery.prep.parser.preparation.rule.expr.Expression;

public class Join implements Rule, Rule.Factory {

  Expression dataset2;
  Expression leftSelectCol;
  Expression rightSelectCol;
  Expression condition;
  String joinType;

  public enum JOIN_TYPE {
    INNER,
    LEFT,
    RIGHT,
    OUTER,
    INVALID
  }

  public static JOIN_TYPE getJoinTypeEnum(String joinType) {
    joinType = joinType.replace("'", "").toUpperCase();

    if (joinType.equals(INNER.name())) {
      return INNER;
    } else if (joinType.equals(LEFT.name())) {
      return LEFT;
    } else if (joinType.equals(RIGHT.name())) {
      return RIGHT;
    } else if (joinType.equals(OUTER.name())) {
      return OUTER;
    }
    return INVALID;
  }

  public Join() {
  }

  public Join(Expression dataset2, Expression leftSelectCol, Expression rightSelectCol, Expression condition,
          String joinType) {
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
