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

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;

/**
 * Created by kyungtaak on 2017. 5. 15..
 */
@Embeddable
public class FieldStatisticId implements Serializable {

  @Column(name = "ds_id")
  String dataSourceId;

  @Column(name = "field_id")
  Long fieldId;

  public FieldStatisticId() {
  }

  public FieldStatisticId(String dataSourceId, Long fieldId) {
    this.dataSourceId = dataSourceId;
    this.fieldId = fieldId;
  }

  public String getDataSourceId() {
    return dataSourceId;
  }

  public void setDataSourceId(String dataSourceId) {
    this.dataSourceId = dataSourceId;
  }

  public Long getFieldId() {
    return fieldId;
  }

  public void setFieldId(Long fieldId) {
    this.fieldId = fieldId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    FieldStatisticId that = (FieldStatisticId) o;

    if (!dataSourceId.equals(that.dataSourceId)) return false;
    return fieldId.equals(that.fieldId);
  }

  @Override
  public int hashCode() {
    int result = dataSourceId.hashCode();
    result = 31 * result + fieldId.hashCode();
    return result;
  }

  @Override
  public String toString() {
    return "FieldStatisticId{" +
        "dataSourceId='" + dataSourceId + '\'' +
        ", fieldId=" + fieldId +
        '}';
  }
}
