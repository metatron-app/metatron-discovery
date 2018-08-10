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

import org.joda.time.DateTime;

/**
 * https://www.w3.org/TR/activitystreams-core
 */
public class ActivityStreamV2 {

  /**
   *
   */
  @JsonProperty("@context")
  String context;

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
  Actor actor;

  /**
   *
   */
  ActivityObject object;

  /**
   *
   */
  ActivityObject target;

  /**
   *
   */
  ActivityGenerator generator;

  /**
   *
   */
  DateTime published;

  @JsonCreator
  public ActivityStreamV2(@JsonProperty("@context") String context,
                          @JsonProperty("id") String id,
                          @JsonProperty(value = "type", required = true) String type,
                          @JsonProperty("name") String name,
                          @JsonProperty("actor") Actor actor,
                          @JsonProperty("object") ActivityObject object,
                          @JsonProperty("target") ActivityObject target,
                          @JsonProperty("generator") ActivityGenerator generator,
                          @JsonProperty("published") DateTime published) {
    this.context = context;
    this.id = id;
    this.type = type;
    this.name = name;
    this.actor = actor;
    this.object = object;
    this.target = target;
    this.generator = generator;
    this.published = published;
  }

  public String getContext() {
    return context;
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

  public Actor getActor() {
    return actor;
  }

  public ActivityObject getObject() {
    return object;
  }

  public ActivityObject getTarget() {
    return target;
  }

  public ActivityGenerator getGenerator() {
    return generator;
  }

  public DateTime getPublished() {
    return published;
  }
}
