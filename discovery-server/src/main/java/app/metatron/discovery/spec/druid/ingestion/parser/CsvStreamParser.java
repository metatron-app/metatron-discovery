/*
 *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *      http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package app.metatron.discovery.spec.druid.ingestion.parser;

import com.fasterxml.jackson.annotation.JsonRawValue;

import java.util.List;

public class CsvStreamParser implements Parser {

  TimestampSpec timestampSpec;

  DimensionsSpec dimensionsSpec;

  List<String> columns;

  @JsonRawValue
  String delimiter;

  Character quoteCharacter;

  Character escapeCharacter;

  @JsonRawValue
  String recordSeparator;

  String nullString;

  Boolean skipHeaderRecord;

  Boolean ignoreSurroundingSpaces;

  Boolean ignoreHeaderCase;

  String charset;

  public CsvStreamParser() {
  }

  public CsvStreamParser(TimestampSpec timestampSpec, DimensionsSpec dimensionsSpec, List<String> columns) {
    this.timestampSpec = timestampSpec;
    this.dimensionsSpec = dimensionsSpec;
    this.columns = columns;
  }

  public CsvStreamParser(TimestampSpec timestampSpec, DimensionsSpec dimensionsSpec, List<String> columns, Boolean skipHeaderRecord) {
    this.timestampSpec = timestampSpec;
    this.dimensionsSpec = dimensionsSpec;
    this.columns = columns;
    this.skipHeaderRecord = skipHeaderRecord;
  }

  public TimestampSpec getTimestampSpec() {
    return timestampSpec;
  }

  public void setTimestampSpec(TimestampSpec timestampSpec) {
    this.timestampSpec = timestampSpec;
  }

  public DimensionsSpec getDimensionsSpec() {
    return dimensionsSpec;
  }

  public void setDimensionsSpec(DimensionsSpec dimensionsSpec) {
    this.dimensionsSpec = dimensionsSpec;
  }

  public List<String> getColumns() {
    return columns;
  }

  public void setColumns(List<String> columns) {
    this.columns = columns;
  }

  public String getDelimiter() {
    return delimiter;
  }

  public void setDelimiter(String delimiter) {
    if (!delimiter.startsWith("\"")){
      this.delimiter = "\"" + delimiter + "\"";
    } else {
      this.delimiter = delimiter;
    }
  }

  public Character getQuoteCharacter() {
    return quoteCharacter;
  }

  public void setQuoteCharacter(Character quoteCharacter) {
    this.quoteCharacter = quoteCharacter;
  }

  public Character getEscapeCharacter() {
    return escapeCharacter;
  }

  public void setEscapeCharacter(Character escapeCharacter) {
    this.escapeCharacter = escapeCharacter;
  }

  public String getRecordSeparator() {
    return recordSeparator;
  }

  public void setRecordSeparator(String recordSeparator) {
    if (!recordSeparator.startsWith("\"")){
      this.recordSeparator = "\"" + recordSeparator + "\"";
    } else {
      this.recordSeparator = recordSeparator;
    }
  }

  public String getNullString() {
    return nullString;
  }

  public void setNullString(String nullString) {
    this.nullString = nullString;
  }

  public Boolean getSkipHeaderRecord() {
    return skipHeaderRecord;
  }

  public void setSkipHeaderRecord(Boolean skipHeaderRecord) {
    this.skipHeaderRecord = skipHeaderRecord;
  }

  public Boolean getIgnoreSurroundingSpaces() {
    return ignoreSurroundingSpaces;
  }

  public void setIgnoreSurroundingSpaces(Boolean ignoreSurroundingSpaces) {
    this.ignoreSurroundingSpaces = ignoreSurroundingSpaces;
  }

  public Boolean getIgnoreHeaderCase() {
    return ignoreHeaderCase;
  }

  public void setIgnoreHeaderCase(Boolean ignoreHeaderCase) {
    this.ignoreHeaderCase = ignoreHeaderCase;
  }

  public String getCharset() {
    return charset;
  }

  public void setCharset(String charset) {
    this.charset = charset;
  }
}