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

package app.metatron.discovery.domain.datasource.connection.jdbc;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.ingestion.IngestionDataResultResponse;
import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;

/**
 * Created by kyungtaak on 2016. 6. 16..
 */
public class JdbcQueryResultResponse extends IngestionDataResultResponse {

  List<Field> partitionFields;

  FileFormat fileFormat;

  public JdbcQueryResultResponse() {
    // Empty Constructor
  }

  public JdbcQueryResultResponse(List<Field> fields, List<Map<String, Object>> data) {
    super.fields = fields;
    super.data = data;
    super.totalRows = 0;
  }

  public List<Field> getPartitionFields() {
    return partitionFields;
  }

  public void setPartitionFields(List<Field> partitionFields) {
    this.partitionFields = partitionFields;
  }

  public FileFormat getFileFormat() {
    return fileFormat;
  }

  public void setFileFormat(FileFormat fileFormat) {
    this.fileFormat = fileFormat;
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
