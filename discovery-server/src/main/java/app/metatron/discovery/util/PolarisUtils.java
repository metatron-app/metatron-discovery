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

package app.metatron.discovery.util;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.MetatronException;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.monitorjbl.xlsx.StreamingReader;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.supercsv.io.CsvListReader;
import org.supercsv.io.CsvListWriter;
import org.supercsv.prefs.CsvPreference;

import java.io.*;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Created by kyungtaak on 2016. 2. 25..
 */
public class PolarisUtils {

  private static final Logger LOGGER = LoggerFactory.getLogger(PolarisUtils.class);

  public static final Pattern PATTERN_PATH_PARAM = Pattern.compile("\\/\\{([^/]+)\\}");

  public static final Pattern PATTERN_TEXT_FORMAT = Pattern.compile("\\%[0-9$]*s");

  public static final Pattern PATTERN_NUMBER_FORMAT = Pattern.compile("\\%[0-9]*d");

  public static final Pattern PATTERN_MEM_SIZE_FORMAT = Pattern.compile("^([0-9])+\\h?([mMgG]{1})$");

  public static final Pattern PATTERN_TIMES_FORMAT = Pattern.compile("^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$");

  public static final Pattern PATTERN_SPECIAL_REGEX_CHARS = Pattern.compile("[{}()\\[\\].+*?^$\\\\|]");

  public static final Pattern PATTERN_TIMEFORMAT_SPECIAL_CHARS = Pattern.compile("[']");

  public static final Pattern PATTERN_CHECK_HANGUL = Pattern.compile("[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]");

  public static final Pattern PATTERN_SQL_LIKE_WILDCARD_CHARS = Pattern.compile("[%_]|\\[[^]]*\\]|[^%_\\[]+|[\\s]*");

  public static final String COPY_OF_PREFIX = "Copy of ";

  public static final char[] PASSWORD_CHARS = new char[] {'A','B','C','D','E','F','G','H','I','J','K','L','M','N',
      'O','P','Q','R','S','T','U','V','W','X','Y','Z','!','@','#','$','0','1','2','3','4','5','6','7','8','9'};

  public static final char[] RANDOM_CHARS = new char[] {'a','b','c','d','e','f','g','h','i','j','k','l','m','n',
      'o','p','q','r','s','t','u','v','w','x','y','z'};

  /**
   * Object 객체를 String 으로 변환합니다.
   * - null 이면 빈값("") 로 대체
   *
   * @param object
   * @return
   */
  public static String objectToString(Object object) {
    return objectToString(object, "");
  }

  /**
   * Object 객체를 String 으로 변환합니다.
   *
   * Default Value 가 존재하는 경우,
   *   - null 이면 Default Value 로 대체
   *   - String 타입이고 빈값("") 이면 Default Value 로 대체
   *
   * @param object
   * @param defaultValue
   * @return
   */
  public static String objectToString(Object object, String defaultValue) {
    if(object == null) {
      return defaultValue;
    }

    String result = String.valueOf(object);

    if(defaultValue == null) {
      return result;
    }

    return StringUtils.isEmpty(result) ? defaultValue : result;
  }

  public static boolean match(Pattern p, String str) {
    return p.matcher(str).find();
  }

  public static List<String> findPathParams(String url) {

    Matcher m = PATTERN_PATH_PARAM.matcher(url);

    List<String> pathParams = Lists.newArrayList();
    while (m.find()) {
      pathParams.add(m.group(1));
    }

    return pathParams;
  }


  public static List<Integer> findHourMinute(String time) {

    if (StringUtils.isEmpty(time)) {
      return Lists.newArrayList(0, 0);
    }

    Matcher m = PATTERN_TIMES_FORMAT.matcher(time.trim());
    if (!m.find()) {
      return Lists.newArrayList(0, 0);
    }

    return Lists.newArrayList(Integer.valueOf(m.group(1)), Integer.valueOf(m.group(2)));
  }


  public static List<String> findMatchedValues(String str, Pattern p) {

    Matcher m = p.matcher(str);

    List<String> pathParams = Lists.newArrayList();
    while (m.find()) {
      pathParams.add(m.group(1));
    }

    return pathParams;
  }

  public static boolean findPattern(String str, String patternStr) {
    return findPattern(str, Pattern.compile(patternStr));
  }

  public static boolean findPattern(String str, Pattern p) {
    Matcher m = p.matcher(str);
    return m.find();
  }

  public static Map<String, String> splitToMap(String source, String entriesSeparator, String keyValueSeparator) {
    Map<String, String> map = Maps.newHashMap();
    String[] entries = source.split(entriesSeparator);
    for (String entry : entries) {
      if (StringUtils.isNotEmpty(entry) && entry.contains(keyValueSeparator)) {
        String[] keyValue = StringUtils.split(StringUtils.trim(entry), keyValueSeparator,2);
        map.put(StringUtils.trim(keyValue[0]), StringUtils.trim(keyValue[1]));
      }
    }
    return map;
  }

