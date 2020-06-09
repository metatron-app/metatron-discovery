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
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * The interface organization Member repository.
 */
@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long>,
        QueryDslPredicateExecutor<OrganizationMember> {

  OrganizationMember findByOrganizationAndMemberId(Organization org, String memberId);

  List<OrganizationMember> findByType(DirectoryProfile.Type type);

}
