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

package app.metatron.discovery.domain.datasource.connection;

import org.junit.Test;
import org.springframework.test.annotation.Rollback;

import javax.inject.Inject;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.dataconnection.DataConnection;
import app.metatron.discovery.domain.dataconnection.DataConnectionRepository;

public class DataConnectionRepositoryTest extends AbstractIntegrationTest {
  @Inject
  DataConnectionRepository dataConnectionRepository;

  @Test
  @Rollback(false)
  public void crudTest() {
    DataConnection h2Conn = new DataConnection();
    h2Conn.setImplementor("H2");
    h2Conn.setName("H2Connection");
    h2Conn.setHostname("localhost");
    h2Conn.setPort(3306);
    h2Conn.setUsername("sa");
    h2Conn.setPassword("sa");

    dataConnectionRepository.saveAndFlush(h2Conn);

    DataConnection dataConnection = dataConnectionRepository.findOne(h2Conn.getId());
    System.out.println("--------: " + dataConnection);

  }

  @Test
  public void listWorkbenchConnection(){
    DataConnection h2Conn = new DataConnection();
    h2Conn.setImplementor("H2");
    h2Conn.setName("H2Connection-Workbench");
    h2Conn.setHostname("localhost");
    h2Conn.setPort(3306);
    h2Conn.setUsername("sa");
    h2Conn.setPassword("sa");
    dataConnectionRepository.saveAndFlush(h2Conn);


    h2Conn = new DataConnection();
    h2Conn.setImplementor("H2");
    h2Conn.setName("H2Connection-Default");
    h2Conn.setHostname("localhost");
    h2Conn.setPort(3306);
    h2Conn.setUsername("sa");
    h2Conn.setPassword("sa");
    dataConnectionRepository.saveAndFlush(h2Conn);

//    Page<DataConnection> connections = dataConnectionRepository.findDataConnectionByScope(DataConnection.Scope.DEFAULT);
//    System.out.println("connections = " + connections);
//
//    connections = dataConnectionRepository.findDataConnectionByScope(DataConnection.Scope.WORKBENCH);
//    System.out.println("connections = " + connections);
  }
}
