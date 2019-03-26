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

package app.metatron.discovery.domain.activities;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import java.security.Principal;

import javax.persistence.*;

import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.activities.spec.ActivityStreamV2;
import app.metatron.discovery.domain.activities.spec.ActivityType;
import app.metatron.discovery.domain.activities.spec.Actor;
import app.metatron.discovery.util.EnumUtils;

@Entity
@Table(name = "activity_stream")
public class ActivityStream implements MetatronDomain<Long> {

  @Id
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Column(name = "id")
  Long id;

  @Column(name = "activity_action")
  @Enumerated(EnumType.STRING)
  ActivityType action;

  @Column(name = "activity_actor")
  String actor;

  @Column(name = "activity_actor_type")
  @Enumerated(EnumType.STRING)
  Actor.ActorType actorType;

  @Column(name = "activity_object_id")
  String objectId;

  @Column(name = "activity_object_type")
  @Enumerated(EnumType.STRING)
  MetatronObjectType objectType;

  @Column(name = "activity_object_content", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String objectContent;

  @Column(name = "activity_target_id")
  String targetId;

  @Column(name = "activity_target_type")
  @Enumerated(EnumType.STRING)
  MetatronObjectType targetType;

  @Column(name = "activity_generator_type")
  @Enumerated(EnumType.STRING)
  GeneratorType generatorType;

  @Column(name = "activity_generator_name")
  String generatorName;

  @Column(name = "activity_published_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime publishedTime;

  public ActivityStream() {
  }

  public ActivityStream(ActivityStreamV2 activity, Principal principal) {

    this.action = EnumUtils.getUpperCaseEnum(ActivityType.class, activity.getType(), ActivityType.NONE);

    if(activity.getActor() == null) {
      this.actor = principal.getName();
      this.actorType = Actor.ActorType.PERSON;
    } else {
      this.actor = activity.getActor().getId();
      this.actorType = activity.getActor().getType();
    }

    if(activity.getObject() != null) {
      this.objectId = activity.getObject().getId();
      this.objectType = EnumUtils.getUpperCaseEnum(MetatronObjectType.class, activity.getObject().getType(), MetatronObjectType.UNKNOWN);
      this.objectContent = activity.getObject().getContent();
    }

    if(activity.getTarget() != null) {
      this.targetId = activity.getTarget().getId();
      this.targetType = EnumUtils.getUpperCaseEnum(MetatronObjectType.class, activity.getTarget().getType(), MetatronObjectType.UNKNOWN);
    }

    if(activity.getGenerator() != null) {
      this.generatorType = EnumUtils.getUpperCaseEnum(GeneratorType.class, activity.getGenerator().getType(), GeneratorType.UNKNOWN);
      this.generatorName = activity.getGenerator().getName();
    }

    this.publishedTime = DateTime.now();
  }

  @Override
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getObjectId() {
    return objectId;
  }

  public void setObjectId(String objectId) {
    this.objectId = objectId;
  }

  public MetatronObjectType getObjectType() {
    return objectType;
  }

  public void setObjectType(MetatronObjectType objectType) {
    this.objectType = objectType;
  }

  public String getObjectContent() {
    return objectContent;
  }

  public void setObjectContent(String objectContent) {
    this.objectContent = objectContent;
  }

  public ActivityType getAction() {
    return action;
  }

  public void setAction(ActivityType action) {
    this.action = action;
  }

  public String getActor() {
    return actor;
  }

  public void setActor(String actor) {
    this.actor = actor;
  }

  public Actor.ActorType getActorType() {
    return actorType;
  }

  public void setActorType(Actor.ActorType actorType) {
    this.actorType = actorType;
  }

  public String getTargetId() {
    return targetId;
  }

  public void setTargetId(String targetId) {
    this.targetId = targetId;
  }

  public MetatronObjectType getTargetType() {
    return targetType;
  }

  public void setTargetType(MetatronObjectType targetType) {
    this.targetType = targetType;
  }

  public DateTime getPublishedTime() {
    return publishedTime;
  }

  public void setPublishedTime(DateTime publishedTime) {
    this.publishedTime = publishedTime;
  }

  public enum GeneratorType {
    UNKNOWN, WEBAPP, EXTENSIONS
  }

  public enum MetatronObjectType {
    UNKNOWN, USER, GROUP, WORKSPACE, WORKBOOK, NOTEBOOK, WORKBENCH, DASHBOARD, DATASOURCE, DATACONNECTION
  }
}
