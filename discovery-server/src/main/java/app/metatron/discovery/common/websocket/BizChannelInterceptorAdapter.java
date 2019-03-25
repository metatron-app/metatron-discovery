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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptorAdapter;
import org.springframework.messaging.support.MessageHeaderAccessor;

import java.util.List;

import app.metatron.discovery.domain.workbench.util.WorkbenchDataSourceManager;

import static org.springframework.messaging.simp.stomp.StompCommand.CONNECT;
import static org.springframework.messaging.simp.stomp.StompCommand.DISCONNECT;
import static org.springframework.messaging.simp.stomp.StompCommand.UNSUBSCRIBE;

/**
 * WebSocket COMMAND 이벤트를 통해 처리하는 로직 위치
 */
public class BizChannelInterceptorAdapter extends ChannelInterceptorAdapter {

  private static Logger LOGGER = LoggerFactory.getLogger(BizChannelInterceptorAdapter.class);

  @Autowired
  WorkbenchDataSourceManager workbenchDataSourceManager;

  public BizChannelInterceptorAdapter() {
  }

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {

    StompHeaderAccessor accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    LOGGER.debug("Biz preSend Trace message > Command - {}, Destination - {}, Session Id - {}",
                 accessor.getCommand(), accessor.getDestination(), accessor.getSessionId());

    return super.preSend(message, channel);
  }

  @Override
  public void postSend(Message<?> message, MessageChannel channel, boolean sent) {

    StompHeaderAccessor accessor =
        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

    LOGGER.debug("Biz Trace message > Command - {}, Destination - {}, Session Id - {}",
                 accessor.getCommand(), accessor.getDestination(), accessor.getSessionId());

    if(accessor.getCommand().equals(UNSUBSCRIBE)) {
      LOGGER.debug("Do Action for UNSUBSCRIBE");
    } else if(accessor.getCommand().equals(CONNECT)) {
      LOGGER.debug("Do Action for connect!!!");
    } else if(accessor.getCommand().equals(DISCONNECT)) {
      // Session Id 및 채널명을 통해 관련 된 워크 벤치 커넥션 해제
      LOGGER.debug("Do Action for disconnection!!!");
      // Session Id 를 통해 관련된 워크벤치 해제
      workbenchDataSourceManager.destroyDataSource(accessor.getSessionId());
    }
  }

  @Override
  public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
    super.afterSendCompletion(message, channel, sent, ex);
  }

  @Override
  public boolean preReceive(MessageChannel channel) {
    return super.preReceive(channel);
  }

  @Override
  public Message<?> postReceive(Message<?> message, MessageChannel channel) {
    return super.postReceive(message, channel);
  }

  @Override
  public void afterReceiveCompletion(Message<?> message, MessageChannel channel, Exception ex) {
    super.afterReceiveCompletion(message, channel, ex);
  }

  private String getHeaderValue(StompHeaderAccessor accessor, String headerName){
    List<String> headerList = accessor.getNativeHeader(headerName);
    if(headerList != null && headerList.size() > 0){
      return headerList.get(0);
    } else {
      return null;
    }
  }
}
