package app.metatron.discovery.domain.datasource.data.result;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.MatrixResponse;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.google.common.collect.Lists;
import org.junit.Assert;
import org.junit.Test;

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

        MatrixResponse response = pivotResultFormat.toResultSetByMatrixType(GlobalObjectMapper.readValue(jsonResult, JsonNode.class));

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
}
