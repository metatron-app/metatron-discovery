package app.metatron.discovery.common.revision;

import org.hibernate.envers.DefaultRevisionEntity;
import org.springframework.core.GenericTypeResolver;
import org.springframework.data.envers.repository.support.EnversRevisionRepository;
import org.springframework.data.envers.repository.support.EnversRevisionRepositoryFactoryBean;
import org.springframework.data.envers.repository.support.EnversRevisionRepositoryImpl;
import org.springframework.data.envers.repository.support.ReflectionRevisionEntityInformation;
import org.springframework.data.jpa.repository.support.JpaEntityInformation;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactoryBean;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.querydsl.QueryDslUtils;
import org.springframework.data.repository.core.RepositoryInformation;
import org.springframework.data.repository.core.RepositoryMetadata;
import org.springframework.data.repository.core.support.RepositoryFactorySupport;
import org.springframework.data.repository.history.RevisionRepository;
import org.springframework.data.repository.history.support.RevisionEntityInformation;

import java.io.Serializable;

import javax.persistence.EntityManager;

/**
 * Custom Class for querydsl support in Spring-data-envers
 * referenced from https://github.com/spring-projects/spring-data-envers/pull/45
 */
public class CustomEnversRevisionRepositoryFactoryBean<T extends RevisionRepository<S, ID, N>, S, ID extends Serializable, N extends Number & Comparable<N>>
    extends JpaRepositoryFactoryBean<T, S, ID> {

  private Class<?> revisionEntityClass;

  /**
   * Creates a new {@link EnversRevisionRepositoryFactoryBean} for the given repository interface.
   *
   * @param repositoryInterface must not be {@literal null}.
   */
  public CustomEnversRevisionRepositoryFactoryBean(Class<? extends T> repositoryInterface) {
    super(repositoryInterface);
  }

  /**
   * Configures the revision entity class. Will default to {@link DefaultRevisionEntity}.
   *
   * @param revisionEntityClass
   */
  public void setRevisionEntityClass(Class<?> revisionEntityClass) {
    this.revisionEntityClass = revisionEntityClass;
  }

  /*
   * (non-Javadoc)
   * @see org.springframework.data.jpa.repository.support.JpaRepositoryFactoryBean#createRepositoryFactory(javax.persistence.EntityManager)
   */
  @Override
  protected RepositoryFactorySupport createRepositoryFactory(EntityManager entityManager) {
    return new RevisionRepositoryFactory<T, ID, N>(entityManager, revisionEntityClass);
  }

  /**
   * Repository factory creating {@link RevisionRepository} instances.
   *
   * @author Oliver Gierke
   */
  private static class RevisionRepositoryFactory<T, ID extends Serializable, N extends Number & Comparable<N>>
      extends JpaRepositoryFactory {

    private final RevisionEntityInformation revisionEntityInformation;
    private final EntityManager entityManager;

    /**
     * Creates a new {@link EnversRevisionRepositoryFactoryBean.RevisionRepositoryFactory} using the given {@link EntityManager} and revision entity class.
     *
     * @param entityManager must not be {@literal null}.
     * @param revisionEntityClass can be {@literal null}, will default to {@link DefaultRevisionEntity}.
     */
    public RevisionRepositoryFactory(EntityManager entityManager, Class<?> revisionEntityClass) {

      super(entityManager);
      this.entityManager = entityManager;
      revisionEntityClass = revisionEntityClass == null ? DefaultRevisionEntity.class : revisionEntityClass;
      this.revisionEntityInformation = DefaultRevisionEntity.class.equals(revisionEntityClass)
        ? new CustomRevisionEntityInformation() : new ReflectionRevisionEntityInformation(revisionEntityClass);
    }

    /*
     * (non-Javadoc)
     * @see org.springframework.data.jpa.repository.support.JpaRepositoryFactory#getTargetRepository(org.springframework.data.repository.core.RepositoryInformation)
     */
    @Override
    @SuppressWarnings({ "unchecked", "rawtypes" })
    protected EnversRevisionRepository<T, ID, N> getTargetRepository(RepositoryInformation information) {
      JpaEntityInformation<T, ID> entityInformation = (JpaEntityInformation<T, ID>) getEntityInformation(information.getDomainType());

      if (isQueryDslExecutor(information.getRepositoryInterface())) {
        return new QueryDslWithEnversRevisionRepository<T, ID, N>(entityInformation, revisionEntityInformation, entityManager);
      } else {
        return new EnversRevisionRepositoryImpl<>(entityInformation , revisionEntityInformation, entityManager);
      }
    }

    /*
     * (non-Javadoc)
     * @see org.springframework.data.jpa.repository.support.JpaRepositoryFactory#getRepositoryBaseClass(org.springframework.data.repository.core.RepositoryMetadata)
     */
    @Override
    protected Class<?> getRepositoryBaseClass(RepositoryMetadata metadata) {
      if (isQueryDslExecutor(metadata.getRepositoryInterface())) {
        return QueryDslWithEnversRevisionRepository.class;
      } else {
        return EnversRevisionRepositoryImpl.class;
      }
    }

    /**
     * Returns whether the given repository interface requires a QueryDsl specific implementation to be chosen.
     *
     * @param repositoryInterface
     * @return
     */
    private boolean isQueryDslExecutor(Class<?> repositoryInterface) {
      return QueryDslUtils.QUERY_DSL_PRESENT && QueryDslPredicateExecutor.class.isAssignableFrom(repositoryInterface);
    }

    /*
     * (non-Javadoc)
     * @see org.springframework.data.repository.core.support.RepositoryFactorySupport#getRepository(java.lang.Class, java.lang.Object)
     */
    @Override
    @SuppressWarnings("hiding")
    public <T> T getRepository(Class<T> repositoryInterface, Object customImplementation) {

      if (RevisionRepository.class.isAssignableFrom(repositoryInterface)) {

        Class<?>[] typeArguments = GenericTypeResolver.resolveTypeArguments(repositoryInterface,
                                          RevisionRepository.class);
        Class<?> revisionNumberType = typeArguments[2];

        if (!revisionEntityInformation.getRevisionNumberType().equals(revisionNumberType)) {
        throw new IllegalStateException(String.format(
          "Configured a revision entity type of %s with a revision type of %s "
            + "but the repository interface is typed to a revision type of %s!",
          repositoryInterface, revisionEntityInformation.getRevisionNumberType(), revisionNumberType));
        }
      }

      return super.getRepository(repositoryInterface, customImplementation);
    }

    class CustomRevisionEntityInformation implements RevisionEntityInformation {

      /*
       * (non-Javadoc)
       * @see org.springframework.data.repository.history.support.RevisionEntityInformation#getRevisionNumberType()
       */
      public Class<?> getRevisionNumberType() {
        return Long.class;
      }

      /*
       * (non-Javadoc)
       * @see org.springframework.data.repository.history.support.RevisionEntityInformation#isDefaultRevisionEntity()
       */
      public boolean isDefaultRevisionEntity() {
        return true;
      }

      /*
       * (non-Javadoc)
       * @see org.springframework.data.repository.history.support.RevisionEntityInformation#getRevisionEntityClass()
       */
      public Class<?> getRevisionEntityClass() {
        return DefaultRevisionEntity.class;
      }
    }
  }

}
