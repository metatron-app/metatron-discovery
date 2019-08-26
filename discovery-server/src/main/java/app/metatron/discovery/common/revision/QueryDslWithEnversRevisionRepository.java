package app.metatron.discovery.common.revision;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.envers.repository.support.EnversRevisionRepository;
import org.springframework.data.envers.repository.support.EnversRevisionRepositoryImpl;
import org.springframework.data.history.Revision;
import org.springframework.data.history.Revisions;
import org.springframework.data.jpa.repository.support.JpaEntityInformation;
import org.springframework.data.jpa.repository.support.QueryDslJpaRepository;
import org.springframework.data.repository.history.support.RevisionEntityInformation;

import java.io.Serializable;

import javax.persistence.EntityManager;

/**
 * Custom Class for querydsl support in Spring-data-envers
 * referenced from https://github.com/spring-projects/spring-data-envers/pull/45
 */
public class QueryDslWithEnversRevisionRepository<T, ID extends Serializable, N extends Number & Comparable<N>>
    extends QueryDslJpaRepository<T, ID> implements EnversRevisionRepository<T, ID, N> {

  private final EnversRevisionRepositoryImpl<T, ID, N> delegateRepository;

  /**
   * Creates a new {@link QueryDslWithEnversRevisionRepository} using the given {@link JpaEntityInformation}, {@link
   * RevisionEntityInformation} and {@link EntityManager}.
   *
   * @param entityInformation         must not be {@literal null}.
   * @param revisionEntityInformation must not be {@literal null}.
   * @param entityManager             must not be {@literal null}.
   */
  public QueryDslWithEnversRevisionRepository(JpaEntityInformation<T, ID> entityInformation,
                                              RevisionEntityInformation revisionEntityInformation, EntityManager entityManager) {
    super(entityInformation, entityManager);
    this.delegateRepository = new EnversRevisionRepositoryImpl<T, ID, N>(entityInformation, revisionEntityInformation,
                                                                         entityManager);
  }

  @Override
  public Revision<N, T> findLastChangeRevision(ID id) {
    return delegateRepository.findLastChangeRevision(id);
  }

  @Override
  public Revision<N, T> findRevision(ID id, N revisionNumber) {
    return delegateRepository.findRevision(id, revisionNumber);
  }

  @Override
  public Revisions<N, T> findRevisions(ID id) {
    return delegateRepository.findRevisions(id);
  }

  @Override
  public Page<Revision<N, T>> findRevisions(ID id, Pageable pageable) {
    return delegateRepository.findRevisions(id, pageable);
  }
}