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

package app.metatron.discovery.domain.workbench;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityLinks;
import org.springframework.hateoas.Link;
import org.springframework.stereotype.Component;

/**
 * Created by kyungtaak on 2016. 2. 4..
 */
@Component
public class WorkbenchLinks {

  @Autowired
  EntityLinks entityLinks;

  public Link getSelfLink(Workbench workbench) {
    return this.entityLinks.linkForSingleResource(Workbench.class, workbench.getId())
            .withSelfRel();
  }

  
  public Link getConfigurationLink(Workbench workbench) {
    return this.entityLinks.linkForSingleResource(Workbench.class, workbench.getId())
            .slash("configuration").withRel("configuration");
  }
}
