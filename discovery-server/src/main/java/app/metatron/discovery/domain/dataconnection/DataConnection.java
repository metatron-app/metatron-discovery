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

package app.metatron.discovery.domain.dataconnection;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.data.projection.ProjectionFactory;

import java.util.Map;
import java.util.Set;

import javax.persistence.*;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.domain.AbstractTenantEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workspace.Workspace;
import app.metatron.discovery.extension.dataconnection.jdbc.JdbcConnectInformation;

@Entity
@Table(name = "dataconnection")
public class DataConnection extends AbstractTenantEntity implements MetatronDomain<String>, JdbcConnectInformation {

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  protected String id;

  @Column(name = "dc_implementor")
  protected String implementor;

  @Column(name = "dc_name")
  @NotBlank
  @Size(max = 150)
  protected String name;

  @Column(name = "dc_desc")
  @Size(max = 900)
  protected String description;

  @Column(name = "dc_type")
  @Enumerated(EnumType.STRING)
  protected SourceType type;

  @Column(name = "dc_url")
  protected String url;

  @Column(name = "dc_options")
  protected String options;

  @Column(name = "dc_published")
  protected Boolean published;

  @Column(name = "dc_hostname")
  protected String hostname;

  @Column(name = "dc_port")
  protected Integer port;

  @Column(name = "dc_database")
  protected String database;

  @Column(name = "dc_catalog")
  protected String catalog;

  @Column(name = "dc_sid")
  protected String sid;

  @Column(name = "dc_properties", length = 65535, columnDefinition = "TEXT")
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String properties;

  @Column(name = "dc_username")
  protected String username;

  @Column(name = "dc_password")
  protected String password;

  @Column(name = "dc_authentication_type")
  @Enumerated(EnumType.STRING)
  protected AuthenticationType authenticationType;

  /**
   * 연결된 workspace 개수
   */
  @Column(name = "dc_linked_workspaces")
  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  protected Integer linkedWorkspaces = 0;

  @OneToMany(mappedBy = "connection",
      cascade = {CascadeType.REMOVE, CascadeType.MERGE, CascadeType.PERSIST})
  @JsonBackReference
  protected Set<DataSource> dataSources;

  @OneToMany(mappedBy = "dataConnection", cascade = {CascadeType.REMOVE, CascadeType.MERGE, CascadeType.PERSIST})
  protected Set<Workbench> workbenches;

  @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
  @JoinTable(name = "dataconnection_workspace",
      joinColumns = @JoinColumn(name = "dc_id", referencedColumnName = "id"),
      inverseJoinColumns = @JoinColumn(name = "ws_id", referencedColumnName = "id"))
  protected Set<Workspace> workspaces;

  public DataConnection() {
    // Empty Constructor
  }

  public DataConnection(String implementor) {
    super();
    this.setImplementor(implementor);
  }

  /**
   * Entity 내 포함되어 있는 객체 일경우 타입별로 Projection 이 제대로 동작하지 않는 이슈로 별도 수행
   */
  public Object getDataConnectionProjection(ProjectionFactory projectionFactory, Class projection) {
    return projectionFactory.createProjection(projection, this);
  }

  @Override
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  @Override
  public String getImplementor() {
    return implementor;
  }

  public void setImplementor(String implementor) {
    this.implementor = implementor;
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

  public SourceType getType() {
    return type;
  }

  public void setType(SourceType type) {
    this.type = type;
  }

  @Override
  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  @Override
  public String getOptions() {
    return options;
  }

  public void setOptions(String options) {
    this.options = options;
  }

  public Boolean getPublished() {
    return published;
  }

  public void setPublished(Boolean published) {
    this.published = published;
  }

  @Override
  public String getHostname() {
    return hostname;
  }

  public void setHostname(String hostname) {
    this.hostname = hostname;
  }

  @Override
  public Integer getPort() {
    return port;
  }

  public void setPort(Integer port) {
    this.port = port;
  }

  @Override
  public String getDatabase() {
    return database;
  }

  public void setDatabase(String database) {
    this.database = database;
  }

  @Override
  public String getCatalog() {
    return catalog;
  }

  public void setCatalog(String catalog) {
    this.catalog = catalog;
  }

  @Override
  public String getSid() {
    return sid;
  }

  public void setSid(String sid) {
    this.sid = sid;
  }

  @Override
  public String getProperties() {
    return properties;
  }

  public void setProperties(String properties) {
    this.properties = properties;
  }

  @Override
  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  @Override
  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  @Override
  public AuthenticationType getAuthenticationType() {
    return authenticationType;
  }

  public void setAuthenticationType(AuthenticationType authenticationType) {
    this.authenticationType = authenticationType;
  }

  public Integer getLinkedWorkspaces() {
    return linkedWorkspaces;
  }

  public void setLinkedWorkspaces(Integer linkedWorkspaces) {
    this.linkedWorkspaces = linkedWorkspaces;
  }

  public Set<DataSource> getDataSources() {
    return dataSources;
  }

  public void setDataSources(Set<DataSource> dataSources) {
    this.dataSources = dataSources;
  }

  public Set<Workbench> getWorkbenches() {
    return workbenches;
  }

  public void setWorkbenches(Set<Workbench> workbenches) {
    this.workbenches = workbenches;
  }

  public Set<Workspace> getWorkspaces() {
    return workspaces;
  }

  public void setWorkspaces(Set<Workspace> workspaces) {
    this.workspaces = workspaces;
  }

  @JsonIgnore
  public Map<String, String> getPropertiesMap(){
    return GlobalObjectMapper.readValue(this.properties, Map.class);
  }

  @Override
  public String toString() {
    return "DataConnection{" +
        "id='" + id + '\'' +
        ", implementor='" + implementor + '\'' +
        ", name='" + name + '\'' +
        ", description='" + description + '\'' +
        ", type=" + type +
        ", url='" + url + '\'' +
        ", options='" + options + '\'' +
        ", published=" + published +
        ", hostname='" + hostname + '\'' +
        ", port=" + port +
        ", database='" + database + '\'' +
        ", catalog='" + catalog + '\'' +
        ", sid='" + sid + '\'' +
        ", properties='" + properties + '\'' +
        ", username='" + username + '\'' +
        ", password='" + password + '\'' +
        ", authenticationType=" + authenticationType +
        '}';
  }

  @Override
  public void prePersist() {
    super.prePersist();

    //Authentication Type userinfo, dialog not persist username/password
    if(this.getAuthenticationType() != null){
      switch(this.getAuthenticationType()){
        case USERINFO:
        case DIALOG:
          this.setUsername(null);
          this.setPassword(null);
          break;
      }
    }
  }

  @Override
  public void preUpdate() {
    super.preUpdate();

    //Authentication Type userinfo, dialog not persist username/password
    if(this.getAuthenticationType() != null){
      switch(this.getAuthenticationType()){
        case USERINFO:
        case DIALOG:
          this.setUsername(null);
          this.setPassword(null);
          break;
      }
    }
  }

  public enum SourceType {
    FILE, JDBC //, VIEW
  }
}
