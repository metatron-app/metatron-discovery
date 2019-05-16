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

package app.metatron.discovery.domain.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import app.metatron.discovery.domain.activities.spec.ActivityStreamV2;

@Controller
public class ActivityWebSocketController {

  private static Logger LOGGER = LoggerFactory.getLogger(ActivityWebSocketController.class);

  @Autowired
  public ActivityStreamService activityStreamService;

  /**
   * 사용자의 모든 Activity 를 전달 받습니다. (추후 그룹단위로 Activity Queue 분할 검토)
   *
   * @param accessor
   * @throws Exception
   */
  @MessageMapping("/activities/add")
  public void addActivity(SimpMessageHeaderAccessor accessor,
                               ActivityStreamV2 activity) throws Exception {

    LOGGER.debug("User({}, {}) activity type : {}, activity recevied : {}",
                 accessor.getUser().getName(), accessor.getSessionId(), activity.getType(), activity.getObject());

    activityStreamService.addActivity(activity, accessor.getUser());
  }

}
