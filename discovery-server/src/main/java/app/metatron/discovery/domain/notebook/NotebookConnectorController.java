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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

import app.metatron.discovery.domain.notebook.connector.HttpRepository;

/**
 * Created by james on 2017. 8. 4..
 */
@RepositoryRestController
public class NotebookConnectorController {

    private static Logger LOGGER = LoggerFactory.getLogger(NotebookConnectorController.class);

    @Autowired
    NotebookConnectorRepository notebookConnectorRepository;

    @Autowired
    HttpRepository httpRepository;

    /**
     * Kill all of notebook kernels
     */
    @RequestMapping(path = "/connectors/kernels", method = RequestMethod.DELETE)
    public @ResponseBody
    ResponseEntity<?> killNotebookKernels() {
        Page<NotebookConnector> connectors = notebookConnectorRepository.findByType("jupyter", new PageRequest(0, Integer.MAX_VALUE));
        for(NotebookConnector connector : connectors) {
            connector.setHttpRepository(httpRepository);
            connector.killAllKernels();
        }
        LOGGER.info("Completed kill every alive notebook [jupyter] kernels.");
        return ResponseEntity.noContent().build();
    }

    /**
     * 워크스페이스 > 목록 > 노트북 일괄 삭제
     *
     * @param ids
     * @return
     */
    @RequestMapping(path = "/connectors/{ids}", method = RequestMethod.DELETE)
    public @ResponseBody
    ResponseEntity<?> deleteConnectors(@PathVariable("ids") List<String> ids) {
        for(String id : ids) {
            NotebookConnector connector = notebookConnectorRepository.findOne(id);
            if(connector == null) {
                return ResponseEntity.notFound().build();
            }
            for(Notebook notebook : connector.getNotebooks()) {
                connector.deleteNotebook(notebook.getaLink());
            }
            notebookConnectorRepository.delete(connector);
        }
        return ResponseEntity.noContent().build();
    }

}
