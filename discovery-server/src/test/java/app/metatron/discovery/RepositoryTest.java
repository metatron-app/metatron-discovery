package app.metatron.discovery;

import org.junit.runner.RunWith;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import app.metatron.discovery.common.revision.CustomEnversRevisionRepositoryFactoryBean;

@RunWith(SpringRunner.class)
@DataJpaTest
@EnableJpaRepositories(basePackages = {"app.metatron.discovery.domain"}
    , repositoryFactoryBeanClass = CustomEnversRevisionRepositoryFactoryBean.class
)
@ActiveProfiles({"local", "h2-default-db", "logging-console-debug", "spark-local-standalone", "initial"})
public class RepositoryTest {
}
