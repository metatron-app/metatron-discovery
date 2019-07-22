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

package app.metatron.discovery.domain.notebook.connector;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonTypeName;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.File;
import java.io.Serializable;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

import app.metatron.discovery.common.JupyterCommandBuilder;
import app.metatron.discovery.domain.notebook.Notebook;
import app.metatron.discovery.domain.notebook.NotebookAPI;
import app.metatron.discovery.domain.notebook.NotebookConnector;

/**
 * Created by kyungtaak on 2016. 10. 22..
 */
@Entity
@DiscriminatorValue("jupyter")
@JsonTypeName("jupyter")
public class JupyterConnector extends NotebookConnector implements NotebookAction {

    private static Logger LOGGER = LoggerFactory.getLogger(JupyterConnector.class);

    public static final String URI_CONTENTS = "/api/contents";

    public static final String URI_CONTENTS_ITEM = "/api/contents/{contentPath}";

    public static final String URI_NBCONVERT_SCRIPT = "/nbconvert/script/{notebookPath}";
    public static final String URI_NBCONVERT_NOTEBOOK = "/nbconvert/notebook/{notebookPath}";

    public static final String URI_KERNELS = "/api/kernels";

    public static final String URI_KERNELS_ID = "/api/kernels/{kernelId}";

    @Override
    public String getAPIUrl(String itemId) {
        StringBuilder builder = new StringBuilder();
        builder.append(URI_CONTENTS).append(File.separator);
        builder.append(itemId);

        return getConnectionUrl(builder.toString());
    }

    @Override
    public String getLinkUrl(String itemId) {
        StringBuilder builder = new StringBuilder();
        builder.append("/notebooks/");
        builder.append(itemId);

        return getConnectionUrl(builder.toString());
    }

    /**
     * convert notebook to script
     *
     * @param notebook
     * @return
     */
    @Override
    public String nbconvertScript(Notebook notebook) {
        String ipynb = notebook.getRefId();
        String tempFilePath = System.getProperty("java.io.tmpdir") + File.separator + UUID.randomUUID().toString();
        try {
            Path scriptPath = Paths.get(tempFilePath + getFileExtension(notebook.getKernelType()));
            UriComponents createScriptUrl = UriComponentsBuilder
                    .fromHttpUrl(getConnectionUrl(URI_NBCONVERT_SCRIPT))
                    .buildAndExpand(ipynb);
            Optional<String> response = httpRepository.call(createScriptUrl.toUriString(), HttpMethod.GET, null, String.class, true);
            Files.write(scriptPath, filterMethods(response.get()).getBytes());
            LOGGER.debug("NBCONVERT notebook to script-file-path is " + scriptPath.toString());
            return scriptPath.toString();
        } catch (Exception e) {
            LOGGER.debug("NBCONVERT script API failed. - " + ipynb);
            try {
                //1. download notebook file (w/ipynb)
                String tempNotebookPath = tempFilePath + ".ipynb";
                Path notebookPath = Paths.get(tempNotebookPath);
                UriComponents createNotebookUrl = UriComponentsBuilder
                        .fromHttpUrl(getConnectionUrl(URI_NBCONVERT_NOTEBOOK))
                        .buildAndExpand(ipynb);
                Optional<String> response = httpRepository.call(createNotebookUrl.toUriString(), HttpMethod.GET, null, String.class, true);
                Files.write(notebookPath, filterMethods(response.get()).getBytes());
                LOGGER.debug("NBCONVERT notebook to notebook-file-path is " + notebookPath.toString());
                //2. convert notebook to script (jupyter nbconvert --to script notebookPath.ipynb --output tempFilePath)
                JupyterCommandBuilder builder = new JupyterCommandBuilder();
                builder.setAction("nbconvert");
                builder.setNbFormat("script");
                builder.setSource(tempNotebookPath);
                builder.setTarget(tempFilePath);
                builder.run();
                return tempFilePath + getFileExtension(notebook.getKernelType());
            } catch (Exception e1) {
                throw new RuntimeException("Fail to convert notebook to script from " + getUrl());
            }
        }
    }

