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

package app.metatron.discovery.common.fileloader;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.engine.EngineProperties;

public class FileLoaderFactoryTest extends AbstractIntegrationTest {

  @Autowired
  EngineProperties engineProperties;

  @Test
  public void loadEngineProperties() {
    System.out.println(engineProperties.getIngestion());
    System.out.println(engineProperties.getQuery());
  }

}
