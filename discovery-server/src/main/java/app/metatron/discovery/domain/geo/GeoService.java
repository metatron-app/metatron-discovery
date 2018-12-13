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
import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;

import org.apache.commons.collections.CollectionUtils;
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
import app.metatron.discovery.domain.engine.EngineProperties;
import app.metatron.discovery.domain.geo.model.GeoDataStore;
import app.metatron.discovery.domain.geo.query.model.GeoQuery;
import app.metatron.discovery.domain.geo.query.model.GetFeature;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.widget.shelf.GeoShelf;

@Component
public class GeoService {

  private static final Logger LOGGER = LoggerFactory.getLogger(GeoRepository.class);

  @Autowired
  GeoRepository geoRepository;

  @Autowired
  GeoServerProperties geoServerProperties;

  @Autowired
  EngineProperties engineProperties;

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
    if (searchQueryRequest.getShelf() instanceof GeoShelf) {
      GeoShelf geoShelf = (GeoShelf) searchQueryRequest.getShelf();
      for (List<Field> fields : geoShelf.getLayers()) {
        GeoQuery geoQuery = GeoQuery.builder(searchQueryRequest.getDataSource())
                                    .initVirtualColumns(searchQueryRequest.getUserFields())
                                    .projections(fields)
                                    .filters(searchQueryRequest.getFilters())
                                    .limit(searchQueryRequest.getLimits())
                                    .build();

        resultJoiner.add(query(geoQuery));
      }
    } else {
      GeoQuery geoQuery = GeoQuery.builder(searchQueryRequest.getDataSource())
                                  .initVirtualColumns(searchQueryRequest.getUserFields())
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
    if (geoQuery.getExtension() != null) {
      LOGGER.debug("Geo Server Query = Druid : {}", geoQuery.getExtension().toParamString());
    }

    JsonNode node = geoRepository.query(geoQueryStr, JsonNode.class);

    customizeResult(node, geoQuery.getProjectionMapper(), geoQuery.getMinMaxFields());

    return GlobalObjectMapper.writeValueAsString(node);
  }

  public void createDataStore(String name) {
    String broker = engineProperties.getHostnameByType("broker", true);

    Map<String, Object> requestMap = Maps.newLinkedHashMap();
    requestMap.put("dataStore", new GeoDataStore(name, 5, -1, broker));


    geoRepository.create(geoServerProperties.getRestDataStoreUrl(),
                         GlobalObjectMapper.writeValueAsString(requestMap));

  }

  public void deleteDataStore(String name) {
    geoRepository.delete(geoServerProperties.getRestDataStoreUrl(name) + "?recurse=true");
  }

  public void createFeatureType(String storeName) {

    Map<String, Object> requestMap = Maps.newLinkedHashMap();

    Map<String, Object> featureMap = Maps.newLinkedHashMap();
    featureMap.put("name", storeName);
    featureMap.put("nativeName", storeName);
    featureMap.put("metadata", Maps.newHashMap());

    requestMap.put("featureType", featureMap);

    geoRepository.create(geoServerProperties.getRestFeatureTypeUrl(storeName),
                         GlobalObjectMapper.writeValueAsString(requestMap));

  }


  public void customizeResult(JsonNode result, Map<String, String> projectionMapper, List<String> minMaxFields) {

    JsonNode features = result.get("features");

    // Intermediate variables for processing min / max value by each measure value
    List<List<Double>> forMinMaxValues = Lists.newArrayList();
    if (CollectionUtils.isNotEmpty(minMaxFields)) {
      minMaxFields.forEach(o -> forMinMaxValues.add(Lists.newArrayList()));
    }

    ObjectNode newPropertiesNode = null;
    for (JsonNode feature : features) {
      ObjectNode featureNode = (ObjectNode) feature;
      JsonNode propertiesNode = feature.get("properties");
      newPropertiesNode = GlobalObjectMapper.getDefaultMapper().createObjectNode();
      for (String key : projectionMapper.keySet()) {
        JsonNode value = propertiesNode.get(key);
        String mappedFieldName = projectionMapper.get(key);
        int minMaxIdx = minMaxFields.indexOf(mappedFieldName);
        if (minMaxIdx != -1) {
          forMinMaxValues.get(minMaxIdx).add(value.asDouble(0.0));
        }
        newPropertiesNode.set(mappedFieldName, propertiesNode.get(key));
      }

      featureNode.set("properties", newPropertiesNode);
    }

    ObjectNode minMaxNode = GlobalObjectMapper.getDefaultMapper().createObjectNode();
    ((ObjectNode) result).set("valueRange", minMaxNode);

    if (CollectionUtils.isNotEmpty(minMaxFields)) {
      for (int i = 0; i < minMaxFields.size(); i++) {
        ObjectNode minMaxFieldNode = GlobalObjectMapper.getDefaultMapper().createObjectNode();
        addMinMax(forMinMaxValues.get(i), minMaxFieldNode);
        minMaxNode.set(minMaxFields.get(i), minMaxFieldNode);
      }
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
