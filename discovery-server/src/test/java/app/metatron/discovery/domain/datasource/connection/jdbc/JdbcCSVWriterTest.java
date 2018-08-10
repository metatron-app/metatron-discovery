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

import org.junit.Test;
import org.supercsv.prefs.CsvPreference;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;

import javax.sql.DataSource;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class JdbcCSVWriterTest {

  private JdbcConnectionService jdbcConnectionService = new JdbcConnectionService();

  @Test
  public void selectQueryToCsv() throws IOException{
    HiveConnection connection = new HiveConnection();
    connection.setHostname("localhost");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(10000);

    String query = "select * from default.sales_test1";
    String csvFilePath;

    List<HashMap<String, Object>> testCase = new ArrayList<>();
    HashMap<String, Object> testMap;

    csvFilePath = "/tmp/temp_csv002.csv";
    testMap = new HashMap<>();
    testMap.put("csvFilePath", csvFilePath);
    testMap.put("writer", new PrintWriter(new File(csvFilePath)));
    testMap.put("fetchSize", 5000);
    testCase.add(testMap);

    ////////////

    testMap = new HashMap<>();
    csvFilePath = "/tmp/temp_csv012.csv";
    testMap.put("csvFilePath", csvFilePath);
    testMap.put("writer", new FileWriter(csvFilePath));
    testMap.put("fetchSize", 5000);
    testCase.add(testMap);

    for(HashMap<String, Object> testCaseMap : testCase){
      DataSource dataSource = jdbcConnectionService.getDataSource(connection, true);

      Calendar from = Calendar.getInstance();
      Writer writer = (Writer) testCaseMap.get("writer");
      int fetchSize = (int) testCaseMap.get("fetchSize");
      String csvFilePath1 = (String) testCaseMap.get("csvFilePath");
      JdbcCSVWriter jdbcCSVWriter = new JdbcCSVWriter(writer, CsvPreference.STANDARD_PREFERENCE);
      jdbcCSVWriter.setConnection(connection);
      jdbcCSVWriter.setDataSource(dataSource);
      jdbcCSVWriter.setQuery(query);
      jdbcCSVWriter.setFetchSize(fetchSize);
      jdbcCSVWriter.setFileName(csvFilePath1);
      jdbcCSVWriter.write();
      Calendar to = Calendar.getInstance();

      testCaseMap.put("from", from);
      testCaseMap.put("to", to);
    }

    int i = 0;
    for(HashMap<String, Object> testCaseMap : testCase){
      Calendar from = (Calendar) testCaseMap.get("from");
      Calendar to = (Calendar) testCaseMap.get("to");
      System.out.println(i++ + " = " + (to.getTime().getTime() - from.getTime().getTime()));
    }

//    CSVReader reader = new CSVReader(new FileReader(csvFilePath));
//    String[] line;
//    while ((line = reader.readNext()) != null) {
//      for(String text : line){
//        System.out.print(text);
//      }
//      System.out.println("");
//    }
  }

  @Test
  public void test2() throws Exception{
    PrintWriter pw = null;
    try {
      pw = new PrintWriter(new File("/tmp/test.csv"));
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    }
    StringBuilder builder = new StringBuilder();
    String ColumnNamesList = "Id,Name";
// No need give the headers Like: id, Name on builder.append
    builder.append(ColumnNamesList +"\n");

    for(int i = 0; i < 100000; ++i){
      builder.append(i + ",");
      builder.append("Chola");
      builder.append('\n');
      pw.write(builder.toString());
    }

    pw.close();
    System.out.println("done!");
  }
}
