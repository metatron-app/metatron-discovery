/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.engine;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.datasource.ingestion.IngestionHistory;

import static org.junit.Assert.assertTrue;

public class EngineIngestionServiceTest extends AbstractIntegrationTest {

  @Autowired
  EngineIngestionService engineIngestionService;

  @Test
  public void resetRealTimeIngestionTask() {
    IngestionHistory ingestionHistory = new IngestionHistory();
    ingestionHistory.setIngestionMethod(IngestionHistory.IngestionMethod.SUPERVISOR);
    ingestionHistory.setIngestionId("test-kafka_62afd213e8cf49849deeda3ef7680f18");

    boolean results = engineIngestionService.resetRealTimeIngestionTask(ingestionHistory);

    assertTrue(results);
  }

  @Test
  public void shutDownIngestionTask() {
    IngestionHistory ingestionHistory = new IngestionHistory();
    ingestionHistory.setIngestionMethod(IngestionHistory.IngestionMethod.SUPERVISOR);
    ingestionHistory.setIngestionId("test-kafka_62afd213e8cf49849deeda3ef7680f18");

    boolean results = engineIngestionService.shutDownIngestionTask(ingestionHistory);

    assertTrue(results);
  }
}