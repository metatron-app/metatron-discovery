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

package app.metatron.discovery.domain.images;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;

import java.util.List;

/**
 * Created by kyungtaak on 2016. 7. 21..
 */
@RepositoryRestResource(path = "images", excerptProjection = ImageProjections.DefaultImageProjection.class)
public interface ImageRepository extends JpaRepository<Image, String> {

  @RestResource(exported = false)
  Image findByDomainAndItemIdAndEnabled(String domain, String itemId, Boolean enabled);

  @RestResource(exported = false)
  List<Image> findByDomainAndItemIdOrderByModifiedTimeDesc(String domain, String itemId);
}
