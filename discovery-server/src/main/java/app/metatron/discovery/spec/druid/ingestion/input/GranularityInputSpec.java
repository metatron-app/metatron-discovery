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

package app.metatron.discovery.spec.druid.ingestion.input;

import javax.validation.constraints.NotNull;

/**
 * Created by kyungtaak on 2016. 6. 18..
 */
public class GranularityInputSpec {

  @NotNull // Pattern 체크도?
  String dataGranularity;

  @NotNull
  String inputPath;

  @NotNull
  String filePattern;

  String pathFormat;

  public GranularityInputSpec() {
  }

  public GranularityInputSpec(String dataGranularity, String inputPath, String filePattern) {
    this.dataGranularity = dataGranularity;
    this.inputPath = inputPath;
    this.filePattern = filePattern;
  }

  public GranularityInputSpec(String dataGranularity, String inputPath, String filePattern, String pathFormat) {
    this.dataGranularity = dataGranularity;
    this.inputPath = inputPath;
    this.filePattern = filePattern;
    this.pathFormat = pathFormat;
  }

  public String getDataGranularity() {
    return dataGranularity;
  }

  public void setDataGranularity(String dataGranularity) {
    this.dataGranularity = dataGranularity;
  }

  public String getInputPath() {
    return inputPath;
  }

  public void setInputPath(String inputPath) {
    this.inputPath = inputPath;
  }

  public String getFilePattern() {
    return filePattern;
  }

  public void setFilePattern(String filePattern) {
    this.filePattern = filePattern;
  }

  public String getPathFormat() {
    return pathFormat;
  }

  public void setPathFormat(String pathFormat) {
    this.pathFormat = pathFormat;
  }
}
