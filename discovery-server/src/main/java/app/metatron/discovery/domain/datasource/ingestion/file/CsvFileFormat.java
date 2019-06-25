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

package app.metatron.discovery.domain.datasource.ingestion.file;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeName;

/**
 * Created by kyungtaak on 2017. 4. 30..
 */
@JsonTypeName("csv")
public class CsvFileFormat implements FileFormat {

  public static final String DEFAULT_DELIMITER = ",";

  public static final String DEFAULT_LINE_SEPARATOR = "\n";

  String delimiter = DEFAULT_DELIMITER;

  String lineSeparator = DEFAULT_LINE_SEPARATOR;

  public CsvFileFormat() {
  }

  public CsvFileFormat(String delimiter, String lineSeparator) {
    this.delimiter = delimiter;
    this.lineSeparator = lineSeparator;
  }

  @Override
  public String getInputFormat() {
    return null;
  }

  @JsonIgnore
  public boolean isDefaultCsvMode() {
    return DEFAULT_DELIMITER.equals(delimiter)
        && DEFAULT_LINE_SEPARATOR.equals(lineSeparator)
        ? true : false;
  }

  public String getDelimiter() {
    return delimiter;
  }

  public void setDelimiter(String delimiter) {
    this.delimiter = delimiter;
  }

  public String getLineSeparator() {
    return lineSeparator;
  }

  public void setLineSeparator(String lineSeparator) {
    this.lineSeparator = lineSeparator;
  }
}
