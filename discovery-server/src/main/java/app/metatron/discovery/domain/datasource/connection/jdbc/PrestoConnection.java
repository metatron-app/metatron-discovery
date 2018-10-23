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

package app.metatron.discovery.domain.datasource.connection.jdbc;

import com.fasterxml.jackson.annotation.JsonTypeName;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Pageable;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

/**
 * Created by kyungtaak on 2016. 10. 5..
 */
@Entity
@DiscriminatorValue("PRESTO")
@JsonTypeName("PRESTO")
public class PrestoConnection extends HiveMetastoreConnection {

  private static final String PRESTO_URL_PREFIX = "jdbc:presto:/";
  private static final String PRESTO_DEFAULT_OPTIONS = "";
  private static final String[] DESCRIBE_PROP = {};

//  @NotNull
  @Column(name = "dc_catalog")
  String catalog;

  @Override
  public String getDriverClass() {
    return "com.facebook.presto.jdbc.PrestoDriver";
  }

  @Override
  public String[] getDescribeProperties() {
    return DESCRIBE_PROP;
  }

  @Override
  public String getTestQuery() {
    return "SELECT 1";
  }

  @Override
  public String getUseDatabaseQuery(String database) {
    return null;
  }

  @Override
  public String getShowDataBaseQuery() {
    return "SHOW SCHEMAS FROM " + catalog;
  }

  @Override
  public String getShowTableQuery(String schema) {
    return "SHOW TABLES FROM " + catalog + "." + schema;
  }

  @Override
  public String getShowSchemaQuery() {
    return "SHOW SCHEMAS FROM " + catalog;
  }

  @Override
  public String getTableDescQuery(String schema, String table) {
    return "SELECT COUNT(*) AS NUM_ROWS FROM " + getTableName(schema, table);
  }

  @Override
  public String getTableName(String schema, String table) {
    if(StringUtils.isEmpty(schema)) {
      return table;
    }
    return catalog + "." + schema + "." + table;
  }

  @Override
  public String getSearchDataBaseQuery(String databaseNamePattern, Pageable pageable) { return null; }

  @Override
  public String getDataBaseCountQuery(String databaseNamePattern) { return null; }

  @Override
  public String getSearchSchemaQuery(String schemaNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();

    if(pageable != null){
      int fromIndex = (pageable.getPageNumber() * pageable.getPageSize()) + 1;
      int toIndex = (pageable.getPageNumber() + 1) * pageable.getPageSize();

      builder.append(" SELECT schema_name ");
      builder.append(" FROM ( ");
      builder.append("   SELECT schema_name, ROW_NUMBER() OVER (PARTITION BY CURRENT_DATE ORDER BY schema_name) ROWNUM ");
      builder.append("   FROM information_schema.schemata ");
      builder.append("   WHERE catalog_name = '" + catalog + "' ");
      if(StringUtils.isNotEmpty(schemaNamePattern)){
        builder.append("   AND schema_name LIKE '%" + schemaNamePattern + "%' ");
      }
      builder.append(" ) a ");
      builder.append(" WHERE a.ROWNUM BETWEEN " + fromIndex + " AND " + toIndex );
    } else {

      builder.append(" SELECT schema_name ");
      builder.append(" FROM information_schema.schemata ");
      builder.append(" WHERE catalog_name = '" + catalog + "' ");
      if(StringUtils.isNotEmpty(schemaNamePattern)){
        builder.append(" AND schema_name LIKE '%" + schemaNamePattern + "%' ");
      }
      builder.append(" ORDER BY schema_name ");
    }

    return builder.toString();
  }

  @Override
  public String getSchemaCountQuery(String schemaNamePattern) {
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT COUNT(schema_name) ");
    builder.append(" FROM information_schema.schemata ");
    builder.append(" WHERE catalog_name = '" + catalog + "' ");
    if(StringUtils.isNotEmpty(schemaNamePattern)){
      builder.append(" AND schema_name LIKE '%" + schemaNamePattern + "%' ");
    }

    return builder.toString();
  }

