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

package app.metatron.discovery.domain.workbook.configurations.analysis;

import com.google.common.collect.Lists;

import java.util.List;

/**
 * Created by kyungtaak on 2017. 5. 24..
 */
public class ClusterAnalysis implements Analysis {

  /**
   * Number of section
   */
  Integer sections;

  /**
   * List of style per section
   */
  List<Style> styles;

  public ClusterAnalysis() {
  }

  public ClusterAnalysis(Integer sections, Style... styles) {
    this.sections = sections;
    this.styles = Lists.newArrayList(styles);
  }

  public Integer getSections() {
    return sections;
  }

  public void setSections(Integer sections) {
    this.sections = sections;
  }

  public List<Style> getStyles() {
    return styles;
  }

  public void setStyles(List<Style> styles) {
    this.styles = styles;
  }

  @Override
  public String toString() {
    return "ClusterAnalysis{" +
        "sections=" + sections +
        ", styles=" + styles +
        '}';
  }

  @Override
  public String getVersionKey() {
    return null;
  }
}
