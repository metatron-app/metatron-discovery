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

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by james on 2017. 11. 1..
 */
public class JupyterCommandBuilder extends AbstractCommandBuilder {

    static final String JUPYTER = "jupyter";
    static final String TO = "--to";
    static final String OUTPUT = "--output";

    String nbFormat;
    String source;
    String target;
    String action;

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getNbFormat() {
        return nbFormat;
    }

    public void setNbFormat(String nbFormat) {
        this.nbFormat = nbFormat;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public JupyterCommandBuilder() {
    }

    /**
     * e.g. jupyter action(nbconvert) --to script notebookPath.ipynb --output notebookPath(w/fileName)
     */
    private void buildCommand() {
        List<String> appArgs = new ArrayList<>();
        appArgs.add(JUPYTER);
        appArgs.add(this.action);
        appArgs.add(TO);
        appArgs.add(this.nbFormat);
        appArgs.add(this.source);
        appArgs.add(OUTPUT);
        appArgs.add(this.target);
        super.commandArgs = appArgs;
    }

    /**
     *
     * @throws IOException
     * @throws InterruptedException
     */
    public void run() throws Exception {
        buildCommand();
        super.run();
    }

}
