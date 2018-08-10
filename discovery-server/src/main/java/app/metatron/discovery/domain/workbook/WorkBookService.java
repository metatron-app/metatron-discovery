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

import com.google.common.collect.Lists;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.JPAExpressions;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import app.metatron.discovery.domain.datasource.DataSource;
import app.metatron.discovery.domain.datasource.DataSourceRepository;
import app.metatron.discovery.domain.datasource.QDataSource;
import app.metatron.discovery.domain.workspace.BookRepository;
import app.metatron.discovery.domain.workspace.WorkspaceRepository;
import app.metatron.discovery.domain.workspace.WorkspaceService;


@Component
@Transactional(readOnly = true)
public class WorkBookService {

  @Autowired
  BookRepository bookRepository;

  @Autowired
  WorkBookRepository workBookRepository;

  @Autowired
  DataSourceRepository dataSourceRepository;

  @Autowired
  WorkspaceRepository workspaceRepository;

  @Autowired
  DashBoardService dashBoardService;

  @Autowired
  WorkspaceService workspaceService;

  public List<DataSource> getAllDataSourceInDashboard(String workbookId) {

    QDataSource dataSource = QDataSource.dataSource;

    QWorkBook workBook = QWorkBook.workBook;

    BooleanExpression dataSourceIn = dataSource.id
        .in(JPAExpressions.select(workBook.dashBoards.any().dataSources.any().id)
                          .from(workBook)
                          .innerJoin(workBook.dashBoards)
                          .where(workBook.id.eq(workbookId)));

    BooleanBuilder booleanBuilder = new BooleanBuilder();
    booleanBuilder.and(dataSourceIn);

    return Lists.newArrayList(dataSourceRepository.findAll(booleanBuilder,
                                                           new Sort(new Sort.Order(Sort.Direction.ASC, "name"))));
  }
}
