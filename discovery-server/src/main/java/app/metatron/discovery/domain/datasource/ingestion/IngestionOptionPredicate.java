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

package app.metatron.discovery.domain.datasource.ingestion;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

public class IngestionOptionPredicate {

  /**
   * Predicate by type
   *
   * @param type type of option
   * @param ingestionType type of druid ingestion
   * @return
   */
  public static Predicate searchList(IngestionOption.OptionType type,
                                     IngestionOption.IngestionType ingestionType) {

    BooleanBuilder builder = new BooleanBuilder();
    QIngestionOption qIngestionOption = QIngestionOption.ingestionOption;

    if(type != null) {
      builder.and(qIngestionOption.type.eq(type));
    }

    if(ingestionType != null) {
      builder.and(qIngestionOption.ingestionType.eq(ingestionType));
    }

    return builder;
  }

}
