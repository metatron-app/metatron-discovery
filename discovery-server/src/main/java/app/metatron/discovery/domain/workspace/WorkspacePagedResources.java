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

import com.fasterxml.jackson.annotation.JsonProperty;

import org.springframework.hateoas.Link;
import org.springframework.hateoas.PagedResources;

import java.util.Arrays;
import java.util.Collection;

public class WorkspacePagedResources<T> extends PagedResources<T> {

  private WorkspaceMetadata workspaceMetadata;

  public WorkspacePagedResources(PagedResources<T> pagedResources) {
    this(pagedResources.getContent(), null, pagedResources.getMetadata(), pagedResources.getLinks());
  }

  /**
   * Creates a new {@link PagedResources} from the given content, {@link PageMetadata} and {@link
   * Link}s (optional).
   *
   * @param content must not be {@literal null}.
   */
  public WorkspacePagedResources(Collection<T> content, WorkspaceMetadata workspaceMetadata, PageMetadata metadata, Link... links) {
    this(content, workspaceMetadata, metadata, Arrays.asList(links));
  }

  /**
   * Creates a new {@link PagedResources} from the given content {@link PageMetadata} and {@link
   * Link}s.
   *
   * @param content must not be {@literal null}.
   */
  public WorkspacePagedResources(Collection<T> content, WorkspaceMetadata workspaceMetadata, PageMetadata metadata, Iterable<Link> links) {
    super(content, metadata, links);
    this.workspaceMetadata = workspaceMetadata;
  }

  @JsonProperty("workspace")
  public WorkspaceMetadata getWorkspaceMetadata() {
    return workspaceMetadata;
  }

  public void setWorkspaceMetadata(WorkspaceMetadata workspaceMetadata) {
    this.workspaceMetadata = workspaceMetadata;
  }


  public static class WorkspaceMetadata {

    @JsonProperty
    private long linked;
    @JsonProperty
    private long total;

    public WorkspaceMetadata() {
    }

    public WorkspaceMetadata(long linked, long total) {
      this.linked = linked;
      this.total = total;
    }

    public long getLinked() {
      return linked;
    }

    public void setLinked(long linked) {
      this.linked = linked;
    }

    public long getTotal() {
      return total;
    }

    public void setTotal(long total) {
      this.total = total;
    }
  }
}
