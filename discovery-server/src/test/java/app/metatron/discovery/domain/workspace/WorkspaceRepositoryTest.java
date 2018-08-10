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

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import org.junit.Test;

import javax.inject.Inject;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

/**
 * Created by kyungtaak on 2016. 1. 6..
 */
public class WorkspaceRepositoryTest {

  @Inject
  WorkspaceRepository workspaceRepository;

  @Test
  public void test_basic_crud() {
    Workspace workspace = new Workspace();
    workspace.setName("test-workspace");

    Workspace createdWorkspace = workspaceRepository.saveAndFlush(workspace);

    assertNotNull(workspace.getId());
    assertNotNull(workspace.getCreatedTime());
    assertEquals(workspace.getName(), createdWorkspace.getName());
    //System.out.println(ToStringBuilder.reflectionToString(createdWorkSpace, ToStringStyle.MULTI_LINE_STYLE));

    createdWorkspace.setName("update-workspace");
    Workspace updateWorkspace = workspaceRepository.saveAndFlush(createdWorkspace);
    assertNotNull(updateWorkspace.getModifiedTime());
    assertEquals(createdWorkspace.getName(), updateWorkspace.getName());
    //System.out.println(ToStringBuilder.reflectionToString(updateWorkSpace, ToStringStyle.MULTI_LINE_STYLE));

    Workspace findWorkspace = workspaceRepository.findOne(updateWorkspace.getId());
    assertEquals(updateWorkspace.getName(), findWorkspace.getName());
    System.out.println(ToStringBuilder.reflectionToString(findWorkspace, ToStringStyle.MULTI_LINE_STYLE));

    workspaceRepository.delete(findWorkspace.getId());

    assertNull(workspaceRepository.findOne(findWorkspace.getId()));

  }

  @Test
  public void findWorkspaceByOwnerIdOne() {
    Workspace workspaces = workspaceRepository.findPrivateWorkspaceByOwnerId("polaris");
    System.out.println(workspaces);
  }

}
