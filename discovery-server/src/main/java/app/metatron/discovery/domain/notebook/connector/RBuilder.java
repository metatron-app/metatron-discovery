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
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import app.metatron.discovery.common.SparkSubmitCommandBuilder;
import app.metatron.discovery.domain.notebook.Notebook;

/**
 * Created by james on 2017. 7. 31..
 */
public class RBuilder extends JupyterBuilder {

    private static final Logger LOGGER = LoggerFactory.getLogger(RBuilder.class);

    public RBuilder() {
    }

    /**
     * create load dataset query cell
     */
    @Override
    public Object createCells(Notebook notebook) {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode content = mapper.createObjectNode();

        super.dataSourceQuery = this.createDataCell(notebook);
        content.putPOJO("cells", notebook.getDsType().equals(Notebook.DSType.NONE) ? super.createEmptyCell(mapper) : super.createContentCells(mapper));
        content.putPOJO("metadata", this.createMetaData(mapper));
        content.put("nbformat", 4);
        content.put("nbformat_minor", 2);

        return mapper.valueToTree(content);
    }

    /**
     * create meta data of cell
     */
    @Override
    public Object createMetaData(ObjectMapper mapper) {
        ObjectNode metadata = mapper.createObjectNode();

        ObjectNode kernelspec = mapper.createObjectNode();
        kernelspec.put("name", "ir");
        kernelspec.put("display_name", "R");
        kernelspec.put("language", "R");

        ObjectNode language_info = mapper.createObjectNode();
        language_info.put("name", "R");
        language_info.put("codemirror_mode", "r");
        language_info.put("pygments_lexer", "r");
        language_info.put("mimetype", "text/x-r-source");
        language_info.put("file_extension", ".r");
        language_info.put("version", "3.3.2");

        metadata.putPOJO("kernelspec", kernelspec);
        metadata.putPOJO("language_info", language_info);

        return metadata;
    }

    /**
     * generate HTML View
     */
    @Override
    public String generateHTML(Notebook notebook) throws Exception {
        //1. make new r-script (include rmarkdown rendering code)
        String tempFileName = UUID.randomUUID().toString();
        final File tempFile = File.createTempFile(tempFileName, ".R");
        FileUtils.writeStringToFile(tempFile, "library(rmarkdown)" + System.getProperty("line.separator"), true);
        String render = "rmarkdown::render(\"" + notebook.getScript() + "\",output_file = \"" + tempFileName + ".html"
                + "\",output_dir = \"" + System.getProperty("java.io.tmpdir") + "\")";
        FileUtils.writeStringToFile(tempFile, render, true);

        //2. execute r-script using spark-submit
        SparkSubmitCommandBuilder builder = new SparkSubmitCommandBuilder();
        builder.setHome(super.sparkDir);
        builder.setMaster(super.SPARK_MASTER);
        builder.setDeployMode(super.SPARK_DEPLOY_MODE);
        builder.setExecute(tempFile.getPath());
        builder.run();

        //3. return html content
        String content = "";
        String htmlFilePath = System.getProperty("java.io.tmpdir") + File.separator + tempFileName + ".html";
        File htmlFile = new File(htmlFilePath);
        try {
            if (htmlFile.exists() && htmlFile.length() != 0) {
                content = FileUtils.readFileToString(htmlFile);
                LOGGER.debug("HTML content is\n {}", content);
            } else {
                throw new RuntimeException("HTML does not exist or empty.");
            }
        } finally {
            tempFile.deleteOnExit();
            htmlFile.deleteOnExit();
            new File(notebook.getScript()).deleteOnExit();
            return content.replaceFirst("<h1 class=\"title toc-ignore\">(.*?)</h1>", "<h1 class=\"title toc-ignore\">" + notebook.getNotebookAPI().getName() + "</h1>");
        }
    }

    /**
     * append load dataset code
     */
    private List<String> createDataCell(Notebook notebook) {
        try {
            String typeOfDataset = notebook.getDsType().getValue();
            URL cUrl = new URL(notebook.getCurrentUrl());
            int cPort = cUrl.getPort() == -1 ? 80 : cUrl.getPort();
            List<String> query = new ArrayList<>(Arrays.asList(
                    "library(RMetis)",
                    "dataset <- " + typeOfDataset + ".get(client.url('" + cUrl.getHost() + "'," + cPort + "), '" + notebook.getDsId() + "')"
//                  "response.write(list(coefficient = 2, intercept = 0))"
            ));
            return query;
        } catch (MalformedURLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fail to create the cell of load dataset in Jupyter-R-kernel.");
        }
    }

}
