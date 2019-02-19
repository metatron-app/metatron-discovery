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

package app.metatron.discovery.domain.datasource.connection;


import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.connection.file.LocalFileConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.*;
import app.metatron.discovery.domain.workbench.Workbench;
import app.metatron.discovery.domain.workspace.Workspace;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.data.projection.ProjectionFactory;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.util.Set;

@Entity
@Table(name = "dataconnection")
@DiscriminatorColumn(name = "dc_implementor")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "implementor")
@JsonSubTypes({
    @JsonSubTypes.Type(value = MySQLConnection.class, name = "MYSQL"),
    @JsonSubTypes.Type(value = OracleConnection.class, name = "ORACLE"),
    @JsonSubTypes.Type(value = TiberoConnection.class, name = "TIBERO"),
    @JsonSubTypes.Type(value = HiveConnection.class, name = "HIVE"),
    @JsonSubTypes.Type(value = PostgresqlConnection.class, name = "POSTGRESQL"),
    @JsonSubTypes.Type(value = MssqlConnection.class, name = "MSSQL"),
    @JsonSubTypes.Type(value = PrestoConnection.class, name = "PRESTO"),
    @JsonSubTypes.Type(value = LocalFileConnection.class, name = "FILE"),
    @JsonSubTypes.Type(value = DruidConnection.class, name = "DRUID")
})
public abstract class DataConnection extends AbstractHistoryEntity implements MetatronDomain<String> {

  public static final String URL_SEP = "/";

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  protected String id;

  @Column(name = "dc_implementor", insertable = false, updatable = false)
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

  @Column(name = "dc_hostname")
  protected String hostname;

  @Column(name = "dc_port")
  protected Integer port;

  @Column(name = "dc_options")
  protected String options;

  @Column(name = "dc_username")
  protected String username;

  @Column(name = "dc_password")
  protected String password;

  @Column(name = "dc_url")
  protected String url;

  @Column(name = "dc_authentication_type")
  @Enumerated(EnumType.STRING)
  protected AuthenticationType authenticationType;

  @Column(name = "dc_published")
  protected Boolean published;

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

  /**
   * Entity 내 포함되어 있는 객체 일경우 타입별로 Projection 이 제대로 동작하지 않는 이슈로 별도 수행
   */
  public Object getDataConnectionProjection(ProjectionFactory projectionFactory, Class projection) {
    return projectionFactory.createProjection(projection, this);
  }

  @JsonProperty
  public abstract String getConnectUrl();

  public abstract String makeConnectUrl(boolean includeDatabase);

  public String getImplementor() {
    return implementor;
  }

  public void setImplementor(String implementor) {
    this.implementor = implementor;
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

  public String getOptions() {
    return options;
  }

  public void setOptions(String options) {
    this.options = options;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
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

  public AuthenticationType getAuthenticationType() {
    return authenticationType;
  }

  public void setAuthenticationType(AuthenticationType authenticationType) {
    this.authenticationType = authenticationType;
  }

  public Set<Workspace> getWorkspaces() {
    return workspaces;
  }

  public void setWorkspaces(Set<Workspace> workspaces) {
    this.workspaces = workspaces;
  }

  public void setPublished(Boolean published) {
    this.published = published;
  }

  public Boolean getPublished() {
    return published;
  }

  public Integer getLinkedWorkspaces() {
    return linkedWorkspaces;
  }

  public void setLinkedWorkspaces(Integer linkedWorkspaces) {
    this.linkedWorkspaces = linkedWorkspaces;
  }

  public String getDatabase() {
    if (this instanceof JdbcDataConnection) {
      JdbcDataConnection jdc = (JdbcDataConnection) this;
      return jdc.getDatabase();
    }
    return null;
  }

  @Override
  public String toString() {
    return "DataConnection{" +
        "id='" + id + '\'' +
        ", name='" + name + '\'' +
        ", implementor='" + implementor + '\'' +
        ", description='" + description + '\'' +
        ", type=" + type +
        ", hostname='" + hostname + '\'' +
        ", port=" + port +
        ", username='" + username + '\'' +
        ", password='" + password + '\'' +
        ", published='" + published + '\'' +
        "} " + super.toString();
  }

  public enum SourceType {
    FILE, JDBC //, VIEW
  }

  public enum Implementor {
    H2, HIVE, ORACLE, TIBERO, MYSQL, MSSQL, PRESTO, FILE, POSTGRESQL, DRUID, GENERAL;

    public static Implementor getImplementor(DataConnection connection) {
      if (connection instanceof HiveConnection) {
        return HIVE;
      } else if (connection instanceof OracleConnection) {
        return ORACLE;
      } else if (connection instanceof TiberoConnection) {
        return TIBERO;
      } else if (connection instanceof MySQLConnection) {
        return MYSQL;
      } else if (connection instanceof MssqlConnection) {
        return MSSQL;
      } else if (connection instanceof PrestoConnection) {
        return PRESTO;
      } else if (connection instanceof PostgresqlConnection) {
        return POSTGRESQL;
      } else if (connection instanceof LocalFileConnection) {
        return FILE;
      } else if (connection instanceof DruidConnection) {
        return DRUID;
      } else
        return GENERAL;
    }
  }

  public enum AuthenticationType {
    MANUAL, USERINFO, DIALOG
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
}
