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

import app.metatron.discovery.prep.parser.antlr.PrepRuleBaseVisitor;
import app.metatron.discovery.prep.parser.antlr.PrepRuleLexer;
import app.metatron.discovery.prep.parser.antlr.PrepRuleParser;
import app.metatron.discovery.prep.parser.preparation.rule.expr.BuiltinFunctions;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Function;
import app.metatron.discovery.prep.parser.preparation.spec.SuggestToken;
import com.google.common.base.Supplier;
import com.google.common.base.Suppliers;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.Interval;
import org.antlr.v4.runtime.misc.IntervalSet;
import org.antlr.v4.runtime.tree.ErrorNodeImpl;
import org.antlr.v4.runtime.tree.ParseTree;
import org.antlr.v4.runtime.tree.TerminalNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Modifier;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class PrepRuleVisitorParser implements PrepParser {

    private static final Logger LOGGER = LoggerFactory.getLogger(PrepRuleVisitorParser.class);

    // 2018.05.23 "(?i).*(sum|avg|max|min|count|now|month|day|hour|minute|second|millisecond|if|isnull|isnan|length|trim|ltrim|rtrim|upper|lower|substring|math[.]abs|math[.]acos|math[.]asin|math[.]atan|math[.]cbrt|math[.]ceil|math[.]cos|math[.]cosh|math[.]exp|math[.]expm1|math[.]getExponent|math[.]round|math[.]signum|math[.]sin|math[.]sinh|math[.]sqrt|math[.]tan|math[.]tanh|left|right|if|substring|add_time|concat|concat_ws)\\s*$"
    private static final Pattern patternFunctionName = Pattern.compile(
            "(?i).*(row_number | rolling_sum | rolling_avg | lag | lead | contains | startswith | endswith | add_time| concat| concat_ws| day| hour| if| ismismatched| isnan| isnull| length| lower| ltrim| math[.]abs| math[.]acos| math[.]asin| math[.]atan| math[.]cbrt| math[.]ceil| math[.]cos| math[.]cosh| math[.]exp| math[.]expm1| math[.]getExponent| math[.]round| math[.]signum| math[.]sin| math[.]sinh| math[.]sqrt| math[.]tan| math[.]tanh| millisecond| minute| month| now| rtrim| second| substring| time_diff| timestamp| trim| upper| year)\\s*$"
    );

    private static final Map<String, Supplier<Function>> functions = Maps.newHashMap();

    static {
        register(BuiltinFunctions.class);
    }

    public static void register(Class parent) {
        for (Class clazz : parent.getClasses()) {
            if (!Modifier.isAbstract(clazz.getModifiers()) && Function.class.isAssignableFrom(clazz)) {
                try {
                    Function function = (Function) clazz.newInstance();
                    String name = function.name().toLowerCase();
                    if (functions.containsKey(name)) {
                        throw new IllegalArgumentException("function '" + name + "' should not be overridden");
                    }
                    Supplier<Function> supplier = function instanceof Function.Factory ? (Function.Factory) function
                            : Suppliers.ofInstance(function);
                    functions.put(name, supplier);
                    if (parent != BuiltinFunctions.class) {
                        LOGGER.debug("user defined function '" + name + "' is registered with class " + clazz.getName());
                    }
                } catch (Exception e) {
                    LOGGER.warn("Failed to instantiate " + clazz.getName() + ".. ignoring");
                }
            } else if ( clazz.isInterface())
                register(clazz);
        }
    }

    public Map<String,String> extractWindowPartRule(String _ruleString) {
        String ruleString = _ruleString;
        StringBuffer sb = new StringBuffer();

        Map<String, String> extracts = Maps.newHashMap();
        extracts.put("entire", _ruleString);
        extracts.put("extract", "entire");

        // aggregate_function
        int openIdx = ruleString.indexOf('(');
        int closeIdx = ruleString.lastIndexOf(')');
        if(0<=openIdx && 0<=closeIdx && openIdx<closeIdx) {
            sb.append(ruleString.substring(0, openIdx));
            if( 0<ruleString.substring(openIdx+1,closeIdx).trim().length()) {
                sb.append("(@_COLUMN_NAME_@");
            } else {
                sb.append("(");
            }
            sb.append(ruleString.substring(closeIdx));
        } else if(0<openIdx && -1==closeIdx) {
            sb.append(ruleString.substring(0, openIdx));
            if (openIdx + 1 < ruleString.length() && 0 < ruleString.substring(openIdx + 1).trim().length()) {
                sb.append("(@_COLUMN_NAME_@");
            } else {
                sb.append("(");
            }
        } else {
            sb.append(ruleString);
        }

        extracts.put("window",sb.toString());
        extracts.put("extract","window");

        return extracts;
    }

    public Map<String,String> extractAggrPartRule(String _ruleString) {
        String ruleString = _ruleString;
        StringBuffer sb = new StringBuffer();

        Map<String, String> extracts = Maps.newHashMap();
        extracts.put("entire", _ruleString);
        extracts.put("extract", "entire");

        // aggregate_function
        int openIdx = ruleString.indexOf('(');
        int closeIdx = ruleString.lastIndexOf(')');
        if(0<=openIdx && 0<=closeIdx && openIdx<closeIdx) {
            sb.append(ruleString.substring(0, openIdx));
            if( 0<ruleString.substring(openIdx+1,closeIdx).trim().length()) {
                sb.append("(@_COLUMN_NAME_@");
            } else {
                sb.append("(");
            }
            sb.append(ruleString.substring(closeIdx));
        } else if(0<openIdx && -1==closeIdx) {
            sb.append(ruleString.substring(0, openIdx));
            if (openIdx + 1 < ruleString.length() && 0 < ruleString.substring(openIdx + 1).trim().length()) {
                sb.append("(@_COLUMN_NAME_@");
            } else {
                sb.append("(");
            }
        } else {
            sb.append(ruleString);
        }

        extracts.put("aggregate",sb.toString());
        extracts.put("extract","aggregate");

        return extracts;
    }

    public Map<String,String> extractPartRule(String _ruleString) {
        String ruleString = _ruleString;
        StringBuffer sb = new StringBuffer();

        Map<String,String> extracts = Maps.newHashMap();
        extracts.put("entire",_ruleString);
        extracts.put("extract","entire");

        // quotes
        int openIdx = -1;
        boolean opened = false;
        for (int i = 0; i < ruleString.length(); i++) {
            if (ruleString.charAt(i) == '\'') {
                if(i==0 || ruleString.charAt(i-1)!='\\') {
                    if(true==opened) {
                        opened = false;
                        openIdx = -1;
                        sb.append("@_STRING_@");
                    } else {
                        opened = true;
                        openIdx = i;
                    }
                }
            }
            if(false==opened) {
                sb.append(ruleString.charAt(i));
            }
        }
        if(true==opened) {
            String quote = ruleString.substring(openIdx);
            extracts.put("quote",quote);
            extracts.put("extract","quote");
            return extracts;
        } else {
            ruleString = sb.toString();
        }

        // regex
        /* 정규식은 나눗셈과 충돌남
        openIdx = -1;
        opened = false;
        sb = new StringBuffer();
        for (int i = 0; i < ruleString.length(); i++) {
            if (ruleString.charAt(i) == '/') {
                if(i==0 || ruleString.charAt(i-1)!='\\') {
                    if(true==opened) {
                        opened = false;
                        openIdx = -1;
                        sb.append("@_REGEX_@");
                    } else {
                        opened = true;
                        openIdx = i;
                    }
                }
            }
            if(false==opened) {
                sb.append(ruleString.charAt(i));
            }
        }
        if(true==opened) {
            String regex = ruleString.substring(openIdx);
            extracts.put("regex",regex);
            extracts.put("extract","regex");
            return extracts;
        } else {
            ruleString = sb.toString();
        }
        */

        // brackets
        int openCnt = 0;
        LinkedList<Integer> openIdxs = Lists.newLinkedList();
        HashMap<Integer,Integer> brackets = Maps.newHashMap();
        for (int i = 0; i < ruleString.length(); i++) {
            if (ruleString.charAt(i) == '(') {
                if(i==0 || ruleString.charAt(i-1)!='\\') {
                    openCnt++;
                    openIdxs.push(i);
                }
            } else if (ruleString.charAt(i) == ')') {
                if(i==0 || ruleString.charAt(i-1)!='\\') {
                    openCnt--;
                    if(openCnt<0) {
                        return extracts;
                    }
                    brackets.put(openIdxs.pop(),i);
                }
            }
        }
        boolean hasBracket = false;
        if(0<openIdxs.size() || 0<brackets.size()) {
            hasBracket = true;
        }
        sb = new StringBuffer();
        if(0==openCnt) {
            openIdx = 0;
        } else if(0<openCnt) {
            openIdx = openIdxs.pop();
            if(0<openIdx) {
                String evidence = ruleString.substring(0,openIdx);
                Matcher m = patternFunctionName.matcher(evidence);
                if(m.matches()) {
                    String _function_name = m.group(1);
                    sb.append(_function_name);
                    extracts.put("bracketFunction", _function_name);
                }
            }
        } else { // not reachable
            return extracts;
        }
        for (int i = openIdx; i < ruleString.length(); i++) {
            Integer closeIdx = brackets.get(i);
            if(null!=closeIdx) {
                String evidence = sb.toString();
                Matcher m = patternFunctionName.matcher(evidence);
                if (m.matches()) {
                    String _function_name = m.group(1);
                    int _function_name_pos = evidence.lastIndexOf(_function_name);
                    sb = new StringBuffer(evidence.substring(0, _function_name_pos).concat("@_FUNCTION_EXPRESSION_@"));
                } else {
                    sb.append("@_COMPLETED_BRAKET_@");
                }
                i = closeIdx;
                continue;
            }
            sb.append(ruleString.charAt(i));
        }
        ruleString = sb.toString();
        if(true==hasBracket) {
            extracts.put("bracket", ruleString);
            extracts.put("extract", "bracket");

            int lastOpenIdx = ruleString.lastIndexOf("(");
            if(0<=lastOpenIdx&&lastOpenIdx<ruleString.length()) {
                ruleString = ruleString.substring(lastOpenIdx+1);
                extracts.put("functionParameter", ruleString);
                extracts.put("extract", "functionParameter");
            }
        }

        // commas
        int commaIdx = 0;
        int commaCnt = 0;
        for (int i = 0; i < ruleString.length(); i++) {
            if (ruleString.charAt(i) == ',') {
                if(i==0 || ruleString.charAt(i-1)!='\\') {
                    commaIdx = i;
                    commaCnt++;
                }
            }
        }
        if(0<commaIdx) {
            ruleString = ruleString.substring(commaIdx + 1);
            extracts.put("comma", ruleString);
            extracts.put("commaCount", String.valueOf(commaCnt));
            extracts.put("extract", "comma");
        }

        // operator
        List<String> operators = Arrays.asList(">=","<=","==","!=",">","<","+","-","*","/","=");
        for(String _operator : operators) {
            int lastIdx = ruleString.lastIndexOf(_operator);
            if(0<=lastIdx) {
                int parameterIdx = lastIdx+_operator.length();

                extracts.put("operator", ruleString.substring(lastIdx,parameterIdx));
                extracts.put("extract", "operator");

                if(parameterIdx<ruleString.length()) {
                    extracts.put("operatorParameter", ruleString.substring(parameterIdx));
                    extracts.put("extract", "operatorParameter");
                } else {
                    String operatorLeft = ruleString.substring(0,parameterIdx);

                    List<String> replaces= Lists.newArrayList();
                    replaces.add( "@_COMPLETED_BRACKET_@" );
                    replaces.add( "@_COLUMN_NAME_@");
                    replaces.add( "@_VALUE_ARGUMENT_@");
                    replaces.add( "@_FUNCTION_EXPRESSION_@");
                    replaces.add( "@_STRING_@" );
                    for(String replace : replaces) {
                        operatorLeft = operatorLeft.replaceAll( replace, "'"+replace+"'" );
                    }

                    extracts.put("operatorLeft", operatorLeft);
                    extracts.put("extract", "operatorLeft");
                }
                break;
            }
        }

        return extracts;
    }

    @Override
    public List<SuggestToken> suggest(String code) {
        //code = code.replaceAll("\\\\", "\\\\\\\\");
        CharStream charStream = new ANTLRInputStream(code);
        PrepRuleLexer lexer = new PrepRuleLexer(charStream);
        TokenStream tokens = new CommonTokenStream(lexer);
        PrepRuleParser parser = new PrepRuleParser(tokens);
        /*
        parser.getInterpreter().setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);
        parser.setBuildParseTree(true);
        */

        List<SuggestToken> suggests = Lists.newArrayList();
        List<SuggestToken> token_nums = Lists.newArrayList();
        PrepRulesetVisitor ruleSetVisitor = new PrepRulesetVisitor();
        token_nums= ruleSetVisitor.visit(parser.ruleset());
        //token_nums = ruleSetVisitor.visitRuleset(parser.ruleset());
        Vocabulary vocabulary = parser.getVocabulary();
        for(SuggestToken token_num : token_nums) {
            String tokenName = vocabulary.getDisplayName(token_num.getTokenNum());
            String tokenName2 = vocabulary.getLiteralName(token_num.getTokenNum());
            String tokenName3 = vocabulary.getSymbolicName(token_num.getTokenNum());
            if(tokenName.startsWith("'")&&tokenName.endsWith("'")) {
                tokenName = tokenName.substring(1,tokenName.length()-1);
            }
            token_num.setTokenString(tokenName);
            suggests.add(token_num);
        }
        return suggests;
    }

    @Override
    public List<String> suggest_conditional_expression(String code) {
        //code = code.replaceAll("\\\\", "\\\\\\\\");
        CharStream charStream = new ANTLRInputStream(code);
        PrepRuleLexer lexer = new PrepRuleLexer(charStream);
        TokenStream tokens = new CommonTokenStream(lexer);
        PrepRuleParser parser = new PrepRuleParser(tokens);
        Vocabulary vocabulary = parser.getVocabulary();
        /*
        parser.getInterpreter().setPredictionMode(PredictionMode.LL_EXACT_AMBIG_DETECTION);
        parser.setBuildParseTree(true);
        */

        List<String> suggests = Lists.newArrayList();
        List<Integer> token_nums = Lists.newArrayList();
        PrepSubConditionalExpressionVisitor prepSubConditionalExpressionVisitor = new PrepSubConditionalExpressionVisitor();
        token_nums = prepSubConditionalExpressionVisitor.visit(parser.sub_condition_expression());
        for(Integer token_num : token_nums) {
            String tokenName = vocabulary.getDisplayName(token_num);
            /*
            String tokenName2 = vocabulary.getLiteralName(token_num);
            String tokenName3 = vocabulary.getSymbolicName(token_num);
            */
            suggests.add(tokenName);
        }
        return suggests;
    }

    @Override
    public List<SuggestToken> suggest_aggr_rules(String _code) {
        List<SuggestToken> suggests = Lists.newArrayList();

        Map<String,String> extracts = this.extractAggrPartRule(_code);
        String entire = extracts.get("entire");
        String target = extracts.get("extract");
        String code = extracts.get(target);

        SuggestToken token = new SuggestToken();
        token.setStart(-1);
        token.setStop(-1);
        token.setTokenNum(-1);
        token.setTokenSource(entire);
        token.setTokenString(code);
        suggests.add(token);

        CharStream charStream = new ANTLRInputStream(code);
        PrepRuleLexer lexer = new PrepRuleLexer(charStream);
        TokenStream tokens = new CommonTokenStream(lexer);
        PrepRuleParser parser = new PrepRuleParser(tokens);
        Vocabulary vocabulary = parser.getVocabulary();

        List<SuggestToken> token_nums;

        PrepTestAggregateExpressionVisitor prepTestAggregateExpressionVisitor = new PrepTestAggregateExpressionVisitor();
        PrepRuleParser.Test_aggregate_expressionContext test_aggregate_expressionContext = parser.test_aggregate_expression();
        token_nums = prepTestAggregateExpressionVisitor.visit(test_aggregate_expressionContext);
        for(SuggestToken token_num : token_nums) {
            String tokenName = vocabulary.getDisplayName(token_num.getTokenNum());
            String tokenName2 = vocabulary.getLiteralName(token_num.getTokenNum());
            String tokenName3 = vocabulary.getSymbolicName(token_num.getTokenNum());
            token_num.setTokenString(tokenName);
            suggests.add(token_num);
        }

        return suggests;
    }

    @Override
    public List<SuggestToken> suggest_window_rules(String _code) {
        List<SuggestToken> suggests = Lists.newArrayList();

        Map<String,String> extracts = this.extractWindowPartRule(_code);
        String entire = extracts.get("entire");
        String target = extracts.get("extract");
        String code = extracts.get(target);

        SuggestToken token = new SuggestToken();
        token.setStart(-1);
        token.setStop(-1);
        token.setTokenNum(-1);
        token.setTokenSource(entire);
        token.setTokenString(code);
        suggests.add(token);

        CharStream charStream = new ANTLRInputStream(code);
        PrepRuleLexer lexer = new PrepRuleLexer(charStream);
        TokenStream tokens = new CommonTokenStream(lexer);
        PrepRuleParser parser = new PrepRuleParser(tokens);
        Vocabulary vocabulary = parser.getVocabulary();

        List<SuggestToken> token_nums;

        PrepTestWindowExpressionVisitor prepTestWindowExpressionVisitor = new PrepTestWindowExpressionVisitor();
        PrepRuleParser.Test_window_expressionContext test_window_expressionContext = parser.test_window_expression();
        token_nums = prepTestWindowExpressionVisitor.visit(test_window_expressionContext);
        for(SuggestToken token_num : token_nums) {
            String tokenName = vocabulary.getDisplayName(token_num.getTokenNum());
            String tokenName2 = vocabulary.getLiteralName(token_num.getTokenNum());
            String tokenName3 = vocabulary.getSymbolicName(token_num.getTokenNum());
            token_num.setTokenString(tokenName);
            suggests.add(token_num);
        }

        return suggests;
    }

    @Override
    public List<SuggestToken> suggest_all_rules(String _code) {
        List<SuggestToken> suggests = Lists.newArrayList();

        Map<String,String> extracts = this.extractPartRule(_code);
        String entire = extracts.get("entire");
        String target = extracts.get("extract");
        String code = extracts.get(target);
        SuggestToken token = new SuggestToken();
        token.setStart(-1);
        token.setStop(-1);
        token.setTokenNum(-1);
        token.setTokenSource(entire);
        token.setTokenString(code);
        suggests.add(token);

        if(true==target.equals("quote")) {
            SuggestToken _token = new SuggestToken();
            _token.setStart(code.length());
            _token.setStop(code.length());
            _token.setTokenSource("");
            _token.setTokenString("\'");
            suggests.add(_token);
            return suggests;
        }

        if(true==target.equals("bracket")) {
            if(code.startsWith("(")) {
                code = code.substring(1);
            } else if(code.endsWith("(")) {
                code = code.substring(0, code.length() - 1);
            } else {
                int idx = code.lastIndexOf("(");
                if(0<idx) {
                    code = code.substring(0, idx);
                }
            }
        }
        CharStream charStream = new ANTLRInputStream(code);
        PrepRuleLexer lexer = new PrepRuleLexer(charStream);
        TokenStream tokens = new CommonTokenStream(lexer);
        PrepRuleParser parser = new PrepRuleParser(tokens);
        Vocabulary vocabulary = parser.getVocabulary();

        List<SuggestToken> token_nums;
        /*
        PrepSubConditionalExpressionVisitor prepSubConditionalExpressionVisitor = new PrepSubConditionalExpressionVisitor();
        token_nums = prepSubConditionalExpressionVisitor.visit(parser.sub_condition_expression());
        */

        /*
        List<Integer> suggest = Lists.newArrayList();
        RecognitionException re = parser.getContext().exception;
        if(null!=re) {
            IntervalSet intervalSet = re.getExpectedTokens();
            if (null != intervalSet) {
                for (Interval expected : intervalSet.getIntervals()) {
                    for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                        suggest.add(token_num);
                    }
                }
            }
        }
        */
        PrepTestConditionExpressionVisitor prepTestConditionExpressionVisitor = new PrepTestConditionExpressionVisitor();
        PrepRuleParser.Test_condition_expressionContext test_condition_expressionContext = parser.test_condition_expression();
        token_nums = prepTestConditionExpressionVisitor.visit(test_condition_expressionContext);
        for(SuggestToken token_num : token_nums) {
            String tokenName = vocabulary.getDisplayName(token_num.getTokenNum());
            String tokenName2 = vocabulary.getLiteralName(token_num.getTokenNum());
            String tokenName3 = vocabulary.getSymbolicName(token_num.getTokenNum());
            token_num.setTokenString(tokenName);
            suggests.add(token_num);
        }

        if(0==suggests.size() && true==target.equals("bracket")) {
            SuggestToken _token = new SuggestToken();
            _token.setStart(code.length());
            _token.setStop(code.length());
            _token.setTokenSource("");
            _token.setTokenString(")");
            suggests.add(_token);
        }

        return suggests;
    }

    /*
    private static class PrepFunctionNameVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitFunction_name(PrepRuleParser.Function_nameContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }

            return suggest;
        }
    }
    */
    private static class PrepExpressionValueVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitExpression_value(PrepRuleParser.Expression_valueContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }

            /*
            if(null!=ctx.expression_value()) {
                PrepExpressionValueVisitor prepExpressionValueVisitor = new PrepExpressionValueVisitor();
                List<Integer> suggest_sub = ctx.expression_value()
                        .stream()
                        .map(arg -> arg.accept(prepExpressionValueVisitor))
                        .flatMap(Collection::stream)
                        .collect(Collectors.toList());
                if(0<suggest_sub.size()) {
                    suggest.addAll(suggest_sub);
                }
            }
            */
            PrepRuleParser.Function_formContext function_formContext = ctx.function_form();
            if(null!=function_formContext) {
                PrepFunctionFormVisitor functionFormVisitor = new PrepFunctionFormVisitor();
                suggest.addAll( function_formContext.accept(functionFormVisitor) );
            }
            PrepRuleParser.Column_nameContext column_nameContext = ctx.column_name();
            if(null!=column_nameContext) {
                PrepColumnNameVisitor columnNameVisitor = new PrepColumnNameVisitor();
                suggest.addAll( column_nameContext.accept(columnNameVisitor) );
            }

            return suggest;
        }
    }
    private static class PrepFunctionFormVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitFunction_form(PrepRuleParser.Function_formContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }

            if(null!=ctx.expression_value()) {
                PrepExpressionValueVisitor prepExpressionValueVisitor = new PrepExpressionValueVisitor();
                List<Integer> suggest_sub = ctx.expression_value()
                        .stream()
                        .map(arg -> arg.accept(prepExpressionValueVisitor))
                        .flatMap(Collection::stream)
                        .collect(Collectors.toList());
                if(0<suggest_sub.size()) {
                    suggest.addAll(suggest_sub);
                }
            }
            /*
            PrepRuleParser.Function_nameContext function_nameContext = ctx.function_name();
            if(null!=function_nameContext) {
                PrepFunctionNameVisitor functionNameVisitor = new PrepFunctionNameVisitor();
                suggest = function_nameContext.accept(functionNameVisitor);
            }
            */

            return suggest;
        }
    }
    private static class PrepColumnNameVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitColumn_name(PrepRuleParser.Column_nameContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            TerminalNode identifier = ctx.IDENTIFIER();
            if(0<=identifier.getSourceInterval().a) {
                String value = ctx.getText();
            } else {
                int tokenIdx = identifier.getSymbol().getType();
                suggest.add(tokenIdx);
            }
            int childCount = ctx.getChildCount();
            for(int i=0;i<childCount;i++) {
                ParseTree child = ctx.getChild(i);
                String childText = child.getText();
                System.out.println(childText);
            }

            return suggest;
        }
    }
    private static class PrepExpressionConditionArgumentVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitExpression_condition_argument(PrepRuleParser.Expression_condition_argumentContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }

            /*
            PrepRuleParser.Function_formContext function_formContext = ctx.function_form();
            if(null!=function_formContext) {
                PrepFunctionFormVisitor functionFormVisitor = new PrepFunctionFormVisitor();
                suggest = function_formContext.accept(functionFormVisitor);
            }
            PrepRuleParser.Column_nameContext column_nameContext = ctx.column_name();
            if(null!=column_nameContext) {
                PrepColumnNameVisitor columnNameVisitor = new PrepColumnNameVisitor();
                suggest = column_nameContext.accept(columnNameVisitor);
            }
            */

            return suggest;
        }
    }
    private static class PrepExpressionConditionVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitExpression_condition(PrepRuleParser.Expression_conditionContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }

            if(null!=ctx.expression_condition()) {
                PrepExpressionConditionVisitor prepExpressionConditionVisitor = new PrepExpressionConditionVisitor();
                List<Integer> suggest_sub = ctx.expression_condition()
                        .stream()
                        .map(arg -> arg.accept(prepExpressionConditionVisitor))
                        .flatMap(Collection::stream)
                        .collect(Collectors.toList());
                if(0<suggest_sub.size()) {
                    suggest.addAll(suggest_sub);
                }
            }
            if(null!=ctx.expression_condition_argument()) {
                PrepExpressionConditionArgumentVisitor prepExpressionConditionArgumentVisitor = new PrepExpressionConditionArgumentVisitor();
                List<Integer> suggest_sub = ctx.expression_condition_argument()
                        .stream()
                        .map(arg -> arg.accept(prepExpressionConditionArgumentVisitor))
                        .flatMap(Collection::stream)
                        .collect(Collectors.toList());
                if(0<suggest_sub.size()) {
                    suggest.addAll(suggest_sub);
                }
            }

            return suggest;
        }
    }
    private static class PrepExpressionRowConditionVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitExpression_row_condition(PrepRuleParser.Expression_row_conditionContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }

            PrepRuleParser.Sub_condition_expressionContext sub_condition_expressionContext = ctx.sub_condition_expression();
            if(null!=sub_condition_expressionContext) {
                PrepSubConditionalExpressionVisitor prepSubConditionalExpressionVisitor = new PrepSubConditionalExpressionVisitor();
                suggest.addAll( sub_condition_expressionContext.accept(prepSubConditionalExpressionVisitor) );
            }
            /*
            PrepRuleParser.Expression_conditionContext expression_conditionContext = ctx.expression_condition();
            if(null!=expression_conditionContext) {
                PrepExpressionConditionVisitor expressionConditionVisitor = new PrepExpressionConditionVisitor();
                suggest.addAll( expression_conditionContext.accept(expressionConditionVisitor) );
            }
            */
            /*
            TerminalNode identifier = ctx.IDENTIFIER();
            if(0<=identifier.getSourceInterval().a) {
                String value = ctx.getText();
            } else {
                int tokenIdx = identifier.getSymbol().getType();
                suggest.add(tokenIdx);
            }
            int childCount = ctx.getChildCount();
            for(int i=0;i<childCount;i++) {
                ParseTree child = ctx.getChild(i);
                String childText = child.getText();
                System.out.println(childText);
            }
            */

            return suggest;
        }
    }
    private static class PrepParameterRowVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitParameter_row(PrepRuleParser.Parameter_rowContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            PrepRuleParser.Expression_row_conditionContext expression_row_conditionContext = ctx.expression_row_condition();
            if(null!=expression_row_conditionContext) {
                PrepExpressionRowConditionVisitor expressionRowConditionVisitor = new PrepExpressionRowConditionVisitor();
                suggest.addAll( expression_row_conditionContext.accept(expressionRowConditionVisitor) );
            }

            return suggest;
        }
    }
    private static class PrepParameterRownumVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitParameter_rownum(PrepRuleParser.Parameter_rownumContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            String value = ctx.getText();

            return suggest;
        }
    }
    private static class PrepArgRownumVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitArg_rownum(PrepRuleParser.Arg_rownumContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            String keywd = null==ctx.ARG_ROWNUM_KEYWD()?null:ctx.ARG_ROWNUM_KEYWD().getText();
            String splitter = null==ctx.ARG_SPLITTER()?null:ctx.ARG_SPLITTER().getText();
            PrepRuleParser.Parameter_rownumContext parameter_rownumContext = ctx.parameter_rownum();
            if(null!=parameter_rownumContext) {
                PrepParameterRownumVisitor parameterRownumVisitor = new PrepParameterRownumVisitor();
                suggest.addAll( parameter_rownumContext.accept(parameterRownumVisitor) );
            }

            return suggest;
        }
    }
    private static class PrepArgRowVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitArg_row(PrepRuleParser.Arg_rowContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            String keywd = null==ctx.ARG_ROW_KEYWD()?null:ctx.ARG_ROW_KEYWD().getText();
            String splitter = null==ctx.ARG_SPLITTER()?null:ctx.ARG_SPLITTER().getText();
            PrepRuleParser.Parameter_rowContext parameter_rowContext = ctx.parameter_row();
            if(null!=parameter_rowContext) {
                PrepParameterRowVisitor parameterRowVisitor = new PrepParameterRowVisitor();
                suggest.addAll( parameter_rowContext.accept(parameterRowVisitor) );
            }

            return suggest;
        }
    }

    private static class PrepRuleHeaderVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitRule_header(PrepRuleParser.Rule_headerContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            String keywd = ctx.RULE_HEADER_KEYWD().getText();
            PrepRuleParser.Arg_rownumContext arg_rownumContext = ctx.arg_rownum();
            if( null!= arg_rownumContext ) {
                PrepArgRownumVisitor argRownumVisitor = new PrepArgRownumVisitor();
                suggest.addAll( arg_rownumContext.accept(argRownumVisitor) );
            }

            return suggest;
        }
    }
    private static class PrepRuleKeepVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitRule_keep(PrepRuleParser.Rule_keepContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            String keywd = ctx.RULE_KEEP_KEYWD().getText();
            PrepRuleParser.Arg_rowContext arg_rowContext = ctx.arg_row();
            if( null!=arg_rowContext ) {
                PrepArgRowVisitor argRowVisitor = new PrepArgRowVisitor();
                suggest.addAll( arg_rowContext.accept(argRowVisitor) );
            }

            return suggest;
        }
    }

    /*
    private static class PrepRulesetVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitRuleset(PrepRuleParser.RulesetContext ctx) {
            List<Integer> suggests = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggests.add(token_num);
                        }
                    }
                }
            } else {
                if (null != ctx.rule_header()) {
                    PrepRuleHeaderVisitor ruleHeaderVisitor = new PrepRuleHeaderVisitor();
                    List<Integer> suggest = ctx.rule_header().accept(ruleHeaderVisitor);
                    if (0 < suggest.size()) {
                        suggests.addAll(suggest);
                    }
                }
                if (null != ctx.rule_keep()) {
                    PrepRuleKeepVisitor ruleKeepVisitor = new PrepRuleKeepVisitor();
                    List<Integer> suggest = ctx.rule_keep().accept(ruleKeepVisitor);
                    if (0 < suggest.size()) {
                        suggests.addAll(suggest);
                    }
                }
            }

            return suggests;
        }
    }
    */
    /*
    private static class PrepRuleSetVisitor extends PrepRuleBaseVisitor<List<String>> {

        public List<String> visitRuleset(PrepRuleParser.RulesetContext ctx) {
            List<String> suggest = Lists.newArrayList();

            ArgsVisitor argsVisitor = new ArgsVisitor();
            List<String> args = ctx.args()
                    .stream()
                    .map(arg -> arg.accept(argsVisitor))
                    .flatMap(Collection::stream)
                    .collect(Collectors.toList());

            if(0==args.size()) {
              String ruleName = ctx.RULE_NAME().getText();
              suggest.add(ruleName);
            } else {
              suggest.addAll(args);
            }

            return suggest;
        }
    }

    private static class ArgsVisitor extends PrepRuleBaseVisitor<List<String>> {

        public List<String> visitArgs(PrepRuleParser.ArgsContext ctx) {
            List<String> suggest = Lists.newArrayList();

            String argName = ctx.ARG_NAME().getText();
            suggest.add(argName);

            return suggest;
        }
    }
    */

    private static class PrepFunctionName0Visitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitFunction_name_0(PrepRuleParser.Function_name_0Context ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            return suggest;
        }
    }
    private static class PrepFunctionName1Visitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitFunction_name_1(PrepRuleParser.Function_name_1Context ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            return suggest;
        }
    }
    private static class PrepFunctionName2Visitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitFunction_name_2(PrepRuleParser.Function_name_2Context ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            return suggest;
        }
    }
    private static class PrepFunctionName3Visitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitFunction_name_3(PrepRuleParser.Function_name_3Context ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            return suggest;
        }
    }
    private static class PrepFunctionNameNVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitFunction_name_n(PrepRuleParser.Function_name_nContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            return suggest;
        }
    }
    /*
    private static class PrepFunctionNameVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitFunction_name(PrepRuleParser.Function_nameContext ctx) {
            List<Integer> suggest = Lists.newArrayList();

            if(0==suggest.size() && null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            return suggest;
        }
    }
    */

    /*
    private static class PrepFunctionParamVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitFunction_param(PrepRuleParser.Function_paramContext ctx) {
            List<Integer> suggest = Lists.newArrayList();

            if(suggest.size()==0) {
                PrepRuleParser.Sub_value_expressionContext subValueExpressionContext = ctx.sub_value_expression();
                if (null != subValueExpressionContext) {
                    PrepSubValueExpressionArgumentVisitor prepSubValueExpressionArgumentVisitor = new PrepSubValueExpressionArgumentVisitor();
                    suggest.addAll(subValueExpressionContext.accept(prepSubValueExpressionArgumentVisitor));
                }
            }

            if(0==suggest.size() && null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            return suggest;
        }
    }
    */
    private static class PrepFunctionExpressionVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitFunction_expression(PrepRuleParser.Function_expressionContext ctx) {
            List<Integer> suggest = Lists.newArrayList();

            /*
            PrepRuleParser.Function_paramContext function_paramContext = ctx.function_param();
            if (null != function_paramContext) {
                PrepFunctionParamVisitor prepFunctionParamVisitor = new PrepFunctionParamVisitor();
                suggest.addAll(function_paramContext.accept(prepFunctionParamVisitor));
            }
            if(suggest.size()==0) {
                PrepRuleParser.Function_name_0Context functionName0Context = ctx.function_name_0();
                if (null != functionName0Context) {
                    PrepFunctionName0Visitor prepFunctionName0Visitor = new PrepFunctionName0Visitor();
                    suggest.addAll(functionName0Context.accept(prepFunctionName0Visitor));
                }
                PrepRuleParser.Function_name_1Context functionName1Context = ctx.function_name_1();
                if (null != functionName1Context) {
                    PrepFunctionName1Visitor prepFunctionName1Visitor = new PrepFunctionName1Visitor();
                    suggest.addAll(functionName1Context.accept(prepFunctionName1Visitor));
                }
                PrepRuleParser.Function_name_2Context functionName2Context = ctx.function_name_2();
                if (null != functionName2Context) {
                    PrepFunctionName2Visitor prepFunctionName2Visitor = new PrepFunctionName2Visitor();
                    suggest.addAll(functionName2Context.accept(prepFunctionName2Visitor));
                }
                PrepRuleParser.Function_name_3Context functionName3Context = ctx.function_name_3();
                if (null != functionName0Context) {
                    PrepFunctionName3Visitor prepFunctionName3Visitor = new PrepFunctionName3Visitor();
                    suggest.addAll(functionName3Context.accept(prepFunctionName3Visitor));
                }
                PrepRuleParser.Function_name_nContext functionNameNContext = ctx.function_name_n();
                if (null != functionNameNContext) {
                    PrepFunctionNameNVisitor prepFunctionNameNVisitor = new PrepFunctionNameNVisitor();
                    suggest.addAll(functionNameNContext.accept(prepFunctionNameNVisitor));
                }
            }

            List<PrepRuleParser.Sub_value_expressionContext> lists = ctx.sub_value_expression();
            if (null != lists) {
                PrepSubValueExpressionArgumentVisitor prepSubValueExpressionArgumentVisitor = new PrepSubValueExpressionArgumentVisitor();
                for (int i=0;i<lists.size();i++) {
                    if(suggest.size()==0) {
                        PrepRuleParser.Sub_value_expressionContext sub_value_expressionContext = lists.get(i);
                        if(null!=sub_value_expressionContext) {
                            List<Integer> suggest_sub = sub_value_expressionContext.accept(prepSubValueExpressionArgumentVisitor);
                            suggest.addAll(suggest_sub);
                        }
                    }
                }
            }

            if(0==suggest.size() && null!=ctx.exception) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }

            PrepRuleParser.Function_name_0Context functionName0Context = ctx.function_name_0();
            if( null!=functionName0Context ) {
                PrepFunctionName0Visitor prepFunctionName0Visitor = new PrepFunctionName0Visitor();
                suggest.addAll( functionName0Context.accept(prepFunctionName0Visitor) );
            }
            PrepRuleParser.Function_name_1Context functionName1Context = ctx.function_name_1();
            if( null!=functionName1Context ) {
                PrepFunctionName1Visitor prepFunctionName1Visitor = new PrepFunctionName1Visitor();
                suggest.addAll( functionName1Context.accept(prepFunctionName1Visitor) );
            }
            PrepRuleParser.Function_name_2Context functionName2Context = ctx.function_name_2();
            if( null!=functionName2Context ) {
                PrepFunctionName2Visitor prepFunctionName2Visitor = new PrepFunctionName2Visitor();
                suggest.addAll( functionName2Context.accept(prepFunctionName2Visitor) );
            }
            PrepRuleParser.Function_name_3Context functionName3Context = ctx.function_name_3();
            if( null!=functionName3Context ) {
                PrepFunctionName3Visitor prepFunctionName3Visitor = new PrepFunctionName3Visitor();
                suggest.addAll( functionName3Context.accept(prepFunctionName3Visitor) );
            }
            PrepRuleParser.Function_name_nContext functionNameNContext = ctx.function_name_n();
            if( null!=functionNameNContext ) {
                PrepFunctionNameNVisitor prepFunctionNameNVisitor = new PrepFunctionNameNVisitor();
                suggest.addAll( functionNameNContext.accept(prepFunctionNameNVisitor) );
            }
            if(null!=ctx.sub_value_expression()) {
                PrepSubValueExpressionArgumentVisitor prepSubValueExpressionArgumentVisitor = new PrepSubValueExpressionArgumentVisitor();
                List<Integer> suggest_sub = ctx.sub_value_expression()
                        .stream()
                        .map(arg -> arg.accept(prepSubValueExpressionArgumentVisitor))
                        .flatMap(Collection::stream)
                        .collect(Collectors.toList());
                if(0<suggest_sub.size()) {
                    suggest.addAll(suggest_sub);
                }
            }
            */
            if(0==suggest.size() && null!=ctx.exception && false==(ctx.exception instanceof NoViableAltException)) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            return suggest;
        }
    }

    private static class PrepSubValueExpressionArgumentVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitSub_value_expression(PrepRuleParser.Sub_value_expressionContext ctx) {
            List<Integer> suggest = Lists.newArrayList();

            if(suggest.size()==0) {
                PrepRuleParser.Function_expressionContext functionExpressionContext = ctx.function_expression();
                if (null != functionExpressionContext) {
                    PrepFunctionExpressionVisitor prepFunctionExpressionVisitor = new PrepFunctionExpressionVisitor();
                    suggest.addAll(functionExpressionContext.accept(prepFunctionExpressionVisitor));
                }
            }
            if(0==suggest.size() && null!=ctx.exception && false==(ctx.exception instanceof NoViableAltException)) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            return suggest;
        }
    }

    private static class PrepSubConditionalExpressionArgumentVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitSub_condition_expression_argument(PrepRuleParser.Sub_condition_expression_argumentContext ctx) {
            List<Integer> suggest = Lists.newArrayList();
            if(suggest.size()==0) {
                PrepRuleParser.Sub_value_expressionContext subValueExpressionContext = ctx.sub_value_expression();
                if (null != subValueExpressionContext) {
                    PrepSubValueExpressionArgumentVisitor prepSubValueExpressionArgumentVisitor = new PrepSubValueExpressionArgumentVisitor();
                    suggest.addAll(subValueExpressionContext.accept(prepSubValueExpressionArgumentVisitor));
                }
            }
            if(0==suggest.size() && null!=ctx.exception && false==(ctx.exception instanceof NoViableAltException)) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            return suggest;
        }
    }

    private static class PrepSubConditionalCompleteExpressionVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitSub_condition_complete_expression(PrepRuleParser.Sub_condition_complete_expressionContext ctx) {
            List<Integer> suggest = Lists.newArrayList();

            List<PrepRuleParser.Sub_condition_expression_argumentContext> lists = ctx.sub_condition_expression_argument();
            if (null != lists) {
                PrepSubConditionalExpressionArgumentVisitor prepSubConditionalExpressionArgumentVisitor = new PrepSubConditionalExpressionArgumentVisitor();
                for (int i=0;i<lists.size();i++) {
                    if(suggest.size()==0) {
                        PrepRuleParser.Sub_condition_expression_argumentContext sub_condition_expression_argumentContext = lists.get(i);
                        if(null!=sub_condition_expression_argumentContext) {
                            List<Integer> suggest_sub = sub_condition_expression_argumentContext.accept(prepSubConditionalExpressionArgumentVisitor);
                            suggest.addAll(suggest_sub);
                        }
                    }
                }
            }
            if(0==suggest.size() && null!=ctx.exception && false==(ctx.exception instanceof NoViableAltException)) {
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if(null!=intervalSet) {
                    for(Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            suggest.add(token_num);
                        }
                    }
                }
            }
            return suggest;
        }
    }

    private static class PrepSubConditionalExpressionVisitor extends PrepRuleBaseVisitor<List<Integer>> {
        public List<Integer> visitSub_condition_expression(PrepRuleParser.Sub_condition_expressionContext ctx) {
            List<Integer> suggest = Lists.newArrayList();

            List<PrepRuleParser.Sub_condition_complete_expressionContext> lists = ctx.sub_condition_complete_expression();
            if (null != lists) {
                PrepSubConditionalCompleteExpressionVisitor prepSubConditionalCompleteExpressionVisitor = new PrepSubConditionalCompleteExpressionVisitor();
                for (int i=0;i<lists.size();i++) {
                    if(suggest.size()==0) {
                        PrepRuleParser.Sub_condition_complete_expressionContext sub_condition_complete_expressionContext = lists.get(i);
                        if(null!=sub_condition_complete_expressionContext) {
                            List<Integer> suggest_sub = sub_condition_complete_expressionContext.accept(prepSubConditionalCompleteExpressionVisitor);
                            suggest.addAll(suggest_sub);
                        }
                    }
                }
            }
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                if(ctx.exception instanceof NoViableAltException) {
                } else {
                    IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                    if (null != intervalSet) {
                        for (Interval expected : intervalSet.getIntervals()) {
                            for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                                suggest.add(token_num);
                            }
                        }
                    }
                }
            }
            return suggest;
        }
    }

    private static class PrepTestLeftValueVisitor extends PrepRuleBaseVisitor<List<SuggestToken>> {
        public List<SuggestToken> visitTest_left_value(PrepRuleParser.Test_left_valueContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();

            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }
    }
    private static class PrepTestRightValueVisitor extends PrepRuleBaseVisitor<List<SuggestToken>> {
        public List<SuggestToken> visitTest_right_value(PrepRuleParser.Test_right_valueContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();

            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }
    }
    /*
    private static class PrepTestValueVisitor extends PrepRuleBaseVisitor<List<SuggestToken>> {
        public List<SuggestToken> visitTest_value(PrepRuleParser.Test_valueContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();

            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }
    }
    */
    private static class PrepTestConditionExpressionVisitor extends PrepRuleBaseVisitor<List<SuggestToken>> {
        public List<SuggestToken> visitTest_condition_expression(PrepRuleParser.Test_condition_expressionContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();

            /*
            List<PrepRuleParser.Test_valueContext> lists = ctx.test_value();
            if (null != lists) {
                PrepTestValueVisitor prepTestValueVisitor = new PrepTestValueVisitor();
                for (int i=0;i<lists.size();i++) {
                    if(suggest.size()==0) {
                        PrepRuleParser.Test_valueContext test_valueContext = lists.get(i);
                        if(null!=test_valueContext) {
                            List<SuggestToken> suggest_sub = test_valueContext.accept(prepTestValueVisitor);
                            suggest.addAll(suggest_sub);
                        }
                    }
                }
            }
            */

            if(suggest.size()==0) {
                PrepRuleParser.Test_left_valueContext test_left_valueContext = ctx.test_left_value();
                if (null != test_left_valueContext) {
                    PrepTestLeftValueVisitor prepTestLeftValueVisitor = new PrepTestLeftValueVisitor();
                    suggest.addAll(test_left_valueContext.accept(prepTestLeftValueVisitor));
                }
            }
            if(suggest.size()==0) {
                PrepRuleParser.Test_right_valueContext test_right_valueContext = ctx.test_right_value();
                if (null != test_right_valueContext) {
                    PrepTestRightValueVisitor prepTestRightValueVisitor = new PrepTestRightValueVisitor();
                    suggest.addAll(test_right_valueContext.accept(prepTestRightValueVisitor));
                }
            }
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }
    }
    private static class PrepTestWindowExpressionVisitor extends PrepRuleBaseVisitor<List<SuggestToken>> {
        public List<SuggestToken> visitTest_window_expression(PrepRuleParser.Test_window_expressionContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();

            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }

            if(0==suggest.size()) {
                int childCount = ctx.getChildCount();
                for (int i = 0; i < childCount; i++) {
                    ParseTree child = ctx.getChild(i);
                    if (suggest.size() == 0) {
                        if (child instanceof ErrorNodeImpl) {
                            ErrorNodeImpl eni = (ErrorNodeImpl) child;
                            CommonToken offendingToken = (CommonToken) eni.getSymbol();
                            int offendingStart = offendingToken.getCharPositionInLine();
                            int offendingStop = -1;
                            String offendingSource = "";

                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart + 1);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(offendingToken.getType());
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }

            return suggest;
        }
    }
    private static class PrepTestAggregateExpressionVisitor extends PrepRuleBaseVisitor<List<SuggestToken>> {
        public List<SuggestToken> visitTest_aggregate_expression(PrepRuleParser.Test_aggregate_expressionContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();

            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }

            if(0==suggest.size()) {
                int childCount = ctx.getChildCount();
                for (int i = 0; i < childCount; i++) {
                    ParseTree child = ctx.getChild(i);
                    if (suggest.size() == 0) {
                        if (child instanceof ErrorNodeImpl) {
                            ErrorNodeImpl eni = (ErrorNodeImpl) child;
                            CommonToken offendingToken = (CommonToken) eni.getSymbol();
                            int offendingStart = offendingToken.getCharPositionInLine();
                            int offendingStop = -1;
                            String offendingSource = "";

                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart + 1);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(offendingToken.getType());
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }

            return suggest;
        }
    }










    private static class PrepRulesetVisitor extends PrepRuleBaseVisitor<List<SuggestToken>> {

        public List<SuggestToken> visitRuleset(PrepRuleParser.RulesetContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();

            TerminalNode rulename = ctx.RULE_NAME();
            List<PrepRuleParser.ArgsContext> argsContexts = ctx.args();
            ArgsVisitor argsVisitor = new ArgsVisitor();
            List<List<SuggestToken>> args = ctx.args()
                    .stream()
                    .map(arg -> arg.accept(argsVisitor))
                    .collect(Collectors.toList());

            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

    }

    private static class ArgsVisitor extends PrepRuleBaseVisitor<List<SuggestToken>> {

        public List<SuggestToken> visitArgs(PrepRuleParser.ArgsContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();

            String argName = ctx.ARG_NAME().getText();

            ExpressionVisitor expressionVisitor = new ExpressionVisitor();

            List<SuggestToken> expr = ctx.expr().accept(expressionVisitor);

            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }
    }

    private static class ExpressionVisitor extends PrepRuleBaseVisitor<List<SuggestToken>> {

        @Override
        public List<SuggestToken> visitIdentifierExpr(PrepRuleParser.IdentifierExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken>  visitNullExpr(PrepRuleParser.NullExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken>  visitStringExpr(PrepRuleParser.StringExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitRegularExpr(PrepRuleParser.RegularExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitDoubleExpr(PrepRuleParser.DoubleExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitLongExpr(PrepRuleParser.LongExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitBooleanExpr(PrepRuleParser.BooleanExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitIdentifierArrayExpr(PrepRuleParser.IdentifierArrayExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitDoubleArrayExpr(PrepRuleParser.DoubleArrayExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitLongArrayExpr(PrepRuleParser.LongArrayExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitStringArrayExpr(PrepRuleParser.StringArrayExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitFn(PrepRuleParser.FnContext ctx) {
            FunctionArgsVisitor functionArgsVisitor = new FunctionArgsVisitor();
            if(ctx.fnArgs() != null) {
                List<SuggestToken> exprs = ctx.fnArgs().accept(functionArgsVisitor);
            }

            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitFunctionExpr(PrepRuleParser.FunctionExprContext ctx) {
            List<SuggestToken> fn = visitFn(ctx.fn());

            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitFunctionArrayExpr(PrepRuleParser.FunctionArrayExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitLogicalOpExpr(PrepRuleParser.LogicalOpExprContext ctx) {

            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitAddSubExpr(PrepRuleParser.AddSubExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitLogicalAndOrExpr(PrepRuleParser.LogicalAndOrExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitNestedExpr(PrepRuleParser.NestedExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitUnaryOpExpr(PrepRuleParser.UnaryOpExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitLogicalAndOrExpr2(PrepRuleParser.LogicalAndOrExpr2Context ctx) {

            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitMulDivModuloExpr(PrepRuleParser.MulDivModuloExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitPowOpExpr(PrepRuleParser.PowOpExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

        @Override
        public List<SuggestToken> visitAssignExpr(PrepRuleParser.AssignExprContext ctx) {
            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

    }

    private static class FunctionArgsVisitor extends PrepRuleBaseVisitor<List<SuggestToken>> {

        @Override
        public List<SuggestToken> visitFunctionArgs(PrepRuleParser.FunctionArgsContext ctx) {
            ExpressionVisitor visitor = new ExpressionVisitor();
            List<List<SuggestToken>> args = ctx.expr()
                    .stream()
                    .map(arg -> arg.accept(visitor))
                    .collect(Collectors.toList());

            List<SuggestToken> suggest = Lists.newArrayList();
            if(0==suggest.size() && null!=ctx.exception) {// && false==(ctx.exception instanceof NoViableAltException)) {
                Token offendingToken = ctx.exception.getOffendingToken();
                String offendingSource = offendingToken.getText();
                int offendingStart = offendingToken.getStartIndex();
                int offendingStop = offendingToken.getStopIndex();
                IntervalSet intervalSet = ctx.exception.getExpectedTokens();
                if (null != intervalSet) {
                    for (Interval expected : intervalSet.getIntervals()) {
                        for (int token_num = expected.a; token_num <= expected.b; token_num++) {
                            SuggestToken suggestToken = new SuggestToken();
                            suggestToken.setStart(offendingStart);
                            suggestToken.setStop(offendingStop);
                            suggestToken.setTokenNum(token_num);
                            suggestToken.setTokenSource(offendingSource);
                            suggest.add(suggestToken);
                        }
                    }
                }
            }
            return suggest;
        }

    }


}
