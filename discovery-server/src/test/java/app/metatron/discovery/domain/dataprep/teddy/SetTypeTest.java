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
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.SetType;

import org.joda.time.DateTime;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;

import static org.junit.Assert.assertEquals;

/**
 * WrangleTest
 */
public class SetTypeTest extends  TeddyTest{

  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("sample", "teddy/date_sample.csv");
    loadGridCsv("crime", "teddy/crime.csv");
  }

  private DataFrame newSampleDataFrame() throws IOException, TeddyException {
    DataFrame df = new DataFrame();
    df.setByGrid(grids.get("sample"), null);
    df = prepare_timestamp(df);
    df.show();
    return df;
  }

  @Test
  public void testSetType1() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    String ruleString  = "settype col: birth_date type: timestamp format: 'MM.dd.yyyy HH:mm:ss'";
    DataFrame newDf = apply_rule(sampleDataFrame, ruleString);
    newDf.show();

    DateTime dateTime = DateTime.parse("2011-01-01T12:05:01");

    assertEquals(ColumnType.TIMESTAMP, newDf.colDescs.get(0).getType());   // null
    assertEquals(dateTime, newDf.rows.get(0).get("birth_date"));
  }

  @Test
  public void testSetType2() throws IOException, TeddyException {
    DataFrame sampleDataFrame = newSampleDataFrame();
    String ruleString = "settype col: birth_date type: timestamp format: 'MM.dd.yyyy HH:mm:ss'";
    DataFrame newDf = apply_rule(sampleDataFrame, ruleString);
    newDf.show();
    ruleString = "settype col:birth_date type: string";
    newDf = apply_rule(sampleDataFrame, ruleString);
    newDf.show();

    //DateTime dateTime = DateTime.parse("2011-01-01T12:00:01");

    assertEquals(ColumnType.STRING, newDf.colDescs.get(0).getType());   // null
    assertEquals("1.01.2011 12:05:01", newDf.rows.get(0).get("birth_date"));
  }

  @Test
  public void testSetTypeMulti() throws IOException, TeddyException {
    DataFrame crime = new DataFrame();
    crime.setByGrid(grids.get("crime"), null);
    crime = DataFrameTest.prepare_crime_more(crime);
    crime.show();

    String ruleString = "settype col: `Total Crime`, `Violent Crime` type: long";
    DataFrame newDf = apply_rule(crime, ruleString);
    newDf.show();

    assertEquals(ColumnType.LONG, newDf.colDescs.get(3).getType());
    assertEquals(ColumnType.LONG, newDf.colDescs.get(4).getType());
  }
}