  public static List<Map<String, String>> dataLoadFromTempFile(File file) {

    List<Map<String, String>> resultSet = Lists.newArrayList();

    // 파일명
    String fileName = file.getName();
    // 파일 확장자
    String extensionType = FilenameUtils.getExtension(fileName);

    //첫 행에 스키마 정보가 있는다는 전제로 시작
    // Excel 2007 ~
    if ("xlsx".equals(extensionType)) {
      //XSSFWorkbook wb = null;
      Workbook wb = null;
      try {
        // wb = new XSSFWorkbook(new FileInputStream(file));
        InputStream is = new FileInputStream(file);
        wb = StreamingReader.builder()
                .rowCacheSize(100)
                .bufferSize(4096)
                .open(is);
      } catch (IOException e) {
        throw new RuntimeException("Data file load error. - " + file.getAbsolutePath());
      }
      // 첫 시트 내용만 처리
      //XSSFSheet sheet = wb.getSheetAt(0);
      Sheet sheet = wb.getSheetAt(0);
      resultSet = getResultSetFromSheet(sheet);
    }
    //엑셀 97~2003
    else if ("xls".equals(extensionType)) {
      HSSFWorkbook wb = null;
      try {
        wb = new HSSFWorkbook(new FileInputStream(file));
      } catch (IOException e) {
        throw new RuntimeException("Data file load error. - " + file.getAbsolutePath());
      }
      // 첫 시트 내용만 처리
      HSSFSheet sheet = wb.getSheetAt(0);
      resultSet = getResultSetFromSheet(sheet);
    }
    // CSV 파일 읽기
    else if ("csv".equals(extensionType)) {
      CsvMapper mapper = new CsvMapper();
      CsvSchema schema = CsvSchema.emptySchema().withHeader(); // use first row as header; otherwise defaults are fine
      MappingIterator<Map<String, String>> it = null;
      try {
        it = mapper.readerFor(Map.class)
                .with(schema)
                .readValues(file);
      } catch (IOException e) {
        throw new RuntimeException("Data file load error. - " + file.getAbsolutePath());
      }
      while (it.hasNext()) {
        resultSet.add(it.next());
      }

    } else {
      throw new IllegalArgumentException("지원하지 않는 파일형식.");
    }

    return resultSet;
  }

  public static List<Map<String, String>> getResultSetFromSheet(Sheet sheet) {
    return getResultSetFromSheet(sheet, -1);
  }

  public static List<Map<String, String>> getResultSetFromSheet(Sheet sheet, int limit) {

    List<Map<String, String>> resultSet = Lists.newArrayList();
    List<String> columns = Lists.newArrayList();

    int rowCnt = 0;
    for (Row row : sheet) {
      Map<String, String> rowMap = Maps.newTreeMap();
      for (Cell cell : row) { // 열구분
        String value = getCellValue(cell);
        if (rowCnt == 0) {
          columns.add(StringUtils.isEmpty(value) ? "col" + cell.getColumnIndex() : value);
        } else {
          int columnIdx = cell.getColumnIndex();
          if(columnIdx<0 || columns.size()<=columnIdx) {
            // drop
          } else {
            rowMap.put(columns.get(cell.getColumnIndex()), value);
          }
        }
      }

      if (rowCnt > 0) {
        resultSet.add(rowMap);
      }
      rowCnt++;

      if (limit > 0 && rowCnt > limit) {
        break;
      }

    }

    return resultSet;
  }

  public static String getCellValue(Cell cell) {

    Object cellValue = null;

    switch (cell.getCellType()) {
      case Cell.CELL_TYPE_FORMULA:
        switch(cell.getCachedFormulaResultType()) {
          case Cell.CELL_TYPE_NUMERIC:
            if (DateUtil.isCellDateFormatted(cell)) { //날짜데이터 포멧설정
              Date date = cell.getDateCellValue();
              cellValue = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(date);
            } else {
              cellValue = String.valueOf(cell.getNumericCellValue());
            }
            break;
          case Cell.CELL_TYPE_STRING:  cellValue = cell.getStringCellValue().toString();  break;
          case Cell.CELL_TYPE_BLANK:   cellValue = cell.toString();            break;
          case Cell.CELL_TYPE_BOOLEAN: cellValue = cell.getBooleanCellValue(); break;
          case Cell.CELL_TYPE_ERROR:   cellValue = cell.getErrorCellValue();   break;
        }
        break;
      case Cell.CELL_TYPE_NUMERIC:
        if (DateUtil.isCellDateFormatted(cell)) { //날짜데이터 포멧설정
          Date date = cell.getDateCellValue();
          cellValue = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").format(date);
        } else {
          DataFormatter df = new DataFormatter();
          String value = df.formatCellValue(cell);
          cellValue = String.valueOf(value);
        }
        break;
      case Cell.CELL_TYPE_STRING:  cellValue = cell.getStringCellValue().toString();  break;
      case Cell.CELL_TYPE_BLANK:   cellValue = cell.toString();            break;
      case Cell.CELL_TYPE_BOOLEAN: cellValue = cell.getBooleanCellValue(); break;
      case Cell.CELL_TYPE_ERROR:   cellValue = cell.getErrorCellValue();   break;
    }

    return cellValue == null ? "" : String.valueOf(cellValue);

  }

