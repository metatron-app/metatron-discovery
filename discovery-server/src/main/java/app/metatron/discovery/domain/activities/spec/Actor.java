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
 * https://www.w3.org/TR/activitystreams-core/#actors
 */
public class Actor {

  /**
   *
   */
  String id;

  /**
   *
   */
  ActorType type;

  /**
   *
   */
  String name;

  public Actor() {
  }

  @JsonCreator
  public Actor(@JsonProperty(value = "id", required = true) String id,
               @JsonProperty(value = "type", required = true) ActorType type,
               @JsonProperty("name") String name) {
    this.id = id;
    this.type = type;
    this.name = name;
  }

  public String getId() {
    return id;
  }

  public ActorType getType() {
    return type;
  }

  public String getName() {
    return name;
  }

  @Override
  public String toString() {
    return "Actor{" +
        "id='" + id + '\'' +
        ", type=" + type +
        ", name='" + name + '\'' +
        '}';
  }

  public enum ActorType {
    @JsonProperty("Application")
    APPLICATION,
    @JsonProperty("Group")
    GROUP,
    @JsonProperty("Person")
    PERSON,
    @JsonProperty("Service")
    SERVICE,
    @JsonProperty("Organization")
    ORGANIZATION;
  }
}
