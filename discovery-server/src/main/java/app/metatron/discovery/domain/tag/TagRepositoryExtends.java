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

package app.metatron.discovery.domain.tag;

import java.util.List;

import app.metatron.discovery.common.entity.DomainType;

public interface TagRepositoryExtends {

  /**
   * Tag 명/Scope/Domain 정보로 Tag 가져오기
   *
   * @param scope
   * @param domainType
   * @param name
   * @return
   */
  Tag findByTagNameAndDomain(Tag.Scope scope, DomainType domainType, String name);

  List<Tag> findByTagsNameAndDomain(Tag.Scope scope, DomainType domainType, String nameContains);

  List<Tag> findByTagsInDomainItem(Tag.Scope scope, DomainType domainType, String domainId);

  long detachTag(Tag.Scope scope, DomainType domainType, String domainId, List<String> tags);

}
