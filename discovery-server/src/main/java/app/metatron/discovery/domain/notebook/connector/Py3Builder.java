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

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import app.metatron.discovery.common.SparkSubmitCommandBuilder;
import app.metatron.discovery.domain.notebook.Notebook;

/**
 * Created by james on 2017. 7. 31..
 */
public class Py3Builder extends JupyterBuilder {

    private static final Logger LOGGER = LoggerFactory.getLogger(Py3Builder.class);

    public Py3Builder() {
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
        kernelspec.put("name", "python3");
        kernelspec.put("display_name", "Python 3");
        kernelspec.put("language", "python");

        ObjectNode language_info = mapper.createObjectNode();
        language_info.put("name", "python");
        language_info.put("version", "3.6.1");
        language_info.put("mimetype", "text/x-python");
        ObjectNode codemirror_mode = mapper.createObjectNode();
        codemirror_mode.put("name", "ipython");
        codemirror_mode.put("version", "3");
        language_info.putPOJO("codemirror_mode", codemirror_mode);
        language_info.put("pygments_lexer", "ipython3");
        language_info.put("nbconvert_exporter", "python");
        language_info.put("pygments_lexer", "ipython3");
        language_info.put("file_extension", ".py");

        metadata.putPOJO("kernelspec", kernelspec);
        metadata.putPOJO("language_info", language_info);

        return metadata;
    }

    /**
     * generate HTML View
     */
    @Override
    public String generateHTML(Notebook notebook) throws Exception {
        SparkSubmitCommandBuilder builder = new SparkSubmitCommandBuilder();
        builder.setHome(super.sparkDir);
        builder.setMaster(super.SPARK_MASTER);
        builder.setDeployMode(super.SPARK_DEPLOY_MODE);
        builder.setExecute(notebook.getScript());

        return convertOutputToReport(builder.runRedirectOutput(), notebook);
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
                    "from pymetis.clients import " + typeOfDataset + ", response",
                    "dataset = " + typeOfDataset + ".get('" + cUrl.getHost() + "','" + cPort + "','" + notebook.getDsId() + "')"
//                  "response.write({'coefficient' : 2, 'intercept' : 0})"
            ));
            return query;
        } catch (MalformedURLException e) {
            e.printStackTrace();
            throw new RuntimeException("Fail to create the cell of load dataset in Jupyter-Py3-kernel.");
        }
    }

    /**
     * convert String to html documents
     */
    private String convertOutputToReport(String input, Notebook notebook) {
        if (StringUtils.isEmpty(input))
            return "<html><body></body></html>";
        BufferedReader st = new BufferedReader(new StringReader(input));
        StringBuffer buf = new StringBuffer("<html><head><style type=\"text/css\">body { line-height:0.6em; margin-left: 12%; margin-right: 12%; }</style></head><body>");
        try {
            buf.append("<h2 style=\"font-family: Arial, Times New Roman, Georgia, Serif;padding:10px 10px 0 0;\">" + notebook.getNotebookAPI().getName() + "</h2>");
            buf.append("<p style=\"font-size: 12px;font-family: Arial, Times New Roman, Georgia, Serif;padding:5px 5px 0 0;\"><i>metatron</i></p>");
            buf.append("<p style=\"font-size: 13px;font-family: Arial, Times New Roman, Georgia, Serif;\"><i>" + getCurrentDateTime() + "</i></p>");
            String str = st.readLine();
            while (StringUtils.isNotEmpty(str)) {
                if (str.equalsIgnoreCase("<br/>")) {
                    str = "<br>";
                }
                buf.append("<div style=\"font-size: 12px;color: #585858;font-family: Arial, Times New Roman, Georgia, Serif;border-style:solid;border-color:#d3d3d3;border-width:1px;padding:9px 9px 9px 9px;\">").append(str).append("</div>");
                if (!str.equalsIgnoreCase("<br>")) {
                    buf.append("<br>");
                }
                str = st.readLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        buf.append("</body></html>");
        return buf.toString();
    }

    /**
     * get current datetime
     *
     * @return
     */
    private String getCurrentDateTime() {
        DateFormat df = new SimpleDateFormat("EEE MMM dd HH:mm:ss yyyy", new Locale("en", "US"));
        Date date = new Date();
        return df.format(date);
    }

}
