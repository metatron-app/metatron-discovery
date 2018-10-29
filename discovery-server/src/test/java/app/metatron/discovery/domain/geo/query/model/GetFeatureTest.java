package app.metatron.discovery.domain.geo.query.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import org.junit.Before;
import org.junit.Test;

import app.metatron.discovery.domain.geo.query.model.filter.AndOperator;
import app.metatron.discovery.domain.geo.query.model.filter.GeoFilter;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsEqualTo;
import app.metatron.discovery.domain.geo.query.model.filter.PropertyIsLike;

public class GetFeatureTest {

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
  public void convertXml() throws JsonProcessingException {

    GeoQuery query = new GeoQuery("metatron:real_price", "EPSG:4326");
//    query.addPropertyName(new PropertyName("test1"));
//    query.addPropertyName(new PropertyName("test2"));
//    query.addPropertyName(new PropertyName("test3"));
    GeoFilter filter = new GeoFilter();
    AndOperator andOperator = new AndOperator();
    andOperator.addFilter(new PropertyIsEqualTo("amt", "62500"));
    andOperator.addFilter(new PropertyIsLike("py", "40*"));
    filter.addLogicalOperator(andOperator);

    query.setFilter(filter);

    GetFeature getFeature = new GetFeature(query);

    String xml = objectMapper.writeValueAsString(getFeature);

    System.out.println(xml);
  }

  @Test
  public void convertFilterXml() throws JsonProcessingException {
    GeoFilter filter = new GeoFilter();
    filter.addFilter(new PropertyIsEqualTo("a", "a"));
    filter.addFilter(new PropertyIsEqualTo("b", "b"));
    filter.addFilter(new PropertyIsLike("a", "a"));

    String xml = objectMapper.writeValueAsString(filter);

    System.out.println(xml);
  }


}