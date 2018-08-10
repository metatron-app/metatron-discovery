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

package app.metatron.discovery.domain.mdm;

import com.fasterxml.jackson.annotation.JsonRawValue;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.datasource.LogicalType;
import app.metatron.discovery.domain.user.UserProfile;

public class ColumnDictionaryProjections extends BaseProjections {

  @Projection(types = ColumnDictionary.class, name = "default")
  public interface DefaultProjection {

    String getId();

    String getName();

    String getLogicalName();

    String getDescription();
  }

  @Projection(types = ColumnDictionary.class, name = "forListView")
  public interface ForListViewProjection {

    String getId();

    String getName();

    String getDescription();

    String getLogicalName();

    LogicalType getLogicalType();

    @Value("#{target.codeTable != null}")
    Boolean getLinkCodeTable();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getCreatedTime();

    DateTime getModifiedTime();
  }

  @Projection(types = ColumnDictionary.class, name = "forDetailView")
  public interface ForDetailViewProjection {

    String getId();

    String getName();

    String getLogicalName();

    String getDescription();

    String getSuggestionName();

    String getSuggestionShortName();

    DataType getDataType();

    LogicalType getLogicalType();

    @Value("#{target.codeTable != null}")
    Boolean getLinkCodeTable();

    @JsonRawValue
    String getFormat();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getCreatedTime();

    DateTime getModifiedTime();
  }
}
