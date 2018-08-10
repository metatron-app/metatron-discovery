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

import com.google.common.base.Preconditions;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class CurrencyFormat extends NumberFieldFormat implements FieldFormat {

  /**
   * 통화 기호
   */
  String sign;

  public CurrencyFormat() {
  }

  @JsonCreator
  public CurrencyFormat(@JsonProperty("decimal") Integer decimal,
                        @JsonProperty("useThousandsSep") Boolean useThousandsSep,
                        @JsonProperty("sign") String sign) {
    super(decimal, useThousandsSep, null, null);
    this.sign = Preconditions.checkNotNull(sign, "'sign' value required.");
  }

  public String getSign() {
    return sign;
  }

}
