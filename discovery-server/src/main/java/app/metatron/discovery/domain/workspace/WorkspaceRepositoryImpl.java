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

import com.google.common.base.Preconditions;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.group.GroupBy;
import com.querydsl.core.types.SubQueryExpression;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.JPQLQuery;

import org.apache.commons.collections4.CollectionUtils;
import org.springframework.data.jpa.repository.support.QueryDslRepositorySupport;

import java.util.List;
import java.util.Map;

import app.metatron.discovery.domain.user.role.QRoleSet;
import app.metatron.discovery.domain.workbook.QDashBoard;
import app.metatron.discovery.domain.workbook.QWorkBook;

public class WorkspaceRepositoryImpl extends QueryDslRepositorySupport implements WorkspaceRepositoryExtends {

  public WorkspaceRepositoryImpl() {
    super(Workspace.class);
  }

  @Override
  public List<String> findWorkspaceIdByLinkedDataSource(String dataSourceId,
                                                        Workspace.PublicType publicType,
                                                        String nameContains) {

    Preconditions.checkNotNull(dataSourceId, "Lined datasource id required.");

    QWorkspace qWorkspace = QWorkspace.workspace;

    JPQLQuery query = from(qWorkspace).select(qWorkspace.id)
        .where(WorkspacePredicate.searchPublicTypeAndNameContains(publicType, nameContains),
               qWorkspace.dataSources.any().id.eq(dataSourceId));

    return query.fetch();
  }

  @Override
  public List<String> findWorkspaceIdByLinkedConnection(String connectionId, Workspace.PublicType publicType, String nameContains) {

    Preconditions.checkNotNull(connectionId, "Lined connection id required.");

    QWorkspace qWorkspace = QWorkspace.workspace;

    JPQLQuery query = from(qWorkspace).select(qWorkspace.id)
                                      .where(WorkspacePredicate.searchPublicTypeAndNameContains(publicType, nameContains),
                                             qWorkspace.dataConnections.any().id.eq(connectionId));

    return query.fetch();
  }

  @Override
  public List<String> findMyWorkspaceIds(String username, List<String> memberIds, String... includeRole) {

    Preconditions.checkNotNull(username, "username required.");

    QWorkspace qWorkspace = QWorkspace.workspace;
    QWorkspaceMember member = QWorkspaceMember.workspaceMember;

    JPQLQuery query = from(qWorkspace).select(qWorkspace.id)
        .where(qWorkspace.ownerId.eq(username));

    BooleanExpression ownerEq = qWorkspace.ownerId.eq(username);

    BooleanBuilder builder = new BooleanBuilder();
    if(CollectionUtils.isNotEmpty(memberIds)) {
//      builder.andAnyOf(ownerEq, member.memberId.in(memberIds).and(member.role.in(includeRole)));
      builder.andAnyOf(ownerEq, qWorkspace.id.in(JPAExpressions.selectFrom(member)
                                                               .select(member.workspace.id)
                                                               .where(member.memberId.in(memberIds),
                                                                      member.role.in(includeRole))));
    } else {
      builder.and(ownerEq);
    }

    query.where(builder);
    query.orderBy(qWorkspace.publicType.asc()).orderBy(qWorkspace.name.asc());

    return query.fetch();
  }

  @Override
  public List<String> findMyWorkspaceIdsByPermission(String username, List<String> memberIds, String... permissions) {

    Preconditions.checkNotNull(username, "username required.");

    QWorkspace qWorkspace = QWorkspace.workspace;
    QWorkspaceMember member = QWorkspaceMember.workspaceMember;
    QRoleSet qRoleSet = QRoleSet.roleSet;

    // 워크스페이스 소유자인 경우, 추가
    List<String> resultWorkspaceIds = from(qWorkspace).select(qWorkspace.id)
                                                      .where(qWorkspace.ownerId.eq(username)).fetch();

    if(CollectionUtils.isNotEmpty(memberIds)) {

      List<String> joinedWorkspaceId = from(member).select(member.workspace.id)
                                                   .where(member.memberId.in(memberIds), member.role.in("Manager", "Editor")).fetch();

      for (String workspaceId : joinedWorkspaceId) {
        SubQueryExpression roleNameExpr = JPAExpressions.selectFrom(member).select(member.role)
                                                        .where(member.workspace.id.eq(workspaceId),
                                                               member.memberId.in(memberIds));

        long count = from(qRoleSet).where(qRoleSet.workspaces.any().id.eq(workspaceId),
                                          qRoleSet.roles.any().permissions.any().name.in(permissions),
                                          qRoleSet.roles.any().name.in(roleNameExpr)).fetchCount();

        if (count > 0) {
          resultWorkspaceIds.add(workspaceId);
        }
      }
    }

    return resultWorkspaceIds;
  }

  @Override
  public Map<String, Long> countByBookType(Workspace workspace) {
    QBook qBook = QBook.book;

    Map<String, Long> result = from(qBook).where(qBook.workspace.eq(workspace))
                                          .groupBy(qBook.type)
                                          .transform(GroupBy.groupBy(qBook.type).as(qBook.count()));

    return result;
  }

  @Override
  public Double avgDashBoardByWorkBook(Workspace workspace) {
    QWorkBook qBook = QWorkBook.workBook;
    QDashBoard qDashBoard = QDashBoard.dashBoard;

    // Group By 구문이 대시보드가 한건도 없는 워크북을 카운팅 하지 못해 아래와 같은 방식으로 분할해서 처리

    // workspace 내 포함된 workbook id 추출
    List<String> workbookIds = from(qBook).select(qBook.id)
                                          .where(qBook.workspace.eq(workspace))
                                          .fetch();

    if(CollectionUtils.isEmpty(workbookIds)) {
      return 0.0;
    }

    // workbook id 를 통해 전체 대시보드 개수를 구하고,
    Long dashBoardCount = from(qDashBoard).where(qDashBoard.workBook.id.in(workbookIds))
                                          .fetchCount();

    // 소숫점 둘째 자리까지 평균값을 구함
    return Math.round((dashBoardCount.doubleValue()/workbookIds.size()) * 100d) / 100d;
  }
}
