package app.metatron.discovery.domain.favorite;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import app.metatron.discovery.common.entity.DomainType;
import app.metatron.discovery.domain.AbstractHistoryEntity;
import app.metatron.discovery.domain.MetatronDomain;

/**
 *
 */
@Entity
@Table(name="favorite")
public class Favorite extends AbstractHistoryEntity implements MetatronDomain<String> {
  /**
   * ID
   */
  @Id
  @GeneratedValue(generator = "uuid")
  @GenericGenerator(name = "uuid", strategy = "uuid2")
  @Column(name = "id")
  String id;

  @Column(name = "favorite_target")
  String targetId;

  @Column(name = "favorite_domain")
  @Enumerated(EnumType.STRING)
  DomainType domainType;

  @Override
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getTargetId() {
    return targetId;
  }

  public void setTargetId(String targetId) {
    this.targetId = targetId;
  }

  public DomainType getDomainType() {
    return domainType;
  }

  public void setDomainType(DomainType domainType) {
    this.domainType = domainType;
  }

  @Override
  public String toString() {
    return "Favorite{" +
        "id='" + id + '\'' +
        ", targetId='" + targetId + '\'' +
        ", domainType=" + domainType +
        ", version=" + version +
        ", createdBy='" + createdBy + '\'' +
        ", createdTime=" + createdTime +
        ", modifiedBy='" + modifiedBy + '\'' +
        ", modifiedTime=" + modifiedTime +
        '}';
  }
}
