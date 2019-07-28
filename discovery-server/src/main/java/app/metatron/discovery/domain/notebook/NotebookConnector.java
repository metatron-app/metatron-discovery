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

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.http.HttpMethod;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Set;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.notebook.connector.HttpRepository;
import app.metatron.discovery.domain.notebook.connector.NotebookAction;
import app.metatron.discovery.domain.workspace.Workspace;

/**
 * Created by kyungtaak on 2016. 10. 21..
 */
@Entity
@Table(name = "notebook_connector")
@DiscriminatorColumn(name = "type")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
//@JsonSubTypes({
//    @JsonSubTypes.Type(value = ZeppelinConnector.class, name = "zeppelin"),
//    @JsonSubTypes.Type(value = JupyterConnector.class, name = "jupyter")
//})
public abstract class NotebookConnector extends AbstractHistoryEntity implements MetatronDomain<String>, NotebookAction {

    @Id
    @GeneratedValue(generator = "uuid")
    @GenericGenerator(name = "uuid", strategy = "uuid2")
    @Column(name = "id")
    protected String id;

    @Column(name = "type", insertable = false, updatable = false)
    protected String type;

    @Column(name = "nc_name")
    @NotNull
    protected String name;

    @Column(name = "nc_desc")
    protected String description;

    @Column(name = "nc_hostname")
    protected String hostname;

    @Column(name = "nc_port")
    protected Integer port;

    @Column(name = "nc_url")
    protected String url;

    @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    @JoinTable(name = "connector_workspace",
            joinColumns = @JoinColumn(name = "nc_id", referencedColumnName = "id"),
            inverseJoinColumns = @JoinColumn(name = "ws_id", referencedColumnName = "id"))
    Set<Workspace> workspaces;

    @OneToMany(mappedBy = "connector", cascade = {CascadeType.REMOVE, CascadeType.MERGE, CascadeType.PERSIST})
    @JsonBackReference
    protected Set<Notebook> notebooks;

    @Transient
    protected HttpRepository httpRepository;

//    @Transient
//    protected MetatronProperties metatronProperties;

    public NotebookConnector() {
    }

    @JsonIgnore
    public abstract String getAPIUrl(String itemId);

    @JsonIgnore
    public abstract String getLinkUrl(String itemId);

    @JsonIgnore
    public String getConnectionUrl(String path) {
        StringBuilder builder = new StringBuilder();
        if (StringUtils.isNotEmpty(url)) {
            builder.append(url);
        } else {
            builder.append("http://");
            builder.append(hostname);

            if (port != null) {
                builder.append(":").append(port);
            }
        }

        if (StringUtils.isNotEmpty(path)) {
            builder.append(path);
        }

        return builder.toString();
    }

    @JsonIgnore
    public boolean checkValidation() {
        boolean retValue = false;
        try {
            UriComponents getUrl = UriComponentsBuilder
                    .fromHttpUrl(getConnectionUrl(""))
                    .build();
            httpRepository.call(getUrl.toUriString(), HttpMethod.GET, null, String.class);
            retValue = true;
        } catch (RuntimeException re) {
            retValue = false;
        } finally {
            return retValue;
        }
    }

    public String getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getHostname() {
        return hostname;
    }

    public void setHostname(String hostname) {
        this.hostname = hostname;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getUrl() {
        if (StringUtils.isNotEmpty(url)) {
            return url;
        } else {
            return getConnectionUrl(null);
        }
    }

    public void setUrl(String url) { this.url = url; }

    public Set<Workspace> getWorkspaces() {
        return workspaces;
    }

    public void setWorkspaces(Set<Workspace> workspaces) {
        this.workspaces = workspaces;
    }

    public Set<Notebook> getNotebooks() {
        return notebooks;
    }

    public void setNotebooks(Set<Notebook> notebooks) {
        this.notebooks = notebooks;
    }

    public HttpRepository getHttpRepository() {
        return httpRepository;
    }

    public void setHttpRepository(HttpRepository httpRepository) {
        this.httpRepository = httpRepository;
    }

//    public MetatronProperties getMetatronProperties() {
//        return metatronProperties;
//    }
//
//    public void setMetatronProperties(MetatronProperties metatronProperties) {
//        this.metatronProperties = metatronProperties;
//    }

}
