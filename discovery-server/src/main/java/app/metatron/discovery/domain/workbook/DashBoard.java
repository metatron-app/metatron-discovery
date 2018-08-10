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

package app.metatron.discovery.domain.workbook;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.Set;

import javax.persistence.*;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.entity.Spec;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.BoardConfiguration;
import app.metatron.discovery.domain.workbook.widget.Widget;
import app.metatron.discovery.util.PolarisUtils;

/**
 * Dash board
 *
 */
@Entity
@Table(name = "dashboard")
public class DashBoard extends AbstractHistoryEntity implements MetatronDomain<String>  {

  /**
   * ID
   */
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  private String id;

  /**
   * Name of dashboard
   */
  @Column(name = "board_name")
  @NotBlank
  @Size(max = 150)
  private String name;

  /**
   * Description of dashboard
   */
  @Column(name = "board_description", length = 1000)
  @Size(max = 900)
  private String description;

  /**
   * Dashboard Configuration
   *
   */
  @Column(name = "board_conf", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @Spec(target = BoardConfiguration.class)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String configuration;

  /**
   * Temporary DataSource Id
   */
  @Column(name = "board_ds_temporary")
  private String temporaryId;

  /**
   * Dashboard Tag
   *
   */
  @Column(name = "board_tag")
  @Size(max = 5000)
  private String tag;

  /**
   * Dashboard Image Url
   *
   */
  @Column(name = "board_image_Url")
  private String imageUrl;

  /**
   * if true, hide Dashboard in workbook for viewer
   *
   */
  @Column(name = "board_hiding")
  private Boolean hiding;

  /**
   * Dashboard Sequence in workbook
   *
   */
  @Column(name = "board_seq")
  private Integer seq;

  /**
   * 포함되는 WorkBook 정보
   *
   */
  @ManyToOne(fetch = FetchType.LAZY,  cascade = CascadeType.MERGE)
  @JoinColumn(name="book_id")
  @RestResource(path = "workbook")
  private WorkBook workBook;

  /**
   * Dashboard 내 연결되어 있는 데이터 소스 정보
   *
   */
  @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
  @JoinTable(name = "datasource_dashboard",
      joinColumns = @JoinColumn(name = "dashboard_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "ds_id", referencedColumnName = "id"))
  @JsonBackReference
  @RestResource(path = "datasources")
  Set<DataSource> dataSources;

  /**
   * 구성 Wiget 정보
   */
  @OneToMany(mappedBy = "dashBoard", cascade = CascadeType.ALL)
  @RestResource(path = "widgets")
  Set<Widget> widgets;

  /**
   * Default Constructor
   */
  public DashBoard() {
    // Empty Constructor
  }

  public DashBoard copyOf(WorkBook parent, boolean addPrefix) {
    DashBoard dashBoard = new DashBoard();
    dashBoard.setName(addPrefix ? PolarisUtils.COPY_OF_PREFIX + name : name);
    dashBoard.setDescription(description);
    dashBoard.setConfiguration(configuration);
    dashBoard.setTag(tag);
    dashBoard.setImageUrl(imageUrl);
    dashBoard.setHiding(hiding);

    if(parent == null) {
      dashBoard.setWorkBook(workBook);
    } else {
      dashBoard.setWorkBook(parent);
    }

    return dashBoard;
  }

  @JsonIgnore
  public BoardConfiguration getConfigurationObject() {
    return GlobalObjectMapper.readValue(configuration, BoardConfiguration.class);
  }

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

  public String getConfiguration() {
    return configuration;
  }

  public void setConfiguration(String configuration) {
    this.configuration = configuration;
  }

  public String getTemporaryId() {
    return temporaryId;
  }

  public void setTemporaryId(String temporaryId) {
    this.temporaryId = temporaryId;
  }

  public WorkBook getWorkBook() {
    return workBook;
  }

  public void setWorkBook(WorkBook workBook) {
    this.workBook = workBook;
  }

  public String getTag() {
    return tag;
  }

  public void setTag(String tag) {
    this.tag = tag;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }

  public Boolean getHiding() {
    return hiding;
  }

  public void setHiding(Boolean hiding) {
    this.hiding = hiding;
  }

  public Integer getSeq() {
    return seq;
  }

  public void setSeq(Integer seq) {
    this.seq = seq;
  }

  public Set<DataSource> getDataSources() {
    return dataSources;
  }

  public void setDataSources(Set<DataSource> dataSources) {
    this.dataSources = dataSources;
  }

  public Set<Widget> getWidgets() {
    return widgets;
  }

  public void setWidgets(Set<Widget> widgets) {
    this.widgets = widgets;
  }

  @PrePersist
  @Override
  public void prePersist() {
    super.prePersist();
    if(workBook != null) {
      workBook.preUpdate();
    }
  }

  @PreUpdate
  @Override
  public void preUpdate() {
    super.preUpdate();
    if(workBook != null) {
      workBook.preUpdate();
    }
  }
}
