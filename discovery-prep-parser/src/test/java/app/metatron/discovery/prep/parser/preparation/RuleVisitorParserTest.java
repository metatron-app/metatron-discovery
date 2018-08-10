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

import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import app.metatron.discovery.prep.parser.preparation.rule.expr.Expr;
import app.metatron.discovery.prep.parser.preparation.rule.expr.ExprEval;
import app.metatron.discovery.prep.parser.preparation.rule.Set;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class RuleVisitorParserTest {
  @Test
  public void dropTest() {
    String ruleCode = "drop col: test1~test2, test5";
    assertEquals("Drop{col=[test1~test2, test5]}", runAndPrint(ruleCode));
  }

  @Test
  public void headerTest() {
    String ruleCode = "header rownum: 1";
    assertEquals("Header{rownum=1}", runAndPrint(ruleCode));
  }

  @Test
  public void renameTest1() {
    String ruleCode = "rename col: test to: 'abc'";
    assertEquals("Rename{col=test, to='abc'}", runAndPrint(ruleCode));
  }

  @Test
  public void renameTest2() {
    String ruleCode = "rename col: col1, col2 to: 'abc', 'def'";
    assertEquals("Rename{col=[col1, col2], to=['abc', 'def']}", runAndPrint(ruleCode));

    String aa = "";
    String bb = "hello my friend";

    bb.replaceFirst(aa, "0");

    System.out.println(bb);
  }

  @Test
  public void keepTest1() {
    String ruleCode = "keep row: isnull(Category)";
    assertEquals("Keep{row=isnull(Category)}", runAndPrint(ruleCode));
  }

  @Test
  public void keepTest2() {
    String ruleCode = "keep row: (column4-1) > 4";
    assertEquals("Keep{row=((column4 - 1) > 4)}", runAndPrint(ruleCode));
  }

  @Test
  public void setTest2() {
    String ruleCode = "set col: name value: if(item, 1, 2) row: name == 'a'";
    assertEquals("Set{col=name, value=if(item,1,2), row=(name == 'a')}", runAndPrint(ruleCode));
  }

  @Test
  public void setTest3() {
    String ruleCode = "set col: name value: if(item * -3, 1, 2)";
    assertEquals("Set{col=name, value=if((item * -3),1,2), row=null}", runAndPrint(ruleCode));
  }

  @Test
  public void setTest4() {
    String ruleCode = "set col: speed value: concat_ws('|', birth_date, itemNo, weight, name)";
    assertEquals("Set{col=speed, value=concat_ws('|',birth_date,itemNo,weight,name), row=null}", runAndPrint(ruleCode));
  }

  @Test
  public void setTest5() {
    String ruleCode = "set col: speed value: concat('|', birth_date, itemNo, weight, name)";
    assertEquals("Set{col=speed, value=concat('|',birth_date,itemNo,weight,name), row=null}", runAndPrint(ruleCode));
  }

  @Test
  public void setTest6() {
    String ruleCode = "set col: speed value: if (col1 == 'a', null, a)";
    assertEquals("Set{col=speed, value=if((col1 == 'a'),null,a), row=null}", runAndPrint(ruleCode));
  }

  @Test
  public void setMultiColTest() {
    String ruleCode = "set col: speed, name value: if (col1 == 'a', null, a)";
    assertEquals("Set{col=[speed, name], value=if((col1 == 'a'),null,a), row=null}", runAndPrint(ruleCode));
  }

  @Test
  public void setTypeTest() {
    String ruleCode = "settype col: Category type: 'Integer'";
    assertEquals("SetType{col=Category, type='Integer', format=null}", runAndPrint(ruleCode));
    ruleCode = "settype col: Wage__€_ type: 'Integer'";
    assertEquals("SetType{col=Wage__€_, type='Integer', format=null}", runAndPrint(ruleCode));
 }

  @Test
  public void deriveTest() {
    String ruleCode = "derive value: substring(name, 1, 2)/10/3 as: 'cate_if'";
    assertEquals("Derive{value=((substring(name,1,2) / 10) / 3), as=''cate_if''}", runAndPrint(ruleCode));
  }

  @Test
  public void replaceTest() {
    String ruleCode = "replace col: Category with: 'abc' on: /\\d{3}/ global: true row: sales > 10";
    assertEquals("Replace{col=Category, on=/\\d{3}/, after=null, before=null, with='abc', global=true, row=(sales > 10)}", runAndPrint(ruleCode));
  }

  @Test
  public void replaceMultiColTest() {
    String ruleCode = "replace col: Category, name with: 'abc' on: /\\d{3}/ global: true row: sales > 10";
    assertEquals("Replace{col=[Category, name], on=/\\d{3}/, after=null, before=null, with='abc', global=true, row=(sales > 10)}", runAndPrint(ruleCode));
  }

  @Test
  public void countPatternTest() {
    String ruleCode = "countpattern col: City on: /H.*/ ignoreCase: true";
    assertEquals("CountPattern{col=City, on=/H.*/, after=null, before=null, ignoreCase=true}", runAndPrint(ruleCode));
  }

  @Test
  public void countPatternMultiColTest() {
    String ruleCode = "countpattern col: City, name on: /H.*/ ignoreCase: true";
    assertEquals("CountPattern{col=[City, name], on=/H.*/, after=null, before=null, ignoreCase=true}", runAndPrint(ruleCode));
  }

  @Test
  public void splitTest() {
    String ruleCode = "split col: column7 on: '-' limit: 2 quote: '\"' ignoreCase: true";
    assertEquals("Split{col='column7', on='-', limit=2, quote=''\"'', ignoreCase=true}", runAndPrint(ruleCode));
  }

  @Test
  public void deleteTest() {
    String ruleCode = "delete row: Sales < 10000";
    assertEquals("Delete{row=(Sales < 10000)}", runAndPrint(ruleCode));
  }

  @Test
  public void pivotTest1() {
    String ruleCode = "pivot col: birth_year value: count() group: region limit: 30";
    assertEquals("Pivot{col=birth_year, value=count(), group=region, limit=30}", runAndPrint(ruleCode));
  }

  @Test
  public void pivotTest2() {
    String ruleCode = "pivot col: column3,column4 value: sum(column22),sum(column23) group: column11,column14 limit: 100";
    assertEquals("Pivot{col=[column3, column4], value=FunctionArrayExpr{functions=[sum(column22), sum(column23)]}, group=[column11, column14], limit=100}", runAndPrint(ruleCode));
  }

  @Test
  public void unpivotTest1() {
    String ruleCode = "unpivot col: column3,column6 groupEvery:2";
    assertEquals("Unpivot{col=[column3, column6], groupEvery=2}", runAndPrint(ruleCode));
  }

  @Test
  public void unpivotTest2() {
    String ruleCode = "unpivot col: column3 groupEvery:1";
    assertEquals("Unpivot{col=column3, groupEvery=1}", runAndPrint(ruleCode));
  }

  @Test
  public void extractTest() {
    String ruleCode = "extract col: column5 on: /e/ limit: 2 quote: '\''";
    assertEquals("Extract{col='column5', on=/e/, limit=2, quote='''', ignoreCase=null}", runAndPrint(ruleCode));
  }

  @Test
  public void flattenTest() {
    String ruleCode = "flatten col: column5";
    assertEquals("Flatten{col='column5'}", runAndPrint(ruleCode));
  }

  @Test
  public void mergeTest() {
    String ruleCode = "merge col: column5,column6~column8 with: ',' as: 'test'";
    assertEquals("Merge{col=[column5, column6~column8], with=',', as=''test''}", runAndPrint(ruleCode));
  }

  @Test
  public void nestTest() {
    String ruleCode = "nest col: ItemA,ItemB into:'map' as:'myMap'";
    assertEquals("Nest{col=[ItemA, ItemB], into=''map'', as=''myMap''}", runAndPrint(ruleCode));
  }

  @Test
  public void joinTest() {
    String ruleCode = "join dataset2: name2 leftSelectCol: ItemA,ItemB,ItemC rightSelectCol: ItemD,ItemE condition: ItemF=ItemG && ItemH=ItemI joinType: 'inner'";
    assertEquals("Join{dataset2=name2, leftSelectCol=[ItemA, ItemB, ItemC], condition=((ItemF = ItemG) && (ItemH = ItemI)), rightSelectCol=[ItemD, ItemE], joinType=''inner''}", runAndPrint(ruleCode));
  }

  @Test
  public void aggregateTest1() {
    String ruleCode = "aggregate value: count(), sum(col1) group: region,city limit: 30";
    assertEquals("Aggregate{value=FunctionArrayExpr{functions=[count(), sum(col1)]}, group=[region, city]}", runAndPrint(ruleCode));
  }

  @Test
  public void aggregateTest2() {
    String ruleCode = "aggregate col: column3,column4 value: sum(column22),sum(column23) group: column11,column14 limit: 100";
    assertEquals("Aggregate{value=FunctionArrayExpr{functions=[sum(column22), sum(column23)]}, group=[column11, column14]}", runAndPrint(ruleCode));
  }

  @Test
  public void unnestTest() {
    String ruleCode = "unnest col: name into: map idx: '1', '2'";
    assertEquals("Unnest{col='name', into=map, idx=['1', '2']}", runAndPrint(ruleCode));
  }

  @Test
  public void splitRowsTest1() {
    String ruleCode = "splitrows col: column1 on: '-' quote: '\"'";
    assertEquals("SplitRows{col='column1', on='-', quote=''\"''}", runAndPrint(ruleCode));
  }

  @Test
  public void splitRowsTest2() {
    String ruleCode = "splitrows col: column1 on: '-' quote: ''";
    assertEquals("SplitRows{col='column1', on='-', quote=''''}", runAndPrint(ruleCode));
  }

  @Test
  public void splitRowsTest3() {
    String ruleCode = "splitrows col: column1 on: '-' quote: '\"-'";
    assertEquals("SplitRows{col='column1', on='-', quote=''\"-''}", runAndPrint(ruleCode));
  }

  @Test
  public void moveTest1() {
    String ruleCode = "move col: column1 after: column2";
    assertEquals("Move{col=column1, after=column2, before=null}", runAndPrint(ruleCode));
  }

  @Test
  public void moveTest2() {
    String ruleCode = "move col: column10 before: column1";
    assertEquals("Move{col=column10, after=null, before=column1}", runAndPrint(ruleCode));
  }

  @Test
  public void moveMultiTest() {
    String ruleCode = "move col: column9, column10 before: column1";
    assertEquals("Move{col=[column9, column10], after=null, before=column1}", runAndPrint(ruleCode));
  }

  @Test
  public void sortTest() {
    String ruleCode = "sort order: column9, column10";
    assertEquals("Sort{order=[column9, column10], type=null}", runAndPrint(ruleCode));
  }

  @Test
  public void unionTest() {
    String ruleCode = "union masterCol: ItemA,ItemB,ItemC, dataset2: df2,df3 slaveCol: ItemD,ItemE,ItemF totalCol: col1, col2, col3";
    assertEquals("Union{dataset2=[df2, df3], masterCol=[ItemA, ItemB, ItemC], slaveCol=[ItemD, ItemE, ItemF], totalCol=[col1, col2, col3]}", runAndPrint(ruleCode));
  }

  @Test
  public void windowTest() {
    String ruleCode = "window value: first(speed), rank() partition: speed order: weigh, speed";
    assertEquals("Window{value=FunctionArrayExpr{functions=[first(speed), rank()]}, order=[weigh, speed], partition=speed, rowsBetween=null}", runAndPrint(ruleCode));
  }

  @Test
  public void functionTest1() {
    String ruleCode = "set col: speed value: timestamp('2011-01-01','yyyy-MM-dd')";
    RuleVisitorParser parser = new RuleVisitorParser();
    Set setRule = (Set) parser.parse(ruleCode);
    ExprEval exprEval = ((Expr)setRule.getValue()).eval(null);

    System.out.println(exprEval.toString());

    assertEquals("2011-01-01T00:00:00.000+09:00", exprEval.asString());
  }

  @Test
  public void functionTest2() {
    String ruleCode = "set col: speed value: time_diff(now(), add_time(now(), 1, 'hour'))";
    RuleVisitorParser parser = new RuleVisitorParser();
    Set setRule = (Set) parser.parse(ruleCode);
    ExprEval exprEval = ((Expr)setRule.getValue()).eval(null);

    System.out.println(exprEval.toString());

    assertEquals("3600", exprEval.asString().substring(0,4));
  }

  @Test
  public void functionTest3() {
    String ruleCode = "set col: speed value: -1.0";
    RuleVisitorParser parser = new RuleVisitorParser();
    Set setRule = (Set) parser.parse(ruleCode);
    ExprEval exprEval = ((Expr)setRule.getValue()).eval(null);

    System.out.println(exprEval.toString());

    //assertEquals("3600", exprEval.asString().substring(0,4));
  }

    @Test
    public void functionTest4() {
        String ruleCode = "set col: speed value: ismissing('')";
        RuleVisitorParser parser = new RuleVisitorParser();
        Set setRule = (Set) parser.parse(ruleCode);
        ExprEval exprEval = ((Expr)setRule.getValue()).eval(null);

        System.out.println(exprEval.toString());

        //assertEquals("3600", exprEval.asString().substring(0,4));
    }

  private String runAndPrint(String ruleCode) {

    Rule rule = new RuleVisitorParser().parse(ruleCode);

    ObjectMapper mapper = new ObjectMapper();
    mapper = mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
    String json = null;
    try {
      json = mapper.writeValueAsString(rule);
    } catch (JsonProcessingException e) {
      e.printStackTrace();
    }
    //System.out.printf("code below: %n '%s' %n has been parsed to object: %n '%s'%n '%s'%n", ruleCode, json, rule.toString());
    return rule.toString();
  }

}