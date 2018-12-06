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

package app.metatron.discovery.domain.user.group;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * The interface GroupMember repository.
 */
@RepositoryRestResource(exported = false, itemResourceRel = "member", collectionResourceRel = "members",
                      excerptProjection = GroupMemberProjections.DefaultProjection.class)
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long>,
    QueryDslPredicateExecutor<GroupMember> {

  @Transactional
  @Modifying
  @Query("UPDATE GroupMember gm SET gm.memberName = :memberName WHERE gm.memberId = :memberId")
  void updateMemberName(@Param("memberId") String memberId,
                        @Param("memberName") String memberName);

  @Transactional
  @Modifying
  @Query("DELETE FROM GroupMember wm WHERE wm.memberId IN (:memberIds)")
  void deleteByMemberIds(@Param("memberIds") List<String> memberIds);

  GroupMember findByGroupAndMemberId(Group group, String memberId);

  List<GroupMember> findByMemberId(String memberId);

  List<GroupMember> findByGroupId(String groupId);

  @Query("SELECT DISTINCT gm FROM GroupMember gm LEFT JOIN gm.group gr WHERE gr.id IN (:groupIds)")
  List<GroupMember> findByGroupIds(@Param("groupIds") List<String> groupIds);

  Page<GroupMember> findByGroup(Group group, Pageable pageable);

}