  /**
   * ResultSet 전환, Refactoring 필요
   *
   * @param result
   * @return
   */
  public static List<JsonNode> makeResponseResultNode(String result) {

    JsonNode root = null;
    try {
      ObjectMapper objectMapper = new ObjectMapper();
      objectMapper.configure(JsonParser.Feature.ALLOW_NON_NUMERIC_NUMBERS, true);
      root = new ObjectMapper().readTree(result);
    } catch (IOException e) {
      e.printStackTrace();
    }

    if (root == null || root.size() == 0) {
      return Lists.newArrayList();
    }

    return makeResponseResultNode(root);
  }

  /**
   * ResultSet 전환, Refactoring 필요
   *
   * @param root
   * @return
   */
  public static List<JsonNode> makeResponseResultNode(JsonNode root) {


    if (root == null || root.size() == 0) {
      return Lists.newArrayList();
    }

    List<JsonNode> resultSet = Lists.newArrayList();

    // Result Type 판별
    //
    // Case "groupBy"
    if (root.get(0).get("result") == null) {
      for (JsonNode node : root) {
        JsonNode eventNode = node.get("event");
        if (eventNode == null) {
          resultSet.add(node);
        } else {
          ((ObjectNode) eventNode).put("timestamp", node.get("timestamp").asText());

          resultSet.add(eventNode);
        }
      }
    }
    // Case "select", "topn", "timeboundary"
    else {

      JsonNode resultNode = root.get(0).get("result");
      // topn case
      if (resultNode instanceof ArrayNode) {
        for (JsonNode eventNode : resultNode) {
          resultSet.add(eventNode);
        }
      } else {
        JsonNode eventNodes = resultNode.get("events");
        // timeboundary case
        if (eventNodes == null) {
          resultSet.add(resultNode);
        }
        // select case
        else {
          for (JsonNode eventNode : eventNodes) {
            resultSet.add(eventNode.get("event"));
          }
        }
      }

    }

    LOGGER.info("Query Result Count : " + resultSet.size());

    return resultSet;
  }

  /**
   * ResultSet 전환, Refactoring 필요
   *
   * @param root
   * @return
   */
  public static JsonNode makeResponseResultArrayNode(JsonNode root) {

    ArrayNode arrayNode = GlobalObjectMapper.getDefaultMapper().createArrayNode();

    if (root == null || root.size() == 0) {
      return arrayNode;
    }

    // Result Type 판별
    //
    // Case "groupBy"
    if (root.get(0).get("result") == null) {
      for (JsonNode node : root) {
        JsonNode eventNode = node.get("event");
        if (eventNode == null) {
          arrayNode.add(node);
        } else {
          ((ObjectNode) eventNode).put("timestamp", node.get("timestamp").asText());

          arrayNode.add(eventNode);
        }
      }
    }
    // Case "select", "topn", "timeboundary"
    else {

      JsonNode resultNode = root.get(0).get("result");
      // topn/search case
      if (resultNode instanceof ArrayNode) {
        for (JsonNode eventNode : resultNode) {
          if (eventNode.has("value")) {  // search case
            ObjectNode node = (ObjectNode) eventNode;
            node.put(node.get("dimension").asText(), node.get("value").asText());
            node.remove("dimension");
            node.remove("value");
            arrayNode.add(node);
          } else {                      // topn case
            arrayNode.add(eventNode);
          }
        }
      } else {
        JsonNode eventNodes = resultNode.get("events");
        // timeboundary case
        if (eventNodes == null) {
          arrayNode.add(resultNode);
        }
        // select case
        else {
          for (JsonNode eventNode : eventNodes) {
            arrayNode.add(eventNode.get("event"));
          }
        }
      }

    }

    LOGGER.info("Query Result Count : " + arrayNode.size());

    return arrayNode;
  }

  /**
   * Druid 결과 값(JsonNode) 재조정
   *
   * @param root
   * @return
   */
  public static JsonNode makeResponseResultArrayNode1(JsonNode root) {
    return makeResponseResultArrayNode1(root, "timestamp");
  }

  /**
   * Druid 결과 값(JsonNode) 재조정
   *
   * @param root
   * @return
   */
  public static JsonNode makeResponseResultArrayNode1(JsonNode root, String timestampFieldName) {

    if (root == null || root.size() == 0) {
      return root;
    }

    // Result Type 판별
    //
    // Case "groupBy"
    if (root.get(0).get("result") == null) {
      for (JsonNode node : root) {
        ObjectNode targetNode = (ObjectNode) node;
        // 불필요 노드 삭제
        targetNode.remove("version");
        targetNode.remove("timestamp");

        // event 노드내 속성값을 Parent Node로 이동
        JsonNode eventNode = node.get("event");
        if (eventNode != null) {
          targetNode.setAll((ObjectNode) eventNode);
          // 기존 event 노드 삭제
          targetNode.remove("event");
        }
      }
    }
    // Case "select", "topn", "timeboundary"
    else {
      JsonNode resultNode = root.get(0).get("result");
      // topn/search case
      if (resultNode instanceof ArrayNode) {
        JsonNode firstNode = resultNode.get(0);
        if (firstNode != null && firstNode.has("value")) {  // Search case
          for (JsonNode eventNode : resultNode) {
            ObjectNode node = (ObjectNode) eventNode;
            node.put(node.get("dimension").asText(), node.get("value").asText());
            node.remove("dimension");
            node.remove("value");
          }
        }
        root = resultNode;
      } else {
        JsonNode eventNodes = resultNode.get("events");
        // timeboundary case
        if (eventNodes == null) {
          root = resultNode;
        }
        // select case
        else {
          for (JsonNode eventNode : eventNodes) {
            ObjectNode targetNode = (ObjectNode) eventNode;
            targetNode.setAll((ObjectNode) eventNode.get("event"));
            targetNode.remove("event");
            targetNode.remove("segmentId");
            targetNode.remove("offset");
          }
          root = eventNodes;
        }
      }

    }

    LOGGER.debug("Query Result Count : " + root.size());

    return root;
  }

