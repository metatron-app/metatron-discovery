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

package app.metatron.discovery.domain.workbook.configurations.format;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.apache.commons.lang3.BooleanUtils;

import app.metatron.discovery.query.druid.limits.PivotColumn;
import app.metatron.discovery.util.EnumUtils;

public class ContinuousTimeFormat extends TimeFieldFormat implements FieldFormat {

  Boolean discontinuous;

  TimeUnit unit;

  ByTimeUnit byUnit;

  @JsonCreator
  public ContinuousTimeFormat(@JsonProperty("discontinuous") Boolean discontinuous,
                              @JsonProperty("unit") String unit,
                              @JsonProperty("byUnit") String byUnit,
                              @JsonProperty("timeZone") String timeZone,
                              @JsonProperty("locale") String locale,
                              @JsonProperty("filteringType") String filteringType) {
    super(timeZone, locale, filteringType);
    this.discontinuous = discontinuous;
    this.unit = EnumUtils.getUpperCaseEnum(TimeUnit.class, unit);
    this.byUnit = EnumUtils.getUpperCaseEnum(ByTimeUnit.class, byUnit);

    if (this.unit == null) {
      this.unit = TimeUnit.DAY;
    }

    this.discontinuous = discontinuous;
  }

  public ContinuousTimeFormat(Boolean discontinuous, String unit, String byUnit) {
    this(discontinuous, unit, byUnit, null, null, null);
  }

  public ContinuousTimeFormat(Boolean discontinuous, String unit, String byUnit, String filteringType) {
    this(discontinuous, unit, byUnit, null, null, filteringType);
  }

  public Boolean getDiscontinuous() {
    return discontinuous;
  }

  public void setDiscontinuous(Boolean discontinuous) {
    this.discontinuous = discontinuous;
  }

  public TimeUnit getUnit() {
    return unit;
  }

  public void setUnit(TimeUnit unit) {
    this.unit = unit;
  }

  public ByTimeUnit getByUnit() {
    return byUnit;
  }

  public void setByUnit(ByTimeUnit byUnit) {
    this.byUnit = byUnit;
  }

  @JsonIgnore
  @Override
  public String getFormat() {
    return BooleanUtils.isTrue(discontinuous) ? unit.discontFormat(byUnit) : unit.format();
  }

  @Override
  public boolean enableSortField() {
    return BooleanUtils.isFalse(discontinuous) && unit != TimeUnit.YEAR;
  }

  @Override
  public String getSortComparator() {
    if (enableSortField()) {
      return String.format(PivotColumn.SortComparator.DATETIME,
                           "'" + this.getFormat() + "'",
                           this.selectTimezone(),
                           this.getLocale());
    } else {
      if (unit == TimeUnit.MONTH && byUnit != ByTimeUnit.QUARTER) {
        return String.format(PivotColumn.SortComparator.MONTH, this.getLocale());
      } else if (unit == TimeUnit.DAY && byUnit != ByTimeUnit.MONTH && byUnit != ByTimeUnit.YEAR) {
        return String.format(PivotColumn.SortComparator.DAYOFWEEK, this.getLocale());
      }
    }
    return PivotColumn.SortComparator.ALPHANUMERIC;
  }

  @Override
  public String getSortFormat() {
    return unit.sortFormat();
  }
}
