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

package app.metatron.discovery.query.druid.queries;

import java.util.List;

/**
 *
 */
public class JoinElement {

  JoinType joinType;

  String leftAlias;

  List<String> leftJoinColumns;

  String rightAlias;

  List<String> rightJoinColumns;

  public JoinElement() {
  }

  public JoinElement(JoinType joinType, String leftAlias, List<String> leftJoinColumns, String rightAlias, List<String> rightJoinColumns) {
    this.joinType = joinType;
    this.leftAlias = leftAlias;
    this.leftJoinColumns = leftJoinColumns;
    this.rightAlias = rightAlias;
    this.rightJoinColumns = rightJoinColumns;
  }

  public JoinType getJoinType() {
    return joinType;
  }

  public void setJoinType(JoinType joinType) {
    this.joinType = joinType;
  }

  public String getLeftAlias() {
    return leftAlias;
  }

  public void setLeftAlias(String leftAlias) {
    this.leftAlias = leftAlias;
  }

  public List<String> getLeftJoinColumns() {
    return leftJoinColumns;
  }

  public void setLeftJoinColumns(List<String> leftJoinColumns) {
    this.leftJoinColumns = leftJoinColumns;
  }

  public String getRightAlias() {
    return rightAlias;
  }

  public void setRightAlias(String rightAlias) {
    this.rightAlias = rightAlias;
  }

  public List<String> getRightJoinColumns() {
    return rightJoinColumns;
  }

  public void setRightJoinColumns(List<String> rightJoinColumns) {
    this.rightJoinColumns = rightJoinColumns;
  }

  public enum JoinType {
    INNER, LEFT_OUTER, RIGHT_OUTER
  }
}
