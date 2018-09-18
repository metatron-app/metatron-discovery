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

import java.util.List;
import java.util.StringJoiner;

import javax.annotation.PostConstruct;

import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.geo.query.model.GeoQuery;
import app.metatron.discovery.domain.geo.query.model.GetFeature;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.GeoShelf;

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

    StringJoiner resultJoiner = new StringJoiner(",", "[", "]");
    if(searchQueryRequest.getShelf() instanceof GeoShelf) {
      GeoShelf geoShelf = (GeoShelf) searchQueryRequest.getShelf();
      for(List<Field> fields : geoShelf.getLayers()) {
        GeoQuery geoQuery = GeoQuery.builder(searchQueryRequest.getDataSource())
                                    .projections(fields)
                                    .filters(searchQueryRequest.getFilters())
                                    .build();

        resultJoiner.add(query(geoQuery));
      }
    } else {
      GeoQuery geoQuery = GeoQuery.builder(searchQueryRequest.getDataSource())
                                  .projections(searchQueryRequest.getProjections())
                                  .filters(searchQueryRequest.getFilters())
                                  .build();

      resultJoiner.add(query(geoQuery));
    }

    return resultJoiner.toString();
  }

  private String query(GeoQuery geoQuery) {
    String geoQueryStr = null;

    GetFeature getFeature = new GetFeature(geoQuery);
    try {
      geoQueryStr = xmlMapper.writeValueAsString(getFeature);
    } catch (JsonProcessingException e) {
      e.printStackTrace();
    }

    LOGGER.debug("Geo Server Query : {}", geoQueryStr);
    if(geoQuery.getExtension() != null) {
      LOGGER.debug("Geo Server Query = Druid : {}", geoQuery.getExtension().toParamString());
    }

    return geoRepository.query(geoQueryStr);
  }
}
