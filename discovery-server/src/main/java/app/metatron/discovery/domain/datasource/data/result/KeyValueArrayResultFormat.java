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

package app.metatron.discovery.domain.datasource.data.result;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.annotation.JsonTypeName;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StopWatch;
import org.supercsv.cellprocessor.Optional;
import org.supercsv.cellprocessor.ParseDouble;
import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvMapReader;
import org.supercsv.io.ICsvMapReader;
import org.supercsv.prefs.CsvPreference;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.datasource.data.forward.CsvResultForward;
import app.metatron.discovery.domain.datasource.data.forward.JsonResultForward;
import app.metatron.discovery.domain.datasource.data.forward.ParquetResultForward;
import app.metatron.discovery.domain.datasource.data.forward.ResultForward;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;

/**
 * Created by kyungtaak on 2016. 7. 18..
 */
@JsonTypeName("kvarray")
public class KeyValueArrayResultFormat extends SearchResultFormat {

  private static Logger LOGGER = LoggerFactory.getLogger(KeyValueArrayResultFormat.class);

  List<String> keyFields;

  String paramField;

  String valueField;

  List<String> params;

  String columnDelimeter;

  public KeyValueArrayResultFormat() {
  }

  public KeyValueArrayResultFormat(List<String> keyFields, String paramField,
                                   String valueField, List<String> params,
                                   String columnDelimeter) {
    this.keyFields = keyFields;
    this.paramField = paramField;
    this.valueField = valueField;
    this.params = params;
    this.columnDelimeter = columnDelimeter;
  }

  @Override
  public Object makeResult(JsonNode root) {
    JsonNode objectNode = null;
    if(checkFileResult(root)) {
      URI resultFileURI = getResultFileURI(root);
      ResultForward resultForward = request.getResultForward();
      try {
        if (resultForward instanceof CsvResultForward) {
          objectNode = readCsvFile(resultFileURI);
        } else if (resultForward instanceof JsonResultForward) {
          objectNode = readJsonFile(resultFileURI);
        } else if (resultForward instanceof ParquetResultForward) {
          // TODO: Druid에 준비가 되면 작업
        } else {
          throw new QueryTimeExcetpion("Type of result is file, you must set 'resultForward' property.");
        }
      } finally {
        if(resultForward.getRemoveFile() && FileUtils.deleteQuietly(new File(resultFileURI))) {
          LOGGER.info("Successfully delete local file({})", resultFileURI.toString());
        }
      }
    } else {
      objectNode = request.makeResult(root);
    }

    StopWatch stopWatch = new StopWatch();
    stopWatch.start("Raw Pivot");
    boolean pivoted = false;
    if(StringUtils.isEmpty(paramField) || StringUtils.isEmpty(valueField)) {
      pivoted = true;
    }

    Map<String, List<Double>> resultMap = Maps.newTreeMap();
    for (JsonNode node : objectNode) {
      String key = makeKeyValue(node, keyFields);

      if (resultMap.containsKey(key)) {
        // 기존 Key Based 셋팅
        List<Double> measures = resultMap.get(key);
        setParamValue(node, measures, pivoted);
      } else {
        // Measure 별 신규 값 셋팅
        List<Double> measures = initValueList(params.size());
        setParamValue(node, measures, pivoted);

        // 신규 Key/Value 생성
        resultMap.put(key, measures);
      }
    }
    stopWatch.stop();

    LOGGER.info("Pivot time : {}", stopWatch.toString());

    return resultMap;
  }

  /**
   * Key/Value 모델에서 Key 생성, 구분자를 사용하여 각 기 구성 속성간 연결
   *
   * @param node
   * @param keyFieldNames
   * @return
   */
  public String makeKeyValue(JsonNode node, List<String> keyFieldNames) {

    StringJoiner joiner = new StringJoiner(columnDelimeter);

    for (String name : keyFieldNames) {
      JsonNode keyNode = node.get(name);
      if(keyNode == null) {
        joiner.add("NULL");
      } else {
        joiner.add(keyNode.asText());
      }
    }

    return joiner.toString();
  }

