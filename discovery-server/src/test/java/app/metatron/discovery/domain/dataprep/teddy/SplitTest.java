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
import app.metatron.discovery.prep.parser.preparation.rule.Extract;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.Split;

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

public class SplitTest {
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

    static private List<String[]> loadGridCsv(String alias, String path) {
        List<String[]> grid = new ArrayList<>();

        BufferedReader br = null;
        String line;
        String cvsSplitBy = ",";

        try {
            br = new BufferedReader(new InputStreamReader(new FileInputStream(getResourcePath(path))));
            while ((line = br.readLine()) != null) {
                String[] strCols = line.split(cvsSplitBy);
                grid.add(strCols);
                if (grid.size() == limitRowCnt)
                    break;
            }
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            if (br != null) {
                try {
                    br.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        grids.put(alias, grid);
        return grid;
    }

    @BeforeClass
    public static void setUp() throws Exception {
        loadGridCsv("sample", "teddy/sample_split.csv");
    }

    private DataFrame newNullContainedDataFrame() throws IOException, TeddyException {
        DataFrame sample = new DataFrame();
        sample.setByGrid(grids.get("sample"), null);
        sample = DataFrameTest.prepare_null_contained(sample);
        sample.show();
        return sample;
    }

    @Test
    public void testSplit1() throws IOException, TeddyException {
        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse("split col: contract_date on: '-' limit: 10 quote: '\"' ignoreCase: true");
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("\"2017-01\"", newDf.rows.get(0).get("split_contract_date1"));   // 1

    }

    @Test
    public void testSplit2() throws IOException, TeddyException {
        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse("split col: contract_date on: '-' limit: 2 quote: '\"' ignoreCase: false");
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("\"2017-01\"", newDf.rows.get(0).get("split_contract_date1"));   // 1

    }

    @Test
    public void testSplit3() throws IOException, TeddyException {
        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse("split col: birth_date on: '-' limit: 1 ignoreCase: false");
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("2010", newDf.rows.get(0).get("split_birth_date1"));   // 1

    }

    @Test
    public void testSplit4() throws IOException, TeddyException {
        String ruleStr = "split col: birth_date on: '-' limit: 1 ignoreCase: false";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("2010", newDf.rows.get(0).get("split_birth_date1"));   // 1

    }

    @Test
    public void testSplit5() throws IOException, TeddyException {
        String ruleStr = "split col: contract_date on: '-' limit: 2 ignoreCase: false";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1

    }

    @Test
    public void testSplit6() throws IOException, TeddyException {
        String ruleStr = "split col: contract_date on: /-/ limit: 2 ignoreCase: false";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1

    }

    @Test
    public void testSplit7() throws IOException, TeddyException {
        String ruleStr = "split col: name on: 'e' limit: 3 ignoreCase: false";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("F", newDf.rows.get(0).get("split_name1"));   // 1

    }

    @Test
    public void testSplit8() throws IOException, TeddyException {
        String ruleStr = "split col: name on: 'E' limit: 2 ignoreCase: true";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("F", newDf.rows.get(0).get("split_name1"));   // 1

    }

    @Test
    public void testSplit9() throws IOException, TeddyException {
        String ruleStr = "split col: name on: 'ER' limit: 2 ignoreCase: false";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("Ferrari", newDf.rows.get(0).get("split_name1"));   // 1

    }

    @Test
    public void testSplit10() throws IOException, TeddyException {
        String ruleStr = "split col: name on: 'ER' limit: 2 ignoreCase: true";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("F", newDf.rows.get(0).get("split_name1"));   // 1

    }

    @Test
    public void testSplit11() throws IOException, TeddyException {
        String ruleStr = "split col: name on: 'ER'";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("Ferrari", newDf.rows.get(0).get("split_name1"));   // 1

    }

    @Test
    public void testSplit12() throws IOException, TeddyException {
        String ruleStr = "split col: name on: 'er' limit: 0";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("Ferrari", newDf.rows.get(0).get("split_name1"));   // 1

    }

    @Test
    public void testSplit13() throws IOException, TeddyException {
        String ruleStr = "split col: contract_date on: '-' limit: 2 ignoreCase: true";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1

    }

    @Test
    public void testSplit14() throws IOException, TeddyException {
        String ruleStr = "split col: contract_date on: '-' limit: 2 quote: '@|' ignoreCase: true";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("\"2017", newDf.rows.get(0).get("split_contract_date1"));   // 1

    }

    @Test
    public void testSplit15() throws IOException, TeddyException {
        String ruleStr = "split col: contract_date on: '-' limit: 7 quote: '\"' ignoreCase: true";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("\"2017-01\"", newDf.rows.get(0).get("split_contract_date1"));   // 1

    }

    @Test
    public void testSplit16() throws IOException, TeddyException {
        String ruleStr = "split col: name on: 'r' limit: 5 ignoreCase: true";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doSplit((Split) rule);
        newDf.show();

        assertEquals("Fe", newDf.rows.get(0).get("split_name1"));   // 1

    }

    @Test
    public void extractTest1() throws IOException, TeddyException {
        String ruleStr = "extract col: contract_date on: '-' quote: '\"' limit: 10";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doExtract((Extract) rule);
        newDf.show();

        assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1

    }

    @Test
    public void extractTest2() throws IOException, TeddyException {
        String ruleStr = "extract col: name on: /[a-zA-z]+/ quote: '\"' limit: 10";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doExtract((Extract) rule);
        newDf.show();

        assertEquals("Ferrari", newDf.rows.get(0).get("extract_name1"));   // 1

    }

    @Test
    public void extractTest3() throws IOException, TeddyException {
        String ruleStr = "extract col: contract_date on: '-' limit: 10";

        DataFrame null_contained = newNullContainedDataFrame();
        Rule rule = new RuleVisitorParser().parse(ruleStr);
        DataFrame newDf = null_contained.doExtract((Extract) rule);
        newDf.show();

        assertEquals("-", newDf.rows.get(0).get("extract_contract_date1"));   // 1

    }

}
