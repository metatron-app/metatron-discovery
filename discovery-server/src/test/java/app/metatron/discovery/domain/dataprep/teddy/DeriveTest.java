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
import app.metatron.discovery.prep.parser.preparation.rule.Rule;

import org.apache.poi.ss.formula.functions.T;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;

import static org.junit.Assert.assertEquals;

/**
 * Derive Test (in Transform)
 */
public class DeriveTest extends TeddyTest {
  
  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("null_contained", "teddy/null_contained.csv");
  }

  private DataFrame newNullContainedDataFrame() throws IOException, TeddyException {
    DataFrame null_contained = new DataFrame();
    null_contained.setByGrid(grids.get("null_contained"), null);
    null_contained = prepare_null_contained(null_contained);
    null_contained.show();
    return null_contained;
  }

  // original dataset
  // +----------+-------------+------+-----------+-----+------+
  // |birth_date|contract_date|itemNo|       name|speed|weight|
  // +----------+-------------+------+-----------+-----+------+
  // |2010-01-01|   2017-01-01|     1|    Ferrari|  259|   800|
  // |2000-01-01|   2017-01-01|  null|     Jaguar|  274|   998|
  // |1990-01-01|   2017-01-01|     3|   Mercedes|  340|  1800|
  // |1980-01-01|   2017-01-01|     4|       Audi|  345|   875|
  // |1970-01-01|   2017-01-01|     5|Lamborghini|  355|  1490|
  // |1970-01-01|   2017-01-01|     6|       null| null|  1490|
  // +----------+-------------+------+-----------+-----+------+

  @Test
  public void testDerive1() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: itemNo as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();
    assertEquals(new Long(1), newDf.rows.get(0).get("cate_if"));   // 1
    assertEquals(null,        newDf.rows.get(1).get("cate_if"));   // null
  }

  @Test
  public void testDerive2() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(itemNo) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();
    assertEquals(true,  newDf.rows.get(0).get("cate_if"));   // 1
    assertEquals(false, newDf.rows.get(1).get("cate_if"));   // null
  }

  @Test
  public void testDerive3() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(isnull(itemNo), '1', '2') as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();
    assertEquals("2", newDf.rows.get(0).get("cate_if"));   // 1
    assertEquals("1", newDf.rows.get(1).get("cate_if"));   // null
  }

  @Test
  public void testDerive4() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(itemNo, 1, 2) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(1), newDf.rows.get(0).get("cate_if"));   // 1
    assertEquals(new Long(2), newDf.rows.get(1).get("cate_if"));   // null
  }

  @Test
  public void testDerive5() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(itemNo, '1', '2') as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("1", newDf.rows.get(0).get("cate_if"));   // 1
    assertEquals("2", newDf.rows.get(1).get("cate_if"));   // null
  }

  @Test
  public void testDerive6() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(itemNo == 3) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(false, newDf.rows.get(0).get("cate_if"));   // 1
    assertEquals(false, newDf.rows.get(1).get("cate_if"));   // null
    assertEquals(true,  newDf.rows.get(2).get("cate_if"));   // 3
  }

  @Test
  public void testDerive7() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(name == 'Ferrari') as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(true,  newDf.rows.get(0).get("cate_if"));   // Ferrari
    assertEquals(false, newDf.rows.get(1).get("cate_if"));   // Jaguar
    assertEquals(false, newDf.rows.get(5).get("cate_if"));   // null
  }

  @Test
  public void testDerive8() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(name == 'Ferrari', '1', '0') as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("1", newDf.rows.get(0).get("cate_if"));   // Ferrari
    assertEquals("0", newDf.rows.get(1).get("cate_if"));   // Jaguar
    assertEquals("0", newDf.rows.get(5).get("cate_if"));   // null
  }

  @Test
  public void testDerive9() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(name == 'Ferrari', 1, 0) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(1), newDf.rows.get(0).get("cate_if"));   // Ferrari
    assertEquals(new Long(0), newDf.rows.get(1).get("cate_if"));   // Jaguar
    assertEquals(new Long(0), newDf.rows.get(5).get("cate_if"));   // null
  }

  @Test
  public void testDerive10() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(name == 'Ferrari', 10.0, 1.0) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Double(10.0), newDf.rows.get(0).get("cate_if"));  // Ferrari
    assertEquals(new Double(1.0), newDf.rows.get(1).get("cate_if"));   // Jaguar
    assertEquals(new Double(1.0), newDf.rows.get(5).get("cate_if"));   // null
  }

  @Test
  public void testDerive11() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(itemNo <= 3, 1, 0) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(1), newDf.rows.get(0).get("cate_if"));   // 1
    assertEquals(new Long(0), newDf.rows.get(1).get("cate_if"));   // null
    assertEquals(new Long(0), newDf.rows.get(4).get("cate_if"));   // 4
  }

  @Test
  public void testDerive12() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if (weight > 1000, 'heavy', 'light') as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("light", newDf.rows.get(0).get("cate_if"));   // 800
    assertEquals("light", newDf.rows.get(1).get("cate_if"));   // 998
    assertEquals("heavy", newDf.rows.get(2).get("cate_if"));   // 1800
  }

  @Test
  public void testDerive13() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if (itemNo < 3) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(true,  newDf.rows.get(0).get("cate_if"));   // 1
    assertEquals(false, newDf.rows.get(1).get("cate_if"));   // null
    assertEquals(false, newDf.rows.get(2).get("cate_if"));   // 3
  }

  @Test
  public void testDerive14() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if (speed > 300 && speed < 400) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(false, newDf.rows.get(0).get("cate_if"));   // 259
    assertEquals(true,  newDf.rows.get(2).get("cate_if"));   // 340
    assertEquals(false, newDf.rows.get(5).get("cate_if"));   // null
  }

  @Test
  public void testDerive15() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if (speed > 300 && speed < 400 || weight < 1000) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(true,  newDf.rows.get(0).get("cate_if"));   // 259, 800
    assertEquals(true,  newDf.rows.get(1).get("cate_if"));   // 274, 998
    assertEquals(true,  newDf.rows.get(2).get("cate_if"));   // 340, 1800
    assertEquals(false, newDf.rows.get(5).get("cate_if"));   // null, 1490
  }

  @Test
  public void testDerive16() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if (speed > 300 && speed < 400 && weight < 1000) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(false, newDf.rows.get(0).get("cate_if"));   // 259, 800
    assertEquals(false, newDf.rows.get(1).get("cate_if"));   // 274, 998
    assertEquals(true,  newDf.rows.get(3).get("cate_if"));   // 355, 1490
    assertEquals(false, newDf.rows.get(5).get("cate_if"));   // null, 1490
  }

  @Test
  public void testDerive17() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if (speed > 300 && speed < 400 && weight < 1000, 'good', 'bad') as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("bad",  newDf.rows.get(0).get("cate_if"));   // 259, 800
    assertEquals("bad",  newDf.rows.get(1).get("cate_if"));   // 274, 998
    assertEquals("good", newDf.rows.get(3).get("cate_if"));   // 355, 1490
    assertEquals("bad",  newDf.rows.get(5).get("cate_if"));   // null, 1490
  }

  @Test
  public void testDerive18() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if (speed > 300 && speed < 400 && weight < 1000, 1, 0) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(0), newDf.rows.get(0).get("cate_if"));   // 259, 800
    assertEquals(new Long(0), newDf.rows.get(1).get("cate_if"));   // 274, 998
    assertEquals(new Long(1), newDf.rows.get(3).get("cate_if"));   // 355, 1490
    assertEquals(new Long(0), newDf.rows.get(5).get("cate_if"));   // null, 1490
  }

  @Test
  public void testDerive19() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if (speed > 300 && speed < 400 && weight < 1000, 10.0, 1.0) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(1.0, newDf.rows.get(0).get("cate_if"));   // 259, 800
    assertEquals(1.0, newDf.rows.get(1).get("cate_if"));   // 274, 998
    assertEquals(10.0, newDf.rows.get(3).get("cate_if"));  // 355, 1490
    assertEquals(1.0, newDf.rows.get(5).get("cate_if"));   // null, 1490
  }

