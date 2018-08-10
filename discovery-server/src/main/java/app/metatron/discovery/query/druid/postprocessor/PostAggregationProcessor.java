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

package app.metatron.discovery.query.druid.postprocessor;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;

import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.PostProcessor;

@JsonTypeName("postAggregations")
public class PostAggregationProcessor implements PostProcessor {

  List<PostAggregation> postAggregations;

  public PostAggregationProcessor() {
  }

  @JsonCreator
  public PostAggregationProcessor(
      @JsonProperty("postAggregations") List<PostAggregation> postAggregations) {
    this.postAggregations = postAggregations;
  }

  public void addPostAggregation(PostAggregation postAggregation) {
    if(postAggregations == null) {
      postAggregations = Lists.newArrayList();
    }

    postAggregations.add(postAggregation);
  }

  public List<PostAggregation> getPostAggregations() {
    return postAggregations;
  }

  public void setPostAggregations(List<PostAggregation> postAggregations) {
    this.postAggregations = postAggregations;
  }

  @Override
  public String toString() {
    return "PostAggregationProcessor{" +
        "postAggregations=" + postAggregations +
        '}';
  }
}
