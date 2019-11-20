/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.mdm.preview;

import com.fasterxml.jackson.annotation.JsonIgnore;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.support.JdbcUtils;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Map;

import app.metatron.discovery.common.data.projection.ColumnDescription;
import app.metatron.discovery.common.data.projection.Row;
import app.metatron.discovery.domain.dataconnection.DataConnectionHelper;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;
import app.metatron.discovery.extension.dataconnection.jdbc.accessor.JdbcAccessor;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

/**
 * The type Metadata jdbc data preview.
 */
public class MetadataJdbcDataPreview extends MetadataDataPreview {
  private static Logger LOGGER = LoggerFactory.getLogger(MetadataJdbcDataPreview.class);

  /**
   * The Connect information.
   */
  @JsonIgnore
  JdbcConnectInformation connectInformation;

  /**
   * The Query.
   */
  @JsonIgnore
  String query;

  /**
   * Instantiates a new Metadata jdbc data preview.
   *
   * @param metadata the metadata
   */
  public MetadataJdbcDataPreview(Metadata metadata) {
    super(metadata);
  }

  /**
   * Gets connect information.
   *
   * @return the connect information
   */
  public JdbcConnectInformation getConnectInformation() {
    return connectInformation;
  }

  /**
   * Sets connect information.
   *
   * @param connectInformation the connect information
   */
  public void setConnectInformation(JdbcConnectInformation connectInformation) {
    this.connectInformation = connectInformation;
  }

  /**
   * Gets query.
   *
   * @return the query
   */
  public String getQuery() {
    return query;
  }

  /**
   * Sets query.
   *
   * @param query the query
   */
  public void setQuery(String query) {
    this.query = query;
  }

  @Override
  protected void getDataGrid(Metadata metadata){
    if(connectInformation == null){
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.DATASOURCE_CONNECTION_ERROR, "Connection Information is not exist.");
    }
    JdbcAccessor dataAccessor = DataConnectionHelper.getAccessor(connectInformation);
    JdbcDialect jdbcDialect = dataAccessor.getDialect();

    Connection conn = null;
    Statement stmt = null;
    ResultSet rs = null;

    try{
      conn = dataAccessor.getConnection();
      stmt = conn.createStatement();
      stmt.setMaxRows(limit);
      if(stmt.execute(query)){
        rs = stmt.getResultSet();

        //rows
        while (rs.next()) {
          Row row = new Row();

          //data sequence sync with column sequence
          for(ColumnDescription columnDescription : this.columnDescriptions){
            Map<String, Object> additionalMap = columnDescription.getAdditionals();
            Boolean isDerivedColumn = (additionalMap != null && additionalMap.get("derived") != null)
                ? (Boolean) additionalMap.get("derived")
                : false;

            if(isDerivedColumn){
              row.values.add(null);
            } else {
              Object originalValue = rs.getObject(columnDescription.getPhysicalName());
              if(jdbcDialect != null && jdbcDialect.resultObjectConverter() != null){
                row.values.add(jdbcDialect.resultObjectConverter().apply(originalValue));
              } else {
                row.values.add(originalValue);
              }
            }
          }
          rows.add(row);
        }
      }

    } catch(Exception e){
      e.printStackTrace();
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.GENERAL_ERROR_CODE,
                                            "Execute Query For Jdbc Preview error");

    } finally {
      JdbcUtils.closeResultSet(rs);
      JdbcUtils.closeStatement(stmt);
      JdbcUtils.closeConnection(conn);
    }
  }
}
