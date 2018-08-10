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

package app.metatron.discovery.domain.notebook;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.security.access.prepost.PreAuthorize;

import javax.servlet.http.HttpServletRequest;

import app.metatron.discovery.domain.notebook.connector.HttpRepository;
import app.metatron.discovery.domain.workspace.BookTreeService;

/**
 * Created by kyungtaak on 2016. 10. 21..
 */
@RepositoryEventHandler(Notebook.class)
public class NotebookEventHandler {

  @Autowired
  BookTreeService bookTreeService;

  @Autowired
  HttpRepository httpRepository;

  @Autowired
  HttpServletRequest request;

  @HandleBeforeCreate
  @PreAuthorize("hasPermission(#notebook, 'PERM_WORKSPACE_WRITE_NOTEBOOK')")
  public void handleBeforeCreate(Notebook notebook) {

    NotebookConnector connector = notebook.getConnector();

    if(notebook.getConnector() == null) {
      throw new RuntimeException("Connector required.");
    }

    // RefId 가 존재하지 않을 경우 Notebook 생성후 Reference Id 생성
    if(StringUtils.isEmpty(notebook.getRefId())) {
      connector.setHttpRepository(httpRepository);
      notebook.setCurrentUrl(request.getRequestURL().toString());
      String itemPath = connector.createNotebook(notebook);
      notebook.setRefId(itemPath);
      notebook.setLink(connector.getLinkUrl(itemPath));
      notebook.setaLink(connector.getAPIUrl(itemPath));
    }
  }

  @HandleAfterCreate
  public void handleAfterCreate(Notebook notebook) {
    // Tree 생성
    bookTreeService.createTree(notebook);
  }

  @HandleBeforeSave
  @PreAuthorize("hasPermission(#notebook, 'PERM_WORKSPACE_WRITE_NOTEBOOK')")
  public void handleBeforeSave(Notebook notebook) {
  }

  @HandleBeforeDelete
  @PreAuthorize("hasPermission(#notebook, 'PERM_WORKSPACE_WRITE_NOTEBOOK')")
  public void dandleBeforeDelete(Notebook notebook) {

    NotebookConnector connector = notebook.getConnector();
    if(notebook.getConnector() == null) {
      return;
    }
    // Notebook 삭제
    connector.setHttpRepository(httpRepository);
    connector.deleteNotebook(notebook.getaLink());

    // Tree 삭제
    bookTreeService.deleteTree(notebook);
  }

}
