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

package app.metatron.discovery.domain.workbench;

import com.google.common.collect.Lists;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.StringMessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.util.MimeType;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.lang.reflect.Type;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;

import app.metatron.discovery.AbstractRestIntegrationTest;
import app.metatron.discovery.core.oauth.OAuthRequest;
import app.metatron.discovery.core.oauth.OAuthTestExecutionListener;

import static java.util.concurrent.TimeUnit.SECONDS;

@TestExecutionListeners(value = OAuthTestExecutionListener.class, mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS)
public class WorkBenchWebSocketTest extends AbstractRestIntegrationTest {

  private WebSocketStompClient stompClient;

  private BlockingQueue<String> blockingQueue;

  private final WebSocketHttpHeaders webSocketHttpHeaders = new WebSocketHttpHeaders();

  @Before
  public void setup() {
    List<Transport> transports = Lists.newArrayList(new WebSocketTransport(new StandardWebSocketClient()));

    this.blockingQueue = new LinkedBlockingDeque<>();

    this.stompClient = new WebSocketStompClient(new SockJsClient(transports));
    this.stompClient.setMessageConverter(new MappingJackson2MessageConverter());
    this.stompClient.setMessageConverter(new StringMessageConverter());
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void shouldReceiveAMessageFromTheServer() throws Exception {

    StompHeaders stompHeaders = new StompHeaders();
    stompHeaders.set("X-AUTH-TOKEN", oauth_token);

    StompSession session = stompClient
        .connect("ws://localhost:{port}/stomp", webSocketHttpHeaders, stompHeaders, new StompSessionHandlerAdapter() {}, serverPort)
        .get(3, SECONDS);

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/topic/greetings");
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    String message = "MESSAGE TEST";

    StompHeaders stompSendHeaders = new StompHeaders();
    stompSendHeaders.setDestination("/message/hello");
    stompSendHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.send(stompSendHeaders, message);

    Assert.assertEquals(message, blockingQueue.poll(3, SECONDS));
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void compareWebsocketSessionIdShouldNotEquals() throws Exception {

    StompHeaders stompHeaders = new StompHeaders();
    stompHeaders.set("X-AUTH-TOKEN", oauth_token);

    StompSession session1 = stompClient
        .connect("ws://localhost:{port}/stomp", webSocketHttpHeaders, stompHeaders, new StompSessionHandlerAdapter() {}, serverPort)
        .get(3, SECONDS);

    StompSession session2 = stompClient
        .connect("ws://localhost:{port}/stomp", webSocketHttpHeaders, stompHeaders, new StompSessionHandlerAdapter() {}, serverPort)
        .get(3, SECONDS);

    System.out.println("Sessin1 ID: "  + session1.getSessionId());
    System.out.println("Sessin2 ID: "  + session2.getSessionId());

    Assert.assertNotEquals(session1.getSessionId(), session2.getSessionId());
  }

  @Test
  @OAuthRequest(username = "polaris", value = {"PERM_WORKSPACE_WRITE_BOOK"})
  public void subscribeWorkbenchPageView() throws Exception {

    StompHeaders stompHeaders = new StompHeaders();
    stompHeaders.set("X-AUTH-TOKEN", oauth_token);

    StompSession session = stompClient
        .connect("ws://localhost:{port}/stomp", webSocketHttpHeaders, stompHeaders, new StompSessionHandlerAdapter() {}, serverPort)
        .get(3, SECONDS);

    String workbenchId = "test-workbench-id";

    StompHeaders stompSubscribeHeaders = new StompHeaders();
    stompSubscribeHeaders.setDestination("/user/queue/workbench/" + workbenchId);
    stompSubscribeHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.subscribe(stompSubscribeHeaders, new DefaultStompFrameHandler());

    String message = "{\"queryId\":\"test\"}";

    StompHeaders stompSendHeaders = new StompHeaders();
    stompSendHeaders.setContentType(new MimeType("application", "json"));
    stompSendHeaders.setDestination("/message/workbench/" + workbenchId + "/query");
    stompSendHeaders.set("X-AUTH-TOKEN", oauth_token);

    session.send(stompSendHeaders, message.getBytes());

    Assert.assertEquals("test", blockingQueue.poll(3, SECONDS));


  }

  class DefaultStompFrameHandler implements StompFrameHandler {

    @Override
    public Type getPayloadType(StompHeaders stompHeaders) {
      return String.class;
    }

    @Override
    public void handleFrame(StompHeaders stompHeaders, Object o) {
      System.out.println("Result : " + o);
      blockingQueue.offer((String) o);
    }
  }

}
