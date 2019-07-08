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

package app.metatron.discovery.domain.datasource.format;

import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.joda.time.format.ISODateTimeFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.annotation.PostConstruct;

import app.metatron.discovery.common.MetatronProperties;
import app.metatron.discovery.domain.datasource.DataSourceErrorCodes;
import app.metatron.discovery.domain.datasource.DataSourceException;
import app.metatron.discovery.domain.datasource.TimeFormatCheckRequest;

@Component
public class DateTimeFormatChecker {

  private static Logger LOGGER = LoggerFactory.getLogger(DateTimeFormatChecker.class);

  @Autowired
  MetatronProperties properties;

  Map<String, DateTimeFormatter> supportedFormatters = Maps.newHashMap();


  public DateTimeFormatChecker() {

    supportedFormatters.put("yyyyMMdd", ISODateTimeFormat.basicDate());
    supportedFormatters.put("yyyyMMdd'T'HHmmss.SSSZ", ISODateTimeFormat.basicDateTime());
    supportedFormatters.put("yyyyMMdd'T'HHmmssZ", ISODateTimeFormat.basicDateTimeNoMillis());
    supportedFormatters.put("HHmmss.SSSZ", ISODateTimeFormat.basicTime());
    supportedFormatters.put("HHmmssZ", ISODateTimeFormat.basicTimeNoMillis());
    supportedFormatters.put("yyyy-MM-dd", ISODateTimeFormat.date());
    supportedFormatters.put("yyyy-MM-dd HH:mm:ss", DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss"));
    supportedFormatters.put("yyyy-MM-dd HH:mm:ss.SSSSSS", DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss.SSSSSS")); // Greenplum DB NOW() 함수 포맷
    supportedFormatters.put("yyyy-MM-dd'T'HH:mm:ss.SSS", ISODateTimeFormat.dateHourMinuteSecondMillis());
    supportedFormatters.put("yyyy-MM-dd'T'HH:mm:ss.SSSZZ", ISODateTimeFormat.dateTime());
    supportedFormatters.put("yyyy-MM-dd'T'HH:mm:ssZZ", ISODateTimeFormat.dateTimeNoMillis());
    supportedFormatters.put("HH:mm:ss.SSS", ISODateTimeFormat.hourMinuteSecondMillis());
    supportedFormatters.put("HH:mm:ss", ISODateTimeFormat.hourMinuteSecond());
    supportedFormatters.put("HH:mm", ISODateTimeFormat.hourMinute());
  }

  @PostConstruct
  public void setUpCustomFormatter() {

    List<String> timeFormats = properties.getTimeFormats();

    if(CollectionUtils.isEmpty(timeFormats)) {
      return;
    }

    for (String customTimeFormat : timeFormats) {
      if(supportedFormatters.containsKey(customTimeFormat)) {
        continue;
      }
      try {
        supportedFormatters.put(customTimeFormat, DateTimeFormat.forPattern(customTimeFormat));
      } catch (IllegalArgumentException e) {
        LOGGER.warn("Fail to build datetime format({}) : {}", customTimeFormat, e.getMessage());
        continue;
      }
    }
  }

  public boolean checkTimeFormat(TimeFormatCheckRequest request) {

    if("time_unix".equals(request.getFormat())) {
      return checkUnixTimeFormat(request.getSamples());
    }

    DateTimeFormatter formatter = null;
    try {
      formatter = DateTimeFormat.forPattern(request.getFormat());
    } catch (IllegalArgumentException e) {
      throw new DataSourceException(DataSourceErrorCodes.INVALID_TIMEFORMAT_CODE, e.getMessage());
    }

    return checkTimeFormat(formatter, request.getSamples());
  }

  public boolean checkUnixTimeFormat(List<String> samples) {

    int totalCount = samples.size();
    int count = 0;
    for (String timeStr : samples) {
      if (StringUtils.isBlank(timeStr)) {
        totalCount--;
      } else if(StringUtils.isNumeric(timeStr)) {
        count++;
      }
    }

    if (count >= totalCount * 0.5) {
      return true;
    }

    return false;
  }


  public boolean checkTimeFormat(DateTimeFormatter formatter, List<String> samples) {

    int totalCount = samples.size();
    int count = 0;
    for (String timeStr : samples) {
      if (StringUtils.isBlank(timeStr)) {
        totalCount--;
      } else {
        try {
          formatter.withLocale(Locale.ENGLISH).parseDateTime(timeStr);
        } catch (Exception e) {
          LOGGER.warn("Invalid date format - no match : " + e.getMessage());
          continue;
        }
        count++;
      }
    }

    if (count >= totalCount * 0.5) {
      return true;
    }

    return false;
  }

  public String findPattern(TimeFormatCheckRequest request) {
    List<String> samples = request.getSamples();
    Preconditions.checkArgument(CollectionUtils.isNotEmpty(samples), "'samples' is required.");

    for (String key : supportedFormatters.keySet()) {
      if (checkTimeFormat(supportedFormatters.get(key), samples)) {
        return key;
      }
    }

    throw new DataSourceException(DataSourceErrorCodes.NOT_SUPPORTED_TIMEFORMAT_CODE, "Not suppored timeformat");
  }
}
