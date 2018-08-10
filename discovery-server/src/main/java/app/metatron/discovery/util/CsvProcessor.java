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

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.univocity.parsers.common.processor.BeanWriterProcessor;
import com.univocity.parsers.common.processor.RowListProcessor;
import com.univocity.parsers.csv.CsvParser;
import com.univocity.parsers.csv.CsvParserSettings;
import com.univocity.parsers.csv.CsvRoutines;
import com.univocity.parsers.csv.CsvWriter;
import com.univocity.parsers.csv.CsvWriterSettings;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.ingestion.IngestionDataResultResponse;

public class CsvProcessor {

  File targetFile;

  public CsvProcessor() {

  }

  public CsvProcessor(File targetFile) throws IOException {
    this.targetFile = targetFile;
  }

  public IngestionDataResultResponse getData(String lineSep, String delimiter, int limit, boolean firstHeaderRow) throws IOException {

    List<Field> fields = Lists.newArrayList();
    List<Map<String, Object>> resultSet = Lists.newArrayList();

    CsvParserSettings settings = new CsvParserSettings();
    settings.getFormat().setLineSeparator(lineSep);
    settings.getFormat().setDelimiter(delimiter.charAt(0));
    settings.setHeaderExtractionEnabled(firstHeaderRow);

    RowListProcessor rowProcessor = new RowListProcessor();
    settings.setProcessor(rowProcessor);

    CsvParser parser = new CsvParser(settings);

    parser.beginParsing(targetFile);
    String[] headers = parser.getContext().headers();
    String[] row;
    int i = 0;
    while ((row = parser.parseNext()) != null) {
      if(i == limit) {
        break;
      }

      // 헤더가 없는 경우
      if(headers == null && i == 0) {
        headers = makeHeader(row.length);
      }

      Map<String, Object> resultRow = Maps.newLinkedHashMap();
      for(int j = 0; j<headers.length; j++) {
        resultRow.put(headers[j], row[j]);
      }
      resultSet.add(resultRow);
      i++;
    }
    parser.stopParsing();

    long totalCount = new CsvRoutines(settings).getInputDimension(targetFile).rowCount();
    if(!firstHeaderRow) { // 라이브러리 버그로 추정됨, 헤더가 없을경우 총라인의 -1 로 값이 나와 이를 보완
      totalCount++;
    }

    return new IngestionDataResultResponse(makeField(Lists.newArrayList(headers)), resultSet, totalCount);
  }

  private List<Field> makeField(List<String> headers) {
    List<Field> fields = Lists.newArrayList();
    for(int i = 0; i<headers.size(); i++) {
      fields.add(new Field(headers.get(i), DataType.STRING, i + 1));
    }
    return fields;
  }

  private String[] makeHeader(int columnCount) {
    List<String> columnNames = Lists.newArrayList();
    for(int i = 0; i<columnCount; i++) {
      columnNames.add("Col_" + (i + 1));
    }
    return columnNames.toArray(new String[0]);
  }

  public static <T> void writeBeans(String filePath, CsvWriterSettings csvWriterSettings, Iterable<T> records, Class<T> cls) throws FileNotFoundException{
    BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(filePath));

    csvWriterSettings.setRowWriterProcessor(new BeanWriterProcessor<T>(cls));

    CsvWriter csvWriter = new CsvWriter(bos, csvWriterSettings);
    csvWriter.writeHeaders();
    csvWriter.processRecords(records);
    csvWriter.close();
  }

}
