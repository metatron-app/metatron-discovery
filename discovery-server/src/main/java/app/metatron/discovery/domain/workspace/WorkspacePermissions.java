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

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import java.util.List;
import java.util.Set;

import app.metatron.discovery.domain.notebook.Notebook;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workbook.WorkBook;
import app.metatron.discovery.domain.workspace.folder.Folder;

public class WorkspacePermissions {

  public final static String PERM_WORKSPACE_MANAGE_WORKSPACE = "PERM_WORKSPACE_MANAGE_WORKSPACE";
  public final static String PERM_WORKSPACE_MANAGE_FOLDER = "PERM_WORKSPACE_MANAGE_FOLDER";
  public final static String PERM_WORKSPACE_VIEW_WORKBOOK = "PERM_WORKSPACE_VIEW_WORKBOOK";
  public final static String PERM_WORKSPACE_EDIT_WORKBOOK = "PERM_WORKSPACE_EDIT_WORKBOOK";
  public final static String PERM_WORKSPACE_MANAGE_WORKBOOK = "PERM_WORKSPACE_MANAGE_WORKBOOK";
  public final static String PERM_WORKSPACE_VIEW_NOTEBOOK = "PERM_WORKSPACE_VIEW_NOTEBOOK";
  public final static String PERM_WORKSPACE_EDIT_NOTEBOOK = "PERM_WORKSPACE_EDIT_NOTEBOOK";
  public final static String PERM_WORKSPACE_MANAGE_NOTEBOOK = "PERM_WORKSPACE_MANAGE_NOTEBOOK";
  public final static String PERM_WORKSPACE_VIEW_WORKBENCH = "PERM_WORKSPACE_VIEW_WORKBENCH";
  public final static String PERM_WORKSPACE_EDIT_WORKBENCH = "PERM_WORKSPACE_EDIT_WORKBENCH";
  public final static String PERM_WORKSPACE_MANAGE_WORKBENCH = "PERM_WORKSPACE_MANAGE_WORKBENCH";

  public static Set<String> allPermissions() {
    return Sets.newHashSet(PERM_WORKSPACE_MANAGE_WORKSPACE,
                           PERM_WORKSPACE_MANAGE_FOLDER,
                           PERM_WORKSPACE_VIEW_WORKBOOK,
                           PERM_WORKSPACE_EDIT_WORKBOOK,
                           PERM_WORKSPACE_MANAGE_WORKBOOK,
                           PERM_WORKSPACE_VIEW_NOTEBOOK,
                           PERM_WORKSPACE_EDIT_NOTEBOOK,
                           PERM_WORKSPACE_MANAGE_NOTEBOOK,
                           PERM_WORKSPACE_VIEW_WORKBENCH,
                           PERM_WORKSPACE_EDIT_WORKBENCH,
                           PERM_WORKSPACE_MANAGE_WORKBENCH);
  }

  public static List<String> editPermissions(WorkspaceItem item) {

    if(item == null) {
      return Lists.newArrayList();
    }

    List<String> permissions = null;
    switch (item) {
      case FOLDER:
        permissions = Lists.newArrayList(PERM_WORKSPACE_MANAGE_FOLDER);
        break;
      case WORKBOOK:
        permissions = Lists.newArrayList(PERM_WORKSPACE_EDIT_WORKBOOK, PERM_WORKSPACE_MANAGE_WORKBOOK);
        break;
      case NOTEBOOK:
        permissions = Lists.newArrayList(PERM_WORKSPACE_EDIT_NOTEBOOK, PERM_WORKSPACE_MANAGE_NOTEBOOK);
        break;
      case WORKBENCH:
        permissions = Lists.newArrayList(PERM_WORKSPACE_EDIT_WORKBENCH, PERM_WORKSPACE_MANAGE_WORKBENCH);
        break;
    }

    return permissions;
  }

  public static List<String> editPermissions(Book book) {
    return managePermissions(getItemType(book));
  }

  public static List<String> managePermissions(WorkspaceItem item) {

    if(item == null) {
      return Lists.newArrayList();
    }

    List<String> permissions = null;
    switch (item) {
      case FOLDER:
        permissions = Lists.newArrayList(PERM_WORKSPACE_MANAGE_FOLDER);
        break;
      case WORKBOOK:
        permissions = Lists.newArrayList(PERM_WORKSPACE_MANAGE_WORKBOOK);
        break;
      case NOTEBOOK:
        permissions = Lists.newArrayList(PERM_WORKSPACE_MANAGE_NOTEBOOK);
        break;
      case WORKBENCH:
        permissions = Lists.newArrayList(PERM_WORKSPACE_MANAGE_WORKBENCH);
        break;
    }

    return permissions;
  }

  public static List<String> managePermissions(Book book) {
    return managePermissions(getItemType(book));
  }

  public static WorkspaceItem getItemType(Book book) {

    WorkspaceItem workspaceItem = null;
    if(book instanceof Folder) {
      workspaceItem = WorkspaceItem.FOLDER;
    } else if(book instanceof WorkBook) {
      workspaceItem = WorkspaceItem.WORKBOOK;
    } else if(book instanceof Notebook) {
      workspaceItem = WorkspaceItem.NOTEBOOK;
    } else if(book instanceof Workbench) {
      workspaceItem = WorkspaceItem.WORKBENCH;
    }

    return workspaceItem;
  }

  public enum WorkspaceItem {
    FOLDER, WORKBOOK, NOTEBOOK, WORKBENCH
  }
}
