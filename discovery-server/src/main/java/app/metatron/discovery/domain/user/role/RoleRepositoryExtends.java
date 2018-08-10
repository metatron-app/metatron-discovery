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

package app.metatron.discovery.domain.user.role;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 1. 7..
 */
public interface RoleRepositoryExtends {

  List<String> findRoleNamesByScopeAndPerm(Role.RoleScope scope,
                                           String... includePermissions);

  List<String> findRoleNamesByScopeAndPerm(Role.RoleScope scope, List<RoleSet> roleSets,
                                           String... includePermissions);

  List<Role> findRoleByDirectoryId(String... directoryIds);

  List<String> findRoleNameByDirectoryId(String... directoryIds);

}
