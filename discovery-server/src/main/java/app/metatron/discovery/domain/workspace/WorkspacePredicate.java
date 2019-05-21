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

import com.google.common.collect.Lists;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.joda.time.DateTime;

import java.util.List;

import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.domain.user.role.RoleSet;

public class WorkspacePredicate {

  public static Predicate searchWorkspaceList(String username, List<String> memberIds,
                                                Boolean onlyOwner, Boolean published, Boolean active,
                                                Workspace.PublicType publicType, String nameContains,
                                                String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QWorkspace workspace = QWorkspace.workspace;

    if(StringUtils.isNotEmpty(username)) {
      if (memberIds == null) {
        memberIds = Lists.newArrayList(username);
      } else if (!memberIds.contains(username)) {
        memberIds.add(username);
      }

      Predicate ownerEq = workspace.ownerId.eq(username);

      BooleanExpression memberIn = workspace.id
          .in(JPAExpressions.select(workspace.id)
                            .from(workspace)
                            .innerJoin(workspace.members)
                            .where(workspace.members.any().memberId.in(memberIds)));
      if (onlyOwner) {
        builder.and(ownerEq);
      } else {
        builder.andAnyOf(memberIn, ownerEq);
      }
    }

    if(published != null) {
      // published 상태는 하위 호환을 위하여 published 값이 null 인 경우도 false 로 인식
      if(published) {
        builder.and(workspace.published.isTrue());
      } else {
        builder.andAnyOf(workspace.published.isNull(), workspace.published.isFalse());
      }
    }

    if(active != null) {
      // active 상태는 하위 호환을 위하여 active 값이 null 인 경우도 true로 인식
      if(active) {
        builder.andAnyOf(workspace.active.isNull(), workspace.active.isTrue());
      } else {
        builder.and(workspace.active.isFalse());
      }
    }

    builder.and(searchPublicTypeAndNameContains(publicType, nameContains));
    builder.and(searchDateTime(searchDateBy, from, to));

    return builder;
  }

  public static Predicate searchWorkspaceOnRoleSet(RoleSet roleSet, String nameContains,
                                                   String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QWorkspace workspace = QWorkspace.workspace;

    builder.and(workspace.roleSets.contains(roleSet));

    builder.and(searchPublicTypeAndNameContains(Workspace.PublicType.SHARED, nameContains));
    builder.and(searchDateTime(searchDateBy, from, to));

    return builder;
  }

  public static Predicate searchPublicTypeAndNameContains(Workspace.PublicType publicType, String nameContains) {

    BooleanBuilder builder = new BooleanBuilder();
    QWorkspace workspace = QWorkspace.workspace;

    if (publicType != null) {
      builder = builder.and(workspace.publicType.eq(publicType));
    }

    if (StringUtils.isNotEmpty(nameContains)) {
      builder = builder.and(workspace.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }

  public static Predicate searchPublicTypeAndNameContainsAndActive(Workspace.PublicType publicType, String nameContains, Boolean active) {

    BooleanBuilder builder = new BooleanBuilder();
    QWorkspace workspace = QWorkspace.workspace;

    builder.and(searchPublicTypeAndNameContains(publicType, nameContains));
    if(active != null) {
      // active 상태는 하위 호환을 위하여 active 값이 null 인 경우도 true로 인식
      if(active) {
        builder.andAnyOf(workspace.active.isNull(), workspace.active.isTrue());
      } else {
        builder.and(workspace.active.isFalse());
      }
    }

    return builder;
  }

  public static Predicate searchDateTime(String searchDateBy, DateTime from, DateTime to) {

    BooleanBuilder builder = new BooleanBuilder();
    QWorkspace workspace = QWorkspace.workspace;

    if(StringUtils.isNotEmpty(searchDateBy)) {
      if(from == null || to == null) {
        throw new IllegalArgumentException("from/to required.");
      }

      if("CREATED".equalsIgnoreCase(searchDateBy)) {
        builder = builder.and(workspace.createdTime.between(from, to));
      } else if("MODIFIED".equalsIgnoreCase(searchDateBy)) {
        builder = builder.and(workspace.modifiedTime.between(from, to));
      } else if("LASTACCESSED".equalsIgnoreCase(searchDateBy)) {
        builder = builder.and(workspace.lastAccessedTime.between(from, to));
      } else {
        throw new IllegalArgumentException("'searchDateBy' accepts only three types(lastAccessed, created, modified).");
      }
    }

    return builder;
  }

  public static Predicate searchPublicTypeAndNameContainsAndLink(Workspace.PublicType publicType, String nameContains, String linkedType, String linkedId) {

    BooleanBuilder builder = new BooleanBuilder();
    QWorkspace workspace = QWorkspace.workspace;

    builder = builder.and(searchPublicTypeAndNameContains(publicType, nameContains));

    switch (linkedType.toUpperCase()) {
      case "DATASOURCE":
        builder = builder.and(workspace.dataSources.any().id.eq(linkedId));
        break;
      case "CONNECTION":
        builder = builder.and(workspace.dataConnections.any().id.eq(linkedId));
        break;
      case "CONNECTOR":
        builder = builder.and(workspace.connectors.any().id.eq(linkedId));
        break;
      default:
        throw new BadRequestException("Not supported type of link. choose one of datasource, connection, connector");
    }

    return builder;
  }

  public static Predicate searchWorkbookImportAvailable(List<String> dataSourceIds,
                                                        List<String> joinedWorkspaceIds,
                                                        Workspace.PublicType publicType,
                                                        String nameContains) {

    BooleanBuilder builder = new BooleanBuilder();
    QWorkspace workspace = QWorkspace.workspace;

    if(CollectionUtils.isNotEmpty(joinedWorkspaceIds)) {
      builder.and(workspace.id.in(joinedWorkspaceIds));
    }

    if(CollectionUtils.isNotEmpty(dataSourceIds)) {
      builder.and(workspace.dataSources.any().id.in(dataSourceIds));
    }

    // Select activated workspace (include null)
    builder.andAnyOf(workspace.active.eq(true), workspace.active.isNull());

    return builder.and(searchPublicTypeAndNameContains(publicType, nameContains));
  }

}
