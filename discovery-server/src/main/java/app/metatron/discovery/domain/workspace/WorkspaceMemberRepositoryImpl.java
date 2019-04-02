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

import com.querydsl.jpa.JPQLQuery;

import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import java.util.List;

public class WorkspaceMemberRepositoryImpl extends QueryDslRepositorySupport implements WorkspaceMemberRepositoryExtends {

  public WorkspaceMemberRepositoryImpl() {
    super(WorkspaceMember.class);
  }

  public List<String> findRoleNameByMemberIdsAndWorkspaceId(List<String> memberId, String workspaceId) {
    QWorkspaceMember qMember = QWorkspaceMember.workspaceMember;

    JPQLQuery query = from(qMember).select(qMember.role).distinct()
                                   .where(qMember.memberId.in(memberId).and(qMember.workspace.id.eq(workspaceId)));

    return query.fetch();
  }

  public List<WorkspaceMember> findByWorkspaceIdAndMemberIds(String workspaceId, List<String> memberId) {
    QWorkspace qWorkspace = new QWorkspace("ws");
    QWorkspaceMember qMember = QWorkspaceMember.workspaceMember;

    JPQLQuery query = from(qMember).leftJoin(qMember.workspace, qWorkspace).select(qMember)
                                   .where(qWorkspace.id.eq(workspaceId), qMember.memberId.in(memberId));

    return query.fetch();
  }
}
