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

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.StatLogger;
import app.metatron.discovery.common.oauth.OauthProperties;
import app.metatron.discovery.common.oauth.token.cache.CachedWhitelistToken;
import app.metatron.discovery.common.oauth.token.cache.WhitelistTokenCacheRepository;
import app.metatron.discovery.domain.activities.ActivityStream;
import app.metatron.discovery.domain.activities.ActivityStreamService;
import app.metatron.discovery.domain.activities.spec.ActivityType;
import app.metatron.discovery.domain.activities.spec.Actor;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.user.UserProperties;
import app.metatron.discovery.domain.user.UserRepository;
import app.metatron.discovery.domain.user.UserService;
import app.metatron.discovery.util.HttpUtils;

import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.Period;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.common.DefaultOAuth2RefreshToken;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.common.exceptions.InvalidTokenException;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.client.JdbcClientDetailsService;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

/**
 *
 */
@Component
@Transactional
public class OAuthInterceptor implements HandlerInterceptor {

  private static final Logger LOGGER = LoggerFactory.getLogger(OAuthInterceptor.class);

  @Autowired
  ActivityStreamService activityStreamService;

  @Autowired
  JdbcClientDetailsService jdbcClientDetailsService;

  @Autowired
  UserService userService;

  @Autowired
  UserRepository userRepository;

  @Autowired
  UserProperties userProperties;

  @Autowired
  OauthProperties oauthProperties;

  @Autowired
  TokenStore tokenStore;

  @Autowired
  WhitelistTokenCacheRepository whitelistTokenCacheRepository;

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

    //if need password expire check
    if (StringUtils.isNotEmpty(userProperties.getPassword().getRequiredChangePeriod())) {
      String username = request.getParameter("username");

      //getting user
      User user = userRepository.findByUsername(username);

      //check user status
      if (user != null && user.getStatus() == User.Status.ACTIVATED) {
        Period requiredChangePeriod = null;
        try {
          //parse to period
          requiredChangePeriod = Period.parse(userProperties.getPassword().getRequiredChangePeriod());
          LOGGER.debug("requiredChangePeriod : {}", requiredChangePeriod);

          //getting last update datetime
          DateTime passwordChangedDate = userService.getLastPasswordUpdatedDate(username);
          LOGGER.debug("{}'s passwordChangedDate : {}", username, passwordChangedDate);
          if (requiredChangePeriod != null && passwordChangedDate != null) {

            //expired password required change period
            DateTime validPasswordDate = passwordChangedDate.plus(requiredChangePeriod);
            LOGGER.debug("{}'s validPasswordDate : {}", username, validPasswordDate);
            if (DateTime.now().getMillis() > validPasswordDate.getMillis()) {
              //update status to EXPIRED
              user.setStatus(User.Status.EXPIRED);
              userRepository.saveAndFlush(user);
              LOGGER.debug("{}'s password change date expired. set status to EXPIRED", username);
            }
          }
        } catch (Exception e) {

        }
      }
    }

    // cannot refresh token not in whitelist cache
    if (oauthProperties.getTimeout() > -1) {
      String requestURI = request.getRequestURI();
      LOGGER.debug("preHandle - requestURI : {}", requestURI);
      if (requestURI.equals("/oauth/token")) {
        String grantType = request.getParameter("grant_type");
        if (grantType.equals("refresh_token")) {
          String refreshToken = request.getParameter("refresh_token");

          OAuth2Authentication authFromToken = tokenStore.readAuthentication(refreshToken);

          // getting username, clientid, clientip
          String username = authFromToken.getName();
          String clientId = authFromToken.getOAuth2Request().getClientId();
          String userHost = HttpUtils.getClientIp(request);

          LOGGER.debug("Cached Whitelist token for {}, {}", username, clientId);
          CachedWhitelistToken cachedWhitelistToken
              = whitelistTokenCacheRepository.getCachedWhitelistToken(username, clientId);
          if (cachedWhitelistToken != null) {
            OAuth2AccessToken whiteListAccessToken = tokenStore.readAccessToken(cachedWhitelistToken.getToken());
            if (whiteListAccessToken.isExpired()) {
              whitelistTokenCacheRepository.removeWhitelistToken(cachedWhitelistToken.getUsername(), cachedWhitelistToken.getClientId());
            } else {
              String cachedUserHost = cachedWhitelistToken.getUserHost();
              // if not matched in whitelist cache, throw exception
              if (!userHost.equals(cachedUserHost)) {
                LOGGER.info("Cached Whitelist token's ip ({}) is not matched userIp ({})", cachedUserHost, userHost);
                removeAccessTokenByRefreshToken(refreshToken);
                throw new InvalidTokenException("User ip is not in whitelist.");
              }
            }
          } else {
            LOGGER.info("cachedWhitelistToken is not exist({}, {})", username, clientId);
            removeAccessTokenByRefreshToken(refreshToken);
            whitelistTokenCacheRepository.removeWhitelistToken(username, clientId);
          }
        }
      }
    }

