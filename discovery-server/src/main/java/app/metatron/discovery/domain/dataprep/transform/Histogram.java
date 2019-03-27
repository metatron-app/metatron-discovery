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

package app.metatron.discovery.domain.dataprep.transform;

import static app.metatron.discovery.domain.dataprep.transform.Histogram.Granule.DAY;
import static app.metatron.discovery.domain.dataprep.transform.Histogram.Granule.HOUR;
import static app.metatron.discovery.domain.dataprep.transform.Histogram.Granule.MILLIS;
import static app.metatron.discovery.domain.dataprep.transform.Histogram.Granule.MINUTE;
import static app.metatron.discovery.domain.dataprep.transform.Histogram.Granule.MONTH;
import static app.metatron.discovery.domain.dataprep.transform.Histogram.Granule.NOT_USED;
import static app.metatron.discovery.domain.dataprep.transform.Histogram.Granule.SECOND;
import static app.metatron.discovery.domain.dataprep.transform.Histogram.Granule.YEAR;

import app.metatron.discovery.domain.dataprep.PrepUtil;
import app.metatron.discovery.domain.dataprep.teddy.ColumnType;
import app.metatron.discovery.domain.dataprep.teddy.DataFrame;
import app.metatron.discovery.domain.dataprep.teddy.Row;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// 각 column마다 1개씩
public class Histogram implements Serializable {
  private static Logger LOGGER = LoggerFactory.getLogger(DataFrame.class);

  public enum Granule {
    NOT_USED,
    YEAR,
    MONTH,
    DAY,
    HOUR,
    MINUTE,
    SECOND,
    MILLIS
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Members
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  public int colWidth;
  public int barCnt;                  // colWidth에 따른 barCnt (말하자면 최대값) cf. 실제로 그려지는 bar의 개수는 count.size()
  public int barIdx;                  // 원래 local 변수감인데, java stream을 쓰기 위해 멤버 변수 이용
  public String colName;              // only for debugging

  public List<String> labels;
  public List<String> timestampLabels;
  public Integer distinctValCount;    // 몇 개의 구분값이 있는지 기록 (N categories)

  public List<Integer> counts;        // 각 label에 해당되는 개수
  public int maxCount;                // 최대 count (hisgotram height를 빨리 구할 수 있도록)

  public List<List<Integer>> rownos;  // 각 label에 해당되는 rowno list
  public List<Integer> missingRows;
  public List<Integer> mismatchedRows;
  public List<Integer> matchedRows;

  public String min;                  // Numeric인 경우에만 사용
  public String max;                  // (차후, timestamp도 사용할 듯)

  public int missing;
  public int mismatched;
  public int matched;

  public Granule bestGranularity;
  public String timestampFormat;

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Constructors
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  public Histogram() {
    // JSON으로 serialize되려면 기본 생성자에서 collection을 초기화해줘야 한다.
    labels = new ArrayList<>();
    timestampLabels = new ArrayList<>();
    counts = new ArrayList<>();
    rownos = new ArrayList<>();
    missingRows = new ArrayList<>();
    mismatchedRows = new ArrayList<>();
    matchedRows = new ArrayList<>();
    bestGranularity = NOT_USED;
    timestampFormat = "NOT_USED";
  }

  public Histogram(int colWidth) {
    this();
    this.colWidth = colWidth;

    // 기본 barCnt
    barCnt = (colWidth - 20) / 10;
    assert barCnt > 0 : colWidth;
  }

  // TODO: string, array, map은 공통 코드가 많음

  // 각 키들의 unique한 값들 distinct count 내림차순
  private void updateHistMap(int colno, List<Row> rows) {
    Map<String, Integer> map = new HashMap();
    Map<String, List<Integer>> mapRownos = new HashMap();

    LOGGER.trace("updateHistMap() start: colno={}", colno);

    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Object obj = rows.get(rowno).get(colno);

      // missing, mismatch 처리
      if (obj == null) {
        missing++;
        missingRows.add(rowno);
        continue;
      } else if (!(obj instanceof Map)) {
        mismatched++;
        mismatchedRows.add(rowno);
        continue;
      } else {
        matched++;
        matchedRows.add(rowno);
      }

      assert obj instanceof Map : obj;

      for (Object o : ((Map<String, Object>) obj).keySet()) {
        String str = o.toString();
        Integer cnt = map.get(str);
        map.put(str, cnt == null ? 1 : cnt + 1);

        if ((mapRownos.get(str) == null)) {
          mapRownos.put(str, new ArrayList<>());
        }
        mapRownos.get(str).add(rowno);
      }
    }

    if (map.size() == 0) {
      LOGGER.trace("updateHistMap() end: colno={} map.size()=0", colno);
      return;
    }
    distinctValCount = map.size();
    barCnt = Math.min(barCnt, distinctValCount);

    map.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(barCnt)
            .forEach(entry -> {
              labels.add(entry.getKey());
              counts.add(entry.getValue());
              rownos.add(mapRownos.get(entry.getKey()));
            });

    // 내용이 없으면 최대 count는 0. 아니면 제일 앞의 값.
    maxCount = counts.size() == 0 ? 0 : counts.get(0);

    LOGGER.trace("updateHistMap() end: colno={}", colno);
  }

