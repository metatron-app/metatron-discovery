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

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;

import java.io.*;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TeddyTest {
    public static Map<String, List<String[]>> grids = new HashMap<>();
    static int limitRowCnt = 10000;

    static String getResourcePath(String relPath, boolean fromHdfs) {
        if (fromHdfs) {
            throw new IllegalArgumentException("HDFS not supported yet");
        }
        URL url = DataFrameTest.class.getClassLoader().getResource(relPath);
        return (new File(url.getFile())).getAbsolutePath();
    }

    private static String getResourcePath(String relPath) {
        return getResourcePath(relPath, false);
    }

    static public List<String[]> loadGridCsv(String alias, String path) {
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

    static DataFrame prepare_sample(DataFrame df) throws TeddyException {
        List<String> ruleStrings = new ArrayList<>();

        ruleStrings.add("header rownum: 1");
        ruleStrings.add("settype col: itemNo type: long");
        ruleStrings.add("settype col: speed type: long");
        ruleStrings.add("settype col: weight type: double");

        return apply_rules(df, ruleStrings);
    }

    static DataFrame prepare_null_contained(DataFrame df) throws TeddyException {
        List<String> ruleStrings = new ArrayList<>();

        ruleStrings.add("header rownum: 1");
        ruleStrings.add("set col: itemNo value: if(itemNo=='NULL', null, itemNo)");
        ruleStrings.add("set col: name value: if(name=='NULL', null, name)");
        ruleStrings.add("set col: speed value: if(speed=='NULL', null, speed)");

        ruleStrings.add("settype col: itemNo type: long");
        ruleStrings.add("settype col: speed type: long");
        ruleStrings.add("settype col: weight type: long");

        return apply_rules(df, ruleStrings);
//    df.objGrid.get(1).set("itemNo", null);
//    return df;
    }

    static DataFrame prepare_multi(DataFrame multi) throws TeddyException {
        List<String> ruleStrings = new ArrayList<>();
        ruleStrings.add("header rownum: 1");
        ruleStrings.add("settype col: measure type: long");
        return apply_rules(multi, ruleStrings);
    }

    static DataFrame prepare_crime(DataFrame crime) throws TeddyException {
        List<String> ruleStrings = new ArrayList<>();
        ruleStrings.add("header rownum: 1");
        return apply_rules(crime, ruleStrings);
    }

    static DataFrame prepare_crime_more(DataFrame crime) throws TeddyException {
        List<String> ruleStrings = new ArrayList<>();
        ruleStrings.add("replace col: column3, column4, column5, column6, column7, column8, column9, column10, column11, column13, column12 with: '' on: /_$/ global: true");
        ruleStrings.add("replace col: column3, column4, column5, column7, column6, column8, column9, column10, column11, column12, column13 with: ' ' on: '_' global: true");
        ruleStrings.add("header rownum: 1");
        ruleStrings.add("replace col: Population, `Total Crime`, `Violent Crime`, `Property Crime`, Murder, `Forcible Rape`, Robbery, `Aggravated Assault`, Burglary, `Larceny Theft`, `Vehicle Theft` with: '' on: ',' global: true");
        ruleStrings.add("replace col: Population, `Total Crime`, `Violent Crime`, `Property Crime`, Murder, `Forcible Rape`, Robbery, `Aggravated Assault`, Burglary, `Larceny Theft`, `Vehicle Theft` with: '' on: ' ' global: true");
        return apply_rules(crime, ruleStrings);
    }

    static DataFrame prepare_timestamp(DataFrame dataFrame) throws TeddyException {
        List<String> ruleStrings = new ArrayList<>();
        ruleStrings.add("header rownum: 1");
        return apply_rules(dataFrame, ruleStrings);
    }

    static DataFrame prepare_timestamp2(DataFrame dataFrame) throws TeddyException {
        List<String> ruleStrings = new ArrayList<>();
        ruleStrings.add("header rownum: 1");
        ruleStrings.add("settype col: birth_date type: timestamp format: 'MM.dd.yyyy HH:mm:ss'");
        ruleStrings.add("set col: memo value: if(memo=='null', null, memo)");

        return apply_rules(dataFrame, ruleStrings);
    }

    static DataFrame prepare_sale(DataFrame sale) throws TeddyException {
        List<String> ruleStrings = new ArrayList<>();
//    ruleStrings.add("rename col: column2 to: 'category'");
//    ruleStrings.add("rename col: column3 to: 'city'");
        ruleStrings.add("rename col: column14 to: 'state'");
//    ruleStrings.add("rename col: column15 to: 'product'");
        ruleStrings.add("rename col: column24 to: 'quantity'");
        ruleStrings.add("settype col: quantity type: long");
        ruleStrings.add("rename col: column25 to: 'price'");
        ruleStrings.add("settype col: price type: long");
//    ruleStrings.add("sort order: price type: 'desc'");
        return apply_rules(sale, ruleStrings);
    }

    static DataFrame prepare_contract(DataFrame contract) throws TeddyException {
        List<String> ruleStrings = new ArrayList<>();
        ruleStrings.add("rename col: column8, column2, column3, column4, column5, column6, column7 to: 'cdate', 'pcode1', 'pcode2', 'pcode3', 'pcode4', 'customer_id', 'detail_store_code'");
        ruleStrings.add("drop col: column1");

        ruleStrings.add("settype col: pcode1 type: long");
        ruleStrings.add("settype col: pcode2 type: long");
        ruleStrings.add("settype col: pcode3 type: long");
        ruleStrings.add("settype col: pcode4 type: long");
        ruleStrings.add("settype col: detail_store_code type: long");

        return apply_rules(contract, ruleStrings);
    }

    static DataFrame prepare_product(DataFrame product) throws TeddyException {
        List<String> ruleStrings = new ArrayList<>();
        ruleStrings.add("rename col: column1, column2, column3, column4, column5 to: 'pcode1', 'pcode2', 'pcode3', 'pcode4', 'pcode'");
        ruleStrings.add("settype col: pcode1 type: long");
        ruleStrings.add("settype col: pcode2 type: long");
        ruleStrings.add("settype col: pcode3 type: long");
        ruleStrings.add("settype col: pcode4 type: long");

        return apply_rules(product, ruleStrings);
    }

    static DataFrame prepare_store(DataFrame store) throws TeddyException {
        List<String> ruleStrings = new ArrayList<>();
        ruleStrings.add("header rownum: 1");
        ruleStrings.add("settype col: detail_store_code type: long");
        return apply_rules(store, ruleStrings);
    }

    static DataFrame apply_rule(DataFrame df, String ruleString) throws TeddyException {
        DataFrameService dataFrameService = new DataFrameService();

        df = dataFrameService.applyRule(df, ruleString, null, 2, 60);

        return df;
    }

    static DataFrame apply_rule(DataFrame df, String ruleString, List<DataFrame> slaveDFs) throws TeddyException {
        DataFrameService dataFrameService = new DataFrameService();

        df = dataFrameService.applyRule(df, ruleString, slaveDFs, 2, 60);

        return df;
    }

    static DataFrame apply_rules(DataFrame df, List<String> ruleStrings) throws TeddyException {
        DataFrameService dataFrameService = new DataFrameService();

        for (String ruleString : ruleStrings) {
            df = dataFrameService.applyRule(df, ruleString, null, 2, 60);
        }
        return df;
    }
}
