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

package app.metatron.discovery.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.List;

/**
 * Created by james on 2017. 7. 20..
 */
public abstract class AbstractCommandBuilder implements CommandAction {

    private static final Logger LOGGER = LoggerFactory.getLogger(AbstractCommandBuilder.class);

    protected List<String> commandArgs;

    public AbstractCommandBuilder() {
    }

    /**
     * execute command line
     *
     * @throws Exception
     */
    @Override
    public void run() throws Exception {
        final ProcessBuilder builder = new ProcessBuilder(this.commandArgs);
        final Process process = builder.start();
        process.getErrorStream().close();
        process.getInputStream().close();
        process.getOutputStream().close();
        process.waitFor();
    }

    /**
     * return stdout after executing command line
     *
     * @return
     * @throws Exception
     */
    @Override
    public String runRedirectOutput() throws Exception {
        String printOut = "";
        final File tmp = File.createTempFile("out", null);
        try {
            tmp.deleteOnExit();
            final ProcessBuilder processBuilder = new ProcessBuilder();
            processBuilder.command(this.commandArgs).redirectErrorStream(true)
                    .redirectOutput(tmp);
            final Process process = processBuilder.start();
            process.waitFor();

            final StringBuilder out = new StringBuilder();
            try (final InputStream is = new FileInputStream(tmp)) {
                int c;
                while ((c = is.read()) != -1) {
                    out.append((char) c);
                }
            }
            printOut = out.toString();
            if(printOut.isEmpty()) {
                LOGGER.debug("redirectOutput is empty.");
            }
        } finally {
            tmp.delete();
            return printOut;
        }
    }
}
