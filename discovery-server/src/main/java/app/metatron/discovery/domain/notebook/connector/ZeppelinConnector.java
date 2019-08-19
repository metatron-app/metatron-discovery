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
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

import app.metatron.discovery.domain.notebook.Notebook;
import app.metatron.discovery.domain.notebook.NotebookConnector;
import app.metatron.discovery.domain.notebook.content.NotebookContent;
import app.metatron.discovery.domain.notebook.content.PyNotebookContent;
import app.metatron.discovery.domain.notebook.content.RNotebookContent;
import app.metatron.discovery.domain.notebook.content.ScalaNotebookContent;

/**
 * Created by kyungtaak on 2016. 10. 21..
 */
@Entity
@DiscriminatorValue("zeppelin")
@JsonTypeName("zeppelin")
public class ZeppelinConnector extends NotebookConnector implements NotebookAction {

    private static Logger LOGGER = LoggerFactory.getLogger(ZeppelinConnector.class);

    public static final String URI_NOTEBOOK = "/api/notebook";

    public static final String URI_NOTEBOOK_ITEM = "/api/notebook/{notebookId}";

    public static final String URI_NOTEBOOK_JOB = "/api/notebook/job/{notebookId}";

    public static final String URI_NOTEBOOK_ITEM_PARAGRAPH = "/api/notebook/{notebookId}/paragraph";

    public static final String URI_NOTEBOOK_ITEM_PARAGRAPH_ITEM = "/api/notebook/{notebookId}/paragraph/{paragraphId}";

    public ZeppelinConnector() {
    }

    @Override
    public String getAPIUrl(String itemId) {
        StringBuilder builder = new StringBuilder();
        builder.append(URI_NOTEBOOK).append(File.separator);
        builder.append(itemId);

        return getConnectionUrl(builder.toString());
    }

    @Override
    public String getLinkUrl(String itemId) {
        StringBuilder builder = new StringBuilder();
        builder.append("/#/notebook/");
        builder.append(itemId);

        return getConnectionUrl(builder.toString());
    }

    @Override
    public String createNotebook(Notebook notebook) {
        try {
            Map<String, Object> notebookRequest = Maps.newHashMap();
            notebookRequest.put("name", notebook.getName());

            if (!notebook.getDsType().equals(Notebook.DSType.NONE)) {
                URL cUrl = new URL(notebook.getCurrentUrl());
                int cPort = cUrl.getPort() == -1 ? 80 : cUrl.getPort();
                List<Paragraph> paragraphList = Lists.newArrayList();
                paragraphList.add(new Paragraph("1. load dataset",
                        "// 1. load dataset" + System.lineSeparator() +
                                "import app.metatron.discovery.connector._;" + System.lineSeparator() +
                                "val conf = new MetisClientSetting();" + System.lineSeparator() +
                                "conf.setting(\"host\", \"" + cUrl.getHost() + "\").setting(\"port\", \"" + cPort + "\");" + System.lineSeparator() +
                                "val client = new MetisClient(conf);" + System.lineSeparator() +
                                "val dataset = client.loadData(spark, \"" + notebook.getDsType().getValue() + "\", \"" + notebook.getDsId() + "\", \"" + 1000 + "\")",
                        0));
                paragraphList.add(new Paragraph("2. analyze",
                        "// 2. analyze" + System.lineSeparator() + "dataset.show()", 1));
                notebookRequest.put("paragraphs", paragraphList);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(notebookRequest, headers);

            Optional<ZeppelinResponse> response = httpRepository.call(getConnectionUrl(URI_NOTEBOOK), HttpMethod.POST, entity, ZeppelinResponse.class);

            return response
                    .map(zeppelinResponse -> (String) zeppelinResponse.getBody())
                    .orElseThrow(() -> new RuntimeException("Fail to create notebook of zeppelin from " + getUrl()));
        } catch (MalformedURLException e) {
            throw new RuntimeException("Fail to create notebook of zeppelin from " + getUrl());
        }
    }

    @Override
    public void deleteNotebook(String notebookId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(headers);

//      UriComponents targetUrl = UriComponentsBuilder
//              .fromHttpUrl(getConnectionUrl(URI_NOTEBOOK_ITEM))
//              .buildAndExpand(notebookId);
//
//      Optional<ZeppelinResponse> response = httpRepository.call(targetUrl.toUriString(), HttpMethod.DELETE, entity, ZeppelinResponse.class);
            Optional<ZeppelinResponse> response = httpRepository.call(notebookId, HttpMethod.DELETE, entity, ZeppelinResponse.class);

            response.filter(zeppelinResponse -> "OK".equals(zeppelinResponse.getStatus()))
                    .orElseThrow(() -> new RuntimeException("Fail to delete notebook of zeppelin from " + getUrl()));
        } catch (Exception e) {
            LOGGER.warn("No content to delete.");
        }
    }

    @Override
    public String runAllJobs(Notebook notebook) {
        try {
            if (notebook.getPreContent() != null) {
                settingNotebookContent(notebook);
            }
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(headers);

            UriComponents targetUrl = UriComponentsBuilder
                    .fromHttpUrl(getConnectionUrl(URI_NOTEBOOK_JOB))
                    .buildAndExpand(notebook.getRefId());

            Optional<ZeppelinResponse> response = httpRepository
                    .call(targetUrl.toUriString(), HttpMethod.POST, entity, ZeppelinResponse.class);

            response.filter(zeppelinResponse -> "OK".equals(zeppelinResponse.getStatus()))
                    .orElseThrow(() -> new RuntimeException("Fail to run notebook of zeppelin from " + getUrl()));

            return "The job in zeppelin has called successfully.";
        } catch (Exception e) {
            throw new RuntimeException("Fail to run job [zeppelin].");
        }
    }