  @Override
  public String getSearchTableQuery(String schema, String tableNamePattern, Pageable pageable) {
    StringBuilder builder = new StringBuilder();

    if(pageable != null){
      int fromIndex = (pageable.getPageNumber() * pageable.getPageSize()) + 1;
      int toIndex = (pageable.getPageNumber() + 1) * pageable.getPageSize();

      builder.append(" SELECT table_name name, table_type type ");
      builder.append(" FROM ( ");
      builder.append("   SELECT table_name, ROW_NUMBER() OVER (PARTITION BY CURRENT_DATE ORDER BY table_name) ROWNUM ");
      builder.append("   FROM information_schema.tables ");
      builder.append("   WHERE table_catalog = '" + catalog + "' ");
      builder.append("     AND table_schema LIKE '%" + schema + "%' ");
      if(StringUtils.isNotEmpty(tableNamePattern)){
        builder.append("   AND table_name LIKE '%" + tableNamePattern + "%' ");
      }
      builder.append(" ) a ");
      builder.append(" WHERE a.ROWNUM BETWEEN " + fromIndex + " AND " + toIndex );
    } else {

      builder.append(" SELECT table_name name, table_type type ");
      builder.append(" FROM information_schema.tables ");
      builder.append(" WHERE catalog_name = '" + catalog + "' ");
      builder.append("   AND table_schema LIKE '%" + schema + "%' ");
      if(StringUtils.isNotEmpty(tableNamePattern)){
        builder.append(" AND table_name LIKE '%" + tableNamePattern + "%' ");
      }
      builder.append(" ORDER BY table_name ");
    }

    return builder.toString();
  }

  @Override
  public String getTableCountQuery(String schema, String tableNamePattern) {
    StringBuilder builder = new StringBuilder();

    builder.append(" SELECT COUNT(table_name) ");
    builder.append(" FROM information_schema.tables ");
    builder.append(" WHERE catalog_name = '" + catalog + "' ");
    builder.append("   AND table_schema LIKE '%" + schema + "%' ");
    if(StringUtils.isNotEmpty(tableNamePattern)){
      builder.append(" AND table_name LIKE '%" + tableNamePattern + "%' ");
    }

    return builder.toString();
  }

  @Override
  public String getSearchColumnQuery(String schema, String table, String columnNamePattern, Pageable pageable) {
    return "SHOW COLUMNS FROM " + getTableName(schema, table);
  }

  @Override
  public String getColumnCountQuery(String schema, String table, String columnNamePattern) {
    return null;
  }

  @Override
  public String getQuotatedFieldName(String fieldName) {
    return fieldName;
  }

  @Override
  public String getDefaultTimeFormat() {
    return "yyyy-MM-dd HH:mm:ss";
  }

  @Override
  public String getCharToDateStmt(String timeStr, String timeFormat) {
    StringBuilder builder = new StringBuilder();
    builder.append("unix_timestamp('").append(timeStr).append("', ");

    builder.append("'");
    if(DEFAULT_FORMAT.equals(timeFormat)) {
      builder.append(getDefaultTimeFormat());
    } else {
      builder.append(timeFormat).append("'");
    }
    builder.append("'");
    builder.append(") ");

    return builder.toString();
  }

  @Override
  public String getCurrentTimeStamp() {
    return "format_datetime(current_timestamp,'" + getDefaultTimeFormat() + "') AS TIMESTAMP1";
  }

  @Override
  public String getConnectUrl() {
    return makeConnectUrl(true);
  }

  @Override
  public String makeConnectUrl(boolean includeDatabase) {
    if(StringUtils.isNotEmpty(super.url)) {
      return super.url;
    }

    StringBuilder builder = new StringBuilder();
    builder.append(PRESTO_URL_PREFIX);

    // Set HostName
    builder.append(URL_SEP);
    builder.append(super.getHostname());

    // Set Port
    if(super.getPort() != null) {
      builder.append(":").append(super.getPort());
    }

    builder.append(URL_SEP);
    if(StringUtils.isNotEmpty(catalog)) {
      builder.append(catalog);
      builder.append(URL_SEP);
    }

    // Set DataBase
    if(StringUtils.isNotEmpty(super.getDatabase()) && includeDatabase) {
      builder.append(super.getDatabase());
    }

    if(StringUtils.isNotEmpty(PRESTO_DEFAULT_OPTIONS)) {
      builder.append("?");
      builder.append(PRESTO_DEFAULT_OPTIONS);
    }

    return builder.toString();
  }

  public String getCatalog() {
    return catalog;
  }

  public void setCatalog(String catalog) {
    this.catalog = catalog;
  }

  @Override
  public void setUrl(String url) {
    super.setUrl(url);

    if(url != null){
      String[] spliced = StringUtils.split( url,"/");
      this.catalog = spliced[spliced.length - 1];
    }
  }
}
