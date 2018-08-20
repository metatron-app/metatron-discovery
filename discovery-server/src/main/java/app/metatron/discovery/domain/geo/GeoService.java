package app.metatron.discovery.domain.geo;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.geo.query.model.GeoQuery;
import app.metatron.discovery.domain.geo.query.model.GetFeature;

@Component
public class GeoService {

  private static final Logger LOGGER = LoggerFactory.getLogger(GeoRepository.class);

  @Autowired
  GeoRepository geoRepository;

  ObjectMapper xmlMapper;

  @PostConstruct
  public void setup() {
    JacksonXmlModule xmlModule = new JacksonXmlModule();
    xmlModule.setDefaultUseWrapper(false);
    xmlMapper = new XmlMapper(xmlModule);
    xmlMapper.enable(SerializationFeature.INDENT_OUTPUT);
    xmlMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
  }

  public String search(SearchQueryRequest searchQueryRequest) {

    GeoQuery geoQuery = GeoQuery.builder(searchQueryRequest.getDataSource())
                                .projections(searchQueryRequest.getProjections())
                                .filters(searchQueryRequest.getFilters())
                                .build();

    String geoQueryStr = null;
    try {
      geoQueryStr = xmlMapper.writeValueAsString(new GetFeature(geoQuery));
    } catch (JsonProcessingException e) {
      e.printStackTrace();
    }

    LOGGER.debug("Geo Server Query : {}", geoQueryStr);

    return geoRepository.query(geoQueryStr);
  }
}
