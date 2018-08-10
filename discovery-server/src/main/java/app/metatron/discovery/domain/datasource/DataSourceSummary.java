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

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.joda.time.DateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import app.metatron.discovery.domain.MetatronDomain;

/**
 * Created by kyungtaak on 2017. 7. 23..
 */
@Entity
@Table(name = "datasource_summary")
public class DataSourceSummary implements MetatronDomain<Long> {

  @Column(name = "id")

  @Id
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
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

  @Column(name = "smy_data_size")
  Long size;

  @Column(name = "smy_data_count")
  Long count;

  public DataSourceSummary() {
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