    /**
     * Filtering specific methods in notebook script
     *
     * @param input
     * @return
     */
    private String filterMethods(String input) {
        String result = input;
        Pattern magicPattern = Pattern.compile("%matplotlib inline", Pattern.DOTALL);
        Matcher magicMatcher = magicPattern.matcher(input);
        if(magicMatcher.find()) {
            result = input.replaceAll(magicPattern.pattern(),"import matplotlib;matplotlib.use('Agg')");
        }
        Pattern showPattern = Pattern.compile("show\\((.*?)\\)", Pattern.DOTALL);
        Matcher showMatcher = showPattern.matcher(result);
        if(showMatcher.find()) {
            result = result.replaceAll(showPattern.pattern(),"");
        }
        return result;
    }

//    /**
//     * 워크스페이스 > 노트북 상세조회 > 모델등록 요청
//     */
//    @Override
//    public String publishModel(NotebookModel model) {
//        try {
//            String ipynb = model.getNotebook().getRefId();
//            String notebookDir = metatronProperties.getNotebook().getBaseDir() + getDirectoryPath(ipynb);
//            Path scriptPath = Paths.get(notebookDir + File.separator +
//                    UUID.randomUUID().toString() +
//                    getFileExtension(model.getNotebook().getKernelType()));
//            UriComponents createScriptUrl = UriComponentsBuilder
//                    .fromHttpUrl(getConnectionUrl(URI_NBCONVERT_SCRIPT))
//                    .buildAndExpand(ipynb);
//            Optional<String> response = httpRepository.call(createScriptUrl.toUriString(), HttpMethod.GET, null, String.class, true);
//
//            File directory = new File(notebookDir);
//            if (!directory.exists()) {
//                directory.mkdir();
//            }
//            Files.write(scriptPath, response.get().getBytes());
//            return scriptPath.toString();
//        } catch (IOException | RuntimeException e) {
//            throw new RuntimeException("Fail to convert notebook to script from " + hostname);
//        }
//    }

    /**
     * 워크스페이스 - 노트북 서버 연결 시
     */
    @Override
    public void createDirectory(String workspaceId) {
        try {
            // 1. 디렉토리 존재 확인
            UriComponents getUrl = UriComponentsBuilder
                    .fromHttpUrl(getConnectionUrl(URI_CONTENTS_ITEM))
                    .buildAndExpand(workspaceId);
            httpRepository.call(getUrl.toUriString(), HttpMethod.GET, null, String.class, true);
        } catch (RuntimeException re) {
            if (re.getMessage().contains("No such")) {
                // 2. 빈 디렉토리 생성
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setAccept(Lists.newArrayList(MediaType.APPLICATION_JSON));

                Map<String, Object> notebookRequest = Maps.newHashMap();
                notebookRequest.put("type", "directory");
                HttpEntity<Map<String, Object>> createEntity = new HttpEntity<>(notebookRequest, headers);

                UriComponents postUrl = UriComponentsBuilder
                        .fromHttpUrl(getConnectionUrl(URI_CONTENTS))
                        .buildAndExpand();
                Optional<JupyterResponse> response = httpRepository.call(postUrl.toUriString(), HttpMethod.POST, createEntity, JupyterConnector.JupyterResponse.class, true);

                // 3. 이름 바꾸기
                String srcPath = response
                        .map(jupyterResponse -> jupyterResponse.getPath())
                        .orElseThrow(() -> new RuntimeException("Fail to create directory of jupyter from " + getUrl()));

                notebookRequest = Maps.newHashMap();
                notebookRequest.put("path", workspaceId);

                HttpEntity<Map<String, Object>> patchEntity = new HttpEntity<>(notebookRequest, headers);
                UriComponents patchUrl = UriComponentsBuilder
                        .fromHttpUrl(getConnectionUrl(URI_CONTENTS_ITEM))
                        .buildAndExpand(srcPath);
                response = httpRepository.call(patchUrl.toUriString(), HttpMethod.PATCH, patchEntity, JupyterConnector.JupyterResponse.class, true);
                response
                        .map(jupyterResponse -> jupyterResponse.getPath())
                        .orElseThrow(() -> new RuntimeException("Fail to create directory of jupyter from " + getUrl()));
            } else {
                throw new RuntimeException("Fail to create directory of jupyter from " + getUrl());
            }
        }
    }

