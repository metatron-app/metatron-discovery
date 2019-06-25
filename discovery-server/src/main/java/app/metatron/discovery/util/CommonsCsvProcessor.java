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

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.commons.io.ByteOrderMark;
import org.apache.commons.io.input.BOMInputStream;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.ContentSummary;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.datanucleus.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.datasource.DataType;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.domain.datasource.Field;
import app.metatron.discovery.domain.datasource.FileValidationResponse;
import app.metatron.discovery.domain.datasource.ingestion.IngestionDataResultResponse;

public class CommonsCsvProcessor {

  private static Logger LOGGER = LoggerFactory.getLogger(CommonsCsvProcessor.class);

  private URI csvUri;

  private Configuration configuration;

  private InputStreamReader streamReader;

  private char columnDelm;

  private boolean withHeader;

  private boolean enableTotalCnt;

  private String prefixColumnName = "Col_";

  private Integer maxColumnCnt = 0;

  private Long maxRowCnt = 100L;

  private Integer columnCnt = 0;

  private Long totalBytes = -1L;

  private Long totalRows = -1L;

  private List<String> columnNames;

  private List<String[]> rows;

  public CommonsCsvProcessor() {
    // empty constructor
  }

  public CommonsCsvProcessor(URI uri) {
    this.csvUri = uri;

    loadStream();
  }

  public CommonsCsvProcessor(String strUri) {
    try {
      csvUri = new URI(strUri);
    } catch (URISyntaxException e) {
      throw new CommonsCsvException("Invalid URI : " + strUri, e);
    }

    loadStream();
  }

  public CommonsCsvProcessor hdfsConf(Configuration configuration) {
    this.configuration = configuration;

    return this;
  }

  public CommonsCsvProcessor totalCount() {
    this.enableTotalCnt = true;

    return this;
  }

  public CommonsCsvProcessor withHeader(boolean withHeader) {
    this.withHeader = withHeader;

    return this;
  }

  public CommonsCsvProcessor prefixColumnName(String columnName) {
    this.prefixColumnName = columnName;

    return this;
  }

  public CommonsCsvProcessor maxRowCount(Long maxRowCnt) {
    this.maxRowCnt = maxRowCnt;

    return this;
  }

  public CommonsCsvProcessor maxColumnCount(Integer maxColumnCnt) {
    this.maxColumnCnt = maxColumnCnt;

    return this;
  }

  public CommonsCsvProcessor delimeter(String delimeter) {
    this.columnDelm = unescapedDelimiter(delimeter);

    return this;
  }

  public void loadStream() {

    String scheme = csvUri.getScheme() == null ? "file" : csvUri.getScheme();

    switch (scheme) {
      case "hdfs":
        if (configuration == null) {
          throw new CommonsCsvException("HDFS configuration not found.");
        }
        Path path = new Path(csvUri);

        FileSystem hdfsFs;
        try {
          hdfsFs = FileSystem.get(configuration);
        } catch (IOException e) {
          throw new CommonsCsvException("Cannot get HDFS configuration", e);
        }

        FSDataInputStream his;
        try {
          if (enableTotalCnt) {
            ContentSummary cSummary = hdfsFs.getContentSummary(path);
            totalBytes = cSummary.getLength();
          }

          his = hdfsFs.open(path);
        } catch (IOException e) {
          throw new CommonsCsvException("Cannot read file : " + path, e);
        }

        detectingCharset(his);
        break;

      case "file":
        File file = new File(csvUri);
        if (enableTotalCnt) {
          totalBytes = file.length();
        }

        FileInputStream fis;
        try {
          fis = new FileInputStream(file);
        } catch (FileNotFoundException e) {
          throw new CommonsCsvException("Cannot read file : " + file.getAbsolutePath(), e);
        }

        detectingCharset(fis);
        break;

      default:
        throw new CommonsCsvException("Unsupported URI scheme : " + scheme);
    }
  }

  public void detectingCharset(InputStream is) {

    BOMInputStream bis;
    String charset = null;

    try {

      bis = new BOMInputStream(is, true, ByteOrderMark.UTF_8, ByteOrderMark.UTF_16LE, ByteOrderMark.UTF_16BE, ByteOrderMark.UTF_32LE, ByteOrderMark.UTF_32BE);

      if (bis.hasBOM() == false || bis.hasBOM(ByteOrderMark.UTF_8)) {
        charset = "UTF-8";
      } else if (bis.hasBOM(ByteOrderMark.UTF_16LE) || bis.hasBOM(ByteOrderMark.UTF_16BE)) {
        charset = "UTF-16";
      } else if (bis.hasBOM(ByteOrderMark.UTF_32LE) || bis.hasBOM(ByteOrderMark.UTF_32BE)) {
        charset = "UTF-32";
      }

      streamReader = new InputStreamReader(bis, charset);

    } catch (UnsupportedEncodingException e) {
      throw new CommonsCsvException("Unsupported charecter set : " + charset);
    } catch (NullPointerException e) {
      throw new CommonsCsvException("Unknown BOM");
    } catch (IOException e) {
      throw new CommonsCsvException("Fail to read csv file : " + csvUri.toString(), e);
    }

  }

