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

package app.metatron.discovery.domain.datasource.data.result;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.databind.JsonNode;

import org.junit.Assert;
import org.junit.Test;

import java.util.List;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.MatrixResponse;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.workbook.configurations.analysis.PredictionAnalysis;
import app.metatron.discovery.domain.workbook.configurations.analysis.Style;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;
import app.metatron.discovery.domain.workbook.configurations.field.TimestampField;
import app.metatron.discovery.domain.workbook.configurations.format.ContinuousTimeFormat;
import app.metatron.discovery.domain.workbook.configurations.format.NumberFieldFormat;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;

@SuppressWarnings("rawtypes")
public class PivotResultFormatTest {
    @Test
    public void toResultSetByMatrixTypeForString(){
        String jsonResult = "[{\"Aberdeen―LastOrderDate\":\"2014-11-12 00\",\"Abilene―LastOrderDate\":\"2014-12-12 00\",\"Akron―LastOrderDate\":\"2014-10-21 00\",\"Albuquerque―LastOrderDate\":\"2014-12-29 00\"}]";

        PivotResultFormat pivotResultFormat = new PivotResultFormat();
        pivotResultFormat.setRequest(new SearchQueryRequest());
        pivotResultFormat.setConnType(DataSource.ConnectionType.ENGINE);
        pivotResultFormat.setResultType(SearchResultFormat.ResultType.MATRIX);
        pivotResultFormat.setKeyFields(Lists.newArrayList());
        pivotResultFormat.setPivots(Lists.newArrayList());
        pivotResultFormat.setSeparator("-");

        @SuppressWarnings("rawtypes") MatrixResponse response = pivotResultFormat.toResultSetByMatrixType(GlobalObjectMapper.readValue(jsonResult, JsonNode.class));

        //noinspection rawtypes
        Assert.assertEquals("2014-11-12 00", ((MatrixResponse.Column) response.getColumns().get(0)).getValue().get(0).toString());
    }

    @Test
    public void toResultSetByMatrixTypeForDouble(){
        String jsonResult = "[{\"Segment\":\"Consumer\",\"SUM(Sales)\":268970.0},{\"Segment\":\"Corporate\",\"SUM(Sales)\":208473.0},{\"Segment\":\"Home Office\",\"SUM(Sales)\":137661.0}]";

        PivotResultFormat pivotResultFormat = new PivotResultFormat();
        pivotResultFormat.setRequest(new SearchQueryRequest());
        pivotResultFormat.setConnType(DataSource.ConnectionType.ENGINE);
        pivotResultFormat.setResultType(SearchResultFormat.ResultType.MATRIX);
        pivotResultFormat.setKeyFields(Lists.newArrayList());
        pivotResultFormat.setPivots(Lists.newArrayList());
        pivotResultFormat.setSeparator("-");

        MatrixResponse response = pivotResultFormat.toResultSetByMatrixType(GlobalObjectMapper.readValue(jsonResult, JsonNode.class));

        Assert.assertEquals(268970.0, (Double) ((MatrixResponse.Column) response.getColumns().get(1)).getValue().get(0), 0.0);
    }

    @Test
    public void toResultSetByMatrixTypeForDoubleNan(){
        String jsonResult = "[{\"Segment\":\"Consumer\",\"SUM(Sales)\":\"NaN\"},{\"Segment\":\"Corporate\",\"SUM(Sales)\":null},{\"Segment\":\"Home Office\",\"SUM(Sales)\":137661.0}]";

        PivotResultFormat pivotResultFormat = new PivotResultFormat();
        pivotResultFormat.setRequest(new SearchQueryRequest());
        pivotResultFormat.setConnType(DataSource.ConnectionType.ENGINE);
        pivotResultFormat.setResultType(SearchResultFormat.ResultType.MATRIX);
        pivotResultFormat.setKeyFields(Lists.newArrayList());
        pivotResultFormat.setPivots(Lists.newArrayList());
        pivotResultFormat.setSeparator("-");

        MatrixResponse response = pivotResultFormat.toResultSetByMatrixType(GlobalObjectMapper.readValue(jsonResult, JsonNode.class));

        Assert.assertEquals(Double.NaN, (Double) ((MatrixResponse.Column) response.getColumns().get(1)).getValue().get(0), 0.0);
        Assert.assertNull(((MatrixResponse.Column) response.getColumns().get(1)).getValue().get(1));
    }

