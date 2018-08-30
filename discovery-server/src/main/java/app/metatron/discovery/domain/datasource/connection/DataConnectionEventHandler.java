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

package app.metatron.discovery.domain.datasource.connection;

import app.metatron.discovery.domain.workspace.Workspace;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeLinkDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeLinkSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.security.access.prepost.PreAuthorize;

@RepositoryEventHandler(DataConnection.class)
public class DataConnectionEventHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(DataConnectionEventHandler.class);

  @HandleBeforeCreate
  public void handleBeforeCreate(DataConnection dataConnection) {
    if(BooleanUtils.isNotTrue(dataConnection.getPublished()) && CollectionUtils.isNotEmpty(dataConnection.getWorkspaces())) {
      dataConnection.setLinkedWorkspaces(dataConnection.getWorkspaces().size());
    }
  }

  @HandleBeforeLinkSave
  public void handleBeforeLinkSave(DataConnection dataConnection, Object linked) {

    // 연결된 워크스페이스 개수 처리,
    // PATCH 일경우 linked 객체에 값이 주입되나 PUT 인경우 값이 주입되지 않아
    // linked 객체 체크를 수행하지 않음
    if(BooleanUtils.isNotTrue(dataConnection.getPublished())) {
      dataConnection.setLinkedWorkspaces(dataConnection.getWorkspaces().size());
      LOGGER.debug("UPDATED: Set linked workspace in datasource({}) : {}", dataConnection.getId(), dataConnection.getLinkedWorkspaces());
    }
  }

  @HandleBeforeLinkDelete
  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_DATASOURCE')")
  public void handleBeforeLinkDelete(DataConnection dataConnection, Object linked) {

    // 연결된 워크스페이스 개수 처리,
    // 전체 공개 워크스페이스가 아니고 linked 내 Entity 타입이 Workspace 인 경우
    if(BooleanUtils.isNotTrue(dataConnection.getPublished()) &&
        !CollectionUtils.sizeIsEmpty(linked) &&
        CollectionUtils.get(linked, 0) instanceof Workspace) {
      dataConnection.setLinkedWorkspaces(dataConnection.getWorkspaces().size());
      LOGGER.debug("DELETED: Set linked workspace in datasource({}) : {}", dataConnection.getId(), dataConnection.getLinkedWorkspaces());
    }

  }

}
