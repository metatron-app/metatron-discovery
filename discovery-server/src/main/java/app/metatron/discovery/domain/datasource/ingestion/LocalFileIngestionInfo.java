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

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.Map;

import app.metatron.discovery.domain.datasource.ingestion.file.FileFormat;

/**
 * Created by kyungtaak on 2017. 4. 30..
 */
@JsonTypeName("local")
public class LocalFileIngestionInfo implements IngestionInfo {

  String path;

  String originalFileName;

  Boolean removeFirstRow = false;

  FileFormat format;

  /**
   * Rollup 여부
   */
  Boolean rollup;

  /**
   * Tuning Config 지정, 기본값 override
   */
  Map<String, Object> tuningOptions;

  public LocalFileIngestionInfo() {
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public String getOriginalFileName() {
    return originalFileName;
  }

  public void setOriginalFileName(String originalFileName) {
    this.originalFileName = originalFileName;
  }

  public Boolean getRemoveFirstRow() {
    return removeFirstRow;
  }

  public void setRemoveFirstRow(Boolean removeFirstRow) {
    this.removeFirstRow = removeFirstRow;
  }

  @Override
  public Boolean getRollup() {
    return rollup;
  }

  public void setRollup(Boolean rollup) {
    this.rollup = rollup;
  }

  public FileFormat getFormat() {
    return format;
  }

  public void setFormat(FileFormat format) {
    this.format = format;
  }

  @Override
  public Map<String, Object> getTuningOptions() {
    return tuningOptions;
  }

  public void setTuningOptions(Map<String, Object> tuningOptions) {
    this.tuningOptions = tuningOptions;
  }
}
