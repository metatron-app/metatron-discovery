package app.metatron.discovery.domain.idcube.security.imsi.adapter;

import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.idcube.IdCubeProperties;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class TangoAdapter {
  private static final Logger LOGGER = LoggerFactory.getLogger(TangoAdapter.class);

  private IdCubeProperties idCubeProperties;

  @Autowired
  public void setIdCubeProperties(IdCubeProperties idCubeProperties) {
    this.idCubeProperties = idCubeProperties;
  }

  public void sendSMS(String receiverName, String receiverTelNo, String contents) {
    if(StringUtils.isBlank(idCubeProperties.getImsi().getSmsServer().getApiUrl())
      || StringUtils.isBlank(idCubeProperties.getImsi().getSmsServer().getApiKey())
      || StringUtils.isBlank(idCubeProperties.getImsi().getSmsServer().getSenderName())
      || StringUtils.isBlank(idCubeProperties.getImsi().getSmsServer().getSenderCellPhoneNo())) {
      LOGGER.error("id-cube -> imsi -> sms-authentication config error - " + "sms-api-url, api-key, sender-cell-phone-no, sender-name are required.");
      throw new MetatronException("id-cube -> imsi -> sms-authentication config error");
    }

    final HttpHeaders headers = new HttpHeaders();
    headers.set("X-Auth-Token", idCubeProperties.getImsi().getSmsServer().getApiKey());
    headers.set("X-Data-Type", "json");
    headers.set("Content-Type", "application/json; charset=utf-8");

    HttpEntity<Map<String, Object>> entity = new HttpEntity(new HashMap<>(), headers);
    entity.getBody().put("msgOcltNm", idCubeProperties.getImsi().getSmsServer().getSenderName());
    entity.getBody().put("msgOgTlno", idCubeProperties.getImsi().getSmsServer().getSenderCellPhoneNo());
    List<Map<String, String>> receiverList = new ArrayList<>();
    Map<String, String> receiver = new HashMap<>();
    receiver.put("msgRcprTlno", receiverTelNo);
    receiver.put("msgRcprNm", receiverName);
    receiverList.add(receiver);
    entity.getBody().put("rcprList", receiverList);
    entity.getBody().put("ogMsgCttc", contents);

    final String url = idCubeProperties.getImsi().getSmsServer().getApiUrl() + "/common/business/modules/sms";
    RestTemplate restTemplate = new RestTemplate();

    try {
      ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
      if(response.getStatusCode() != HttpStatus.OK) {
        LOGGER.error("sms api call response status error-" + "url:" + url + ", parameters:" + entity.getBody() + ", status:" + response.getStatusCode().toString());
        throw new MetatronException("sms api call response status error:" + response.getStatusCode().toString());
      }
      final Integer returnCode = (Integer)response.getBody().get("returnCode");
      if (returnCode != 200) {
        LOGGER.error("sms api call returnCode error-" + "url:" + url + ", parameters:" + entity.getBody() + ", returnCode:" + returnCode + ", returnMessage:" + response.getBody().get("returnMessage"));
        throw new MetatronException("sms api call returnCode error: " + returnCode);
      }
    } catch(RestClientException rce) {
      LOGGER.error("sms api call error-" + "url:" + url + ", parameters" + entity.getBody());
      LOGGER.error("sms api call error-", rce);
      throw new MetatronException(rce);
    }
  }
}
