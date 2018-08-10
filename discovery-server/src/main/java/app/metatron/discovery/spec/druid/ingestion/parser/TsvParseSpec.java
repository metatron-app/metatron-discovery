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

package app.metatron.discovery.spec.druid.ingestion.parser;

import java.util.List;

/**
 * Created by kyungtaak on 2017. 3. 30..
 */
public class TsvParseSpec extends CsvParseSpec implements ParseSpec {

  String delimiter;

  public TsvParseSpec() {
  }

  public TsvParseSpec(DimensionsSpec dimensionsSpec, TimestampSpec timestampSpec, List<String> columns, String delimiter) {
    super(dimensionsSpec, timestampSpec, columns);
    this.delimiter = delimiter;
  }

  public String getDelimiter() {
    return delimiter;
  }

  public void setDelimiter(String delimiter) {
    this.delimiter = delimiter;
  }
}
