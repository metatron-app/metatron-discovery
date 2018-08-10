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

import org.springframework.data.domain.Page;
import org.springframework.data.web.HateoasPageableHandlerMethodArgumentResolver;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.hateoas.ResourceAssembler;
import org.springframework.hateoas.ResourceSupport;
import org.springframework.web.util.UriComponents;

public class WorkspacePagedResourcesAssembler<T> extends PagedResourcesAssembler<T> {

  public WorkspacePagedResourcesAssembler(HateoasPageableHandlerMethodArgumentResolver resolver, UriComponents baseUri) {
    super(resolver, baseUri);
  }

  public <R extends ResourceSupport> WorkspacePagedResources<R> toWorkspaceResource(Page<T> page,
                                                                                    WorkspacePagedResources.WorkspaceMetadata metadata,
                                                                                    ResourceAssembler<T, R> assembler) {

    WorkspacePagedResources<R> workspacePagedResources = new WorkspacePagedResources<>(super.toResource(page, assembler));
    workspacePagedResources.setWorkspaceMetadata(metadata);

    return workspacePagedResources;
  }

}