  /**
   * ResultSet 전환, Refactoring 필요
   *
   * @param result
   * @return
   */
  public static List<Map<String, Object>> makeResponseResult(String result) {

    List<Map<String, Object>> resultSet = Lists.newArrayList();
    JsonNode root = null;
    try {
      root = new ObjectMapper().readTree(result);
    } catch (IOException e) {
      e.printStackTrace();
    }

    if (root == null || root.size() == 0) {
      return Lists.newArrayList();
    }

    // Result Type 판별
    //
    // Case "groupBy"
    if (root.get(0).get("result") == null) {
      for (JsonNode node : root) {
        JsonNode eventNode = node.get("event");
        if (eventNode == null) {
          resultSet.add(new ObjectMapper().convertValue(node, Map.class));
        } else {
          Map<String, Object> rowMap = new ObjectMapper().convertValue(eventNode, Map.class);
          rowMap.put("timestamp", node.get("timestamp").asText());
          resultSet.add(rowMap);
        }
      }
    }
    // Case "select", "topn", "timeboundary"
    else {

      JsonNode resultNode = root.get(0).get("result");
      // topn case
      if (resultNode instanceof ArrayNode) {
        for (JsonNode eventNode : resultNode) {
          resultSet.add(new ObjectMapper().convertValue(eventNode, TreeMap.class));
        }
      } else {
        JsonNode eventNodes = resultNode.get("events");
        // timeboundary case
        if (eventNodes == null) {
          resultSet.add(new ObjectMapper().convertValue(resultNode, TreeMap.class));
        }
        // select case
        else {
          for (JsonNode eventNode : eventNodes) {
            resultSet.add(new ObjectMapper().convertValue(eventNode.get("event"), TreeMap.class));
          }
        }
      }

    }

    LOGGER.info("Query Result Count : " + resultSet.size());

    return resultSet;
  }

  public static MediaType checkMediaTypeFromFileName(String fileName) {

    Preconditions.checkArgument(StringUtils.isNotEmpty(fileName));

    String[] result = StringUtils.split(fileName, ".");

    if (result.length > 1) {
      switch (result[result.length - 1].toUpperCase()) {
        case "JPG":
        case "JPEG":
          return MediaType.IMAGE_JPEG;
        case "PNG":
          return MediaType.IMAGE_PNG;
        case "GIF":
          return MediaType.IMAGE_GIF;
      }
    }

    return MediaType.IMAGE_JPEG;
  }

  /**
   * 파일복사
   *
   * @param inFileName
   * @param outFileName
   */
  public static void fileCopy(String inFileName, String outFileName) {
    try {
      FileInputStream fis = new FileInputStream(inFileName);
      FileOutputStream fos = new FileOutputStream(outFileName);

      int data = 0;
      while ((data = fis.read()) != -1) {
        fos.write(data);
      }
      fis.close();
      fos.close();

    } catch (IOException e) {
      throw new RuntimeException("Fail to copy file " + inFileName + " to " + outFileName +  " - " + e.getMessage());
    }
  }

  public static void convertExcelToCSV(int sheetIndex, boolean removeFirstRow, String fileName, String csvFilename) {
    InputStream is = null;
    BufferedWriter output = null;

    try {
      output = new BufferedWriter(new FileWriter(csvFilename));
      is = new FileInputStream(fileName);

      Workbook wb = WorkbookFactory.create(is);

      Sheet sheet = wb.getSheetAt(sheetIndex);

      // hopefully the first row is a header and has a full compliment of
      // cells, else you'll have to pass in a max (yuck)
      int maxColumns = sheet.getRow(0).getLastCellNum();

      for (Row row : sheet) {
        if (removeFirstRow) {
          removeFirstRow = !removeFirstRow;
          continue;
        }

        // row.getFirstCellNum() and row.getLastCellNum() don't return the
        // first and last index when the first or last column is blank
        int minCol = 0; // row.getFirstCellNum()
        int maxCol = maxColumns; // row.getLastCellNum()

        for (int i = minCol; i < maxCol; i++) {

          Cell cell = row.getCell(i);
          String buf = "";
          if (i > 0) {
            buf = ",";
          }

          if (cell == null) {
            output.write(buf);
          } else {

            // TODO: getCellValue의 Type가 Date, Formula 등 단순 value가 아닌 경우 잠재적 오류가 발생할 수 있는 구간. openExcelFileToJsonStringArray 로직 참고
            String v = getCellValue(cell);
            if (v != null) {
              buf = buf + toCSVValue(v);
            }
            output.write(buf);
          }
        }

        output.write("\n");
      }
      is.close();
      output.close();
    } catch (IOException e) {
      throw new RuntimeException("파일 변환 에러");
    } catch (InvalidFormatException e) {
      throw new RuntimeException("잘못된 파일 포맷");
    } finally {
      try {
        if (is != null) {
          is.close();
        }
        if (output != null) {
          output.close();
        }
      } catch (Exception ex) {
      }
    }
  }

