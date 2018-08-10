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

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.domain.user.UserProfile;

/**
 * Created by kyungtaak on 2016. 11. 3..
 */
public class FilterWidgetProjections {

  @Projection(name = "default", types = {FilterWidget.class})
  public interface DefaultProjection {

    String getId();

    String getType();

    String getName();

    String getDescription();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();
  }

  /**
   * FilterWidget 상세, 기본 항목 외 Configuration 항목 추가
   */
  @Projection(name = "forDetailView", types = {FilterWidget.class})
  public interface ForDetailProjection extends DefaultProjection {

    @Value("#{@objectMapper.readValue(target.configuration, T(java.lang.Object))}")
    Object getConfiguration();
  }

}
