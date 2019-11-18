package app.metatron.discovery.domain.revision;

import org.hibernate.envers.RevisionEntity;
import org.hibernate.envers.RevisionNumber;
import org.hibernate.envers.RevisionTimestamp;

import java.io.Serializable;
import java.text.DateFormat;
import java.util.Date;
import java.util.Objects;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

/**
 *
 */
@Entity
@Table(name = "REVINFO")
@RevisionEntity(MetatronRevisionListener.class)
public class MetatronRevisionEntity implements Serializable {

  @Id
  @GeneratedValue
  @RevisionNumber
  private Long id;

  @RevisionTimestamp
  private Long timestamp;

  private String username;

  public MetatronRevisionEntity() {
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(Long timestamp) {
    this.timestamp = timestamp;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  @Transient
  public Date getRevisionDate() {
    return new Date(this.timestamp);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    MetatronRevisionEntity that = (MetatronRevisionEntity) o;
    return id == that.id &&
        timestamp == that.timestamp;
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, timestamp);
  }

  @Override
  public String toString() {
    return "MetatronRevisionEntity{" +
        "id=" + id +
        ", revisionDate = " + DateFormat.getDateTimeInstance().format(this.getRevisionDate()) +
        '}';
  }
}
