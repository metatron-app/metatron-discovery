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

import com.fasterxml.jackson.annotation.JsonTypeName;

import org.apache.commons.lang3.NotImplementedException;

import java.util.Map;

import javax.persistence.*;

import app.metatron.discovery.domain.notebook.content.NotebookContent;
import app.metatron.discovery.domain.workspace.Book;
import app.metatron.discovery.domain.workspace.Workspace;

/**
 * Created by kyungtaak on 2016. 10. 21..
 */
@Entity
@Table(name = "book_notebook")
@JsonTypeName("notebook")
@DiscriminatorValue("notebook")
public class Notebook extends Book {

    @Column(name = "nb_ref_id")
    String refId;

    @Column(name = "kernel_type")
    @Enumerated(EnumType.STRING)
    KernelType kernelType;

    // dataset type
    @Column(name = "ds_type")
    @Enumerated(EnumType.STRING)
    DSType dsType;

    // dataset id
    @Column(name = "ds_id")
    String dsId;

    // dataset name
    @Column(name = "ds_name")
    String dsName;

    @Column(name = "nb_link")
    String link;

    @Column(name = "api_link")
    String aLink;

    @Transient
    String script;

    @Transient
    String currentUrl;

    @Transient
    NotebookContent preContent;

//  @OneToMany(cascade = CascadeType.ALL, mappedBy = "notebook")
//  Set<NotebookModel> models;

    @OneToOne(cascade = {CascadeType.ALL})
    @JoinColumn(name = "api_id")
    NotebookAPI notebookAPI;

    @ManyToOne(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "nb_connector")
    NotebookConnector connector;

    public Notebook() {
    }

    @Override
    public Book copyOf(Workspace parent, boolean addPrefix) {
        throw new NotImplementedException("TODO");
    }

    @Override
    public Map<String, Object> listViewProjection() {
        Map<String, Object> projection = super.listViewProjection();
        projection.put("type", "notebook");
        projection.put("link", getLink());
        projection.put("connector", this.connector.getName());

        return projection;
    }

    @Override
    public Map<String, Object> treeViewProjection() {
        Map<String, Object> projection = super.treeViewProjection();
        projection.put("type", "notebook");
        projection.put("link", getLink());
        projection.put("connector", this.connector.getName());

        return projection;
    }

//    @JsonIgnore
//    public String getLink() {
//
//        if (connector == null) {
//            return null;
//        }
//
//        return connector.getLinkUrl(refId);
//    }

    public String getRefId() {
        return refId;
    }

    public void setRefId(String refId) {
        this.refId = refId;
    }

    public String getDsId() {
        return dsId;
    }

    public void setDsId(String dsId) {
        this.dsId = dsId;
    }

    public String getDsName() {
        return dsName;
    }

    public void setDsName(String dsName) {
        this.dsName = dsName;
    }

    public DSType getDsType() {
        return dsType;
    }

    public void setDsType(DSType dsType) {
        this.dsType = dsType;
    }

    public KernelType getKernelType() {
        return kernelType;
    }

    public void setKernelType(KernelType kernelType) {
        this.kernelType = kernelType;
    }

//  public Set<NotebookModel> getModels() {
//    return models;
//  }
//
//  public void setModels(Set<NotebookModel> models) {
//    this.models = models;
//  }

    public String getScript() {
        return script;
    }

    public void setScript(String script) {
        this.script = script;
    }

    public String getCurrentUrl() {
        return currentUrl;
    }

    public void setCurrentUrl(String currentUrl) {
        this.currentUrl = currentUrl;
    }

    public NotebookContent getPreContent() {
        return preContent;
    }

    public void setPreContent(NotebookContent preContent) {
        this.preContent = preContent;
    }

    public String getLink() {
        return link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getaLink() {
        return aLink;
    }

    public void setaLink(String aLink) {
        this.aLink = aLink;
    }

    public NotebookAPI getNotebookAPI() {
        return notebookAPI;
    }

    public void setNotebookAPI(NotebookAPI notebookAPI) {
        this.notebookAPI = notebookAPI;
    }

    public NotebookConnector getConnector() {
        return connector;
    }

    public void setConnector(NotebookConnector connector) {
        this.connector = connector;
    }

//    /**
//     * Create Load Data API
//     *
//     * @param url
//     * @return
//     */
//    public String generateDataUrl(String url) {
//        StringBuilder builder = new StringBuilder();
//        builder.append("http://");
//        try {
//            URL current = new URL(url);
//            builder.append(current.getHost()).append(":").append(current.getPort());
//        } catch (MalformedURLException e) {
//            e.printStackTrace();
//        }
//        builder.append("/api").append(getContextPathOfData()).append("/").append(getDsId()).append("/data");
//
//        return builder.toString();
//    }
//
//    /**
//     *
//     * @return
//     */
//    private String getContextPathOfData() {
//        if (DSType.DATASOURCE.equals(getDsType())) {
//            return "/datasources";
//        } else if(DSType.DASHBOARD.equals(getDsType())) {
//            return "/dashboards";
//        } else if(DSType.CHART.equals(getDsType())) {
//            return "/widgets";
//        } else {
//            throw new RuntimeException("Invalid dataset type");
//        }
//    }

    public enum KernelType {
        R, PYTHON, SPARK
    }

    public enum DSType {
        DATASOURCE("datasources"), DASHBOARD("dashboards"), CHART("charts"), NONE("none");

        private String value;

        DSType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

}