  public List<Double> initValueList(int size) {

    List<Double> results = Lists.newArrayListWithCapacity(size);
    for (int i = 0; i < size; i++) {
      results.add(Double.NaN);
    }

    return results;
  }

  /**
   * @param node
   * @param paramValues
   */
  public void setParamValue(JsonNode node,
                            List<Double> paramValues,
                            boolean pivot) {
    if (pivot) {
      for (int i = 0; i < params.size(); i++) {
        Double value = node.get(params.get(i)).asDouble();
        if (value != null) {
          paramValues.set(i, value);
        }
      }
    } else {
      if(!(node.has(paramField) && node.has(valueField))) {
        throw new IllegalArgumentException("Invalid field name of param name/value.");
      }
      String paramName = node.get(paramField).asText();
      int index = params.indexOf(paramName);

      if (index > -1) {
        paramValues.set(index, node.get(valueField).asDouble());
      }

    }

  }

  private JsonNode readJsonFile(URI fileUrl) {
    ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();
    JsonNode resultNode;
    try {
      resultNode = mapper.readValue(new File(fileUrl), JsonNode.class);
    } catch (IOException e) {
      throw new RuntimeException("Fail to load result file.");
    }
    return resultNode;
  }

  private JsonNode readCsvFile(URI fileUrl) {

    ArrayNode resultNode = GlobalObjectMapper.getDefaultMapper().createArrayNode();
    ICsvMapReader mapReader = null;
    try {
      mapReader = new CsvMapReader(new FileReader(new File(fileUrl)), CsvPreference.STANDARD_PREFERENCE);

      // the header columns are used as the keys to the Map
      String[] headers = getHeaders();
      CellProcessor[] processors = getProcessors();

      Map<String, Object> contentsMap;
      while( (contentsMap = mapReader.read(headers, processors)) != null ) {
        LOGGER.debug(String.format("lineNo=%s, rowNo=%s, customerMap=%s", mapReader.getLineNumber(),
                mapReader.getRowNumber(), contentsMap));
        resultNode.add(GlobalObjectMapper.getDefaultMapper().convertValue(contentsMap, JsonNode.class));
      }

    } catch (Exception e) {
      LOGGER.error("Fail to read result file : {}", e.getMessage());
      throw new RuntimeException("Fail to read result file.");
    } finally {
      if( mapReader != null ) {
        try {
          mapReader.close();
        } catch (IOException e) {}
      }
    }

    return resultNode;
  }

  private String[] getHeaders() {
    List<String> headerList = request.getProjections().stream()
            .map(field -> field.getAlias())
            .collect(Collectors.toList());
    return headerList.toArray(new String[0]);
  }

  private CellProcessor[] getProcessors() {

    List<Field> projections = request.getProjections();

    List<CellProcessor> processorList = Lists.newArrayList();
    for(Field field : projections) {
      CellProcessor cell = null;
      if(field instanceof MeasureField) {
        cell = new Optional(new ParseDouble());
      } else {
        cell = new Optional();
      }
      processorList.add(cell);
    }

    return processorList.toArray(new CellProcessor[processorList.size()]);
  }

  public List<String> getKeyFields() {
    return keyFields;
  }

  public void setKeyFields(List<String> keyFields) {
    this.keyFields = keyFields;
  }

  public String getParamField() {
    return paramField;
  }

  public void setParamField(String paramField) {
    this.paramField = paramField;
  }

  public String getValueField() {
    return valueField;
  }

  public void setValueField(String valueField) {
    this.valueField = valueField;
  }

  public List<String> getParams() {
    return params;
  }

  public void setParams(List<String> params) {
    this.params = params;
  }

  public String getColumnDelimeter() {
    return columnDelimeter;
  }

  public void setColumnDelimeter(String columnDelimeter) {
    this.columnDelimeter = columnDelimeter;
  }
}
