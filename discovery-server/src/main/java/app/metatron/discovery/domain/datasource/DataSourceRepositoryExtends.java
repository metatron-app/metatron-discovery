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

package app.metatron.discovery.domain.datasource;

import org.joda.time.DateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DataSourceRepositoryExtends {

  Page<DataSource> findDataSources(DataSource.DataSourceType type, DataSource.ConnectionType connectionType,
                                     DataSource.SourceType sourceType, DataSource.Status status,
                                     Boolean published, String nameContains, Boolean linkedMetadata,
                                     String searchDateBy, DateTime from, DateTime to, Pageable pageable);

  /**
   * Workbook Id 를 통해 workbook 내 포함된 대시보드에서 연결한 데이터 소스 ID 목록 조회
   *
   * @param workbookId
   * @return
   */
  List<String> findIdsByWorkbookIn(String workbookId);

  /**
   * Workbook Id 를 통해 workbook 내 포함된 대시보드에서 연결한 데이터 소스 ID 목록 조회,
   * 전체 공개된 데이터 소스 제외
   *
   * @param workbookId
   * @return
   */
  List<String> findIdsByWorkbookInNotPublic(String workbookId);

  /**
   *
   * @param workspaceId
   * @return
   */
  List<String> findIdsByWorkspaceIn(String workspaceId);

}
