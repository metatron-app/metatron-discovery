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

package app.metatron.discovery.domain.mdm.catalog;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.user.UserProfile;

/**
 * Projection model of Catalog
 */
public class CatalogProjections extends BaseProjections {

  @Projection(name = "default", types = {Catalog.class})
  public interface DefaultProjection {

    String getId();

    String getName();

    String getDescription();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();

  }

  @Projection(name = "forListView", types = {Catalog.class})
  public interface ListViewProjection {

    String getId();

    String getName();

    String getDescription();

    @Value("#{@catalogService.findHierarchies(target.id)}")
    List<Map<String, String>> getHierarchies();

    @Value("#{@catalogService.existSubCatalogs(target.id)}")
    Boolean getHasChild();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();

  }

  @Projection(name = "forHierarchyView", types = {Catalog.class})
  public interface HierarchyViewProjection {

    String getId();

    String getName();

    @Value("#{@catalogService.findHierarchies(target.id)}")
    List<Map<String, String>> getHierarchies();

  }

  @Projection(name = "forTreeView", types = {Catalog.class})
  public interface TreeViewProjection {

    String getId();

    String getName();

    @Value("#{@catalogService.findSubCatalogsForTreeView(target.id)}")
    List<Map<String, Object>> getCatalogs();

    @Value("#{@catalogService.countSubCatalogs(target.id)}")
    Boolean getCountOfChild();

  }

  @Projection(name = "forSimpleView", types = {Catalog.class})
  public interface SimpleProjection {

    String getId();

    String getName();

  }
}
