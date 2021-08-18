/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specic language governing permissions and
 * limitations under the License.
 */

package app.metatron.discovery.domain.user.org;

import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;

import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.web.PagedResourcesAssembler;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.Map;

import app.metatron.discovery.common.entity.SearchParamValidator;
import app.metatron.discovery.common.exception.BadRequestException;
import app.metatron.discovery.common.exception.MetatronException;
import app.metatron.discovery.config.ApiResourceConfig;
import app.metatron.discovery.domain.CollectionPatch;
import app.metatron.discovery.domain.user.DirectoryProfile;
import app.metatron.discovery.domain.user.UserProperties;
import app.metatron.discovery.domain.user.group.Group;
import app.metatron.discovery.domain.user.group.GroupService;
import app.metatron.discovery.util.EnumUtils;
import app.metatron.discovery.util.ProjectionUtils;

/**
 * API Resource of Organization
 */
@RestController
@RequestMapping(value = ApiResourceConfig.API_PREFIX)
public class OrganizationController {

  @Autowired
  OrganizationService orgService;

  @Autowired
  UserProperties userProperties;

  @Autowired
  PagedResourcesAssembler pagedResourcesAssembler;

  @Autowired
  ProjectionFactory projectionFactory;

  @Autowired
  GroupService groupService;

  OrganizationProjections orgProjections = new OrganizationProjections();

