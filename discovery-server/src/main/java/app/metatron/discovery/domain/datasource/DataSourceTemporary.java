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

package app.metatron.discovery.domain.datasource;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.annotations.Type;
import org.hibernate.validator.constraints.NotBlank;
import org.joda.time.DateTime;

import java.util.List;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.Size;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.common.entity.Spec;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;

/**
 * Linked Datasource 를 통해 생성된 임시 데이터 소스 정보
 */
@Entity
@Table(name = "datasource_temporary")
public class DataSourceTemporary extends AbstractHistoryEntity implements MetatronDomain<String> {

  public final static String ID_PREFIX = "TEMP";

  /**
   * ID
   */
  @Id
  @NotBlank
  String id;

  /**
   * 임시 데이터 소스 명
   */
  @Column(name = "temp_name", unique = true)
  @NotBlank
  @Size(max = 150)
  String name;

  /**
   * 참조하는 데이터 소스 Id
   */
  @Column(name = "temp_ds_id")
  String dataSourceId;

  /**
   * 엔진 로드시 생성된 query Id
   */
  @Column(name = "temp_query_id")
  String queryId;

  /**
   * 등록된 expired sec.
   */
  @Column(name = "temp_expired_sec")
  Integer expired;

  /**
   * 데이터 소스가 등록된 시점 부터 expired 를 더한 값
   */
  @Column(name = "temp_expire_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime nextExpireTime;

  /**
   * Load 된 row count.
   */
  @Column(name = "temp_row_count")
  Long rowCnt;

  /**
   * 엔진내 데이터 소스가 로드된 시점
   */
  @Column(name = "temp_registered_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime registeredTime;

  /**
   * 필터 정보 Filter[] Spec 준수
   */
  @Column(name = "temp_filter_conf", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @Spec(target = Filter.class, isArray = true)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String filters;

  @Column(name = "temp_status")
  @Enumerated(EnumType.STRING)
  LoadStatus status;

  @Column(name = "temp_ds_volatiled")
  Boolean volatiled;

  public DataSourceTemporary() {
  }

  public DataSourceTemporary(String id, String name, String dataSourceId, String queryId, Integer expired, String filters, boolean volatiled, boolean async) {
    this.id = id;
    this.name = name;
    this.dataSourceId = dataSourceId;
    this.queryId = queryId;
    this.filters = filters;
    this.expired = expired == null ? 60 : expired;
    this.volatiled = volatiled;
    if(async == false) {
      this.registeredTime = DateTime.now();
      this.nextExpireTime = this.registeredTime.plusSeconds(this.expired);
    }
    this.status = LoadStatus.PREPARING;
  }

  public void reloadExpiredTime() {
    this.nextExpireTime = DateTime.now().plusSeconds(this.expired);
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

  public String getDataSourceId() {
    return dataSourceId;
  }

  public void setDataSourceId(String dataSourceId) {
    this.dataSourceId = dataSourceId;
  }

  public String getQueryId() {
    return queryId;
  }

  public void setQueryId(String queryId) {
    this.queryId = queryId;
  }

  public Integer getExpired() {
    return expired;
  }

  public void setExpired(Integer expired) {
    this.expired = expired;
  }

  public DateTime getNextExpireTime() {
    return nextExpireTime;
  }

  public void setNextExpireTime(DateTime nextExpireTime) {
    this.nextExpireTime = nextExpireTime;
  }

  public Long getRowCnt() {
    return rowCnt;
  }

  public void setRowCnt(Long rowCnt) {
    this.rowCnt = rowCnt;
  }

  public DateTime getRegisteredTime() {
    return registeredTime;
  }

  public void setRegisteredTime(DateTime registeredTime) {
    this.registeredTime = registeredTime;
  }

  public String getFilters() {
    return filters;
  }

  @JsonIgnore
  public List<Filter> getFilterList() {
    if(StringUtils.isEmpty(this.filters)) {
      return Lists.newArrayList();
    }
    return GlobalObjectMapper.readListValue(this.filters, Filter.class);
  }

  public void setFilters(String filters) {
    this.filters = filters;
  }

  public LoadStatus getStatus() {
    return status;
  }

  public void setStatus(LoadStatus status) {
    this.status = status;
  }

  public Boolean getVolatiled() {
    return volatiled;
  }

  public void setVolatiled(Boolean volatiled) {
    this.volatiled = volatiled;
  }

  @Override
  public String toString() {
    return "DataSourceTemporary{" +
        "id='" + id + '\'' +
        ", name='" + name + '\'' +
        ", dataSourceId='" + dataSourceId + '\'' +
        ", queryId='" + queryId + '\'' +
        ", expired=" + expired +
        ", nextExpireTime=" + nextExpireTime +
        ", rowCnt=" + rowCnt +
        ", registeredTime=" + registeredTime +
        ", filters='" + filters + '\'' +
        "} " + super.toString();
  }

  public enum LoadStatus {
    ENABLE, PREPARING, FAIL, DISABLE
  }
}
