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
import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

import app.metatron.discovery.util.EnumUtils;

public class NumberFieldFormat implements FieldFormat {

  /**
   * 소숫점 자리수
   */
  Integer decimal;

  /**
   * 천단위 사용 여부
   */
  Boolean useThousandsSep;

  /**
   * 약어 사용 방식 (천단위, 백만/천반 단위 약어 활용) <br/>
   * 참고 사이트 : http://www.statman.info/conversions/number_scales.html
   */
  Abbreviation abbr;

  /**
   * 사용자 정의 기호 사용
   */
  CustomSymbol customSymbol;

  public NumberFieldFormat() {
  }

  @JsonCreator
  public NumberFieldFormat(@JsonProperty("decimal") Integer decimal,
                           @JsonProperty("useThousandsSep") Boolean useThousandsSep,
                           @JsonProperty("abbreviation") String abbr,
                           @JsonProperty("customSymbol") CustomSymbol customSymbol) {
    this.decimal = decimal == null ? 0 : decimal;
    this.useThousandsSep = useThousandsSep == null ? false : useThousandsSep;
    this.abbr = EnumUtils.getUpperCaseEnum(Abbreviation.class, abbr, Abbreviation.NONE);
    this.customSymbol = customSymbol;
  }

  public Integer getDecimal() {
    return decimal;
  }

  public Boolean getUseThousandsSep() {
    return useThousandsSep;
  }

  public Abbreviation getAbbr() {
    return abbr;
  }

  public CustomSymbol getCustomSymbol() {
    return customSymbol;
  }

  @Override
  public String toString() {
    return "NumberFieldFormat{" +
        "decimal=" + decimal +
        ", useThousandsSep=" + useThousandsSep +
        ", abbr=" + abbr +
        ", customSymbol=" + customSymbol +
        '}';
  }

  public static class CustomSymbol implements Serializable {
    /**
     * 사용자 정의 기호
     */
    String value;

    /**
     * 기호 위치
     */
    SymbolPosition pos;

    @JsonCreator
    public CustomSymbol(@JsonProperty(value = "value", required = true) String value,
                        @JsonProperty("pos") String pos) {
      this.value = value;
      this.pos = EnumUtils.getUpperCaseEnum(SymbolPosition.class, pos, SymbolPosition.BEFORE);
    }

    public String getValue() {
      return value;
    }

    public SymbolPosition getPos() {
      return pos;
    }

    @Override
    public String toString() {
      return "CustomSymbol{" +
          "value='" + value + '\'' +
          ", pos=" + pos +
          '}';
    }
  }

  public enum Abbreviation {
    NONE, AUTO, KILO, MEGA, GIGA, KILO_KOR, MEGA_KOR, GIGA_KOR
  }

  public enum SymbolPosition {
    BEFORE, AFTER
  }

}
