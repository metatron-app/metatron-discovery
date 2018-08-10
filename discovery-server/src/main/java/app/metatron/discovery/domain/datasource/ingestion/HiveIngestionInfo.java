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

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;

/**
 * Hive 적재 정보
 */
public class HiveIngestionInfo implements IngestionInfo {

  public final static String KEY_HIVE_METASTORE="metatron.hive.metastoreUri";
  public final static String KEY_ORC_SCHEMA="metatron.hive.orcSchema";

  /**
   * 테이블 포맷
   */
  FileFormat format;

  /**
   * 대상 테이블 명
   * [schema].[table]
   *
   */
  String source;

  /**
   * 대상 파티션 지정
   *
   * [{"column name1" : "partition value", "column name2" : "partition value"...},
   * {"column name1" : "partition value", "column name2" : "partition value"...}]
   */
  List<Map<String, Object>> partitions;

  /**
   * MR Job Option, 기본값 override
   */
  Map<String, Object> jobProperties;

  /**
   * Tuning Config 지정, 기본값 override
   */
  Map<String, Object> tuningOptions;

  /**
   * Context 값 처리
   */
  Map<String, Object> context;

  /**
   * Granularity Intervals
   */
  List<String> intervals;

  /**
   * Rollup 여부
   */
  Boolean rollup;

  /**
   * 대상 테이블 ORC 포맷 스키마 정보(optional)
   */
  @JsonIgnore
  String typeString;


  @JsonCreator
  public HiveIngestionInfo(
      @JsonProperty("format") FileFormat format,
      @JsonProperty("source") String source,
      @JsonProperty("partitions") List<Map<String, Object>> partitions,
      @JsonProperty("jobProperties") Map<String, Object> jobProperties,
      @JsonProperty("tuningOptions") Map<String, Object> tuningOptions,
      @JsonProperty("intervals") List<String> intervals,
      @JsonProperty("context") Map<String, Object> context) {
    this.format = format;
    this.source = source;
    this.partitions = partitions;
    this.jobProperties = jobProperties;
    this.tuningOptions = tuningOptions;
    this.intervals = intervals;
    this.context = context;
  }

  @JsonIgnore
  public <T> T getContextValue(String key) {
    if(context == null) {
      return null;
    }

    return (T) context.get(key);
  }

  @Override
  public FileFormat getFormat() {
    return format;
  }

  public String getSource() {
    return source;
  }

  public List<Map<String, Object>> getPartitions() {
    return partitions;
  }

  public Map<String, Object> getJobProperties() {
    return jobProperties;
  }

  public Map<String, Object> getTuningOptions() {
    return tuningOptions;
  }

  public Map<String, Object> getContext() {
    return context;
  }

  public List<String> getIntervals() {
    return intervals;
  }

  @Override
  public Boolean getRollup() {
    return rollup;
  }

  public void setRollup(Boolean rollup) {
    this.rollup = rollup;
  }

  public String getTypeString() {
    return typeString;
  }

  public void setTypeString(String typeString) {
    this.typeString = typeString;
  }
}
