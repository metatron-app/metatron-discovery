package app.metatron.discovery.common;

import com.github.seratch.jslack.Slack;
import com.github.seratch.jslack.api.webhook.Payload;
import com.github.seratch.jslack.api.webhook.WebhookResponse;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;

import javax.annotation.PostConstruct;

@Component
@ConditionalOnProperty(value = "polaris.engine.notification.slack.hookUrl")
public class SlackSender {

  private static final Logger LOGGER = LoggerFactory.getLogger(SlackSender.class);

  private Slack slackSender;

  @Value("${polaris.engine.notification.slack.hookUrl}")
  String slackHookUrl;

  @Value("${polaris.engine.notification.slack.channel:}")
  String slackChannel;

  @PostConstruct
  public void postConstruct() {
    slackSender = Slack.getInstance();
  }

  public void send(String message) {

    Payload.PayloadBuilder payloadBuilder = Payload.builder()
                                                   .text(message);

    if (StringUtils.isNotEmpty(slackChannel)) {
      payloadBuilder.channel(slackChannel);
    }

    try {
      WebhookResponse response = slackSender.send(slackHookUrl, payloadBuilder.build());
      LOGGER.debug(response.toString());
    } catch (IOException e) {
      LOGGER.error("Error sending message to slack", e);
    }
  }
}
