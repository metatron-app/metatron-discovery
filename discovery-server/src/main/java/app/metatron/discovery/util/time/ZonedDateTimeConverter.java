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

package app.metatron.discovery.util.time;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.SignStyle;
import java.util.function.Function;

import static java.time.temporal.ChronoField.DAY_OF_MONTH;
import static java.time.temporal.ChronoField.HOUR_OF_DAY;
import static java.time.temporal.ChronoField.MINUTE_OF_HOUR;
import static java.time.temporal.ChronoField.MONTH_OF_YEAR;
import static java.time.temporal.ChronoField.NANO_OF_SECOND;
import static java.time.temporal.ChronoField.SECOND_OF_MINUTE;
import static java.time.temporal.ChronoField.YEAR;

public class ZonedDateTimeConverter implements Function<String, ZonedDateTime> {

  private static final DateTimeFormatter MONTH = new DateTimeFormatterBuilder()
      .appendLiteral('-')
      .appendValue(MONTH_OF_YEAR, 1, 2, SignStyle.NOT_NEGATIVE)
      .toFormatter();
  private static final DateTimeFormatter DAY = new DateTimeFormatterBuilder()
      .appendLiteral('-')
      .appendValue(DAY_OF_MONTH, 1, 2, SignStyle.NOT_NEGATIVE)
      .toFormatter();
  private static final DateTimeFormatter TIME = new DateTimeFormatterBuilder()
      .appendLiteral('T')
      .appendValue(HOUR_OF_DAY, 1, 2, SignStyle.NOT_NEGATIVE)
      .optionalStart()
      .appendLiteral(':')
      .appendValue(MINUTE_OF_HOUR, 1, 2, SignStyle.NOT_NEGATIVE)
      .optionalStart()
      .appendLiteral(':')
      .appendValue(SECOND_OF_MINUTE, 1, 2, SignStyle.NOT_NEGATIVE)
      .optionalStart()
      .appendFraction(NANO_OF_SECOND, 0, 9, true)
      .optionalEnd()
      .optionalEnd()
      .optionalEnd()
      .toFormatter();
  private static final DateTimeFormatter ZONE = new DateTimeFormatterBuilder()
      .appendZoneOrOffsetId()
      .optionalStart()
      .appendLiteral('[')
      .parseCaseSensitive()
      .appendZoneRegionId()
      .appendLiteral(']')
      .toFormatter();
  public static final DateTimeFormatter JODA_LIKE_PARSER = new DateTimeFormatterBuilder()
      .appendValue(YEAR, 4, 10, SignStyle.EXCEEDS_PAD)
      .appendOptional(MONTH)
      .appendOptional(DAY)
      .appendOptional(TIME)
      .appendOptional(ZONE)
      .parseDefaulting(MONTH_OF_YEAR, 1)
      .parseDefaulting(DAY_OF_MONTH, 1)
      .parseDefaulting(HOUR_OF_DAY, 0)
      .parseDefaulting(MINUTE_OF_HOUR, 0)
      .parseDefaulting(SECOND_OF_MINUTE, 0)
      .toFormatter()
      .withZone(ZoneId.of("UTC"));

  public static ZonedDateTime parse(String input) {
    return ZonedDateTime.parse(input, JODA_LIKE_PARSER);
  }

  @Override
  public ZonedDateTime apply(String input) {
    return parse(input);
  }
}
