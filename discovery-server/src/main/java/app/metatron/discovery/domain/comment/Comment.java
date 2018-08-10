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

package app.metatron.discovery.domain.comment;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

import app.metatron.discovery.common.entity.DomainType;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;

/**
 * Created by kyungtaak on 2016. 12. 28..
 */
@Entity
@Table(name = "comment")
public class Comment extends AbstractHistoryEntity implements MetatronDomain<Long> {

  /**
   * ID
   */
  @Column(name = "id")
  @GeneratedValue(strategy= GenerationType.AUTO, generator="native")
  @GenericGenerator(name = "native", strategy = "native")
  @Id
  private Long id;

  /**
   * Comment contents
   */
  @Column(name = "comment_contents", length = 1000)
  @NotNull
  private String contents;

  @Column(name = "comment_domain_type")
  @Enumerated(EnumType.STRING)
  private DomainType domainType;

  @Column(name = "comment_domain_id")
  private String domainId;

  public Comment() {
  }

  @JsonCreator
  public Comment(@JsonProperty("contents") String contents) {
    this.contents = contents;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getContents() {
    return contents;
  }

  public void setContents(String contents) {
    this.contents = contents;
  }

  public DomainType getDomainType() {
    return domainType;
  }

  public void setDomainType(DomainType domainType) {
    this.domainType = domainType;
  }

  public String getDomainId() {
    return domainId;
  }

  public void setDomainId(String domainId) {
    this.domainId = domainId;
  }

  @Override
  public String toString() {
    return "Comment{" +
        "id=" + id +
        ", contents='" + contents + '\'' +
        ", domainType=" + domainType +
        ", domainId='" + domainId + '\'' +
        "} " + super.toString();
  }
}
