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

package app.metatron.discovery.domain.dataprep.teddy;

import app.metatron.discovery.domain.dataprep.etl.TeddyExecutor;
import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;

public class TeddyAsyncConfigTest {
  static String getResourcePath(String relPath) {
    URL url = TeddyAsyncConfigTest.class.getClassLoader().getResource(relPath);
    return (new File(url.getFile())).getAbsolutePath();
  }

  static String readFile(String path, Charset encoding)
          throws IOException
  {
    byte[] encoded = Files.readAllBytes(Paths.get(getResourcePath(path)));
    return new String(encoded, encoding);
  }

//  @Test
  public void testWithFileArguments() throws Throwable {
    String[] argv = new String[4];

    argv[0] = readFile("teddy/args0.txt", Charset.defaultCharset());
    argv[1] = readFile("teddy/args1.txt", Charset.defaultCharset());
    argv[2] = readFile("teddy/args2.txt", Charset.defaultCharset());
    argv[3] = readFile("teddy/args3.txt", Charset.defaultCharset());

    TeddyExecutor teddyExecutor = new TeddyExecutor();
    teddyExecutor.run(argv);
  }
}
