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
import java.io.IOException;

public class CsvProcessorTest {

  @Test
  public void getData() throws IOException {
    File noHeaderfile1 = new File("./src/test/resources/ingestion/sample_ingestion.csv");
    System.out.println(new CsvProcessor(noHeaderfile1).getData("\n", ",", 2, false));

    File noHeaderfile2 = new File("./src/main/resources/samples/sales_join_category.csv");
    System.out.println(new CsvProcessor(noHeaderfile2).getData("\n", ",", 2, false));

    File headerfile = new File("./src/test/resources/ingestion/sample_ingestion_header.csv");
    System.out.println(new CsvProcessor(headerfile).getData("\n", ",", 2, true));

  }

}
