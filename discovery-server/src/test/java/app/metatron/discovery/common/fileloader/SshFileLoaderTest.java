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

import com.google.common.collect.Maps;

import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.engine.EngineProperties;

public class SshFileLoaderTest {

  @Test
  public void put() throws IOException {

    String baseDir = "/tmp";

    File remoteDirFile = new File("/tmp/test_" + System.currentTimeMillis());
    remoteDirFile.mkdir();
    String remoteDir = remoteDirFile.getAbsolutePath();

    String targetFileName = "dummy.file";
    File createdFile = new File(baseDir + File.separator + targetFileName);
    createdFile.createNewFile();

    Map<String, EngineProperties.Host> hostMap = Maps.newHashMap();
    hostMap.put("localhost", new EngineProperties.Host(22, "username", "00000"));

    FileLoaderProperties properties = new FileLoaderProperties(FileLoaderProperties.RemoteType.SSH, baseDir, remoteDir, hostMap);

    List<String> remotePaths = new SshFileLoader().put(properties, createdFile.getAbsolutePath());

    Assert.assertTrue(new File(remotePaths.get(0)).exists());

  }

}
