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

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.configurations.WidgetConfiguration;
import app.metatron.discovery.domain.workbook.configurations.widget.TextWidgetConfiguration;
import app.metatron.discovery.util.PolarisUtils;

/**
 * Created by kyungtaak on 2017. 7. 18..
 */
@Entity
@JsonTypeName("text")
@DiscriminatorValue("text")
public class TextWidget extends Widget {

  /**
   * HTML 컨텐츠
   */
  @Column(name = "widget_text_contents", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  String contents;

  /**
   * Default Constructor
   */
  public TextWidget() {
    // Empty Constructor
  }

  @Override
  public Widget copyOf(DashBoard parent, boolean addPrefix) {
    TextWidget textWidget = new TextWidget();
    textWidget.setName(addPrefix ? PolarisUtils.COPY_OF_PREFIX + name : name);
    textWidget.setDescription(description);
    textWidget.setConfiguration(configuration);

    if(parent == null) {
      textWidget.setDashBoard(dashBoard);
    } else {
      textWidget.setDashBoard(parent);
    }

    return textWidget;
  }

  @Override
  public WidgetConfiguration convertConfiguration() {
    return GlobalObjectMapper.readValue(this.configuration, TextWidgetConfiguration.class);
  }

  public String getContents() {
    return contents;
  }

  public void setContents(String contents) {
    this.contents = contents;
  }
}
