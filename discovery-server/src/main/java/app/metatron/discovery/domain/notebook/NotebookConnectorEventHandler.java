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

import com.google.common.base.Preconditions;

import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;

import java.net.URL;

import app.metatron.discovery.common.exception.MetatronException;

/**
 * Created by james on 2017. 8. 4..
 */
@RepositoryEventHandler(NotebookConnector.class)
public class NotebookConnectorEventHandler {

    @HandleBeforeCreate
//    @PreAuthorize("hasPermission(#notebookConnector, 'PERM_SYSTEM_WRITE_WORKSPACE')")
    public void checkCreateAuthority(NotebookConnector connector) {
        connector = parseUrl(connector);
    }

    @HandleBeforeSave
//    @PreAuthorize("hasPermission(#notebookConnector, 'PERM_SYSTEM_WRITE_WORKSPACE')")
    public void checkUpdateAuthority(NotebookConnector connector) {
        connector = parseUrl(connector);
    }

    @HandleBeforeDelete
//    @PreAuthorize("hasPermission(#notebookConnector, 'PERM_SYSTEM_WRITE_WORKSPACE')")
    public void checkDeleteAuthority(NotebookConnector connector) {
        for(Notebook notebook : connector.getNotebooks()) {
            connector.deleteNotebook(notebook.getaLink());
        }
    }

    private NotebookConnector parseUrl(NotebookConnector connector) {
        Preconditions.checkNotNull(connector.getUrl(), "notebook url is required");
        try {
            URL aURL = new URL(connector.getUrl());
            connector.setHostname(aURL.getHost());
            if (aURL.getPort() == -1) {
                if ("http".equals(aURL.getProtocol())) {
                    connector.setPort(80);
                } else if ("https".equals(aURL.getProtocol())) {
                    connector.setPort(443);
                }
            } else {
                connector.setPort(aURL.getPort());
            }
        } catch (Exception e) {
            throw new MetatronException("notebook url is invalid");
        }
        return connector;
    }

}
