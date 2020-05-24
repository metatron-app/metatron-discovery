/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.audit;

import org.hibernate.envers.RevisionType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 *
 */
@RestController
@RequestMapping("/api")
public class DomainAuditController {

  @Autowired
  DomainAuditService domainAuditService;

  @PreAuthorize("hasAuthority('PERM_SYSTEM_MANAGE_USER')")
  @RequestMapping(path = "/audits/domains", method = RequestMethod.GET)
  public ResponseEntity<?> listDomainAudit(@RequestParam(name = "domainType") DomainAuditType domainType,
                                           @RequestParam(name = "revisionType", required = false) List<RevisionType> revisionType,
                                           @RequestParam(name = "criterionProperty", required = false) String criterionProperty,
                                           @RequestParam(name = "criterionValue", required = false) String criterionValue,
                                           @RequestParam(name = "page") Integer page,
                                           @RequestParam(name = "size") Integer size) {

    //domain Type
    Class domainCls = domainAuditService.getDomainClassForName(domainType);
    if(domainCls == null) {
      throw new AuditException(AuditErrorCodes.DOMAIN_CLASS_NOT_FOUND, "Domain class not found for audit list.");
    }

    Page<DomainAudit> domainAuditList = domainAuditService.getPagedDomainAuditList(domainType, domainCls, revisionType, criterionProperty, criterionValue, page, size);
    return ResponseEntity.ok(domainAuditList);
  }
}