    return true;
  }

  @Override
  public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
          ModelAndView modelAndView) throws Exception {

  }

  @Override
  public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
    String requestURI = request.getRequestURI();
    LOGGER.debug("afterCompletion - requestURI : {}", requestURI);
    if (requestURI.equals("/oauth/token")) {
      String grantType = request.getParameter("grant_type");

      //exclude refresh_token or client_credentials or authorization_code
      if (grantType.equals("refresh_token") || grantType.equals("client_credentials")|| grantType.equals("authorization_code")) {
        return;
      }

      String username = request.getParameter("username");
      String userAgent = request.getHeader("user-agent");
      String clientId = request.getRemoteUser();
      String userHost = HttpUtils.getClientIp(request);
      int loginStatus = response.getStatus();
      String referer = request.getHeader("referer");

      //getting client info
      String clientName = null;
      ClientDetails clientDetails = jdbcClientDetailsService.loadClientByClientId(clientId);

      if (clientDetails != null) {
        Map<String, Object> clientAdditionalInformation = clientDetails.getAdditionalInformation();
        if (clientAdditionalInformation != null && clientAdditionalInformation.containsKey("clientName")) {
          LOGGER.info("[DUMMY] client name :  {}", clientAdditionalInformation.get("clientName"));
          clientName = clientAdditionalInformation.get("clientName").toString();
        }
      }
      if (clientName == null) {
        clientName = clientId;
      }

      Map<String, Object> additionalInfo = new HashMap<>();
      additionalInfo.put("requestURI", requestURI);
      additionalInfo.put("referer", referer);
      additionalInfo.put("grantType", grantType);

      ActivityStream activityStream = new ActivityStream();

      //Actor(user)
      activityStream.setActor(username);
      activityStream.setAction(ActivityType.ARRIVE);
      activityStream.setActorType(Actor.ActorType.PERSON);

      //Object(client)
      activityStream.setObjectType(ActivityStream.MetatronObjectType.UNKNOWN);
      activityStream.setObjectId(clientName);
      activityStream.setObjectContent(GlobalObjectMapper.writeValueAsString(additionalInfo));

      //Generator(user agent)
      activityStream.setGeneratorName(userAgent);
      activityStream.setGeneratorType(ActivityStream.GeneratorType.WEBAPP);

      //user host
      activityStream.setRemoteHost(userHost);

      activityStream.setResult(loginStatus == 200 ? "SUCCESS" : "FAIL");
      activityStream.setPublishedTime(DateTime.now());
      activityStreamService.addActivityStream(activityStream);

      try {
        if (loginStatus == 200) {
          userService.initFailCount(username);
          StatLogger.login(username, clientId, userHost, userAgent);
        }
      } catch (Exception e) {
        LOGGER.error("Error :: {} ", e.getMessage());
      }
    }
  }

  public void removeAccessTokenByRefreshToken(String refreshToken){
    //remove access token
    tokenStore.removeAccessTokenUsingRefreshToken(new DefaultOAuth2RefreshToken(refreshToken));

    //remove refresh token
    tokenStore.removeRefreshToken(new DefaultOAuth2RefreshToken(refreshToken));
  }
}