  /*
    * </strong>
    * Escape the given value for output to a CSV file.
    * Assumes the value does not have a double quote wrapper.
    * @return
    */
  public static String toCSVValue(String value) {

    String v = null;
    boolean doWrap = false;

    if (value != null) {

      v = value;

      if (v.contains("\"")) {
        v = v.replace("\"", "\"\""); // escape embedded double quotes
        doWrap = true;
      }

      if (v.contains(",") || v.contains("\n")) {
        doWrap = true;
      }

      if (doWrap) {
        v = "\"" + v + "\""; // wrap with double quotes to hide the comma
      }
    }

    return v;
  }

  public static void addTimestampColumn(String timestampValue, String csvFilePath) {

    String lineSep = System.getProperty("line.separator");
    StringBuilder sb = new StringBuilder();

    try {
      BufferedReader br = new BufferedReader(new FileReader(csvFilePath));
      String line = null;
      while ((line = br.readLine()) != null) {
        sb.append(line + "," + timestampValue + lineSep);
      }
      br.close();
      FileWriter fw = new FileWriter(csvFilePath, false); // boolean if <code>true</code>, then data will be written to the end of the file rather than the beginning.
      fw.write(sb.toString());
      fw.flush();
      fw.close();
    } catch (FileNotFoundException e) {
      throw new RuntimeException("CSV File Not Found");
    } catch (IOException e) {
      throw new RuntimeException("CSV파일 시간필드 컬럼 추가 실패");
    }
  }

  public static void removeCSVHeaderRow(String csvFilePath) {
    String lineSep = System.getProperty("line.separator");
    StringBuilder sb = new StringBuilder();

    try {
      BufferedReader br = new BufferedReader(new FileReader(csvFilePath));
      String line = null;
      br.readLine(); // 헤더 건너띔
      while ((line = br.readLine()) != null) {
        sb.append(line + lineSep);
      }
      br.close();
      FileWriter fw = new FileWriter(csvFilePath, false); // boolean if <code>true</code>, then data will be written to the end of the file rather than the beginning.
      fw.write(sb.toString());
      fw.flush();
      fw.close();
    } catch (FileNotFoundException e) {
      throw new RuntimeException("CSV File Not Found");
    } catch (IOException e) {
      throw new RuntimeException("CSV파일 헤더 제거 실패");
    }
  }

  public static Object listToArray(List<Object> list) {

    if (CollectionUtils.isEmpty(list)) {
      return new Object[0];
    }

    Object first = list.get(0);
    if (first instanceof String) {
      return list.toArray(new String[list.size()]);
    } else if (first instanceof Integer) {
      return list.toArray(new Integer[list.size()]);
    } else if (first instanceof Double) {
      return list.toArray(new Double[list.size()]);
    } else if (first instanceof List) {
      return convertListTo2DStringArray(list);
    } else {
      return list.toArray(new Object[list.size()]);
    }
  }

  public static String[][] convertListTo2DStringArray(List<Object> args) {

    if (CollectionUtils.isEmpty(args) || !(args.get(0) instanceof List)) {
      return null;
    }

    String[][] array = new String[args.size()][];
    for (int i = 0; i < args.size(); i++) {
      List<String> row = (List<String>) args.get(i);
      array[i] = row.toArray(new String[row.size()]);
    }
    return array;
  }

  /**
   * Get file name in pull path <br />
   *
   * @param filePath
   * @return
   * @see <a herf="http://stackoverflow.com/a/36283419">stackoverflow</a>
   */
  public static String getFileName(String filePath) {

    if (filePath == null || filePath.length() == 0) {
      return "";
    }

    filePath = filePath.replaceAll("[/\\\\]+", "/");
    int len = filePath.length(),
            upCount = 0;

    while (len > 0) {
      //remove trailing separator
      if (filePath.charAt(len - 1) == '/') {
        len--;
        if (len == 0)
          return "";
      }

      int lastInd = filePath.lastIndexOf('/', len - 1);
      String fileName = filePath.substring(lastInd + 1, len);

      if (fileName.equals(".")) {
        len--;
      } else if (fileName.equals("..")) {
        len -= 2;
        upCount++;
      } else {
        if (upCount == 0)
          return fileName;
        upCount--;
        len -= fileName.length();
      }
    }

    return "";
  }

