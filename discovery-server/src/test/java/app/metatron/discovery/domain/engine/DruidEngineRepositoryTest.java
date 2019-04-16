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

package app.metatron.discovery.domain.engine;

import com.fasterxml.jackson.databind.JsonNode;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.query.druid.queries.GeoBoundaryFilterQuery;
import app.metatron.discovery.query.druid.queries.SelectStreamQuery;
import app.metatron.discovery.query.druid.virtualcolumns.ExprVirtualColumn;

/**
 * Created by kyungtaak on 2016. 8. 22..
 */
public class DruidEngineRepositoryTest extends AbstractIntegrationTest {

  @Autowired
  DruidEngineRepository druidEngineRepository;

  @Test
  public void query() throws Exception {
    String query = "{\"queryType\":\"groupBy\",\"dataSource\":\"summary_0804_final\",\"dimensions\":[{\"type\":\"default\",\"dimension\":\"eqp_id\",\"outputName\":\"eqp_id\"},{\"type\":\"default\",\"dimension\":\"module_name\",\"outputName\":\"module_name\"},{\"type\":\"default\",\"dimension\":\"lot_id\",\"outputName\":\"lot_id\"},{\"type\":\"default\",\"dimension\":\"cassette_slot\",\"outputName\":\"cassette_slot\"},{\"type\":\"default\",\"dimension\":\"eqp_step_id\",\"outputName\":\"eqp_step_id\"},{\"type\":\"default\",\"dimension\":\"map_test\",\"outputName\":\"map_test\"}],\"virtualColumns\":[{\"type\":\"index\",\"outputName\":\"map_test\",\"keyDimension\":\"eqp_param_name\",\"valueMetrics\":[\"count\",\"param_value_min\",\"param_value_max\",\"param_value_sum\"],\"keyFilter\":{\"type\":\"in\",\"dimension\":\"map_test\",\"values\":[\"VIR_LLA_SWILL_PRESS\",\"VIR_LLA_SWILL_PRESS_DELTA\",\"VIR_LLB_SWILL_PRESS\",\"VIR_LLB_SWILL_PRESS_DELTA\",\"VIR_PRESSURE_CH_LEAK\",\"VIR_TEMP_ESC_INNER\",\"VIR_TEMP_ESC_OUTER\"]}}],\"limitSpec\":{\"type\":\"default\",\"limit\":500000,\"columns\":[{\"dimension\":\"eqp_id\",\"direction\":\"ascending\",\"dimensionOrder\":\"alphanumeric\"},{\"dimension\":\"module_name\",\"direction\":\"ascending\",\"dimensionOrder\":\"alphanumeric\"},{\"dimension\":\"lot_id\",\"direction\":\"ascending\",\"dimensionOrder\":\"alphanumeric\"},{\"dimension\":\"cassette_slot\",\"direction\":\"ascending\",\"dimensionOrder\":\"alphanumeric\"},{\"dimension\":\"eqp_step_id\",\"direction\":\"ascending\",\"dimensionOrder\":\"alphanumeric\"},{\"dimension\":\"map_test\",\"direction\":\"ascending\",\"dimensionOrder\":\"alphanumeric\"}]},\"granularity\":\"all\",\"filter\":{\"type\":\"and\",\"fields\":[{\"type\":\"in\",\"dimension\":\"fab\",\"values\":[\"M10\"]},{\"type\":\"in\",\"dimension\":\"eqp_id\",\"values\":[\"EAD303\"]},{\"type\":\"in\",\"dimension\":\"eqp_recipe_id\",\"values\":[\"DE_GBLHMPL_R7_A\",\"DE_GBLHMPL_R7_B\",\"DE_GBLHMPL_R7_C\"]},{\"type\":\"in\",\"dimension\":\"lot_id\",\"values\":[\"TCA4208\",\"TCA4209\"]},{\"type\":\"in\",\"dimension\":\"cassette_slot\",\"values\":[\"01\",\"02\",\"03\",\"04\",\"05\",\"06\"]},{\"type\":\"in\",\"dimension\":\"eqp_step_id\",\"values\":[\"1\"]}]},\"aggregations\":[{\"type\":\"min\",\"name\":\"MIN(param_value)\",\"fieldName\":\"param_value_min\",\"inputType\":\"double\"},{\"type\":\"max\",\"name\":\"MAX(param_value)\",\"fieldName\":\"param_value_max\",\"inputType\":\"double\"},{\"type\":\"sum\",\"name\":\"param_value_sum\",\"fieldName\":\"param_value_sum\",\"inputType\":\"double\"},{\"type\":\"sum\",\"name\":\"param_value_cnt\",\"fieldName\":\"count\",\"inputType\":\"double\"},{\"type\":\"sum\",\"name\":\"SUM(param_value)\",\"fieldName\":\"param_value_sum\",\"inputType\":\"double\"},{\"type\":\"approxHistogramFold\",\"name\":\"param_value_his\",\"fieldName\":\"\"},{\"type\":\"max\",\"name\":\"param_value_max\",\"fieldName\":\"param_value_max\",\"inputType\":\"double\"},{\"type\":\"min\",\"name\":\"param_value_min\",\"fieldName\":\"param_value_min\",\"inputType\":\"double\"}],\"postAggregations\":[{\"type\":\"arithmetic\",\"name\":\"AVG(param_value)\",\"fn\":\"/\",\"fields\":[{\"type\":\"fieldAccess\",\"name\":\"param_value_sum\",\"fieldName\":\"param_value_sum\"},{\"type\":\"fieldAccess\",\"name\":\"param_value_cnt\",\"fieldName\":\"param_value_cnt\"}]},{\"type\":\"median\",\"name\":\"MEDIAN(param_value)\",\"fieldName\":\"param_value_his\"},{\"type\":\"arithmetic\",\"name\":\"RANGE(param_value)\",\"fn\":\"-\",\"fields\":[{\"type\":\"fieldAccess\",\"name\":\"param_value_max\",\"fieldName\":\"param_value_max\"},{\"type\":\"fieldAccess\",\"name\":\"param_value_min\",\"fieldName\":\"param_value_min\"}]},{\"type\":\"arithmetic\",\"name\":\"AREA(param_value)\",\"fn\":\"-\",\"fields\":[{\"type\":\"fieldAccess\",\"name\":\"param_value_sum\",\"fieldName\":\"param_value_sum\"},{\"type\":\"arithmetic\",\"name\":\"param_value_mincnt\",\"fn\":\"*\",\"fields\":[{\"type\":\"fieldAccess\",\"name\":\"param_value_min\",\"fieldName\":\"param_value_min\"},{\"type\":\"fieldAccess\",\"name\":\"param_value_cnt\",\"fieldName\":\"param_value_cnt\"}]}]}],\"intervals\":[\"1970-01-01/2051-01-01\"],\"outputColumns\":[\"eqp_id\",\"module_name\",\"lot_id\",\"cassette_slot\",\"eqp_step_id\",\"map_test\",\"MIN(param_value)\",\"MAX(param_value)\",\"AVG(param_value)\",\"SUM(param_value)\",\"MEDIAN(param_value)\",\"RANGE(param_value)\",\"AREA(param_value)\"]}";

    Optional<JsonNode> node = druidEngineRepository.query(query, JsonNode.class);
    System.out.println(node.get());
  }

