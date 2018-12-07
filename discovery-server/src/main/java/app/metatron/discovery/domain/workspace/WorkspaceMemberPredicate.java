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

package app.metatron.discovery.domain.workspace;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

public class WorkspaceMemberPredicate {

  public static Predicate searchWorkspaceMember(Workspace workspace,
                                                List<WorkspaceMember.MemberType> memberTypes,
                                                List<String> roles,
                                                String nameContains) {

    BooleanBuilder builder = new BooleanBuilder();
    QWorkspaceMember workspaceMember = QWorkspaceMember.workspaceMember;

    builder.and(workspaceMember.workspace.eq(workspace));

    if(CollectionUtils.isNotEmpty(memberTypes)) {
      builder.and(workspaceMember.memberType.in(memberTypes));
    }

    if(CollectionUtils.isNotEmpty(roles)) {
      builder.and(workspaceMember.role.in(roles));
    }

    if(StringUtils.isNotEmpty(nameContains)) {
      builder.andAnyOf(workspaceMember.memberName.containsIgnoreCase(nameContains)
          , workspaceMember.memberId.containsIgnoreCase(nameContains));
    }

    return builder;
  }
}
