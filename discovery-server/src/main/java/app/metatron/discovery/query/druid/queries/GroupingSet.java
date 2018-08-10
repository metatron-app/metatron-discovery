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

package app.metatron.discovery.query.druid.queries;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.util.Arrays;
import java.util.List;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type", defaultImpl = GroupingSet.Names.class)
@JsonSubTypes(value = {
    @JsonSubTypes.Type(name = "names", value = GroupingSet.Names.class),
    @JsonSubTypes.Type(name = "indices", value = GroupingSet.Indices.class),
    @JsonSubTypes.Type(name = "ids", value = GroupingSet.Ids.class),
    @JsonSubTypes.Type(name = "rollup", value = GroupingSet.Rollup.class),
})
public interface GroupingSet {

  class Names implements GroupingSet {

    @JsonProperty
    private List<List<String>> names;

    @JsonCreator
    public Names(@JsonProperty("names") List<List<String>> names) {
      this.names = names == null ? ImmutableList.<List<String>>of() : names;
    }

    public List<List<String>> getNames() {
      return names;
    }

    public static class Builder {
      List<List<String>> groups = Lists.newArrayList();

      public Builder add(List<String> group) {
        groups.add(group);
        return this;
      }

      public Builder add(String... group) {
        groups.add(Arrays.asList(group));
        return this;
      }

      Names build() {
        return new Names(groups);
      }
    }
  }

  class Indices implements GroupingSet {

    @JsonProperty
    private List<List<Integer>> indices;

    @JsonCreator
    public Indices(@JsonProperty("indices") List<List<Integer>> indices) {
      this.indices = indices == null ? ImmutableList.<List<Integer>>of() : indices;
    }

    public List<List<Integer>> getIndices() {
      return indices;
    }

    public static class Builder {
      List<List<Integer>> groups = Lists.newArrayList();

      public Builder add(List<Integer> group) {
        groups.add(group);
        return this;
      }

      public Builder add(Integer... group) {
        groups.add(Arrays.asList(group));
        return this;
      }

      Indices build() {
        return new Indices(groups);
      }
    }
  }

  class Ids implements GroupingSet {

    @JsonProperty
    private List<Integer> ids;

    @JsonCreator
    public Ids(@JsonProperty("ids") List<Integer> ids) {
      this.ids = ids == null ? ImmutableList.<Integer>of() : ids;
    }

    public List<Integer> getIds() {
      return ids;
    }

  }

  class Rollup implements GroupingSet {
    @JsonCreator
    public Rollup() {
    }
  }
}
