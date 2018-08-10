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
 * Created by kyungtaak on 2016. 6. 17..
 */
public class CsvParseSpec extends TimeAndDimsParseSpec implements ParseSpec {

  String listDelimiter;

  List<String> columns;

  public CsvParseSpec() {
  }

  public CsvParseSpec(DimensionsSpec dimensionsSpec, TimestampSpec timestampSpec, List<String> columns) {
    super(dimensionsSpec, timestampSpec);
    this.columns = columns;
  }

  public CsvParseSpec(DimensionsSpec dimensionsSpec, TimestampSpec timestampSpec, String listDelimiter, List<String> columns) {
    super(dimensionsSpec, timestampSpec);
    this.listDelimiter = listDelimiter;
    this.columns = columns;
  }

  public DimensionsSpec getDimensionsSpec() {
    return dimensionsSpec;
  }

  public void setDimensionsSpec(DimensionsSpec dimensionsSpec) {
    this.dimensionsSpec = dimensionsSpec;
  }

  public TimestampSpec getTimestampSpec() {
    return timestampSpec;
  }

  public void setTimestampSpec(TimestampSpec timestampSpec) {
    this.timestampSpec = timestampSpec;
  }

  public String getListDelimiter() {
    return listDelimiter;
  }

  public void setListDelimiter(String listDelimiter) {
    this.listDelimiter = listDelimiter;
  }

  public List<String> getColumns() {
    return columns;
  }

  public void setColumns(List<String> columns) {
    this.columns = columns;
  }
}
