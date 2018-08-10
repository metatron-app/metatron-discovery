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

package app.metatron.discovery.domain.workspace;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.rest.core.config.Projection;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.user.UserProfile;

/**
 * Created by kyungtaak on 2016. 12. 20..
 */
public class BookProjections extends BaseProjections {

  public enum BookProjectionType {
    LIST, TREE
  }

  @Projection(name = "default", types = {Book.class})
  public interface DefaultProjection {

    String getId();

    String getName();

    String getType();

    String getDescription();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();

  }

  @Projection(name = "forListView", types = {Book.class})
  public interface ListViewProjection {

    String getId();

    String getName();

    String getType();

    String getDescription();

    @Value("#{@bookTreeService.findBookHierarchies(target.id)}")
    List<Map<String, String>> getHierarchies();

    @Value("#{@bookTreeService.findSubBooksInfoForView(target.id, false, 'LIST', target.bookType)}")
    List<Map<String, Object>> getBooks();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();

  }

  @Projection(name = "forListWithWorkspaceView", types = {Book.class})
  public interface ListViewWithWorkspaceProjection {

    String getId();

    String getName();

    String getType();

    String getDescription();

    @Value("#{@bookTreeService.findBookHierarchies(target.id)}")
    List<Map<String, String>> getHierarchies();

    @Value("#{@bookTreeService.findSubBooksInfoForView(target.id, false, 'LIST', target.bookType)}")
    List<Map<String, Object>> getBooks();

    @Value("#{@projectionFactory.createProjection(T(app.metatron.discovery.domain.workspace.WorkspaceProjections$HeaderViewProjection), target.workspace)}")
    Object getWorkspace();

    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    DateTime getModifiedTime();

  }

  @Projection(name = "forTreeView", types = {Book.class})
  public interface TreeViewProjection {

    String getId();

    String getName();

    String getType();

    @Value("#{@bookTreeService.findBookHierarchies(target.id)}")
    List<Map<String, String>> getHierarchies();

    @Value("#{@bookTreeService.findSubBooksInfoForView(target.id, false, 'TREE', target.bookType)}")
    List<Map<String, Object>> getBooks();

  }
}
