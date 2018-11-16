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

package app.metatron.discovery.domain.datasource.ingestion;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.datasource.ingestion.job.IngestionProgress;
import app.metatron.discovery.domain.engine.model.IngestionStatusResponse;

/**
 * Created by kyungtaak on 2016. 8. 13..
 */
@Entity
@Table(name = "ingestion_history")
public class IngestionHistory extends AbstractHistoryEntity implements MetatronDomain<Long> {

  @Column(name = "id")
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Id
  Long id;

  @Column(name = "ingest_ds_id")
  String dataSourceId;

  @Column(name = "ingest_engine_id")
  String ingestionId;

  @Column(name = "ingest_method")
  @Enumerated(EnumType.STRING)
  IngestionMethod ingestionMethod;

  @Column(name = "ingest_duration")
  Long duration;

  /**
   * 데이터 소스 적재 정보
   */
  @Column(name = "ingest_conf", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String ingestionInfo;

  @Column(name = "ingest_status")
  @Enumerated(EnumType.STRING)
  IngestionStatus status;

  @Column(name = "ingest_progress")
  @Enumerated(EnumType.STRING)
  IngestionProgress progress;

  @Column(name = "ingest_error_code")
  String errorCode;

  @Column(name = "ingest_cause", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  String cause;

  @Column(name = "ingest_hostname")
  String hostname;

  public IngestionHistory() {
  }

  public IngestionHistory(String dataSourceId) {
    this(dataSourceId, IngestionMethod.DEFAULT, null, null);
  }

  public IngestionHistory(String dataSourceId, IngestionStatus status, String cause) {
    this(dataSourceId, IngestionMethod.DEFAULT, status, cause);
  }

  public IngestionHistory(String dataSourceId, IngestionMethod method, IngestionStatus status, String cause) {
    this.dataSourceId = dataSourceId;
    this.ingestionMethod = method;
    this.status = status;
    this.cause = cause;
  }

  public void addResponse(IngestionStatusResponse response) {
    this.status = response.getStatus();
    this.duration = response.getDuration();
    this.cause = response.getCause();
  }

  public void setStatus(IngestionStatus status, String cause) {
    this.status = status;
    this.cause = cause;
  }

  public void setStatus(IngestionStatus status, MetatronException e) {
    this.status = status;
    this.errorCode = e.getCode().toString();
    this.cause = ExceptionUtils.getRootCauseMessage(e);
  }

  public void setStatus(String statusStr) {
    try {
      this.status = IngestionStatus.valueOf(statusStr);
    } catch (Exception e) {
      this.status = IngestionStatus.PASS;
    }
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getDataSourceId() {
    return dataSourceId;
  }

  public void setDataSourceId(String dataSourceId) {
    this.dataSourceId = dataSourceId;
  }

  public String getIngestionId() {
    return ingestionId;
  }

  public void setIngestionId(String ingestionId) {
    this.ingestionId = ingestionId;
  }

  public IngestionMethod getIngestionMethod() {
    return ingestionMethod;
  }

  public void setIngestionMethod(IngestionMethod ingestionMethod) {
    this.ingestionMethod = ingestionMethod;
  }

  public void setIngestionInfo(IngestionInfo ingestionInfo) {
    if(ingestionInfo == null) {
      return;
    }
    this.ingestionInfo = GlobalObjectMapper.writeValueAsString(ingestionInfo);
  }

  public String getIngestionInfo() {
    return ingestionInfo;
  }

  public void setIngestionInfo(String ingestionInfo) {
    this.ingestionInfo = ingestionInfo;
  }

  public IngestionStatus getStatus() {
    return status;
  }

  public void setStatus(IngestionStatus status) {
    this.status = status;
  }

  public IngestionProgress getProgress() {
    return progress;
  }

  public void setProgress(IngestionProgress progress) {
    this.progress = progress;
  }

  public String getErrorCode() {
    return errorCode;
  }

  public void setErrorCode(String errorCode) {
    this.errorCode = errorCode;
  }

  public String getCause() {
    return cause;
  }

  public void setCause(String cause) {
    this.cause = cause;
  }

  public Long getDuration() {
    return duration;
  }

  public void setDuration(Long duration) {
    this.duration = duration;
  }

  public String getHostname() {
    return hostname;
  }

  public void setHostname(String hostname) {
    this.hostname = hostname;
  }

  @Override
  public String toString() {
    return "IngestionHistory{" +
        "dataSourceId='" + dataSourceId + '\'' +
        ", ingestionId='" + ingestionId + '\'' +
        ", ingestionMethod=" + ingestionMethod +
        ", duration=" + duration +
        ", status=" + status +
        ", errorCode=" + errorCode +
        ", progress=" + progress +
        ", cause='" + cause + '\'' +
        "} " + super.toString();
  }

  public enum IngestionStatus {
    SUCCESS, FAILED, RUNNING, PASS, UNKNOWN;

    public static IngestionStatus convertFromEngineStatus(String status) {
      switch (status) {
        case "SUCCESS":
          return SUCCESS;
        case "FAILED":
          return FAILED;
        case "RUNNING":
          return RUNNING;
        default:
          return UNKNOWN;
      }
    }
  }

  public enum IngestionMethod {
    DEFAULT, SUPERVISOR
  }
}
