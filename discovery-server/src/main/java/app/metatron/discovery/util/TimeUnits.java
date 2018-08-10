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

/**
 * Created by kyungtaak on 2016. 8. 31..
 */
public enum TimeUnits {

  MILLISECOND(1L),
  SECOND(1000L),
  MINUTE(60 * 1000L),
  HOUR(60 * 60 * 1000L),
  DAY(24 * 60 * 60 * 1000L),
  WEEK(7 * 24 * 60 * 60 * 1000L),
  MONTH(31 * 24 * 60 * 60 * 1000L),
  QUARTER(3 * 31 * 24 * 60 * 60 * 1000L),
  YEAR(365 * 24 * 60 * 60 * 1000L);

  long mils;

  TimeUnits(long mils) {
    this.mils = mils;
  }

  public long getMils() {
    return this.mils;
  }
}
