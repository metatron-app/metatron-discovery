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

package app.metatron.discovery.domain.mdm;


import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import app.metatron.discovery.domain.datasource.Field;

@Entity
@Table(name = "mdm_metadata_popularity")
public class MetadataPopularity {

  /**
   * ID
   */
  @Column(name = "id")
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Id
  Long id;

  @Column(name = "popularity_type")
  @Enumerated(EnumType.STRING)
  PopularityType type;

  @Column(name = "popularity_source_id")
  String sourceId;

  @Column(name = "popularity_metadata_id")
  String metadataId;

  @Column(name = "popularity_column_id")
  Long fieldId;

  @Column(name = "popularity_metacolumn_id")
  Long metaColumnId;

  @Column(name = "popularity_score")
  Long score;

  @Column(name = "popularity_value")
  Double popularity;

  public MetadataPopularity() {
  }

  public MetadataPopularity(Metadata metadata) {
    this.type = PopularityType.METADATA;
    this.metadataId = metadata.getId();
    this.sourceId = metadata.getSource().getSourceId();
    this.score = 1L;
  }

  public MetadataPopularity(Metadata metadata, MetadataColumn metadataColumn, Field field) {
    this.type = PopularityType.METACOLUMN;
    this.metadataId = metadata.getId();
    this.sourceId = metadata.getSource().getSourceId();
    this.metaColumnId = metadataColumn.getId();
    this.fieldId = field.getId();

    this.score = 1L;
  }

  public void addScore() {
    this.score++;
  }

  public void calculatePopularity(Double maxValue) {
    this.popularity = (this.score / maxValue) * 100;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public PopularityType getType() {
    return type;
  }

  public void setType(PopularityType type) {
    this.type = type;
  }

  public String getSourceId() {
    return sourceId;
  }

  public void setSourceId(String sourceId) {
    this.sourceId = sourceId;
  }

  public String getMetadataId() {
    return metadataId;
  }

  public void setMetadataId(String metadataId) {
    this.metadataId = metadataId;
  }

  public Long getFieldId() {
    return fieldId;
  }

  public void setFieldId(Long fieldId) {
    this.fieldId = fieldId;
  }

  public Long getMetaColumnId() {
    return metaColumnId;
  }

  public void setMetaColumnId(Long metaColumnId) {
    this.metaColumnId = metaColumnId;
  }

  public Long getScore() {
    return score;
  }

  public void setScore(Long score) {
    this.score = score;
  }

  public Double getPopularity() {
    return popularity;
  }

  public void setPopularity(Double popularity) {
    this.popularity = popularity;
  }

  public enum PopularityType {
    METADATA, METACOLUMN
  }
}
