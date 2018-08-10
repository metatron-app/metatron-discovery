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

package app.metatron.discovery.domain.context;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import org.apache.commons.lang3.StringUtils;

import app.metatron.discovery.common.entity.DomainType;

public class ContextPredicate {

  /**
   * Context 기본 검색 관련 조건 정의
   *
   * @param type type of domain
   * @param domainId domain id
   *
   * @return
   */
  public static Predicate searchList(DomainType type, String domainId) {

    BooleanBuilder builder = new BooleanBuilder();
    QContext context = QContext.context;

    if(type != null) {
      builder.and(context.domainType.eq(type));
    }

    if(StringUtils.isNotEmpty(domainId)) {
      builder.and(context.domainId.eq(domainId));
    }

    return builder;
  }

  /**
   * Context 기본 검색 관련 조건 정의
   *
   * @param type type of domain
   * @param key domain id
   * @param value domain id
   *
   * @return
   */
  public static Predicate searchByKeyValue(DomainType type, String key, String value) {

    BooleanBuilder builder = new BooleanBuilder();
    QContext context = QContext.context;

    //builder.and(context.domainId.isNotNull());

    if(type != null) {
      builder.and(context.domainType.eq(type));
    }

    if(StringUtils.isNotEmpty(key)) {
      builder.and(context.key.eq(key));
    }

    if(StringUtils.isNotEmpty(value)) {
      builder.and(context.value.eq(value));
    }

    return builder;
  }
}
