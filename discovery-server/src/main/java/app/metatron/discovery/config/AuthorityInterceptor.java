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

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import app.metatron.discovery.common.CommonLocalVariable;
import app.metatron.discovery.domain.user.org.Organization;
import app.metatron.discovery.domain.user.org.OrganizationService;

/**
 *
 */
@Component
public class AuthorityInterceptor extends HandlerInterceptorAdapter {

  private static final Logger LOGGER = LoggerFactory.getLogger(AuthorityInterceptor.class);

  final OrganizationService organizationService;

  @Autowired
  public AuthorityInterceptor(OrganizationService organizationService) {
    this.organizationService = organizationService;
  }

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

    LOGGER.debug("Pre-Handle.");
    //username
    String userId = SecurityContextHolder.getContext().getAuthentication().getName();
    CommonLocalVariable.getLocalVariable().setUserId(userId);
    LOGGER.debug("Pre-Handle. userId : {}", userId);

    if (StringUtils.isEmpty(userId)) {
      return true;
    }

    //org code
    List<String> orgCodes = organizationService.findCodesOfMembersOrg(userId);
    LOGGER.debug("Pre-Handle. ogrCode : {}", orgCodes);
    String orgCode = orgCodes.stream().findFirst().orElse(Organization.DEFAULT_ORGANIZATION_CODE);
    CommonLocalVariable.getLocalVariable().getTenantAuthority().setOrgCode(orgCode);

    return super.preHandle(request, response, handler);
  }
}
