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

package app.metatron.discovery.domain.tag;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import org.apache.commons.lang3.StringUtils;

import app.metatron.discovery.common.entity.DomainType;

public class TagPredicate {

  public static Predicate searchList(Tag.Scope scope, DomainType domainType, String nameContains) {
    BooleanBuilder builder = new BooleanBuilder();
    QTag tag = QTag.tag;

    if(scope != null){
      builder = builder.and(tag.scope.eq(scope));
    }

    if(domainType != null){
      builder = builder.and(tag.domainType.eq(domainType));
    }

    if(StringUtils.isNotEmpty(nameContains)){
      builder = builder.and(tag.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }
}
