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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.apache.commons.collections.MapUtils;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import java.util.List;
import java.util.Map;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.domain.MetatronDomain;
import app.metatron.discovery.domain.engine.model.SegmentMetaDataResponse;

/**
 * Created by kyungtaak on 2017. 7. 23..
 */
@Entity
@Table(name = "datasource_summary")
public class DataSourceSummary implements MetatronDomain<Long> {

  @Column(name = "id")
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Id
  Long id;

  @Column(name = "smy_min_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime ingestionMinTime;

  @Column(name = "smy_max_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime ingestionMaxTime;

  @Column(name = "smy_last_access_time")
  @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
  DateTime lastAccessTime;

  /**
   * Upper corner (latitue longitude)
   */
  @Column(name = "smy_geo_upper_corner")
  String geoUpperCorner;

  /**
   * Lower corner (latitue longitude)
   */
  @Column(name = "smy_geo_lower_corner")
  String geoLowerCorner;

  @Column(name = "smy_data_size")
  Long size;

  @Column(name = "smy_data_count")
  Long count;

  @Column(name = "smy_data_ingested_count")
  Long ingestedCount;

  @Column(name = "smy_data_column", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String columns;

  public DataSourceSummary() {
  }

  public DataSourceSummary(SegmentMetaDataResponse segmentMetaData) {
    updateSummary(segmentMetaData);
  }

  public void updateSummary(SegmentMetaDataResponse segmentMetaData) {

    this.size = segmentMetaData.getSerializedSize();
    this.count = segmentMetaData.getNumRows();
    this.ingestedCount = segmentMetaData.getIngestedNumRows();

    List<DateTime> minMaxDateTimes = segmentMetaData.extractMinMaxTime();
    this.ingestionMinTime = minMaxDateTimes.get(0);
    this.ingestionMaxTime = minMaxDateTimes.get(1);

    this.columns = GlobalObjectMapper.writeValueAsString(segmentMetaData.getColumns());

  }

  public void updateGeoCorner(Map<String, Object> corner) {
    if (MapUtils.isEmpty(corner)) {
      return;
    }

    this.geoUpperCorner = (String) corner.get("__upperCorner");
    this.geoLowerCorner = (String) corner.get("__lowerCorner");
  }

  @JsonIgnore
  public Map<String, SegmentMetaDataResponse.ColumnInfo> getColumnInfo() {
    return GlobalObjectMapper.readValue(this.columns, Map.class);
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public DateTime getIngestionMinTime() {
    return ingestionMinTime;
  }

  public void setIngestionMinTime(DateTime ingestionMinTime) {
    this.ingestionMinTime = ingestionMinTime;
  }

  public DateTime getIngestionMaxTime() {
    return ingestionMaxTime;
  }

  public void setIngestionMaxTime(DateTime ingestionMaxTime) {
    this.ingestionMaxTime = ingestionMaxTime;
  }

  public DateTime getLastAccessTime() {
    return lastAccessTime;
  }

  public void setLastAccessTime(DateTime lastAccessTime) {
    this.lastAccessTime = lastAccessTime;
  }

  public String getGeoUpperCorner() {
    return geoUpperCorner;
  }

  public void setGeoUpperCorner(String geoUpperCorner) {
    this.geoUpperCorner = geoUpperCorner;
  }

  public String getGeoLowerCorner() {
    return geoLowerCorner;
  }

  public void setGeoLowerCorner(String geoLowerCorner) {
    this.geoLowerCorner = geoLowerCorner;
  }

  public Long getSize() {
    return size;
  }

  public void setSize(Long size) {
    this.size = size;
  }

  public Long getCount() {
    return count;
  }

  public void setCount(Long count) {
    this.count = count;
  }

  public Long getIngestedCount() {
    return ingestedCount;
  }

  public void setIngestedCount(Long ingestedCount) {
    this.ingestedCount = ingestedCount;
  }

  public String getColumns() {
    return columns;
  }

  public void setColumns(String columns) {
    this.columns = columns;
  }

  @Override
  public String toString() {
    return "DataSourceSummary{" +
        "id=" + id +
        ", ingestionMinTime=" + ingestionMinTime +
        ", ingestionMaxTime=" + ingestionMaxTime +
        ", lastAccessTime=" + lastAccessTime +
        ", size=" + size +
        ", count=" + count +
        '}';
  }
}


