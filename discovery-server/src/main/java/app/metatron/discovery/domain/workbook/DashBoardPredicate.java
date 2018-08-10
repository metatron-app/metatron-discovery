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

package app.metatron.discovery.domain.workbook;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.util.List;

public class DashBoardPredicate {

  public static Predicate searchListInWorkspace(String workspaceId, String nameContains) {

    BooleanBuilder builder = new BooleanBuilder();
    QDashBoard dashBoard = QDashBoard.dashBoard;

    builder.and(dashBoard.workBook.workspace.id.eq(workspaceId));

    if (StringUtils.isNotEmpty(nameContains)) {
      builder = builder.and(dashBoard.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }

  public static Predicate searchListInWorkBook(String workbookId, String nameContains) {

    return searchListInWorkBook(workbookId, null, nameContains, false);
  }

  public static Predicate searchListInWorkBook(String workbookId, List<String> datasourceIds,
                                               String nameContains, boolean includeHidden) {

    BooleanBuilder builder = new BooleanBuilder();
    QDashBoard dashBoard = QDashBoard.dashBoard;

    builder = builder.and(dashBoard.workBook.id.eq(workbookId));

    if(!includeHidden) {
      builder = builder.andAnyOf(dashBoard.hiding.isNull(), dashBoard.hiding.eq(false));
    }

    if(CollectionUtils.isNotEmpty(datasourceIds)) {
      builder = builder.and(dashBoard.dataSources.any().id.in(datasourceIds));
    }

    if (StringUtils.isNotEmpty(nameContains)) {
      builder = builder.and(dashBoard.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }

  public static Predicate searchListInFolder(String folderId, String nameContains) {

    BooleanBuilder builder = new BooleanBuilder();
    QDashBoard dashBoard = QDashBoard.dashBoard;

    builder.and(dashBoard.workBook.folderId.eq(folderId));

    if (StringUtils.isNotEmpty(nameContains)) {
      builder = builder.and(dashBoard.name.containsIgnoreCase(nameContains));
    }

    return builder;
  }
}
