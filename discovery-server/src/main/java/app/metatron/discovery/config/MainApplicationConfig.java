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

import de.codecentric.boot.admin.config.EnableAdminServer;

import org.springframework.boot.autoconfigure.jdbc.DataSourceBuilder;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.hateoas.config.EnableEntityLinks;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import app.metatron.discovery.common.revision.CustomEnversRevisionRepositoryFactoryBean;
import app.metatron.discovery.common.web.CommonLocalVariableFilter;
import app.metatron.discovery.common.web.LogbackMdcFilter;

@Configuration
@EnableTransactionManagement
@EnableAspectJAutoProxy
@EnableJpaRepositories(basePackages = {"app.metatron.discovery.domain"}
    , repositoryFactoryBeanClass = CustomEnversRevisionRepositoryFactoryBean.class
)
@EnableEntityLinks
@EnableAdminServer
@ComponentScan(basePackages = {"app.metatron.discovery"})
public class MainApplicationConfig {

  @Bean(name="dataSource")
  @Primary
  @ConfigurationProperties(prefix="spring.datasource")
  public DataSource primaryDataSource() {
    return DataSourceBuilder
        .create()
        .type(org.apache.tomcat.jdbc.pool.DataSource.class)
        .build();
  }

  @Bean(name = "entityManagerFactory")
  public LocalContainerEntityManagerFactoryBean entityManagerFactory(
      EntityManagerFactoryBuilder builder,
      DataSource dataSource) {
    return builder
        .dataSource(dataSource)
        .packages("app.metatron.discovery.domain")
        .build();
  }

  @Bean(name = "transactionManager")
  public PlatformTransactionManager transactionManager(
      EntityManagerFactory entityManagerFactory) {
    return new JpaTransactionManager(entityManagerFactory);
  }

  @Bean
  public FilterRegistrationBean logbackMdcFilterRegistrationBean() {
    FilterRegistrationBean registrationBean = new FilterRegistrationBean();
    LogbackMdcFilter logbackMdcFilter = new LogbackMdcFilter();
    registrationBean.setFilter(logbackMdcFilter);
    // Spring Security Filter order(0) 다음
    registrationBean.setOrder(1);

    return registrationBean;
  }

  @Bean
  public FilterRegistrationBean localVariableFilterRegistrationBean() {
    FilterRegistrationBean registrationBean = new FilterRegistrationBean();
    CommonLocalVariableFilter localVariableFilter = new CommonLocalVariableFilter();
    registrationBean.setFilter(localVariableFilter);
    // Spring Security Filter order(0) 다음
    registrationBean.setOrder(2);

    return registrationBean;
  }
}
