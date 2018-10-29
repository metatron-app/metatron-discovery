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

package app.metatron.discovery.domain.workbook.configurations.widget.shelf;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.collections4.CollectionUtils;

import java.util.Collections;
import java.util.List;

import app.metatron.discovery.domain.workbook.configurations.field.Field;

public class GraphShelf implements Shelf {

  /**
   * 연결 주체가 되는 컬럼
   */
  List<Field> sources;

  /**
   * 연결 대상에 컬럼
   */
  List<Field> targets;

  /**
   * 연결 관계 정보 컬럼
   */
  Field link;

  public GraphShelf() {
    // Empty Constructor
  }

  @JsonCreator
  public GraphShelf(@JsonProperty("sources") List<Field> sources,
                    @JsonProperty("targets") List<Field> targets,
                    @JsonProperty("link") Field link) {
    this.sources = sources;
    this.targets = targets;
    this.link = link;
  }

  @Override
  public List<Field> getFields() {
    List<Field> collectedFields = Collections.emptyList();
    if(CollectionUtils.isNotEmpty(sources)) {
      collectedFields.addAll(sources);
    }

    if(CollectionUtils.isNotEmpty(targets)) {
      collectedFields.addAll(targets);
    }

    collectedFields.add(link);

    return collectedFields;
  }

  public List<Field> getSources() {
    return sources;
  }

  public List<Field> getTargets() {
    return targets;
  }

  public Field getLink() {
    return link;
  }
}
