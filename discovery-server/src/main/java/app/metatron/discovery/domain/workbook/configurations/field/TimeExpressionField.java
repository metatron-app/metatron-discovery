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

package app.metatron.discovery.domain.workbook.configurations.field;

import org.joda.time.DateTimeZone;

import java.util.Locale;

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.domain.engine.EngineQueryProperties;
import app.metatron.discovery.util.EnumUtils;

public abstract class TimeExpressionField extends Field {

  /**
   * Contiuous Type
   */
  ContiuousType contUnit;

  /**
   * Discontiuous Type
   */
  DiscontiuousType disContUnit;

  /**
   * 2-depth discontiuous Type
   */
  DiscontiuousByType disContByUnit;

  /**
   * 출력 시간대 지정
   */
  String timeZone;

  /**
   * Locale 지정
   */
  String locale;

  public TimeExpressionField() {
  }

  public TimeExpressionField(String name, String alias, String ref,
                             String contUnit,
                             String disContUnit,
                             String disContByUnit,
                             String timeZone,
                             String locale) {
    super(name, alias, ref);

    this.contUnit = EnumUtils.getUpperCaseEnum(ContiuousType.class, contUnit);
    this.disContUnit = EnumUtils.getUpperCaseEnum(DiscontiuousType.class, disContUnit);
    this.disContByUnit = EnumUtils.getUpperCaseEnum(DiscontiuousByType.class, disContByUnit);

    if(this.contUnit == null && this.disContByUnit == null) {
      this.contUnit = ContiuousType.NONE;
    }

    try {
      this.timeZone = timeZone == null ? EngineQueryProperties.getDefaultTimezone() : DateTimeZone.forID(timeZone).toString();
    } catch (Exception e) {
      throw new BadRequestException("Invalid timezone ID : " + e.getMessage());
    }

    try {
      this.locale = locale == null ? EngineQueryProperties.getDefaultLocale() : new Locale(locale).getLanguage();
    } catch (Exception e) {
      throw new BadRequestException("Invalid local value : " + e.getMessage());
    }
  }

  public String timeFormat() {
    return contUnit != null ? contUnit.format() : disContUnit.format(disContByUnit);
  }

  public ContiuousType getContUnit() {
    return contUnit;
  }

  public DiscontiuousType getDisContUnit() {
    return disContUnit;
  }

  public DiscontiuousByType getDisContByUnit() {
    return disContByUnit;
  }

  public String getTimeZone() {
    return timeZone;
  }

  public void setTimeZone(String timeZone) {
    this.timeZone = timeZone;
  }

  public String getLocale() {
    return locale;
  }

  public void setLocale(String locale) {
    this.locale = locale;
  }

  public enum ContiuousType {
    DAY, WEEK, MONTH, QUARTER, YEAR, NONE;

    public String format() {
      switch (this) {
        case DAY:
          return "MMM d, yyyy";
        case WEEK:
          return "'Week' w, yyyy";
        case MONTH:
          return "MMM yyyy";
        case QUARTER:
          return "qqq yyyy";
        case YEAR:
          return "yyyy";
        case NONE:
          return "yyyy-MM-dd HH:mm:ss";
      }
      return "yyyy-MM-dd HH:mm:ss";
    }
  }

  public enum DiscontiuousType {
    DAY, WEEK, MONTH, QUARTER, YEAR;

    public String format(DiscontiuousByType type) {
      switch (this) {
        case DAY:
          if (type == DiscontiuousByType.MONTH) {
            return "d";
          } else if (type == DiscontiuousByType.YEAR) {
            return "D";
          } else {
            return "EEE";     // Week 가 기본임
          }
        case WEEK:
          if (type == DiscontiuousByType.MONTH) {
            return "'Week' W";
          } else {
            return "'Week' w"; // YEAR 가 기본값임
          }
        case MONTH:
          if (type == DiscontiuousByType.QUARTER) {
            return "qqq";
          } else {
            return "MMM";      // YEAR 가 기본값임
          }
        case QUARTER:
          return "qqq";
        case YEAR:
          return "yyyy";
        default:
          return "yyyy-MM-dd";
      }
    }
  }

  public enum DiscontiuousByType {
    WEEK, MONTH, QUARTER, YEAR
  }
}
