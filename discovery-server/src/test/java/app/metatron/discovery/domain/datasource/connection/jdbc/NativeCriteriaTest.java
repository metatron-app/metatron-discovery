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

package app.metatron.discovery.domain.datasource.connection.jdbc;

import com.google.common.collect.Lists;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.ISODateTimeFormat;
import org.junit.Test;

import java.util.HashMap;
import java.util.Map;

import app.metatron.discovery.domain.dataconnection.query.NativeCriteria;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeBetweenExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeConjunctionExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeDisjunctionExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeEqExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeJoin;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeLikeExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeOrderExp;
import app.metatron.discovery.domain.dataconnection.query.expression.NativeProjection;

public class NativeCriteriaTest {
  @Test
  public void selectAllTest(){
    String implementor = "HIVE";

    NativeCriteria nativeCriteria = new NativeCriteria(implementor);
    nativeCriteria
            .addTable("default.sample", "sample")
            .addTable("default.sales", "sales")
    ;

    System.out.println(nativeCriteria.toSQL());
  }

  @Test
  public void selectTest(){
    String implementor = "HIVE";

    Map<String, String> columnMap = new HashMap<>();
    columnMap.put("col5", "col5_alias");
    columnMap.put("col6", "col6_alias");

    NativeProjection nativeProjection = new NativeProjection();
    nativeProjection
            .addProjection("just_colname")
            .addProjection("col1", "col2")
            .addProjection(Lists.newArrayList("col3", "col4"))
            .addProjection(columnMap)
            .addProjectionWithAliases("col7 as alias7", "col8 as alias8")
            .addProjection("sales.col1", "sales_col1")
            .addProjection("sample.col1", "sample_col1");

    NativeCriteria nativeCriteria = new NativeCriteria(implementor);
    nativeCriteria
            .setProjection(nativeProjection)
            .addTable("default.sample", "sample")
            .addTable("default.sales", "sales")
    ;

    System.out.println(nativeCriteria.toSQL());
  }

  @Test
  public void selectDistinctTest(){
    String implementor = "HIVE";

    NativeProjection nativeProjection = new NativeProjection();
    nativeProjection.addProjection("sales.col1", "sales_col1")
            .addProjection("sample.col1", "sample_col1");

    NativeCriteria nativeCriteria = new NativeCriteria(implementor);
    nativeCriteria
            .setDistinct(true)
            .setProjection(nativeProjection)
            .addTable("default.sample", "sample")
            .addTable("default.sales", "sales")
    ;

    System.out.println(nativeCriteria.toSQL());
  }

  @Test
  public void selectFromSubqueryTest(){
    String implementor = "HIVE";

    NativeCriteria subNativeCriteria = new NativeCriteria(implementor);
    subNativeCriteria
            .add(new NativeEqExp("sample", "23"))
            .addOr(new NativeLikeExp("sample", "45"))
            .addTable("default.sample", "sub_table1")
            .addTable("default.sales", "sub_table2")
    ;

    NativeCriteria nativeCriteria = new NativeCriteria(implementor);
    nativeCriteria
            .addTable("default.sample", "table1")
            .addSubQuery(subNativeCriteria, "table2")
            .addSubQuery("select * from sample")
    ;

    System.out.println(nativeCriteria.toSQL());
  }

  @Test
  public void selectWhereTest(){
    String implementor = "HIVE";

    NativeCriteria nativeCriteria = new NativeCriteria(implementor);
    nativeCriteria
            .add((new NativeDisjunctionExp())
                .add(new NativeEqExp("sample", "1"))
                .add(new NativeEqExp("sample", "2"))
            )
            .add((new NativeConjunctionExp())
                .add(new NativeBetweenExp("orderDate", 1, 2))
                .add(new NativeBetweenExp("orderDate", 4, 7))
            )
            .addTable("default.sales", "sales")
    ;

    System.out.println(nativeCriteria.toSQL());
  }

  @Test
  public void selectSimpleInnerJoinTest(){
    String implementor = "HIVE";

    NativeCriteria nativeCriteria = new NativeCriteria(implementor);
    nativeCriteria
            .addTable("default.sample", "table1")
            .addJoin(new NativeJoin("default.sales", "table2", NativeJoin.JoinType.INNER, "table1.col1", "table2.col1"))
    ;

    System.out.println(nativeCriteria.toSQL());
  }

