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

package app.metatron.discovery.domain.images;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.validator.constraints.NotBlank;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;

import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;

/**
 * Created by kyungtaak on 2016. 7. 21..
 */
@Entity
@Table(name = "image")
public class Image extends AbstractHistoryEntity implements MetatronDomain<String> {

  public static final String DOMAIN_USER = "user";
  public static final String DOMAIN_DASHBOARD = "dashboard";
  public static final String DOMAIN_CHART = "chart";

  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  String id;

  @Column(name = "img_item_id")
  @NotBlank
  String itemId;

  @Column(name = "img_domain")
  @NotBlank
  String domain;

  @Column(name = "img_original")
  @Basic(fetch = FetchType.LAZY)
  @Lob
  @JsonIgnore
  byte[] original;

  @Column(name = "img_thumbnail")
  @Basic(fetch = FetchType.LAZY)
  @Lob
  @JsonIgnore
  byte[] thumbnail;

  @Column(name="img_file")
  String fileName;

  @Column(name = "img_enabled")
  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  Boolean enabled = false;

  public Image() {
  }

  public Image copyOf() {
    Image image = new Image();
    image.setDomain(domain);
    image.setItemId(itemId);
    image.setOriginal(original);
    image.setThumbnail(thumbnail);
    image.setFileName(fileName);
    image.setEnabled(true);

    return image;
  }

  public String getImageUrl() {
    return "metatron://images/" + domain + "/" + itemId;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getItemId() {
    return itemId;
  }

  public void setItemId(String itemId) {
    this.itemId = itemId;
  }

  public String getDomain() {
    return domain;
  }

  public void setDomain(String domain) {
    this.domain = domain;
  }

  public byte[] getOriginal() {
    return original;
  }

  public void setOriginal(byte[] original) {
    this.original = original;
  }

  public byte[] getThumbnail() {
    return thumbnail;
  }

  public void setThumbnail(byte[] thumbnail) {
    this.thumbnail = thumbnail;
  }

  public String getFileName() {
    return fileName;
  }

  public void setFileName(String fileName) {
    this.fileName = fileName;
  }

  public Boolean getEnabled() {
    return enabled;
  }

  public void setEnabled(Boolean enabled) {
    this.enabled = enabled;
  }
}
