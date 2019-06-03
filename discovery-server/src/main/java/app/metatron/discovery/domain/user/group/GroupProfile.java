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

import com.google.common.collect.Lists;

import com.fasterxml.jackson.annotation.JsonTypeName;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import app.metatron.discovery.domain.user.DirectoryProfile;
import app.metatron.discovery.domain.user.role.Permission;

/**
 * Created by kyungtaak on 2017. 1. 22..
 */
@JsonTypeName("group")
public class GroupProfile implements DirectoryProfile {

  public static final String UNKNOWN_GROUPNAME = "Unknown group";

  String id;

  String name;

  List<String> permissions;

  public GroupProfile() {
    // Empty Constructor
  }

  public GroupProfile(String id, String name) {
    this.id = id;
    this.name = name;
  }

  public GroupProfile(String id, String name, String... permissions) {
    this(id, name);
    this.permissions = Lists.newArrayList(permissions);
  }

  public static GroupProfile getProfile(Group group) {
    if (group == null) {
      return null;
    }

    GroupProfile profile = new GroupProfile(group.getId(), group.getName());

    return profile;
  }

  @Override
  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  @Override
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List<String> getPermissions() {
    return permissions;
  }

  public void setPermissions(List<String> permissions) {
    this.permissions = permissions;
  }

  public void setPermissions(Set<Permission> permissions) {
    this.permissions = permissions.stream()
                                  .map(permission -> permission.getName())
                                  .collect(Collectors.toList());
  }
}
