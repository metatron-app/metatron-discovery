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

import java.util.List;
import java.util.Map;

public interface WorkspaceRepositoryExtends {

  /**
   *
   * @param dataSourceId
   * @param publicType
   * @param nameContains
   * @return
   */
  List<String> findWorkspaceIdByLinkedDataSource(String dataSourceId,
                                                        Workspace.PublicType publicType,
                                                        String nameContains);

  /**
   *
   * @param connectionId
   * @param publicType
   * @param nameContains
   * @return
   */
  List<String> findWorkspaceIdByLinkedConnection(String connectionId,
                                                 Workspace.PublicType publicType,
                                                 String nameContains);

  /**
   *
   * @param username
   * @param includeRole
   * @return
   */
  List<String> findMyWorkspaceIds(String username, List<String> memberIds, String... includeRole);

  List<String> findMyWorkspaceIdsByPermission(String username, List<String> memberIds, String... permissions);

  Map<String, Long> countByBookType(Workspace workspace);

  Double avgDashBoardByWorkBook(Workspace workspace);
}
