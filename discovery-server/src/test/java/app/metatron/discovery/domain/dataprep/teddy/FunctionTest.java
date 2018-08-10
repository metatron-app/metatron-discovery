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

package app.metatron.discovery.domain.dataprep.teddy;

import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.Derive;
import app.metatron.discovery.prep.parser.preparation.rule.Keep;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;

import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;

import static org.junit.Assert.assertEquals;

/**
 * WrangleTest
 */
public class FunctionTest {

  static String getResourcePath(String relPath, boolean fromHdfs) {
    if (fromHdfs) {
      throw new IllegalArgumentException("HDFS not supported yet");
    }
    URL url = DataFrameTest.class.getClassLoader().getResource(relPath);
    return (new File(url.getFile())).getAbsolutePath();
  }

  public static String getResourcePath(String relPath) {
    return getResourcePath(relPath, false);
  }

  private static Map<String, List<String[]>> grids = new HashMap<>();

  static int limitRowCnt = 10000;

  @BeforeClass
  public static void setUp() throws Exception {
    grids.put("sample", Util.loadGridLocalCsv(getResourcePath("teddy/date_sample.csv"), ",", limitRowCnt));
    //grids.put("crime", Util.loadGridLocalCsv(getResourcePath("teddy/crime.csv"), ",", limitRowCnt));
  }

  private DataFrame newSampleDataFrame() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = DataFrameTest.prepare_timestamp2(df);
    df.show();
    return df;
  }

  @Test
  public void functionTest1_year() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: year(birth_date) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();

    assertEquals(ColumnType.TIMESTAMP, newDf.colDescs.get(0).getType());   // null
    assertEquals((long)2011, newDf.rows.get(0).get("new_col"));
  }

  @Test
  public void functionTest2_month() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: month(birth_date) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();

    assertEquals(ColumnType.TIMESTAMP, newDf.colDescs.get(0).getType());   // null
    assertEquals((long)1, newDf.rows.get(0).get("new_col"));
  }

  @Test
  public void functionTest3_day() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: day(birth_date) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();

    assertEquals(ColumnType.TIMESTAMP, newDf.colDescs.get(0).getType());   // null
    assertEquals((long)1, newDf.rows.get(0).get("new_col"));
  }

  @Test
  public void functionTest4_hour() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: hour(birth_date) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();

    assertEquals(ColumnType.TIMESTAMP, newDf.colDescs.get(0).getType());   // null
    assertEquals((long)12, newDf.rows.get(0).get("new_col"));
  }

  @Test
  public void functionTest5_minute() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: minute(birth_date) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();

    assertEquals(ColumnType.TIMESTAMP, newDf.colDescs.get(0).getType());   // null
    assertEquals((long)5, newDf.rows.get(0).get("new_col"));
  }

  @Test
  public void functionTest6_second() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: second(birth_date) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();

    assertEquals(ColumnType.TIMESTAMP, newDf.colDescs.get(0).getType());   // null
    assertEquals((long)1, newDf.rows.get(0).get("new_col"));
  }

  @Test
  public void functionTest7_millisecond() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: millisecond(birth_date) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();

    assertEquals(ColumnType.TIMESTAMP, newDf.colDescs.get(0).getType());   // null
    assertEquals((long)0, newDf.rows.get(0).get("new_col"));
  }

  @Test
  public void functionTest8_weekday() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: weekday(birth_date) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();

    assertEquals(ColumnType.TIMESTAMP, newDf.colDescs.get(0).getType());   // null
    assertEquals("Saturday", newDf.rows.get(0).get("new_col"));
  }

  @Test
  public void functionTest9_now() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: now() as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();

    assertEquals(ColumnType.TIMESTAMP, newDf.colDescs.get(8).getType());   // null
    //assertEquals((long)1, newDf.rows.get(0).get("new_col"));
  }

  @Test
  public void functionTest10_addtime() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: add_time(birth_date, 1, 'year') as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    Rule rule2 = new RuleVisitorParser().parse("derive value: year(new_col) as: 'new_col2'");
    newDf =newDf.doDerive((Derive) rule2);
    newDf.show();

    assertEquals((long)2012, newDf.rows.get(0).get("new_col2"));
  }

  @Test
  public void functionTest11_timeDiff() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: add_time(birth_date, 1, 'minute') as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    Rule rule2 = new RuleVisitorParser().parse("derive value: time_diff(birth_date, new_col) as: 'new_col2'");
    newDf =newDf.doDerive((Derive) rule2);
    newDf.show();

    assertEquals((long)60000, newDf.rows.get(0).get("new_col2"));
  }

  @Test
  public void functionTest12_timestamp() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: timestamp('2011-01-01 12:05:01', 'yyyy-MM-dd HH:mm:ss') as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    Rule rule2 = new RuleVisitorParser().parse("keep row: time_diff(birth_date, new_col)==0");
    newDf =newDf.doKeep((Keep) rule2);
    newDf.show();

    assertEquals(1, newDf.rows.size());
  }

  @Test
  public void functionTest13_length() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: length(name) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();

    assertEquals((long)9, newDf.rows.get(0).get("new_col"));
  }

  @Test
  public void functionTest14_isnull() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: isnull(memo) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();
    assertEquals(true, newDf.rows.get(0).get("new_col"));
    assertEquals(false, newDf.rows.get(1).get("new_col"));
    assertEquals(false, newDf.rows.get(3).get("new_col"));
  }

  @Test
  public void functionTest15_upper() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: upper(name) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();
    assertEquals("AUDI", newDf.rows.get(3).get("new_col"));
  }

  @Test
  public void functionTest16_lower() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: lower(name) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();

    assertEquals("audi", newDf.rows.get(3).get("new_col"));
  }

  @Test
  public void functionTest17_trim() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: trim(name) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();
    assertEquals("Ferrari", newDf.rows.get(0).get("new_col"));
    assertEquals("Mercedes", newDf.rows.get(2).get("new_col"));
  }

  @Test
  public void functionTest18_ltrim() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: ltrim(name) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();
    assertEquals("Ferrari", newDf.rows.get(0).get("new_col"));
    assertEquals("Jaguar  ", newDf.rows.get(1).get("new_col"));
    assertEquals("Mercedes  ", newDf.rows.get(2).get("new_col"));
  }

  @Test
  public void functionTest19_rtrim() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: rtrim(name) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();
    assertEquals("  Ferrari", newDf.rows.get(0).get("new_col"));
    assertEquals("Jaguar", newDf.rows.get(1).get("new_col"));
    assertEquals("  Mercedes", newDf.rows.get(2).get("new_col"));
  }

  @Test
  public void functionTest20_substring() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: substring(name, 1, 6) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();
    assertEquals(" Ferr", newDf.rows.get(0).get("new_col"));
    assertEquals("aguar", newDf.rows.get(1).get("new_col"));
    assertEquals("udi", newDf.rows.get(3).get("new_col"));
  }

  @Test
  public void functionTest21_concat() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: concat('speed of ', name, ' is ', speed) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();
    assertEquals("speed of   Ferrari is 259", newDf.rows.get(0).get("new_col"));
  }

  @Test
  public void functionTest22_concat_ws() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    Rule rule = new RuleVisitorParser().parse("derive value: concat_ws('-', 'D', itemNo, speed, weight) as: 'new_col'");
    DataFrame newDf = sampleDataFrame.doDerive((Derive) rule);
    newDf.show();
    assertEquals("D-1-259-800", newDf.rows.get(0).get("new_col"));
  }

}
