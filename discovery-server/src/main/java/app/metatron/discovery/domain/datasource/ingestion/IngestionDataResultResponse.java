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

package app.metatron.discovery.domain.datasource.ingestion;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.FileValidationResponse;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class IngestionDataResultResponse implements Serializable {

  protected List<Field> fields;

  protected List<Map<String,Object>> data;

  protected long totalRows;

  // Use this on file ingestion preview
  protected FileValidationResponse isParsable;

  public IngestionDataResultResponse() {
    // Empty Constructor
  }

  public IngestionDataResultResponse(List<Field> fields, List<Map<String, Object>> data) {
    this.fields = fields;
    this.data = data;
    this.totalRows = 0;
  }

  public IngestionDataResultResponse(List<Field> fields, List<Map<String, Object>> data, long totalRows) {
    this.fields = fields;
    this.data = data;
    this.totalRows = totalRows;
  }

  public IngestionDataResultResponse(List<Field> fields, List<Map<String, Object>> data, long totalRows, FileValidationResponse isParsable) {
    this.fields = fields;
    this.data = data;
    this.totalRows = totalRows;
    this.isParsable = isParsable;
  }

  public IngestionDataResultResponse(List<Field> fields, List<Map<String, Object>> data, FileValidationResponse isParsable) {
    this.fields = fields;
    this.data = data;
    this.totalRows = 0;
    this.isParsable = isParsable;
  }

  public List<Field> getFields() {
    return fields;
  }

  public void setFields(List<Field> fields) {
    this.fields = fields;
  }

  public List<Map<String, Object>> getData() {
    return data;
  }

  public void setData(List<Map<String, Object>> data) {
    this.data = data;
  }

  public long getTotalRows() {
    return totalRows;
  }

  public void setTotalRows(long totalRows) {
    this.totalRows = totalRows;
  }

  public FileValidationResponse getIsParsable() {
    return isParsable;
  }

  public void setIsParsable(FileValidationResponse isParsable) {
    this.isParsable = isParsable;
  }

  @Override
  public String toString() {
    return "QueryResultSet{" +
            "fields=" + fields +
            ", data=" + data +
            ", totalRows=" + totalRows +
            '}';
  }
}
