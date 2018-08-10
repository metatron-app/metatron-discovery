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
import app.metatron.discovery.domain.datasource.connection.file.LocalFileConnection;
import app.metatron.discovery.domain.datasource.connection.jdbc.H2Connection;

public class DataConnectionRepositoryTest extends AbstractIntegrationTest {
  @Inject
  DataConnectionRepository dataConnectionRepository;

  @Test
  @Rollback(false)
  public void crudTest() {
    H2Connection h2Conn = new H2Connection();
    h2Conn.setName("H2Connection");
    h2Conn.setHostname("localhost");
    h2Conn.setPort(3306);
    h2Conn.setUsername("sa");
    h2Conn.setPassword("sa");
    h2Conn.setPath("/abc/bad");

    dataConnectionRepository.saveAndFlush(h2Conn);

    DataConnection dataConnection = dataConnectionRepository.findOne(h2Conn.getId());
    System.out.println("--------: " + dataConnection);
    System.out.println(dataConnection instanceof H2Connection);

  }

  @Test
  @Rollback(false)
  public void fileTest() {
    LocalFileConnection connection = new LocalFileConnection();
    connection.setName("export.xlsx");
//    connection.setFileKey("a8107d8d-880d-4e72-8eac-98d1cc469826.xlsx");
    connection.setPath("a8107d8d-880d-4e72-8eac-98d1cc469826.xlsx");
    connection.setDescription("0,Y");

    dataConnectionRepository.saveAndFlush(connection);

    DataConnection dataConnection = dataConnectionRepository.findOne(connection.getId());
    System.out.println("--------: " + dataConnection);
    System.out.println(dataConnection instanceof LocalFileConnection);

  }

  @Test
  public void listWorkbenchConnection(){
    H2Connection h2Conn = new H2Connection();
    h2Conn.setName("H2Connection-Workbench");
    h2Conn.setHostname("localhost");
    h2Conn.setPort(3306);
    h2Conn.setUsername("sa");
    h2Conn.setPassword("sa");
    h2Conn.setPath("/abc/bad");
    h2Conn.setUsageScope(DataConnection.UsageScope.WORKBENCH);
    dataConnectionRepository.saveAndFlush(h2Conn);


    h2Conn = new H2Connection();
    h2Conn.setName("H2Connection-Default");
    h2Conn.setHostname("localhost");
    h2Conn.setPort(3306);
    h2Conn.setUsername("sa");
    h2Conn.setPassword("sa");
    h2Conn.setPath("/abc/bad");
    dataConnectionRepository.saveAndFlush(h2Conn);

//    Page<DataConnection> connections = dataConnectionRepository.findDataConnectionByScope(DataConnection.Scope.DEFAULT);
//    System.out.println("connections = " + connections);
//
//    connections = dataConnectionRepository.findDataConnectionByScope(DataConnection.Scope.WORKBENCH);
//    System.out.println("connections = " + connections);
  }
}
