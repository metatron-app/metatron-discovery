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

package app.metatron.discovery.domain.workbook.configurations.board;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.collections.CollectionUtils;

import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * Created by kyungtaak on 2016. 9. 20..
 */
public class WidgetRelation implements Serializable {

  String ref;

  List<WidgetRelation> children;

  public WidgetRelation() {
  }

  @JsonCreator
  public WidgetRelation(@JsonProperty(value = "ref") String ref,
                        @JsonProperty(value = "pageRef") String pageRef,
                        @JsonProperty("children") List<WidgetRelation> children) {
    this.ref = ref;
    if(this.ref == null) {
      this.ref = pageRef;
    }
    this.children = children;
  }

  public WidgetRelation(String ref, WidgetRelation... children) {
    this(ref, null, children.length == 0 ? null : Lists.newArrayList(children));
  }

  public void replaceId(Map<String, String> idMap) {
    if (idMap.containsKey(ref)) {
      ref = idMap.get(ref);
    }

    if (CollectionUtils.isEmpty(children)) {
      return;
    }

    for (WidgetRelation relation : children) {
      relation.replaceId(idMap);
    }
  }

  public void addChild(String pageRef, WidgetRelation... children) {
    if (children == null) {
      this.children = Lists.newArrayList();
    }
    this.children.add(new WidgetRelation(pageRef, children));
  }

  public String getRef() {
    return ref;
  }

  public String getPageRef() {
    return ref;
  }

  public List<WidgetRelation> getChildren() {
    return children;
  }
}