//  @Test
//  public void testDerive20() throws IOException, TeddyException {
//    DataFrame null_contained = newNullContainedDataFrame();
//    String ruleString ="derive value: upper(name) as: 'cate_if'";
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("FERRARI", newDf.rows.get(0).get("cate_if"));
//  }

  @Test
  public void testDerive21() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: isnull(name) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(false, newDf.rows.get(0).get("cate_if"));   // Ferrari
    assertEquals(true,  newDf.rows.get(5).get("cate_if"));   // null
  }

    @Test
    public void testDerive22() throws IOException, TeddyException {
      DataFrame null_contained = newNullContainedDataFrame();
      String ruleString ="derive value: length(name) as: 'cate_if'";
      DataFrame newDf = apply_rule(null_contained, ruleString);
      newDf.show();

      assertEquals(new Long(7), newDf.rows.get(0).get("cate_if"));   // Ferrari
      assertEquals(null,        newDf.rows.get(5).get("cate_if"));   // null
      // consequently, if the argument is null, the result of a function is also null.
    }

  @Test
  public void testDerive23() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(length(name)) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(true,  newDf.rows.get(0).get("cate_if"));   // Ferrari
    assertEquals(false, newDf.rows.get(5).get("cate_if"));   // null
    // the conditional result of null is the false.
  }

  @Test
  public void testDerive24() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(length(name) > 5, '1', '0') as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("1", newDf.rows.get(0).get("cate_if"));  // Ferrari
    assertEquals("0", newDf.rows.get(3).get("cate_if"));  // Audi
    assertEquals("0", newDf.rows.get(5).get("cate_if"));  // null
    // the conditional result of null is the false.
  }

  @Test
  public void testDerive25() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(length(name) < 7, 1, 0) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(0), newDf.rows.get(0).get("cate_if"));  // Ferrari
    assertEquals(new Long(1), newDf.rows.get(3).get("cate_if"));  // Audi
    assertEquals(new Long(0), newDf.rows.get(5).get("cate_if"));  // null
    // the conditional result of null is the false.
  }

  @Test
  public void testDerive26() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(length(name) < 7, 10.0, 1.0) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(1.0, newDf.rows.get(0).get("cate_if"));   // Ferrari
    assertEquals(10.0, newDf.rows.get(3).get("cate_if"));  // Audi
    assertEquals(1.0, newDf.rows.get(5).get("cate_if"));   // null
    // the conditional result of null is the false.
  }

  @Test
  public void testDerive27() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(length(name) == 4, '4c', 'others') as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("others", newDf.rows.get(0).get("cate_if"));  // Ferrari
    assertEquals("4c",     newDf.rows.get(3).get("cate_if"));  // Audi
    assertEquals("others", newDf.rows.get(5).get("cate_if"));  // null
    // the conditional result of null is the false.
  }

  @Test
  public void testDerive28() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: weight + 100 as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(900), newDf.rows.get(0).get("cate_if"));  // 800
  }

  @Test
  public void testDerive29() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: weight + 100.78 as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(900.78, newDf.rows.get(0).get("cate_if"));  // 800
  }

  @Test
  public void testDerive30() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: weight - 100 as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(700), newDf.rows.get(0).get("cate_if"));  // 800
  }

  @Test
  public void testDerive31() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: weight * 100 as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(80000), newDf.rows.get(0).get("cate_if"));  // 800
  }

  @Test
  public void testDerive32() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: weight / 100 as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(8.0, newDf.rows.get(0).get("cate_if"));  // 800
  }

  @Test
  public void testDerive33() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: speed + weight as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(1059), newDf.rows.get(0).get("cate_if"));  // 259, 800
  }

  @Test
  public void testDerive34() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: speed + weight + itemNo as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(1060), newDf.rows.get(0).get("cate_if"));  // 259, 800, 1
  }

  @Test
  public void testDerive35() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: speed + 100 - weight + 2 - 3 as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(-442), newDf.rows.get(0).get("cate_if"));  // 259, 800
  }

  @Test
  public void testDerive36() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: length(name) + speed + itemNo + 100 as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(367), newDf.rows.get(0).get("cate_if"));  // Ferrari, 259, 1
  }