    @Test
    public void toResultSetByMatrixTypeForInt(){
        String jsonResult = "[{\"Aberdeen―COUNT(Profit)\":1,\"Abilene―COUNT(Profit)\":1,\"Akron―COUNT(Profit)\":9,\"Albuquerque―COUNT(Profit)\":5,\"Alexandria―COUNT(Profit)\":1,\"Amarillo―COUNT(Profit)\":1}]";

        PivotResultFormat pivotResultFormat = new PivotResultFormat();
        pivotResultFormat.setRequest(new SearchQueryRequest());
        pivotResultFormat.setConnType(DataSource.ConnectionType.ENGINE);
        pivotResultFormat.setResultType(SearchResultFormat.ResultType.MATRIX);
        pivotResultFormat.setKeyFields(Lists.newArrayList());
        pivotResultFormat.setPivots(Lists.newArrayList());
        pivotResultFormat.setSeparator("-");

        MatrixResponse response = pivotResultFormat.toResultSetByMatrixType(GlobalObjectMapper.readValue(jsonResult, JsonNode.class));

        Assert.assertEquals(1, ((Integer)((MatrixResponse.Column) response.getColumns().get(1)).getValue().get(0)).doubleValue(), 0);
    }

    @Test
    public void toResultSetByMatrixTypeForPrediction() {
        String jsonResult = "[{\"version\":\"v1\",\"SUM(Profit)\":2803.0,\"OrderDate\":\"Apr 2014\"},{\"version\":\"v1\",\"SUM(Profit)\":6275.0,\"OrderDate\":\"May 2014\"},{\"version\":\"v1\",\"SUM(Profit)\":8091.0,\"OrderDate\":\"Jun 2014\"},{\"version\":\"v1\",\"SUM(Profit)\":6622.0,\"OrderDate\":\"Jul 2014\"},{\"version\":\"v1\",\"SUM(Profit)\":8886.0,\"OrderDate\":\"Aug 2014\"},{\"version\":\"v1\",\"SUM(Profit)\":11391.0,\"OrderDate\":\"Sep 2014\"},{\"version\":\"v1\",\"SUM(Profit)\":9438.0,\"OrderDate\":\"Oct 2014\"},{\"version\":\"v1\",\"SUM(Profit)\":9683.0,\"OrderDate\":\"Nov 2014\"},{\"version\":\"v1\",\"SUM(Profit)\":8537.0,\"OrderDate\":\"Dec 2014\"},{\"version\":\"predict\",\"SUM(Profit)\":[1083.659510378634,5650.380935758498,10217.10236113836],\"SUM(Profit).params\":[1.0,0.0,0.921985595473179],\"OrderDate\":\"Jan 2015\"},{\"version\":\"predict\",\"SUM(Profit)\":[3300.3245649513483,10538.406775418302,17776.488985885255],\"SUM(Profit).params\":[1.0,0.0,0.921985595473179],\"OrderDate\":\"Feb 2015\"},{\"version\":\"predict\",\"SUM(Profit)\":[2381.9377137135525,11515.38056447328,20648.823415233008],\"SUM(Profit).params\":[1.0,0.0,0.921985595473179],\"OrderDate\":\"Mar 2015\"}]";

        PivotResultFormat pivotResultFormat = new PivotResultFormat();
        pivotResultFormat.setRequest(new SearchQueryRequest());
        pivotResultFormat.setConnType(DataSource.ConnectionType.ENGINE);
        pivotResultFormat.setResultType(SearchResultFormat.ResultType.MATRIX);
        pivotResultFormat.setKeyFields(Lists.newArrayList());
        pivotResultFormat.getKeyFields().add("OrderDate");
        pivotResultFormat.setPivots(Lists.newArrayList());
        pivotResultFormat.setSeparator("-");

        PredictionAnalysis analysis = new PredictionAnalysis();
        List<PredictionAnalysis.HyperParameter> parameters = Lists.newArrayList();
        analysis.setForecast(new PredictionAnalysis.Forecast(null, new Style()));
        pivotResultFormat.getRequest().setAnalysis(analysis);

        pivotResultFormat.getRequest().setProjections(Lists.newArrayList());
        pivotResultFormat.getRequest().getProjections().add(new TimestampField("OrderDate", null, null, new SimpleGranularity("DAY"), new ContinuousTimeFormat(false, "MONTH", null )));
        pivotResultFormat.getRequest().getProjections().add(new MeasureField("Profit", "SUM(Profit)", null, "SUM", new NumberFieldFormat(2, true, "NONE", null), null));

        MatrixResponse response = pivotResultFormat.toResultSetByMatrixType(GlobalObjectMapper.readValue(jsonResult, JsonNode.class));

        Assert.assertEquals("Apr 2014", response.getRows().get(0));
        Assert.assertEquals("Column length is incorrect", 1, response.getColumns().size());
        Assert.assertEquals("SUM(Profit)", ((MatrixResponse.Column)response.getColumns().get(0)).getName());

        Assert.assertEquals("First element of SUM(Profit) is incorrect", 2803, (Double) ((MatrixResponse.Column) response.getColumns().get(0)).getValue().get(0), 0.0);
    }
}
