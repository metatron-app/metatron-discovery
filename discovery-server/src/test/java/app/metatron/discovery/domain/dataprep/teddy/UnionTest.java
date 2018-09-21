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
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;

import static org.junit.Assert.assertEquals;

public class UnionTest {

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
        loadGridCsv("sample", "teddy/sample.csv");
        loadGridCsv("null_contained", "teddy/null_contained.csv");
    }

    @Test
    public void testUnion1() throws IOException, TeddyException {
        DataFrame store1 = new DataFrame();
        store1.setByGrid(grids.get("store1"), null);
        store1 = DataFrameTest.prepare_store(store1);
        store1.show();

        DataFrame store2 = new DataFrame();
        store2.setByGrid(grids.get("store2"), null);
        store2 = DataFrameTest.prepare_store(store2);
        store2.show();

        DataFrame store3 = new DataFrame();
        store3.setByGrid(grids.get("store3"), null);
        store3 = DataFrameTest.prepare_store(store3);
        store3.show();

        String ruleString = "union masterCol: customer_id, detail_store_name dataset2: 'store2'";
        Rule rule = new RuleVisitorParser().parse(ruleString);
        List<String> slaveDsIds = DataFrameService.getSlaveDsIds(ruleString);
        List<DataFrame> slaveLastDfs = new ArrayList<>();
        slaveLastDfs.add(store2);
        slaveLastDfs.add(store3);

        DataFrame newDf = store1.union(slaveLastDfs, 10000);

        newDf.show();

        assertEquals("한성대학교(출)", newDf.rows.get(3000).get("detail_store_name"));   // 1
        assertEquals("사당역", newDf.rows.get(6000).get("detail_store_name"));   // null
    }
}