  public static long displayMemSizeToByte(String displaySize) {

    long size = 1024 * 1024L;

    if (StringUtils.isEmpty(displaySize)) {
      return size;
    }

    Matcher m = PATTERN_MEM_SIZE_FORMAT.matcher(displaySize.trim());

    if (m.find()) {
      int i = Integer.parseInt(m.group(1));
      String unit = m.group(2).toLowerCase();
      switch (unit) {
        case "g":
          size = i * 1024 * size;
          break;
        case "m":
          size = i * size;
          break;
      }
    }

    return size;
  }

  public static String escapeSpecialRegexChars(String str) {
    if(StringUtils.isEmpty(str)) {
      return "";
    }

    return PATTERN_SPECIAL_REGEX_CHARS.matcher(str).replaceAll("\\\\$0");
  }

  public static String escapeTimeFormatChars(String str) {
    if(StringUtils.isEmpty(str)) {
      return "";
    }

    return PATTERN_TIMEFORMAT_SPECIAL_CHARS.matcher(str).replaceAll("\\\\$0");
  }

  public static List<String> makeSqlLikeToken(String expr) {

    List<String> tokens = Lists.newArrayList();
    Stack<Character> stack = new Stack<>();
    LinkedList<Character> chars = Lists.newLinkedList(
            Lists.newArrayList(ArrayUtils.toObject(expr.toCharArray())));

    while (!chars.isEmpty()) {
      char c = chars.pollFirst();
      if (c == '_' || c == '%') {
        if (!stack.isEmpty()) {
          tokens.add(new String(ArrayUtils.toPrimitive(stack.toArray(new Character[0]))));
          stack.clear();
        }
        tokens.add(c + "");
      } else if (c == '\\') {  // Escaped Charactor
        char nextChar = chars.peek();
        if (nextChar == '_' || nextChar == '%') {
          stack.push(chars.pollFirst());
        } else {
          stack.push(c);
          stack.push(chars.pollFirst());
        }
      } else if (c == '[') {
        if (!stack.isEmpty()) {
          tokens.add(new String(ArrayUtils.toPrimitive(stack.toArray(new Character[0]))));
          stack.clear();
        }
        stack.push(c);
      } else if (c == ']') {
        if (!stack.isEmpty()) {
          stack.push(c);
          if (chars.peek() == '%') {
            stack.push(chars.pollFirst());
          }
          tokens.add(new String(ArrayUtils.toPrimitive(stack.toArray(new Character[0]))));
          stack.clear();
        }
      } else {
        stack.push(c);
      }
    }

    if(!stack.isEmpty()) {
      tokens.add(new String(ArrayUtils.toPrimitive(stack.toArray(new Character[0]))));
    }

    return tokens;
  }


  public static String convertSqlLikeToRegex(String likeExpr, boolean inWord) {

    List<String> tokens = makeSqlLikeToken(likeExpr);
//    System.out.println("like tokens : " + tokens);

    StringBuilder builder = new StringBuilder();
    for(String token : tokens) {
//      System.out.println("token: " + token);
      if("%".equals(token)) {
        builder.append(".*");
      } else if("_".equals(token)) {
        builder.append(".");
      } else if(token.startsWith("[") && token.endsWith("]")
              || token.startsWith("[") && token.endsWith("]%")) {

        boolean astar = token.endsWith("]%");

        int braceLastIdx = astar ? token.length() - 2 : token.length() - 1;
        String subToken = token.substring(1, braceLastIdx);
        if(subToken.startsWith("^")) {
          String notToken = subToken.substring(1);
          builder.append("[^")
                  .append(escapeSpecialRegexChars(notToken));
        } else {
          builder.append("[")
                  .append(escapeSpecialRegexChars(subToken));
        }

        if(astar) {
          builder.append("]*");
        } else {
          builder.append("]");
        }

      } else {
        builder.append(escapeSpecialRegexChars(token));
      }
    }

    if(inWord) {
      return builder.toString();
    } else {
      return "^" + builder.toString() + "$";
    }
  }

  /**
   * Random Password Generator.
   *
   * @param size
   * @return
   */
  public static String createTemporaryPassword(int size) {

    StringBuilder builder = new StringBuilder();

    Random random = new Random();
    int length = PASSWORD_CHARS.length;
    for (int i = 0; i < size; i++) {
      builder.append(PASSWORD_CHARS[random.nextInt(length)]);
    }

    return builder.toString();
  }

  public static String makeTableName(String name) {
    if(StringUtils.isEmpty(name)) {
      return randomUUID(false).replace("-", "_");
    }

    String replaced = StringUtils.replacePattern(name, "[\\W]*", "");

    if(replaced.length() < 3) {
      return randomUUID(false).replace("-", "_");
    }

    return replaced;
  }

  public static String makeLookupName(String id, List<String> keys, String value) {

    StringJoiner joiner = new StringJoiner("_");

    joiner.add(id);

    joiner.add("k");
    keys.forEach( key -> joiner.add(key) );

    if(StringUtils.isNotEmpty(value)) {
      joiner.add("v");
      joiner.add(value);
      return joiner.toString();
    } else {
      return joiner.toString() + "_v_";
    }

  }

