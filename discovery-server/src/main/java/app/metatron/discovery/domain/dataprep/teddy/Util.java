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

import app.metatron.discovery.domain.dataprep.exceptions.PrepErrorCodes;
import app.metatron.discovery.domain.dataprep.exceptions.PrepException;
import app.metatron.discovery.domain.dataprep.exceptions.PrepMessageKey;
import com.google.common.collect.Lists;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.joda.time.DateTime;
import org.joda.time.LocalDateTime;

import java.io.*;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static app.metatron.discovery.domain.dataprep.PrepProperties.HADOOP_CONF_DIR;

public class Util {
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
