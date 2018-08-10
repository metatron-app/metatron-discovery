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

package app.metatron.discovery.util;

import org.junit.Test;

import java.io.File;

public class ExcelProcessorTest {

  @Test
  public void getSheetNames() throws Exception {
    File noHeaderFile = new File("./src/test/resources/ingestion/sample_ingestion_noheader.xlsx");
    System.out.println(new ExcelProcessor(noHeaderFile).getSheetNames());
  }

  @Test
  public void getSheetData() throws Exception {
    File noHeaderFile = new File("./src/test/resources/ingestion/sample_ingestion_noheader.xlsx");
    System.out.println(new ExcelProcessor(noHeaderFile).getSheetData("sample_ingestion1", 5, false));

    File normalFile = new File("./src/test/resources/ingestion/sample_ingestion.xlsx");
    System.out.println(new ExcelProcessor(normalFile).getSheetData("sample_ingestion1", 5, true));

    File mergeColumnFile = new File("./src/test/resources/ingestion/sample_ingestion_merged_column.xlsx");
    System.out.println(new ExcelProcessor(mergeColumnFile).getSheetData("sample_ingestion1", 5, true));

    File mergeColumnFile1 = new File("/Users/kyungtaak/Downloads/merge.xlsx");
    System.out.println(new ExcelProcessor(mergeColumnFile1).getSheetData("시트1", 5, true));
  }

}
