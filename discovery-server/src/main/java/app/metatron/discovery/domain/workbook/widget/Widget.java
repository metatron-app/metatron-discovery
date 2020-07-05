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

package app.metatron.discovery.domain.workbook.widget;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;

import java.util.List;

import javax.persistence.*;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.entity.Spec;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.configurations.WidgetConfiguration;

/**
 * Created by kyungtaak on 2017. 7. 18..
 */
@Entity
@Table(name = "dashboard_widget")
@DiscriminatorColumn(name = "widget_type")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
public abstract class Widget extends AbstractHistoryEntity implements MetatronDomain<String>  {

  public static List<String> SEARCHABLE_WIDGETS = Lists.newArrayList("page", "text", "filter");

  /**
   * ID
   *
   */
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  protected String id;

  /**
   * Type of widget
   *
   */
  @Column(name = "widget_type", insertable = false, updatable = false)
  protected String type;


  /**
   * Name of widget
   *
   */
  @Column(name = "widget_name")
  @NotBlank
  @Size(max = 150)
  protected String name;

  /**
   * Description of widget
   *
   */
  @Column(name = "widget_description", length = 1000)
  @Size(max = 900)
  protected String description;

  /**
   * Widget Configuration
   */
  @Column(name = "widget_conf", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @Spec(target = WidgetConfiguration.class)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  protected String configuration;

  /**
   * Parent Dashboard
   *
   */
  @ManyToOne(fetch = FetchType.EAGER,  cascade = CascadeType.MERGE)
  @JoinColumn(name="board_id")
  protected DashBoard dashBoard;

  public Widget() {
  }

  public abstract Widget copyOf(DashBoard parent, boolean addPrefix);

  public abstract WidgetConfiguration convertConfiguration();

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getConfiguration() {
    return configuration;
  }

  public void setConfiguration(String configuration) {
    this.configuration = configuration;
  }

  public DashBoard getDashBoard() {
    return dashBoard;
  }

  public void setDashBoard(DashBoard dashBoard) {
    this.dashBoard = dashBoard;
  }

}
