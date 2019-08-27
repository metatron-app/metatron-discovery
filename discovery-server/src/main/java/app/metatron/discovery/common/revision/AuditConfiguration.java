package app.metatron.discovery.common.revision;

import org.hibernate.envers.AuditReader;
import org.hibernate.envers.AuditReaderFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.persistence.EntityManagerFactory;

/**
 *
 */
@Configuration
public class AuditConfiguration {
  private final EntityManagerFactory entityManagerFactory;

  AuditConfiguration(EntityManagerFactory entityManagerFactory) {
    this.entityManagerFactory = entityManagerFactory;
  }

  @Bean
  AuditReader auditReader() {
    return AuditReaderFactory.get(entityManagerFactory.createEntityManager());
  }
}
