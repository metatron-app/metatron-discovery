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

package app.metatron.discovery.domain.notebook.connector;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import app.metatron.discovery.common.SparkSubmitCommandBuilder;
import app.metatron.discovery.domain.notebook.Notebook;

/**
 * Created by james on 2017. 7. 31..
 */
public abstract class JupyterBuilder implements JupyterAction {

    private static final Logger LOGGER = LoggerFactory.getLogger(JupyterBuilder.class);
    private static final String DEFAULT_SPARK_HOME = "/home/metatron/servers/spark";

    protected List<String> dataSourceQuery;
    protected final String sparkDir = getSparkHome();
    protected final String SPARK_MASTER = "yarn";
    protected final String SPARK_DEPLOY_MODE = "client";

    /**
     * check set SPARK_HOME
     *
     * located in conf/metatron-env.sh
     * e.g. export METATRON_SPARK_HOME="/home/metatron/servers/spark"
     *
     * @return directory path of spark
     */
    private String getSparkHome() {
        String path;
        String sparkHome = System.getenv("METATRON_SPARK_HOME");
        if (null == sparkHome || sparkHome.isEmpty()) {
            LOGGER.warn("METATRON_SPARK_HOME is not set.");
            path = DEFAULT_SPARK_HOME;
        } else {
            path = sparkHome + File.separator + "bin" + File.separator;
        }
        LOGGER.info("METATRON_SPARK_HOME = " + path);
        return path;
    }

    /**
     * create empty cell in jupyter
     *
     * @param mapper
     * @return
     */
    protected ArrayNode createEmptyCell(ObjectMapper mapper) {
        ArrayNode cells = mapper.createArrayNode();
        ObjectNode emptyCell = mapper.createObjectNode();
        ObjectNode empty_cell_metadata = mapper.createObjectNode();
        empty_cell_metadata.put("collapsed", true);
        empty_cell_metadata.put("trusted", true);
        emptyCell.putPOJO("metadata", empty_cell_metadata);
        emptyCell.put("cell_type", "code");
        emptyCell.put("source", "");
        emptyCell.putNull("execution_count");
        emptyCell.putArray("outputs");
        cells.add(emptyCell);

        return cells;
    }

    /**
     * create data cell in jupyter
     *
     * @param mapper
     * @return
     */
    protected ArrayNode createContentCells(ObjectMapper mapper) {
        ArrayNode cells = mapper.createArrayNode();
        //1. add text cell
        ObjectNode importCell = mapper.createObjectNode();
        importCell.put("cell_type", "markdown");
        importCell.put("metadata", mapper.createObjectNode());
        importCell.put("source", "<h3>1. load dataset</h3>");
        cells.add(importCell);
        //2. add query cell
        for (String source : dataSourceQuery) {
            ObjectNode cell = mapper.createObjectNode();
            ObjectNode cell_metadata = mapper.createObjectNode();
            cell_metadata.put("collapsed", true);
            cell_metadata.put("trusted", true);
            cell.putPOJO("metadata", cell_metadata);
            cell.put("cell_type", "code");
            cell.put("source", source);
            cell.putNull("execution_count");
            cell.putArray("outputs");
            cells.add(cell);
        }
        //3. add text cell
        ObjectNode analyzeCell = mapper.createObjectNode();
        analyzeCell.put("cell_type", "markdown");
        analyzeCell.put("metadata", mapper.createObjectNode());
        analyzeCell.put("source", "<h3>2. analyze</h3>");
        cells.add(analyzeCell);
        //4. add empty cell
        ObjectNode emptyCell = mapper.createObjectNode();
        ObjectNode empty_cell_metadata = mapper.createObjectNode();
        empty_cell_metadata.put("collapsed", true);
        empty_cell_metadata.put("trusted", true);
        emptyCell.putPOJO("metadata", empty_cell_metadata);
        emptyCell.put("cell_type", "code");
        emptyCell.put("source", "");
        emptyCell.putNull("execution_count");
        emptyCell.putArray("outputs");
        cells.add(emptyCell);

        return cells;
    }

    /**
     * generate JSON View
     *
     * @param notebook
     * @return
     * @throws Exception
     */
    public String generateJSON(Notebook notebook) throws Exception {
        SparkSubmitCommandBuilder builder = new SparkSubmitCommandBuilder();
        builder.setHome(this.sparkDir);
        builder.setMaster(this.SPARK_MASTER);
        builder.setDeployMode(this.SPARK_DEPLOY_MODE);
        builder.setExecute(notebook.getScript());

        return extractResponse(builder.runRedirectOutput());
    }

    /*
     * Response format expression
     */
    private static Matcher JSON_FORMAT_RES = Pattern.compile("(?<=\\<response\\>)(\\s*.*\\s*)(?=\\<\\/response\\>)").matcher("");

    /**
     * find regex matches to RESPONSE format <response></response>
     */
    private String extractResponse(String input) {
        if (JSON_FORMAT_RES.reset(input).find()) {
            return findLastMatches(JSON_FORMAT_RES);
        } else {
            LOGGER.warn("No response data in JSON format in this script. : {}", input);
            return "No response data in JSON format in this script.";
        }
    }

    /**
     * find last regex matches
     */
    private String findLastMatches(Matcher matcher) {
        String last = matcher.group();
        while (matcher.find()) {
            last = matcher.group();
        }
        return last;
    }

}