  @Test
  public void selectJoinWithSubQueryTest(){
    String implementor = "HIVE";

    NativeCriteria subNativeCriteria = new NativeCriteria(implementor);
    subNativeCriteria
            .add(new NativeEqExp("sample", "23"))
            .addOr(new NativeLikeExp("sample", "45"))
            .addTable("default.sample", "sample")
            .addTable("default.sales", "sales")
    ;

    NativeCriteria nativeCriteria = (new NativeCriteria(implementor))
            .addTable("default.sample", "table1")
            .addJoin(new NativeJoin(subNativeCriteria, "table2", NativeJoin.JoinType.INNER, "table1.order1", "table2.order2"))
    ;

    System.out.println(nativeCriteria.toSQL());
  }

  @Test
  public void selectGroupByTest(){
    String implementor = "HIVE";

    NativeProjection nativeProjection = new NativeProjection();
    nativeProjection
            .addProjection("city", "city")
            .addGroupProjection("city")
    ;

    NativeCriteria nativeCriteria = (new NativeCriteria(implementor))
            .setProjection(nativeProjection)
            .addTable("default.sample", "table1")
            ;

    System.out.println(nativeCriteria.toSQL());
  }

  @Test
  public void selectAggregateGroupByTest(){
    String implementor = "HIVE";

    NativeProjection nativeProjection = new NativeProjection();
    nativeProjection
            .addProjection("city", "city")
            .addAggregateProjection("city", "count", NativeProjection.AggregateProjection.COUNT)
            .addAggregateProjection("city", "min", NativeProjection.AggregateProjection.MIN)
            .addAggregateProjection("city", "max", NativeProjection.AggregateProjection.MAX)
            .addGroupProjection("city")
    ;

    NativeCriteria nativeCriteria = (new NativeCriteria(implementor))
            .setProjection(nativeProjection)
            .addTable("default.sample", "table1")
            ;

    System.out.println(nativeCriteria.toSQL());
  }

  @Test
  public void selectLimitTest(){
    String implementor = "ORACLE";

    NativeProjection nativeProjection = new NativeProjection();
    nativeProjection
            .addProjection("col1", "col1")
            .addProjection("col2", "col2")
            .addProjection("col3", "col3");

    NativeCriteria nativeCriteria = new NativeCriteria(implementor);
    nativeCriteria
            .setLimit(7)
            .setOffset(2)
            .setProjection(nativeProjection)
            .addTable("sales", "sales")
    ;

    System.out.println(nativeCriteria.toSQL());


  }

  @Test
  public void selectOrderbyTest(){
    String implementor = "ORACLE";

    NativeProjection nativeProjection = new NativeProjection();
    nativeProjection
            .addProjection("col1", "col1")
            .addProjection("col2", "col2")
            .addProjection("col3", "col3");

    NativeCriteria nativeCriteria = new NativeCriteria(implementor);
    nativeCriteria
            .setProjection(nativeProjection)
            .addTable("sales", "sales")
            .setOrder((new NativeOrderExp()).add("col1", NativeOrderExp.OrderType.DESC))
    ;

    System.out.println(nativeCriteria.toSQL());
  }

  @Test
  public void selectWhereBetweenTest(){
    String implementor = "HIVE";

    DateTime dateTime = DateTime.parse(
            DateTime.now(DateTimeZone.forID("UTC")).toString(ISODateTimeFormat.dateHourMinuteSecond()),
            ISODateTimeFormat.dateHourMinuteSecond());

    NativeCriteria nativeCriteria = new NativeCriteria(implementor);
    nativeCriteria
            .add((new NativeConjunctionExp())
                    .add(new NativeBetweenExp("OrderDate", dateTime, dateTime))
                    .add(new NativeBetweenExp("Profit", 0.11, 0.22))
                    .add(new NativeBetweenExp("Sales", 1L, 10L))
            )
            .addTable("default.sales", "sales")
    ;

    System.out.println(nativeCriteria.toSQL());
  }
}
