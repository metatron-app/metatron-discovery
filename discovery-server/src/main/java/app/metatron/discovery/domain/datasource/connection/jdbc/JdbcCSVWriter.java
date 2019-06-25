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

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.support.JdbcUtils;
import org.supercsv.io.CsvResultSetWriter;
import org.supercsv.io.ICsvResultSetWriter;
import org.supercsv.prefs.CsvPreference;

import java.io.IOException;
import java.io.Writer;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.extension.dataconnection.jdbc.dialect.JdbcDialect;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionErrorCodes;
import app.metatron.discovery.extension.dataconnection.jdbc.exception.JdbcDataConnectionException;

public class JdbcCSVWriter extends CsvResultSetWriter implements ICsvResultSetWriter {

  public JdbcCSVWriter(Writer writer, CsvPreference preference) {
    super(writer, preference);
  }

  private static final Logger LOGGER = LoggerFactory.getLogger(JdbcCSVWriter.class);

  private JdbcDialect jdbcDialect;
  private Connection connection;
  private String query;
  private String fileName;
  private boolean withHeader = true;
  private int fetchSize = 0;
  private int maxRow = 0;

  public JdbcDialect getJdbcDialect() {
    return jdbcDialect;
  }

  public void setJdbcDialect(JdbcDialect jdbcDialect) {
    this.jdbcDialect = jdbcDialect;
  }

  public Connection getConnection() {
    return connection;
  }

  public void setConnection(Connection connection) {
    this.connection = connection;
  }

  public String getQuery() {
    return query;
  }

  public void setQuery(String query) {
    this.query = query;
  }

  public String getFileName() {
    return fileName;
  }

  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  public int getFetchSize() {
    return fetchSize;
  }

  public void setFetchSize(int fetchSize) {
    this.fetchSize = fetchSize;
  }

  public int getMaxRow() {
    return maxRow;
  }

  public void setMaxRow(int maxRow) {
    this.maxRow = maxRow;
  }

  public boolean isWithHeader() {
    return withHeader;
  }

  public void setWithHeader(boolean withHeader) {
    this.withHeader = withHeader;
  }

  private final int MAX_FETCH_SIZE = 100000;

  /**
   * {@inheritDoc}
   */
  public void writeNoHeader(final ResultSet resultSet) throws SQLException, IOException {
    if( resultSet == null ) {
      throw new NullPointerException("ResultSet cannot be null");
    }
    writeContents(resultSet); // increments row and line number before writing of each row
  }

  public void write(final ResultSet resultSet, boolean removeSubQueryTableName) throws SQLException, IOException {
    if( resultSet == null ) {
      throw new NullPointerException("ResultSet cannot be null");
    }

    if(withHeader) {
      writeHeaders(resultSet, removeSubQueryTableName);
    }

    writeContents(resultSet); // increments row and line number before writing of each row
  }

  public void write(final ResultSet resultSet, List<Field> fields, boolean useOriginalName) throws SQLException, IOException {
    if (resultSet == null) {
      throw new NullPointerException("ResultSet cannot be null");
    }

    if (withHeader) {
      List<String> headerNames = fields.stream()
                                       .map(f -> useOriginalName ? f.getOriginalName() : f.getName())
                                       .collect(Collectors.toList());
      writeHeaders(headerNames);
    }

    writeContents(resultSet); // increments row and line number before writing of each row
  }

  private void writeHeaders(ResultSet resultSet, boolean removeSubQueryTableName) throws SQLException, IOException {
    super.incrementRowAndLineNo(); // This will allow the correct row/line numbers to be used in any exceptions
    // thrown before writing occurs

    final ResultSetMetaData meta = resultSet.getMetaData();
    final int numberOfColumns = meta.getColumnCount();
    final List<Object> headers = new LinkedList<Object>();
    for( int columnIndex = 1; columnIndex <= numberOfColumns; columnIndex++ ) {
      String columnLabel = meta.getColumnLabel(columnIndex);
      if(removeSubQueryTableName) {
        if(columnLabel.indexOf(".") > -1) {
          headers.add(StringUtils.substringAfterLast(columnLabel, "."));
        } else {
          headers.add(columnLabel);
        }
      } else {
        headers.add(columnLabel);
      }
    }
    super.writeRow(headers);
  }

  public void writeHeaders(List<String> headerList) throws SQLException, IOException {
    super.incrementRowAndLineNo(); // This will allow the correct row/line numbers to be used in any exceptions
    super.writeRow(headerList);
  }

  private void writeContents(ResultSet resultSet) throws SQLException, IOException {
    final int numberOfColumns = resultSet.getMetaData().getColumnCount();
    final List<Object> objects = new LinkedList<Object>();
    LOGGER.debug("writeContents numberOfColumns : {}", numberOfColumns);
    while( resultSet.next() ) {
      super.incrementRowAndLineNo(); // This will allow the correct row/line numbers to be used in any exceptions
      // thrown before writing occurs
      objects.clear();
      for( int columnIndex = 1; columnIndex <= numberOfColumns; columnIndex++ ) {
        if(jdbcDialect != null && jdbcDialect.resultObjectConverter() != null){
          Object columnObj = jdbcDialect.resultObjectConverter().apply(resultSet.getObject(columnIndex));
          objects.add(columnObj);
        } else {
          objects.add(resultSet.getString(columnIndex));
        }
      }
      super.writeRow(objects);
    }
    LOGGER.debug("writeContents write completed");
  }

  public String write() {

    Statement stmt = null;
    ResultSet rs = null;

    try {
      stmt = connection.createStatement();

      if (fetchSize == 0) {
        fetchSize = MAX_FETCH_SIZE;
      }
      // Set Fetch size
      stmt.setFetchSize(fetchSize);

      //Set Max Row Size
      if(maxRow > 0) {
        stmt.setMaxRows(maxRow);
      }

      LOGGER.debug("Execute query : {} ", query);

      rs = stmt.executeQuery(query);

//      writeNoHeader(rs);
      write(rs, true);
      close();
      LOGGER.debug("Successfully create csv file : {}", fileName);

    } catch (SQLException e) {
      LOGGER.error("Fail to query for select :  {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.INVALID_QUERY_ERROR_CODE,
                                            "Fail to query : " + e.getMessage());
    } catch (IOException e) {
      LOGGER.error("Fail to write csv file by result of query :  {}", e.getMessage());
      throw new JdbcDataConnectionException(JdbcDataConnectionErrorCodes.CSV_IO_ERROR_CODE,
              "Fail to write csv file by result of query : " + e.getMessage());
    } finally {
      try {
        close();
      } catch (IOException e) {
        // swallow exception
      }
      closeConnection(connection, stmt, rs);
    }

    return fileName;
  }

  private void closeConnection(Connection connection, Statement stmt, ResultSet rs) {
    JdbcUtils.closeResultSet(rs);
    JdbcUtils.closeStatement(stmt);
    JdbcUtils.closeConnection(connection);
  }
}
