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

package app.metatron.discovery.domain.notebook.content;

import java.util.Map;

/**
 * Created by james on 2018. 2. 2..
 */
public class RNotebookContent extends NotebookContent {

    public RNotebookContent() {
    }

    /*
     * e.g. format of vars -> @base_ymd=yyyy-MM-01;strValue=pass;#numValue=100
     */
    @Override
    public String getSentence(String vars) {
        StringBuffer sentence = new StringBuffer();
        sentence.append("%r").append(System.lineSeparator());
        String[] varsArr = vars.split(DELIMITER_SEMICOLON);
        for(String var : varsArr) {
            String[] kv = var.split(DELIMITER_EQUALITY);
            if(kv.length == 2) {
                String key = kv[0];
                if(key.startsWith(PREFIX_DATE_OPERATOR)) {
                    sentence.append(key.substring(1) + " <- \"" + super.getDate(kv[1]) + "\"");
                } else if(key.startsWith(PREFIX_NUMBER_OPERATOR)) {
                    sentence.append(key.substring(1) + " <- " + kv[1]);
                } else if(key.startsWith(PREFIX_STRARR_OPERATOR)) {
                    sentence.append(key.substring(1) + " <- \"'" + kv[1] + "'\"");
                } else {
                    sentence.append(key + " <- \"" + kv[1] + "\"");
                }
                sentence.append(System.lineSeparator());
            } else {
                throw new RuntimeException("Invalid format of key-value.");
            }
        }
        return sentence.toString();
    }

    @Override
    public String getSentence(Map<String, Object> variables) {
        StringBuffer sentence = new StringBuffer();
        sentence.append("%r").append(System.lineSeparator());
        for ( String key : variables.keySet() ) {
            if(variables.get(key) instanceof Number) {
                Number numValue = (Number) variables.get(key);
                sentence.append(key + " <- " + numValue).append(System.lineSeparator());
            } else {
                String value = (String) variables.get(key);
                if(key.startsWith("@")) {
                    value = super.getDate(value);
                }
                sentence.append(key.replaceFirst("@","") + " <- \"" + value + "\"").append(System.lineSeparator());
            }
        }
        return sentence.toString();
    }

}