    /**
     * 워크스페이스, 차트 > 노트북 생성 > 완료
     */
    @Override
    public String createNotebook(Notebook notebook) {
        // 1. 빈 파일 생성 (POST)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(Lists.newArrayList(MediaType.APPLICATION_JSON));

        Map<String, Object> notebookRequest = Maps.newHashMap();
        notebookRequest.put("type", "notebook");
        HttpEntity<Map<String, Object>> createEntity = new HttpEntity<>(notebookRequest, headers);

        UriComponents postUrl = UriComponentsBuilder
                .fromHttpUrl(getConnectionUrl(URI_CONTENTS_ITEM))
                .buildAndExpand(notebook.getWorkspace().getId());
        Optional<JupyterResponse> response = httpRepository.call(postUrl.toUriString(), HttpMethod.POST, createEntity, JupyterConnector.JupyterResponse.class, true);

        // 2. 빈 파일 이름 변경 (PATCH)
        String srcPath = response
                .map(jupyterResponse -> jupyterResponse.getPath())
                .orElseThrow(() -> new RuntimeException("Fail to create notebook of jupyter from " + getUrl()));

        notebookRequest = Maps.newHashMap();
        notebookRequest.put("path", notebook.getWorkspace().getId() + File.separator + UUID.randomUUID().toString() + ".ipynb");
        HttpEntity<Map<String, Object>> patchEntity = new HttpEntity<>(notebookRequest, headers);

        UriComponents patchUrl = UriComponentsBuilder
                .fromHttpUrl(getConnectionUrl(URI_CONTENTS_ITEM))
                .buildAndExpand(srcPath);
        response = httpRepository.call(patchUrl.toUriString(), HttpMethod.PATCH, patchEntity, JupyterConnector.JupyterResponse.class, true);

        // 3. 데이터 소스 로딩 관련 Cell 추가 (PUT)
        String destPath = response
                .map(jupyterResponse -> jupyterResponse.getPath())
                .orElseThrow(() -> new RuntimeException("Fail to create notebook of jupyter from " + getUrl()));

        notebookRequest = Maps.newHashMap();
        notebookRequest.put("type", "notebook");
        JupyterBuilder builder = notebook.getKernelType().equals(Notebook.KernelType.R) ? new RBuilder() : new Py3Builder();
        notebookRequest.put("content", builder.createCells(notebook));
        HttpEntity<Map<String, Object>> putEntity = new HttpEntity<>(notebookRequest, headers);

        UriComponents putUrl = UriComponentsBuilder
                .fromHttpUrl(getConnectionUrl(URI_CONTENTS_ITEM))
                .buildAndExpand(destPath);
        response = httpRepository.call(putUrl.toUriString(), HttpMethod.PUT, putEntity, JupyterConnector.JupyterResponse.class, true);

        // 4. 결과 받기
        return response
                .map(jupyterResponse -> jupyterResponse.getPath())
                .orElseThrow(() -> new RuntimeException("Fail to create notebook of jupyter from " + getUrl()));
    }

