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
import com.google.common.base.Preconditions;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

/**
 *
 */
public class OrganizationPredicate {

  /**
   * Condition for organization search
   *
   * @param nameContains
   * @param searchDateBy
   * @param from
   * @param to
   * @return
   */
  public static Predicate searchOrgList(String nameContains, String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QOrganization qOrg = QOrganization.organization;

    if (from != null && to != null) {
      if (StringUtils.isNotEmpty(searchDateBy) && "CREATED".equalsIgnoreCase(searchDateBy)) {
        builder.and(qOrg.createdTime.between(from, to));
      } else {
        builder.and(qOrg.modifiedTime.between(from, to));
      }
    }

    if (StringUtils.isNotEmpty(nameContains)) {
      builder.and(qOrg.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }


  public static Predicate searchOrgMemberList(String orgCode, String nameContains, DirectoryProfile.Type type) {

    Preconditions.checkNotNull(orgCode);

    BooleanBuilder builder = new BooleanBuilder();
    QOrganizationMember qOrgMember = QOrganizationMember.organizationMember;

    builder.and(qOrgMember.organization.code.eq(orgCode));

    if (StringUtils.isNotEmpty(nameContains)) {
      builder.and(qOrgMember.memberName.containsIgnoreCase(nameContains));
    }

    if (type != null) {
      builder.and(qOrgMember.type.eq(type));
    }

    return builder;
  }

  /**
   * check organization name duplication
   *
   * @param name
   * @return
   */
  public static Predicate searchDuplicatedName(String name) {

    BooleanBuilder builder = new BooleanBuilder();
    QOrganization org = QOrganization.organization;

    builder = builder.and(org.name.eq(name));

    return builder;
  }

  /**
   * check organization code duplication
   *
   * @param code
   * @return
   */
  public static Predicate searchDuplicatedCode(String code) {

    BooleanBuilder builder = new BooleanBuilder();
    QOrganization org = QOrganization.organization;

    builder = builder.and(org.code.eq(code));

    return builder;
  }

}