//  @Test
//  public void testDerive37() throws IOException, TeddyException {
//    DataFrame null_contained = newNullContainedDataFrame();
//    String ruleString ="derive value: math.sqrt(speed) + math.sqrt(weight) as: 'cate_if'";
//    DataFrame newDf = apply_rule(null_contained, ruleString);
//    newDf.show();
//
//    assertEquals("44.377", newDf.rows.get(0).get("cate_if").toString().substring(0, 6));  // 259, 800
//  }

  @Test
  public void testDerive38() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: 5 + weight as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(805), newDf.rows.get(0).get("cate_if"));  // 800
  }

//    @Test
//    public void testDerive39() {
////        String rule = "derive value: if(floor(datediff(to_date(contract_date), to_date(birth_date))/365.25/10) == 1, 1, 0) as: age_10";
//        String rule = "derive value: math.floor(datediff (to_date(contract_date, 'yyyy-MM-dd'), to_date(birth_date, 'yyyy-MM-dd'))) as: age_10";
////        runAndPrint(rule);
//        Dataset resultDF = metisService.transform(getRuleSet(rule), true).getResultSet();
//        resultDF.show();
//        assertEquals(new Long(2557), resultDF.select("age_10").as(Encoders.LONG()).first());
//    }

  @Test
  public void testDerive40() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: 1 as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(1), newDf.rows.get(0).get("cate_if"));  // 800
  }

