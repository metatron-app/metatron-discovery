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

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;

/**
 * Created by kyungtaak on 2016. 9. 3..
 */
@Entity
@Table(name = "datasource_size_history")
public class DataSourceSizeHistory extends AbstractHistoryEntity implements MetatronDomain<String>  {

  /**
   *  ID
   */
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  String id;

  /**
   *  DataSource Id
   */
  @Column(name = "ds_id")
  String dataSourceId;

  /**
   *  DataSource Size
   */
  @Column(name = "ds_size")
  Long size;

  /**
   * DataSource row count
   */
  @Column(name = "ds_count")
  Long count;

  public DataSourceSizeHistory() {
  }

  public DataSourceSizeHistory(String dataSourceId) {
    this.dataSourceId = dataSourceId;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getDataSourceId() {
    return dataSourceId;
  }

  public void setDataSourceId(String dataSourceId) {
    this.dataSourceId = dataSourceId;
  }

  public Long getSize() {
    return size;
  }

  public void setSize(Long size) {
    if(size == null) {
      this.size = 0L;
    } else {
      this.size = size;
    }
  }

  public Long getCount() {
    return count;
  }

  public void setCount(Long count) {
    this.count = count;
  }

  @Override
  public String toString() {
    return "DataSourceSizeHistory{" +
            "id='" + id + '\'' +
            ", dataSourceId='" + dataSourceId + '\'' +
            ", size=" + size +
            "} " + super.toString();
  }
}
