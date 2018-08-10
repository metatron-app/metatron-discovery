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

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.Map;

import app.metatron.discovery.domain.activities.spec.ActivityStreamV2;
import app.metatron.discovery.domain.activities.spec.ActivityType;
import app.metatron.discovery.domain.workbook.configurations.format.TimeFieldFormat;
import app.metatron.discovery.domain.workspace.WorkspaceService;
import app.metatron.discovery.util.AuthUtils;

@Service
@Transactional(readOnly = true)
public class ActivityStreamService {

  @Autowired
  WorkspaceService workspaceService;

  @Autowired
  ActivityStreamRepository activityStreamRepository;

  @Transactional
  public ActivityStream addActivity(ActivityStreamV2 activity) {
    return addActivity(activity, AuthUtils.getAuthentication());
  }

  @Transactional
  public ActivityStream addActivity(ActivityStreamV2 activity, Principal principal) {
    ActivityStream createActivityStream = new ActivityStream(activity, principal);

    // 임시로 조치함
    if(createActivityStream.getAction() == ActivityType.VIEW &&
        createActivityStream.getObjectType() == ActivityStream.MetatronObjectType.WORKSPACE) {
      workspaceService.updateLastAccessedTime(createActivityStream.getObjectId());
    }

    return activityStreamRepository.save(createActivityStream);
  }

  public Map<String, Long> getWorkspaceViewByDateTime(String workspaceId,
                                                      TimeFieldFormat.TimeUnit timeUnit,
                                                      DateTime from, DateTime to) {

    if(from.isAfter(to)) {
      throw new IllegalArgumentException("'from' must be ahead of 'to'.");
    }

    switch (timeUnit) {
      case SECOND:
      case MINUTE:
        throw new IllegalArgumentException("Not supported time unit : " + timeUnit);
      default:
        break;
    }

    return activityStreamRepository.findWorkspaceViewStat(workspaceId, timeUnit, from, to);
  }

}
