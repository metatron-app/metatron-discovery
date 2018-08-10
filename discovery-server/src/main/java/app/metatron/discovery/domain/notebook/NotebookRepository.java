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

package app.metatron.discovery.domain.notebook;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * Created by kyungtaak on 2016. 10. 21..
 */
@RepositoryRestResource(path = "notebooks", excerptProjection = NoteBookProjections.DefaultProjection.class)
public interface NotebookRepository extends JpaRepository<Notebook, String> {
//    List<Notebook> findByIdIn(List<String> ids);
//
//    @Transactional
//    void deleteByIdIn(List<String> ids);
}
