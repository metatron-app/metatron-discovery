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

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Map;

/**
 * Created by james on 2018. 1. 30..
 */
public class NotebookContent {

    public static final String DELIMITER_SEMICOLON = "\u003B";      //;
    public static final String DELIMITER_EQUALITY = "\u003D";       //=

    public static final String PREFIX_DATE_OPERATOR = "\u0040";     //@
    public static final String PREFIX_NUMBER_OPERATOR = "\u0023";   //#
    public static final String PREFIX_STRARR_OPERATOR = "\u0024";   //$

    private String language;
    private int line;
    private String vars;
    private Map<String, Object> variables;

    public NotebookContent() {
    }

    public String getLanguage() {
        return language;
    }

    public int getLine() {
        return line;
    }

    public void setLine(int line) {
        this.line = line;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getVars() {
        return vars;
    }

    public void setVars(String vars) {
        this.vars = vars;
    }

    public Map<String, Object> getVariables() {
        return variables;
    }

    public void setVariables(Map<String, Object> variables) {
        this.variables = variables;
    }

    /**
     * Get date data using format
     *
     * @param format
     * @return
     */
    protected String getDate(String format) {
        DateFormat dateFormat = new SimpleDateFormat(format);
        return dateFormat.format(new Date());
    }

    /**
     * Get first date of month
     *
     * @param date
     * @return
     */
    private Date getFirstDateOfMonth(Date date){
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.set(Calendar.DAY_OF_MONTH, cal.getActualMinimum(Calendar.DAY_OF_MONTH));
        return cal.getTime();
    }


    /**
     * Get sentence from variables (Map)
     *
     * @param variables
     * @return
     */
    public String getSentence(Map<String, Object> variables) {
        return null;
    }

    /**
     * Get sentence from vars (String)
     *
     * @param vars
     * @return
     */
    public String getSentence(String vars) {
        return null;
    }

}
