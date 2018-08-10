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

import com.fasterxml.jackson.annotation.JsonTypeName;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.configurations.WidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.widget.PageWidgetConfiguration;
import app.metatron.discovery.util.PolarisUtils;

/**
 * Created by kyungtaak on 2017. 7. 18..
 */
@Entity
@JsonTypeName("page")
@DiscriminatorValue("page")
public class PageWidget extends Widget {

  /**
   * Page Image Url
   */
  @Column(name = "page_image_Url")
  private String imageUrl;

  /**
   * Notebook Models related to widget
   */
//  @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
//  @JoinTable(name = "notebook_model_widget",
//      joinColumns = @JoinColumn(name = "wg_id", referencedColumnName = "id"),
//      inverseJoinColumns = @JoinColumn(name = "nbm_id", referencedColumnName = "id"))
//  @JsonBackReference
//  protected Set<NotebookModel> models;

  /**
   * Default Constructor
   */
  public PageWidget() {
    // Empty Constructor
  }

  @Override
  public Widget copyOf(DashBoard parent, boolean addPrefix) {
    PageWidget pageWidget = new PageWidget();
    pageWidget.setName(addPrefix ? PolarisUtils.COPY_OF_PREFIX + name : name);
    pageWidget.setDescription(description);
    pageWidget.setConfiguration(configuration);
    pageWidget.setImageUrl(imageUrl);

    if(parent == null) {
      pageWidget.setDashBoard(dashBoard);
    } else {
      pageWidget.setDashBoard(parent);
    }

    return pageWidget;
  }

  @Override
  public WidgetConfiguration convertConfiguration() {
    return GlobalObjectMapper.readValue(this.configuration, PageWidgetConfiguration.class);
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }

//  public Set<NotebookModel> getModels() {
//    return models;
//  }
//
//  public void setModels(Set<NotebookModel> models) {
//    this.models = models;
//  }
//
//  public boolean hasModels() {
//    return CollectionUtils.isNotEmpty(this.models);
//  }
//
//  @JsonIgnore
//  public List<NotebookModelSummary> getModelSummarys() {
//    return this.models.stream()
//            .map((model) -> NotebookModelSummary.valueOf(model)).collect(Collectors.toList());
//  }

}
