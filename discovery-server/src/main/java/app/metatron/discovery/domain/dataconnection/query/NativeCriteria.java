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

package app.metatron.discovery.domain.dataconnection.query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataconnection.query.expression.NativeExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeJoin;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeProjection;
import app.metatron.discovery.domain.dataconnection.query.utils.VarGenerator;

public class NativeCriteria {

  private static final Logger LOGGER = LoggerFactory.getLogger(NativeCriteria.class);
  private static final String SPACE = " ";

  private String implementor;

  /**
   * Tables with aliases to FROM clause.
   */
  private Map<Object, String> tables;
  private Map<Object, String> subQueries;

  /**
   * Joins.
   */
  private List<NativeExp> joins;

  /**
   * WHERE expressions.
   */
  private Map<NativeExp, Operator> whereExps;

  /**
   * Having expressions.
   */
  private Map<NativeExp, Operator> havingExps;

  /**
   * Order expression.
   */
  private NativeExp orderExp;

  /**
   * Limit (max result).
   */
  private Integer limit;

  /**
   * Offset (first result).
   */
  private Integer offset;

  /**
   * Distinct.
   */
  private boolean distinct;

  /**
   * Projections.
   */
  private NativeProjection projection;

  /**
   * SQL operators.
   */
  private enum Operator {
    /**
     * The AND.
     */
    AND("AND"),

    /**
     * The OR.
     */
    OR("OR");

    /**
     * The value.
     */
    private String value;

    /**
     * Instantiates a new operator.
     *
     * @param value the value
     */
    Operator(String value) {
      this.value = value;
    }

    /**
     * Gets the value.
     *
     * @return the value
     */
    public String getValue() {
      return value;
    }
  }

  public NativeCriteria(String implementor){
    this.implementor = implementor;
    this.distinct = false;

    // main table
    this.tables = new LinkedHashMap<>();
    this.subQueries = new LinkedHashMap<>();

    this.whereExps = new LinkedHashMap<>();
    this.havingExps = new LinkedHashMap<>();
    this.joins = new ArrayList<>();
  }

  /**
   * Add table to FROM clause.
   *
   * @param tableName  the table name
   * @return the native criteria
   */
  public NativeCriteria addTable(String tableName) {
    this.tables.put(tableName, VarGenerator.gen(tableName));
    return this;
  }

  public NativeCriteria addTable(String tableName, String tableAlias) {
    this.tables.put(tableName, tableAlias);
    return this;
  }

  public NativeCriteria addSubQuery(NativeCriteria subQuery, String tableAlias) {
    this.subQueries.put(subQuery, tableAlias);
    return this;
  }

  public NativeCriteria addSubQuery(String subQuery, String tableAlias) {
    this.subQueries.put(subQuery, tableAlias);
    return this;
  }

  public NativeCriteria addSubQuery(String subQuery) {
    this.subQueries.put(subQuery, VarGenerator.gen("table"));
    return this;
  }

  public NativeCriteria setProjection(NativeProjection projection) {
    this.projection = projection;
    return this;
  }

  public NativeProjection getProjection() {
    return projection;
  }

  public NativeCriteria add(NativeExp exp) {
    if (exp == null) {
      throw new IllegalStateException("Object exp is null!");
    }

    whereExps.put(exp, Operator.AND);
    return this;
  }

  public NativeCriteria addOr(NativeExp exp) {
    if (exp == null) {
      throw new IllegalStateException("Object exp is null!");
    }

    whereExps.put(exp, Operator.OR);
    return this;
  }

  public NativeCriteria addHaving(NativeExp exp) {
    if (exp == null) {
      throw new IllegalStateException("Object exp is null!");
    }

    havingExps.put(exp, Operator.AND);
    return this;
  }

  /**
   * Add having OR.
   *
   * @param exp the exp
   * @return the native criteria
   */
  public NativeCriteria addOrHaving(NativeExp exp) {
    if (exp == null) {
      throw new IllegalStateException("Object exp is null!");
    }

    havingExps.put(exp, Operator.OR);
    return this;
  }


  public NativeCriteria addJoin(NativeExp join) {
    if (join == null) {
      throw new IllegalStateException("Object exp is null!");
    }

    joins.add(join);
    return this;
  }