  /**
   * Search Organization list
   *
   * @param nameContains String contained in the name
   * @param searchDateBy created or updated
   * @param from         from datetime
   * @param to           to datetime
   * @param pageable     paging and sort information (page, size, sort)
   * @return
   */
  @RequestMapping(path = "/organizations", method = RequestMethod.GET, produces = "application/json")
  public ResponseEntity<?> findOrganizations(
          @RequestParam(value = "nameContains", required = false) String nameContains,
          @RequestParam(value = "searchDateBy", required = false) String searchDateBy,
          @RequestParam(value = "from", required = false)
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime from,
          @RequestParam(value = "to", required = false)
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) DateTime to,
          @RequestParam(value = "projection", required = false, defaultValue = "default") String projection,
          Pageable pageable) {

    // Validate request parameter
    SearchParamValidator.range(searchDateBy, from, to);

    Page<Organization> results = orgService.search(nameContains, searchDateBy, from, to, pageable);

    return ResponseEntity.ok(
            ProjectionUtils.toPageResource(projectionFactory, orgProjections.getProjectionByName(projection), results)
    );
  }

  /**
   * find the organization by code
   *
   * @param orgCode
   * @return
   */
  @RequestMapping(path = "/organizations/{code}", method = RequestMethod.GET)
  public ResponseEntity<?> findOrganization(@PathVariable("code") String orgCode,
          @RequestParam(value = "projection", required = false, defaultValue = "default") String projection) {

    return ResponseEntity.ok(
            ProjectionUtils.toResource(projectionFactory,
                    orgProjections.getProjectionByName(projection), orgService.findOrganizationByCode(orgCode))
    );
  }

  /**
   * Create a organization
   *
   * @param organization
   * @return
   */
  @RequestMapping(path = "/organizations", method = RequestMethod.POST)
  public ResponseEntity<?> createOrganization(@RequestBody Organization organization) {

    if (orgService.checkDuplicatedName(organization.getName())) {
      throw new BadRequestException("Duplicated organization name : " + organization.getName());
    }

    if (orgService.checkDuplicatedCode(organization.getCode())) {
      throw new BadRequestException("Duplicated organization code : " + organization.getCode());
    }

    Organization createdOrg = orgService.create(organization);

    //create default group
    Group createdGroup = groupService.createDefaultGroup("GENERAL-USER-" + organization.getName(), createdOrg.getCode());

    return ResponseEntity.created(URI.create("")).body(
            ProjectionUtils.toResource(projectionFactory, orgProjections.getProjectionByName("default"), createdOrg)
    );
  }

  /**
   * Update the organization
   *
   * @param orgCode
   * @param organization
   * @return
   */
  @RequestMapping(path = "/organizations/{code}", method = RequestMethod.PUT)
  public ResponseEntity<?> updateOrganization(@PathVariable("code") String orgCode,
          @RequestBody Organization organization) {

    organization.setCode(orgCode);

    if (null != organization.getName() && orgService.checkDuplicatedName(organization.getName())) {
      throw new BadRequestException("Duplicated organization name : " + organization.getName());
    }

    Organization updatedOrg = orgService.update(organization);

    return ResponseEntity.ok(
            ProjectionUtils.toResource(projectionFactory, orgProjections.getProjectionByName("default"), updatedOrg)
    );
  }

  /**
   * Delete the organization
   *
   * @param orgCode
   * @return
   */
  @RequestMapping(path = "/organizations/{code}", method = RequestMethod.DELETE)
  public ResponseEntity<?> deleteOrganization(@PathVariable("code") String orgCode) {

    orgService.delete(orgCode);

    return ResponseEntity.noContent().build();
  }

  /**
   * Search organization by condition
   *
   * @param orgCode
   * @param nameContains
   * @param type
   * @param pageable
   * @return
   */
  @RequestMapping(path = "/organizations/{code}/members", method = RequestMethod.GET)
  public ResponseEntity<?> findOrgMembers(@PathVariable("code") String orgCode,
          @RequestParam(value = "nameContains", required = false) String nameContains,
          @RequestParam(value = "type", required = false) String type,
          Pageable pageable) {

    DirectoryProfile.Type memberType = EnumUtils.getUpperCaseEnum(DirectoryProfile.Type.class, type);

    Page<OrganizationMember> members = orgService.searchOrgMembers(orgCode, nameContains, memberType, pageable);

    return ResponseEntity.ok(
            ProjectionUtils
                    .toPageResource(projectionFactory, OrganizationMemberProjections.ForMemberListProjection.class,
                            members)
    );

  }

  /**
   * Update members of organization
   *
   * @param orgCode
   * @param members
   * @return
   */
  @RequestMapping(path = "/organizations/{code}/members", method = {RequestMethod.PATCH, RequestMethod.PUT})
  public ResponseEntity<?> updateOrgMembers(@PathVariable("code") String orgCode,
          @RequestBody List<CollectionPatch> members) {

    orgService.updateOrgMembers(orgCode, members);

    return ResponseEntity.noContent().build();
  }

  /**
   * @param value
   * @return
   */
  @RequestMapping(path = "/organizations/name/{value}/duplicated", method = RequestMethod.POST)
  public ResponseEntity<?> checkDuplicatedName(@PathVariable("value") String value) {

    Preconditions.checkArgument(StringUtils.isNotBlank(value), "Organization name to check duplication required");

    Map<String, Boolean> duplicated = Maps.newHashMap();
    if (orgService.checkDuplicatedName(value)) {
      duplicated.put("duplicated", true);
    } else {
      duplicated.put("duplicated", false);
    }

    return ResponseEntity.ok(duplicated);

  }

  /**
   * @param value
   * @return
   */
  @RequestMapping(path = "/organizations/code/{value}/duplicated", method = RequestMethod.POST)
  public ResponseEntity<?> checkDuplicatedCode(@PathVariable("value") String value) {

    Preconditions.checkArgument(StringUtils.isNotBlank(value), "Organization code to check duplication required");

    Map<String, Boolean> duplicated = Maps.newHashMap();
    if (orgService.checkDuplicatedCode(value)) {
      duplicated.put("duplicated", true);
    } else {
      duplicated.put("duplicated", false);
    }

    return ResponseEntity.ok(duplicated);

  }

  /**
   * Initialize the default organization
   *
   * @return
   */
  @RequestMapping(path = "/organizations/init", method = RequestMethod.POST)
  public ResponseEntity<?> initializeDefaultOrganization() {

    if (userProperties.getUseOrganization()) {
      orgService.init();
    } else {
      throw new MetatronException("need 'polaris.user.use_organization' property to set true");
    }

    return ResponseEntity.noContent().build();

  }

  @RequestMapping(path = "/organizations/code/{value}/validate", method = RequestMethod.POST)
  public ResponseEntity<?> validateOrgCode(@PathVariable("value") String orgCode) {

    Preconditions.checkArgument(StringUtils.isNotBlank(orgCode), "Organization code to check validation required");

    Map<String, Boolean> duplicated = Maps.newHashMap();
    if (orgService.checkDuplicatedCode(orgCode)) {
      duplicated.put("valid", true);
    } else {
      duplicated.put("valid", false);
    }

    return ResponseEntity.ok(duplicated);
  }
}
