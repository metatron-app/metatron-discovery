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

package app.metatron.discovery.domain.user.org;

import app.metatron.discovery.domain.user.DirectoryProfile;
import com.querydsl.jpa.JPQLQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import javax.persistence.EntityManager;
import java.util.List;

/**
 *
 */
public class OrganizationRepositoryImpl extends QueryDslRepositorySupport implements OrganizationRepositoryExtends {

  private static final Logger LOGGER = LoggerFactory.getLogger(OrganizationRepositoryImpl.class);

  @Autowired
  private EntityManager entityManager;

  public OrganizationRepositoryImpl() {
    super(Organization.class);
  }

  @Override
  public List<String> findOrgCodesByMemberId(String memberId, DirectoryProfile.Type type) {
    QOrganization qOrg = QOrganization.organization;
    JPQLQuery query = from(qOrg).select(qOrg.code).distinct();

    if (type != null) {
      query.where(qOrg.members.any().type.eq(type));
    }

    query.where(qOrg.members.any().memberId.eq(memberId));

    return query.fetch();
  }

  @Override
  public List<String> findMemberIdByOrgCode(String orgCode, DirectoryProfile.Type type) {

    QOrganizationMember qOrgMember = QOrganizationMember.organizationMember;
    JPQLQuery query = from(qOrgMember).select(qOrgMember.memberId);

    query.where(qOrgMember.organization.code.eq(orgCode));

    if (type != null) {
      query.where(qOrgMember.type.eq(type));
    }

    return query.fetch();
  }

}
