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

  Integer csvMaxCharsPerColumn;

  private static int MAX_CSV_COLUMNS = 2048;

  public CsvTemplate(File targetFile) {
    this.targetFile = targetFile;
  }

  public Integer getCsvMaxCharsPerColumn() {
    return csvMaxCharsPerColumn;
  }

  public void setCsvMaxCharsPerColumn(Integer csvMaxCharsPerColumn) {
    this.csvMaxCharsPerColumn = csvMaxCharsPerColumn;
  }

  public <T> List<T> getRows(String lineSep, String delimiter, CsvRowMapper<T> rowMapper) {
    return getRows(lineSep, delimiter, rowMapper, -1);
  }

  public <T> List<T> getRows(String lineSep, String delimiter, CsvRowMapper<T> rowMapper, int limit) {
    CsvParserSettings settings = new CsvParserSettings();
    settings.getFormat().setLineSeparator(lineSep);
    settings.getFormat().setDelimiter(delimiter.charAt(0));
    if(csvMaxCharsPerColumn != null && csvMaxCharsPerColumn > 0){
      settings.setMaxCharsPerColumn(csvMaxCharsPerColumn);
    }
    settings.setMaxColumns(MAX_CSV_COLUMNS);

    RowListProcessor rowProcessor = new RowListProcessor();
    settings.setProcessor(rowProcessor);

    CsvParser parser = new CsvParser(settings);
    parser.beginParsing(targetFile);

    List<T> rows = new ArrayList<>();
    String[] row;

    int rowNumber = 1;
    while ((row = parser.parseNext()) != null) {
      if((rowNumber - 1) == limit) {
        break;
      }

      T mappedRow = rowMapper.mapRow(rowNumber, row);

      if(mappedRow != null) {
        rows.add(rowMapper.mapRow(rowNumber, row));
      }
      rowNumber++;
    }
    parser.stopParsing();

    return rows;
  }

  public int getTotalRows(String lineSep, String delimiter) {
    CsvParserSettings settings = new CsvParserSettings();
    settings.getFormat().setLineSeparator(lineSep);
    settings.getFormat().setDelimiter(delimiter.charAt(0));
    if(csvMaxCharsPerColumn != null && csvMaxCharsPerColumn > 0){
      settings.setMaxCharsPerColumn(csvMaxCharsPerColumn);
    }
    settings.setMaxColumns(MAX_CSV_COLUMNS);

    long totalCount = new CsvRoutines(settings).getInputDimension(targetFile).rowCount();
    return Long.valueOf(totalCount).intValue() + 1;
  }

}
