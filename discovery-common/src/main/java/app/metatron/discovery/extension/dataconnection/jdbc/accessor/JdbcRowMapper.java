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

package app.metatron.discovery.extension.dataconnection.jdbc.accessor;

import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * The interface Jdbc row mapper.
 *
 * @param <T> the type parameter
 */
@FunctionalInterface
public interface JdbcRowMapper<T> {
  /**
   * Map row t.
   *
   * @param rs     the rs
   * @param rowNum the row num
   * @return the t
   * @throws SQLException the sql exception
   */
  T mapRow(ResultSet rs, int rowNum) throws SQLException;
}
