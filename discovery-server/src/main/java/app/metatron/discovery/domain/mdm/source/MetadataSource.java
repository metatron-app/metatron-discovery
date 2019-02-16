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

package app.metatron.discovery.domain.mdm.source;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import app.metatron.discovery.common.KeepAsJsonDeserialzier;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.mdm.Metadata;

@Entity
@Table(name = "mdm_metadata_source")
public class MetadataSource extends AbstractHistoryEntity {

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  private String id;

  @Column(name = "meta_source_type")
  @Enumerated(EnumType.STRING)
  private Metadata.SourceType type;

  @Column(name = "meta_source_id")
  private String sourceId;

  @Column(name = "meta_source_name")
  private String name;

  @Column(name = "meta_source_schema")
  private String schema;

  @Column(name = "meta_source_table")
  private String table;

  @Column(name = "meta_source_detail", length = 65535, columnDefinition = "TEXT")
  @Basic(fetch = FetchType.LAZY)
  @JsonRawValue
  @JsonDeserialize(using = KeepAsJsonDeserialzier.class)
  private String sourceInfo;

  public MetadataSource() {
  }

  public MetadataSource(Metadata.SourceType type, String sourceId, String name) {
    this.type = type;
    this.sourceId = sourceId;
    this.name = name;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public Metadata.SourceType getType() {
    return type;
  }

  public void setType(Metadata.SourceType type) {
    this.type = type;
  }

  public String getSourceId() {
    return sourceId;
  }

  public void setSourceId(String sourceId) {
    this.sourceId = sourceId;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getSchema() {
    return schema;
  }

  public void setSchema(String schema) {
    this.schema = schema;
  }

  public String getTable() {
    return table;
  }

  public void setTable(String table) {
    this.table = table;
  }

  public String getSourceInfo() {
    return sourceInfo;
  }

  public void setSourceInfo(String sourceInfo) {
    this.sourceInfo = sourceInfo;
  }

  @Override
  public String toString() {
    return "MetadataSource{" +
        "id='" + id + '\'' +
        ", type='" + type + '\'' +
        ", sourceId='" + sourceId + '\'' +
        ", name='" + name + '\'' +
        "} " + super.toString();
  }

}
