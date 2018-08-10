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

import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;
import com.querydsl.jpa.impl.JPADeleteClause;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import java.util.List;

import app.metatron.discovery.common.entity.DomainType;

public class TagRepositoryImpl extends QueryDslRepositorySupport implements TagRepositoryExtends {

  public TagRepositoryImpl() {
    super(Tag.class);
  }

  @Override
  public Tag findByTagNameAndDomain(Tag.Scope scope, DomainType domainType, String name) {

    QTag qTag = QTag.tag;
    JPQLQuery<Tag> query = from(qTag).where(qTag.scope.eq(scope));

    if (scope == Tag.Scope.DOMAIN) {
      query.where(qTag.domainType.eq(domainType));
    }

    query.where(qTag.name.eq(name));

    return query.fetchOne();
  }

  @Override
  public List<Tag> findByTagsNameAndDomain(Tag.Scope scope, DomainType domainType, String nameContains) {

    QTag qTag = QTag.tag;
    JPQLQuery<Tag> query = from(qTag).where(qTag.scope.eq(scope));

    if (scope == Tag.Scope.DOMAIN) {
      query.where(qTag.domainType.eq(domainType));
    }

    if(StringUtils.isNotEmpty(nameContains)) {
      query.where(qTag.name.contains(nameContains));
    }

    return query.fetch();
  }

  public List<Tag> findByTagsInDomainItem(Tag.Scope scope, DomainType domainType, String domainId) {
    QTagDomain qTagDomain = QTagDomain.tagDomain;
    QTag qTag = qTagDomain.tag;
    JPQLQuery<Tag> query = from(qTagDomain).innerJoin(qTag)
                                           .select(qTag)
                                           .where(qTagDomain.domainType.eq(domainType),
                                                  qTagDomain.domainId.eq(domainId),
                                                  qTag.scope.eq(scope));

    return query.fetch();
  }

  @Override
  public long detachTag(Tag.Scope scope, DomainType domainType, String domainId, List<String> tags) {
    QTagDomain qTagDomain = QTagDomain.tagDomain;

    JPQLQuery<Long> subQuery = JPAExpressions.selectFrom(qTagDomain)
                  .select(qTagDomain.id)
                  .where(qTagDomain.domainType.eq(domainType),
                         qTagDomain.domainId.eq(domainId));

    if(CollectionUtils.isNotEmpty(tags)) {
      subQuery.where(qTagDomain.tag.name.in(tags));
    }

    JPADeleteClause deleteClause = delete(qTagDomain).where(qTagDomain.id.in(subQuery));

    return deleteClause.execute();
  }
}
