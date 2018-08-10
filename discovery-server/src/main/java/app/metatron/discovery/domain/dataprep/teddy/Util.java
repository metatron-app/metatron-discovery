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

import com.google.common.collect.Lists;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class Util {

  private static Logger LOGGER = LoggerFactory.getLogger(Util.class);

  // old method. not using
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
      InputStreamReader inputStreamReader = null;
      if(true==targetUrl.toLowerCase().startsWith("hdfs://")) {
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

  // Regards the 1st row as the colnames
  /*
  public static List<String[]> loadCsvFileLocal(String dirPath, String delimiter, int targetRowCnt, List<String> colNames) {
    List<String[]> grid = new ArrayList<>();
    BufferedReader br = null;
    String line;
    String quoteSymbol="\"";

    File dir = new File(dirPath);
    File[] files = dir.listFiles();

    for (int i = 0 ; i < files.length ; i++){
      File file = files[i];
      if (file.isFile() == false) {
        continue;
      }

      try {
        br = new BufferedReader(new InputStreamReader(new FileInputStream(file)));

        if ((line = br.readLine()) == null) {
          continue;   // file is empty
        }

        // get colNames
        if (colNames.size() == 0) {
          colNames.addAll(Arrays.asList(csvLineSplitter(line, delimiter, quoteSymbol)));
        }

        // get rows
        while ((line = br.readLine()) != null) {
          String[] strCols = csvLineSplitter(line, delimiter, quoteSymbol);
          grid.add(strCols);
          if (grid.size() == targetRowCnt) {
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
    }
    return grid;
  }
  */

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
      System.out.print(String.format("%" + widths.get(i) + "s", colDescs.get(i).getTimestampStyle()));
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
}
