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

import java.util.UUID;

/**
 * 테스트용 Workspace 모델 Builder
 */
public class WorkspaceBuilder {

  private Workspace workspace = new Workspace();

  public WorkspaceBuilder id() {
    workspace.setId(UUID.randomUUID().toString());
    return this;
  }

  public WorkspaceBuilder name(String name) {
    workspace.setName(name);
    return this;
  }

  public WorkspaceBuilder description(String description) {
    workspace.setDescription(description);
    return this;
  }

  public WorkspaceBuilder ownerId(String ownerId) {
    workspace.setOwnerId(ownerId);
    return this;
  }

  public WorkspaceBuilder publicType(Workspace.PublicType publicType) {
    workspace.setPublicType(publicType);
    return this;
  }

  public Workspace build() {
    return workspace;
  }
}