  public NativeCriteria setOrder(NativeExp orderExp) {
    this.orderExp = orderExp;
    return this;
  }

  public NativeCriteria setDistinct(boolean distinct) {
    this.distinct = distinct;
    return this;
  }

  public NativeCriteria setLimit(Integer limit) {
    this.limit = limit;
    return this;
  }

  /**
   * Set offsetu.
   *
   * @param offset the offset
   * @return the native criteria
   */
  public NativeCriteria setOffset(Integer offset) {
    this.offset = offset;
    return this;
  }

  /**
   * Add having clause.
   *
   * @param sqlBuilder the sql builder
   */
  private void appendHavingSQL(StringBuilder sqlBuilder) {
    boolean first = true;
    if (havingExps.size() > 0) {
      sqlBuilder.append("HAVING").append(SPACE);

      for (Map.Entry<NativeExp, Operator> exp : havingExps.entrySet()) {
        if (first) {
          sqlBuilder.append(exp.getKey().toSQL(this.implementor)).append(SPACE);
          first = false;
        } else {
          sqlBuilder.append(exp.getValue().getValue())
                  .append(SPACE)
                  .append(exp.getKey().toSQL(this.implementor))
                  .append(SPACE);
        }
      }
    }
  }

  /**
   * Add group by clause (projections).
   *
   * @param sqlBuilder the sql builder
   */
  private void appendGroupBySQL(StringBuilder sqlBuilder) {
    if (projection == null) {
      return;
    }

    sqlBuilder.append(projection.groupByToSQL(this.implementor));
  }

  /**
   * Add order by clause.
   *
   * @param sqlBuilder the sql builder
   */
  private void appendOrderBySQL(StringBuilder sqlBuilder) {
    if (orderExp == null) {
      return;
    }

    sqlBuilder.append(orderExp.toSQL(this.implementor));
  }

  /**
   * Add limit, offset by clause.
   *
   * @param sqlBuilder the sql builder
   */
  private void appendLimitOffsetBySQL(StringBuilder sqlBuilder) {
    if (limit == null) {
      return;
    }

    switch (this.implementor){
      case "ORACLE": case "TIBERO":
        sqlBuilder.insert(0, "SELECT * FROM ( ");
        if(offset != null){
//          String selectSql = StringUtils.join(this.projection.getAliases(this.implementor), ", ");
//          sqlBuilder.insert(0, "SELECT " + selectSql + " FROM ( SELECT ROWNUM AS RNUM, " + selectSql + " FROM ( ");
          sqlBuilder.append(" ) WHERE ROWNUM <= " + (offset + limit));
          sqlBuilder.append(" AND ROWNUM > " + offset);
        } else {
          sqlBuilder.append(" ) WHERE ROWNUM <= " + limit);
        }
        break;

      case "MSSQL":

        break;

      case "HIVE": case "MYSQL": case "PRESTO": case "POSTGRESQL": case "DRUID" :
        sqlBuilder.append(SPACE).append("LIMIT").append(SPACE).append(limit);
        if(offset != null)
          sqlBuilder.append(SPACE).append("OFFSET").append(SPACE).append(offset);
        break;

      default:

        break;
    }

  }

  /**
   * Add where clause
   *
   * @param sqlBuilder the sql builder
   */
  private void appendWhereSQL(StringBuilder sqlBuilder) {
    boolean first = true;
    if (whereExps.size() > 0) {
      sqlBuilder.append("WHERE").append(SPACE);

      for (Map.Entry<NativeExp, Operator> exp : whereExps.entrySet()) {
        NativeExp whereExpression = exp.getKey();
        if (first) {
          sqlBuilder.append(whereExpression.toSQL(this.implementor)).append(SPACE);
          first = false;
        } else {
          Operator ope = exp.getValue();
          sqlBuilder.append(ope.getValue()).append(SPACE).append(whereExpression.toSQL(this.implementor)).append(SPACE);
        }
      }
    }
  }

  /**
   * Add join.
   *
   * @param sqlBuilder the sql builder
   */
  private void appendJoinSQL(StringBuilder sqlBuilder) {
    for (NativeExp join : joins) {
      sqlBuilder.append(join.toSQL(this.implementor)).append(SPACE);
    }
  }