  // 각 원소들의 unique한 값들 distinct count 내림차순
  private void updateHistArray(int colno, List<Row> rows) {
    Map<String, Integer> map = new HashMap();
    Map<String, List<Integer>> mapRownos = new HashMap();

    LOGGER.trace("updateHistArray() start: colno={}", colno);

    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Object obj = rows.get(rowno).get(colno);

      // missing, mismatch 처리
      if (obj == null) {
        missing++;
        missingRows.add(rowno);
        continue;
      } else if (!(obj instanceof List)) {
        mismatched++;
        mismatchedRows.add(rowno);
        continue;
      } else {
        matched++;
        matchedRows.add(rowno);
      }
      assert obj instanceof List : obj;

      for (Object o : (List<Object>) obj) {
        String str = o.toString();
        Integer cnt = map.get(str);
        map.put(str, cnt == null ? 1 : cnt + 1);

        if ((mapRownos.get(str) == null)) {
          mapRownos.put(str, new ArrayList<>());
        }
        mapRownos.get(str).add(rowno);
      }
    }

    if (map.size() == 0) {
      LOGGER.trace("updateHistArray() end: colno={} map.size()=0", colno);
      return;
    }
    distinctValCount = map.size();
    barCnt = Math.min(barCnt, distinctValCount);

    map.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(barCnt)
            .forEach(entry -> {
              labels.add(entry.getKey());
              counts.add(entry.getValue());
              rownos.add(mapRownos.get(entry.getKey()));
            });

    // 내용이 없으면 최대 count는 0. 아니면 제일 앞의 값.
    maxCount = counts.size() == 0 ? 0 : counts.get(0);

