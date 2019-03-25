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

package app.metatron.discovery.domain.dataconnection.query.expression;

import com.google.common.base.Preconditions;

import org.apache.commons.lang3.StringUtils;

import app.metatron.discovery.domain.dataconnection.query.NativeCriteria;

public class NativeJoin implements NativeExp {
  /**
   * Table name.
   */
  private String tableName;

  /**
   * Table alias.
   */
  private String tableAlias;

  /**
   * Join type.
   */
  private JoinType joinType;

  /**
   * left join column
   */
  private String leftColumn;

  /**
   * right join column.
   */
  private String rightColumn;

  private NativeExp complexJoinExp;

  private NativeCriteria customJoinTable;

  /**
   * The Enum JoinType.
   */
  public enum JoinType {

    /**
     * The INNER.
     */
    INNER("INNER JOIN"),

    /**
     * The NATURAL.
     */
    NATURAL("NATURAL JOIN"),

    /**
     * The CROSS.
     */
    CROSS("CROSS JOIN"),

    /**
     * The LEF t_ outer.
     */
    LEFT_OUTER("LEFT OUTER JOIN"),

    /**
     * The RIGH t_ outer.
     */
    RIGHT_OUTER("RIGHT OUTER JOIN"),

    /**
     * The FUL l_ outer.
     */
    FULL_OUTER("FULL OUTER JOIN");

    /**
     * The type.
     */
    private String type;

    /**
     * Instantiates a new join type.
     *
     * @param type the type
     */
    JoinType(String type) {
      this.type = type;
    }

    /**
     * Gets the type.
     *
     * @return the type
     */
    public String getType() {
      return type;
    }
  }

  public NativeJoin(String tableName, String tableAlias, JoinType joinType, NativeExp complexJoin) {
    if (StringUtils.isBlank(tableName))
      throw new IllegalStateException("tableName is null!");
    if (StringUtils.isBlank(tableAlias))
      throw new IllegalStateException("tableAlias is null!");
    Preconditions.checkArgument(joinType != JoinType.CROSS && joinType != JoinType.NATURAL);
    this.tableName = tableName;
    this.tableAlias = tableAlias;
    this.joinType = joinType;
    this.complexJoinExp = complexJoin;
  }

  /**
   * Constructor.
   *
   * @param tableName   the table name
   * @param tableAlias  the table alias
   * @param joinType    the join type
   * @param leftColumn  the left column
   * @param rightColumn the right column
   */
  public NativeJoin(String tableName, String tableAlias, JoinType joinType, String leftColumn, String rightColumn) {
    if (StringUtils.isBlank(tableName))
      throw new IllegalStateException("tableName is null!");
    if (StringUtils.isBlank(tableAlias))
      throw new IllegalStateException("tableAlias is null!");
    if (joinType == null)
      throw new IllegalStateException("joinTYpe is null!");
    else if (joinType.equals(JoinType.NATURAL) || joinType.equals(JoinType.CROSS))
      throw new IllegalArgumentException("This constructor doesn't support natural and cross join!");
    if (StringUtils.isBlank(rightColumn) || StringUtils.isBlank(leftColumn))
      throw new IllegalStateException("Incorrect join columns!");

    this.tableName = tableName;
    this.tableAlias = tableAlias;
    this.joinType = joinType;
    this.leftColumn = leftColumn;
    this.rightColumn = rightColumn;
  }

  /**
   * Constructor.
   *
   * @param nativeCriteria   the custom query for join
   * @param tableAlias  the table alias
   * @param joinType    the join type
   * @param leftColumn  the left column
   * @param rightColumn the right column
   */
  public NativeJoin(NativeCriteria nativeCriteria, String tableAlias, JoinType joinType, String leftColumn, String rightColumn) {
    if (nativeCriteria == null)
      throw new IllegalStateException("native criteria for custom join table is null!");
    if (StringUtils.isBlank(tableAlias))
      throw new IllegalStateException("tableAlias is null!");
    if (joinType == null)
      throw new IllegalStateException("joinTYpe is null!");
    else if (joinType.equals(JoinType.NATURAL) || joinType.equals(JoinType.CROSS))
      throw new IllegalArgumentException("This constructor doesn't support natural and cross join!");
    if (StringUtils.isBlank(rightColumn) || StringUtils.isBlank(leftColumn))
      throw new IllegalStateException("Incorrect join columns!");

    this.customJoinTable = nativeCriteria;
    this.tableAlias = tableAlias;
    this.joinType = joinType;
    this.leftColumn = leftColumn;
    this.rightColumn = rightColumn;
  }

  public String column(String columnName) {
    return tableAlias + "." + columnName;
  }

  /**
   * Konstruktor.
   *
   * @param tableName  the table name
   * @param tableAlias the table alias
   * @param joinType   the join type
   */
  public NativeJoin(String tableName, String tableAlias, JoinType joinType) {
    if (StringUtils.isBlank(tableName))
      throw new IllegalStateException("tableName is null!");
    if (StringUtils.isBlank(tableAlias))
      throw new IllegalStateException("tableAlias is null!");
    if (joinType == null)
      throw new IllegalStateException("joinTYpe is null!");
    else if (!joinType.equals(JoinType.NATURAL) && !joinType.equals(JoinType.CROSS))
      throw new IllegalArgumentException("This constructor doesn't support natural and cross join");

    this.tableName = tableName;
    this.tableAlias = tableAlias;
    this.joinType = joinType;
  }

  /**
   * Gets the table name.
   *
   * @return the table name
   */
  public String getTableName() {
    return tableName;
  }

  /**
   * Gets the table alias.
   *
   * @return the table alias
   */
  public String getTableAlias() {
    return tableAlias;
  }

  /**
   * To sql.
   *
   * @return the string
   */
  public String toSQL(String implementor) {
    String fromSQL = customJoinTable != null ? " ("+customJoinTable.toSQL()+") " : tableName;
    String joinSQL = joinType.getType() + " " + fromSQL + " " + tableAlias;

    if (joinType.equals(JoinType.NATURAL) || joinType.equals(JoinType.CROSS)) {
      return joinSQL;
    } else if (complexJoinExp != null) {
      return joinSQL + " ON " + complexJoinExp.toSQL(implementor);
    } else {
      return joinSQL + " ON " + NativeProjection.getQuotedColumnName(implementor, leftColumn) +
              " = " + NativeProjection.getQuotedColumnName(implementor, rightColumn);
    }
  }
}
