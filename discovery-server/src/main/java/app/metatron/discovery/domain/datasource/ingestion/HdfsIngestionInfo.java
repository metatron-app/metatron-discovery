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
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;

/**
 * Created by kyungtaak on 2017. 4. 30..
 */
@JsonTypeName("hdfs")
public class HdfsIngestionInfo implements IngestionInfo {

  List<String> paths;

  boolean findRecursive;

  FileFormat format;

  /**
   * Rollup 여부
   */
  Boolean rollup;

  /**
   * Intervals
   */
  List<String> intervals;

  /**
   * Specify Tuning Configuration, override default Value
   */
  Map<String, Object> tuningOptions;

  /**
   * Specify MR Job property, override default Value
   */
  Map<String, Object> jobProperties;

  public HdfsIngestionInfo() {
  }

  @JsonCreator
  public HdfsIngestionInfo(@JsonProperty("paths") List<String> paths,
                           @JsonProperty("findRecursive") boolean findRecursive,
                           @JsonProperty("format") FileFormat format,
                           @JsonProperty("rollup") Boolean rollup,
                           @JsonProperty("intervals") List<String> intervals,
                           @JsonProperty("tuningOptions") Map<String, Object> tuningOptions,
                           @JsonProperty("jobProperties") Map<String, Object> jobProperties) {
    this.paths = paths;
    this.findRecursive = findRecursive;
    this.format = format;
    this.rollup = rollup;
    this.intervals = intervals;
    this.tuningOptions = tuningOptions;
    this.jobProperties = jobProperties;
  }

  @Override
  public void update(IngestionInfo ingestionInfo) {
    // Not supported yet
  }

  public List<String> getPaths() {
    return paths;
  }

  public void setPaths(List<String> paths) {
    this.paths = paths;
  }

  public boolean isFindRecursive() {
    return findRecursive;
  }

  public void setFindRecursive(boolean findRecursive) {
    this.findRecursive = findRecursive;
  }

  public FileFormat getFormat() {
    return format;
  }

  public void setFormat(FileFormat format) {
    this.format = format;
  }

  @Override
  public Boolean getRollup() {
    return rollup;
  }

  public void setRollup(Boolean rollup) {
    this.rollup = rollup;
  }

  @Override
  public List<String> getIntervals() {
    return intervals;
  }

  public void setIntervals(List<String> intervals) {
    this.intervals = intervals;
  }

  public Map<String, Object> getTuningOptions() {
    return tuningOptions;
  }

  public void setTuningOptions(Map<String, Object> tuningOptions) {
    this.tuningOptions = tuningOptions;
  }

  public Map<String, Object> getJobProperties() {
    return jobProperties;
  }

  public void setJobProperties(Map<String, Object> jobProperties) {
    this.jobProperties = jobProperties;
  }
}
