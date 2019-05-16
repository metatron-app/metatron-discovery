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

import app.metatron.discovery.domain.notebook.connector.HttpRepository;
import app.metatron.discovery.domain.notebook.content.NotebookContent;
import app.metatron.discovery.domain.workspace.BookTreeService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Created by kyungtaak on 2016. 10. 22..
 */
@RepositoryRestController
public class NotebookController {

    private static Logger LOGGER = LoggerFactory.getLogger(NotebookController.class);

    @Autowired
    NotebookRepository notebookRepository;

    @Autowired
    HttpRepository httpRepository;

    @Autowired
    BookTreeService bookTreeService;

    /**
     * Notebook 상세조회 > API 제거
     */
    @RequestMapping(path = "/notebooks/rest/{id}", method = RequestMethod.DELETE)
    public
    @ResponseBody
    ResponseEntity<?> deleteNotebookAPI(@PathVariable("id") String id) {

        Notebook notebook = notebookRepository.findOne(id);
        if (notebook == null) {
            return ResponseEntity.notFound().build();
        }

        notebook.setNotebookAPI(null);

        notebookRepository.saveAndFlush(notebook);

        return ResponseEntity.noContent().build();
    }

    /**
     * Notebook 상세조회 > API 수정
     */
    @RequestMapping(path = "/notebooks/rest/{id}", method = RequestMethod.PATCH)
    public
    @ResponseBody
    ResponseEntity<?> updateNoteBookAPI(
        @PathVariable("id") String id, @RequestBody Map<String, String> apiInfo) {

        Notebook notebook = notebookRepository.findOne(id);
        if (notebook == null) {
            return ResponseEntity.notFound().build();
        }

        notebook.getNotebookAPI().setName(apiInfo.containsKey("name") ? apiInfo.get("name") : "");
        notebook.getNotebookAPI().setDesc(apiInfo.containsKey("desc") ? apiInfo.get("desc") : "");
        notebook.getNotebookAPI()
            .setReturnType(apiInfo.containsKey("returnType") ? NotebookAPI.ReturnType.valueOf(apiInfo.get("returnType")) : NotebookAPI.ReturnType.Void);

        notebookRepository.save(notebook);

        NotebookAPI api = notebook.getNotebookAPI();
        Map<String, Object> message = new HashMap<String, Object>();
        message.put("id", api.getId());
        message.put("name", api.getName());
        message.put("desc", api.getDesc());
        message.put("url", api.getUrl());
        message.put("returnType", api.getReturnType().toString());

        Map<String, Object> json = new HashMap<String, Object>();
        json.put("notebookAPI", message);

        return ResponseEntity.ok(json);
    }

    /**
     * Notebook 상세조회 > API 실행 (Add -d option)
     */
    @RequestMapping(path = "/notebooks/rest/{id}", method = RequestMethod.PUT
        , produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE})
    public
    @ResponseBody
    ResponseEntity<?> executeNoteBookPutAPI(@PathVariable("id") String id,
        @RequestBody(required = false) NotebookContent parameters) {
        Notebook notebook = notebookRepository.findOne(id);
        if (notebook == null) {
            return ResponseEntity.notFound().build();
        } else if (notebook.getNotebookAPI() == null) {
            return ResponseEntity.badRequest().build();
        }
        if (parameters != null) {
            notebook.setPreContent(parameters);
        }

        NotebookConnector connector = notebook.getConnector();
        if (connector == null) {
            throw new RuntimeException("Connector required.");
        }
        connector.setHttpRepository(httpRepository);

        return ResponseEntity.ok(connector.runAllJobs(notebook));
    }

    /**
     * Notebook 상세조회 > API 실행 (No -d option)
     */
    @RequestMapping(path = "/notebooks/rest/{id}", method = RequestMethod.GET
        , produces = {MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE})
    public
    @ResponseBody
    ResponseEntity<?> executeNoteBookGetAPI(@PathVariable("id") String id) {

        Notebook notebook = notebookRepository.findOne(id);
        if (notebook == null) {
            return ResponseEntity.notFound().build();
        } else if (notebook.getNotebookAPI() == null) {
            return ResponseEntity.badRequest().build();
        }

        NotebookConnector connector = notebook.getConnector();
        if (connector == null) {
            throw new RuntimeException("Connector required.");
        }
        connector.setHttpRepository(httpRepository);

        return ResponseEntity.ok(connector.runAllJobs(notebook));
    }

    /**
     * Notebook 상세조회 > API 등록
     */
    @RequestMapping(path = "/notebooks/rest/{id}", method = RequestMethod.POST)
    public
    @ResponseBody
    ResponseEntity<?> createNoteBookAPI(
        @PathVariable("id") String id, @RequestBody Map<String, String> apiInfo,
        HttpServletRequest request) {

        Notebook notebook = notebookRepository.findOne(id);
        if (notebook == null) {
            return ResponseEntity.notFound().build();
        }

        NotebookAPI notebookAPI = new NotebookAPI();
        notebookAPI.setId(id);
        notebookAPI.setName(apiInfo.containsKey("name") ? apiInfo.get("name") : "");
        notebookAPI.setDesc(apiInfo.containsKey("desc") ? apiInfo.get("desc") : "");
        notebookAPI.setReturnType(apiInfo.containsKey("returnType") ? NotebookAPI.ReturnType.valueOf(apiInfo.get("returnType")) : NotebookAPI.ReturnType.Void);
        notebookAPI.setUrl(request.getRequestURL().toString());
        notebook.setNotebookAPI(notebookAPI);

        notebookRepository.save(notebook);

        return ResponseEntity.ok(notebook);
    }

    /**
     * 워크스페이스 > 목록 > 노트북 일괄 삭제
     */
    @RequestMapping(path = "/notebooks/{ids}", method = RequestMethod.DELETE)
    public
    @ResponseBody
    ResponseEntity<?> deleteNotebooks(@PathVariable("ids") List<String> ids) {
        for (String id : ids) {
            Notebook notebook = notebookRepository.findOne(id);
            if (notebook == null) {
                LOGGER.warn("Fail to find notebook : {}", id);
                continue;
            }
            NotebookConnector connector = notebook.getConnector();
            connector.setHttpRepository(httpRepository);
            connector.deleteNotebook(notebook.getaLink());

            notebookRepository.delete(notebook);
            bookTreeService.deleteTree(notebook);
        }

        return ResponseEntity.noContent().build();
    }

}
