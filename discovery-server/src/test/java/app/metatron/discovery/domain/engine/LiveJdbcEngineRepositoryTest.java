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

package app.metatron.discovery.domain.engine;

import com.fasterxml.jackson.databind.JsonNode;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.datasource.data.forward.CsvResultForward;
import app.metatron.discovery.domain.datasource.data.forward.JsonResultForward;

/**
 * Created by kyungtaak on 2016. 9. 8..
 */
public class LiveJdbcEngineRepositoryTest extends AbstractIntegrationTest {

  @Autowired
  LiveJdbcEngineRepository liveJdbcEngineRepository;

  @Test
  public void query() throws Exception {

//    LiveJdbcEngineRepository liveJdbcEngineRepository = new LiveJdbcEngineRepository();

    DataConnection connection = new DataConnection("PRESTO");
    connection.setHostname("localhost");
    connection.setCatalog("hive");
    connection.setUsername("hive");
    connection.setPassword("hive");
    connection.setPort(8080);

    JsonNode jsonFileNode = liveJdbcEngineRepository.query(connection, "select * from default.sales", new JsonResultForward()).get();
    System.out.println(jsonFileNode);

    JsonNode csvFileNode = liveJdbcEngineRepository.query(connection, "select * from default.sales", new CsvResultForward()).get();
    System.out.println(csvFileNode);
  }

}