    /**
     * Setting notebook content
     */
    private void settingNotebookContent(Notebook notebook) {
        NotebookContent content = notebook.getPreContent();
        List<ParagraphBody> paragraphs = getParagraphs(notebook.getRefId());
        deleteParagraph(notebook.getRefId(), paragraphs.get(content.getLine()).getId());
        String sentence;
        if ("r".equals(content.getLanguage())) {
            sentence = new RNotebookContent().getSentence(content.getVars());
        } else if ("scala".equals(content.getLanguage()) || "spark".equals(content.getLanguage())) {
            sentence = new ScalaNotebookContent().getSentence(content.getVars());
        } else if ("python".equals(content.getLanguage())) {
            sentence = new PyNotebookContent().getSentence(content.getVars());
        } else {
            throw new RuntimeException("Invalid language format in Notebook.");
        }
        createParagraph(notebook.getRefId(), sentence, content.getLine());
    }

    /**
     * Get information of paragraphs
     *
     * @param notebookId
     * @return
     */
    private List<ParagraphBody> getParagraphs(String notebookId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(headers);

        UriComponents targetUrl = UriComponentsBuilder
                .fromHttpUrl(getConnectionUrl(URI_NOTEBOOK_JOB))
                .buildAndExpand(notebookId);

        Optional<ZeppelinResponse2> response = httpRepository
                .call(targetUrl.toUriString(), HttpMethod.GET, entity, ZeppelinResponse2.class);

        return response
                .map(zeppelinResponse2 -> zeppelinResponse2.getBody())
                .orElseThrow(() -> new RuntimeException("Fail to create notebook of zeppelin from " + getUrl()));
    }

    /**
     * Delete the paragraph
     *
     * @param notebookId
     * @param paragraphId
     */
    private void deleteParagraph(String notebookId, String paragraphId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(headers);

            UriComponents targetUrl = UriComponentsBuilder
                    .fromHttpUrl(getConnectionUrl(URI_NOTEBOOK_ITEM_PARAGRAPH_ITEM))
                    .buildAndExpand(notebookId, paragraphId);

            Optional<ZeppelinResponse> response = httpRepository.call(targetUrl.toUriString(), HttpMethod.DELETE, entity, ZeppelinResponse.class);

            response.filter(zeppelinResponse -> "OK".equals(zeppelinResponse.getStatus()))
                    .orElseThrow(() -> new RuntimeException("Fail to delete notebook of zeppelin from " + getUrl()));
        } catch (Exception e) {
            LOGGER.warn("No paragraph to delete.");
        }
    }

    /**
     * Create a new paragraph
     *
     * @param notebookId
     * @param sentence
     * @param index
     */
    private void createParagraph(String notebookId, String sentence, int index) {
        Map<String, Object> notebookRequest = Maps.newHashMap();
        notebookRequest.put("title", "# Setting variables");
        notebookRequest.put("text", sentence);
        notebookRequest.put("index", index);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(notebookRequest, headers);

        UriComponents targetUrl = UriComponentsBuilder
                .fromHttpUrl(getConnectionUrl(URI_NOTEBOOK_ITEM_PARAGRAPH))
                .buildAndExpand(notebookId);

        Optional<ZeppelinResponse> response = httpRepository
                .call(targetUrl.toUriString(), HttpMethod.POST, entity, ZeppelinResponse.class);

        response.filter(zeppelinResponse -> ("OK".equals(zeppelinResponse.getStatus()) || "CREATED".equals(zeppelinResponse.getStatus())))
                .orElseThrow(() -> new RuntimeException("Fail to create a new paragraph in notebook of zeppelin from " + getUrl()));
    }

    @Override
    public String nbconvertScript(Notebook notebook) {
        return null;
    }

    @Override
    public void createDirectory(String workspaceId) {

    }

    @Override
    public void killAllKernels() {

    }

    public static class ZeppelinResponse implements Serializable {

        String status;
        String message;
        Object body;

        public ZeppelinResponse() {
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public Object getBody() {
            return body;
        }

        public void setBody(Object body) {
            this.body = body;
        }
    }

    public static class ZeppelinResponse2 implements Serializable {

        String status;
        String message;
        List<ParagraphBody> body;

        public ZeppelinResponse2() {
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public List<ParagraphBody> getBody() {
            return body;
        }

        public void setBody(List<ParagraphBody> body) {
            this.body = body;
        }
    }

    public static class Paragraph implements Serializable {

        String title;
        String text;
        int index;

        public Paragraph() {
        }

        public Paragraph(String title, String text) {
            this.title = title;
            this.text = text;
        }

        public Paragraph(String title, String text, int index) {
            this.title = title;
            this.text = text;
            this.index = index;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }

        public int getIndex() {
            return index;
        }

        public void setIndex(int index) {
            this.index = index;
        }
    }

    public static class ParagraphBody implements Serializable {

        String id;
        String status;
        String finished;
        String started;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getFinished() {
            return finished;
        }

        public void setFinished(String finished) {
            this.finished = finished;
        }

        public String getStarted() {
            return started;
        }

        public void setStarted(String started) {
            this.started = started;
        }
    }
}
