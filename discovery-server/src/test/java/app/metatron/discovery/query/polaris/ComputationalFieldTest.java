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

package app.metatron.discovery.query.polaris;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.datasource.data.InvalidExpressionException;
import app.metatron.discovery.domain.user.User;
import app.metatron.discovery.domain.workbook.configurations.field.ExpressionField;
import app.metatron.discovery.domain.workbook.configurations.field.UserDefinedField;
import app.metatron.discovery.query.druid.Aggregation;
import app.metatron.discovery.query.druid.PostAggregation;
import app.metatron.discovery.query.druid.aggregations.DistinctSketchAggregation;
import app.metatron.discovery.query.druid.aggregations.DoubleSumAggregation;
import app.metatron.discovery.query.druid.aggregations.GenericSumAggregation;
import app.metatron.discovery.query.druid.limits.WindowingSpec;
import app.metatron.discovery.query.druid.postaggregations.MathPostAggregator;
import app.metatron.discovery.query.druid.virtualcolumns.ExprVirtualColumn;
import app.metatron.discovery.query.druid.virtualcolumns.VirtualColumn;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import org.junit.Assert;
import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Created by hsp on 2016. 5. 3..
 */
public class ComputationalFieldTest {

    @Test
    public void testComputationalField() throws Exception {


        // single computation
        Assert.assertEquals( ComputationalField.checkComputationalField("-x"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("-x"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("!x"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x^y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x*y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x/y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x%y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x<y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x<=y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x>y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x>=y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x==y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x!=y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x&&y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x||y"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("100"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("100.10"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);


        Assert.assertEquals( ComputationalField.checkComputationalField("abs(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("acos(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("asin(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("atan(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("cbrt(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("ceil(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("cos(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("cosh(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("exp(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("expm1(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("floor(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("getExponent(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("log(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("log10(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("log1p(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("nextUp(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("rint(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("round(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("signum(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("sin(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("sinh(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("sqrt(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("tan(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("tanh(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("toDegrees(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("toRadians(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("ulp(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);


        Assert.assertEquals( ComputationalField.checkComputationalField("atan2(x,y)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("copySign(x,y)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("hypot(x,y)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("remainder(x,y)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("max(x,y)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("min(x,y)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("nextAfter(x,y)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("pow(x,y)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("scalb(x,y)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);

        Assert.assertEquals( ComputationalField.checkComputationalField("if(x,y,z)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);

        Assert.assertEquals( ComputationalField.checkComputationalField("minof(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("maxof(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("avgof(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("sumof(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("countof(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_AGGREGATOR);

        Assert.assertEquals( ComputationalField.checkComputationalField("countd(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_AGGREGATOR);

        Assert.assertEquals( ComputationalField.checkComputationalField("case(x,y,z,s)"), ComputationalField.CheckType.CHECK_TYPE_VALID_NON_AGGREGATOR);



        // multi computation
        Assert.assertEquals( ComputationalField.checkComputationalField("x + y + sumof(z+x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_AGGREGATOR);
        Assert.assertEquals( ComputationalField.checkComputationalField("x + y + sumof(z+x)/countof(x)"), ComputationalField.CheckType.CHECK_TYPE_VALID_AGGREGATOR);

        try{
            ComputationalField.checkComputationalField("x + y + sumof(z+x");
            Assert.fail("Must throw InvalidExpressionException exception");
        }catch(InvalidExpressionException e){
            Assert.assertTrue(true);
        }catch (Exception e){
            Assert.fail("Must throw InvalidExpressionException exception");
        }

        try{
            ComputationalField.checkComputationalField("x + y + sumof(sumof(z+x))");
            Assert.fail("Must throw InvalidExpressionException exception");
        }catch(InvalidExpressionException e){
            Assert.assertTrue(true);
        }catch (Exception e){
            Assert.fail("Must throw InvalidExpressionException exception");
        }

        try{
            ComputationalField.checkComputationalField("x + y + ");
            Assert.fail("Must throw InvalidExpressionException exception");
        }catch(InvalidExpressionException e){
            Assert.assertTrue(true);
        }catch (Exception e){
            Assert.fail("Must throw InvalidExpressionException exception");
        }

    }

    public String makeArrayToString( List<Object> listData ){

        StringBuilder result = new StringBuilder();

        for ( Object object : listData ){
            result.append(object.toString());
        }

        return result.toString();
    }

    public boolean compareAggregations( List<Aggregation> ans_aggregations, List<PostAggregation> ans_postAggregations,  List<Aggregation> aggregations, List<PostAggregation> postAggregations){

        if( ans_aggregations.size() != aggregations.size() )
            return false;

        for (Aggregation ans_aggregation : ans_aggregations) {
            System.out.println(aggregations.get(0).toString());
            if (!ans_aggregation.toString().equals(aggregations.get(0).toString()))
                return false;
        }


        if( ans_postAggregations.size() != postAggregations.size() )
            return false;

        for (PostAggregation ans_postAggregation : ans_postAggregations) {
            System.out.println(postAggregations.get(0).toString());
            if (!ans_postAggregation.toString().equals(postAggregations.get(0).toString()))
                return false;
        }

        return true;
    }

    @Test
    public void testmakeDependencyTree() {

        Map<String, String> mapFieldNames = Maps.newHashMap();

        mapFieldNames.put(   "p_hdv_qoe1_kpi1",      " if( SUMOF(hdv_attempt_cnt) != 0, SUMOF(hdv_success_cnt) / SUMOF(hdv_attempt_cnt) * 100, -100) " );
        mapFieldNames.put(   "p_hdv_qoe1_kpi2",      " if( SUMOF(hdv_success_cnt) != 0, 100 - ( SUMOF(hdv_drop_cnt) / SUMOF(hdv_success_cnt) * 100 ), -100) " );
        mapFieldNames.put(   "p_hdv_qoe1_kpi3",      " if( SUMOF(hdv_user_cnt) > 1, SUMOF(hdv_qoe1_kpi3) / SUMOF(hdv_user_cnt) , -100) " );
        mapFieldNames.put(   "p_hdv_qoe1_qos1",      " if( SUMOF(hdv_calculated_et) != 0, 100 - ( SUMOF(hdv_bad_et) / SUMOF(hdv_calculated_et) * 100 ) , -100) " );
        mapFieldNames.put(   "p_hdv_qoe1_value",     " abs( p_hdv_qoe1_kpi1 * p_hdv_qoe1_kpi2 * p_hdv_qoe1_kpi3 * p_hdv_qoe1_qos1 ) / 1000000 " );
        mapFieldNames.put(   "p_hdv_qoe2_value",     " if( SUMOF(hdv_calculated_et) != 0, SUMOF(hdv_qoe2_value) / SUMOF(hdv_calculated_et) , -100) " );
        mapFieldNames.put(   "n_hdv_cei_value",      " abs( p_hdv_qoe1_value * p_hdv_qoe2_value ) / 100 " );

        ComputationalField.makeDependencyTree("n_hdv_cei_value", mapFieldNames);


    }

    public boolean compareAggregations( List<Aggregation> ans_aggregations,
                                        List<PostAggregation> ans_postAggregations,
                                        List<WindowingSpec> ans_windowingspec,
                                        List<Aggregation> aggregations,
                                        List<PostAggregation> postAggregations,
                                        List<WindowingSpec> windowingspec ){
        for (Aggregation aggregation : aggregations) System.out.println(aggregation.toString());
        for (PostAggregation postAggregation : postAggregations) System.out.println(postAggregation.toString());
        for (WindowingSpec windowingSpec : windowingspec) System.out.println(windowingSpec.toString());


        Assert.assertEquals("Aggregations's size is incorrect", ans_aggregations.size(), aggregations.size());

        for( int i = 0 ; i < ans_aggregations.size() ; ++i ){
            Assert.assertEquals("Aggregations[" + i + "] is incorrect", ans_aggregations.get(i).toString(), aggregations.get(i).toString());
        }

        Assert.assertEquals("Post aggregations's size is incorrect", ans_postAggregations.size(), postAggregations.size());

        for( int i = 0 ; i < ans_postAggregations.size() ; ++i ){
            Assert.assertEquals("Post aggregations[" + i + "] is incorrect", ans_postAggregations.get(i).toString(), postAggregations.get(i).toString());
        }

        Assert.assertEquals("Windowingspec's size is incorrect", ans_windowingspec.size(), windowingspec.size());

        for( int i = 0 ; i < ans_windowingspec.size() ; ++i ){
            Assert.assertEquals("Windowingspec[" + i + "] is incorrect", ans_windowingspec.get(i).toString(), windowingspec.get(i).toString());
        }

        return true;
    }
    @Test
    public void testMakeAggregationFunctions4() {

        List<Aggregation> aggregations = Lists.newArrayList();
        List<PostAggregation> postAggregations = Lists.newArrayList();
        List<WindowingSpec> windowingSpecs = Lists.newArrayList();

        List<Aggregation> ans_aggregations = Lists.newArrayList();
        List<PostAggregation> ans_postAggregations = Lists.newArrayList();
        List<WindowingSpec> ans_windowingSpecs = Lists.newArrayList();
        Map<String, VirtualColumn> virtualColumns = Maps.newHashMap();


        String fieldName = "ac_sum_recu";
        String input = "1.01 * if( $prev(ac_sum_recu, {abc} ) == null, 1, $prev(ac_sum_recu, {abc} ) )";

        List<String> partitionColumns = Lists.newArrayList();
        partitionColumns.add( "abc" );
        ans_windowingSpecs.add( new WindowingSpec( partitionColumns, null, Collections.singletonList("\"ac_sum_recu\" = 1.01*if($prev(ac_sum_recu)==null,1,$prev(ac_sum_recu))")));

        ComputationalField.makeAggregationFunctions(fieldName, input, aggregations, postAggregations, windowingSpecs, virtualColumns,
                Maps.newHashMap());

        Assert.assertTrue( compareAggregations( ans_aggregations, ans_postAggregations, ans_windowingSpecs, aggregations, postAggregations, windowingSpecs ) );

        aggregations.clear(); postAggregations.clear(); windowingSpecs.clear();
        ans_aggregations.clear(); ans_postAggregations.clear(); ans_windowingSpecs.clear();

        fieldName = "ac_sum_recu";
        input = "sumof( count ) + if( $prev(ac_sum_recu) == null, 0, $prev(ac_sum_recu) )";

        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_000", null, "double"));
        ans_windowingSpecs.add( new WindowingSpec( null, null, Collections.singletonList("ac_sum_recu = aggregationfunc_000+if($prev(ac_sum_recu)==null,0,$prev(ac_sum_recu))")));

        ComputationalField.makeAggregationFunctions(fieldName, input, aggregations, postAggregations, windowingSpecs, virtualColumns,
                Maps.newHashMap());

        Assert.assertTrue( compareAggregations( ans_aggregations, ans_postAggregations, ans_windowingSpecs, aggregations, postAggregations, windowingSpecs ) );

        aggregations.clear(); postAggregations.clear(); windowingSpecs.clear();
        ans_aggregations.clear(); ans_postAggregations.clear(); ans_windowingSpecs.clear();



        fieldName = "fieldname";
        input = "avgof( profit+1 ) ";

        ans_aggregations.add(new DoubleSumAggregation( "count", "count" ));
        ans_aggregations.add(new DoubleSumAggregation( "aggregationfunc_000", null, "profit+1"));
        ans_postAggregations.add( new MathPostAggregator("fieldname", "(aggregationfunc_000/count)", null ));

        ComputationalField.makeAggregationFunctions(fieldName, input, aggregations, postAggregations, windowingSpecs, virtualColumns,
                Maps.newHashMap());

        Assert.assertTrue( compareAggregations( ans_aggregations, ans_postAggregations, ans_windowingSpecs, aggregations, postAggregations, windowingSpecs ) );

        aggregations.clear(); postAggregations.clear(); windowingSpecs.clear();
        ans_aggregations.clear(); ans_postAggregations.clear(); ans_windowingSpecs.clear();



        fieldName = "fieldName01";
        input = "x + y + sumof(z)";

        ans_aggregations.add(new DoubleSumAggregation( "aggregationfunc_000", null, "z"));
        ans_postAggregations.add( new MathPostAggregator("fieldName01", "x+y+aggregationfunc_000", null ));

        ComputationalField.makeAggregationFunctions(fieldName, input, aggregations, postAggregations, windowingSpecs, virtualColumns,
                Maps.newHashMap());

        Assert.assertTrue( compareAggregations( ans_aggregations, ans_postAggregations, ans_windowingSpecs, aggregations, postAggregations, windowingSpecs ) );

        aggregations.clear(); postAggregations.clear(); windowingSpecs.clear();
        ans_aggregations.clear(); ans_postAggregations.clear(); ans_windowingSpecs.clear();



        fieldName = "fieldName01";
        input = "x + y + avgof(log(z))";

        ans_aggregations.add(new DoubleSumAggregation( "count", "count" ));
        ans_aggregations.add(new DoubleSumAggregation( "aggregationfunc_000", null, "log(z)"));
        ans_postAggregations.add( new MathPostAggregator("fieldName01", "x+y+(aggregationfunc_000/count)", null ));

        ComputationalField.makeAggregationFunctions(fieldName, input, aggregations, postAggregations, windowingSpecs, virtualColumns,
                Maps.newHashMap());

        Assert.assertTrue( compareAggregations( ans_aggregations, ans_postAggregations, ans_windowingSpecs, aggregations, postAggregations, windowingSpecs ) );

        aggregations.clear(); postAggregations.clear(); windowingSpecs.clear();
        ans_aggregations.clear(); ans_postAggregations.clear(); ans_windowingSpecs.clear();

    }

    @Test
    public void testmakeAggregationFunctionsIn() {

        List<Aggregation> aggregations = Lists.newArrayList();
        List<PostAggregation> postAggregations = Lists.newArrayList();
        List<WindowingSpec> windowingSpecs = Lists.newArrayList();

        List<Aggregation> ans_aggregations = Lists.newArrayList();
        List<PostAggregation> ans_postAggregations = Lists.newArrayList();
        List<WindowingSpec> ans_windowingSpecs = Lists.newArrayList();
        Map<String, VirtualColumn> virtualColumns = Maps.newHashMap();


        Map<String, UserDefinedField> mapFieldNames = Maps.newHashMap();


        mapFieldNames.put(   "p_hdv_qoe1_kpi1",      new ExpressionField("p_hdv_qoe1_kpi1", " if( SUMOF(hdv_attempt_cnt) != 0, SUMOF(hdv_success_cnt) / SUMOF(hdv_attempt_cnt) * 100, -100) ", "MEASURE", null, null, true) );
        mapFieldNames.put(   "p_hdv_qoe1_kpi2",      new ExpressionField("p_hdv_qoe1_kpi2", " if( SUMOF(hdv_success_cnt) != 0, 100 - ( SUMOF(hdv_drop_cnt) / SUMOF(hdv_success_cnt) * 100 ), -100) ", "MEASURE", null, null, true) );
        mapFieldNames.put(   "p_hdv_qoe1_kpi3",      new ExpressionField("p_hdv_qoe1_kpi3", " if( SUMOF(hdv_user_cnt) > 1, SUMOF(hdv_qoe1_kpi3) / SUMOF(hdv_user_cnt) , -100) ", "MEASURE", null, null, true) );
        mapFieldNames.put(   "p_hdv_qoe1_qos1",      new ExpressionField("p_hdv_qoe1_qos1", " if( SUMOF(hdv_calculated_et) != 0, 100 - ( SUMOF(hdv_bad_et) / SUMOF(hdv_calculated_et) * 100 ) , -100) ", "MEASURE", null, null, true) );
        mapFieldNames.put(   "p_hdv_qoe1_value",     new ExpressionField("p_hdv_qoe1_value", " abs( p_hdv_qoe1_kpi1 * p_hdv_qoe1_kpi2 * p_hdv_qoe1_kpi3 * p_hdv_qoe1_qos1 ) / 1000000 ", "MEASURE", null, null, true) );
        mapFieldNames.put(   "p_hdv_qoe2_value",     new ExpressionField("p_hdv_qoe1_value", " if( SUMOF(hdv_calculated_et) != 0, SUMOF(hdv_qoe2_value) / SUMOF(hdv_calculated_et) , -100) ", "MEASURE", null, null, true));


        String fieldName = "n_hdv_cei_value";
        String input = "abs( p_hdv_qoe1_value * p_hdv_qoe2_value ) / 100";

        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_000", null, "(hdv_attempt_cnt)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_001", null, "(hdv_success_cnt)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_002", null, "(hdv_attempt_cnt)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_003", null, "(hdv_success_cnt)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_004", null, "(hdv_drop_cnt)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_005", null, "(hdv_success_cnt)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_006", null, "(hdv_user_cnt)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_007", null, "(hdv_qoe1_kpi3)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_008", null, "(hdv_user_cnt)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_010", null, "(hdv_bad_et)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_011", null, "(hdv_calculated_et)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_012", null, "(hdv_calculated_et)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_013", null, "(hdv_qoe2_value)", "double"));
        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_014", null, "(hdv_calculated_et)", "double"));
        ans_postAggregations.add( new MathPostAggregator("n_hdv_cei_value", "abs((abs((if(aggregationfunc_000!=0,aggregationfunc_001/aggregationfunc_002*100,-100))*(if(aggregationfunc_003!=0,100-(aggregationfunc_004/aggregationfunc_005*100),-100))*(if(aggregationfunc_006>1,aggregationfunc_007/aggregationfunc_008,-100))*(if(aggregationfunc_009!=0,100-(aggregationfunc_010/aggregationfunc_011*100),-100)))/1000000)*(if(aggregationfunc_012!=0,aggregationfunc_013/aggregationfunc_014,-100)))/100", null ));


//        ComputationalField.checkComputationalFieldIn( input, mapFieldNames );
//        ComputationalField.makeAggregationFunctionsIn( fieldName, input, aggregations, postAggregations, windowingSpecs, mapFieldNames,Maps.newHashMap());

//        Assert.assertTrue( compareAggregations( ans_aggregations, ans_postAggregations, ans_windowingSpecs, aggregations, postAggregations, windowingSpecs ) );

        mapFieldNames.clear();
        aggregations.clear(); postAggregations.clear(); windowingSpecs.clear();
        ans_aggregations.clear(); ans_postAggregations.clear(); ans_windowingSpecs.clear();


        fieldName = "avg_per_city";
        input = "$mean( sumof(Profit), {City,Category})";
        ComputationalField.checkComputationalFieldIn(input, mapFieldNames);
        ComputationalField.makeAggregationFunctions(fieldName, input, aggregations, postAggregations, windowingSpecs, virtualColumns,
                Maps.newHashMap());

    }

    @Test
    public void testmakeAggregationFunctionsIn2() {
        List<Aggregation> aggregations = Lists.newArrayList();
        List<PostAggregation> postAggregations = Lists.newArrayList();
        List<WindowingSpec> windowingSpecs = Lists.newArrayList();

        List<Aggregation> ans_aggregations = Lists.newArrayList();
        List<PostAggregation> ans_postAggregations = Lists.newArrayList();
        List<WindowingSpec> ans_windowingSpecs = Lists.newArrayList();
        Map<String, VirtualColumn> virtualColumns = Maps.newHashMap();

        ans_aggregations.add(new GenericSumAggregation( "aggregationfunc_000", null, "Sales", "double"));
        ans_aggregations.add(new DistinctSketchAggregation( "aggregationfunc_001", "ORDERID", 65536L, true));

        ans_postAggregations.add(new MathPostAggregator("sumbycountd", "aggregationfunc_000/ROUND(aggregationfunc_001)", true));

        Map<String, UserDefinedField> mapFieldNames = Maps.newHashMap();

        String fieldName = "sumbycountd";
        String input = "SUMOF(Sales) / COUNTD(ORDERID)";

        ComputationalField.checkComputationalFieldIn(input, mapFieldNames);
        ComputationalField.makeAggregationFunctions(fieldName, input, aggregations, postAggregations, windowingSpecs, virtualColumns,
                Maps.newHashMap());

        Assert.assertTrue( compareAggregations( ans_aggregations, ans_postAggregations, ans_windowingSpecs, aggregations, postAggregations, windowingSpecs ) );
    }

    @Test
    public void testmakeAggregationFunctionsInForCountD() {
        List<Aggregation> aggregations = Lists.newArrayList();
        List<PostAggregation> postAggregations = Lists.newArrayList();
        List<WindowingSpec> windowingSpecs = Lists.newArrayList();

        List<Aggregation> ans_aggregations = Lists.newArrayList();
        List<PostAggregation> ans_postAggregations = Lists.newArrayList();
        List<WindowingSpec> ans_windowingSpecs = Lists.newArrayList();
        Map<String, VirtualColumn> virtualColumns = Maps.newHashMap();

        ans_aggregations.add(new DistinctSketchAggregation( "aggregationfunc_000", "ORDERID", 65536L, true));

        ans_postAggregations.add(new MathPostAggregator("measure1", "ROUND(aggregationfunc_000)", true));

        Map<String, UserDefinedField> mapFieldNames = Maps.newHashMap();

        String fieldName = "measure1";
        String input = "COUNTD(ORDERID)";

        ComputationalField.checkComputationalFieldIn(input, mapFieldNames);
        ComputationalField.makeAggregationFunctions(fieldName, input, aggregations, postAggregations, windowingSpecs, virtualColumns,
                Maps.newHashMap());

        Assert.assertTrue( compareAggregations( ans_aggregations, ans_postAggregations, ans_windowingSpecs, aggregations, postAggregations, windowingSpecs ) );
    }

    @Test
    public void tesTcheckComputationalFieldIn(){
        Map<String, UserDefinedField> mapFieldNames = Maps.newHashMap();

        mapFieldNames.put(   "total income",      new ExpressionField("total income", " SUMOF(\"Sales\") ", "MEASURE", null, null, true) );
        mapFieldNames.put(   "total profit",      new ExpressionField("total profit", " SUMOF(\"Profit\") ", "MEASURE", null, null, true) );

        String input = "\"user_defined.total income\" / \"user_defined.total profit\" * 100";

        ComputationalField.CheckType checkType = ComputationalField.checkComputationalFieldIn(input, mapFieldNames);

        Assert.assertEquals(ComputationalField.CheckType.CHECK_TYPE_VALID_AGGREGATOR, checkType);
    }

    @Test
    public void testMakeAggregationFunctionsForCountDWithExpression() {
        List<Aggregation> aggregations = Lists.newArrayList();
        List<PostAggregation> postAggregations = Lists.newArrayList();
        List<WindowingSpec> windowingSpecs = Lists.newArrayList();

        List<Aggregation> ans_aggregations = Lists.newArrayList();
        List<PostAggregation> ans_postAggregations = Lists.newArrayList();
        List<WindowingSpec> ans_windowingSpecs = Lists.newArrayList();
        Map<String, VirtualColumn> virtualColumns = Maps.newHashMap();

        ans_aggregations.add(new DistinctSketchAggregation( "aggregationfunc_000", "virtualcolumn_000", 65536L, true));

        ans_postAggregations.add(new MathPostAggregator("measure1", "ROUND(aggregationfunc_000)", true));

        Map<String, UserDefinedField> mapFieldNames = Maps.newHashMap();

        String fieldName = "measure1";
        String input = "COUNTD(IF(\"ORDERID\" != '', \"ORDERID\", ''))";

        ComputationalField.checkComputationalFieldIn(input, mapFieldNames);
        ComputationalField.makeAggregationFunctions(fieldName, input, aggregations, postAggregations, windowingSpecs, virtualColumns,
                Maps.newHashMap());

        Assert.assertTrue( compareAggregations( ans_aggregations, ans_postAggregations, ans_windowingSpecs, aggregations, postAggregations, windowingSpecs ) );
        Assert.assertEquals(1, virtualColumns.size());
        Assert.assertEquals("IF(\"ORDERID\"!='',\"ORDERID\",'')", ((ExprVirtualColumn)virtualColumns.get("virtualcolumn_000")).getExpression());

        input = "COUNTD(CONCAT(\"ORDERID\", \"REGION\"))";
        virtualColumns.clear();
        aggregations.clear();
        postAggregations.clear();
        windowingSpecs.clear();

        ComputationalField.checkComputationalFieldIn(input, mapFieldNames);
        ComputationalField.makeAggregationFunctions(fieldName, input, aggregations, postAggregations, windowingSpecs, virtualColumns,
                Maps.newHashMap());

        Assert.assertTrue( compareAggregations( ans_aggregations, ans_postAggregations, ans_windowingSpecs, aggregations, postAggregations, windowingSpecs ) );
        Assert.assertEquals(1, virtualColumns.size());
        Assert.assertEquals("CONCAT(\"ORDERID\",\"REGION\")", ((ExprVirtualColumn)virtualColumns.get("virtualcolumn_000")).getExpression());
    }
}
