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

package app.metatron.discovery.prep.parser.preparation;

import app.metatron.discovery.prep.parser.preparation.spec.SuggestToken;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.junit.Test;

import java.util.List;

import static org.junit.Assert.assertEquals;

public class PrepRuleVisitorParserTest {

    @Test
    public void keepTest1() {
        String ruleCode;
        String json;

        ruleCode = "column2*";
        json = runAndPrint(ruleCode);

        ruleCode = "";
        json = runAndPrint(ruleCode);
    }

    @Test
    public void conditionalAggrRulesTest() {
        String ruleCode;
        String json;

        ruleCode = "";
        json = runAndPrint_AggrRules(ruleCode);

        ruleCode = "coun";
        json = runAndPrint_AggrRules(ruleCode);

        ruleCode = "count";
        json = runAndPrint_AggrRules(ruleCode);

        ruleCode = "count(";
        json = runAndPrint_AggrRules(ruleCode);

        ruleCode = "count()";
        json = runAndPrint_AggrRules(ruleCode);

        ruleCode = "sum(";
        json = runAndPrint_AggrRules(ruleCode);

        ruleCode = "sum(fdsa";
        json = runAndPrint_AggrRules(ruleCode);

        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\"]", runAndPrint_AllRules(ruleCode));
    }

    @Test
    public void conditionalAllRulesTest() {
        String ruleCode;
        String json;

        ruleCode = "month(column4)*";
        json = runAndPrint_AllRules(ruleCode);

        ruleCode = "column4*month(c)";
        json = runAndPrint_AllRules(ruleCode);

        ruleCode = "column4*month(c)*";
        json = runAndPrint_AllRules(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\"]", runAndPrint_AllRules(ruleCode));
    }

    @Test
    public void conditionalExpressionTest() {
        String ruleCode;
        String json;

        ruleCode = "__FUNCTION_EXPRESSION__";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\"]", runAndPrint_SubConditionalExpress(ruleCode));

        ruleCode = "(__FUNCTION_EXPRESSION__";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\",\"')'\"]", runAndPrint_SubConditionalExpress(ruleCode));

        ruleCode = "month(";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\",\"')'\"]", runAndPrint_SubConditionalExpress(ruleCode));

        ruleCode = "length(__COLUMN_NAME__)==0";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[]", runAndPrint_SubConditionalExpress(ruleCode)); // [] means the rule command is completed.

        ruleCode = "length('string'";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\",\"')'\"]", runAndPrint_SubConditionalExpress(ruleCode));

        ruleCode = "concat('string'";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\",\"')'\"]", runAndPrint_SubConditionalExpress(ruleCode));

        ruleCode = "left('string'";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\",\"')'\"]", runAndPrint_SubConditionalExpress(ruleCode));

        ruleCode = "1!=length('string'";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[]", runAndPrint_SubConditionalExpress(ruleCode));

        ruleCode = "len";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[\"'('\",\"'length'\",\"'trim'\",\"'left'\",\"'right'\",\"'substring'\",\"'__COLUMN_NAME__'\",\"LONG\",\"'null'\",\"DOUBLE\",\"STRING\"]", runAndPrint_SubConditionalExpress(ruleCode));

        ruleCode = "length";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\",\"'('\"]", runAndPrint_SubConditionalExpress(ruleCode));

        ruleCode = "1=";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\"]", runAndPrint_SubConditionalExpress(ruleCode));

        ruleCode = "__COLUMN_NAME__!=";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[\"'('\",\"'length'\",\"'trim'\",\"'left'\",\"'right'\",\"'substring'\",\"'__COLUMN_NAME__'\",\"LONG\",\"'null'\",\"DOUBLE\",\"STRING\"]", runAndPrint_SubConditionalExpress(ruleCode));

        ruleCode = "";
        json = runAndPrint_SubConditionalExpress(ruleCode);
        assertEquals("[\"'('\",\"'length'\",\"'trim'\",\"'left'\",\"'right'\",\"'substring'\",\"'__COLUMN_NAME__'\",\"LONG\",\"'null'\",\"DOUBLE\",\"STRING\"]", runAndPrint_SubConditionalExpress(ruleCode));

    }

    @Test
    public void keepTest() {
        String ruleCode;
        String json;

        ruleCode = "keep row: __COLUMN_NAME__!=1";
        json = runAndPrint(ruleCode);
        assertEquals("[]", runAndPrint(ruleCode)); // [] means the rule command is completed.

        ruleCode = "keep row: __COLUMN_NAME__";
        json = runAndPrint(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\"]", runAndPrint(ruleCode));

        ruleCode = "keep row: (__COLUMN_NAME__!=";
        json = runAndPrint(ruleCode);
        assertEquals("[\"'('\",\"'length'\",\"'trim'\",\"'left'\",\"'right'\",\"'substring'\",\"'__COLUMN_NAME__'\",\"LONG\",\"'null'\",\"DOUBLE\",\"STRING\"]", runAndPrint(ruleCode));

        ruleCode = "keep row: \"";
        json = runAndPrint(ruleCode);
        assertEquals("[\"'('\",\"'length'\",\"'trim'\",\"'left'\",\"'right'\",\"'substring'\",\"'__COLUMN_NAME__'\",\"LONG\",\"'null'\",\"DOUBLE\",\"STRING\"]", runAndPrint(ruleCode));

        ruleCode = "keep row:";
        json = runAndPrint(ruleCode);
        assertEquals("[\"'('\",\"'length'\",\"'trim'\",\"'left'\",\"'right'\",\"'substring'\",\"'__COLUMN_NAME__'\",\"LONG\",\"'null'\",\"DOUBLE\",\"STRING\"]", runAndPrint(ruleCode));

        ruleCode = "keep row: length";
        json = runAndPrint(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\",\"'('\"]", runAndPrint(ruleCode));

        ruleCode = "keep row: length(";
        json = runAndPrint(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\",\"')'\",\"'length'\",\"'trim'\",\"'left'\",\"'right'\",\"'substring'\",\"'__COLUMN_NAME__'\",\"LONG\",\"'null'\",\"DOUBLE\",\"STRING\"]", runAndPrint(ruleCode));

        ruleCode = "keep row: length( __COLUMN_NAME__";
        json = runAndPrint(ruleCode);
        assertEquals("[\"'<'\",\"'<='\",\"'>'\",\"'>='\",\"'=='\",\"'!='\",\"')'\"]", runAndPrint(ruleCode));

        ruleCode = "keepa row: __COLUMN_NAME__";
        json = runAndPrint(ruleCode);
        assertEquals("[\"RULE_KEEP_KEYWD\",\"RULE_HEADER_KEYWD\"]", runAndPrint(ruleCode));

        ruleCode = "kee row: __COLUMN_NAME__";
        json = runAndPrint(ruleCode);
        assertEquals("[\"RULE_KEEP_KEYWD\",\"RULE_HEADER_KEYWD\"]", runAndPrint(ruleCode));

        ruleCode = "keep ro: __COLUMN_NAME__";
        json = runAndPrint(ruleCode);
        assertEquals("[\"ARG_ROW_KEYWD\"]", runAndPrint(ruleCode));

    }

    @Test
    public void headerTest() {
        String ruleCode;
        String json;

        ruleCode = "header rownum: 6";
        json = runAndPrint(ruleCode); System.out.println(json);
        assertEquals("[]", runAndPrint(ruleCode)); // [] means the rule command is completed.

        ruleCode = "header rownum : 6";
        json = runAndPrint(ruleCode); System.out.println(json);
        assertEquals("[]", runAndPrint(ruleCode));

        ruleCode = "header rownum: 6text";
        json = runAndPrint(ruleCode); System.out.println(json);
        assertEquals("[]", runAndPrint(ruleCode)); // ["LONG"]이 맞음 체크 필요

        ruleCode = "heade";
        json = runAndPrint(ruleCode); System.out.println(json);
        assertEquals("[\"RULE_KEEP_KEYWD\",\"RULE_HEADER_KEYWD\"]", runAndPrint(ruleCode));

        ruleCode = "header";
        json = runAndPrint(ruleCode); System.out.println(json);
        assertEquals("[\"ARG_ROWNUM_KEYWD\"]", runAndPrint(ruleCode));

        ruleCode = "header rownu: 6";
        json = runAndPrint(ruleCode); System.out.println(json);
        assertEquals("[\"ARG_ROWNUM_KEYWD\"]", runAndPrint(ruleCode));
    }

    private String runAndPrint(String ruleCode) {
        List<SuggestToken> suggest = new PrepRuleVisitorParser().suggest(ruleCode);

        ObjectMapper mapper = new ObjectMapper();
        mapper = mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        String json = null;
        try {
            json = mapper.writeValueAsString(suggest);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return json;
    }

    private String runAndPrint_SubConditionalExpress(String ruleCode) {
        List<String> suggest = new PrepRuleVisitorParser().suggest_conditional_expression(ruleCode);

        ObjectMapper mapper = new ObjectMapper();
        mapper = mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        String json = null;
        try {
            json = mapper.writeValueAsString(suggest);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return json;
    }

    private String runAndPrint_AllRules(String ruleCode) {
        List<SuggestToken> suggest = new PrepRuleVisitorParser().suggest_all_rules(ruleCode);

        ObjectMapper mapper = new ObjectMapper();
        mapper = mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        String json = null;
        try {
            json = mapper.writeValueAsString(suggest);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return json;
    }

    private String runAndPrint_AggrRules(String ruleCode) {
        List<SuggestToken> suggest = new PrepRuleVisitorParser().suggest_aggr_rules(ruleCode);

        ObjectMapper mapper = new ObjectMapper();
        mapper = mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
        String json = null;
        try {
            json = mapper.writeValueAsString(suggest);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return json;
    }

}
