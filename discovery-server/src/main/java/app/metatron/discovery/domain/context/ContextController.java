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

package app.metatron.discovery.domain.context;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.rest.webmvc.PersistentEntityResourceAssembler;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import app.metatron.discovery.common.entity.DomainType;
import app.metatron.discovery.common.entity.SearchParamValidator;

@RepositoryRestController
public class ContextController {

  private static Logger LOGGER = LoggerFactory.getLogger(ContextController.class);

  @Autowired
  ContextService contextService;

  @Autowired
  ContextRepository contextRepository;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @RequestMapping(value = "/contexts", method = RequestMethod.GET)
  public ResponseEntity<?> findContextsByDomain(@RequestParam(value = "domainType", required = false) String domainType,
                                                @RequestParam(value = "domainId", required = false) String domainId,
                                                Pageable pageable,
                                                PersistentEntityResourceAssembler resourceAssembler) {

    DomainType type = SearchParamValidator.enumUpperValue(DomainType.class, domainType, "domain type");

    Page<Context> resultContexts = contextRepository.findAll(ContextPredicate.searchList(type, domainId), pageable);

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(resultContexts, resourceAssembler));
  }

  @RequestMapping(value = "/contexts/domains/{domainType}", method = RequestMethod.GET)
  public ResponseEntity<?> findContextsByDomain(@PathVariable("domainType") String domainType,
                                                @RequestParam("key") String key,
                                                @RequestParam(value = "value", required = false) String value,
                                                @RequestParam(value = "domainProjection", required = false, defaultValue = "default") String domainProjection,
                                                Pageable pageable,
                                                PersistentEntityResourceAssembler resourceAssembler) {

    DomainType type = SearchParamValidator.enumUpperValue(DomainType.class, domainType, "domain type");

    Page<Context> resultContexts = contextService.getContextDomain(type, key, value, domainProjection, pageable);

    return ResponseEntity.ok(pagedResourcesAssembler.toResource(resultContexts, resourceAssembler));

  }
}
