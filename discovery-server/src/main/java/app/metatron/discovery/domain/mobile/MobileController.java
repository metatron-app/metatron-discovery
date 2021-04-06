package app.metatron.discovery.domain.mobile;

import app.metatron.discovery.common.exception.GlobalErrorCodes;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.admin.CacheAdminController;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.codec.Base64;
import org.springframework.security.oauth2.common.exceptions.InvalidClientException;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.ClientRegistrationException;
import org.springframework.security.oauth2.provider.client.JdbcClientDetailsService;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.UnsupportedEncodingException;
import java.util.LinkedHashMap;
import java.util.Map;

import static app.metatron.discovery.domain.mobile.MobileErrorCodes.*;

/**
 * APIs for mobile support
 */
@RestController
@RequestMapping("/api/mobile")
public class MobileController {

  private static Logger LOGGER = LoggerFactory.getLogger(MobileController.class);

  /**
   * For getting client information by client id.
   */
  private final JdbcClientDetailsService jdbcClientDetailsService;

  /**
   * Mobile resource path from application configuration
   */
  @Value("${polaris.mobile.resource-path:classpath:resource-mobile/}")
  private String mobileResourcePath;

  /**
   * Mobile client id. from application configuration
   */
  @Value("${polaris.mobile.client-id:default-client}")
  private String mobileClientId;

  public MobileController(JdbcClientDetailsService jdbcClientDetailsService) {
    this.jdbcClientDetailsService = jdbcClientDetailsService;
  }

  /**
   * Validation for mobile service
   *
   * @return
   */
  @RequestMapping(value = "/validate", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> validateMobileService() {

    // Check a client id for mobile service
    Map<String, Object> responses = new LinkedHashMap<>();
    try {
      ClientDetails clientDetails = jdbcClientDetailsService.loadClientByClientId(mobileClientId);

      responses.put("clientId", clientDetails.getClientId());

      String token = clientDetails.getClientId() + ":" + clientDetails.getClientSecret();
      String basicHeader = new String(Base64.encode(token.getBytes("UTF-8")), "UTF-8");
      responses.put("basicHeader", basicHeader);
      responses.put("scope", String.join(",", clientDetails.getScope()));

    } catch (ClientRegistrationException e) {
      LOGGER.warn("Invalid client : {}", mobileClientId);
      throw new MobileException(INVALID_MOBILE_CLIENT, "Mobile client not found.");
    } catch (UnsupportedEncodingException e) {
      LOGGER.error("Encoding error : {}", e);
      throw new MobileException(MOBILE_UNKNOWN_ERROR, "Fail to create basic header caused by encoding error", e);
    }

    return ResponseEntity.ok(responses);
  }
}
