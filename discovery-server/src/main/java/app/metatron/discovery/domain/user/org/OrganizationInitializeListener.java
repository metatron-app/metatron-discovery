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

package app.metatron.discovery.domain.user.org;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class OrganizationInitializeListener implements ApplicationListener<ContextRefreshedEvent>{

  private static final Logger LOGGER = LoggerFactory.getLogger(OrganizationInitializeListener.class);

  @Autowired
  OrganizationService organizationService;

  @Override
  public void onApplicationEvent(ContextRefreshedEvent event) {
    Environment environment = event.getApplicationContext().getEnvironment();
    if(environment.acceptsProfiles("organization-initial")){
      LOGGER.debug("Organization Initialize profile is active");
      organizationService.init();
    } else {
      LOGGER.debug("Organization Initialize profile is not active");
    }
  }
}
