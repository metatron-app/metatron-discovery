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

package app.metatron.discovery.domain.dataprep.teddy;

import app.metatron.discovery.common.GlobalObjectMapper;
import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import app.metatron.discovery.prep.parser.preparation.RuleVisitorParser;
import app.metatron.discovery.prep.parser.preparation.rule.Rule;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.common.collect.Lists;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.joda.time.DateTime;
import org.joda.time.LocalDateTime;

import java.io.*;
import java.sql.Timestamp;
import java.util.*;

import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;

public class Util {
  private  static RuleVisitorParser ruleVisitorParser = null;

  // old method. not using except tests
  public static List<String[]> loadGridLocalCsv(String targetUrl, String delimiter, int limitRowCnt) {

    List<String[]> grid = new ArrayList<>();

    BufferedReader br = null;
    String line;
    String quoteSymbol="\"";
    try {
      File theFile = new File(targetUrl);
      br = new BufferedReader(new InputStreamReader(new FileInputStream(theFile)));
      while ((line = br.readLine()) != null) {
        String[] strCols = csvLineSplitter(line, delimiter, quoteSymbol);
        grid.add(strCols);
        if (grid.size() == limitRowCnt) {
          break;
        }
      }
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      if (br != null) {
        try {
          br.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }
    return grid;
  }

  public static List<String[]> loadGridLocalCsv(String targetUrl, String delimiter, int limitRowCnt, Configuration conf, List<String> colNames) {

    List<String[]> grid = new ArrayList<>();

    BufferedReader br = null;
    String line;
    String quoteSymbol="\"";
    try {
      InputStreamReader inputStreamReader;
      if(true==targetUrl.toLowerCase().startsWith("hdfs://")) {   // The primary store is HDFS, even for LOCALLY uploaded files.
        // Once stored on HDFS, then you should be connected on, to find it.
        if (conf == null) {
          throw PrepException.create(PrepErrorCodes.PREP_INVALID_CONFIG_CODE,
                  PrepMessageKey.MSG_DP_ALERT_REQUIRED_PROPERTY_MISSING, HADOOP_CONF_DIR);
        }
        Path pt=new Path(targetUrl);
        FileSystem fs = FileSystem.get(conf);
        FSDataInputStream fsDataInputStream = fs.open(pt);
        inputStreamReader = new InputStreamReader(fsDataInputStream);
      } else {
        File theFile = new File(targetUrl);
        FileInputStream fileInputStream = new FileInputStream(theFile);
        inputStreamReader = new InputStreamReader(fileInputStream);
      }
      br = new BufferedReader(inputStreamReader);

      // get colNames
      while ((line = br.readLine()) != null) {
        if(colNames!=null && colNames.size()==0) {
          colNames.addAll(Arrays.asList(csvLineSplitter(line, delimiter, quoteSymbol)));
          continue;
        }

        String[] strCols = csvLineSplitter(line, delimiter, quoteSymbol);
        grid.add(strCols);
        if (grid.size() == limitRowCnt) {
          break;
        }
      }
    } catch (FileNotFoundException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    } finally {
      if (br != null) {
        try {
          br.close();
        } catch (IOException e) {
          e.printStackTrace();
        }
      }
    }
    return grid;
  }

  /*
    * Split rules used when creating datasets from csv files.
    * 1. Split line by a delimiter.
    * 2. Delimiters inside quotes are ignored.
    * 3. Only one pair of quotes per column is valid.
    *    > Delimiter that appears after the 3rd quotation mark will not be ignored.
    * 4. If there are only two quotation marks, and they enclose the entire word in the column, remove the quotation marks
     */
  public static String[] csvLineSplitter(String line, String delimiter, String quote) {
    List<String> result = new ArrayList<>();

    char[] lineChar = line.toCharArray();
    char delimiterChar = delimiter.charAt(0);
    char quoteChar = quote.charAt(0);

    List<Integer> listDelimiter = Lists.newArrayList();
    boolean openQuote = false;
    int delimiterLength = delimiter.length();
    int quoteLength = quote.length();
    int lineLength = line.length();
    for(int i=0; i<lineLength; i++) {
      if(i+quoteLength<=lineLength && quote.equals(line.substring(i,i+quoteLength))) {
        openQuote = !openQuote;
      }
      if(!openQuote && i+delimiterLength<=lineLength && delimiter.equals(line.substring(i,i+delimiterLength))) {
        listDelimiter.add(i);
      }
    }
    int start = 0;
    for(Integer delimiterIdx : listDelimiter) {
      String column = line.substring(start,delimiterIdx);
      start = delimiterIdx + delimiterLength;
      if( column.startsWith(quote) && column.endsWith(quote) ) {
        column = column.substring(quoteLength,column.length()-quoteLength);
      }
      if( column.contains(quote) ) {
        column = column.replaceAll(quote.concat(quote),quote);
      }
      result.add(column);
    }
    if(start<lineLength) {
      String column = line.substring(start);
      if (column.startsWith(quote) && column.endsWith(quote)) {
        column = column.substring(quoteLength, column.length() - quoteLength);
      }
      if (column.contains(quote)) {
        column = column.replaceAll(quote.concat(quote), quote);
      }
      result.add(column);
    }
    return result.toArray(new String[result.size()]);
  }

  public static int getLengthUTF8(CharSequence sequence) {
    if (sequence == null) {
      return 0;
    }
    int count = 0;
    for (int i = 0, len = sequence.length(); i < len; i++) {
      char ch = sequence.charAt(i);
      if (ch <= 0x7F) {
        count++;
      } else if (ch <= 0x7FF) {
        count += 2;
      } else if (Character.isHighSurrogate(ch)) {
        count += 4;
        ++i;
      } else {
        count += 3;
      }
    }
    return count;
  }

  public final static double EPSILON = 1.0e-20;

  public static Double round(double val) {
    return Double.valueOf(String.format("%.16f", Math.abs(val) < EPSILON ? 0.0 : val));
  }

  static void showSep(List<Integer> widths) {
    System.out.print("+");
    for (int width : widths) {
      for (int i = 0; i < width; i++) {
        System.out.print("-");
      }
      System.out.print("+");
    }
    System.out.println("");
  }

  static void showColNames(List<Integer> widths, List<String> colNames) {
    assert widths.size() == colNames.size() :
            String.format("widths.size()=%d colNames.size()=%d", widths.size(), colNames);

    System.out.print("|");
    for (int i = 0; i < widths.size(); i++) {
      System.out.print(String.format("%" + widths.get(i) + "s", colNames.get(i)));
      System.out.print("|");
    }
    System.out.println("");
  }

  static void showColTypes(List<Integer> widths, List<ColumnDescription> colDescs) {
    assert widths.size() == colDescs.size() :
            String.format("widths.size()=%d colDescs.size()=%d", widths.size(), colDescs);

    System.out.print("|");
    for (int i = 0; i < widths.size(); i++) {
      System.out.print(String.format("%" + widths.get(i) + "s", colDescs.get(i).getType()));
      System.out.print("|");
    }
    System.out.println("");
  }

  static void showRow(List<Integer> widths, Row row) {
    System.out.print("|");
    for (int i = 0; i < widths.size(); i++) {
      System.out.print(String.format(
              "%" + widths.get(i) + "s", row.get(i) == null ? "null" : row.get(i).toString()));
      System.out.print("|");
    }
    System.out.println("");
  }

  public static String getJsonRuleString(Rule rule) {
    String jsonRuleString = null;

    try {
      jsonRuleString = GlobalObjectMapper.getDefaultMapper().writeValueAsString(rule);
    } catch (JsonProcessingException e) {
      e.printStackTrace();
    }

      return jsonRuleString;
    }

  public static String parseRuleString(String ruleString) {
    if (ruleString.startsWith(CREATE_RULE_PREFIX)) {
      return getCreateJsonRuleString(ruleString);
    }

    if (ruleVisitorParser == null) {
      ruleVisitorParser = new RuleVisitorParser();
    }
    return getJsonRuleString(ruleVisitorParser.parse(ruleString));
  }

  private static final String CREATE_RULE_PREFIX = "create with: ";

  public static String getCreateRuleString(String dsId) {
    return CREATE_RULE_PREFIX + dsId;
  }

  public static String getUpstreamDsId(String ruleString) {
    return ruleString.substring(CREATE_RULE_PREFIX.length());
  }

  public static String getCreateJsonRuleString(String ruleString) {
    Map<String, Object> map = new HashMap();
    String jsonRuleString = null;

    map.put("name", "create");
    map.put("with", ruleString.substring(CREATE_RULE_PREFIX.length()));
    try {
      jsonRuleString = GlobalObjectMapper.getDefaultMapper().writeValueAsString(map);
    } catch (JsonProcessingException e) {
      e.printStackTrace();
    }

    return jsonRuleString;
  }

  public static Date jodatToSQLDate(LocalDateTime localDateTime) {
    return new Date(localDateTime.toDateTime().getMillis());
  }

  public static Timestamp jodaToSQLTimestamp(LocalDateTime localDateTime) {
    return new Timestamp(localDateTime.toDateTime().getMillis());
  }

  public static LocalDateTime sqlTimestampToJodaLocalDateTime(Timestamp timestamp) {
    return LocalDateTime.fromDateFields(timestamp);
  }

  public static DateTime sqlTimestampToJodaDateTime(Timestamp timestamp) {
    return sqlTimestampToJodaLocalDateTime(timestamp).toDateTime();
  }

}
