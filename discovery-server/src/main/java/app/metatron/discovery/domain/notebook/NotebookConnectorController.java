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
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

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

    /**
     * 워크스페이스 > 서버 관리 > 서버 상세 > 서버 가용 확인
     *
     * @param id
     * @return
     */
    @RequestMapping(path = "/connectors/validation/{id}", method = RequestMethod.GET)
    public @ResponseBody
    ResponseEntity<?> checkValidation(@PathVariable("id") String id ) {

        NotebookConnector connector = notebookConnectorRepository.findOne(id);
        if(connector == null) {
            throw new RuntimeException("Connector not found");
        }

        connector.setHttpRepository(httpRepository);
        if(connector.checkValidation()){
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }

    /**
     * 워크스페이스 > 서버 관리 > 서버 등록 > 서버 커넥션 상태 확인
     *
     * @param hostname
     * @param port
     * @return
     */
    @RequestMapping(path = "/connectors/status/{hostname}/{port}", method = RequestMethod.GET)
    public @ResponseBody
    ResponseEntity<?> checkStatus(@PathVariable("hostname") String hostname,
                                      @PathVariable("port") String port) {
        try {
            UriComponents getUrl = UriComponentsBuilder
                    .fromHttpUrl(makeHttpUrl(hostname, port))
                    .build();
            httpRepository.call(getUrl.toUriString(), HttpMethod.GET, null, String.class);
            return ResponseEntity.ok().build();
        } catch (RuntimeException re) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }

    /**
     *
     * @param hostname
     * @param port
     * @return
     */
    private String makeHttpUrl(String hostname, String port) {
        StringBuilder builder = new StringBuilder();
        builder.append("http://");
        builder.append(hostname);
        if(port != null) {
            builder.append(":").append(port);
        }
        return builder.toString();
    }

}