    /**
     *  노트북 삭제
     *
     * @param notebookId
     */
    @Override
    public void deleteNotebook(String notebookId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(headers);

//            UriComponents targetUrl = UriComponentsBuilder
//                    .fromHttpUrl(getConnectionUrl(URI_CONTENTS_ITEM))
//                    .buildAndExpand(notebookId);
//
//            httpRepository.call(targetUrl.toUriString(), HttpMethod.DELETE, entity, JupyterConnector.JupyterResponse.class, true);
            httpRepository.call(notebookId, HttpMethod.DELETE, entity, JupyterConnector.JupyterResponse.class, true);
        } catch (Exception e) {
            LOGGER.warn("No content to delete.");
        }
    }

    /**
     * kill all kernels
     */
    @Override
    public void killAllKernels() {
        UriComponents getUrl = UriComponentsBuilder.fromHttpUrl(getConnectionUrl(URI_KERNELS)).build();
        Optional<JupyterKernelResponse[]> kernels = httpRepository.call(getUrl.toUriString(), HttpMethod.GET, null, JupyterKernelResponse[].class, true);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(headers);

        for(JupyterKernelResponse response : kernels.get()) {
            UriComponents targetUrl = UriComponentsBuilder.fromHttpUrl(getConnectionUrl(URI_KERNELS_ID)).buildAndExpand(response.getId());
            httpRepository.call(targetUrl.toUriString(), HttpMethod.DELETE, entity, JupyterConnector.JupyterKernelResponse.class, true);
        }
    }

    /**
     * 노트북 실행
     *
     * @param notebook
     */
    @Override
    public String runAllJobs(Notebook notebook) {
        try {
            JupyterBuilder builder;
            if (Notebook.KernelType.R.equals(notebook.getKernelType())) {
                builder = new RBuilder();
            } else if (Notebook.KernelType.PYTHON.equals(notebook.getKernelType())) {
                builder = new Py3Builder();
            } else {
                throw new RuntimeException("Not exists or unsupported kernel type.");
            }
            notebook.setScript(nbconvertScript(notebook));
            return generate(notebook, builder);
        } catch (Exception e) {
            throw new RuntimeException("Fail to run job [jupyter].");
        }
    }

    /**
     * generate result view in jupyter notebook
     *
     * @param notebook
     * @param builder
     * @return
     * @throws Exception
     */
    private String generate(Notebook notebook, JupyterBuilder builder) throws Exception {
        String viewer;
        NotebookAPI notebookAPI = notebook.getNotebookAPI();
        if (NotebookAPI.ReturnType.HTML.equals(notebookAPI.getReturnType())) {
            viewer = builder.generateHTML(notebook);
        } else if (NotebookAPI.ReturnType.JSON.equals(notebookAPI.getReturnType())) {
            viewer = builder.generateJSON(notebook);
        } else if (NotebookAPI.ReturnType.Void.equals(notebookAPI.getReturnType())) {
            viewer = "";
        } else {
            throw new RuntimeException("Fail to generate result view.");
        }
        return viewer;
    }

    /**
     * 파일 확장자 추출
     *
     * @param kernelType
     * @return
     */
    private String getFileExtension(Notebook.KernelType kernelType) {
        if (kernelType.equals(Notebook.KernelType.R)) {
            return ".R";
        } else {  // PYTHON
            return ".py";
        }
    }

//    /**
//     *
//     * @param name
//     * @return
//     */
//    private String getDirectoryPath(String name) {
//        if (name == null || name.isEmpty() || !name.contains(File.separator)) {
//            return "";
//        } else {
//            return name.split(File.separator)[0];
//        }
//    }

    public static class JupyterResponse implements Serializable {

        String name;
        String path;
        String format;
        Boolean writable;
        Object content;
        String lastModified;
        String created;

        public JupyterResponse() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public String getFormat() {
            return format;
        }

        public void setFormat(String format) {
            this.format = format;
        }

        public Boolean getWritable() {
            return writable;
        }

        public void setWritable(Boolean writable) {
            this.writable = writable;
        }

        public Object getContent() {
            return content;
        }

        public void setContent(Object content) {
            this.content = content;
        }

        public String getLastModified() {
            return lastModified;
        }

        public void setLastModified(String lastModified) {
            this.lastModified = lastModified;
        }

        public String getCreated() {
            return created;
        }

        public void setCreated(String created) {
            this.created = created;
        }
    }

    public static class JupyterKernelResponse implements Serializable {

        String id;
        String name;
        String last_activity;
        String execution_state;
        int connections;

        public JupyterKernelResponse() {
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getLast_activity() {
            return last_activity;
        }

        public void setLast_activity(String last_activity) {
            this.last_activity = last_activity;
        }

        public String getExecution_state() {
            return execution_state;
        }

        public void setExecution_state(String execution_state) {
            this.execution_state = execution_state;
        }

        public int getConnections() {
            return connections;
        }

        public void setConnections(int connections) {
            this.connections = connections;
        }
    }

}
