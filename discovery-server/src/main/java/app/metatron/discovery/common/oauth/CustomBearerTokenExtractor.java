package app.metatron.discovery.common.oauth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.provider.authentication.BearerTokenExtractor;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

import app.metatron.discovery.util.HttpUtils;

@Component
public class CustomBearerTokenExtractor extends BearerTokenExtractor {

  private static Logger LOGGER = LoggerFactory.getLogger(CustomBearerTokenExtractor.class);

  @Override
  public Authentication extract(HttpServletRequest httpServletRequest) {
    Authentication result = super.extract(httpServletRequest);
    if (result != null) {
      result = new PreAuthenticatedAuthenticationToken(
          result.getPrincipal() + "|" + HttpUtils.getClientIp(httpServletRequest), "");
    }
    return result;
  }
}
