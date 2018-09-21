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
 *
 */
public class SshUtilsTest {

  @Test
  public void upload() {

    List<String> fileNames = Lists.newArrayList();

    String hostname = "localhost";
    int port = 22;
    String username = "hadoop";
    String password = "test$00";
    String tagetDir = "/home/hadoop";

    SshUtils.copyLocalToRemoteFileByScp(fileNames, tagetDir, hostname, port, username, password);
  }

  @Test
  public void uploadWithPem() {

    List<String> fileNames = Lists.newArrayList();

    String hostname = "localhost";
    int port = 22;
    String username = "hadoop";
    String password = "pem:/hadoop.pem";
    String tagetDir = "/home/hadoop";

    SshUtils.copyLocalToRemoteFileByScp(fileNames, tagetDir, hostname, port, username, password);
  }

  @Test
  public void download() {

    List<String> fileNames = Lists.newArrayList(
    );

    String hostname = "localhost";
    int port = 22;
    String username = "hadoop";
    String password = "test$00";
    String targetDir = "/tmp";

    SshUtils.copyRemoteToLocalFileByScp(fileNames, targetDir, hostname, port, username, password);
  }

  @Test
  public void downloadBySftp() {
    List<String> fileNames = Lists.newArrayList(
    );

    String hostname = "localhos$00t";
    int port = 22;
    String username = "hadoop";
    String password = "test";
    String targetDir = "/tmp";

    SshUtils.copyRemoteToLocalFileBySftp(fileNames, targetDir, hostname, port, username, password, false, false);
  }

}