  public static String convertDataSourceName(String name) {

    Preconditions.checkNotNull(name);

    // 1. 소문자화
    String newName = StringUtils.lowerCase(name);

    // 2. 공백 '_' 치환
    newName = StringUtils.replacePattern(newName, "\\s", "_");

    // 3. 앞에 숫자 제거
    newName = StringUtils.replaceFirst(newName, "^[0-9]+", "");

    // 4. 영문 및 _ 만 제외하고 모두 제거
    newName = StringUtils.replacePattern(newName, "[^a-z_0-9]", "");

    // 5. 5글자 이하이면 뒤에 _ 포함 Random 문자 5자 추가
    if(newName.length() < 5) {
      newName += "_" + randomString(5);
    }

    return newName;
  }

  public static String randomString(int digit) {
    Random random = new Random();
    StringBuilder builder = new StringBuilder();
    int length = RANDOM_CHARS.length;
    for (int i = 0; i < digit; i++) {
      builder.append(RANDOM_CHARS[random.nextInt(length)]);
    }

    return builder.toString();
  }

  public static String randomUUID(boolean excludeDash) {

    return randomUUID(null, excludeDash);
  }

  public static String randomUUID(String prefix, boolean excludeDash) {

    StringBuilder builder = new StringBuilder();

    if(StringUtils.isNotEmpty(prefix)) {
      builder.append(prefix).append("-");
    }

    String uuid = UUID.randomUUID().toString();
    builder.append(excludeDash ? uuid.replace("-", "") : uuid);

    return builder.toString();
  }

  public static String addTimestampColumnFromCsv(String timeStr, String inputPath, String outputPath) {

    File inputFile = new File(inputPath);
    File outputFile = new File(outputPath);

    CsvListReader reader = null;
    CsvListWriter writer = null;
    try {
      CsvPreference csvPreference = new CsvPreference.Builder('"', ',', "\r\n")
              .ignoreEmptyLines(false)
              .build();
      reader = new CsvListReader(new FileReader(inputFile), csvPreference);
      writer = new CsvListWriter(new FileWriter(outputFile), csvPreference);

      List<String> columns;
      while ((columns = reader.read()) != null) {
        columns.add(timeStr);
        writer.write(columns);
      }

    } catch (IOException e) {
      throw new MetatronException("Fail to transform csv file :" + e.getMessage());
    } finally {
      try {
        if (reader != null) reader.close();
        if (writer != null) writer.close();
      } catch (IOException e) {}
    }

    return outputFile.getAbsolutePath();
  }

  public static String getLocalHostname() {
    try {
      return InetAddress.getLocalHost().getHostName();
    } catch (UnknownHostException e) {
      return "localhost";
    }
  }

  public static List<String> mapWithRangeExpressionToList(Map<String, Object> rangeMap){

    List<String> strList = new ArrayList<>();
    Map<String, List> convertListMap = new LinkedHashMap<>();

    for(String keyStr : rangeMap.keySet()){
      String partitionStr = rangeMap.get(keyStr).toString();

      List<String> convertedRangeList = new ArrayList<>();

      //1. comma split
      List<String> commaSeparatedList = commaExpressionToList(partitionStr);
      for(String commaSeparatedStr : commaSeparatedList){

        //2. [**-**] range generate to list
        convertedRangeList.addAll(rangeExpressionToList(commaSeparatedStr));
      }

      convertListMap.put(keyStr, convertedRangeList);
    }

    //union string with prefix
    for(String keyStr : convertListMap.keySet()){

      if(strList.isEmpty()){
        strList = union(keyStr, "", convertListMap.get(keyStr), null, "");
      } else {
        strList = union("", keyStr, strList, convertListMap.get(keyStr), "/");
      }
    }

    return strList;
  }

  public static List<String> commaExpressionToList(String commaStr){
    String comma = ",";

    // has comma expression
    boolean hasCommaExpression = commaStr.contains(comma);
    List<String> convertedList = new ArrayList<>();
    if(hasCommaExpression){
      convertedList.addAll(
              Arrays.stream(StringUtils.split(commaStr, comma)).collect(Collectors.toList())
      );
    } else {
      convertedList.add(commaStr);
    }

    //trim
    return convertedList.stream().map(StringUtils::trim).collect(Collectors.toList());
  }

  public static List<String> rangeExpressionToList(String rangeStr){

    List<String> convertedList = new ArrayList<>();
    // has range Expr..
    Pattern pattern = Pattern.compile("\\[([a-zA-Z0-9]*)-([a-zA-Z0-9]*)\\]");
    Matcher matcher = pattern.matcher(rangeStr);

    boolean hasRangeExpression = matcher.find();
    if(hasRangeExpression){
      List<String> generatedList = new ArrayList<>();
      matcher.reset();
      int lastFrom = 0;
      int lastTo = 0;
      while (matcher.find()) {
        int from = matcher.start();
        int to = matcher.end();

        if(from != lastTo){
          List<String> missedStr = new ArrayList<>();
          missedStr.add(StringUtils.substring(rangeStr, lastTo, from));
          generatedList = union("", "", generatedList, missedStr, "");
        }

        String fromStr = matcher.group(1);
        String toStr = matcher.group(2);

        generatedList = union("", "", generatedList, generateList(fromStr, toStr), "");

        lastFrom = from;
        lastTo = to;
      }

      if(lastTo != rangeStr.length()){
        List<String> remainStr = new ArrayList<>();
        remainStr.add(StringUtils.substring(rangeStr, lastTo, rangeStr.length()));
        generatedList = union("", "", generatedList, remainStr, "");
      }
      convertedList.addAll(generatedList);
    } else {
      //convert blank partition to asterisk for like statement
      if(StringUtils.isEmpty(rangeStr))
        convertedList.add("{*}");
      else
        convertedList.add(rangeStr);
    }

    return convertedList;
  }

