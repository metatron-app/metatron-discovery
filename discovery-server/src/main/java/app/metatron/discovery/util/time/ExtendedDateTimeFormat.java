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

import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;

import java.util.regex.Pattern;

/**
 * http://higher-state.blogspot.com/2013/04/extended-joda-datetime-formatter-to.html
 */
public class ExtendedDateTimeFormat extends DateTimeFormat {

  public static final Pattern PATTERN_PATH_PARAM = Pattern.compile("^([^Q]*)(|Q{1,4})([^Q]*)$");

  public static DateTimeFormatter forPattern(String pattern) {
    return DateTimeFormat.forPattern(pattern);
  }
}
