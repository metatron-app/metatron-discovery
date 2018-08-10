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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

/**
 * Created by kyungtaak on 2016. 1. 26..
 */
@RepositoryRestResource(path = "workbenchs", itemResourceRel = "workbench"
				, collectionResourceRel = "workbenchs", excerptProjection = WorkbenchProjections.DefaultProjection.class)
public interface WorkbenchRepository extends JpaRepository<Workbench, String> {

//	@Override
//	@RestResource(exported = false)
//	List<Workbench> findAll();
//
//	@Override
//	@RestResource(exported = false)
//	Page<Workbench> findAll(Pageable pageable);

	@RestResource(exported = false)
	Page<Workbench> findByWorkspaceIdAndNameIgnoreCaseContaining(String workspaceId, String name, Pageable pageable);
}
