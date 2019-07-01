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

package app.metatron.discovery.common.data.projection;

import java.util.List;
import java.util.Map;

/**
 * The interface Data grid.
 */
public interface DataGrid {
  /**
   * Gets column count.
   *
   * @return the column count
   */
  //Columns
  Integer getColumnCount();

  /**
   * Gets column names.
   *
   * @return the column names
   */
  List<String> getColumnNames();

  /**
   * Gets column descriptions.
   *
   * @return the column descriptions
   */
  List<ColumnDescription> getColumnDescriptions();

  /**
   * Gets column index.
   *
   * @return the column index
   */
  Map<String, Integer> getColumnIndex();

  /**
   * Gets row count.
   *
   * @return the row count
   */
  //Rows
  Integer getRowCount();

  /**
   * Gets rows.
   *
   * @return the rows
   */
  List<Row> getRows();
}
