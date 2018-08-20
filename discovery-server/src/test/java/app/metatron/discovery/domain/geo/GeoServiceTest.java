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

}