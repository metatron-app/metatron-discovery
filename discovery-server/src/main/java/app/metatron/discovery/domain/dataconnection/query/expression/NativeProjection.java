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
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.dataconnection.query.NativeCriteria;
import app.metatron.discovery.domain.dataconnection.query.utils.VarGenerator;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

public class NativeProjection {
  private static final Logger LOGGER = LoggerFactory.getLogger(NativeProjection.class);

  /**
   * Projection list
   */
  private List<ProjectionBean> projections;

  /**
   * Projections for GROUP BY.
   */
  private List<String> groupProjections;

  /**
   * Availables aggregates.
   */
  public enum AggregateProjection {
    /**
     * The AVG.
     */
    AVG("AVG"),

    /**
     * The SUM.
     */
    SUM("SUM"),

    /**
     * The MAX.
     */
    MAX("MAX"),

    /**
     * The MIN.
     */
    MIN("MIN"),

    /**
     * The COUNT.
     */
    COUNT("COUNT");

    /**
     * The value.
     */
    private String value;

    /**
     * Instantiates a new aggregate projection.
     *
     * @param value the value
     */
    AggregateProjection(String value) {
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

  /**
   * Bean for columns which are aggregates.
   */
  private class ProjectionBean {
    /**
     * Column name
     */
    private String columnName;

    /**
     * Column alias.
     */
    private String alias;

    /**
     * Aggregate function.
     */
    private AggregateProjection aggregateProjection;

    /**
     * Is projections is subquery
     */
    private boolean subquery;

    /**
     * Subquery.
     */
    private NativeCriteria criteria;

    /**
     * Custom projection
     */
    private NativeExp customProjection;

    /**
     * @param columnName the column name
     * @param alias      the alias
     */
    public ProjectionBean(String columnName, String alias) {
      this.columnName = columnName;
      this.alias = alias;
      this.subquery = false;
    }

    /**
     * Create the projection bean.
     *
     * @param columnName          the column name
     * @param alias               the alias
     * @param aggregateProjection the aggregate projection
     */
    public ProjectionBean(String columnName, String alias,
                          AggregateProjection aggregateProjection) {
      this.columnName = columnName;
      this.alias = alias;
      this.aggregateProjection = aggregateProjection;
      this.subquery = false;
    }

    /**
     * @param criteria the criteria
     * @param alias    the alias
     */
    public ProjectionBean(NativeCriteria criteria, String alias) {
      this.criteria = criteria;
      this.subquery = true;
      this.alias = alias;
      this.columnName = alias;
    }

    /**
     * Create projection bean based on custom projection.
     *
     * @param customProjection
     */
    public ProjectionBean(NativeExp customProjection) {
      this.customProjection = customProjection;
    }

    private boolean isCustomProjection() {
      return customProjection != null;
    }

    /**
     * Gets the column name.
     *
     * @return the column name
     */
    public String getColumnName() {
      return columnName;
    }

    /**
     * Gets the alias.
     *
     * @return the alias
     */
    public String getAlias() {
      return alias;
    }

    /**
     * Checks if is aggregate.
     *
     * @return true, if is aggregate
     */
    public boolean isAggregate() {
      return aggregateProjection != null;
    }

    /**
     * Checks if is subquery.
     *
     * @return the subquery
     */
    public boolean isSubquery() {
      return subquery;
    }

    /**
     * To sql.
     *
     * @return the string
     */
    public String toSQL(String implementor) {
      StringBuilder sql = new StringBuilder();

      if (isAggregate()) {
        sql.append(aggregateProjection.getValue()).append("(").append(
                NativeProjection.getQuotedColumnName(implementor, columnName)).append(")");
      } else if (isSubquery()) {
        sql.append("(").append(criteria.toSQL()).append(")");
      } else if (isCustomProjection()) {
        return customProjection.toSQL(implementor);
      } else {
        sql.append(NativeProjection.getQuotedColumnName(implementor, columnName));
      }

      return sql.append(" as ").append(NativeProjection.getQuotedColumnName(implementor, alias)).toString();
    }
  }

  /**
   */
  public NativeProjection() {
    projections = new ArrayList<ProjectionBean>();
    groupProjections = new ArrayList<String>();
  }

  /**
   * Add projection.
   *
   * @param columnName the column name
   * @return the native projection
   */
  public NativeProjection addProjection(String columnName) {
    if (StringUtils.isBlank(columnName)) {
      throw new IllegalStateException("columnName is null!");
    }

    projections.add(new ProjectionBean(columnName, VarGenerator.gen(columnName)));
    return this;
  }

  /**
   * Add projection with alias.
   *
   * @param columnName the column name
   * @param alias      the alias
   * @return the native projection
   */
  public NativeProjection addProjection(String columnName, String alias) {
    if (StringUtils.isBlank(columnName)) {
      throw new IllegalStateException("columnName is null!");
    }

    projections.add(new ProjectionBean(columnName, alias));
    return this;
  }

  /**
   * <p>
   *     Special approach of creating projection. With this approach the column name + alias could be provided as single String.
   *     This method removing the requirement of creation new map with column names as keys and aliases as values. On this method that
   *     kind of map is created out-of-the-box under the hood.
   * </p>
   *
   * <p>The column with alias should be provides on the following pattern: <strong>"columnName as alias"</strong></p>
   *
   * @param columnsWithAliases column name with alias according the pattern <strong>"columnName as alias"</strong>, for example
   *                        <strong>"p.name as productName"</strong>
   * @return {@link NativeProjection}
   */
  public NativeProjection addProjectionWithAliases(String... columnsWithAliases) {
    Preconditions.checkNotNull(columnsWithAliases);

    Map<String, String> columnsProjection = Maps.newLinkedHashMap();
    for (String columnWithAlias : columnsWithAliases) {
      final String[] result = columnWithAlias.split("(?i) AS ");
      if (result.length != 2) {
        throw new IllegalArgumentException("There is the problem with provides column and alias statement: \" " +
                columnWithAlias + " \". Please check the statement. It should be pattern \"columnName as alias\"");
      }
      columnsProjection.put(result[0], result[1]);
    }
    return addProjection(columnsProjection);
  }

  /**
   * Add projection as list column.
   *
   * @param columns list columns
   * @return the native projection
   */
  public NativeProjection addProjection(List<String> columns) {
    if (columns == null || columns.isEmpty()) {
      throw new IllegalStateException("column is empty!");
    }

    for (String col : columns) {
      projections.add(new ProjectionBean(col, VarGenerator.gen(col)));
    }
    return this;
  }

  public NativeProjection addProjection(NativeExp customProjection) {
    projections.add(new ProjectionBean(customProjection));
    return this;
  }

  /**
   * Add projection as string array.
   *
   * @param columns list columns
   * @return the native projection
   */
  public NativeProjection addProjection(String... columns) {
    Preconditions.checkNotNull(columns);

    return addProjection(Lists.newArrayList(columns));
  }

  /**
   * Add projection subquery with alias.
   *
   * @param subquery the subquery
   * @param alias    the alias
   * @return the native projection
   */
  public NativeProjection addSubqueryProjection(NativeCriteria subquery, String alias) {
    if (subquery == null) {
      throw new IllegalStateException("subquery is null!");
    }

    projections.add(new ProjectionBean(subquery, alias));
    return this;
  }

  /**
   * Add projection as map: column name - alias.
   *
   * @param columns columns
   * @return the native projection
   */
  public NativeProjection addProjection(Map<String, String> columns) {
    if (columns == null) {
      throw new IllegalStateException("columns is empty!");
    }

    for (Map.Entry<String, String> entry : columns.entrySet()) {
      projections.add(new ProjectionBean(entry.getKey(), entry.getValue()));
    }
    return this;
  }

  /**
   * Delete projections.
   *
   * @param projection the projection
   * @return the native projection
   */
  public NativeProjection removeProjection(String projection) {
    ProjectionBean bean = null;
    for (ProjectionBean b : projections) {
      if (b.getColumnName().equalsIgnoreCase(projection)) {
        bean = b;
        break;
      }
    }

    projections.remove(bean);
    return this;
  }

  /**
   * Clear projections.
   *
   * @return the native projection
   */
  public NativeProjection clearProjections() {
    projections.clear();
    return this;
  }

  /**
   * Add aggregate.
   *
   * @param columnName the column name
   * @param projection the projection
   * @return the native projection
   */
  public NativeProjection addAggregateProjection(String columnName,
                                                 AggregateProjection projection) {
    if (StringUtils.isBlank(columnName)) {
      throw new IllegalStateException("columnName is null!");
    }
    if (projection == null) {
      throw new IllegalStateException("projection is null!");
    }

    projections.add(new ProjectionBean(columnName,
            VarGenerator.gen(columnName), projection));
    return this;
  }

  /**
   * Add aggreagate with alias.
   *
   * @param columnName the column name
   * @param alias      the alias
   * @param projection the projection
   * @return the native projection
   */
  public NativeProjection addAggregateProjection(String columnName, String alias,
                                                 AggregateProjection projection) {
    if (StringUtils.isBlank(columnName)) {
      throw new IllegalStateException("columnName is null!");
    }
    if (projection == null) {
      throw new IllegalStateException("projection is null!");
    }

    projections.add(new ProjectionBean(columnName, alias, projection));
    return this;
  }

  /**
   * Add group projection.
   *
   * @param columnName the column name
   * @return the native projection
   */
  public NativeProjection addGroupProjection(String columnName) {
    if (StringUtils.isBlank(columnName)) {
      throw new IllegalStateException("columnName is null!");
    }

    groupProjections.add(columnName);
    return this;
  }

  /**
   * Return projection index.
   *
   * Method returns -1 when the column projection does not exist.
   *
   * @param columnName the column name
   * @return the projection index
   */
  public int getProjectionIndex(String columnName) {
    for (int i = 0; i < projections.size(); i++) {
      if (projections.get(i).getColumnName().equalsIgnoreCase(columnName) ||
              projections.get(i).getAlias().equalsIgnoreCase(columnName)) {
        return i;
      }
    }

    return -1;
  }
  
  /**
   * Return projection.
   *
   * @return true, if successful
   */
  public boolean hasProjections() {
    return projections != null && !projections.isEmpty();
  }

  /**
   * Count projections.
   *
   * @return the int
   */
  public int countProjections() {
    return projections.size();
  }

  /**
   * Is aggreagates exist.
   *
   * @return true, if successful
   */
  public boolean hasAggregates() {
    for (ProjectionBean bean : projections) {
      if (bean.isAggregate()) {
        return true;
      }
    }
    return false;
  }

  /**
   * SQL projection.
   *
   * @return the string
   */
  public String projectionToSQL(String implementor) {
    StringBuilder sqlBuilder = new StringBuilder();
    boolean first = true;
    for (ProjectionBean bean : projections) {
      if (first) {
        sqlBuilder.append(bean.toSQL(implementor));
        first = false;
      } else {
        sqlBuilder.append(", ").append(bean.toSQL(implementor));
      }
    }
    return sqlBuilder.toString();
  }

  /**
   * Group BY SQL.
   *
   * @return the string
   */
  public String groupByToSQL(String implementor) {
    // automatic added projections to group by clause if aggregates exist
    if (hasAggregates()) {
      for (ProjectionBean bean : projections) {
        if (!bean.isAggregate() && !bean.isSubquery() &&
                !groupProjections.contains(bean.getColumnName())) {
          groupProjections.add(bean.getColumnName());
        }
      }
    }

    if (!groupProjections.isEmpty()) {
      StringBuilder sqlBuilder = new StringBuilder();
      sqlBuilder.append("GROUP BY ");
      boolean first = true;

      for (String group : groupProjections) {
        if (first) {
          sqlBuilder.append(NativeProjection.getQuotedColumnName(implementor, group));
          first = false;
        } else {
          sqlBuilder.append(", ").append(NativeProjection.getQuotedColumnName(implementor, group));
        }
      }

      return sqlBuilder.append(" ").toString();
    }

    return "";
  }

  public List<String> getAliases(String implementor){
    List<String> aliases = projections.stream()
            .map(projectionBean -> getQuotedColumnName(implementor, projectionBean.getAlias()))
            .collect(Collectors.toList());

    return aliases;
  }

  public static String getQuotedColumnName(String implementor, String columnName){
    try{
      JdbcDialect jdbcDialect = DataConnectionHelper.lookupDialect(implementor);
      if(jdbcDialect != null){
        return jdbcDialect.getQuotedFieldName(null, columnName);
      }
    } catch (JdbcDataConnectionException e){
      LOGGER.debug("no suitable dialect for quote : {}", implementor);
    }

    return Arrays.stream(columnName.split("\\."))
            .map(spliced -> "`" + spliced + "`")
            .collect(Collectors.joining("."));
  }
}
