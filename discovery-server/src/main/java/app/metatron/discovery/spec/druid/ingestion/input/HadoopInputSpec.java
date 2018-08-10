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

import com.google.common.collect.Lists;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

/**
 * Created by kyungtaak on 2017. 4. 30..
 */
public class HadoopInputSpec implements InputSpec {

  Boolean findRecursive = false;

  Boolean extractPartition = false;

  String inputFormat = "org.apache.hadoop.mapreduce.lib.input.TextInputFormat";

  String basePath;

  List<Element> elements;

  String splitSize;

  public HadoopInputSpec() {
  }

  public HadoopInputSpec(List<String> paths, Boolean findRecursive, String splitSize) {
    this(paths, findRecursive, splitSize, null);
  }

  public HadoopInputSpec(List<String> paths, Boolean findRecursive, String splitSize, String inputFormat) {
    if(CollectionUtils.isNotEmpty(paths)) {
      addPaths(paths.toArray(new String[paths.size()]));
    }

    this.findRecursive = findRecursive;

    if(StringUtils.isEmpty(splitSize) || !splitSize.matches("[1-9][0-9]*(M|G)")) {
      this.splitSize = "512M";
    } else {
      this.splitSize = splitSize;
    }

    if(inputFormat != null) {
      this.inputFormat = inputFormat;
    }
  }

  public void addPaths(String... paths) {
    if(elements == null) {
      elements = Lists.newArrayList();
    }

    for (String path : paths) {
      elements.add(new Element(path));
    }
  }

  public Boolean getFindRecursive() {
    return findRecursive;
  }

  public void setFindRecursive(Boolean findRecursive) {
    this.findRecursive = findRecursive;
  }

  public Boolean getExtractPartition() {
    return extractPartition;
  }

  public void setExtractPartition(Boolean extractPartition) {
    this.extractPartition = extractPartition;
  }

  public String getInputFormat() {
    return inputFormat;
  }

  public void setInputFormat(String inputFormat) {
    this.inputFormat = inputFormat;
  }

  public String getBasePath() {
    return basePath;
  }

  public void setBasePath(String basePath) {
    this.basePath = basePath;
  }

  public String getSplitSize() {
    return splitSize;
  }

  public void setSplitSize(String splitSize) {
    this.splitSize = splitSize;
  }

  public List<Element> getElements() {
    return elements;
  }

  public void setElements(List<Element> elements) {
    this.elements = elements;
  }

  static class Element {
    String paths;

    public Element() {
    }

    public Element(String paths) {
      this.paths = paths;
    }

    public String getPaths() {
      return paths;
    }

    public void setPaths(String paths) {
      this.paths = paths;
    }
  }
}
