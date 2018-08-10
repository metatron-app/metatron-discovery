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

package app.metatron.discovery.common.websocket;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.messaging.support.ChannelInterceptorAdapter;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.messaging.DefaultSimpUserRegistry;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.security.Principal;

/**
 * WebSocket 접속시 JWT Token 으로 인증 절차 수행하는 Interceptor
 */
public class TokenChannelInterceptorAdapter extends ChannelInterceptorAdapter {

  private static Logger LOGGER = LoggerFactory.getLogger(TokenChannelInterceptorAdapter.class);

  private static final String HEADER_X_AUTH_TOKEN = "X-AUTH-TOKEN";

  @Autowired
  private JwtTokenStore jwtTokenStore;

  @Autowired
  private SimpUserRegistry userRegistry;

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {

    StompHeaderAccessor accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    String token = accessor.getFirstNativeHeader(HEADER_X_AUTH_TOKEN);

    LOGGER.debug("Inject Auth. Trace message > Command - {}, Destination - {}, Token - {}",
                 accessor.getCommand(), accessor.getDestination(), token);

    if(StringUtils.isEmpty(token)) {
      LOGGER.debug("Token is empty, pass interceptor");
      return message;
    }

    // Set User infomation after getting JWT Token value
    Principal principal = jwtTokenStore.readAuthentication(token).getUserAuthentication();
    if(principal == null && !StompCommand.DISCONNECT.equals(accessor.getCommand())) {
      return message;
    } else {
      accessor.setUser(principal);
    }

    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      ((DefaultSimpUserRegistry) userRegistry).onApplicationEvent(
          new SessionConnectedEvent(this, MessageBuilder.createMessage(new byte[] {}, accessor.getMessageHeaders()), principal));
    } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
      ((DefaultSimpUserRegistry) userRegistry).onApplicationEvent(
          new SessionSubscribeEvent(this, MessageBuilder.createMessage(new byte[] {}, accessor.getMessageHeaders()), principal));
    } else if (StompCommand.UNSUBSCRIBE.equals(accessor.getCommand())) {
      ((DefaultSimpUserRegistry) userRegistry).onApplicationEvent(
          new SessionUnsubscribeEvent(this, MessageBuilder.createMessage(new byte[] {}, accessor.getMessageHeaders()), principal));
    } else if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
      ((DefaultSimpUserRegistry) userRegistry).onApplicationEvent(
          new SessionDisconnectEvent(this, MessageBuilder.createMessage(new byte[] {}, accessor.getMessageHeaders()), accessor.getSessionId(), CloseStatus.NORMAL));
    }

    // not documented anywhere but necessary otherwise NPE in StompSubProtocolHandler!
    accessor.setLeaveMutable(true);
    accessor.removeNativeHeader(HEADER_X_AUTH_TOKEN);

    return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
  }
}
