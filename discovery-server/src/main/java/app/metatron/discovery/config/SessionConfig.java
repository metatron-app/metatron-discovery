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

import com.google.common.collect.Lists;

import org.infinispan.spring.session.configuration.EnableInfinispanEmbeddedHttpSession;
import org.springframework.beans.factory.annotation.Autowire;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.web.http.SessionEventHttpSessionListenerAdapter;

import java.util.List;

import javax.servlet.http.HttpSessionListener;

import app.metatron.discovery.common.oauth.SessionStatusListener;

/**
 * Created by kyungtaak on 2017. 3. 14..
 */
@EnableInfinispanEmbeddedHttpSession(cacheName = "metatron-sessions")
@Configuration
public class SessionConfig {

  @Bean
  public SessionEventHttpSessionListenerAdapter session() {
    List<HttpSessionListener> listeners = Lists.newArrayList();
    listeners.add(sessionStatusListener());
    return new SessionEventHttpSessionListenerAdapter(listeners);
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public SessionStatusListener sessionStatusListener() {
    return new SessionStatusListener();
  }
}
