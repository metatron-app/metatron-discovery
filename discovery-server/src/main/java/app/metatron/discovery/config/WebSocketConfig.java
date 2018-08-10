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

import org.springframework.beans.factory.annotation.Autowire;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.user.DefaultUserDestinationResolver;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.messaging.simp.user.UserDestinationResolver;
import org.springframework.web.socket.config.annotation.AbstractWebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.messaging.DefaultSimpUserRegistry;

import app.metatron.discovery.common.websocket.BizChannelInterceptorAdapter;
import app.metatron.discovery.common.websocket.TokenChannelInterceptorAdapter;

/**
 * Websocket + STOMP Configuration
 *
 * Token based setting : https://stackoverflow.com/questions/30887788/json-web-token-jwt-with-spring-based-sockjs-stomp-web-socket
 */
@Configuration
@EnableWebSocketMessageBroker
@Order(Ordered.HIGHEST_PRECEDENCE + 50)
public class WebSocketConfig extends AbstractWebSocketMessageBrokerConfigurer {

  private static final String HEADER_X_AUTH_TOKEN = "X-AUTH-TOKEN";

  private DefaultSimpUserRegistry userRegistry = new DefaultSimpUserRegistry();

  private DefaultUserDestinationResolver resolver = new DefaultUserDestinationResolver(userRegistry);
//
//  @Autowired
//  private JwtTokenStore jwtTokenStore;

  @Bean
  @Primary
  public SimpUserRegistry userRegistry() {
    return userRegistry;
  }

  @Bean
  @Primary
  public UserDestinationResolver userDestinationResolver() {
    return resolver;
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public TokenChannelInterceptorAdapter tokenChannelInterceptorAdapter() {
    return new TokenChannelInterceptorAdapter();
  }

  @Bean(autowire = Autowire.BY_TYPE)
  public BizChannelInterceptorAdapter bizChannelInterceptorAdapter() {
    return new BizChannelInterceptorAdapter();
  }

  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.enableSimpleBroker("/topic", "/queue");
    config.setApplicationDestinationPrefixes("/message");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/stomp")
            .setAllowedOrigins("*")
            .withSockJS()
              //.setWebSocketEnabled(false)
              .setSessionCookieNeeded(false);
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {

    registration.setInterceptors(
        tokenChannelInterceptorAdapter(), bizChannelInterceptorAdapter());
  }

}