  @Test
  public void selectStreamQuery() {

    SelectStreamQuery selectStreamQuery1 = SelectStreamQuery.builder(new DefaultDataSource("estate"))
                                                            .virtualColumns(new ExprVirtualColumn("concat('POINT (', \"gis.lon\", ' ', \"gis.lat\",')')", "__geom.vc"))
                                                            .columns("gu", "__geom.vc")
                                                            .build();

    String strStreamQuery1 = GlobalObjectMapper.writeValueAsString(selectStreamQuery1);

    Optional<JsonNode> node = druidEngineRepository.query(strStreamQuery1, JsonNode.class);
    System.out.println(node.get());

    SelectStreamQuery selectStreamQuery2 = SelectStreamQuery.builder(new DefaultDataSource("seoul_loads"))
                                                            .virtualColumns(new ExprVirtualColumn("shape_fromWKT(geom)", "shape"),
                                                                            new ExprVirtualColumn("shape_toWKT(shape_buffer(shape, 100, endCapStyle=2))", "geom_buf"))
                                                            .columns("geom_buf", "name")
                                                            .build();

    String strStreamQuery2 = GlobalObjectMapper.writeValueAsString(selectStreamQuery2);
    Optional<JsonNode> node2 = druidEngineRepository.query(strStreamQuery2, JsonNode.class);
    System.out.println(node2.get());

    GeoBoundaryFilterQuery geoBoundaryQuery = GeoBoundaryFilterQuery.builder()
                                                                    .query(selectStreamQuery1)
                                                                    .point("gis.coord")
                                                                    .boundary(selectStreamQuery2, "geom_buf", false)
                                                                    .build();

    String strGeoBoundaryQuery = GlobalObjectMapper.writeValueAsString(geoBoundaryQuery);
    Optional<JsonNode> node3 = druidEngineRepository.query(strGeoBoundaryQuery, JsonNode.class);
    System.out.println(node3.get());

  }

}
