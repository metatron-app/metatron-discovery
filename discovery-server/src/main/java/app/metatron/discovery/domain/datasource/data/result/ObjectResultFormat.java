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
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.MatrixResponse;
import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.QueryHistoryTeller;
import app.metatron.discovery.domain.datasource.data.QueryTimeExcetpion;
import app.metatron.discovery.domain.datasource.data.forward.CsvResultForward;
import app.metatron.discovery.domain.datasource.data.forward.JsonResultForward;
import app.metatron.discovery.domain.datasource.data.forward.ParquetResultForward;
import app.metatron.discovery.domain.datasource.data.forward.ResultForward;
import app.metatron.discovery.domain.workbook.configurations.field.Field;
import app.metatron.discovery.domain.workbook.configurations.field.MeasureField;

import static app.metatron.discovery.domain.datasource.DataSource.ConnectionType.ENGINE;

/**
 * Created by kyungtaak on 2016. 7. 18..
 */
@JsonTypeName("object")
public class ObjectResultFormat extends SearchResultFormat {

  private static final Logger LOGGER = LoggerFactory.getLogger(ObjectResultFormat.class);

  ResultType resultType;

  public ObjectResultFormat() {
    // Empty Constructor
  }

  public ObjectResultFormat(DataSource.ConnectionType connType) {
    super(connType);
  }

  @Override
  public Object makeResult(JsonNode node) {

    if(checkFileResult(node)) {
      URI resultFileURI = getResultFileURI(node);

      ResultForward resultForward = request.getResultForward();
      try {
        if (resultForward instanceof CsvResultForward) {
          return readCsvFile(resultFileURI);
        } else if (resultForward instanceof JsonResultForward) {
          return readJsonFile(resultFileURI);
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

      if(connType == ENGINE) {

        JsonNode resultNode = request.makeResult(node);
        /* for history */ QueryHistoryTeller.setResultCount(resultNode.size() * 1L);

        // TODO: Looping 을 줄이도록 최적화 필요, makeResult 에 함께 넣어보자
        if(resultType == ResultType.MATRIX) {
          return toResultSetByMatrixType(resultNode);
        } else {
          return resultNode;
        }
      } else {
        /* for history */ QueryHistoryTeller.setResultCount((long) node.size());
        return node;
      }

    }

    return null;
  }

  /**
   * 내부에서 관리하는 Matrix 타입 방식으로 전달
   */
  public MatrixResponse toResultSetByMatrixType(JsonNode node) {

    List<String> rows = Lists.newArrayList();
    Map<String, List<Object>> valueMap = Maps.newLinkedHashMap();

    for(JsonNode aNode : node) {
      Iterator<Map.Entry<String, JsonNode>> fields = aNode.fields();

      while (fields.hasNext()) {
        Map.Entry<String, JsonNode> nodeMap = fields.next();
        if(valueMap.containsKey(nodeMap.getKey())) {
          valueMap.get(nodeMap.getKey()).add(nodeMap.getValue());
        } else {
          List values = Lists.newArrayList();
          values.add(nodeMap.getValue());

          valueMap.put(nodeMap.getKey(), values);
        }
      }
    }

    LOGGER.info("Row number of matrix results : {}", rows.size());

    return new MatrixResponse<>(rows, valueMap);
  }

  protected List<Map<String, Object>> readJsonFile(URI fileUrl) {
    ObjectMapper mapper = GlobalObjectMapper.getDefaultMapper();
    JavaType type = mapper.getTypeFactory().constructCollectionType(List.class, Map.class);
    List<Map<String,Object>> result = null;

    // 값이 없는 경우 file이 존재하지 않는 경우라고 간주하고 처리
    File file = new File(fileUrl);
    if(!file.exists()) {
      return Lists.newArrayList();
    }

    try {
      result = mapper.readValue(new File(fileUrl), type);
    } catch (IOException e) {
      throw new RuntimeException("Fail to result file.");
    }

    LOGGER.info("Query Result Count : " + result.size());

    return result;
  }

  protected List<Map<String, Object>> readCsvFile(URI fileUrl) {

    List<Map<String, Object>> result = Lists.newArrayList();
    ICsvMapReader mapReader = null;
    try {
      mapReader = new CsvMapReader(new FileReader(new File(fileUrl)), CsvPreference.STANDARD_PREFERENCE);

      // the header columns are used as the keys to the Map
      String[] headers = getHeaders();
      CellProcessor[] processors = getProcessors();

      Map<String, Object> contentsMap;
      while( (contentsMap = mapReader.read(headers, processors)) != null ) {
        result.add(contentsMap);
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

    LOGGER.info("Query Result Count : " + result.size());

    return result;
  }

  public ResultType getResultType() {
    return resultType;
  }

  public void setResultType(ResultType resultType) {
    this.resultType = resultType;
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

}
