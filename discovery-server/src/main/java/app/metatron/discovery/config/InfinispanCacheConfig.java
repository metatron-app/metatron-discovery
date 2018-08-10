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

import org.infinispan.configuration.cache.CacheMode;
import org.infinispan.configuration.cache.ConfigurationBuilder;
import org.infinispan.configuration.global.GlobalConfigurationBuilder;
import org.infinispan.manager.DefaultCacheManager;
import org.infinispan.manager.EmbeddedCacheManager;
import org.infinispan.spring.provider.SpringEmbeddedCacheManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

import app.metatron.discovery.common.cache.InfinispanClusterListener;

/**
 * Created by kyungtaak on 2017. 3. 13..
 */
@EnableCaching
@Configuration
public class InfinispanCacheConfig {

  @Value("${polaris.cache.configFile:default-configs/default-jgroups-udp.xml}")
  String configFile;

  @Bean
  public SpringEmbeddedCacheManager springEmbeddedCacheManager() {
    return new SpringEmbeddedCacheManager(infinispanCacheManager());
  }

//  @Bean
//  public SpringEmbeddedCacheManagerFactoryBean springCacheManager() {
//    return new SpringEmbeddedCacheManagerFactoryBean();
//  }

  private EmbeddedCacheManager infinispanCacheManager() {

    // Embedded Cluster Setting!
    GlobalConfigurationBuilder global = GlobalConfigurationBuilder.defaultClusteredBuilder();
    global.clusteredDefault()
        .globalJmxStatistics()
          .allowDuplicateDomains(true)
        .transport()
        .addProperty("configurationFile", configFile)
        .clusterName("metatron-discovery-v20");

    ConfigurationBuilder config = new ConfigurationBuilder();
    config.expiration().lifespan(5, TimeUnit.SECONDS);
    config.clustering().cacheMode(CacheMode.DIST_SYNC);

    DefaultCacheManager cacheManager = new DefaultCacheManager(global.build(), config.build());
    cacheManager.addListener(new InfinispanClusterListener(2));

    return cacheManager;
  }
}
