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

package app.metatron.discovery.query.druid.aggregations;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.domain.datasource.Field;
import org.junit.Assert;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

public class GenericMinAggregationTest {
    @Test
    public void testChangeTimestampFieldName() {
        GenericMinAggregation minAggregator = new GenericMinAggregation("aggregationfunc_000", null, "OrderDate", "double");
        GenericMinAggregation minAggregator2 = new GenericMinAggregation("aggregationfunc_000", null, "DIFFTIME('HOUR',NOW(),\"OrderDate\")", "double");
        GenericMaxAggregation maxAggregator = new GenericMaxAggregation("aggregationfunc_000", null, "OrderDate", "double");
        GenericMaxAggregation maxAggregator2 = new GenericMaxAggregation("aggregationfunc_000", null, "DIFFTIME('HOUR',\"LastOrderDate\",\"OrderDate\")", "double");

        Field field = new Field("orderDate", DataType.TIMESTAMP, Field.FieldRole.TIMESTAMP, 0);
        List<Field> fieldList = new ArrayList<>();
        fieldList.add(field);

        minAggregator.changeTimestampFieldName(fieldList);
        maxAggregator.changeTimestampFieldName(fieldList);
        minAggregator2.changeTimestampFieldName(fieldList);
        maxAggregator2.changeTimestampFieldName(fieldList);

        Assert.assertEquals("__time", minAggregator.getFieldExpression());
        Assert.assertEquals("__time", maxAggregator.getFieldExpression());
        Assert.assertEquals("DIFFTIME('HOUR',NOW(),__time)", minAggregator2.getFieldExpression());
        Assert.assertEquals("DIFFTIME('HOUR',\"LastOrderDate\",__time)", maxAggregator2.getFieldExpression());
    }
}
