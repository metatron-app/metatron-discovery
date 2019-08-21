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
package app.metatron.discovery.domain.dataprep;

import static org.junit.Assert.assertEquals;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;
import javax.annotation.Nullable;

import org.junit.Test;

public class PrepDatasetStagingDbServiceTest {

  class SQLStringTestSet {
    @Nullable
    String queryStmt;
    String size;
    @Nullable
    String dbName;
    @Nullable
    String tblName;
    String expected;

    SQLStringTestSet(@Nullable String queryStmt, String size, String expected) {
      this.queryStmt = queryStmt;
      this.size = size;
      this.expected = expected;
    }

    SQLStringTestSet(
        @Nullable String queryStmt,
        String size,
        @Nullable String dbName,
        @Nullable String tblName,
        String expected) {
      this.queryStmt = queryStmt;
      this.size = size;
      this.dbName = dbName;
      this.tblName = tblName;
      this.expected = expected;
    }
  }

  @Test
  public void testSQLString() throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
    PrepDatasetStagingDbService service = new PrepDatasetStagingDbService();
    Class stringClass = String.class;
    Method getSQLString = service.getClass()
        .getDeclaredMethod("getSQLString", stringClass, stringClass, stringClass, stringClass);
    getSQLString.setAccessible(true);

    List<SQLStringTestSet> testSets = Arrays.asList(
        new SQLStringTestSet("SELECT * FROM db.table", "10", "SELECT * FROM db.table LIMIT 10"),
        new SQLStringTestSet("SELECT * FROM db.table;", "10", "SELECT * FROM db.table LIMIT 10"),
        new SQLStringTestSet("SELECT * FROM db.table;\t", "10", "SELECT * FROM db.table LIMIT 10"),
        new SQLStringTestSet("SELECT * FROM db.table LIMIT 100", "10", "SELECT * FROM db.table LIMIT 100"),
        new SQLStringTestSet("SELECT * FROM db.table LIMIT 100;", "10", "SELECT * FROM db.table LIMIT 100"),
        new SQLStringTestSet("SELECT * FROM db.table LIMIT 100;\t", "10", "SELECT * FROM db.table LIMIT 100"),
        new SQLStringTestSet(null, "10", "db", "table", "SELECT * FROM db.table LIMIT 10")
    );

    for (SQLStringTestSet test : testSets) {
      assertEquals(test.expected, getSQLString.invoke(service, test.queryStmt, test.size, test.dbName, test.tblName));
    }
  }
}