//    @Test
//    public void testDerive41() {
//        String rule = "derive value: substring(name, 1, 2) as: 'cate_if'";
//        Dataset resultDF = metisService.transform(getRuleSet(rule), true).getResultSet();
//        resultDF.show();
//        assertEquals("Fe", resultDF.select("cate_if").as(Encoders.STRING()).first());
//    }
//
//    @Test
//    public void testDerive42() {
//        String rule = "derive value: if(substring(name, 1, 2) == 'Fe') as: 'cate_if'";
//        Dataset resultDF = metisService.transform(getRuleSet(rule), true).getResultSet();
//        resultDF.show();
//        assertEquals(true, resultDF.select("cate_if").as(Encoders.BOOLEAN()).first());
//    }
//
//    @Test
//    public void testDerive43() {
//        String rule = "derive value: if(substring(name, 1, 2)) as: 'cate_if'";
//        Dataset resultDF = metisService.transform(getRuleSet(rule), true).getResultSet();
//        resultDF.show();
//        assertEquals(true, resultDF.select("cate_if").as(Encoders.BOOLEAN()).first());
//    }
//
//    @Test
//    public void testDerive44() {
//        String rule = "derive value: if(substring(name, 1, 2), 1, 2) as: 'cate_if'";
//        Dataset resultDF = metisService.transform(getRuleSet(rule), true).getResultSet();
//        resultDF.show();
//        assertEquals(new Long(1), resultDF.select("cate_if").as(Encoders.LONG()).first());
//    }

  @Test
  public void testDerive45() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if('Ferrari' == name) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(true,  newDf.rows.get(0).get("cate_if"));  // 800
    assertEquals(false, newDf.rows.get(5).get("cate_if"));  // null
  }

  @Test
  public void testDerive46() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(length(name) + 1 == length(name) + 2) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(false, newDf.rows.get(0).get("cate_if"));  // 800
    assertEquals(false, newDf.rows.get(5).get("cate_if"));  // null
  }

  @Test
  public void testDerive47() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: isnull(name) as: 'cate_if'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(false, newDf.rows.get(0).get("cate_if"));  // 800
    assertEquals(true,  newDf.rows.get(5).get("cate_if"));  // null
  }
//
//    @Test
//    public void testDerive48() {
//        String rule = "derive value: upper(name) as: 'cate_if'";
//        Dataset resultDF = metisService.transform(getRuleSet(rule), true).getResultSet();
//        resultDF.show();
//        assertEquals("FERRARI", resultDF.select("cate_if").as(Encoders.STRING()).first());
//    }
//
//    @Test
//    public void testDerive49() {
//        String rule = "derive value: lower(name) as: 'cate_if'";
//        Dataset resultDF = metisService.transform(getRuleSet(rule), true).getResultSet();
//        resultDF.show();
//        assertEquals("ferrari", resultDF.select("cate_if").as(Encoders.STRING()).first());
//    }
//
//    @Test
//    public void testDerive50() {
//        String rule = "derive value: trim(name) as: 'cate_if'";
//        Dataset resultDF = metisService.transform(getRuleSet(rule), true).getResultSet();
//        resultDF.show();
//        assertEquals("Ferrari", resultDF.select("cate_if").as(Encoders.STRING()).first());
//    }
//
//    @Test
//    public void testDerive51() {
//        String rule = "derive value: math.pow(speed, 3) as: 'cate_if'";
//        Dataset resultDF = metisService.transform(getRuleSet(rule), true).getResultSet();
//        resultDF.show();
//        String result = String.valueOf(resultDF.select("cate_if").as(Encoders.STRING()).first()).substring(0,6);
//        assertEquals("1.7373", result);
//    }
//

  // some testcases were deleted, as ConditionExpr's argument count became to be 1 or 3
  // if needed, compare to twinkle's testcases

  @Test
  public void testDerive55() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(name == 'Ferrari', itemNo, speed) as: 'name'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals(new Long(1), newDf.rows.get(0).get("name_1"));  // Ferrari, 1, 259
    assertEquals(null,        newDf.rows.get(5).get("name_1"));  // null, 6, null
  }

  @Test
  public void testDerive56() throws IOException, TeddyException {
    DataFrame null_contained = newNullContainedDataFrame();
    String ruleString ="derive value: if(speed>=300, 'Yes', 'No') as: 'name'";
    DataFrame newDf = apply_rule(null_contained, ruleString);
    newDf.show();

    assertEquals("No",  newDf.rows.get(0).get("name_1"));  // 259
    assertEquals("Yes", newDf.rows.get(4).get("name_1"));  // 355
    assertEquals("No",  newDf.rows.get(5).get("name_1"));  // null
  }
}
