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

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.provider.ClientDetails;
import org.springframework.security.oauth2.provider.client.JdbcClientDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.activities.ActivityStream;
import app.metatron.discovery.domain.activities.ActivityStreamController;
import app.metatron.discovery.domain.activities.ActivityStreamService;
import app.metatron.discovery.domain.activities.spec.ActivityType;
import app.metatron.discovery.domain.activities.spec.Actor;

/**
 *
 */
@Component
public class OAuthInterceptor implements HandlerInterceptor {

  private static final Logger LOGGER = LoggerFactory.getLogger(OAuthInterceptor.class);

  @Autowired
  ActivityStreamService activityStreamService;

  @Autowired
  JdbcClientDetailsService jdbcClientDetailsService;

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
    return true;
  }

  @Override
  public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, ModelAndView modelAndView) throws Exception {

  }

  @Override
  public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
    String requestURI = request.getRequestURI();
    LOGGER.debug("requestURI : {}", requestURI);
    if(requestURI.equals("/oauth/token")){
      String username = request.getParameter("username");
      String userAgent = request.getHeader("user-agent");
      String clientId = request.getRemoteUser();
      String userHost = request.getRemoteHost();
      int loginStatus = response.getStatus();
      String referer = request.getHeader("referer");

      //getting client info
      String clientName = null;
      ClientDetails clientDetails = jdbcClientDetailsService.loadClientByClientId(clientId);
      if(clientDetails != null){
        Map<String, Object> clientAdditionalInformation = clientDetails.getAdditionalInformation();
        if(clientAdditionalInformation != null && clientAdditionalInformation.containsKey("clientName")){
          clientName = clientAdditionalInformation.get("clientName").toString();
        }
      }
      if (clientName == null) {
        clientName = clientId;
      }

      Map<String, Object> additionalInfo = new HashMap<>();
      additionalInfo.put("requestURI", requestURI);
      additionalInfo.put("referer", referer);

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

      //Target (user host)
      activityStream.setTargetId(userHost);
      activityStream.setTargetType(ActivityStream.MetatronObjectType.UNKNOWN);

      activityStream.setResult(loginStatus == 200 ? "SUCCESS" : "FAIL");
      activityStream.setPublishedTime(DateTime.now());
      activityStreamService.addActivityStream(activityStream);
    }
  }
}
