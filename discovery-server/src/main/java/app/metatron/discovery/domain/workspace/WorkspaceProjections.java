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
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Set;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.notebook.NotebookConnector;
import app.metatron.discovery.domain.user.UserProfile;
import app.metatron.discovery.domain.user.role.RoleSet;

/**
 * Created by kyungtaak on 2016. 12. 22..
 */
@Component
public class WorkspaceProjections extends BaseProjections {

  @Projection(name = "default", types = { Workspace.class })
  public interface DefaultProjection {

    String getId();

    String getName();

    String getDescription();

    String getType();

    @Value("#{@cachedUserService.findUserProfile(target.ownerId)}")
    UserProfile getOwner();

    Workspace.PublicType getPublicType();

    Boolean getPublished();

    Boolean getActive();

    Boolean getFavorite();

    DateTime getLastAccessedTime();

    /**
     * 워크스페이스 생성 시간
     * lnb - 공유스페이스 정보
     * @return
     */
    DateTime getCreatedTime();

    /**
     * 워크스페이스 수정 시간
     * lnb - 공유스페이스 정보
     * @return
     */
    DateTime getModifiedTime();
  }

  @Projection(name = "forSimpleListView", types = { Workspace.class })
  public interface SimpleListViewProjection {

    String getId();

    String getName();

    Boolean getPublished();

    Boolean getActive();

    Workspace.PublicType getPublicType();

  }

  @Projection(name = "forListView", types = { Workspace.class })
  public interface ListViewProjection {

    String getId();

    String getName();

    String getDescription();

    String getType();

    @Value("#{@cachedUserService.findUserProfile(target.ownerId)}")
    UserProfile getOwner();

    @Value("#{@workspaceService.myRoles(target.id, target.ownerId)}")
    List<WorkspaceMember> getMyRoles();

    Boolean getPublished();

    Boolean getActive();

    Workspace.PublicType getPublicType();

    Boolean getFavorite();

    Boolean getLinked();

    @Value("#{target.countOfBookByType()}")
    Map<String, Integer> getCountByBookType();

    @Value("#{target.countOfMemberType()}")
    Map<String, Integer> getCountByMemberType();

    DateTime getLastAccessedTime();

    /**
     * 워크스페이스 생성 시간
     * lnb - 공유스페이스 정보
     * @return
     */
    DateTime getCreatedTime();

    /**
     * 워크스페이스 수정 시간
     * lnb - 공유스페이스 정보
     * @return
     */
    DateTime getModifiedTime();
  }

  @Projection(name = "forTreeView", types = { Workspace.class })
  public interface TreeViewProjection {

    String getId();

    String getName();

    Boolean getActive();

    @Value("#{@bookTreeService.findSubBooksInfoForView(target.id, true, 'TREE', target.bookType)}")
    List<Map<String, Object>> getBooks();

  }

  @Projection(name = "withSubBooksView", types = { Workspace.class })
  public interface WithBooksProjection {

    String getId();

    String getName();

    String getDescription();

    String getType();

    @Value("#{@cachedUserService.findUserProfile(target.ownerId)}")
    UserProfile getOwner();

    Boolean getPublished();

    Boolean getActive();

    Workspace.PublicType getPublicType();

    @Value("#{@bookTreeService.findRootBooks(target.id)}")
    List<Book> getBooks();

    /**
     * 워크스페이스 생성 시간
     * lnb - 공유스페이스 정보
     * @return
     */
    DateTime getCreatedTime();

    /**
     * 워크스페이스 수정 시간
     * lnb - 공유스페이스 정보
     * @return
     */
    DateTime getModifiedTime();
  }

  @Projection(name = "forDetailView", types = { Workspace.class })
  public interface DetailViewProjection {

    String getId();

    String getName();

    String getDescription();

    String getType();

    @Value("#{@cachedUserService.findUserProfile(target.ownerId)}")
    UserProfile getOwner();

    @Value("#{@workspaceService.myRoles(target.id, target.ownerId)}")
    List<WorkspaceMember> getMyRoles();

    @Value("#{@workspaceService.getPermissions(target)}")
    Set<String> getPermissions();

    List<RoleSet> getRoleSets();

    Set<NotebookConnector> getConnectors();

    Boolean getPublished();

    Boolean getActive();

    Workspace.PublicType getPublicType();

    @Value("#{target.favorite == null ? @workspaceFavoriteRepository.isFavoritWorkspace(target.id, T(app.metatron.discovery.util.AuthUtils).getAuthUserName()) : target.favorite}")
    Boolean getFavorite();

    @Value("#{@workspaceService.countAvailableWorkspaces(target.id)}")
    Integer getCountOfDataSources();

    @Value("#{target.countOfBookByType()}")
    Map<String, Integer> getCountByBookType();

    @Value("#{target.countOfMemberType()}")
    Map<String, Integer> getCountByMemberType();

    @Value("#{@bookTreeService.findSubBooksInfoForView(target.id, true, 'LIST', target.bookType)}")
    List<Map<String, Object>> getBooks();

    @Value("#{@contextService.getContexts(target)}")
    Map<String, Object> getContexts();

    DateTime getLastAccessedTime();

    @Value("#{@cachedUserService.findUserProfile(target.createdBy)}")
    UserProfile getCreatedBy();

    /**
     * 워크스페이스 생성 시간
     * lnb - 공유스페이스 정보
     * @return
     */
    DateTime getCreatedTime();

    @Value("#{@cachedUserService.findUserProfile(target.modifiedBy)}")
    UserProfile getModifiedBy();

    /**
     * 워크스페이스 수정 시간
     * lnb - 공유스페이스 정보
     * @return
     */
    DateTime getModifiedTime();
  }


  /**
   * 타 워크스페이스의 Book(Folder) 이동시 포함할 워크스페이스 정보
   */
  @Projection(name = "forHeaderView", types = { Workspace.class })
  public interface HeaderViewProjection {

    String getId();

    String getName();

    String getDescription();

    @Value("#{@cachedUserService.findUserProfile(target.ownerId)}")
    UserProfile getOwner();

    @Value("#{@workspaceService.myRoles(target.id, target.ownerId)}")
    List<WorkspaceMember> getMyRoles();

    Boolean getPublished();

    Boolean getActive();

    Workspace.PublicType getPublicType();

    @Value("#{target.favorite == null ? @workspaceFavoriteRepository.isFavoritWorkspace(target.id, T(app.metatron.discovery.util.AuthUtils).getAuthUserName()) : target.favorite}")
    Boolean getFavorite();

    @Value("#{@workspaceService.countAvailableWorkspaces(target.id)}")
    Integer getCountOfDataSources();

    @Value("#{target.countOfBookByType()}")
    Map<String, Integer> getCountByBookType();

    @Value("#{target.countOfMemberType()}")
    Map<String, Integer> getCountByMemberType();

    Set<NotebookConnector> getConnectors();

    DateTime getLastAccessedTime();

    DateTime getCreatedTime();

    DateTime getModifiedTime();
  }

}
