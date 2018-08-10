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

import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;

/**
 * Created by james on 2017. 7. 13..
 */
@RepositoryEventHandler(NotebookModel.class)
public class NotebookModelEventHandler {

//    @Autowired
//    HttpRepository httpRepository;
//
//    @Autowired
//    MetatronProperties metatronProperties;

    @HandleBeforeCreate
//    @PreAuthorize("hasPermission(#notebookModel, 'PERM_WORKSPACE_WRITE_BOOK')")
    public void checkCreateAuthority(NotebookModel notebookModel) {
//        NotebookConnector connector = notebookModel.getNotebook().getConnector();
//        if(connector == null) {
//            throw new RuntimeException("Connector required.");
//        }
//        // script 생성
//        if(StringUtils.isEmpty(notebookModel.getScript())) {
//            connector.setHttpRepository(httpRepository);
//            connector.setMetatronProperties(metatronProperties);
//            notebookModel.setScript(connector.publishModel(notebookModel));
//        }
    }

    @HandleAfterCreate
    public void handleAfterCreate(NotebookModel notebookModel) {
    }

    @HandleBeforeSave
//    @PreAuthorize("hasPermission(#notebookModel, 'PERM_WORKSPACE_WRITE_BOOK')")
    public void checkUpdateAuthority(NotebookModel notebookModel) {
    }

    @HandleBeforeDelete
//    @PreAuthorize("hasPermission(#notebookModel, 'PERM_WORKSPACE_WRITE_BOOK')")
    public void checkDeleteAuthority(NotebookModel notebookModel) {
//        // script 삭제
//        if(StringUtils.isNotEmpty(notebookModel.getScript())) {
//            FileUtils.deleteFile(notebookModel.getScript());
//        }
    }
}
