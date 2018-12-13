/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.geo;

import com.google.common.collect.Lists;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.workbook.configurations.datasource.DefaultDataSource;
import app.metatron.discovery.domain.workbook.configurations.filter.InclusionFilter;

public class GeoServiceTest extends AbstractIntegrationTest {

  @Autowired
  GeoService geoService;

  @Test
  public void findGeoData() {
    SearchQueryRequest searchQueryRequest = new SearchQueryRequest();
    searchQueryRequest.setDataSource(new DefaultDataSource("real_price"));
    //searchQueryRequest.setDataSource(new DefaultDataSource("estate"));
    searchQueryRequest.setProjections(null);
    searchQueryRequest.setFilters(Lists.newArrayList(
        new InclusionFilter("amt", Lists.newArrayList("62500"))
    ));

    System.out.println(geoService.search(searchQueryRequest));
  }

  @Test
  public void createGeoDataStore() {
    geoService.createDataStore("estate");
    geoService.createFeatureType("estate");
  }

  @Test
  public void deleteGeoDataStore() {
    geoService.deleteDataStore("estate");
  }

}