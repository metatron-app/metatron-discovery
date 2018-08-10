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

package app.metatron.discovery.util;

import org.apache.commons.lang3.StringUtils;
import org.supercsv.io.CsvResultSetWriter;
import org.supercsv.io.ICsvResultSetWriter;
import org.supercsv.prefs.CsvPreference;

import java.io.IOException;
import java.io.Writer;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

/**
 * Created by kyungtaak on 2016. 8. 8..
 */
public class CustomCsvResultSetWriter extends CsvResultSetWriter implements ICsvResultSetWriter {

  public CustomCsvResultSetWriter(Writer writer, CsvPreference preference) {
    super(writer, preference);
  }

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
    writeHeaders(resultSet, removeSubQueryTableName);
    writeContents(resultSet); // increments row and line number before writing of each row
  }

  private void writeHeaders(ResultSet resultSet, boolean removeSubQueryTableName) throws SQLException, IOException {
    super.incrementRowAndLineNo(); // This will allow the correct row/line numbers to be used in any exceptions
    // thrown before writing occurs

    final ResultSetMetaData meta = resultSet.getMetaData();
    final int numberOfColumns = meta.getColumnCount();
    final List<Object> headers = new LinkedList<Object>();
    for( int columnIndex = 1; columnIndex <= numberOfColumns; columnIndex++ ) {
      if(removeSubQueryTableName) {
        String columnName = meta.getColumnName(columnIndex);
        if(columnName.indexOf(".") > -1) {
          headers.add(StringUtils.substringAfterLast(columnName, "."));
        } else {
          headers.add(columnName);
        }
      } else {
        headers.add(meta.getColumnName(columnIndex));
      }
    }
    super.writeRow(headers);
  }

  private void writeContents(ResultSet resultSet) throws SQLException, IOException {
    final int numberOfColumns = resultSet.getMetaData().getColumnCount();
    final List<Object> objects = new LinkedList<Object>();
    while( resultSet.next() ) {
      super.incrementRowAndLineNo(); // This will allow the correct row/line numbers to be used in any exceptions
      // thrown before writing occurs
      objects.clear();
      for( int columnIndex = 1; columnIndex <= numberOfColumns; columnIndex++ ) {
        objects.add(resultSet.getObject(columnIndex));
      }
      super.writeRow(objects);
    }
  }

}
