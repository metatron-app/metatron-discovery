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

import org.apache.commons.lang3.StringUtils;

import java.util.List;
import java.util.Map;

/**
 * Created by kyungtaak on 2017. 3. 20..
 */
public class HiveInputSpec implements InputSpec {
  /**
   * schema.table 형태
   */
  String source;

  /**
   * thrift 서버 URL
   */
  String metastoreUri;

  /**
   * Partition 지정
   */
  List<Map<String, Object>> partialPartitionList;

  /**
   * Map Job 대상 테이블 Split 사이즈 지정, 기본값 512M
   */
  String splitSize;

  public HiveInputSpec() {
  }

  public HiveInputSpec(String source, String metastoreUri, List<Map<String, Object>> partialPartitionList, String splitSize) {
    this.source = source;
    this.metastoreUri = metastoreUri;
    this.partialPartitionList = partialPartitionList;

    if(StringUtils.isEmpty(splitSize) || !splitSize.matches("[1-9][0-9]*(M|G)")) {
      this.splitSize = "512M";
    } else {
      this.splitSize = splitSize;
    }
  }

  public String getSource() {
    return source;
  }

  public void setSource(String source) {
    this.source = source;
  }

  public String getMetastoreUri() {
    return metastoreUri;
  }

  public void setMetastoreUri(String metastoreUri) {
    this.metastoreUri = metastoreUri;
  }

  public List<Map<String, Object>> getPartialPartitionList() {
    return partialPartitionList;
  }

  public void setPartialPartitionList(List<Map<String, Object>> partialPartitionList) {
    this.partialPartitionList = partialPartitionList;
  }

  public String getSplitSize() {
    return splitSize;
  }

  public void setSplitSize(String splitSize) {
    this.splitSize = splitSize;
  }
}
