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

package app.metatron.discovery.domain.datasource;

import org.assertj.core.util.Lists;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.engine.model.SegmentMetaDataResponse;
import app.metatron.discovery.domain.workbook.configurations.filter.Filter;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;
import app.metatron.discovery.domain.workbook.configurations.filter.IntervalFilter;
import app.metatron.discovery.query.druid.Granularity;
import app.metatron.discovery.query.druid.granularities.SimpleGranularity;

import static org.junit.Assert.assertTrue;

public class DataSourceServiceTest extends AbstractIntegrationTest {

  @Autowired
  DataSourceService dataSourceService;

  @Autowired
  DataSourceTemporaryRepository temporaryRepository;

  @Test
  @Sql("/sql/test_datasource_temporary.sql")
  public void getMatchedTemporaries() throws Exception {

    String dataSourceId = "ds-test-01";
    System.out.println(dataSourceService.getMatchedTemporaries(dataSourceId, null));

    // Case Filters null
    DataSourceTemporary dataSourceTemporary1 =
        new DataSourceTemporary("TEMP1_" + dataSourceId, dataSourceId + "_NAME1",
                                dataSourceId, "query_id", 60, null, false, false);

    temporaryRepository.saveAndFlush(dataSourceTemporary1);

    System.out.println(dataSourceService.getMatchedTemporaries(dataSourceId, null));

    // Case Includsion Filter
    List<Filter> inclusionFilters = Lists.newArrayList(
        new InclusionFilter("city", Lists.newArrayList("abc", "cdf"))
    );

    DataSourceTemporary dataSourceTemporary2 =
        new DataSourceTemporary("TEMP2_" + dataSourceId, dataSourceId + "_NAME2",
                                dataSourceId, "query_id", 60,
                                GlobalObjectMapper.writeListValueAsString(inclusionFilters, Filter.class), false, false);

    temporaryRepository.saveAndFlush(dataSourceTemporary2);

    System.out.println(dataSourceService.getMatchedTemporaries(dataSourceId, inclusionFilters));

    // Case Interval Filter
    List<Filter> intervalFilters = Lists.newArrayList(
        new IntervalFilter("date", 5, "hours")
    );

    DataSourceTemporary dataSourceTemporary3 =
        new DataSourceTemporary("TEMP3_" + dataSourceId, dataSourceId + "_NAME3",
                                dataSourceId, "query_id", 60,
                                GlobalObjectMapper.writeListValueAsString(intervalFilters, Filter.class), false, false);

    temporaryRepository.saveAndFlush(dataSourceTemporary3);

    System.out.println(dataSourceService.getMatchedTemporaries(dataSourceId, intervalFilters));


    List<Filter> combineFilters = Lists.newArrayList();
    combineFilters.addAll(inclusionFilters);
    combineFilters.addAll(intervalFilters);

    DataSourceTemporary dataSourceTemporary4 =
        new DataSourceTemporary("TEMP4_" + dataSourceId, dataSourceId + "_NAME4",
                                dataSourceId, "query_id", 60,
                                GlobalObjectMapper.writeListValueAsString(combineFilters, Filter.class), false, false);

    temporaryRepository.saveAndFlush(dataSourceTemporary4);

    System.out.println(dataSourceService.getMatchedTemporaries(dataSourceId, combineFilters));


  }

  @Test
  public void getEmptyGranularityTest() throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {

    DataSourceService dsService = new DataSourceService();

    SegmentMetaDataResponse segmentMetaData = new SegmentMetaDataResponse();
    segmentMetaData.setQueryGranularity(new SimpleGranularity(null));

    Method isEmptyGranularity = dsService.getClass().getDeclaredMethod("isEmptyGranularity", Granularity.class);
    isEmptyGranularity.setAccessible(true);

    boolean result = (Boolean) isEmptyGranularity.invoke(dsService, segmentMetaData.getQueryGranularity());
    assertTrue(result);
  }

}
