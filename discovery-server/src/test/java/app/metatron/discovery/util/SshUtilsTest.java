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

package app.metatron.discovery.util;

import com.google.common.collect.Lists;

import org.junit.Test;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 7. 31..
 */
public class SshUtilsTest {

  @Test
  public void upload() {

    List<String> fileNames = Lists.newArrayList(
            "/Users/kyungtaak/apps/data/sale/salestarget.txt",
            "/Users/kyungtaak/apps/data/sale/sale.txt.query.select.json"
    );

    String hostname = "ear-g04-04";
    int port = 22;
    String username = "hadoop";
    String password = "skt@cctb!";
    String tagetDir = "/home/hadoop";

//    String hostname = "exntu.kr";
//    int port = 20022;
//    String username = "exntu";
//    String password = "exntu~!";
//    String tagetDir = "/home/exntu";

    SshUtils.copyLocalToRemoteFileByScp(fileNames, tagetDir, hostname, port, username, password);
  }

  @Test
  public void uploadWithPem() {

    List<String> fileNames = Lists.newArrayList(
        "/Users/kyungtaak/apps/data/sale/salestarget.txt",
        "/Users/kyungtaak/apps/data/sale/sale.txt.query.select.json"
    );

    String hostname = "skt-hadoop01.koreasouth.cloudapp.azure.com";
    int port = 22;
    String username = "hadoop";
    String password = "pem:/Users/kyungtaak/.ssh/Metatron-KR-South-CentOS72a-hadoop.pem";
    String tagetDir = "/home/hadoop";

    SshUtils.copyLocalToRemoteFileByScp(fileNames, tagetDir, hostname, port, username, password);
  }

  @Test
  public void download() {

    List<String> fileNames = Lists.newArrayList(
            "/home/hadoop/mysql-connector-java-5.1.34.jar"
//            "/home/hadoop/common.runtime.properties"
    );

    String hostname = "ear-g04-04";
    int port = 22;
    String username = "hadoop";
    String password = "skt@cctb!";
    String targetDir = "/Users/kyungtaak/temp";

//    String hostname = "exntu.kr";
//    int port = 20022;
//    String username = "exntu";
//    String password = "exntu~!";
//    String tagetDir = "/home/exntu";

    SshUtils.copyRemoteToLocalFileByScp(fileNames, targetDir, hostname, port, username, password);
  }

  @Test
  public void downloadBySftp() {
    List<String> fileNames = Lists.newArrayList(
//            "/home/hadoop/mysql-connector-java-5.1.34.jar"
            "/home/hadoop/common.runtime.properties"
    );

    String hostname = "ear-g04-04";
    int port = 22;
    String username = "hadoop";
    String password = "skt@cctb!";
    String targetDir = "/Users/kyungtaak/temp";

//    String hostname = "exntu.kr";
//    int port = 20022;
//    String username = "exntu";
//    String password = "exntu~!";
//    String tagetDir = "/home/exntu";

    SshUtils.copyRemoteToLocalFileBySftp(fileNames, targetDir, hostname, port, username, password, false, false);
  }

}
