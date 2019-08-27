package app.metatron.discovery.domain.revision;

import org.hibernate.envers.RevisionListener;

import app.metatron.discovery.util.AuthUtils;

/**
 *
 */
public class MetatronRevisionListener implements RevisionListener {

  @Override
  public void newRevision(Object revisionEntity) {
    MetatronRevisionEntity rev = (MetatronRevisionEntity) revisionEntity;
    rev.setUsername(AuthUtils.getAuthUserName());
  }
}
