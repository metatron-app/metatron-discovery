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

package app.metatron.discovery.common.entity;

import app.metatron.discovery.common.BaseProjections;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.context.ContextEntity;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceProjections;
import app.metatron.discovery.domain.mdm.Metadata;
import app.metatron.discovery.domain.notebook.Notebook;
import app.metatron.discovery.domain.user.role.Role;
import app.metatron.discovery.domain.user.role.RoleProjections;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workbook.DashBoard;
import app.metatron.discovery.domain.workbook.DashboardProjections;
import app.metatron.discovery.domain.workbook.WorkBook;
import app.metatron.discovery.domain.workspace.BookProjections;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.domain.workspace.WorkspaceProjections;

/**
 * Metatron 내 도메인 타입 정의
 */
public enum  DomainType {

  COMMON, METADATA, DATASOURCE, WORKSPACE, WORKBOOK, DASHBOARD, WORKBENCH, NOTEBOOK, GROUP;

  public BaseProjections getProjection() {

    switch (this) {
      case DATASOURCE:
        return new DataSourceProjections();
      case WORKSPACE:
        return new WorkspaceProjections();
      case WORKBOOK:
      case WORKBENCH:
      case NOTEBOOK:
        return new BookProjections();
      case DASHBOARD:
        return new DashboardProjections();
      case GROUP:
        return new RoleProjections();
    }

    return new BaseProjections();
  }

  public static DomainType getType(ContextEntity entity) {
    if(entity instanceof DataSource) {
      return DATASOURCE;
    } else if(entity instanceof Workspace) {
      return WORKSPACE;
    } else if(entity instanceof WorkBook) {
      return WORKBOOK;
    } else if(entity instanceof DashBoard) {
      return DASHBOARD;
    } else if(entity instanceof Workbench) {
      return WORKBENCH;
    } else if(entity instanceof Notebook) {
      return NOTEBOOK;
    } else if(entity instanceof Role) {
      return GROUP;
    } else {
      return COMMON;
    }
  }

  public static DomainType getType(MetatronDomain domain) {
    if(domain instanceof DataSource) {
      return DATASOURCE;
    } else if(domain instanceof Metadata) {
      return METADATA;
    } else if(domain instanceof Workspace) {
      return WORKSPACE;
    } else if(domain instanceof WorkBook) {
      return WORKBOOK;
    } else if(domain instanceof DashBoard) {
      return DASHBOARD;
    } else if(domain instanceof Workbench) {
      return WORKBENCH;
    } else if(domain instanceof Notebook) {
      return NOTEBOOK;
    } else if(domain instanceof Role) {
      return GROUP;
    } else {
      return COMMON;
    }
  }
}
