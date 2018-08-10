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

package app.metatron.discovery.domain.activities.spec;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * https://www.w3.org/TR/activitystreams-core/#object
 */
public class ActivityObject {

  /**
   *
   */
  String id;

  /**
   *
   */
  String type;

  /**
   *
   */
  String name;

  /**
   *
   */
  String summary;

  /**
   *
   */
  String content;

  public ActivityObject() {
  }

  @JsonCreator
  public ActivityObject(
      @JsonProperty(value = "id", required = true) String id,
      @JsonProperty(value = "type", required = true) String type,
      @JsonProperty("name") String name,
      @JsonProperty("summary") String summary,
      @JsonProperty("content") String content) {
    this.id = id;
    this.type = type;
    this.name = name;
    this.summary = summary;
    this.content = content;
  }

  public ActivityObject(String id, String type) {
    this(id, type, null, null, null);
  }

  public String getId() {
    return id;
  }

  public String getType() {
    return type;
  }

  public String getName() {
    return name;
  }

  public String getSummary() {
    return summary;
  }

  public String getContent() {
    return content;
  }

  @Override
  public String toString() {
    return "ActivityObject{" +
        "id='" + id + '\'' +
        ", type='" + type + '\'' +
        ", summary='" + summary + '\'' +
        '}';
  }
}
