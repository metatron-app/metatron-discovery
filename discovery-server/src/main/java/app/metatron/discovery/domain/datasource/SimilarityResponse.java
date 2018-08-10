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

package app.metatron.discovery.domain.datasource;

import com.fasterxml.jackson.databind.JsonNode;

import java.io.Serializable;

public class SimilarityResponse implements Serializable {

  /**
   * on Join
   */
  String from;

  /**
   *
   */
  String to;

  /**
   * 1에 가까울수록 유사성 커짐 ( to cadinaltiy / from cadinality )
   */
  Double similarity;

  public SimilarityResponse() {
  }

  public SimilarityResponse(JsonNode result) {
    this.from = result.get("from").textValue();
    this.to = result.get("to").textValue();

    JsonNode relations = result.get("relations");
    this.similarity =  relations.get("similarity").asDouble();

  }

  public String getFrom() {
    return from;
  }

  public void setFrom(String from) {
    this.from = from;
  }

  public String getTo() {
    return to;
  }

  public void setTo(String to) {
    this.to = to;
  }

  public Double getSimilarity() {
    return similarity;
  }

  public void setSimilarity(Double similarity) {
    this.similarity = similarity;
  }

}
