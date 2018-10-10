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

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.io.Serializable;

/**
 * File Format Spec.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = CsvFileFormat.class, name = "csv"),
    @JsonSubTypes.Type(value = ExcelFileFormat.class, name = "excel"),
    @JsonSubTypes.Type(value = JsonFileFormat.class, name = "json"),
    @JsonSubTypes.Type(value = OrcFileFormat.class, name = "orc"),
    @JsonSubTypes.Type(value = ParquetFileFormat.class, name = "parquet")
})
public interface FileFormat extends Serializable {
  String getInputFormat();
}
