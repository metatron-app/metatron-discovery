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

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;

import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.domain.MetatronDomain;

/**
 * Created by kyungtaak on 2017. 5. 15..
 */
@Entity
public class FieldStatistic implements MetatronDomain<FieldStatisticId> {

  @EmbeddedId
  FieldStatisticId id;

  @Column(name = "field_summary")
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String summary;

  @Column(name = "field_stats")
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String statistics;

  @Column(name = "field_values")
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String values;

  @Column(name = "field_covariance")
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  String covariance;

  public FieldStatistic() {
  }

  public FieldStatisticId getId() {
    return id;
  }

  public void setId(FieldStatisticId id) {
    this.id = id;
  }

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public String getStatistics() {
    return statistics;
  }

  public void setStatistics(String statistics) {
    this.statistics = statistics;
  }

  public String getValues() {
    return values;
  }

  public void setValues(String values) {
    this.values = values;
  }

  public String getCovariance() {
    return covariance;
  }

  public void setCovariance(String covariance) {
    this.covariance = covariance;
  }

  @Override
  public String toString() {
    return "FieldStatistic{" +
        "id=" + id +
        ", summary='" + summary + '\'' +
        ", statistics='" + statistics + '\'' +
        ", values='" + values + '\'' +
        ", covariance='" + covariance + '\'' +
        '}';
  }
}
