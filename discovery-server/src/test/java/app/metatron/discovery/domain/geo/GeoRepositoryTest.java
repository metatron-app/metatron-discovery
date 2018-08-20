package app.metatron.discovery.domain.geo;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import app.metatron.discovery.AbstractIntegrationTest;
import app.metatron.discovery.domain.geo.query.model.GeoQuery;
import app.metatron.discovery.domain.geo.query.model.GetFeature;
import app.metatron.discovery.domain.geo.query.model.filter.AndOperator;
import app.metatron.discovery.domain.geo.query.model.filter.GeoFilter;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsEqualTo;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsLike;

public class GeoRepositoryTest extends AbstractIntegrationTest {

  @Autowired
  GeoRepository geoRepository;

  ObjectMapper objectMapper;

  @Before
  public void setup() {
    JacksonXmlModule xmlModule = new JacksonXmlModule();
    xmlModule.setDefaultUseWrapper(false);
    objectMapper = new XmlMapper(xmlModule);
    objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
  }

  @Test
  public void query() throws JsonProcessingException {

    GeoQuery query = new GeoQuery("metatron:real_price", "EPSG:4326");
    GeoFilter filter = new GeoFilter();
    AndOperator andOperator = new AndOperator();
    andOperator.addFilter(new PropertyIsEqualTo("amt", "62500"));
    andOperator.addFilter(new PropertyIsLike("py", "40*"));
    filter.addLogicalOperator(andOperator);

    query.setFilter(filter);

    GetFeature getFeature = new GetFeature(query);

    String body = objectMapper.writeValueAsString(getFeature);

    System.out.println(geoRepository.query(body));
  }

}