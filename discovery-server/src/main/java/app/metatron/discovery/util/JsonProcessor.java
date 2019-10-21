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

package app.metatron.discovery.util;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ibm.icu.text.CharsetDetector;
import com.ibm.icu.text.CharsetMatch;

import org.datanucleus.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.FileValidationResponse;
import app.metatron.discovery.domain.datasource.ingestion.IngestionDataResultResponse;

public class JsonProcessor {

  private static Logger LOGGER = LoggerFactory.getLogger(JsonProcessor.class);

  private List<String> columnNames;
  private List<String[]> rows;
  private Long totalRows = 0L;
  private Long maxRowCnt = 100L;

  public JsonProcessor maxRowCount(Long maxRowCnt) {
    this.maxRowCnt = maxRowCnt;

    return this;
  }

  public JsonProcessor parse(List<String> lines) {
    ObjectMapper mapper = new ObjectMapper();
    String line;

    try {
      columnNames = Lists.newArrayList();
      rows = Lists.newArrayList();
      StringBuffer sb = new StringBuffer();
      for (int i = 0; i < lines.size(); i++) {
        Map<String, Object> jsonRow;
        line  = lines.get(i);
        //System.out.println(line);
        try {
          sb.append(line);
          jsonRow = mapper.readValue(sb.toString(), new TypeReference<Map<String, Object>>() {});
          sb.delete(0, sb.length());
        } catch (JsonParseException e) {
          LOGGER.debug("Incomplete JSON string.", e);
          continue;
        }

        totalRows++;

        if (rows.size() == maxRowCnt) {
          break;
        }

        for (String jsonKey : jsonRow.keySet()) {
          if (!columnNames.contains(jsonKey)) {
            columnNames.add(jsonKey);
          }
        }

        int colCnt = columnNames.size();

        String[] row = new String[colCnt];
        for (int j = 0; j < colCnt; j++) {
          String colName = columnNames.get(j);
          if (jsonRow.containsKey(colName)) {
            Object obj = jsonRow.get(colName);
            row[j] = (obj == null) ? null : obj.toString();
          }
        }
        rows.add(row);
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
    return this;
  }

  public JsonProcessor parse(String strUri) {
    File file;
    FileInputStream fis;
    FileInputStream dfis;

    try {
      file = new File(new URI(strUri));
      fis = new FileInputStream(file);
      dfis = new FileInputStream(file);
    } catch (FileNotFoundException | URISyntaxException e) {
      throw new JsonProcessor.JsonException("Cannot read file : " + strUri, e);
    }

    CharsetDetector detector;
    CharsetMatch match;
    String charset;

    try {
      byte[] byteData = new byte[dfis.available()];
      dfis.read(byteData);
      dfis.close();

      detector = new CharsetDetector();

      detector.setText(byteData);
      match = detector.detect();
      charset = match.getName();

      if (!Charset.isSupported(charset)) {
        throw new JsonException("Unsupported character set : " + charset);
      }

    } catch (IOException e) {
      throw new JsonProcessor.JsonException("Fail to read json file : " + strUri, e);
    }

    try {
      String line;
      ObjectMapper mapper = new ObjectMapper();

      columnNames = Lists.newArrayList();
      rows = Lists.newArrayList();
      StringBuffer sb = new StringBuffer();

      InputStreamReader inputStreamReader = new InputStreamReader(fis, charset);
      BufferedReader br = new BufferedReader(inputStreamReader);
      while ((line = br.readLine()) != null) {
        Map<String, Object> jsonRow = null;
        System.out.println(line);
        try {
          sb.append(line);
          jsonRow = mapper.readValue(sb.toString(), new TypeReference<Map<String, Object>>() {});
          sb.delete(0, sb.length());
        } catch (JsonParseException e) {
          LOGGER.debug("Incomplete JSON string.", e);
          continue;
        }

        totalRows++;

        if (rows.size() == maxRowCnt) {
          break;
        }

        for (String jsonKey : jsonRow.keySet()) {
          if (!columnNames.contains(jsonKey)) {
            columnNames.add(jsonKey);
          }
        }

        int colCnt = columnNames.size();

        String[] row = new String[colCnt];
        for (int j = 0; j < colCnt; j++) {
          String colName = columnNames.get(j);
          if (jsonRow.containsKey(colName)) {
            Object obj = jsonRow.get(colName);
            row[j] = (obj == null) ? null : obj.toString();
          }
        }
        rows.add(row);
      }
    } catch (IOException e) {
      e.printStackTrace();
    }

    return this;
  }


  public IngestionDataResultResponse ingestionDataResultResponse() {
    try {
      List<Field> fields = makeField();

      List<Map<String, Object>> resultRows = Lists.newArrayList();
      Map<String, Object> rowMap = null;
      for (String[] row : rows) {
        rowMap = Maps.newLinkedHashMap();
        for (int i = 0; i < fields.size(); i++) {
          if (i < row.length) {
            rowMap.put(fields.get(i).getName(), row[i]);
          }
        }
        resultRows.add(rowMap);
      }

      FileValidationResponse isParsable = new FileValidationResponse(true);

      return new IngestionDataResultResponse(fields, resultRows, totalRows, isParsable);
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  private List<Field> makeField() {
    List<Field> fields = Lists.newArrayList();

    for (int i = 0; i < columnNames.size(); i++) {
      String columnName = columnNames.get(i);
      if (StringUtils.isEmpty(columnName)) {
        throw new JsonProcessor.JsonException("Invalid header name: null");
      }
      fields.add(new Field(columnName, DataType.STRING, i + 1));
    }

    Field.checkDuplicatedField(fields, false);
    return fields;
  }

  public static class JsonException extends MetatronException {

    public JsonException(String message) {
      super(message);
    }

    public JsonException(String message, Throwable cause) {
      super(message, cause);
    }
  }

}
