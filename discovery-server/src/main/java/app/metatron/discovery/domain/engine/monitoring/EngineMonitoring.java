/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.engine.monitoring;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;

@Entity
@Table(name = "engine_monitoring",
    uniqueConstraints = @UniqueConstraint(columnNames = {"server_type", "hostname", "port"}))
public class EngineMonitoring extends AbstractHistoryEntity implements MetatronDomain<String> {

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  String id;

  @Column(name = "server_type")
  String type;

  @Column(name = "hostname")
  String hostname;

  @Column(name = "port")
  String port;

  @Column(name = "status")
  Boolean status = true;

  @Column(name = "error_message", length = 65535, columnDefinition = "TEXT")
  String errorMessage;

  @Column(name = "error_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime errorTime;


  public EngineMonitoring() {
  }

  public EngineMonitoring(String hostname, String port, String type) {
    this.type = type;
    this.hostname = hostname;
    this.port = port;
    this.status = true;
  }

  @Override
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public String getHostname() {
    return hostname;
  }

  public void setHostname(String hostname) {
    this.hostname = hostname;
  }

  public String getPort() {
    return port;
  }

  public void setPort(String port) {
    this.port = port;
  }

  public Boolean getStatus() {
    return status;
  }

  public void setStatus(Boolean status) {
    this.status = status;
  }

  public String getErrorMessage() {
    return errorMessage;
  }

  public void setErrorMessage(String errorMessage) {
    this.errorMessage = errorMessage;
  }

  public DateTime getErrorTime() {
    return errorTime;
  }

  public void setErrorTime(DateTime errorTime) {
    this.errorTime = errorTime;
  }

  public Long getErrorDuration() {
    if(this.errorTime != null) {
      return (DateTime.now().getMillis() - this.errorTime.getMillis()) / 1000;
    } else {
      return null;
    }
  }

  public enum TaskStatus {
    PENDING, WAITING, RUNNING, SUCCESS, FAILED
  }

}