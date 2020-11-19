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

package app.metatron.discovery.query.druid;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.workbook.configurations.datasource.DataSource;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.query.druid.aggregations.GenericMaxAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericMinAggregation;
import app.metatron.discovery.query.druid.virtualcolumns.ExprVirtualColumn;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.junit.Assert;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by kyungtaak on 2016. 7. 13..
 */
public class AbstractQueryBuilderTest {

  @Test
  public void joiner() {
    Map<String, List<String>> partitions = Maps.newLinkedHashMap();
    partitions.put("A", Lists.newArrayList("1", "2"));
    partitions.put("B", Lists.newArrayList("a", "b", "c"));

    TestQueryBuiler builder = new TestQueryBuiler(null);

    System.out.println(builder.targetPartitionPostfixs);
  }

  @Test
  public void testChangeTimeStampFieldName(){
    DataSource dataSource = new DefaultDataSource();
    app.metatron.discovery.domain.datasource.DataSource metaDataSource = new app.metatron.discovery.domain.datasource.DataSource();

    Field field = new Field("orderDate", DataType.TIMESTAMP, Field.FieldRole.TIMESTAMP, 0);
    List<Field> fieldList = new ArrayList<>();
    fieldList.add(field);

    metaDataSource.setFields(fieldList);
    dataSource.setMetaDataSource(metaDataSource);

    List<Aggregation> aggregations = new ArrayList<>();

    aggregations.add(new GenericMinAggregation("aggregationfunc_000", null, "OrderDate", "double"));
    aggregations.add(new GenericMinAggregation("aggregationfunc_000", null, "DIFFTIME('HOUR',NOW(),\\\"OrderDate\\\")", "double"));
    aggregations.add(new GenericMaxAggregation("aggregationfunc_000", null, "OrderDate", "double"));

    TestQueryBuiler builder = new TestQueryBuiler(dataSource);
    builder.changeTimeStampFieldName();

    builder.getAggregations().forEach(aggregation -> {
      if(aggregation instanceof GenericMinAggregation)
        Assert.assertFalse(((GenericMinAggregation) aggregation).getFieldExpression().contains("OrderDate"));
      else if(aggregation instanceof GenericMaxAggregation)
        Assert.assertFalse(((GenericMaxAggregation) aggregation).getFieldExpression().contains("OrderDate"));
    });
  }

  @Test
  public void testRemoveUserDefinedAggregationFunction(){
    final String preFix = UserDefinedField.REF_NAME + UserDefinedField.FIELD_NAMESPACE_SEP;
    DataSource dataSource = new DefaultDataSource();

    Map<String, UserDefinedField> userFieldMap = Maps.newHashMap();

    String expr = "\"user_defined.total income\" / \"user_defined.total profit\" * 100";

    userFieldMap.put(   "total income",      new ExpressionField("total income", " SUMOF(\"Sales\") ", "MEASURE", null, null, true) );
    userFieldMap.put(   "total profit",      new ExpressionField("total profit", " SUMOF(\"Profit\") ", "MEASURE", null, null, true) );
    userFieldMap.put(   "test",      new ExpressionField("total profit", expr, "MEASURE", null, null, true) );
    userFieldMap.put(   "normal",      new ExpressionField("normal", "12", "MEASURE", null, null, false) );

    TestQueryBuiler builder = new TestQueryBuiler(dataSource);
    builder.setUserFieldMap(userFieldMap);
    builder.getVirtualColumns().put(preFix + "test", new ExprVirtualColumn(expr, preFix + "sample"));
    builder.getVirtualColumns().put(preFix + "normal", new ExprVirtualColumn("12", preFix + "normal"));

    builder.removeUserDefinedAggregationFunction();

    Assert.assertEquals(1, builder.getVirtualColumns().size());
  }

  public class TestQueryBuiler extends AbstractQueryBuilder {

    protected TestQueryBuiler(DataSource dataSource) {
      super(dataSource);
    }

    protected List<Aggregation> getAggregations(){
      return this.aggregations;
    }

    protected void setAggregations(List<Aggregation> aggregations){
      this.aggregations = aggregations;
    }

    protected Map<String, VirtualColumn> getVirtualColumns(){return this.virtualColumns;}

    protected void setUserFieldMap(Map<String, UserDefinedField> userFieldMap){this.userFieldsMap = userFieldMap;}

    @Override
    public Query build() {
      return null;
    }
  }
}