    LOGGER.trace("updateHistArray() end: colno={}", colno);
  }

  private void updateHistString(int colno, List<Row> rows) {
    Map<String, Integer> map = new HashMap();
    Map<String, List<Integer>> mapRownos = new HashMap();

    LOGGER.trace("updateHistString() start: colno={}", colno);

    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Object obj = rows.get(rowno).get(colno);

      // missing, mismatch 처리
      if (obj == null) {
        missing++;
        missingRows.add(rowno);
        continue;
      } else if (!(obj instanceof String)) {
        mismatched++;
        mismatchedRows.add(rowno);
        continue;
      } else {
        matched++;
        matchedRows.add(rowno);
      }

      assert obj instanceof String : obj;
      String str = (String) obj;

      Integer cnt = map.get(str);
      map.put(str, cnt == null ? 1 : cnt + 1);

      if ((mapRownos.get(str) == null)) {
        mapRownos.put(str, new ArrayList<>());
      }
      mapRownos.get(str).add(rowno);
    }

    if (map.size() == 0) {
      LOGGER.trace("updateHistString() end: colno={} map.size()=0", colno);
      return;
    }
    distinctValCount = map.size();
    barCnt = Math.min(barCnt, distinctValCount);

    map.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(barCnt)
            .forEach(entry -> {
              labels.add(entry.getKey());
              counts.add(entry.getValue());
              rownos.add(mapRownos.get(entry.getKey()));
            });

    // 내용이 없으면 최대 count는 0. 아니면 제일 앞의 값.
    maxCount = counts.size() == 0 ? 0 : counts.get(0);

    LOGGER.trace("updateHistString() end: colno={}", colno);
  }

  private void updateHistBoolean(int colno, List<Row> rows) {
    int trueCnt = 0;
    int falseCnt = 0;

    LOGGER.trace("updateHistBoolean() start: colno={}", colno);

    labels.add("true");
    labels.add("false");
    labels.add("dummy");

    rownos.add(new ArrayList<>());
    rownos.add(new ArrayList<>());

    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Object obj = rows.get(rowno).get(colno);

      // missing, mismatch 처리
      if (obj == null) {
        missing++;
        missingRows.add(rowno);
        continue;
      } else if (!(obj instanceof Boolean)) {
        mismatched++;
        mismatchedRows.add(rowno);
        continue;
      } else {
        matched++;
        matchedRows.add(rowno);
      }

      assert obj instanceof Boolean : obj;
      if (obj.equals(Boolean.TRUE)) {
        trueCnt++;
        rownos.get(0).add(rowno);
      } else {
        falseCnt++;
        rownos.get(1).add(rowno);
      }
    }
    distinctValCount = 2;

    counts.add(trueCnt);
    counts.add(falseCnt);

    // 내용이 없으면 최대 count는 0. 아니면 제일 앞의 값.
    maxCount = Math.max(counts.get(0), counts.get(1));

    LOGGER.trace("updateHistBoolean() end: colno={}", colno);
  }

  private void updateHistLong(int colno, List<Row> rows) {
    Map<Long, List<Integer>> mapRownos = new HashMap();
    Long min = null;
    Long max = null;

    LOGGER.trace("updateHistLong() start: colno={}", colno);

    Map<Long, Integer> map = new HashMap();
    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Object obj = rows.get(rowno).get(colno);

      // missing, mismatch 처리
      if (obj == null) {
        missing++;
        missingRows.add(rowno);
        continue;
      } else if (!(obj instanceof Long)) {
        mismatched++;
        mismatchedRows.add(rowno);
        continue;
      } else {
        matched++;
        matchedRows.add(rowno);
      }

      assert obj instanceof Long : obj;
      Long val = (Long) obj;

      Integer cnt = map.get(val);
      map.put(val, cnt == null ? 1 : cnt + 1);

      if ((mapRownos.get(val) == null)) {
        mapRownos.put(val, new ArrayList<>());
      }
      mapRownos.get(val).add(rowno);

      // 첫 원소일 경우 처리
      if (min == null) {
        assert max == null : max;
        min = max = val;
        continue;
      }

      // min, max는 sort전에 파악
      if (val < min) {
        min = val;
      } else if (val > max) {
        max = val;
      }
    }

    if (map.size() == 0) {
      LOGGER.trace("updateHistLong() end: colno={}: map.size()=0", colno);
      return;
    }
    distinctValCount = map.size();

    this.min = min.toString();
    this.max = max.toString();

    if (min.equals(max)) {
      barCnt = 1;
      maxCount = rows.size();
      labels.add(this.min);
      labels.add(this.max);     // 일부러 2번 넣은거 맞음
      counts.add(rows.size());
      rownos.add(mapRownos.get(min));
      LOGGER.trace("updateHistLong() end: colno={}: single value", colno);
      return;
    }

    if (max - min + 1 < barCnt) {
      barCnt = (int) (max - min + 1);
    }

    List<Long> longLabels = getLongLabels(min, max, barCnt);
    assert longLabels.size() >= 2 : longLabels.size();

    // FIXME: 중간 변수 longCounts는 없어도 될 듯

    List<Integer> longCounts = new ArrayList<>();
    for (int i = 0; i < longLabels.size() - 1; i++) {   // 마지막 label에 대한 count는 없음
      longCounts.add(0);
    }

    barIdx = 0;
    map.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry -> {
              // 다음 bucket으로 이동. sort가 잘 되었고, 경계값이 잘 설정되었다면, 마지막 bucket을 넘기 전에 stream이 끝난다.
              while (entry.getKey() >= longLabels.get(barIdx + 1)) {
                barIdx++;
              }
              longCounts.set(barIdx, longCounts.get(barIdx) + entry.getValue());

              while (rownos.size() <= barIdx) {
                rownos.add(new ArrayList<>());
              }
              rownos.get(barIdx).addAll(mapRownos.get(entry.getKey()));

              // 최대 count 갱신
              if (longCounts.get(barIdx) > maxCount) {
                maxCount = longCounts.get(barIdx);
              }
            });

    int i = 0;
    for (/* NOP */; i < longLabels.size() - 1; i++) {
      labels.add(longLabels.get(i).toString());
      counts.add(longCounts.get(i));
    }
    labels.add(longLabels.get(i).toString());

    LOGGER.trace("updateHistLong() end: colno={}", colno);
  }

  private String trimTimestampIntoString(DateTime dt) {
    if (dt.getMillisOfSecond() == 0) {
      if (dt.getSecondOfMinute() == 0) {
        if (dt.getMinuteOfHour() == 0) {
          if (dt.getHourOfDay() == 0) {
            DateTimeFormatter dtf = DateTimeFormat.forPattern("yyyy-MM-dd");
            return dtf.print(dt);
          }
          DateTimeFormatter dtf = DateTimeFormat.forPattern("yyyy-MM-dd'T'hh");
          return dtf.print(dt);
        }
        DateTimeFormatter dtf = DateTimeFormat.forPattern("yyyy-MM-dd'T'hh:mm");
        return dtf.print(dt);
      }
      DateTimeFormatter dtf = DateTimeFormat.forPattern("yyyy-MM-dd'T'hh:mm:ss");
      return dtf.print(dt);
    }
    DateTimeFormatter dtf = DateTimeFormat.forPattern("yyyy-MM-dd'T'hh:mm:ss.SSS");
    return dtf.print(dt);
  }

  private DateTimeFormatter getBestFormatter(DateTime min, DateTime max) {
    switch (bestGranularity) {
      case NOT_USED:
        assert false;
      case YEAR:
        timestampFormat = "yyyy";
        return DateTimeFormat.forPattern("yyyy");
      case MONTH:
        timestampFormat = "yyyy-MM";
        return DateTimeFormat.forPattern("yyyy-MM");
      case DAY:
        if (min.getYear() == max.getYear()) {                   // 연도가 같으면 월부터만
          timestampFormat = "MM-dd";
          return DateTimeFormat.forPattern("MM-dd");
        }
        timestampFormat = "yyyy-MM-dd";
        return DateTimeFormat.forPattern("yyyy-MM-dd");
      case HOUR:
        if (min.getYear() == max.getYear()) {
          if (min.getMonthOfYear() == max.getMonthOfYear()) {   // 월이 같으면 일부터만
            timestampFormat = "dd\\'T\\'hh";
            return DateTimeFormat.forPattern("dd'T'hh");
          }
          timestampFormat = "MM-dd\\'T\\'hh";
          return DateTimeFormat.forPattern("MM-dd'T'hh");
        }
        timestampFormat = "yyyy-MM-dd\\'T\\'hh";
        return DateTimeFormat.forPattern("yyyy-MM-dd'T'hh");
      case MINUTE:
        if (min.getYear() == max.getYear()) {
          if (min.getMonthOfYear() == max.getMonthOfYear()) {
            if (min.getDayOfMonth() == max.getDayOfMonth()) {
              timestampFormat = "hh:mm";
              return DateTimeFormat.forPattern("hh:mm");        // 일이 같으면 시부터만
            }
            timestampFormat = "dd\\'T\\'hh:mm";
            return DateTimeFormat.forPattern("dd'T'hh:mm");
          }
          timestampFormat = "MM-dd\\'T\\'hh:mm";
          return DateTimeFormat.forPattern("MM-dd'T'hh:mm");
        }
        timestampFormat = "yyyy-MM-dd\\'T\\'hh:mm";
        return DateTimeFormat.forPattern("yyyy-MM-dd'T'hh:mm");
      case SECOND:
        if (min.getYear() == max.getYear()) {
          if (min.getMonthOfYear() == max.getMonthOfYear()) {
            if (min.getDayOfMonth() == max.getDayOfMonth()) {
              if (min.getHourOfDay() == max.getDayOfMonth()) {  // 시가 같으면 분부터만
                timestampFormat = "mm:ss";
                return DateTimeFormat.forPattern("mm:ss");
              }
              timestampFormat = "hh:mm:ss";
              return DateTimeFormat.forPattern("hh:mm:ss");
            }
            timestampFormat = "dd\\'T\\'hh:mm:ss";
            return DateTimeFormat.forPattern("dd'T'hh:mm:ss");
          }
          timestampFormat = "MM-dd\\'T\\'hh:mm:ss";
          return DateTimeFormat.forPattern("MM-dd'T'hh:mm:ss");
        }
        timestampFormat = "yyyy-MM-dd\\'T\\'hh:mm:ss";
        return DateTimeFormat.forPattern("yyyy-MM-dd'T'hh:mm:ss");
      case MILLIS:
        if (min.getYear() == max.getYear()) {
          if (min.getMonthOfYear() == max.getMonthOfYear()) {
            if (min.getDayOfMonth() == max.getDayOfMonth()) {
              if (min.getHourOfDay() == max.getDayOfMonth()) {
                if (min.getMinuteOfHour() == max.getDayOfMonth()) {
                  timestampFormat = "ss.SSS";
                  return DateTimeFormat.forPattern("ss.SSS");   // 분이 같으면 초부터만
                }
                timestampFormat = "mm:ss.SSS";
                return DateTimeFormat.forPattern("mm:ss.SSS");
              }
              timestampFormat = "hh:mm:ss.SSS";
              return DateTimeFormat.forPattern("hh:mm:ss.SSS");
            }
            timestampFormat = "dd\\'T\\'hh:mm:ss.SSS";
            return DateTimeFormat.forPattern("dd'T'hh:mm:ss.SSS");
          }
          timestampFormat = "MM-dd\\'T\\'hh:mm:ss.SSS";
          return DateTimeFormat.forPattern("MM-dd'T'hh:mm:ss.SSS");
        }
        timestampFormat = "yyyy-MM-dd\\'T\\'hh:mm:ss.SSS";
        return DateTimeFormat.forPattern("yyyy-MM-dd'T'hh:mm:ss.SSS");
    }
    assert false;
    return null;
  }

  private void updateHistTimestamp(int colno, List<Row> rows) {
    Map<DateTime, List<Integer>> mapRownos = new HashMap();
    DateTime min = null;
    DateTime max = null;

    LOGGER.trace("updateHistTimestamp() start: colno={}", colno);

    Map<DateTime, Integer> map = new HashMap();
    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Object obj = rows.get(rowno).get(colno);

      // missing, mismatch 처리
      if (obj == null) {
        missing++;
        missingRows.add(rowno);
        continue;
      } else if (!(obj instanceof DateTime)) {
        mismatched++;
        mismatchedRows.add(rowno);
        continue;
      } else {
        matched++;
        matchedRows.add(rowno);
      }

      assert obj instanceof DateTime : obj;
      DateTime val = (DateTime) obj;

      Integer cnt = map.get(val);
      map.put(val, cnt == null ? 1 : cnt + 1);

      if ((mapRownos.get(val) == null)) {
        mapRownos.put(val, new ArrayList<>());
      }
      mapRownos.get(val).add(rowno);

      // 첫 원소일 경우 처리
      if (min == null) {
        assert max == null : max;
        min = max = val;
        continue;
      }

      // min, max는 sort전에 파악
      if (val.isBefore(min)) {
        min = val;
      } else if (val.isAfter(max)) {
        max = val;
      }
    }

    if (map.size() == 0) {
      LOGGER.trace("updateHistTimestamp() end: colno={}: map.size()=0", colno);
      return;
    }
    distinctValCount = map.size();

    this.min = trimTimestampIntoString(min);
    this.max = trimTimestampIntoString(max);

    if (min.equals(max)) {
      barCnt = 1;
      maxCount = rows.size();
      labels.add(this.min);
      labels.add(this.max);     // 일부러 2번 넣은거 맞음
      counts.add(rows.size());
      rownos.add(mapRownos.get(min));
      LOGGER.trace("updateHistTimestamp() end: colno={}: single value", colno);
      return;
    }

    List<DateTime> tsLabels = getTimestampLabels(min, max, barCnt);
    assert tsLabels.size() >= 2 : tsLabels.size();

    for (int i = 0; i < tsLabels.size() - 1; i++) {
      counts.add(0);
      rownos.add(new ArrayList<>());
    }

    barIdx = 0;
    map.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry -> {
              // 다음 bucket으로 이동. sort가 잘 되었고, 경계값이 잘 설정되었다면, 마지막 bucket을 넘기 전에 stream이 끝난다.
              while (entry.getKey().isEqual(tsLabels.get(barIdx + 1)) ||
                     entry.getKey().isAfter(tsLabels.get(barIdx + 1))) {
                barIdx++;
              }
              counts.set(barIdx, counts.get(barIdx) + entry.getValue());
              rownos.get(barIdx).addAll(mapRownos.get(entry.getKey()));

              // 최대 count 갱신
              if (counts.get(barIdx) > maxCount) {
                maxCount = counts.get(barIdx);
              }
            });

    int i = 0;
    for (/* NOP */; i < tsLabels.size(); i++) {
      labels.add(getBestFormatter(min, max).print(tsLabels.get(i)));
      timestampLabels.add(tsLabels.get(i).toString());
    }

    LOGGER.trace("updateHistTimestamp() end: colno={}", colno);
  }

  private void updateHistDouble(int colno, List<Row> rows) {
    Map<Double, List<Integer>> mapRownos = new HashMap();
    Double min = null;
    Double max = null;

    LOGGER.trace("updateHistDouble() start: colno={}", colno);

    Map<Double, Integer> map = new HashMap();
    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Object obj = rows.get(rowno).get(colno);

      // missing, mismatch 처리
      if (obj == null) {
        missing++;
        missingRows.add(rowno);
        continue;
      } else if (!(obj instanceof Double)) {
        mismatched++;
        mismatchedRows.add(rowno);
        continue;
      } else {
        matched++;
        matchedRows.add(rowno);
      }

      assert obj instanceof Double : obj;
      Double val = (Double) obj;

      Integer cnt = map.get(val);
      map.put(val, cnt == null ? 1 : cnt + 1);

      if ((mapRownos.get(val) == null)) {
        mapRownos.put(val, new ArrayList<>());
      }
      mapRownos.get(val).add(rowno);

      // 첫 원소일 경우 처리
      if (min == null) {
        assert max == null : max;
        min = max = val;
        continue;
      }

      // min, max는 sort전에 파악
      if (val < min) {
        min = val;
      } else if (val > max) {
        max = val;
      }
    }

    if (map.size() == 0) {
      LOGGER.trace("updateHistDouble() end: colno={}: map.size()=0", colno);
      return;
    }
    distinctValCount = map.size();

    this.min = String.format("%.15f", min);
    this.max = String.format("%.15f", max);

    if (min.equals(max)) {
      barCnt = 1;
      maxCount = rows.size();
      labels.add(this.min);
      labels.add(this.max);     // 일부러 2번 넣은거 맞음
      counts.add(rows.size());
      rownos.add(mapRownos.get(min));
      LOGGER.trace("updateHistDouble() end: colno={}: single value", colno);
      return;
    }

    List<Double> doubleLabels = getDoubleLabels(min, max, barCnt);
    assert doubleLabels.size() >= 2 : doubleLabels.size();

    List<Integer> doubleCounts = new ArrayList<>();
    for (int i = 0; i < doubleLabels.size() - 1; i++) {   // 마지막 label에 대한 count는 없음
      doubleCounts.add(0);
    }

    barIdx = 0;
    map.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry -> {
              // 다음 bucket으로 이동. sort가 잘 되었고, 경계값이 잘 설정되었다면, 마지막 bucket을 넘기 전에 stream이 끝난다.
              while (entry.getKey() >= doubleLabels.get(barIdx + 1)) {
                barIdx++;
              }
              doubleCounts.set(barIdx, doubleCounts.get(barIdx) + entry.getValue());

              while (rownos.size() <= barIdx) {   // 이 label이 될 때까지 rownos를 채워넣음. 중간에 있는 count가 0인 label들 때문에.
                rownos.add(new ArrayList<>());
              }
              rownos.get(barIdx).addAll(mapRownos.get(entry.getKey()));

              // 최대 count 갱신
              if (doubleCounts.get(barIdx) > maxCount) {
                maxCount = doubleCounts.get(barIdx);
              }
            });

    int i = 0;
    for (/* NOP */; i < doubleLabels.size() - 1; i++) {
      labels.add(doubleLabels.get(i).toString());
      counts.add(doubleCounts.get(i));
    }
    labels.add(doubleLabels.get(i).toString());

    LOGGER.trace("updateHistDouble() end: colno={}", colno);
  }

  public static Histogram createHist(int colWidth, ColumnType colType, List<Row> rows, int colno, String colName) {
    Histogram colHist = new Histogram(colWidth);
    colHist.colName = colName;

    LOGGER.trace("createHist() start: colno={} colName={} colWidth={} colType={}", colno, colName, colWidth, colType);

    switch (colType) {
      case STRING:
        colHist.updateHistString(colno, rows);
        break;
      case LONG:
        colHist.updateHistLong(colno, rows);
        break;
      case DOUBLE:
        colHist.updateHistDouble(colno, rows);
        break;
      case BOOLEAN:
        colHist.updateHistBoolean(colno, rows);
        break;
      case ARRAY:
        colHist.updateHistArray(colno, rows);
        break;
      case MAP:
        colHist.updateHistMap(colno, rows);
        break;
      case TIMESTAMP:
        // 세기/10년/5년/3년/1년/6개월/3개월/월/15일/10일/5일/일/12시간/6시간/3시간/1시간/30분/15분/10분/5분/3분/1분/30초/15초/10초/5초/3초/1초/100ms/10ms/1ms/100us/10us/1us
        colHist.updateHistTimestamp(colno, rows);
        break;
      case UNKNOWN:
        assert false;
    }

    LOGGER.trace("createHist() end: colno={} labels={}", colno, colHist.labels);
    return colHist;
  }

  // TODO: 다음의 경우 optimization이 필요하다
  // 1. 내용도 컬럼폭도 안바뀌는 경우 (rename, header)
  // 2. 컬럼폭만 바뀐 경우 최대값, 최소값, distinct count 등을 재계산 할 필요 없음
  //   2.1. 만약 sort된 결과를 저장하면, 빠르게 재계산 할 수 있음

  public static Histogram createHist(String colName, ColumnType colType, List<Row> rows, int colno, Integer colWidth) {
    int colNameLen = PrepUtil.getLengthUTF8(colName);
    int maxColDataLen = 0;
    for (int rowno = 0; rowno < rows.size(); rowno++) {
      Object obj = rows.get(rowno).get(colno);
      int len = obj == null ? 0 : PrepUtil.getLengthUTF8(obj.toString());
      maxColDataLen = Math.max(maxColDataLen, len);
    }
    if (colWidth == null) {
      colWidth = Math.min(Math.max(Math.max(colNameLen * 12 + 62, maxColDataLen * 12), 100), 500);
    }
    return createHist(colWidth, colType, rows, colno, colName);
  }

  private static double getIncr(double min, double max, int barCnt) {
    assert barCnt > 1 : barCnt;
    double interval = (max - min) / (double) barCnt;
    int exp = (int) Math.floor(Math.log10(interval));
    double sized = interval * Math.pow(10, -exp);
    int incr;
    if (sized > 5) {
      incr = 10;
      return (incr * Math.pow(10, exp));
    } else if (sized > 2) {
      incr = 5;
      return (incr * Math.pow(10, exp));
    } else if (sized > 1) {
      incr = 2;
      return (incr * Math.pow(10, exp));
    } else {
      incr = 1;
      return (incr * Math.pow(10, exp));
    }
  }

  private static long getIncr(long min, long max, int barCnt) {
    assert barCnt > 1 : barCnt;
    double interval = (max - min) / ((double) barCnt - 1);  // -1을 해주는 것이 double 버전과 다른 점
    int exp = (int) Math.floor(Math.log10(interval));
    double sized = interval * Math.pow(10, -exp);
    int incr;
    if (sized > 5) {
      incr = 10;
      return (long) (incr * Math.pow(10, exp));
    } else if (sized > 2) {
      incr = 5;
      return (long) (incr * Math.pow(10, exp));
    } else if (sized > 1) {
      incr = 2;
      return (long) (incr * Math.pow(10, exp));
    } else {
      incr = 1;
      return (long) (incr * Math.pow(10, exp));
    }
  }

  public static List<Double> getDoubleLabels(double min, double max, int barCnt) {
    List<Double> labels = new ArrayList<>();
    double incr;
    double label;

    assert min != max : min;

    if (barCnt == 1) {
      labels.add(min);
      labels.add(max);
      return labels;
    }

    incr = getIncr(min, max, barCnt);

    double border = min - PrepUtil.round(min % incr);  // rounding이 매우 중요.
    if (border == PrepUtil.round(min - incr)) {
      border = min;
    }
    for (label = min < border ? border - incr : border; label <= max; label += incr) {   // min이 음수인 경우 min이 mod보다 작음
      labels.add(PrepUtil.round(label));
    }
    labels.add(label);

    assert min >= labels.get(0) : String.format("min=%.15f start_label=%.15f", min, labels.get(0));
    assert min < labels.get(1) : String.format("min=%.15f start_label=%.15f", min, labels.get(1));
    assert max >= labels.get(labels.size() - 2) : String.format("max=%.15f end_label=%.15f", max, labels.get(labels.size() - 2));
    assert max < labels.get(labels.size() - 1) : String.format("max=%.15f end_label=%.15f", max, labels.get(labels.size() - 1));

    return labels;
  }

  public static List<Long> getLongLabels(long min, long max, int barCnt) {
    List<Long> labels = new ArrayList<>();

    LOGGER.trace("getLongLabels() start: min={} max={} barCnt={}", min, max, barCnt);

    assert min != max : min;

    if (barCnt == 1) {
      labels.add(min);
      labels.add(max);
      LOGGER.trace("getLongLabels() end: single barCnt: labels={}", labels);
      return labels;
    }

    // 구분값이 주어진 barCnt보다 적을 때,
    if (max - min + 1 <= barCnt) {
      long i;
      for (i = min; i <= max; i++) {
        labels.add(i);
      }
      labels.add(i);
      LOGGER.trace("getLongLabels() end: less than barCnt: labels={} barCnt={}", labels, barCnt);
      return labels;
    }

    long incr = getIncr(min, max, barCnt);

    long border = min - (min % incr);
    long label0 = min < border ? border - incr : border;
    long label = label0;

    // If label < label0, it's overflowed.
    for (/* NOP */; label <= max && label >= label0; label += incr) {
      labels.add(label);
    }
    labels.add(label < label0 ? Long.MAX_VALUE : label);

    assert min >= labels.get(0) : String.format("min=%d start_label=%d", min, labels.get(0));
    assert min < labels.get(1) : String.format("min=%d start_label=%d", min, labels.get(1));
    assert max >= labels.get(labels.size() - 2) : String.format("max=%d end_label=%d", max, labels.get(labels.size() - 2));
    assert max < labels.get(labels.size() - 1) : String.format("max=%d end_label=%d", max, labels.get(labels.size() - 1));

    LOGGER.trace("getLongLabels() end: labels={}", labels);
    return labels;
  }

  private List<DateTime> getYearLabels(DateTime min, DateTime max, int unitSize) {
    List<DateTime> labels = new ArrayList<>();

    DateTime dt = new DateTime(min.getYear(), 1, 1, 0, 0);
    while (dt.isBefore(max) || dt.isEqual(max)) {
      labels.add(dt);
      dt = dt.plusYears(unitSize);
    }
    labels.add(dt);
    return labels;
  }

  private List<DateTime> getMonthLabels(DateTime min, DateTime max, int unitSize) {
    List<DateTime> labels = new ArrayList<>();

    DateTime dt = new DateTime(min.getYear(), 1, 1, 0, 0);                            // 일단 1월 1일로 맞추고 시작
    while (dt.isBefore(max) || dt.isEqual(max)) {
      DateTime dtPlus = dt.plusMonths(unitSize);
      if (dtPlus.isAfter(min)) {                                                      // min이 포함되지 않은 범위라면 labels에 넣지 않음
        labels.add(dt);
      }
      dt = dtPlus;
    }
    labels.add(dt);   // which includes the max
    return labels;
  }

  private List<DateTime> getDayLabels(DateTime min, DateTime max, int unitSize) {
    List<DateTime> labels = new ArrayList<>();

    DateTime dt = new DateTime(min.getYear(), min.getMonthOfYear(), 1, 0, 0);       // 일단 1일로 맞추고 시작
    while (dt.isBefore(max) || dt.isEqual(max)) {
      DateTime dtPlus = dt.plusDays(unitSize);
      if (dtPlus.getMonthOfYear() != dt.getMonthOfYear()) {                         // 2월
        dtPlus = new DateTime(dtPlus.getYear(), dtPlus.getMonthOfYear(), 1, 0, 0);
      } else if (dtPlus.getDayOfMonth() == 31 && unitSize >= 5) {                   // 1, 3, 5, 7, 8, 10, 12월
        dtPlus = dtPlus.plusDays(1);                                                // 5일 이상 간격일 경우 31일을 앞 범위에 포함
      }
      if (dtPlus.isAfter(min)) {                                                    // min이 포함되지 않은 범위라면 labels에 넣지 않음
        labels.add(dt);
      }
      dt = dtPlus;
    }
    labels.add(dt);   // which includes the max
    return labels;
  }

  private List<DateTime> getHourLabels(DateTime min, DateTime max, int unitSize) {
    List<DateTime> labels = new ArrayList<>();

    DateTime dt = new DateTime(min.getYear(), min.getMonthOfYear(), min.getDayOfMonth(),
                               min.getHourOfDay() / unitSize * unitSize, 0);
    while (dt.isBefore(max) || dt.isEqual(max)) {
      labels.add(dt);
      dt = dt.plusHours(unitSize);
    }
    labels.add(dt);
    return labels;
  }

  private List<DateTime> getMinuteLabels(DateTime min, DateTime max, int unitSize) {
    List<DateTime> labels = new ArrayList<>();

    DateTime dt = new DateTime(min.getYear(), min.getMonthOfYear(), min.getDayOfMonth(),
                               min.getHourOfDay(), min.getMinuteOfHour() / unitSize * unitSize);
    while (dt.isBefore(max) || dt.isEqual(max)) {
      labels.add(dt);
      dt = dt.plusMinutes(unitSize);
    }
    labels.add(dt);
    return labels;
  }

  private List<DateTime> getSecondLabels(DateTime min, DateTime max, int unitSize) {
    List<DateTime> labels = new ArrayList<>();

    DateTime dt = new DateTime(min.getYear(), min.getMonthOfYear(), min.getDayOfMonth(),
            min.getHourOfDay(), min.getMinuteOfHour(), min.getSecondOfMinute() / unitSize * unitSize);
    while (dt.isBefore(max) || dt.isEqual(max)) {
      labels.add(dt);
      dt = dt.plusSeconds(unitSize);
    }
    labels.add(dt);
    return labels;
  }

  private List<DateTime> getMillisLabels(DateTime min, DateTime max, int unitSize) {
    List<DateTime> labels = new ArrayList<>();

    DateTime dt = new DateTime(min.getYear(), min.getMonthOfYear(), min.getDayOfMonth(),
            min.getHourOfDay(), min.getMinuteOfHour(), min.getSecondOfMinute(), min.getMillisOfSecond() / unitSize * unitSize);
    while (dt.isBefore(max) || dt.isEqual(max)) {
      labels.add(dt);
      dt = dt.plusMillis(unitSize);
    }
    labels.add(dt);
    return labels;
  }

  private List<DateTime> getFinestLabels(DateTime min, DateTime max, int barCnt, List<DateTime> currentBestLabels,
                                         List<Granule> granules, List<Integer> unitSizes) {
    LOGGER.trace("getFinestLabels() start: granules={} unitSizes={}", granules, unitSizes);
    assert granules.size() > 0;
    assert granules.size() == unitSizes.size() : String.format("granules.size=%d unitSizes.size=%d",
            granules.size(), unitSizes.size());
    for (int i = 0; i < granules.size(); i++) {
      List<DateTime> labels = null;
      Granule savedBest = bestGranularity;
      switch (granules.get(i)) {
        case YEAR:
          bestGranularity = YEAR;
          labels = getYearLabels(min, max, unitSizes.get(i));
          break;
        case MONTH:
          bestGranularity = MONTH;
          labels = getMonthLabels(min, max, unitSizes.get(i));
          break;
        case DAY:
          bestGranularity = DAY;
          labels = getDayLabels(min, max, unitSizes.get(i));
          break;
        case HOUR:
          bestGranularity = HOUR;
          labels = getHourLabels(min, max, unitSizes.get(i));
          break;
        case MINUTE:
          bestGranularity = MINUTE;
          labels = getMinuteLabels(min, max, unitSizes.get(i));
          break;
        case SECOND:
          bestGranularity = SECOND;
          labels = getSecondLabels(min, max, unitSizes.get(i));
          break;
        case MILLIS:
          bestGranularity = MILLIS;
          labels = getMillisLabels(min, max, unitSizes.get(i));
          break;
      }
      if (labels.size() - 1 > barCnt) {   // 마지막 label은 단지 경계값
        bestGranularity = savedBest;
        break;
      }
      currentBestLabels = labels;
    }
    LOGGER.trace("getFinestLabels() end: currentBestLabels={}", currentBestLabels);
    return currentBestLabels;
  }


  // barCnt 이내로 최대한 fine-grain한 granularity를 찾는다.
  private List<DateTime> getTimestampLabels(DateTime min, DateTime max, int barCnt) {
    List<DateTime> labels = new ArrayList<>();

    assert !min.equals(max) : min;
    assert barCnt > 1 : barCnt;     // 1개인 경우는 caller에서 처리됨 (updateHistTimestamp)

    // 최저 granularity
    labels.add(new DateTime(min.getYear() / 10 * 10, 1, 1, 0, 0));
    labels.add(new DateTime(max.getYear() / 10 * 10, 1, 1, 0, 0));
    bestGranularity = YEAR;

    List<Granule> granules  = new ArrayList<>();
    List<Integer> unitSizes = new ArrayList<>();

    granules.addAll( Arrays.asList(new Granule[]{YEAR, YEAR, YEAR, YEAR, YEAR, YEAR, YEAR, YEAR, YEAR}));
    unitSizes.addAll(Arrays.asList(new Integer[]{5000, 1000,  500,  100,   50,   10,    5,    2,    1}));

    granules.addAll( Arrays.asList(new Granule[]{MONTH, MONTH, MONTH, MONTH}));
    unitSizes.addAll(Arrays.asList(new Integer[]{    6,    3,      2,     1}));

    granules.addAll( Arrays.asList(new Granule[]{DAY, DAY, DAY, DAY, DAY, DAY}));
    unitSizes.addAll(Arrays.asList(new Integer[]{ 15,  10,   5,   3,   2,   1}));

    granules.addAll( Arrays.asList(new Granule[]{HOUR, HOUR, HOUR, HOUR}));
    unitSizes.addAll(Arrays.asList(new Integer[]{   6,    3,    2,    1}));

    granules.addAll( Arrays.asList(new Granule[]{MINUTE, MINUTE, MINUTE, MINUTE, MINUTE, MINUTE, MINUTE}));
    unitSizes.addAll(Arrays.asList(new Integer[]{    30,     15,     10,      5,      3,      2,      1}));

    granules.addAll( Arrays.asList(new Granule[]{SECOND, SECOND, SECOND, SECOND, SECOND, SECOND, SECOND}));
    unitSizes.addAll(Arrays.asList(new Integer[]{    30,     15,     10,      5,      3,      2,      1}));

    granules.addAll( Arrays.asList(new Granule[]{MILLIS, MILLIS, MILLIS, MILLIS, MILLIS, MILLIS, MILLIS}));
    unitSizes.addAll(Arrays.asList(new Integer[]{   500,    100,     50,     10,      5,      2,      1}));

    labels = getFinestLabels(min, max, barCnt, labels, granules, unitSizes);
    return labels;
  }
}
