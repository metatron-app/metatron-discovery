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
package app.metatron.discovery;

import org.junit.After;
import org.junit.runner.RunWith;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.transaction.annotation.Transactional;

/**
 * Base class to implement transactiona integration tests using the root application configuration.
 *
 * @author Oliver Gierke
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = MetatronDiscoveryApplication.class)
@WebAppConfiguration
@ActiveProfiles({"local", "h2-in-memory-db", "logging-console-debug", "initial"})
@Transactional
public abstract class AbstractIntegrationTest {
  
  @Autowired(required = false)
  Scheduler scheduler;

  @After
  public void shutdownScheduler() throws SchedulerException {
    if (scheduler != null) {
      scheduler.shutdown(false);
    }
  }
}
