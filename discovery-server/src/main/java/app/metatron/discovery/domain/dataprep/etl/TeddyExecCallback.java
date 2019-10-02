package app.metatron.discovery.domain.dataprep.etl;

import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.CANCELED;
import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.FAILED;
import static app.metatron.discovery.domain.dataprep.entity.PrSnapshot.STATUS.SUCCEEDED;

import app.metatron.discovery.domain.dataprep.entity.PrSnapshot;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class TeddyExecCallback {

  private static Logger LOGGER = LoggerFactory.getLogger(TeddyExecutor.class);

  private String restAPIserverPort;
  private String oauth_token;

  public void setCallbackInfo(Map<String, Object> callbackInfo) {
    restAPIserverPort = (String) callbackInfo.get("port");
    oauth_token = (String) callbackInfo.get("oauth_token");

    LOGGER.info("callback: restAPIserverPort={} oauth_token={}", restAPIserverPort, oauth_token.substring(0, 10));
  }

  public void updateSnapshot(String ssId, String colname, String value) {
    LOGGER.debug("updateSnapshot(): ssId={}: update {} as {}", ssId, colname, value);

    URI snapshot_uri = UriComponentsBuilder.newInstance()
            .scheme("http")
            .host("localhost")
            .port(restAPIserverPort)
            .path("/api/preparationsnapshots/")
            .path(ssId)
            .build().encode().toUri();

    LOGGER.debug("updateSnapshot(): REST URI=" + snapshot_uri);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.add("Accept", "application/json, text/plain, */*");
    headers.add("Authorization", oauth_token);

    HttpComponentsClientHttpRequestFactory requestFactory = new HttpComponentsClientHttpRequestFactory();
    RestTemplate restTemplate = new RestTemplate(requestFactory);

    Map<String, String> patchItems = new HashMap<>();
    patchItems.put(colname, value);

    HttpEntity<Map<String, String>> entity2 = new HttpEntity<>(patchItems, headers);
    ResponseEntity<String> responseEntity;
    responseEntity = restTemplate.exchange(snapshot_uri, HttpMethod.PATCH, entity2, String.class);

    LOGGER.debug("updateSnapshot(): done with statusCode " + responseEntity.getStatusCode());
  }

  public void updateStatus(String ssId, PrSnapshot.STATUS status) {
    updateSnapshot(ssId, "status", status.name());

    if (status == SUCCEEDED || status == FAILED || status == CANCELED) {
      updateSnapshot(ssId, "finishTime", DateTime.now(DateTimeZone.UTC).toString());
    }
  }
}