  public static List<String> generateList(String from, String to){

    if((isNumeric(from) && !isNumeric(to))
    || isLowercase(from) && !isLowercase(to)
    || isUppercase(from) && !isUppercase(to)){
      throw new BadRequestException("from, to case is not match.");
    }

    if(from.compareTo(to) > 0){
      throw new BadRequestException("to should greater than from.");
    }

    List<String> genList = new ArrayList<>();
    String nextString = from;
    int maxCnt = 100;
    int loopCnt = 0;
    while(!nextString.equals(to)){
      if(loopCnt > maxCnt){
        break;
      }
      genList.add(nextString);
      if(isNumeric(from)){
        nextString = nextNumeric(nextString);
      } else if(isLowercase(from)){
        nextString = nextLowerAlphabet(nextString);
      } else if(isUppercase(from)){
        nextString = nextUpperAlphabet(nextString);
      }
      loopCnt++;
    }
    genList.add(to);
    return genList;
  }

  public static String nextUpperAlphabet(String text){
    return nextString(text, 'A', 'Z', 'A');
  }

  public static String nextLowerAlphabet(String text){
    return nextString(text, 'a', 'z', 'a');
  }

  public static String nextNumeric(String text){
    return nextString(text, '0', '9', '1');
  }

  private static boolean isNumeric(String text){
    return text.matches("^\\d+$");
  }

  private static boolean isUppercase(String text){
    return text.matches("^[A-Z]+$");
  }

  private static boolean isLowercase(String text){
    return text.matches("^[a-z]+$");
  }

  public static String nextString(String text, char firstLetter, char lastLetter, char insertLetter){
    StringBuilder sb = new StringBuilder(text);
    boolean needShift = true;
    char[] textCharArr = text.toCharArray();
    for(int i = textCharArr.length - 1; i >= 0; i--){
      if(needShift){
        Character targetChar = textCharArr[i];

        if(targetChar == lastLetter){
          targetChar = firstLetter;
          needShift = true;
        } else {
          targetChar++;
          needShift = false;
        }
        sb.setCharAt(i, targetChar);
      }
    }

    if(needShift){
      sb.insert(0, insertLetter);
    }

    return sb.toString();
  }

  public static List<String> union(String prefix1, String prefix2, List<String> list1, List<String> list2, String delimiter){
    List<String> unionList = new ArrayList<>();

    if((list1 == null || list1.isEmpty()) && (list2 == null || list2.isEmpty())) {

    } else if(list1 == null || list1.isEmpty()){
      list2.stream()
              .forEach(value2 -> {
                StringBuilder builder = new StringBuilder();
                if (StringUtils.isNotEmpty(prefix1))
                  builder.append(prefix1 + "=");
                builder.append(delimiter);
                if (StringUtils.isNotEmpty(prefix2))
                  builder.append(prefix2 + "=");
                builder.append(value2);
                unionList.add(builder.toString());
              });
    } else if(list2 == null || list2.isEmpty()){
      list1.stream()
              .forEach(value1 -> {
                StringBuilder builder = new StringBuilder();
                if(StringUtils.isNotEmpty(prefix1))
                  builder.append(prefix1 + "=");
                builder.append(value1);
                builder.append(delimiter);
                if(StringUtils.isNotEmpty(prefix2))
                  builder.append(prefix2 + "=");
                unionList.add(builder.toString());
              });
    } else {
      list1.stream()
              .forEach(value1 -> {
                list2.stream()
                        .forEach(value2 ->{
                          StringBuilder builder = new StringBuilder();
                          if(StringUtils.isNotEmpty(prefix1))
                            builder.append(prefix1 + "=");
                          builder.append(value1);
                          builder.append(delimiter);
                          if(StringUtils.isNotEmpty(prefix2))
                            builder.append(prefix2 + "=");
                          builder.append(value2);
                          unionList.add(builder.toString());
                        });

              });
    }

    return unionList;
  }

  public static Map<String, Object> partitionStringToMap(String partition){
    Map<String, Object> partitionMap = new LinkedHashMap<>();

    for(String separatedPart : partition.split("/")){
      String[] separatedPartition = separatedPart.split("=");
      if(separatedPartition.length > 1){
        //replace all projection to blank
        partitionMap.put(separatedPartition[0], "{*}".equals(separatedPartition[1]) ? "" : separatedPartition[1]);
      }
    }

    return partitionMap;
  }
}
