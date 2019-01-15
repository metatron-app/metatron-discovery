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
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.dataprep.teddy.exceptions.TeddyException;

public class UnstructuredTest extends  TeddyTest{

  @BeforeClass
  public static void setUp() throws Exception {
    loadGridCsv("unstructured", "teddy/unstructured.csv");
  }

  static private DataFrame prepare_unstructured(DataFrame unstructured) throws TeddyException {
    List<String> ruleStrings = new ArrayList<>();
    ruleStrings.add("header rownum: 1");
    ruleStrings.add("settype col: `GM 본사와 한국 정부` type: string");
    return apply_rules(unstructured, ruleStrings);
  }

  @Test
  public void test_unstructured() throws IOException, TeddyException {
    DataFrame unstructured = new DataFrame();
    unstructured.setByGrid(grids.get("unstructured"), null);
    unstructured = prepare_unstructured(unstructured);
    unstructured.show();
  }
}
