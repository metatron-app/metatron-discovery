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

package app.metatron.discovery.config;

import org.hibernate.cfg.Environment;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.annotation.PersistenceExceptionTranslationPostProcessor;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

import java.util.Properties;

import javax.sql.DataSource;

/**
 * Created by kyungtaak on 15. 9. 10..
 */
@Configuration
public class RepositoryTestConfig {

  @Bean
  public JpaTransactionManager transactionManager() {
    JpaTransactionManager tx = new JpaTransactionManager();
    tx.setEntityManagerFactory(entityManagerFactory().getObject());

    return tx;
  }

  @Bean
  public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
    LocalContainerEntityManagerFactoryBean factoryBean = new LocalContainerEntityManagerFactoryBean();
    factoryBean.setDataSource(localDataSource());
    factoryBean.setPackagesToScan("app.metatron.discovery.domain");
    factoryBean.setJpaVendorAdapter(new HibernateJpaVendorAdapter());

    Properties prop = new Properties();
    prop.put(Environment.DIALECT, "org.hibernate.dialect.H2Dialect");
    prop.put(Environment.HBM2DDL_AUTO, "create");
    prop.put(Environment.HBM2DDL_IMPORT_FILES, "/scripts/user.sql, /scripts/sample.sql");
    prop.put(Environment.SHOW_SQL, true);
    prop.put(Environment.FORMAT_SQL, true);

    factoryBean.setJpaProperties(prop);

    return factoryBean;

  }

  @Bean
  public PersistenceExceptionTranslationPostProcessor exceptionTranslationPostProcessor() {
    return new PersistenceExceptionTranslationPostProcessor();
  }

  @Bean
  public DataSource localDataSource() {
    org.apache.tomcat.jdbc.pool.DataSource ds = new org.apache.tomcat.jdbc.pool.DataSource();
    ds.setDriverClassName("org.h2.Driver");
    ds.setUrl("jdbc:h2:./h2db/polaris;AUTO_SERVER=TRUE");
    ds.setUsername("sa");
    ds.setPassword("sa");

    return ds;
  }
}
