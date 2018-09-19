package app.metatron.discovery.domain.geo;

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.StringJoiner;

import javax.annotation.PostConstruct;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.datasource.data.SearchQueryRequest;
import app.metatron.discovery.domain.geo.query.model.GeoQuery;
import app.metatron.discovery.domain.geo.query.model.GetFeature;
import app.metatron.discovery.domain.geo.query.model.extension.AggregationExtension;
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
                                    .limit(searchQueryRequest.getLimits())
                                    .build();

        resultJoiner.add(query(geoQuery));
      }
    } else {
      GeoQuery geoQuery = GeoQuery.builder(searchQueryRequest.getDataSource())
                                  .projections(searchQueryRequest.getProjections())
                                  .filters(searchQueryRequest.getFilters())
                                  .limit(searchQueryRequest.getLimits())
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

    JsonNode node = geoRepository.query(geoQueryStr, JsonNode.class);

    customizeResult(node, geoQuery.getProjectionMapper(), geoQuery.getExtension() instanceof AggregationExtension);

    return GlobalObjectMapper.writeValueAsString(node);
  }

  public void customizeResult(JsonNode result, Map<String, String> projectionMapper, boolean addMinMax) {

    JsonNode features = result.get("features");

    List<Double> forMinMaxValues = Lists.newArrayList();
    ObjectNode newPropertiesNode = null;
    for(JsonNode feature : features) {
      ObjectNode featureNode = (ObjectNode) feature;
      JsonNode propertiesNode = feature.get("properties");
      newPropertiesNode = GlobalObjectMapper.getDefaultMapper().createObjectNode();
      for (String key : projectionMapper.keySet()) {
        JsonNode value = propertiesNode.get(key);
        if(addMinMax && key.startsWith("__d") && value != null) {
          forMinMaxValues.add(value.asDouble(0.0));
        }
        newPropertiesNode.set(projectionMapper.get(key), propertiesNode.get(key));
      }

      featureNode.set("properties", newPropertiesNode);
    }

    if(addMinMax) {
      ObjectNode minMaxNode = GlobalObjectMapper.getDefaultMapper().createObjectNode();
      addMinMax(forMinMaxValues, minMaxNode);
      ((ObjectNode) result).set("valueRange", minMaxNode);
    }

  }

  public void addMinMax(List<Double> values, ObjectNode minMaxNode) {

    Double minLimit = Double.NEGATIVE_INFINITY;
    Double maxLimit = Double.POSITIVE_INFINITY;
    Double min = maxLimit;
    Double max = minLimit;

    for (int i = 0; i < values.size(); i++) {
      Double target = values.get(i);

      if (target <= maxLimit && target >= minLimit) {
        if (target > max) {
          max = target;
        }
        if (target < min) {
          min = target;
        }
      }
    }

    minMaxNode.put("maxValue", max);
    minMaxNode.put("minValue", min);
  }



}
