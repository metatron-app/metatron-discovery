package app.metatron.discovery.domain.user;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.exception.MetatronException;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResponseErrorHandler;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Map;

@Component
@ConditionalOnProperty(value = "polaris.user.sms")
public class SmsSender {

  private final static Logger LOGGER = LoggerFactory.getLogger(SmsSender.class);

  @Autowired
  protected UserProperties userProperties;

  @Value("${polaris.user.sms:-}")
  String smsUrl;

  protected RestTemplate restTemplate;

  @PostConstruct
  protected void setUp() {
    setUpRestTemplate();
  }

  /**
   * OAuth2 Rest template
   *
   * @return
   */
  private void setUpRestTemplate() {

    LOGGER.debug("getting SmsSender RestTemplate ...");

    restTemplate = new RestTemplate();
    restTemplate.setMessageConverters(defaultConverters());
    restTemplate.setRequestFactory(defaultHttpFactory());
    restTemplate.setErrorHandler(new DataSourceResponseErrorHandler());
  }

  public void sendSms(String contact, String message) {

    Map<String, Object> reqMap = Maps.newHashMap();
    reqMap.put("contact", contact);
    reqMap.put("message", message);

    restTemplate.postForObject(smsUrl, reqMap, String.class);
    LOGGER.info("Send SMS message to {}", contact);
  }


  private List<HttpMessageConverter<?>> defaultConverters() {
    StringHttpMessageConverter stringHttpMessageConverter = new StringHttpMessageConverter(Charset.forName("UTF-8"));
    stringHttpMessageConverter.setWriteAcceptCharset(false);

    return Lists.newArrayList(
            stringHttpMessageConverter,
            new MappingJackson2HttpMessageConverter(GlobalObjectMapper.getDefaultMapper()));
  }

  private HttpComponentsClientHttpRequestFactory defaultHttpFactory() {
    HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
    factory.setConnectTimeout(10000);
    factory.setReadTimeout(10000);

    return factory;
  }

  private class DataSourceResponseErrorHandler implements ResponseErrorHandler {

    @Override
    public boolean hasError(ClientHttpResponse response) throws IOException {
      if (response.getStatusCode() == HttpStatus.OK
              || response.getStatusCode() == HttpStatus.NO_CONTENT
              || response.getStatusCode() == HttpStatus.CREATED) {
        return false;
      }

      return true;
    }

    @Override
    public void handleError(ClientHttpResponse response) throws IOException {
      List<String> responseBody = IOUtils.readLines(response.getBody(), "UTF-8");
      LOGGER.debug("Server error response : {}", responseBody);
      throw new MetatronException(String.valueOf(responseBody));
    }
  }


}
