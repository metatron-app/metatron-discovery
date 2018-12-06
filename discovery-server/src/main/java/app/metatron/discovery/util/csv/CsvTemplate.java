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

package app.metatron.discovery.util.csv;

import com.univocity.parsers.common.processor.RowListProcessor;
import com.univocity.parsers.csv.CsvParser;
import com.univocity.parsers.csv.CsvParserSettings;
import com.univocity.parsers.csv.CsvRoutines;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class CsvTemplate {

  private File targetFile;
  private CsvParserSettings csvParserSettings;

  public CsvTemplate(File targetFile, String lineSep, String delimiter) {
    this.targetFile = targetFile;

    CsvParserSettings settings = new CsvParserSettings();
    settings.getFormat().setLineSeparator(lineSep);
    settings.getFormat().setDelimiter(delimiter.charAt(0));

    RowListProcessor rowProcessor = new RowListProcessor();
    settings.setProcessor(rowProcessor);

    this.csvParserSettings = settings;
  }

  public <T> List<T> getRows(CsvRowMapper<T> rowMapper) {
    return getRows(rowMapper, -1);
  }

  public <T> List<T> getRows(CsvRowMapper<T> rowMapper, int limit) {
    CsvParser parser = new CsvParser(csvParserSettings);
    parser.beginParsing(targetFile);

    List<T> rows = new ArrayList<>();
    String[] row;

    int rowNumber = 1;
    while ((row = parser.parseNext()) != null) {
      if((rowNumber - 1) == limit) {
        break;
      }

      T mappedRow = rowMapper.mapRow(rowNumber, row);

      if (mappedRow != null) {
        rows.add(rowMapper.mapRow(rowNumber, row));
      }

      rowNumber++;
    }
    parser.stopParsing();

    return rows;
  }

  public int getTotalRows() {
    long totalCount = new CsvRoutines(csvParserSettings).getInputDimension(targetFile).rowCount();
    return Long.valueOf(totalCount).intValue() + 1;
  }
}
