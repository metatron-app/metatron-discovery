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

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.activities.spec.ActivityType;
import org.junit.Assert;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class ActivityStreamServiceTest extends AbstractIntegrationTest {

    @Autowired
    ActivityStreamService activityStreamService;

    @Test
    public void match_value_by_exclude_conditions() {

        ActivityStream testActivityStream1 = new ActivityStream();
        testActivityStream1.setAction(ActivityType.ARRIVE);
        testActivityStream1.setRemoteHost("0:0:0:0:0:0:0:1");
        testActivityStream1.setObjectId("polaris_trusted");

        Assert.assertTrue(activityStreamService.checkByExclusionConditions(testActivityStream1));

        ActivityStream testActivityStream2 = new ActivityStream();
        testActivityStream2.setAction(ActivityType.ARRIVE);
        testActivityStream2.setRemoteHost("0:0:0:0:0:0:0:1");
        testActivityStream2.setObjectId("test");

        Assert.assertFalse(activityStreamService.checkByExclusionConditions(testActivityStream2));

        ActivityStream testActivityStream3 = new ActivityStream();
        testActivityStream3.setAction(ActivityType.ARRIVE);
        testActivityStream3.setRemoteHost("0:0:0:0:0:0:0:1");
        testActivityStream3.setObjectId(null);

        Assert.assertFalse(activityStreamService.checkByExclusionConditions(testActivityStream3));
    
        ActivityStream testActivityStream4 = new ActivityStream();
        testActivityStream4.setAction(ActivityType.ARRIVE);
        testActivityStream4.setRemoteHost("0:0:0:0:0:0:0:1:contain");
        testActivityStream4.setObjectId("polaris_trusted");
    
        Assert.assertTrue(activityStreamService.checkByExclusionConditions(testActivityStream4));
    }
}