  /**
   * Add FROM clause.
   *
   * @param sqlBuilder the sql builder
   */
  private void appendFromSQL(StringBuilder sqlBuilder) {
    sqlBuilder.append(SPACE).append("FROM").append(SPACE);

    boolean first = true;
    for (Map.Entry<Object, String> from : tables.entrySet()) {
      if (first) {
        first = false;
      } else {
        sqlBuilder.append(", ");
      }

      if(from.getKey() instanceof NativeCriteria){
        NativeCriteria subQuery = (NativeCriteria) from.getKey();
        sqlBuilder.append("(").append(subQuery.toSQL()).append(")").append(SPACE).append(from.getValue());
      } else {
        sqlBuilder.append(from.getKey()).append(SPACE).append(from.getValue());
      }
    }

    for (Map.Entry<Object, String> fromSubQuery : subQueries.entrySet()) {
      if (first) {
        first = false;
      } else {
        sqlBuilder.append(", ");
      }

      String subQueryStr;
      if(fromSubQuery.getKey() instanceof NativeCriteria){
        NativeCriteria subQuery = (NativeCriteria) fromSubQuery.getKey();
        subQueryStr = subQuery.toSQL();
      } else {
        subQueryStr = fromSubQuery.getKey().toString();
      }
      sqlBuilder.append("(").append(subQueryStr).append(")").append(SPACE).append(fromSubQuery.getValue());
    }

    sqlBuilder.append(SPACE);
  }

  /**
   * Add column to sql builder.
   *
   * @param sqlBuilder the sql builder
   */
  private void appendProjectionSQL(StringBuilder sqlBuilder) {
    // if column was defined add to sql
    if (projection != null && projection.hasProjections()) {
      sqlBuilder.append(projection.projectionToSQL(this.implementor));
    }

    // if there is no defined projection we are adding projection automatically based on joins and tables
    if (projection == null || projection.countProjections() == 0) {
      //특정 Implementor의 경우 limit, offset 처리에 projection이 필수임.
      if(implementor.equals("ORACLE") || implementor.equals("TIBERO")){
        if(limit != null && offset != null)
          throw new IllegalStateException("LIMIT, OFFSET Clause need Projections!");
      }

      boolean first = true;
      for (String alias : tables.values()) {
        if (first) {
          sqlBuilder.append(alias).append(".*");
          first = false;
        } else {
          sqlBuilder.append(", ").append(alias).append(".*");
        }
      }

      for (String subQueryAlias : subQueries.values()) {
        if (first) {
          sqlBuilder.append(subQueryAlias).append(".*");
          first = false;
        } else {
          sqlBuilder.append(", ").append(subQueryAlias).append(".*");
        }
      }

      if (joins.size() > 0) {
        for (NativeExp join : joins) {
          // we don't execute this part of code for custom joins
          if (join instanceof NativeJoin) {
            NativeJoin nativeJoin = (NativeJoin) join;
            sqlBuilder.append(", ").append(nativeJoin.getTableAlias()).append(".*");
          }
        }
      }
    }
  }

  public String toSQL(){
    StringBuilder sqlBuilder = new StringBuilder();

    // clause select i distinct
    sqlBuilder.append("SELECT").append(SPACE);
    if (distinct) {
      sqlBuilder.append("DISTINCT").append(SPACE);
    }

    // columns
    appendProjectionSQL(sqlBuilder);

    // FROM
    appendFromSQL(sqlBuilder);

    // JOIN
    appendJoinSQL(sqlBuilder);

    // WHERE
    appendWhereSQL(sqlBuilder);

    // GROUP BY (PROJECTIONS)
    appendGroupBySQL(sqlBuilder);

    // HAVING
    appendHavingSQL(sqlBuilder);

    // ORDER BY
    appendOrderBySQL(sqlBuilder);

    //LIMIT, OFFSET
    appendLimitOffsetBySQL(sqlBuilder);

    String sql = sqlBuilder.toString();

    LOGGER.debug("SQL Built : {}", sql);
    return sql;
  }
}