  public char unescapedDelimiter(String strDelim) {
    assert strDelim.length() != 0;

    if (strDelim.length() == 1) {
      return strDelim.charAt(0);
    }

    String unescaped = StringEscapeUtils.unescapeJava(strDelim);
    if (unescaped.length() == 1) {
      return unescaped.charAt(0);
    }

    throw new CommonsCsvException("Invalid delimeter : " + strDelim);
  }

  public CommonsCsvProcessor parse(String delimeter) {

    CSVParser parser;
    try {
      parser = CSVParser.parse(streamReader,
                               CSVFormat.DEFAULT.withDelimiter(unescapedDelimiter(delimeter)).withEscape('\\'));  // \", "" both become " by default
    } catch (IOException e) {
      throw new CommonsCsvException("Fail to parse csv file", e);
    }

    Iterator<CSVRecord> iter = parser.iterator();
    CSVRecord csvRow = null;
    String[] row = null;
    rows = Lists.newArrayList();

    boolean first = true;

    while (iter.hasNext()) {

      csvRow = iter.next();

      if (first) {
        first = false;

        columnCnt = csvRow.size();
        columnCnt = Math.max(maxColumnCnt, columnCnt);

        columnNames = Lists.newArrayList();
        if (withHeader) {
          for (int i = 0; i < columnCnt; i++) {
            columnNames.add(csvRow.get(i));
          }
          continue;  // skip first line

        } else {
          for (int i = 0; i < columnCnt; i++) {
            columnNames.add(prefixColumnName + (i + 1));
          }
        }
      }

      row = new String[columnCnt];
      for (int i = 0; i < columnCnt; i++) {
        if (i < csvRow.size()) {
          row[i] = csvRow.get(i);
        } else {
          row[i] = null;
        }
      }

      rows.add(row);

      if (rows.size() == maxRowCnt) {
        break;

      }
    }

    if (enableTotalCnt) {
      try{
        totalRows = countLines();
        if (withHeader) {
          totalRows--;
        }
      }catch(IOException e){
      }
    }

    try {
      streamReader.close();
    } catch (IOException e) {
    }

    return this;
  }


  public IngestionDataResultResponse ingestionDataResultResponse() {

    List<Field> fields = makeField();

    List<Map<String, Object>> resultRows = Lists.newArrayList();
    Map<String, Object> rowMap = null;
    for (String[] row : rows) {
      rowMap = Maps.newLinkedHashMap();
      for (int i = 0; i < fields.size(); i++) {
        rowMap.put(fields.get(i).getName(), row[i]);
      }
      resultRows.add(rowMap);
    }

    FileValidationResponse isParsable = new FileValidationResponse(true);

    return new IngestionDataResultResponse(fields, resultRows, totalRows, isParsable);
  }

  private List<Field> makeField() {
    List<Field> fields = Lists.newArrayList();
    for (int i = 0; i < columnNames.size(); i++) {
      String columnName = columnNames.get(i);
      if (StringUtils.isEmpty(columnName)) {
        throw new CommonsCsvException("Invalid header name: null");
      }
      fields.add(new Field(columnName, DataType.STRING, i + 1));
    }

    Field.checkDuplicatedField(fields, false);

    return fields;
  }

  //TODO: Disable header validation. Discussed on #1057.
  // It will be refactor after datasource schema validation is adapted.
  //  private FileValidationResponse validateHeaders(String[] headers) {
  //
  //    Set<String> bounder = new HashSet<>();
  //
  //    for (int j = 0; j < headers.length; j++) {
  //
  //      if (headers[j] == null || headers[j].isEmpty()) {
  //
  //        headers[j] = "col_" + j;
  //
  //        return new FileValidationResponse(false,
  //                                          FileValidationResponse.WarningType.NULL_HEADER.getCode());
  //      }
  //
  //      if (headers[j].length() > MAX_HEADER_NAME) {
  //        return new FileValidationResponse(false,
  //                                          FileValidationResponse.WarningType.TOO_LONG_HEADER.getCode());
  //      }
  //
  //      if (bounder.contains(headers[j])) {
  //        return new FileValidationResponse(false,
  //                                          FileValidationResponse.WarningType.DUPLICATED_HEADER.getCode());
  //      }
  //
  //      bounder.add(headers[j]);
  //    }
  //
  //    return new FileValidationResponse(true);
  //  }

  private long countLines() throws IOException {
    InputStream is = new BufferedInputStream(new FileInputStream(new File(csvUri)));
    try {
      byte[] c = new byte[1024];

      int readChars = is.read(c);
      if (readChars == -1) {
        // bail out if nothing to read
        return 0;
      }

      // make it easy for the optimizer to tune this loop
      long count = 0L;
      while (readChars == 1024) {
        for (int i=0; i<1024;) {
          if (c[i++] == '\n') {
            ++count;
          }
        }
        readChars = is.read(c);
      }

      // count remaining characters
      while (readChars != -1) {
        for (int i=0; i<readChars; ++i) {
          if (c[i] == '\n') {
            ++count;
          }
        }
        readChars = is.read(c);
      }

      return count == 0 ? 1 : count;
    } finally {
      is.close();
    }
  }


  public static class CommonsCsvException extends MetatronException {

    public CommonsCsvException(String message) {
      super(message);
    }

    public CommonsCsvException(String message, Throwable cause) {
      super(message, cause);
    }
  }

}
