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

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.BatchIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.LinkIngestionInfo;
import app.metatron.discovery.domain.datasource.ingestion.jdbc.SingleIngestionInfo;

/**
 * Created by kyungtaak on 2016. 7. 15..
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXTERNAL_PROPERTY, property = "type")
@JsonSubTypes({
    @JsonSubTypes.Type(value = LinkIngestionInfo.class, name = "link"),
    @JsonSubTypes.Type(value = SingleIngestionInfo.class, name = "single"),
    @JsonSubTypes.Type(value = BatchIngestionInfo.class, name = "batch"),
    @JsonSubTypes.Type(value = RealtimeIngestionInfo.class, name = "realtime"),
    @JsonSubTypes.Type(value = LocalFileIngestionInfo.class, name = "local"),
    @JsonSubTypes.Type(value = HdfsIngestionInfo.class, name = "hdfs"),
    @JsonSubTypes.Type(value = HiveIngestionInfo.class, name = "hive")
})
public interface IngestionInfo {

  FileFormat getFormat();

  Boolean getRollup();

  Map<String, Object> getTuningOptions();

  List<String> getIntervals();

  /**
   * Use when you want to change the ingestion spec.
   *
   * @param ingestionInfo
   */
  void update(IngestionInfo ingestionInfo);
}
