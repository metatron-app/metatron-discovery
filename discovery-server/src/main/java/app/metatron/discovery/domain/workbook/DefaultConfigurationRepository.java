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

package app.metatron.discovery.domain.workbook;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

/**
 * Created by kyungtaak on 2017. 4. 19..
 */
@RepositoryRestResource(exported = false)
public interface DefaultConfigurationRepository extends JpaRepository<DefaultConfiguration, String> {
  /**
   * Domain/Type/Profile 별 설정 정보 로드
   *
   * @param domain
   * @param type
   * @param profile
   * @return
   */
  DefaultConfiguration findByDomainAndTypeAndProfile(DefaultConfiguration.DomainType domain,
                                                     String type, String profile);
}
