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

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.entity.JsonMapConverter;
import app.metatron.discovery.domain.datasource.connection.DataConnection;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.springframework.data.domain.Pageable;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.MappedSuperclass;
import java.util.Map;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
@MappedSuperclass
public abstract class JdbcDataConnection extends DataConnection {

  public static final String CURRENT_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
  public static final String DEFAULT_FORMAT = "DEFAULT_FORMAT";
  public static final String JDBC_PROPERTY_PREFIX = "native.";
  public static final String METATRON_PROPERTY_PREFIX = "metatron.";

  @Column(name = "dc_database")
  protected String database;

  @Column(name = "dc_properties")
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String properties;

  public JdbcDataConnection() {
    super();
    this.setType(SourceType.JDBC);
  }

  @JsonIgnore
  public abstract String getDriverClass();

  /**
   * [참고] DB 별 TEST Query : http://stackoverflow.com/a/3670000
   * @return
   */
  @JsonIgnore
  public abstract String getTestQuery();

  @JsonIgnore
  public abstract String getUseDatabaseQuery(String database);

  @JsonIgnore
  public abstract String getShowDataBaseQuery();

  @JsonIgnore
  public abstract String getShowSchemaQuery();

  @JsonIgnore
  public abstract String getShowTableQuery(String schema);

  @JsonIgnore
  public abstract String getSearchDataBaseQuery(String databaseNamePattern, Pageable pageable);

  @JsonIgnore
  public abstract String getDataBaseCountQuery(String databaseNamePattern);

  @JsonIgnore
  public abstract String getSearchSchemaQuery(String schemaNamePattern, Pageable pageable);

  @JsonIgnore
  public abstract String getSchemaCountQuery(String schemaNamePattern);

  @JsonIgnore
  public abstract String getSearchTableQuery(String schema, String tableNamePattern, Pageable pageable);

  @JsonIgnore
  public abstract String getTableCountQuery(String schema, String tableNamePattern);

  @JsonIgnore
  public abstract String getTableDescQuery(String schema, String table);

  @JsonIgnore
  public abstract String getSearchColumnQuery(String schema, String table, String columnNamePattern, Pageable pageable);

  @JsonIgnore
  public abstract String getColumnCountQuery(String schema, String table, String columnNamePattern);

  @JsonIgnore
  public abstract String getTableName(String schema, String table);

  @JsonIgnore
  public String getTableNameColumn(){
    return null;
  }

  @JsonIgnore
  public abstract String getQuotatedFieldName(String fieldName);

  @JsonIgnore
  public abstract String getDefaultTimeFormat();

  @JsonIgnore
  public abstract String getCharToDateStmt(String timeStr, String timeFormat);

  @JsonIgnore
  public abstract String getCurrentTimeStamp();

  @JsonIgnore
  public abstract String[] getDescribeProperties();

  public String getDatabase() {
    return database;
  }

  public void setDatabase(String database) {
    this.database = database;
  }

  public String getProperties() {
    return properties;
  }

  public void setProperties(String properties) {
    this.properties = properties;
  }

  @JsonIgnore
  public Map<String, String> getPropertiesMap(){
    return GlobalObjectMapper.readValue(this.properties);
  }
}
